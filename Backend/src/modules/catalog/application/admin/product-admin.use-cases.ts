import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { orNotFound } from "@/shared/http/or-not-found";
import { ObjectStorage } from "@/shared/storage/object-storage";
import { discardQuietly } from "@/shared/storage/store-image";
import { ProductAdminRepository, type ProductRecord } from "../../domain/product-admin.repository";
import { productCode, productCodePrefix, productSlug, sizeRank, withAmps, type TechnicalSpecs } from "../../domain/product-specs";
import type { CreateProductDto, UpdateProductDto } from "./dto/product.dto";

/** Tries for a free code when two products are created at the same moment and pick the same number. */
const CODE_ATTEMPTS = 3;

const EMPTY_SPECS: TechnicalSpecs = {
  widthMm: null,
  depthMm: null,
  heightMm: null,
  weightKg: null,
  energyType: null,
  gasTypes: [],
  powerKw: null,
  voltage: null,
  phases: null,
  frequencyHz: null,
  currentAmps: null,
  currentAmpsCalculated: false,
  certifications: [],
};

/** Copies only the fields the request actually sent (undefined = not sent; null = clear). */
function sentFields<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

/**
 * Fills in what is derived from the specs: the amps (unless stated) and the display rank.
 * Lists sent as null become empty, and an electric machine takes no gas.
 */
function finish(record: ProductRecord, statedAmps: number | null): ProductRecord {
  const specs = withAmps(
    {
      ...record,
      gasTypes: record.energyType === "electric" ? [] : (record.gasTypes ?? []),
      certifications: record.certifications ?? [],
    },
    statedAmps,
  );
  return { ...record, ...specs, specs: record.specs ?? [], displayRank: sizeRank(specs) };
}

/**
 * Creating, editing and deleting products from the dashboard. Codes are ours ("GS-FRY-0001"), taken from
 * the main category at creation and never changed afterwards, even if the product moves category,
 * so a code written on a quote or invoice always finds the same machine.
 */
@Injectable()
export class ProductAdminUseCases {
  constructor(
    private readonly products: ProductAdminRepository,
    private readonly storage: ObjectStorage,
  ) {}

  async get(id: string) {
    return orNotFound(await this.products.findById(id), "Product");
  }

  async create(input: CreateProductDto) {
    const prefix = await this.codePrefixOf(input.categoryId);
    const { currentAmps, ...fields } = sentFields(input);
    const record = finish(
      { ...EMPTY_SPECS, summaryEn: null, summaryAr: null, specs: [], published: false, displayRank: 0, ...fields } as ProductRecord,
      currentAmps ?? null,
    );

    for (let attempt = 1; ; attempt++) {
      const code = productCode(prefix, (await this.products.lastCodeNumber(productCodePrefix(prefix))) + 1);
      try {
        return await this.products.create({ ...record, code, slug: productSlug(record.nameEn, code) });
      } catch (error) {
        if (!(error instanceof ConflictException) || attempt === CODE_ATTEMPTS) throw error;
      }
    }
  }

  async update(id: string, input: UpdateProductDto) {
    const { id: _id, code: _code, slug: _slug, images: _images, ...current } = await this.get(id);
    if (input.categoryId && input.categoryId !== current.categoryId) await this.codePrefixOf(input.categoryId);

    const { currentAmps, ...fields } = sentFields(input);
    // A figure the supplier stated stays until changed; a calculated one is recalculated from the new specs.
    const stated = currentAmps !== undefined ? currentAmps : current.currentAmpsCalculated ? null : current.currentAmps;
    await this.products.update(id, finish({ ...current, ...fields } as ProductRecord, stated));
  }

  async delete(id: string): Promise<void> {
    const imageKeys = await this.products.delete(id);
    await Promise.all(imageKeys.map((key) => discardQuietly(this.storage, key)));
  }

  /** Products attach to subcategories only, whose main category gives the code prefix. */
  private async codePrefixOf(categoryId: string): Promise<string> {
    const prefix = await this.products.findCodePrefix(categoryId);
    if (!prefix) throw new BadRequestException("categoryId must be a subcategory (e.g. Pressure fryers, not Frying)");
    return prefix;
  }
}

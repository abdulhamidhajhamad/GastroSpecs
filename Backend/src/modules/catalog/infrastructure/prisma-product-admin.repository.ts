import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { mapPrismaErrors } from "@/shared/prisma/prisma-errors";
import { PrismaService } from "@/shared/prisma/prisma.service";
import { ObjectStorage } from "@/shared/storage/object-storage";
import { ProductAdminRepository, type AdminProduct, type ProductRecord, type SpecRow } from "../domain/product-admin.repository";

const withImages = { images: { select: { id: true, key: true }, orderBy: { sortOrder: "asc" } } } as const satisfies Prisma.ProductInclude;

/** The JSON column holds SpecRow[]; anything else shaped is dropped. */
const toSpecRows = (json: Prisma.JsonValue): SpecRow[] =>
  Array.isArray(json)
    ? (json as Partial<SpecRow>[]).filter((s): s is SpecRow => typeof s?.labelEn === "string" && typeof s?.value === "string")
    : [];

/** The record as columns; specs go to the JSON column. */
const toData = ({ specs, ...record }: ProductRecord) => ({ ...record, specs: specs as Prisma.InputJsonValue });

@Injectable()
export class PrismaProductAdminRepository implements ProductAdminRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: ObjectStorage,
  ) {}

  async findById(id: string): Promise<AdminProduct | null> {
    const row = await this.prisma.product.findUnique({ where: { id }, include: withImages });
    if (!row) return null;

    const { createdAt: _c, updatedAt: _u, images, specs, ...columns } = row;
    return {
      ...columns,
      specs: toSpecRows(specs),
      images: images.map((image) => ({ id: image.id, url: this.storage.publicUrl(image.key) })),
    };
  }

  async findCodePrefix(categoryId: string): Promise<string | null> {
    const row = await this.prisma.category.findUnique({ where: { id: categoryId }, select: { parent: { select: { codePrefix: true } } } });
    return row?.parent?.codePrefix ?? null;
  }

  async lastCodeNumber(codePrefix: string): Promise<number> {
    // Codes are zero-padded to four digits, so the alphabetical last is also the highest number.
    const last = await this.prisma.product.findFirst({
      where: { code: { startsWith: codePrefix } },
      orderBy: { code: "desc" },
      select: { code: true },
    });
    return last ? Number(last.code.slice(codePrefix.length)) || 0 : 0;
  }

  create(record: ProductRecord & { code: string; slug: string }) {
    const { code, slug, ...rest } = record;
    return mapPrismaErrors(
      this.prisma.product.create({ data: { ...toData(rest), code, slug }, select: { id: true, code: true, slug: true } }),
      { duplicate: "Product code or slug already taken", missingRelation: "Category not found" },
    );
  }

  async update(id: string, record: ProductRecord): Promise<void> {
    await mapPrismaErrors(this.prisma.product.update({ where: { id }, data: toData(record), select: { id: true } }), {
      missing: "Product not found",
      missingRelation: "Category not found",
    });
  }

  async delete(id: string): Promise<string[]> {
    const deleted = await mapPrismaErrors(
      this.prisma.product.delete({ where: { id }, select: { images: { select: { key: true } } } }),
      { missing: "Product not found" },
    );
    return deleted.images.map((image) => image.key);
  }
}

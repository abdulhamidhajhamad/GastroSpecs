import { ConflictException, HttpException, Injectable } from "@nestjs/common";
import { AddProductImageUseCase } from "@/modules/catalog/application/admin/product-image.use-cases";
import { ProductAdminUseCases } from "@/modules/catalog/application/admin/product-admin.use-cases";
import { OfferUseCases } from "@/modules/sourcing/application/offer.use-cases";
import { SupplierUseCases } from "@/modules/sourcing/application/supplier.use-cases";
import { ObjectStorage } from "@/shared/storage/object-storage";
import { CatalogPhotos, type CatalogPhotoReader } from "../domain/catalog-photos";
import { checkPlan, type CheckedItem, type CheckedPlan, type SubcategoryIds } from "./import-plan";

export type ItemResult = {
  supplierModel: string;
  catalogPage: number;
  status: "created" | "linked" | "skipped" | "failed";
  productId?: string;
  code?: string;
  message?: string;
  /** Photo problems and the agent's notes, for the admin to check. */
  warnings: string[];
};

export type ImportResult = {
  supplier: { id: string; name: string; created: boolean };
  contactsAdded: number;
  items: ItemResult[];
};

const reason = (error: unknown) => (error instanceof HttpException || error instanceof Error ? error.message : String(error));

/**
 * Carries out an approved plan with GastroSpecs's own use cases, the same ones the dashboard uses.
 * No AI here: just code following the plan the admin saw. Safe to run twice: models the supplier already
 * has are skipped, so nothing is duplicated. One product failing doesn't stop the others.
 */
@Injectable()
export class ImportPlanExecutor {
  constructor(
    private readonly suppliers: SupplierUseCases,
    private readonly offers: OfferUseCases,
    private readonly products: ProductAdminUseCases,
    private readonly productImages: AddProductImageUseCase,
    private readonly photos: CatalogPhotos,
    private readonly storage: ObjectStorage,
  ) {}

  async execute(rawPlan: unknown, subcategories: SubcategoryIds, catalogKey: string | null): Promise<ImportResult> {
    // Checked again now: categories or rules may have changed since the agent proposed it.
    const checked = await checkPlan(rawPlan, subcategories);
    if ("errors" in checked) throw new Error(`The plan no longer passes the checks: ${checked.errors.slice(0, 5).join("; ")}`);
    const { plan } = checked;

    const supplier = await this.supplierOf(plan);
    const existing = await this.suppliers.get(supplier.id);
    const contactsAdded = await this.addContacts(plan, supplier.id, existing.contacts.map((c) => c.name.toLowerCase()));
    const knownModels = new Map(existing.offers.map((o) => [o.supplierModel.toUpperCase(), o.product]));

    // Photos are cut page by page, so each page is decoded once.
    const reader = catalogKey && plan.products.some((p) => p.image) ? await this.photos.open(await this.storage.get(catalogKey)) : null;
    const ordered = [...plan.products].sort((a, b) => (a.image?.page ?? a.catalogPage) - (b.image?.page ?? b.catalogPage));

    const results = new Map<CheckedItem, ItemResult>();
    for (const item of ordered) results.set(item, await this.importItem(item, supplier.id, knownModels, reader));

    return { supplier, contactsAdded, items: plan.products.map((item) => results.get(item)!) };
  }

  /** The existing supplier, or a new one; if it turns out to exist under another spelling, that one. */
  private async supplierOf(plan: CheckedPlan) {
    const { existingSupplierId, ...fields } = plan.supplier;
    if (existingSupplierId) {
      const found = await this.suppliers.get(existingSupplierId);
      return { id: found.id, name: found.name, created: false };
    }
    try {
      const { id } = await this.suppliers.create(fields);
      return { id, name: fields.name, created: true };
    } catch (error) {
      const supplierId = error instanceof ConflictException ? (error.getResponse() as { supplierId?: string }).supplierId : undefined;
      if (!supplierId) throw error;
      return { id: supplierId, name: fields.name, created: false };
    }
  }

  private async addContacts(plan: CheckedPlan, supplierId: string, existingNames: string[]): Promise<number> {
    let added = 0;
    for (const contact of plan.contacts) {
      if (existingNames.includes(contact.name.toLowerCase())) continue;
      await this.suppliers.addContact(supplierId, contact);
      added++;
    }
    return added;
  }

  private async importItem(
    item: CheckedItem,
    supplierId: string,
    knownModels: Map<string, { id: string; code: string }>,
    reader: CatalogPhotoReader | null,
  ): Promise<ItemResult> {
    const base = { supplierModel: item.supplierModel, catalogPage: item.catalogPage, warnings: item.notes ? [item.notes] : [] };
    const known = knownModels.get(item.supplierModel.toUpperCase());
    if (known) return { ...base, status: "skipped", productId: known.id, code: known.code, message: "this supplier already has this model" };

    const offer = { supplierId, supplierModel: item.supplierModel, catalogPage: item.catalogPage, priceAmount: item.priceAmount, priceCurrency: item.priceCurrency };
    try {
      if (item.action === "link") {
        const product = await this.products.get(item.existingProductId!);
        await this.offers.add({ ...offer, productId: product.id });
        return { ...base, status: "linked", productId: product.id, code: product.code };
      }

      const created = await this.products.create(item.product!);
      await this.offers.add({ ...offer, productId: created.id });
      const warnings = [...base.warnings, ...(await this.addPhoto(item, created.id, reader))];
      return { ...base, warnings, status: "created", productId: created.id, code: created.code };
    } catch (error) {
      return { ...base, status: "failed", message: reason(error) };
    }
  }

  /** Cuts the product's photo out of the catalog and adds it. A photo problem never fails the product. */
  private async addPhoto(item: CheckedItem, productId: string, reader: CatalogPhotoReader | null): Promise<string[]> {
    if (!item.image) return ["no photo in the plan"];
    if (!reader) return ["catalog file missing: photo not added"];
    try {
      const photo = await reader.crop(item.image.page, item.image.box);
      await this.productImages.execute(productId, { buffer: photo.image, size: photo.image.length });
      return photo.warnings.map((w) => `photo: ${w}`);
    } catch (error) {
      return [`photo not added: ${reason(error)}`];
    }
  }
}

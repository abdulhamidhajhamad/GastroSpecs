import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { mapPrismaErrors } from "@/shared/prisma/prisma-errors";
import { PrismaService } from "@/shared/prisma/prisma.service";
import { ObjectStorage } from "@/shared/storage/object-storage";
import { SourcingRepository } from "../domain/sourcing.repository";
import type {
  Contact,
  ContactFields,
  Money,
  NewContact,
  NewSupplier,
  OfferFields,
  ProductOffer,
  ProductRef,
  ProductSourcing,
  SupplierDetail,
  SupplierFields,
  SupplierSummary,
} from "../domain/sourcing.types";

const insensitive = (text: string) => ({ contains: text, mode: "insensitive" as const });

/** Only the columns a product reference shows, plus its main photo. */
const productRefSelect = {
  id: true,
  code: true,
  nameEn: true,
  published: true,
  images: { select: { key: true }, orderBy: { sortOrder: "asc" }, take: 1 },
} as const satisfies Prisma.ProductSelect;

const offerColumns = { id: true, supplierModel: true, priceAmount: true, priceCurrency: true, catalogPage: true } as const;

/** Cheapest supplier first; offers without a price last. */
const byPrice = [{ priceAmount: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }] satisfies Prisma.SupplierProductOrderByWithRelationInput[];

const productOfferSelect = {
  ...offerColumns,
  supplier: { select: { id: true, name: true } },
} as const satisfies Prisma.SupplierProductSelect;

const contactSelect = {
  id: true,
  name: true,
  role: true,
  email: true,
  phone: true,
  whatsapp: true,
  wechat: true,
  notes: true,
} as const satisfies Prisma.SupplierContactSelect;

type OfferRow = { priceAmount: number | null; priceCurrency: string | null; supplierModel: string; catalogPage: number | null; id: string };
type ProductRefRow = Prisma.ProductGetPayload<{ select: typeof productRefSelect }>;

const toMoney = (row: OfferRow): Money | null =>
  row.priceAmount !== null && row.priceCurrency ? { amount: row.priceAmount, currency: row.priceCurrency } : null;

const toOfferFields = (row: OfferRow) => ({ id: row.id, supplierModel: row.supplierModel, price: toMoney(row), catalogPage: row.catalogPage });

/** Offer fields → columns. A field left undefined is not touched. */
const offerData = (fields: Partial<OfferFields>) => ({
  supplierModel: fields.supplierModel,
  catalogPage: fields.catalogPage,
  ...(fields.price !== undefined && {
    priceAmount: fields.price?.amount ?? null,
    priceCurrency: fields.price?.currency ?? null,
  }),
});

@Injectable()
export class PrismaSourcingRepository implements SourcingRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: ObjectStorage,
  ) {}

  private readonly toProductRef = (row: ProductRefRow): ProductRef => ({
    id: row.id,
    code: row.code,
    nameEn: row.nameEn,
    published: row.published,
    imageUrl: row.images[0] ? this.storage.publicUrl(row.images[0].key) : null,
  });

  // --- Suppliers -------------------------------------------------------------------------------------

  async listSuppliers(search: string | undefined): Promise<SupplierSummary[]> {
    const rows = await this.prisma.supplier.findMany({
      where: search ? { OR: [{ name: insensitive(search) }, { nameLocal: insensitive(search) }] } : undefined,
      orderBy: { name: "asc" },
      select: { id: true, name: true, country: true, city: true, _count: { select: { contacts: true, products: true } } },
    });
    return rows.map(({ _count, ...row }) => ({ ...row, contactCount: _count.contacts, productCount: _count.products }));
  }

  async findSupplier(id: string): Promise<SupplierDetail | null> {
    const row = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        contacts: { select: contactSelect, orderBy: { createdAt: "asc" } },
        products: { select: { ...offerColumns, product: { select: productRefSelect } }, orderBy: { product: { code: "asc" } } },
      },
    });
    if (!row) return null;

    const { normalizedName: _key, createdAt: _c, updatedAt: _u, contacts, products, ...fields } = row;
    return {
      ...fields,
      contacts,
      offers: products.map((offer) => ({ ...toOfferFields(offer), product: this.toProductRef(offer.product) })),
    };
  }

  async findSupplierIdByKey(normalizedName: string): Promise<string | null> {
    const row = await this.prisma.supplier.findUnique({ where: { normalizedName }, select: { id: true } });
    return row?.id ?? null;
  }

  createSupplier(fields: NewSupplier, normalizedName: string) {
    return mapPrismaErrors(this.prisma.supplier.create({ data: { ...fields, normalizedName }, select: { id: true } }), {
      duplicate: "This supplier already exists",
    });
  }

  async updateSupplier(id: string, fields: Partial<SupplierFields>, normalizedName?: string): Promise<void> {
    await mapPrismaErrors(this.prisma.supplier.update({ where: { id }, data: { ...fields, normalizedName }, select: { id: true } }), {
      duplicate: "Another supplier already has this name",
      missing: "Supplier not found",
    });
  }

  async deleteSupplier(id: string): Promise<void> {
    await mapPrismaErrors(this.prisma.supplier.delete({ where: { id }, select: { id: true } }), { missing: "Supplier not found" });
  }

  // --- Contacts --------------------------------------------------------------------------------------

  addContact(supplierId: string, fields: NewContact): Promise<Contact> {
    return mapPrismaErrors(this.prisma.supplierContact.create({ data: { ...fields, supplierId }, select: contactSelect }), {
      missingRelation: "Supplier not found",
    });
  }

  async updateContact(id: string, fields: Partial<ContactFields>): Promise<void> {
    await mapPrismaErrors(this.prisma.supplierContact.update({ where: { id }, data: { ...fields }, select: { id: true } }), {
      missing: "Contact not found",
    });
  }

  async deleteContact(id: string): Promise<void> {
    await mapPrismaErrors(this.prisma.supplierContact.delete({ where: { id }, select: { id: true } }), { missing: "Contact not found" });
  }

  // --- Offers ----------------------------------------------------------------------------------------

  async findProductSourcing(search: string | undefined, limit: number): Promise<ProductSourcing[]> {
    const rows = await this.prisma.product.findMany({
      where: search
        ? {
            OR: [
              { code: insensitive(search) },
              { nameEn: insensitive(search) },
              { nameAr: insensitive(search) },
              { suppliers: { some: { supplierModel: insensitive(search) } } },
            ],
          }
        : undefined,
      orderBy: search ? { code: "asc" } : { createdAt: "desc" },
      take: limit,
      select: { ...productRefSelect, suppliers: { select: productOfferSelect, orderBy: byPrice } },
    });
    return rows.map(({ suppliers, ...product }) => ({ ...this.toProductRef(product), offers: suppliers.map(this.toProductOffer) }));
  }

  async listProductOffers(productId: string): Promise<ProductOffer[]> {
    const rows = await this.prisma.supplierProduct.findMany({ where: { productId }, select: productOfferSelect, orderBy: byPrice });
    return rows.map(this.toProductOffer);
  }

  addOffer(supplierId: string, productId: string, fields: OfferFields) {
    return mapPrismaErrors(this.prisma.supplierProduct.create({ data: { supplierId, productId, ...offerData(fields), supplierModel: fields.supplierModel }, select: { id: true } }), {
      duplicate: "This supplier is already linked to this product or model",
      missingRelation: "Supplier or product not found",
    });
  }

  async updateOffer(id: string, fields: Partial<OfferFields>): Promise<void> {
    await mapPrismaErrors(this.prisma.supplierProduct.update({ where: { id }, data: offerData(fields), select: { id: true } }), {
      duplicate: "This supplier already uses that model code",
      missing: "Offer not found",
    });
  }

  async deleteOffer(id: string): Promise<void> {
    await mapPrismaErrors(this.prisma.supplierProduct.delete({ where: { id }, select: { id: true } }), { missing: "Offer not found" });
  }

  private readonly toProductOffer = (row: Prisma.SupplierProductGetPayload<{ select: typeof productOfferSelect }>): ProductOffer => ({
    ...toOfferFields(row),
    supplier: row.supplier,
  });
}

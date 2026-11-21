import type { Prisma } from "@prisma/client";
import type { BusinessType, CategoryRef, Product, Spec } from "../domain/catalog.types";

/** Relations a product page loads. */
export const productInclude = {
  category: true,
  variants: { orderBy: { sortOrder: "asc" } },
  images: { orderBy: { sortOrder: "asc" } },
} as const satisfies Prisma.ProductInclude;

/** Same as a product page, but only the main photo: a category lists many products and shows one photo each. */
export const productCardInclude = {
  ...productInclude,
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
} as const satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;
type CategoryRow = Prisma.CategoryGetPayload<object>;
type BusinessTypeRow = Prisma.BusinessTypeGetPayload<object>;
type StoredSpec = { labelEn?: unknown; labelAr?: unknown; value?: unknown };

/** Turns a stored object key into a public URL. Injected so the mapper never knows which storage is used. */
export type UrlOf = (key: string) => string;

/** Specs are free-form JSON in the database; anything not shaped like a spec is dropped. */
function toSpecs(json: Prisma.JsonValue | null): Spec[] {
  if (!Array.isArray(json)) return [];
  return (json as StoredSpec[])
    .filter((s) => typeof s?.labelEn === "string" && typeof s?.value === "string")
    .map((s) => ({
      label: { en: s.labelEn as string, ar: typeof s.labelAr === "string" ? s.labelAr : (s.labelEn as string) },
      value: s.value as string,
    }));
}

/** Builds the catalog mappers around one key → URL function. */
export function catalogMapper(urlOf: UrlOf) {
  const optionalUrl = (key: string | null) => (key ? urlOf(key) : null);

  const toCategoryRef = (row: CategoryRow): CategoryRef => ({
    id: row.id,
    slug: row.slug,
    name: { en: row.nameEn, ar: row.nameAr },
    sortOrder: row.sortOrder,
    imageUrl: optionalUrl(row.imageKey),
  });

  const toBusinessType = (row: BusinessTypeRow): BusinessType => ({
    id: row.id,
    slug: row.slug,
    name: { en: row.nameEn, ar: row.nameAr },
    summary: { en: row.summaryEn, ar: row.summaryAr },
    imageUrl: optionalUrl(row.imageKey),
  });

  const toProduct = (row: ProductRow): Product => ({
    id: row.id,
    code: row.code,
    slug: row.slug,
    name: { en: row.nameEn, ar: row.nameAr },
    summary: { en: row.summaryEn, ar: row.summaryAr },
    category: toCategoryRef(row.category),
    technical: {
      widthMm: row.widthMm,
      depthMm: row.depthMm,
      heightMm: row.heightMm,
      weightKg: row.weightKg,
      energyType: row.energyType,
      gasTypes: row.gasTypes,
      powerKw: row.powerKw,
      voltage: row.voltage,
      phases: row.phases,
      frequencyHz: row.frequencyHz,
      currentAmps: row.currentAmps,
      currentAmpsCalculated: row.currentAmpsCalculated,
      certifications: row.certifications,
    },
    specs: toSpecs(row.specs),
    variants: row.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      label: { en: v.labelEn, ar: v.labelAr },
      specs: toSpecs(v.specs),
      price: v.priceAmount !== null && v.priceCurrency ? { amount: v.priceAmount, currency: v.priceCurrency } : null,
    })),
    images: row.images.map((i) => ({ url: urlOf(i.key), alt: { en: i.altEn, ar: i.altAr } })),
  });

  return { toCategoryRef, toBusinessType, toProduct };
}

import type { TechnicalSpecs } from "./product-specs";

/** An extra spec in both languages, for anything without its own column (oil capacity, tray size…). */
export type SpecRow = { labelEn: string; labelAr: string; value: string };

/** Everything the dashboard edits on a product. */
export type ProductRecord = TechnicalSpecs & {
  nameEn: string;
  nameAr: string;
  summaryEn: string | null;
  summaryAr: string | null;
  /** Always a subcategory. */
  categoryId: string;
  specs: SpecRow[];
  published: boolean;
  displayRank: number;
};

export type AdminProduct = ProductRecord & {
  id: string;
  code: string;
  slug: string;
  images: { id: string; url: string }[];
};

/**
 * Port for the dashboard's product writes (the public CatalogRepository only reads published products).
 * The abstract class doubles as the DI token.
 */
export abstract class ProductAdminRepository {
  abstract findById(id: string): Promise<AdminProduct | null>;
  /** The code prefix of the subcategory's main category; null when the id is not a subcategory. */
  abstract findCodePrefix(categoryId: string): Promise<string | null>;
  /** Highest number used after this prefix ("GS-FRY-"), 0 when none. */
  abstract lastCodeNumber(codePrefix: string): Promise<number>;
  /** Answers 409 when the code or slug is taken (two creates racing for the same number). */
  abstract create(record: ProductRecord & { code: string; slug: string }): Promise<{ id: string; code: string; slug: string }>;
  abstract update(id: string, record: ProductRecord): Promise<void>;
  /** Returns the keys of its images so their files can be deleted; 404 when missing. */
  abstract delete(id: string): Promise<string[]>;
}

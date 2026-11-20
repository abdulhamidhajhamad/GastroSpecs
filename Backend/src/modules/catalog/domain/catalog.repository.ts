import type { BusinessType, BusinessTypeWithCategories, CategoryNode, CategoryRef, Product } from "./catalog.types";

/**
 * Port for reading the public catalog. Only published products are ever returned.
 * The abstract class doubles as the DI token; infrastructure binds the Prisma adapter to it.
 */
export abstract class CatalogRepository {
  abstract listCategoryTree(): Promise<CategoryNode[]>;
  /** The category with its subcategories (none when it is itself a subcategory). */
  abstract findCategory(slug: string): Promise<CategoryNode | null>;
  /** Every business type with its subcategories, both in display order. */
  abstract listBusinessTypes(): Promise<BusinessTypeWithCategories[]>;
  abstract findBusinessType(slug: string): Promise<BusinessType | null>;
  /** The subcategories linked to a business type, in display order. */
  abstract listBusinessTypeCategories(slug: string): Promise<CategoryRef[]>;
  /** Products of the category, or of all its subcategories when it is a main category. */
  abstract listProductsByCategory(slug: string): Promise<Product[]>;
  abstract findProduct(slug: string): Promise<Product | null>;
}

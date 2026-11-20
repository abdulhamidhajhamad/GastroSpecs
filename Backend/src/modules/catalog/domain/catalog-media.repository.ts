/**
 * Port for the admin's image writes. Kept apart from CatalogRepository, which only ever reads published data.
 * Methods that remove an image return the old key, so the caller can delete the file from storage.
 */
export abstract class CatalogMediaRepository {
  /** null when the category does not exist; `{ imageKey: null }` when it has no image. */
  abstract findCategoryImage(categoryId: string): Promise<{ imageKey: string | null } | null>;
  abstract setCategoryImage(categoryId: string, imageKey: string | null): Promise<void>;

  abstract productExists(productId: string): Promise<boolean>;
  /** Appends the image after the product's existing ones. */
  abstract addProductImage(productId: string, key: string): Promise<{ id: string; key: string }>;
  /** Returns the removed image's key, or null when that image does not belong to the product. */
  abstract removeProductImage(productId: string, imageId: string): Promise<string | null>;
}

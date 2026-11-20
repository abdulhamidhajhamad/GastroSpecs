import type { CategoryGroup, Product } from "./catalog.types";

/**
 * Splits products into one group per subcategory, groups in the categories' display order (sortOrder).
 * Products keep their incoming order inside a group, so a business type's own ordering survives.
 */
export function groupByCategory(products: Product[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();

  for (const product of products) {
    const group = groups.get(product.category.id) ?? { category: product.category, products: [] };
    group.products.push(product);
    groups.set(product.category.id, group);
  }

  return [...groups.values()].sort((a, b) => a.category.sortOrder - b.category.sortOrder);
}

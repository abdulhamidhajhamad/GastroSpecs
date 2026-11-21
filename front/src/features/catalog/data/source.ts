import type { BusinessTypePage, BusinessTypeSummary, CategoryNode, CategoryPage, Product } from "./types";

/**
 * Catalog reads, done on the server. `CATALOG_API_URL` points at the backend (e.g. http://localhost:4000/api).
 * Every call returns null instead of throwing, so a page can show its empty state when the API is down.
 */
const CATALOG_API_URL = process.env.CATALOG_API_URL?.replace(/\/$/, "");

/**
 * Seconds a response is reused before Next asks the API again, so admin changes appear within this time.
 * Off in development: a cached response from an older API version would otherwise outlive a backend change.
 */
const REVALIDATE_SECONDS = process.env.NODE_ENV === "development" ? 0 : 300;

async function get<T>(path: string, locale?: string): Promise<T | null> {
  if (!CATALOG_API_URL) return null;

  try {
    const query = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    const res = await fetch(`${CATALOG_API_URL}/catalog${path}${query}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      if (res.status !== 404) console.error(`Catalog API ${path}: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`Catalog API ${path}:`, error);
    return null;
  }
}

const slugPath = (slug: string) => encodeURIComponent(slug);

export const catalogApi = {
  businessTypes: (locale: string) => get<BusinessTypeSummary[]>("/business-types", locale),
  businessType: (slug: string, locale: string) => get<BusinessTypePage>(`/business-types/${slugPath(slug)}`, locale),
  categories: (locale: string) => get<CategoryNode[]>("/categories", locale),
  category: (slug: string, locale: string) => get<CategoryPage>(`/categories/${slugPath(slug)}`, locale),
  product: (slug: string, locale: string) => get<Product>(`/products/${slugPath(slug)}`, locale),
  /** Every published product, for the sitemap. */
  productSlugs: () => get<{ slug: string; updatedAt: string }[]>("/products"),
};

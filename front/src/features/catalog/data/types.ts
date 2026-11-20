/**
 * Shapes returned by the catalog API (backend: modules/catalog/presentation/catalog.presenter.ts).
 * Text arrives already in the requested language.
 */

export type Money = { amount: number; currency: string };

export type Spec = { label: string; value: string };

export type CategoryRef = { slug: string; name: string; imageUrl: string | null };

export type CategoryNode = CategoryRef & { children: CategoryRef[] };

export type BusinessType = { slug: string; name: string; summary: string | null; imageUrl: string | null };

/** List item of /business-types: the venue with the equipment categories it needs. */
export type BusinessTypeSummary = BusinessType & { categories: CategoryRef[] };

export type Product = {
  slug: string;
  name: string;
  summary: string | null;
  category: CategoryRef;
  specs: Spec[];
  variants: { sku: string | null; label: string; specs: Spec[]; price: Money | null }[];
  images: { url: string; alt: string }[];
};

export type ProductGroup = { category: CategoryRef; products: Product[] };

export type BusinessTypePage = { businessType: BusinessType; categories: CategoryRef[] };

export type CategoryPage = { category: CategoryNode; groups: ProductGroup[] };

import type { Localized } from "@/shared/i18n/localized";

/** Read models of the catalog. Plain data: no ORM types, no HTTP concerns. */

export type Spec = { label: Localized; value: string };

/** `amount` is in the smallest currency unit (cents). */
export type Money = { amount: number; currency: string };

export type CategoryRef = {
  id: string;
  slug: string;
  name: Localized;
  sortOrder: number;
  imageUrl: string | null;
};

/** A main category with its subcategories. */
export type CategoryNode = CategoryRef & { children: CategoryRef[] };

export type BusinessType = {
  id: string;
  slug: string;
  name: Localized;
  summary: Localized<string | null>;
  imageUrl: string | null;
};

/** A business type with the equipment it needs, for the catalog's "by business" cards. */
export type BusinessTypeWithCategories = BusinessType & { categories: CategoryRef[] };

export type ProductVariant = {
  id: string;
  sku: string | null;
  label: Localized;
  specs: Spec[];
  price: Money | null;
};

export type ProductImage = {
  url: string;
  alt: Localized<string | null>;
};

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  summary: Localized<string | null>;
  /** Always a subcategory. */
  category: CategoryRef;
  specs: Spec[];
  variants: ProductVariant[];
  images: ProductImage[];
};

export type CategoryGroup = {
  category: CategoryRef;
  products: Product[];
};

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

/** Key specs with fixed units: millimetres, kilograms, kilowatts, volts, hertz, amps. */
export type TechnicalSpecs = {
  widthMm: number | null;
  depthMm: number | null;
  heightMm: number | null;
  weightKg: number | null;
  energyType: "electric" | "gas" | "dual" | null;
  gasTypes: ("lpg" | "natural_gas")[];
  powerKw: number | null;
  voltage: number | null;
  phases: number | null;
  frequencyHz: number | null;
  currentAmps: number | null;
  /** The amps were calculated from power and voltage, so they are shown as approximate. */
  currentAmpsCalculated: boolean;
  certifications: string[];
};

export type Product = {
  /** Our product number, e.g. "GS-FRY-0001". */
  code: string;
  slug: string;
  name: string;
  summary: string | null;
  category: CategoryRef;
  technical: TechnicalSpecs;
  /** Extra specs without their own field (oil capacity, tray size…). */
  specs: Spec[];
  variants: { sku: string | null; label: string; specs: Spec[]; price: Money | null }[];
  images: { url: string; alt: string }[];
};

export type ProductGroup = { category: CategoryRef; products: Product[] };

export type BusinessTypePage = { businessType: BusinessType; categories: CategoryRef[] };

export type CategoryPage = { category: CategoryNode; groups: ProductGroup[] };

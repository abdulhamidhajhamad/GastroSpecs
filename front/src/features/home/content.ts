import type { MediaKey } from "@/shared/config/media";

/**
 * Structure of the home page. Text lives in messages (home.*), photos in shared/config/media.
 * Reorder, add or remove items here; each key needs a matching entry in en.json and ar.json.
 */

/** Full-screen slider: one sector per slide, the first one is what visitors see first. */
export const heroSlides = [
  { key: "cookingLines", media: "cookingLine" },
  { key: "fastFood", media: "fastFoodLine" },
  { key: "gelato", media: "gelatoShowcase" },
  { key: "bakery", media: "bakeryProduction" },
  { key: "dishwashing", media: "dishwashingLine" },
  { key: "supermarkets", media: "supermarketRefrigeration" },
  { key: "butcheries", media: "butcheryCounter" },
] as const satisfies ReadonlyArray<{ key: string; media: MediaKey }>;

export const pillars = ["design", "sourcing", "inspection"] as const;

export const engineeringItems = [
  "layout",
  "specification",
  "refrigeration",
  "sourcing",
  "inspection",
  "logistics",
] as const;

export const processSteps = ["brief", "design", "quote", "production", "inspection", "delivery"] as const;

export const traderPoints = ["direct", "oem", "flexible"] as const;

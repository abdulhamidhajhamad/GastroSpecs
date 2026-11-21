/**
 * The key technical specs of a machine, kept as real columns so the catalog can sort and filter by them,
 * plus the rules derived from them. Pure functions: no framework, no database.
 */

export const ENERGY_TYPES = ["electric", "gas", "dual"] as const;
export type EnergyType = (typeof ENERGY_TYPES)[number];

export const GAS_TYPES = ["lpg", "natural_gas"] as const;
export type GasType = (typeof GAS_TYPES)[number];

export type TechnicalSpecs = {
  widthMm: number | null;
  depthMm: number | null;
  heightMm: number | null;
  weightKg: number | null;
  energyType: EnergyType | null;
  gasTypes: GasType[];
  /** Electric power, or rated heat input for gas machines. */
  powerKw: number | null;
  voltage: number | null;
  phases: number | null;
  frequencyHz: number | null;
  currentAmps: number | null;
  /** True when currentAmps was worked out by `calculatedAmps`, not stated by the supplier. */
  currentAmpsCalculated: boolean;
  certifications: string[];
};

/**
 * Current drawn at full power: I = P / V on single phase, I = P / (√3 × V) on three phase (V line to line,
 * power factor 1, which fits heating loads). Only for machines that run on electricity.
 */
export function calculatedAmps({ energyType, powerKw, voltage, phases }: TechnicalSpecs): number | null {
  if (energyType !== "electric" || !powerKw || !voltage || (phases !== 1 && phases !== 3)) return null;
  const amps = (powerKw * 1000) / (phases === 3 ? Math.sqrt(3) * voltage : voltage);
  return Math.round(amps * 10) / 10;
}

/** The supplier's figure when given; otherwise calculated (and flagged as such) when possible. */
export function withAmps(specs: TechnicalSpecs, statedAmps: number | null): TechnicalSpecs {
  if (statedAmps !== null) return { ...specs, currentAmps: statedAmps, currentAmpsCalculated: false };
  const amps = calculatedAmps(specs);
  return { ...specs, currentAmps: amps, currentAmpsCalculated: amps !== null };
}

/**
 * Display order inside a category: bigger, more powerful, heavier machines first, as these are the main
 * (and most expensive) equipment. One point per litre of volume, per 100 W and per kilogram.
 * E.g. an 8-head pressure fryer (1040×615×1530 mm, 17 kW, 344 kg) scores 978.6 + 170 + 344 ≈ 1493.
 */
export function sizeRank({ widthMm, depthMm, heightMm, powerKw, weightKg }: TechnicalSpecs): number {
  const litres = widthMm && depthMm && heightMm ? (widthMm * depthMm * heightMm) / 1_000_000 : 0;
  return Math.round(litres + (powerKw ?? 0) * 10 + (weightKg ?? 0));
}

/** Our product number, e.g. productCode("FRY", 1) → "GS-FRY-0001". Four digits: 9999 products per category. */
export const productCode = (prefix: string, number: number) => `GS-${prefix}-${String(number).padStart(4, "0")}`;

/** Prefix shared by every code of a category, for finding the last number used. */
export const productCodePrefix = (prefix: string) => `GS-${prefix}-`;

/** URL slug: the English name plus the code, so it is unique and stays readable ("8-head-pressure-fryer-gs-fry-0001"). */
export function productSlug(nameEn: string, code: string): string {
  const name = nameEn
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return [name, code.toLowerCase()].filter(Boolean).join("-");
}

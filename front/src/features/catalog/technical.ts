import type { getTranslations } from "next-intl/server";
import type { Product, TechnicalSpecs } from "./data/types";

/** The translator for "catalog.product"; its keys are checked against the messages at compile time. */
type Translate = Awaited<ReturnType<typeof getTranslations<"catalog.product">>>;
type SpecKey = "dimensions" | "energy" | "power" | "heatInput" | "supply" | "current" | "weight";

export type SpecLine = { label: string; value: string };

/** Western digits in both languages, as on technical sheets: "12.35", "1040". */
const num = (n: number) => n.toLocaleString("en", { maximumFractionDigits: 2 });

const joined = (parts: (string | null | false)[]) => parts.filter(Boolean).join(" · ") || null;

/**
 * Key specs as label / value lines with their units, in a fixed order (size first, as buyers check
 * whether a machine fits). Specs the product doesn't have are left out.
 */
export function technicalLines(s: TechnicalSpecs, t: Translate): SpecLine[] {
  const lines: [key: SpecKey, value: string | null][] = [
    ["dimensions", s.widthMm && s.depthMm && s.heightMm ? `${s.widthMm} × ${s.depthMm} × ${s.heightMm} mm` : null],
    ["energy", s.energyType && joined([t(`energy.${s.energyType}`), ...s.gasTypes.map((g) => t(`gas.${g}`))])],
    [s.energyType === "gas" ? "heatInput" : "power", s.powerKw != null ? `${num(s.powerKw)} kW` : null],
    ["supply", s.voltage ? joined([`${s.voltage} V`, s.phases === 1 || s.phases === 3 ? t(`phases.${s.phases}`) : null, s.frequencyHz ? `${s.frequencyHz} Hz` : null]) : null],
    ["current", s.currentAmps != null ? `${s.currentAmpsCalculated ? "≈ " : ""}${num(s.currentAmps)} A` : null],
    ["weight", s.weightKg != null ? `${num(s.weightKg)} kg` : null],
  ];
  return lines.flatMap(([key, value]) => (value ? [{ label: t(`specs.${key}`), value }] : []));
}

/** Key specs followed by the product's extra specs: the full specification table. */
export const allSpecLines = (product: Product, t: Translate): SpecLine[] => [...technicalLines(product.technical, t), ...product.specs];

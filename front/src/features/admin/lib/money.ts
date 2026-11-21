/** Prices travel in the smallest currency unit (cents) so no amount is ever rounded by floating point. */
export type Money = { amount: number; currency: string };

export const CURRENCIES = ["USD", "EUR", "CNY", "SAR", "AED", "JOD"] as const;

export function formatMoney({ amount, currency }: Money): string {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount / 100);
}

/** "2,500.50" → 250050 cents; "" → null (no price); anything else → undefined (invalid). */
export function parseAmount(text: string): number | null | undefined {
  const clean = text.replace(/[,\s]/g, "");
  if (!clean) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return undefined;
  return Math.round(Number(clean) * 100);
}

/** Cents → the text shown in an input ("2500.5" for 250050). */
export const amountText = (cents: number | null | undefined) => (cents == null ? "" : String(cents / 100));

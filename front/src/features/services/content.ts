/** The two things we do, in order. Text lives in messages (services.items.*). */
export const services = [
  { key: "trade", points: ["pricing", "range", "oem", "volume"] },
  { key: "engineering", points: ["kitchens", "supermarkets", "bakeries", "coffee"] },
] as const satisfies ReadonlyArray<{ key: string; points: readonly string[] }>;

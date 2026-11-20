import type { MediaKey } from "@/shared/config/media";

/** The two customer groups we serve, in order. Text lives in messages (about.audiences.*). */
export const audiences = [
  { key: "traders", media: "cookingLine" },
  { key: "businesses", media: "kitchenDesign3d" },
] as const satisfies ReadonlyArray<{ key: string; media: MediaKey }>;

export const audiencePoints = ["p1", "p2", "p3", "p4"] as const;

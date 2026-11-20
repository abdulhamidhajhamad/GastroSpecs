export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

/** Text stored in both site languages. `T` is `string | null` for optional fields. */
export type Localized<T extends string | null = string> = { en: T; ar: T };

/** Text in the requested language. Arabic falls back to English when it has no translation yet. */
export function pick<T extends string | null>(text: Localized<T>, locale: Locale): T {
  return locale === "ar" && text.ar ? text.ar : text.en;
}

/**
 * Single source of truth for company-wide settings.
 * Contact values are intentionally empty until they are confirmed;
 * components hide or show a "coming soon" state when a value is empty.
 */
export const siteConfig = {
  name: "GastroSpecs",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gastrospecs.com",
  /** Where uploaded catalog images are served from (Cloudflare R2). Same value as R2_PUBLIC_URL in the backend. */
  mediaUrl: process.env.NEXT_PUBLIC_MEDIA_URL ?? "https://media.gastrospecs.com",
  contact: {
    /** International format without "+" or spaces, e.g. "9665XXXXXXXX". */
    whatsapp: "",
    email: "",
    /** Where the "Request a quote" form sends submissions. Set this to start receiving requests. */
    bookingEmail: "",
  },
} as const;

/**
 * Main navigation (header, mobile menu, footer). Paths are without the locale prefix;
 * "/#id" points to a section of the home page. `soon` shows a "Soon" tag next to the label.
 */
export const mainNav = [
  { key: "services", href: "/services" },
  { key: "catalog", href: "/catalog" },
  { key: "brand", href: "/brand", soon: true },
  { key: "about", href: "/about" },
] as const satisfies ReadonlyArray<{ key: string; href: string; soon?: boolean }>;

/** Section id of the contact / quote block (home page and other pages). */
export const QUOTE_HASH = "contact";

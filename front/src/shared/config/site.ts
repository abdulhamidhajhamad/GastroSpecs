/**
 * Single source of truth for company-wide settings.
 * Contact values left empty show a "coming soon" state instead.
 */
export const siteConfig = {
  name: "GastroSpecs",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gastrospecs.com",
  /** Where uploaded catalog images are served from (Cloudflare R2). Same value as R2_PUBLIC_URL in the backend. */
  mediaUrl: process.env.NEXT_PUBLIC_MEDIA_URL ?? "https://media.gastrospecs.com",
  contact: {
    /** The one address shown to visitors. The site's forms reach it through the API (LEADS_EMAIL_TO). */
    email: "sales@gastrospecs.com",
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

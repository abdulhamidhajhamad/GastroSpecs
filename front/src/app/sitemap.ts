import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/shared/config/site";

/** Public routes without locale prefix. Add new pages here. */
const routes = ["", "/about", "/services", "/catalog"];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (locale: string, path: string) => `${siteConfig.url}/${locale}${path}`;

  return routes.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: url(locale, path),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, url(l, path)])),
      },
    })),
  );
}

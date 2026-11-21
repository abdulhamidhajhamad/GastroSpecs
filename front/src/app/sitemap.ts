import type { MetadataRoute } from "next";
import { catalogApi } from "@/features/catalog";
import { catalogPaths } from "@/features/catalog/paths";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/shared/config/site";

/** Fixed public routes without locale prefix. Add new pages here. */
const staticRoutes = ["", "/about", "/services", "/catalog"];

/**
 * Catalog detail pages come from the API. Slugs are the same in every language, so one locale is enough.
 * If the API is unreachable the sitemap still lists the fixed pages.
 */
async function catalogRoutes(): Promise<string[]> {
  const [businessTypes, categories, products] = await Promise.all([
    catalogApi.businessTypes(routing.defaultLocale),
    catalogApi.categories(routing.defaultLocale),
    catalogApi.productSlugs(),
  ]);

  return [
    ...(businessTypes ?? []).map((b) => catalogPaths.businessType(b.slug)),
    ...(categories ?? []).flatMap((main) => [main, ...main.children].map((c) => catalogPaths.category(c.slug))),
    ...(products ?? []).map((p) => catalogPaths.product(p.slug)),
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (locale: string, path: string) => `${siteConfig.url}/${locale}${path}`;
  const routes = [...staticRoutes, ...(await catalogRoutes())];

  return routes.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: url(locale, path),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path.startsWith("/catalog/") ? 0.6 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, url(l, path)])),
      },
    })),
  );
}

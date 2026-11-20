import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { assertLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/shared/config/site";

const OG_LOCALES: Record<string, string> = { en: "en_US", ar: "ar_SA" };

/**
 * Canonical URL + hreflang alternates + Open Graph for a localized page.
 * `path` is the route without the locale prefix, e.g. "" for home or "/services".
 */
export function pageMetadata({
  locale,
  path = "",
  title,
  description,
}: {
  locale: string;
  path?: string;
  title: string;
  description: string;
}): Metadata {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`]));

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { ...languages, "x-default": `/${routing.defaultLocale}${path}` },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url: `/${locale}${path}`,
      locale: OG_LOCALES[locale],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Pages whose title and description live in messages under "<page>.meta". */
type PageWithMeta = "about" | "services" | "brand" | "catalog";

/**
 * generateMetadata for an inner page. `index: false` keeps placeholder pages
 * (empty or "coming soon") out of search results until they have content.
 */
export async function routeMetadata(
  params: Promise<{ locale: string }>,
  page: PageWithMeta,
  { path, index = true }: { path: string; index?: boolean },
): Promise<Metadata> {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: `${page}.meta` });
  const metadata = pageMetadata({ locale, path, title: t("title"), description: t("description") });

  return index ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { assertLocale } from "@/i18n/locale";
import { pageMetadata } from "@/shared/lib/seo";

/**
 * Metadata for a catalog detail page, titled with the item's own name (e.g. "Fried chicken").
 * `load` fetches the item; Next dedupes this fetch with the page's own, so it costs no extra request.
 */
export async function catalogDetailMetadata(
  params: Promise<{ locale: string; slug: string }>,
  path: (slug: string) => string,
  load: (slug: string, locale: string) => Promise<{ name: string; summary?: string | null } | null>,
): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = assertLocale(raw);
  const [item, t] = await Promise.all([load(slug, locale), getTranslations({ locale, namespace: "catalog.meta" })]);
  if (!item) return {};

  return pageMetadata({ locale, path: path(slug), title: item.name, description: item.summary ?? t("description") });
}

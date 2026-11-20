import { setRequestLocale } from "next-intl/server";
import { CategoryPage, catalogApi } from "@/features/catalog";
import { catalogDetailMetadata } from "@/features/catalog/metadata";
import { catalogPaths } from "@/features/catalog/paths";
import { assertLocale } from "@/i18n/locale";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export const generateMetadata = ({ params }: PageProps) =>
  catalogDetailMetadata(params, catalogPaths.category, async (slug, locale) => (await catalogApi.category(slug, locale))?.category ?? null);

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(assertLocale(locale));
  return <CategoryPage slug={slug} />;
}

import { setRequestLocale } from "next-intl/server";
import { BusinessTypePage, catalogApi } from "@/features/catalog";
import { catalogDetailMetadata } from "@/features/catalog/metadata";
import { catalogPaths } from "@/features/catalog/paths";
import { assertLocale } from "@/i18n/locale";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export const generateMetadata = ({ params }: PageProps) =>
  catalogDetailMetadata(params, catalogPaths.businessType, async (slug, locale) => (await catalogApi.businessType(slug, locale))?.businessType ?? null);

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(assertLocale(locale));
  return <BusinessTypePage slug={slug} />;
}

import { setRequestLocale } from "next-intl/server";
import { ProductPage, catalogApi } from "@/features/catalog";
import { catalogDetailMetadata } from "@/features/catalog/metadata";
import { catalogPaths } from "@/features/catalog/paths";
import { assertLocale } from "@/i18n/locale";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export const generateMetadata = ({ params }: PageProps) => catalogDetailMetadata(params, catalogPaths.product, catalogApi.product);

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(assertLocale(locale));
  return <ProductPage slug={slug} />;
}

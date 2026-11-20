import { setRequestLocale } from "next-intl/server";
import { CatalogPage, type CatalogView } from "@/features/catalog";
import { assertLocale } from "@/i18n/locale";
import { routeMetadata } from "@/shared/lib/seo";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string }>;
};

export const generateMetadata = ({ params }: PageProps) => routeMetadata(params, "catalog", { path: "/catalog" });

export default async function Page({ params, searchParams }: PageProps) {
  setRequestLocale(assertLocale((await params).locale));
  const view: CatalogView = (await searchParams).view === "equipment" ? "equipment" : "business";
  return <CatalogPage view={view} />;
}

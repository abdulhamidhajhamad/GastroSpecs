import { setRequestLocale } from "next-intl/server";
import { BrandPage } from "@/features/brand";
import { assertLocale } from "@/i18n/locale";
import { routeMetadata } from "@/shared/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

// "Coming soon": kept out of search results until it has content.
export const generateMetadata = ({ params }: PageProps) =>
  routeMetadata(params, "brand", { path: "/brand", index: false });

export default async function Page({ params }: PageProps) {
  setRequestLocale(assertLocale((await params).locale));
  return <BrandPage />;
}

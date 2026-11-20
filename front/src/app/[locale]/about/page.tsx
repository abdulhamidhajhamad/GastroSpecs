import { setRequestLocale } from "next-intl/server";
import { AboutPage } from "@/features/about";
import { assertLocale } from "@/i18n/locale";
import { routeMetadata } from "@/shared/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export const generateMetadata = ({ params }: PageProps) => routeMetadata(params, "about", { path: "/about" });

export default async function Page({ params }: PageProps) {
  setRequestLocale(assertLocale((await params).locale));
  return <AboutPage />;
}

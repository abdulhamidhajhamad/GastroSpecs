import { setRequestLocale } from "next-intl/server";
import { ServicesPage } from "@/features/services";
import { assertLocale } from "@/i18n/locale";
import { routeMetadata } from "@/shared/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export const generateMetadata = ({ params }: PageProps) =>
  routeMetadata(params, "services", { path: "/services" });

export default async function Page({ params }: PageProps) {
  setRequestLocale(assertLocale((await params).locale));
  return <ServicesPage />;
}

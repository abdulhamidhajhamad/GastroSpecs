import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomePage } from "@/features/home";
import { assertLocale } from "@/i18n/locale";
import { pageMetadata } from "@/shared/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    ...pageMetadata({ locale, title: t("title"), description: t("description") }),
    title: { absolute: t("title") },
  };
}

export default async function Page({ params }: PageProps) {
  setRequestLocale(assertLocale((await params).locale));

  return <HomePage />;
}

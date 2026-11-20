import { getTranslations } from "next-intl/server";
import { PageHero } from "@/shared/ui/PageHero";

/** "Coming soon" page for the GastroSpecs own-brand equipment line. */
export async function BrandPage() {
  const t = await getTranslations("brand");

  return <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />;
}

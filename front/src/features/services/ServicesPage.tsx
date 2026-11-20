import { getTranslations } from "next-intl/server";
import { ContactCta } from "@/shared/sections/ContactCta";
import { PageHero } from "@/shared/ui/PageHero";
import { Services } from "./components/Services";

export async function ServicesPage() {
  const t = await getTranslations("services.hero");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <Services />
      <ContactCta />
    </>
  );
}

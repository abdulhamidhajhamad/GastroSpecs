import { getTranslations } from "next-intl/server";
import { ContactCta } from "@/shared/sections/ContactCta";
import { Trust } from "@/shared/sections/Trust";
import { PageHero } from "@/shared/ui/PageHero";
import { Audiences } from "./components/Audiences";

export async function AboutPage() {
  const t = await getTranslations("about.hero");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <Audiences />
      <Trust />
      <ContactCta />
    </>
  );
}

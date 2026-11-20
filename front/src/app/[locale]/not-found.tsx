import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/shared/ui/Section";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <Section className="min-h-[60svh]">
      <p className="eyebrow text-muted">404</p>
      <h1 className="mt-5 text-4xl sm:text-5xl">{t("title")}</h1>
      <p className="text-muted mt-5 max-w-lg">{t("text")}</p>
      <Link href="/" className="mono-label mt-10 inline-block border-b border-signal pb-1 text-sm">
        {t("back")}
      </Link>
    </Section>
  );
}

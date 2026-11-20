import { getTranslations } from "next-intl/server";
import { pad } from "@/shared/lib/format";
import { Section } from "@/shared/ui/Section";
import { SectionHeader } from "@/shared/ui/SectionHeader";

const trustPoints = ["proof", "payments", "shipping", "contact"] as const;

/** "Why GastroSpecs": answers the risks buyers worry about. Used on the home and about pages. */
export async function Trust() {
  const t = await getTranslations("trust");

  return (
    <Section tone="muted">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      <ul className="mt-12 grid gap-px bg-hairline sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
        {trustPoints.map((key, i) => (
          <li key={key} className="flex flex-col bg-paper p-6 sm:p-8">
            <span className="mono-label text-xs text-muted">{pad(i + 1)}</span>
            <h3 className="mt-8 text-lg leading-snug sm:mt-12">{t(`items.${key}.title`)}</h3>
            <p className="text-muted mt-3 text-sm">{t(`items.${key}.text`)}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

import { getTranslations } from "next-intl/server";
import { pad } from "@/shared/lib/format";
import { Section } from "@/shared/ui/Section";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { processSteps } from "../content";

/** Vertical timeline on phones, six columns on desktop. */
export async function Process() {
  const t = await getTranslations("home.process");

  return (
    <Section id="process">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      <ol className="mt-14 grid gap-0 lg:mt-20 lg:grid-cols-6 lg:gap-6">
        {processSteps.map((key, i) => (
          <li key={key} className="relative flex gap-5 pb-10 last:pb-0 lg:flex-col lg:gap-0 lg:pb-0">
            {/* Timeline: vertical on mobile, horizontal on desktop */}
            <div className="relative flex flex-col items-center lg:flex-row">
              <span className="relative z-10 size-3 shrink-0 bg-ink ring-4 ring-paper" />
              <span className="absolute top-3 bottom-[-2.5rem] w-px bg-hairline lg:static lg:h-px lg:w-auto lg:flex-1 lg:bg-ink/20" />
            </div>
            <div className="-mt-1.5 lg:mt-6">
              <span className="mono-label text-xs text-signal">{pad(i + 1)}</span>
              <h3 className="mt-2 text-lg leading-snug">{t(`steps.${key}.title`)}</h3>
              <p className="text-muted mt-2 text-sm">{t(`steps.${key}.text`)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

import { getTranslations } from "next-intl/server";
import { pad } from "@/shared/lib/format";
import { Section } from "@/shared/ui/Section";
import { pillars } from "../content";

export async function Intro() {
  const t = await getTranslations("home.intro");

  return (
    <Section id="about">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="eyebrow text-muted">{t("eyebrow")}</p>
          <h2 className="mt-5 text-3xl leading-[1.1] sm:text-4xl lg:text-5xl">{t("title")}</h2>
        </div>
        <p className="text-muted self-end text-base sm:text-lg lg:col-span-5">{t("body")}</p>
      </div>

      <ul className="mt-16 grid border-t border-ink sm:mt-20 md:grid-cols-3">
        {pillars.map((key, i) => (
          <li key={key} className="border-line border-b py-8 md:border-b-0 md:py-10 md:pe-10 md:not-first:border-s md:not-first:ps-10">
            <span className="mono-label text-xs text-signal">{pad(i + 1)}</span>
            <h3 className="mt-4 text-lg leading-snug sm:text-xl">{t(`pillars.${key}.title`)}</h3>
            <p className="text-muted mt-3 text-sm sm:text-base">{t(`pillars.${key}.text`)}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

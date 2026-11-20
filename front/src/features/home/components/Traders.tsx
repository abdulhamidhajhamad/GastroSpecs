import { getTranslations } from "next-intl/server";
import { QUOTE_HASH } from "@/shared/config/site";
import { pad } from "@/shared/lib/format";
import { ArrowIcon } from "@/shared/ui/ArrowIcon";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import { Section } from "@/shared/ui/Section";
import { traderPoints } from "../content";

export async function Traders() {
  const t = await getTranslations("home.traders");

  return (
    <Section id="traders" tone="dark">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="eyebrow text-steel">{t("eyebrow")}</p>
          <h2 className="mt-5 text-3xl leading-[1.1] sm:text-4xl lg:text-5xl">{t("title")}</h2>
          <p className="mt-6 max-w-xl text-base text-steel sm:text-lg">{t("text")}</p>
          <ButtonLink href={`#${QUOTE_HASH}`} variant="outline" className="mt-10 w-full sm:w-auto">
            {t("cta")}
            <ArrowIcon />
          </ButtonLink>
        </div>

        <ul className="border-t border-graphite lg:col-span-5 lg:self-end">
          {traderPoints.map((key, i) => (
            <li key={key} className="flex items-baseline gap-5 border-b border-graphite py-6">
              <span className="mono-label text-xs text-signal">{pad(i + 1)}</span>
              <span className="font-display text-lg font-extrabold [font-stretch:125%] sm:text-xl rtl:font-bold">
                {t(`points.${key}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

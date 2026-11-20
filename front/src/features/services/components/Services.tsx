import { getTranslations } from "next-intl/server";
import { pad } from "@/shared/lib/format";
import { Section } from "@/shared/ui/Section";
import { services } from "../content";

/** The two services: supplying equipment traders, and engineering & equipping venues. */
export async function Services() {
  const t = await getTranslations("services.items");

  return (
    <Section>
      <div className="grid gap-16 lg:gap-24">
        {services.map(({ key, points }, i) => (
          <article key={key} className="grid gap-8 border-t border-ink pt-8 lg:grid-cols-12 lg:gap-16 lg:pt-10">
            <div className="lg:col-span-5">
              <span className="mono-label text-xs text-signal">{pad(i + 1)}</span>
              <p className="eyebrow text-muted mt-6">{t(`${key}.label`)}</p>
              <h2 className="mt-4 text-3xl leading-[1.1] sm:text-4xl">{t(`${key}.title`)}</h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-muted text-base sm:text-lg">{t(`${key}.text`)}</p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm font-medium sm:text-base">
                    <span className="mt-2 size-1.5 shrink-0 bg-signal" aria-hidden="true" />
                    {t(`${key}.points.${point}` as Parameters<typeof t>[0])}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

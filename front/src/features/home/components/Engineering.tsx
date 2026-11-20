import { getTranslations } from "next-intl/server";
import { media } from "@/shared/config/media";
import { pad } from "@/shared/lib/format";
import { Photo } from "@/shared/ui/Photo";
import { Section } from "@/shared/ui/Section";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { engineeringItems } from "../content";

/** Header, then a wide 3D kitchen design (the work we deliver), then the six services. */
export async function Engineering() {
  const [t, tMedia] = await Promise.all([getTranslations("home.engineering"), getTranslations("media")]);

  return (
    <Section id="engineering" tone="dark">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      {/* Whole design visible on every screen; on phones the caption sits below the image instead of over it. */}
      <figure className="relative mt-12 lg:mt-16">
        <div className="relative aspect-video overflow-hidden bg-graphite">
          <Photo
            src={media.kitchenDesign3d.src}
            alt={tMedia("kitchenDesign3d")}
            fill
            sizes="(min-width: 1280px) 1216px, 100vw"
            quality={85}
            className="object-cover"
          />
        </div>
        <figcaption className="mono-label mt-3 text-[0.6875rem] text-steel sm:absolute sm:start-0 sm:bottom-0 sm:mt-0 sm:bg-ink sm:px-4 sm:py-3">
          {t("caption")}
        </figcaption>
      </figure>

      <ol className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
        {engineeringItems.map((key, i) => (
          <li key={key} className="border-t border-graphite py-6 sm:py-8">
            <span className="mono-label text-xs text-signal">{pad(i + 1)}</span>
            <h3 className="mt-3 text-lg leading-snug">{t(`items.${key}.title`)}</h3>
            <p className="mt-2 text-sm text-steel sm:text-base">{t(`items.${key}.text`)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

import { getTranslations } from "next-intl/server";
import { media } from "@/shared/config/media";
import { cn } from "@/shared/lib/cn";
import { Photo } from "@/shared/ui/Photo";
import { Section } from "@/shared/ui/Section";
import { audiencePoints, audiences } from "../content";

/** Who we help and how: photo and text side by side, alternating sides on desktop. */
export async function Audiences() {
  const [t, tMedia] = await Promise.all([getTranslations("about.audiences"), getTranslations("media")]);

  return (
    <Section>
      {audiences.map(({ key, media: mediaKey }, i) => (
        <article
          key={key}
          className={cn("grid items-center gap-10 lg:grid-cols-2 lg:gap-16", i > 0 && "mt-20 sm:mt-28")}
        >
          <div className={cn("relative aspect-[4/3] overflow-hidden bg-mist", i % 2 === 1 && "lg:order-last")}>
            <Photo
              src={media[mediaKey].src}
              alt={tMedia(mediaKey)}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={75}
              className="object-cover"
            />
          </div>

          <div>
            <p className="eyebrow text-muted">{t(`${key}.label`)}</p>
            <h2 className="mt-5 text-3xl leading-[1.1] sm:text-4xl">{t(`${key}.title`)}</h2>
            <p className="text-muted mt-5 text-base sm:text-lg">{t(`${key}.text`)}</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {audiencePoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm font-medium sm:text-base">
                  <span className="mt-2 size-1.5 shrink-0 bg-signal" aria-hidden="true" />
                  {t(`${key}.points.${point}`)}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </Section>
  );
}

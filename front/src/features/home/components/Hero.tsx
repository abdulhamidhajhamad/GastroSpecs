import { getLocale, getTranslations } from "next-intl/server";
import { isRtl } from "@/i18n/routing";
import { media } from "@/shared/config/media";
import { heroSlides } from "../content";
import { HeroSlider } from "./HeroSlider";

/** Full-screen sector slider: one equipment photo per sector, a title and the key machines. */
export async function Hero() {
  const [t, tMedia, locale] = await Promise.all([
    getTranslations("home.hero"),
    getTranslations("media"),
    getLocale(),
  ]);

  const slides = heroSlides.map(({ key, media: mediaKey }) => ({
    key,
    ...media[mediaKey],
    alt: tMedia(mediaKey),
    title: t(`slides.${key}.title`),
    items: t(`slides.${key}.items`),
  }));

  return (
    <HeroSlider
      id="sectors"
      heading={t("heading")}
      cta={{ label: t("cta") }}
      slides={slides}
      isRtl={isRtl(locale)}
      labels={{
        region: t("region"),
        slide: t("slide"),
        prev: t("prev"),
        next: t("next"),
        pause: t("pause"),
        play: t("play"),
      }}
    />
  );
}

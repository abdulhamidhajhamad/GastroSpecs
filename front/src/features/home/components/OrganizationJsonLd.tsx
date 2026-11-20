import { getLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/shared/config/site";

/** Structured data so search engines understand who we are and where we serve. */
export async function OrganizationJsonLd() {
  const [t, locale] = await Promise.all([getTranslations("meta"), getLocale()]);

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: `${siteConfig.url}/${locale}`,
    logo: `${siteConfig.url}/icon.svg`,
    description: t("description"),
    areaServed: "Worldwide",
    knowsAbout: [
      "Commercial kitchen design",
      "Commercial kitchen equipment",
      "Commercial refrigeration",
      "Display showcases",
      "Butchery equipment",
      "Supermarket refrigeration",
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here: all values are our own static strings.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

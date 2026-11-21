import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/shared/config/site";
import { ContactCta } from "@/shared/sections/ContactCta";
import { QuoteButton } from "@/shared/sections/QuoteButton";
import { Photo } from "@/shared/ui/Photo";
import { Section } from "@/shared/ui/Section";
import { BackLink } from "./components/BackLink";
import { catalogApi } from "./data/source";
import type { Product } from "./data/types";
import { catalogPaths } from "./paths";
import { allSpecLines } from "./technical";

/** schema.org data so search engines can show the product (name, code, photo) in results. */
function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.code,
    description: product.summary ?? undefined,
    image: product.images.map((i) => i.url),
    category: product.category.name,
    brand: { "@type": "Brand", name: siteConfig.name },
  };
}

/**
 * One machine: photos, key facts, the full specification table and a quote button. No supplier data ever
 * reaches this page (the public API doesn't have it).
 */
export async function ProductPage({ slug }: { slug: string }) {
  const locale = await getLocale();
  const [t, tg, product] = await Promise.all([getTranslations("catalog.product"), getTranslations("catalog.grid"), catalogApi.product(slug, locale)]);
  if (!product) notFound();

  const [main, ...more] = product.images;
  const specs = allSpecLines(product, t);
  const badges = [...product.technical.certifications, t("exportWorldwide")];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }} />
      <Section>
        <BackLink href={catalogPaths.category(product.category.slug)} label={product.category.name} />

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="grid gap-4 lg:col-span-7">
            <div className="relative aspect-square overflow-hidden border border-ink/10 bg-white">
              {main ? (
                <Photo src={main.url} alt={main.alt} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-contain p-8" />
              ) : (
                <span className="mono-label absolute inset-0 grid place-items-center bg-mist text-xs text-steel">{tg("noImage")}</span>
              )}
            </div>
            {more.length > 0 && (
              <ul className="grid grid-cols-4 gap-4">
                {more.map((image) => (
                  <li key={image.url} className="relative aspect-square overflow-hidden border border-ink/10 bg-white">
                    <Photo src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 12vw, 25vw" className="object-contain p-2" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-5">
            <p className="mono-label text-xs text-steel">
              {t("code")} <span dir="ltr">{product.code}</span>
            </p>
            <h1 className="mt-3 text-3xl leading-[1.15] sm:text-4xl">{product.name}</h1>
            {product.summary && <p className="mt-5 text-base text-muted sm:text-lg">{product.summary}</p>}

            <ul className="mt-6 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <li key={badge} className="mono-label border border-ink/20 px-3 py-1 text-xs">
                  {badge}
                </li>
              ))}
            </ul>

            <QuoteButton className="mt-8 w-full sm:w-auto">{t("quote")}</QuoteButton>
            <p className="mt-4 text-sm text-muted">{t("shipping")}</p>
          </div>
        </div>

        {specs.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <h2 className="border-b border-ink pb-3 text-2xl">{t("specsTitle")}</h2>
            <dl className="grid sm:grid-cols-2 sm:gap-x-12">
              {specs.map((spec) => (
                <div key={spec.label} className="border-line flex items-baseline justify-between gap-6 border-b py-4">
                  <dt className="text-sm text-muted">{spec.label}</dt>
                  <dd className="text-end font-medium" dir="ltr">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </Section>
      <ContactCta />
    </>
  );
}

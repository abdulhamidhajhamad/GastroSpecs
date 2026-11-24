import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/shared/config/site";
import { ContactCta } from "@/shared/sections/ContactCta";
import { QuoteButton } from "@/shared/sections/QuoteButton";
import { Section } from "@/shared/ui/Section";
import { BackLink } from "./components/BackLink";
import { ProductGallery } from "./components/ProductGallery";
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

  const specs = allSpecLines(product, t);
  const badges = [...product.technical.certifications, t("exportWorldwide")];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }} />
      <Section>
        <BackLink href={catalogPaths.category(product.category.slug)} label={product.category.name} />

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {product.images.length ? (
              <ProductGallery images={product.images} labels={{ previous: t("gallery.previous"), next: t("gallery.next"), show: t("gallery.show") }} />
            ) : (
              <div className="relative aspect-square border border-ink/10 bg-mist">
                <span className="mono-label absolute inset-0 grid place-items-center text-xs text-steel">{tg("noImage")}</span>
              </div>
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

        {product.variants.length > 0 && <SizesTable variants={product.variants} title={t("sizesTitle")} model={t("model")} />}

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

/** Every size of the series, one row each (largest first, as stored); columns are the specs the sizes share. */
function SizesTable({ variants, title, model }: { variants: Product["variants"]; title: string; model: string }) {
  const columns = [...new Set(variants.flatMap((v) => v.specs.map((s) => s.label)))];
  return (
    <section className="mt-16 lg:mt-24">
      <h2 className="border-b border-ink pb-3 text-2xl">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-line border-b text-start">
              <th className="mono-label py-3 pe-6 text-start text-xs font-normal text-muted">{model}</th>
              {columns.map((c) => (
                <th key={c} className="mono-label py-3 pe-6 text-start text-xs font-normal text-muted">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.label} className="border-line border-b">
                <td className="py-4 pe-6 font-medium" dir="ltr">
                  {v.label}
                </td>
                {columns.map((c) => (
                  <td key={c} className="py-4 pe-6" dir="ltr">
                    {v.specs.find((s) => s.label === c)?.value ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

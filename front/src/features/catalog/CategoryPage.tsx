import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactCta } from "@/shared/sections/ContactCta";
import { PageHero } from "@/shared/ui/PageHero";
import { Section } from "@/shared/ui/Section";
import { BackLink } from "./components/BackLink";
import { CatalogEmpty } from "./components/CatalogEmpty";
import { ProductGrid } from "./components/ProductGrid";
import { Tile, TileGrid } from "./components/Tile";
import { catalogApi } from "./data/source";
import { catalogPaths } from "./paths";

/**
 * An equipment category. A main category (Preparation) shows its subcategories, then products grouped
 * by subcategory; a subcategory (Mixers) shows its products directly.
 */
export async function CategoryPage({ slug }: { slug: string }) {
  const locale = await getLocale();
  const [t, page] = await Promise.all([getTranslations("catalog"), catalogApi.category(slug, locale)]);
  if (!page) notFound();

  const { category, groups } = page;
  const isMain = category.children.length > 0;
  const noImage = t("grid.noImage");

  return (
    <>
      <PageHero eyebrow={t("detail.equipmentEyebrow")} title={category.name} />
      <Section>
        <div className="grid gap-12">
          <BackLink href={catalogPaths.equipmentView} label={t("detail.back")} />

          {isMain && (
            <TileGrid dense>
              {category.children.map((c) => (
                <Tile key={c.slug} href={catalogPaths.category(c.slug)} title={c.name} imageUrl={c.imageUrl} placeholder={noImage} size="small" />
              ))}
            </TileGrid>
          )}

          {groups.length > 0 ? (
            groups.map((group) => (
              <section key={group.category.slug} className="grid gap-6">
                {isMain && <h2 className="border-b border-ink pb-3 text-2xl leading-tight">{group.category.name}</h2>}
                <ProductGrid products={group.products} locale={locale} />
              </section>
            ))
          ) : (
            <CatalogEmpty title={t("detail.noProductsTitle")} text={t("detail.noProductsText")} />
          )}
        </div>
      </Section>
      <ContactCta />
    </>
  );
}

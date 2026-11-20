import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactCta } from "@/shared/sections/ContactCta";
import { PageHero } from "@/shared/ui/PageHero";
import { Section } from "@/shared/ui/Section";
import { BackLink } from "./components/BackLink";
import { CatalogEmpty } from "./components/CatalogEmpty";
import { Tile, TileGrid } from "./components/Tile";
import { catalogApi } from "./data/source";
import { catalogPaths } from "./paths";

/** A venue (e.g. Fried chicken) and the equipment categories it needs, main equipment first. */
export async function BusinessTypePage({ slug }: { slug: string }) {
  const locale = await getLocale();
  const [t, page] = await Promise.all([getTranslations("catalog"), catalogApi.businessType(slug, locale)]);
  if (!page) notFound();

  const { businessType, categories } = page;

  return (
    <>
      <PageHero eyebrow={t("detail.businessEyebrow")} title={businessType.name} lead={businessType.summary ?? t("detail.businessLead")} />
      <Section>
        <div className="grid gap-10">
          <BackLink href={catalogPaths.root} label={t("detail.back")} />
          {categories.length > 0 ? (
            <TileGrid dense>
              {categories.map((c) => (
                <Tile key={c.slug} href={catalogPaths.category(c.slug)} title={c.name} imageUrl={c.imageUrl} placeholder={t("grid.noImage")} size="small" />
              ))}
            </TileGrid>
          ) : (
            <CatalogEmpty title={t("empty.title")} text={t("empty.text")} />
          )}
        </div>
      </Section>
      <ContactCta />
    </>
  );
}

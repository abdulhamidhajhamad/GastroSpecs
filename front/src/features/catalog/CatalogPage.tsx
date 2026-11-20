import { getLocale, getTranslations } from "next-intl/server";
import { ContactCta } from "@/shared/sections/ContactCta";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/shared/ui/PageHero";
import { Section } from "@/shared/ui/Section";
import { BusinessTypeCard } from "./components/BusinessTypeCard";
import { CatalogEmpty } from "./components/CatalogEmpty";
import { CatalogTabs, type CatalogView } from "./components/CatalogTabs";
import { Tile, TileGrid } from "./components/Tile";
import { catalogApi } from "./data/source";
import { catalogPaths } from "./paths";

/**
 * Catalog entry. Two ways in: by business type (default, for venue owners) or by equipment
 * (for traders and buyers who know the machine). Only the active view's data is fetched.
 */
export async function CatalogPage({ view }: { view: CatalogView }) {
  const locale = await getLocale();
  const t = await getTranslations("catalog");
  const placeholder = t("grid.noImage");

  const content =
    view === "business"
      ? await businessView(locale, (name) => t("business.cardTitle", { name }), (count) => t("business.more", { count }))
      : await equipmentView(locale, placeholder, t("detail.viewAll"));

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lead={t("hero.lead")} />
      <Section>
        <div className="grid gap-10">
          <div className="grid gap-4">
            <CatalogTabs active={view} labels={{ business: t("tabs.business"), equipment: t("tabs.equipment") }} />
            <p className="text-muted">{view === "business" ? t("tabs.businessLead") : t("tabs.equipmentLead")}</p>
          </div>
          {content ?? <CatalogEmpty title={t("empty.title")} text={t("empty.text")} />}
        </div>
      </Section>
      <ContactCta />
    </>
  );
}

async function businessView(locale: string, cardTitle: (name: string) => string, moreLabel: (count: number) => string) {
  const businessTypes = await catalogApi.businessTypes(locale);
  if (!businessTypes?.length) return null;

  return (
    <TileGrid>
      {businessTypes.map((b) => (
        <BusinessTypeCard
          key={b.slug}
          href={catalogPaths.businessType(b.slug)}
          title={cardTitle(b.name)}
          equipment={b.categories.map((c) => c.name)}
          moreLabel={moreLabel}
        />
      ))}
    </TileGrid>
  );
}

async function equipmentView(locale: string, placeholder: string, viewAll: string) {
  const categories = await catalogApi.categories(locale);
  if (!categories?.length) return null;

  return (
    <div className="grid gap-14">
      {categories.map((main) => (
        <section key={main.slug} className="grid gap-5">
          <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
            <h2 className="text-2xl leading-tight">{main.name}</h2>
            <Link href={catalogPaths.category(main.slug)} className="mono-label shrink-0 text-xs text-muted hover:text-ink">
              {viewAll}
            </Link>
          </div>
          <TileGrid dense>
            {main.children.map((c) => (
              <Tile key={c.slug} href={catalogPaths.category(c.slug)} title={c.name} imageUrl={c.imageUrl} placeholder={placeholder} size="small" />
            ))}
          </TileGrid>
        </section>
      ))}
    </div>
  );
}

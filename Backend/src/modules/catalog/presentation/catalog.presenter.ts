import { pick, type Locale } from "@/shared/i18n/localized";
import type {
  BusinessType,
  BusinessTypeWithCategories,
  CategoryGroup,
  CategoryNode,
  CategoryRef,
  Product,
  Spec,
} from "../domain/catalog.types";

/**
 * Shapes domain data into API responses in one language.
 * Created per request with the visitor's locale, so callers never pass `locale` around.
 */
export function catalogPresenter(locale: Locale) {
  const spec = (s: Spec) => ({ label: pick(s.label, locale), value: s.value });

  const category = (c: CategoryRef) => ({ slug: c.slug, name: pick(c.name, locale), imageUrl: c.imageUrl });

  const categoryNode = (c: CategoryNode) => ({ ...category(c), children: c.children.map(category) });

  const businessType = (b: BusinessType) => ({
    slug: b.slug,
    name: pick(b.name, locale),
    summary: pick(b.summary, locale),
    imageUrl: b.imageUrl,
  });

  const businessTypeWithCategories = (b: BusinessTypeWithCategories) => ({
    ...businessType(b),
    categories: b.categories.map(category),
  });

  const product = (p: Product) => ({
    slug: p.slug,
    name: pick(p.name, locale),
    summary: pick(p.summary, locale),
    category: category(p.category),
    specs: p.specs.map(spec),
    variants: p.variants.map((v) => ({
      sku: v.sku,
      label: pick(v.label, locale),
      specs: v.specs.map(spec),
      price: v.price,
    })),
    images: p.images.map((i) => ({ url: i.url, alt: pick(i.alt, locale) ?? pick(p.name, locale) })),
  });

  const groups = (gs: CategoryGroup[]) =>
    gs.map((g) => ({ category: category(g.category), products: g.products.map(product) }));

  return { category, categoryNode, businessType, businessTypeWithCategories, product, groups };
}

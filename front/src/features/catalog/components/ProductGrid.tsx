import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Photo } from "@/shared/ui/Photo";
import type { Product } from "../data/types";
import { catalogPaths } from "../paths";
import { allSpecLines } from "../technical";

/** Specs shown on a card; the full list is on the product page. */
const CARD_SPECS = 3;

/** Lowest variant price, the "From …" figure. Prices are in the smallest currency unit (cents). */
function startingPrice(product: Product, locale: string): string | null {
  const prices = product.variants.flatMap((v) => (v.price ? [v.price] : []));
  if (prices.length === 0) return null;
  const lowest = prices.reduce((a, b) => (b.amount < a.amount ? b : a));
  return new Intl.NumberFormat(locale, { style: "currency", currency: lowest.currency, maximumFractionDigits: 0 }).format(
    lowest.amount / 100,
  );
}

/** Product cards, in the order the API sends them (biggest machines first). Each opens the product page. */
export async function ProductGrid({ products, locale }: { products: Product[]; locale: string }) {
  const [t, tp] = await Promise.all([getTranslations("catalog.grid"), getTranslations("catalog.product")]);

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const image = product.images[0];
        const price = startingPrice(product, locale);
        const specs = allSpecLines(product, tp).slice(0, CARD_SPECS);
        return (
          <li key={product.slug}>
            <Link href={catalogPaths.product(product.slug)} className="group flex h-full flex-col border border-ink/10 bg-paper transition-colors hover:border-ink/40">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                {image ? (
                  <Photo
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-contain p-6 transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <span className="mono-label absolute inset-0 grid place-items-center bg-mist text-xs text-steel">{t("noImage")}</span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="mono-label text-[0.6875rem] text-steel" dir="ltr">
                  {product.code}
                </p>
                <h3 className="text-lg leading-snug">{product.name}</h3>
                {product.summary && <p className="text-sm text-muted">{product.summary}</p>}

                {specs.length > 0 && (
                  <dl className="mono-label mt-auto grid gap-1 pt-2 text-xs text-steel">
                    {specs.map((spec) => (
                      <div key={spec.label} className="flex justify-between gap-4">
                        <dt>{spec.label}</dt>
                        <dd className="text-end normal-case text-ink" dir="ltr">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {price && (
                  <p className="mono-label text-xs text-signal">
                    {t("from")} {price}
                  </p>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

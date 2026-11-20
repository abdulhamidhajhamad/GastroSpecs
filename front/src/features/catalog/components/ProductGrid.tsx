import { Photo } from "@/shared/ui/Photo";
import type { Product } from "../data/types";

type ProductGridProps = {
  products: Product[];
  locale: string;
  labels: { from: string; noImage: string };
};

/** Lowest variant price, the "From …" figure. Prices are in the smallest currency unit (cents). */
function startingPrice(product: Product, locale: string): string | null {
  const prices = product.variants.flatMap((v) => (v.price ? [v.price] : []));
  if (prices.length === 0) return null;
  const lowest = prices.reduce((a, b) => (b.amount < a.amount ? b : a));
  return new Intl.NumberFormat(locale, { style: "currency", currency: lowest.currency, maximumFractionDigits: 0 }).format(
    lowest.amount / 100,
  );
}

export function ProductGrid({ products, locale, labels }: ProductGridProps) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const image = product.images[0];
        const price = startingPrice(product, locale);
        return (
          <li key={product.slug} className="flex flex-col border border-ink/10 bg-paper">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-mist">
              {image ? (
                <Photo src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
              ) : (
                <span className="mono-label absolute inset-0 grid place-items-center text-xs text-steel">{labels.noImage}</span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
              <h3 className="text-lg leading-snug">{product.name}</h3>
              {product.summary && <p className="text-sm text-muted">{product.summary}</p>}

              {product.specs.length > 0 && (
                <dl className="mono-label mt-auto grid gap-1 pt-2 text-xs text-steel">
                  {product.specs.slice(0, 3).map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-4">
                      <dt>{spec.label}</dt>
                      <dd className="text-ink">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {price && (
                <p className="mono-label text-xs text-signal">
                  {labels.from} {price}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

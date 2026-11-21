"use client";

import { useState } from "react";
import Link from "next/link";
import { Photo } from "@/shared/ui/Photo";
import { formatMoney } from "../../lib/money";
import { useApiData, useDebounced } from "../../lib/useApiData";
import type { ProductSourcing } from "../../types";
import { AdminPage, LoadState } from "../AdminPage";
import { buttonStyles, Field } from "../Field";

/**
 * Product search: type our code (GS-FRY-0001), a name or a supplier's model (CNIX-E2000) and see each
 * matching product with every supplier that makes it and what it costs us. Newest products when empty.
 */
export function ProductsPage() {
  const [search, setSearch] = useState("");
  const query = useDebounced(search.trim());
  const { data, error } = useApiData<ProductSourcing[]>(`/admin/sourcing/products${query ? `?q=${encodeURIComponent(query)}` : ""}`);

  return (
    <AdminPage
      title="Products"
      description="Search by our code, a name or a supplier's model to see every supplier and price."
      wide
      actions={
        <Link href="/admin/dashboard/products/new" className={buttonStyles.primary}>
          New product
        </Link>
      }
    >
      <div className="grid gap-6">
        <Field label="Search" type="search" autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="GS-FRY-0001, pressure fryer, CNIX-E2000…" />

        {!data ? (
          <LoadState error={error} />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted">{query ? "No product matches." : "No products yet."}</p>
        ) : (
          <>
            <p className="mono-label text-xs text-steel">{query ? `${data.length} result(s)` : "Latest products"}</p>
            <ul className="grid gap-4">
              {data.map((product) => (
                <ProductResult key={product.id} product={product} />
              ))}
            </ul>
          </>
        )}
      </div>
    </AdminPage>
  );
}

function ProductResult({ product }: { product: ProductSourcing }) {
  return (
    <li className="grid gap-4 border border-ink/10 bg-paper p-4 sm:grid-cols-[96px_1fr]">
      <div className="relative size-24 overflow-hidden border border-ink/10 bg-white">
        {product.imageUrl ? (
          <Photo src={product.imageUrl} alt="" fill sizes="96px" className="object-contain" />
        ) : (
          <span className="mono-label absolute inset-0 grid place-items-center text-[0.625rem] text-steel">No photo</span>
        )}
      </div>

      <div className="grid gap-3">
        <Link href={`/admin/dashboard/products/${product.id}`} className="group">
          <span className="font-mono text-sm text-signal">{product.code}</span>
          <span className="ms-3 font-medium group-hover:underline">{product.nameEn}</span>
          {!product.published && <span className="mono-label ms-3 text-xs text-steel">Draft</span>}
        </Link>

        {product.offers.length === 0 ? (
          <p className="text-sm text-muted">No supplier linked.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-ink/10">
              {product.offers.map((offer) => (
                <tr key={offer.id}>
                  <td className="py-1.5">
                    <Link href={`/admin/dashboard/suppliers/${offer.supplier.id}`} className="hover:underline">
                      {offer.supplier.name}
                    </Link>
                  </td>
                  <td className="py-1.5 font-mono text-muted">{offer.supplierModel}</td>
                  <td className="py-1.5 text-end">{offer.price ? formatMoney(offer.price) : <span className="text-muted">No price</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </li>
  );
}

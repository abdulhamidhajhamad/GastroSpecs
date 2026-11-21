"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { apiDelete, apiPatch, apiPost, failureMessage, type ApiResult } from "../../api";
import { amountText, CURRENCIES, parseAmount } from "../../lib/money";
import { useApiData } from "../../lib/useApiData";
import type { ProductOffer, SupplierSummary } from "../../types";
import { LoadState, Panel } from "../AdminPage";
import { buttonStyles } from "../Field";

type OfferValues = { supplierModel: string; amount: string; currency: string; catalogPage: string };

const input = "w-full border border-ink/20 bg-paper px-2 py-1.5 text-sm outline-none focus:border-ink";

/** Form values → request body. Returns an error message instead when the price can't be read. */
function offerBody(values: OfferValues): Record<string, unknown> | string {
  const amount = parseAmount(values.amount);
  if (amount === undefined) return "Price must be a number, e.g. 2500 or 2500.50";
  return {
    supplierModel: values.supplierModel,
    priceAmount: amount,
    priceCurrency: amount === null ? null : values.currency,
    catalogPage: values.catalogPage ? Number(values.catalogPage) : null,
  };
}

/** Every supplier that makes this product, cheapest first, with their model code and our cost. Admin-only. */
export function ProductOffers({ productId }: { productId: string }) {
  const { data: offers, error, reload } = useApiData<ProductOffer[]>(`/admin/sourcing/products/${productId}/offers`);
  const [adding, setAdding] = useState(false);

  return (
    <Panel
      title={`Suppliers (${offers?.length ?? 0})`}
      actions={
        !adding && (
          <button type="button" onClick={() => setAdding(true)} className={buttonStyles.outline}>
            Link supplier
          </button>
        )
      }
    >
      {!offers ? (
        <LoadState error={error} />
      ) : (
        <div className="grid gap-3">
          <div className="mono-label hidden grid-cols-[1.4fr_1fr_1fr_0.7fr_0.5fr_auto] gap-3 text-xs text-steel sm:grid">
            <span>Supplier</span>
            <span>Their model</span>
            <span>Our cost</span>
            <span>Currency</span>
            <span>Page</span>
            <span />
          </div>
          {offers.length === 0 && !adding && <p className="text-sm text-muted">No supplier linked yet.</p>}
          {offers.map((offer) => (
            <OfferRow key={offer.id} offer={offer} onChange={reload} />
          ))}
          {adding && <NewOffer productId={productId} onDone={() => {
                setAdding(false);
                reload();
              }} onCancel={() => setAdding(false)} />}
        </div>
      )}
    </Panel>
  );
}

function OfferRow({ offer, onChange }: { offer: ProductOffer; onChange: () => void }) {
  const initial: OfferValues = {
    supplierModel: offer.supplierModel,
    amount: amountText(offer.price?.amount),
    currency: offer.price?.currency ?? "USD",
    catalogPage: offer.catalogPage ? String(offer.catalogPage) : "",
  };
  const supplier = (
    <Link href={`/admin/dashboard/suppliers/${offer.supplier.id}`} className="text-sm underline">
      {offer.supplier.name}
    </Link>
  );

  async function remove() {
    if (!confirm(`Unlink ${offer.supplier.name} from this product?`)) return;
    const result = await apiDelete(`/admin/sourcing/offers/${offer.id}`);
    if (result.ok) onChange();
    else alert(failureMessage(result));
  }

  return (
    <OfferEditor
      lead={supplier}
      initial={initial}
      submitLabel="Save"
      onSubmit={(body) => apiPatch(`/admin/sourcing/offers/${offer.id}`, body)}
      onSaved={onChange}
      extra={
        <button type="button" onClick={remove} className={buttonStyles.danger}>
          Unlink
        </button>
      }
    />
  );
}

function NewOffer({ productId, onDone, onCancel }: { productId: string; onDone: () => void; onCancel: () => void }) {
  const { data: suppliers, error } = useApiData<SupplierSummary[]>("/admin/sourcing/suppliers");
  const [supplierId, setSupplierId] = useState("");

  if (!suppliers) return <LoadState error={error} />;
  if (suppliers.length === 0) {
    return (
      <p className="text-sm text-muted">
        No suppliers yet.{" "}
        <Link href="/admin/dashboard/suppliers" className="underline">
          Add one first
        </Link>
        .
      </p>
    );
  }

  return (
    <OfferEditor
      lead={
        <select required value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={input}>
          <option value="">Pick a supplier…</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      }
      initial={{ supplierModel: "", amount: "", currency: "USD", catalogPage: "" }}
      submitLabel="Link"
      onSubmit={(body) => apiPost("/admin/sourcing/offers", { ...body, supplierId, productId })}
      onSaved={onDone}
      extra={
        <button type="button" onClick={onCancel} className={buttonStyles.quiet}>
          Cancel
        </button>
      }
    />
  );
}

type OfferEditorProps = {
  /** First column: the supplier's name, or a supplier picker for a new link. */
  lead: ReactNode;
  initial: OfferValues;
  submitLabel: string;
  onSubmit: (body: Record<string, unknown>) => Promise<ApiResult<unknown>>;
  onSaved: () => void;
  extra: ReactNode;
};

/** One editable offer row; shared by existing links and the "link supplier" row. */
function OfferEditor({ lead, initial, submitLabel, onSubmit, onSaved, extra }: OfferEditorProps) {
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bind = (key: keyof OfferValues) => ({ value: values[key], onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value })) });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = offerBody(values);
    if (typeof body === "string") return setError(body);
    setBusy(true);
    setError(null);
    const result = await onSubmit(body);
    setBusy(false);
    if (result.ok) onSaved();
    else setError(failureMessage(result));
  }

  return (
    <form onSubmit={handleSubmit} className="grid items-center gap-3 border-t border-ink/10 pt-3 sm:grid-cols-[1.4fr_1fr_1fr_0.7fr_0.5fr_auto]">
      {lead}
      <input required placeholder="e.g. CNIX-E2000" aria-label="Their model" className={`${input} font-mono`} {...bind("supplierModel")} />
      <input inputMode="decimal" placeholder="No price yet" aria-label="Our cost" className={input} {...bind("amount")} />
      <select aria-label="Currency" className={input} {...bind("currency")}>
        {CURRENCIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input type="number" min="1" placeholder="p." aria-label="Catalog page" className={input} {...bind("catalogPage")} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={buttonStyles.outline}>
          {busy ? "…" : submitLabel}
        </button>
        {extra}
      </div>
      {error && <p className="text-sm text-signal sm:col-span-6">{error}</p>}
    </form>
  );
}

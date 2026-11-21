"use client";

import { useState } from "react";
import Link from "next/link";
import { apiPost, apiUrl, failureMessage } from "../../api";
import type { AgentPlan, ImportItemResult, PlanItem } from "../../types";
import { buttonStyles } from "../Field";
import { RichText } from "./RichText";

const STATUS: Record<AgentPlan["status"], { label: string; tone: string }> = {
  pending: { label: "Waiting for your approval", tone: "bg-amber-100 text-amber-900" },
  approved: { label: "Approved", tone: "bg-ink/5 text-ink" },
  executing: { label: "Adding to the catalog…", tone: "bg-blue-100 text-blue-900" },
  done: { label: "Added", tone: "bg-green-100 text-green-900" },
  failed: { label: "Failed", tone: "bg-red-100 text-red-900" },
  rejected: { label: "Rejected", tone: "bg-ink/5 text-muted" },
  superseded: { label: "Replaced by a newer plan", tone: "bg-ink/5 text-muted" },
};

const RESULT_TONE: Record<ImportItemResult["status"], string> = {
  created: "text-green-800",
  linked: "text-blue-800",
  skipped: "text-muted",
  failed: "text-signal",
};

/** "1040 × 615 × 1530 mm · 17 kW · 380 V/3ph" from a planned product. */
function keySpecs(product: PlanItem["product"]): string {
  if (!product) return "";
  const size = product.widthMm && product.depthMm && product.heightMm ? `${product.widthMm}×${product.depthMm}×${product.heightMm} mm` : null;
  const supply = product.voltage ? `${product.voltage} V${product.phases ? `/${product.phases}ph` : ""}` : null;
  const energy = [product.energyType, ...(product.gasTypes ?? [])].filter(Boolean).join(" ");
  return [size, product.powerKw != null ? `${product.powerKw} kW` : null, supply, energy || null, product.weightKg != null ? `${product.weightKg} kg` : null]
    .filter(Boolean)
    .join(" · ");
}

/**
 * A plan from the agent: its report, then every product as it would be added, with the photo it would get.
 * Nothing is written until "Approve"; then GastroSpecs's own code adds it and the result shows here.
 */
export function PlanCard({ plan, onChange, busy }: { plan: AgentPlan; onChange: () => void; busy: boolean }) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(plan.status === "pending");
  const { supplier, contacts, products, report } = plan.plan;
  const results = new Map((plan.result?.items ?? []).map((r) => [r.supplierModel, r]));
  const created = products.filter((p) => p.action === "create").length;

  async function act(action: "approve" | "reject") {
    if (action === "approve" && !confirm(`Add ${products.length} products from ${supplier.name}? New products are saved as drafts.`)) return;
    setWorking(true);
    setError(null);
    const result = await apiPost(`/admin/agents/plans/${plan.id}/${action}`);
    setWorking(false);
    if (result.ok) onChange();
    else setError(failureMessage(result));
  }

  return (
    <section className="border border-ink/15 bg-paper">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-3">
        <div>
          <p className="mono-label text-[0.6875rem] text-steel">Import plan</p>
          <h3 className="font-semibold">
            {supplier.name} · {products.length} products ({created} new, {products.length - created} linked)
          </h3>
        </div>
        <span className={`mono-label px-2 py-1 text-[0.6875rem] ${STATUS[plan.status].tone}`}>{STATUS[plan.status].label}</span>
      </header>

      <div className="grid gap-5 p-5">
        <RichText text={report} />

        <div className="grid gap-2 border-t border-ink/10 pt-4 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted">Supplier:</span> {supplier.name}
            {supplier.nameLocal && <span className="text-muted"> · {supplier.nameLocal}</span>} —{" "}
            {supplier.existingSupplierId ? "already in GastroSpecs" : "new"}
          </p>
          <p>
            <span className="text-muted">Contacts:</span> {contacts.length ? contacts.map((c) => c.name).join(", ") : "none"}
          </p>
        </div>

        <button type="button" onClick={() => setOpen(!open)} className={`justify-self-start ${buttonStyles.quiet}`}>
          {open ? "Hide products" : `Show the ${products.length} products`}
        </button>

        {open && (
          <ul className="grid gap-3">
            {products.map((item, index) => {
              const result = results.get(item.supplierModel);
              return (
                <li key={item.supplierModel} className="grid gap-4 border border-ink/10 p-3 sm:grid-cols-[112px_1fr]">
                  <div className="relative size-28 overflow-hidden border border-ink/10 bg-white">
                    {item.image ? (
                      // A preview cut from the catalog by the API; plain <img> since it needs the admin's session cookie.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={apiUrl(`/admin/agents/plans/${plan.id}/photos/${index}`)} alt="" loading="lazy" className="size-full object-contain" />
                    ) : (
                      <span className="mono-label absolute inset-0 grid place-items-center text-[0.625rem] text-steel">No photo</span>
                    )}
                  </div>
                  <div className="grid content-start gap-1 text-sm">
                    <p className="mono-label text-[0.6875rem] text-steel">
                      p.{item.catalogPage} · {item.supplierModel} · {item.action === "create" ? `new in ${item.categorySlug}` : "link to existing product"}
                    </p>
                    {item.product && (
                      <>
                        <p className="font-medium">{item.product.nameEn}</p>
                        <p dir="rtl" className="text-start">
                          {item.product.nameAr}
                        </p>
                        <p className="text-muted">{keySpecs(item.product)}</p>
                        {!!item.product.specs?.length && <p className="text-muted">{item.product.specs.map((s) => `${s.labelEn}: ${s.value}`).join(" · ")}</p>}
                      </>
                    )}
                    {item.notes && <p className="text-amber-800">⚠ {item.notes}</p>}
                    {result && (
                      <p className={RESULT_TONE[result.status]}>
                        {result.status}
                        {result.code && result.productId && (
                          <>
                            {" "}
                            ·{" "}
                            <Link href={`/admin/dashboard/products/${result.productId}`} className="font-mono underline">
                              {result.code}
                            </Link>
                          </>
                        )}
                        {result.message && ` · ${result.message}`}
                        {!!result.warnings.length && <span className="text-amber-800"> · {result.warnings.join("; ")}</span>}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {plan.result?.error && <p className="text-sm text-signal">{plan.result.error}</p>}
        {error && <p className="text-sm text-signal">{error}</p>}

        {plan.status === "pending" && (
          <div className="flex flex-wrap items-center gap-4 border-t border-ink/10 pt-4">
            <button type="button" disabled={working || busy} onClick={() => act("approve")} className={buttonStyles.primary}>
              {working ? "Working…" : "Approve and add"}
            </button>
            <button type="button" disabled={working || busy} onClick={() => act("reject")} className={buttonStyles.danger}>
              Reject
            </button>
            <p className="text-xs text-muted">Or ask for changes in the chat: the agent will send a corrected plan.</p>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "../../api";
import { useApiData, useDebounced } from "../../lib/useApiData";
import type { SupplierSummary } from "../../types";
import { AdminPage, LoadState, Panel } from "../AdminPage";
import { buttonStyles, Field } from "../Field";
import { RecordForm } from "../RecordForm";
import { SUPPLIER_FIELDS } from "./fields";

/** Suppliers list with search, and the form that adds one. */
export function SuppliersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const query = useDebounced(search.trim());
  const { data, error } = useApiData<SupplierSummary[]>(`/admin/sourcing/suppliers${query ? `?q=${encodeURIComponent(query)}` : ""}`);

  const create = async (values: Record<string, string>) => {
    const result = await apiPost<{ id: string }>("/admin/sourcing/suppliers", values);
    if (result.ok) router.push(`/admin/dashboard/suppliers/${result.data.id}`);
    return result;
  };

  return (
    <AdminPage
      title="Suppliers"
      description="Companies we buy from, their people and our notes. Never shown on the public site."
      actions={
        !adding && (
          <button type="button" onClick={() => setAdding(true)} className={buttonStyles.primary}>
            New supplier
          </button>
        )
      }
    >
      <div className="grid gap-8">
        {adding && (
          <Panel title="New supplier">
            <RecordForm fields={SUPPLIER_FIELDS} submitLabel="Add supplier" onSubmit={create} onCancel={() => setAdding(false)} />
          </Panel>
        )}

        <Field label="Search by name" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Yixi" />

        {!data ? (
          <LoadState error={error} />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted">{query ? "No supplier matches." : "No suppliers yet."}</p>
        ) : (
          <ul className="divide-y divide-ink/10 border border-ink/10 bg-paper">
            {data.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/dashboard/suppliers/${s.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-mist/60">
                  <span>
                    <span className="font-medium">{s.name}</span>
                    {(s.city || s.country) && <span className="text-sm text-muted"> · {[s.city, s.country].filter(Boolean).join(", ")}</span>}
                  </span>
                  <span className="mono-label text-xs text-steel">
                    {s.productCount} products · {s.contactCount} contacts
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminPage>
  );
}

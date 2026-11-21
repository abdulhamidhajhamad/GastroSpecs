"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiDelete, apiPatch, apiPost, failureMessage } from "../../api";
import { formatMoney } from "../../lib/money";
import { useApiData } from "../../lib/useApiData";
import type { Contact, SupplierDetail } from "../../types";
import { AdminPage, LoadState, Panel } from "../AdminPage";
import { buttonStyles } from "../Field";
import { RecordForm } from "../RecordForm";
import { CONTACT_FIELDS, SUPPLIER_FIELDS } from "./fields";

const BACK = { href: "/admin/dashboard/suppliers", label: "Suppliers" };

/** One supplier: its details and notes, its people, and the products it makes (with our cost). */
export function SupplierPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: supplier, error, reload } = useApiData<SupplierDetail>(`/admin/sourcing/suppliers/${id}`);

  if (!supplier) {
    return (
      <AdminPage title="Supplier" back={BACK}>
        <LoadState error={error} />
      </AdminPage>
    );
  }

  async function remove() {
    if (!confirm(`Delete ${supplier!.name}? Its contacts and product links go too; the products stay.`)) return;
    const result = await apiDelete(`/admin/sourcing/suppliers/${id}`);
    if (result.ok) router.push(BACK.href);
    else alert(failureMessage(result));
  }

  return (
    <AdminPage
      title={supplier.name}
      description={supplier.nameLocal ?? undefined}
      back={BACK}
      actions={
        <button type="button" onClick={remove} className={buttonStyles.danger}>
          Delete supplier
        </button>
      }
    >
      <div className="grid gap-8">
        <Panel title="Details">
          <RecordForm
            fields={SUPPLIER_FIELDS}
            initial={supplier}
            submitLabel="Save"
            onSubmit={(values) => apiPatch(`/admin/sourcing/suppliers/${id}`, values)}
            onSaved={reload}
          />
        </Panel>

        <Contacts supplierId={id} contacts={supplier.contacts} onChange={reload} />

        <Panel title={`Products (${supplier.offers.length})`}>
          {supplier.offers.length === 0 ? (
            <p className="text-sm text-muted">No products linked yet. Link one from a product&apos;s page.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="mono-label text-start text-xs text-steel">
                <tr>
                  <th className="pb-2 text-start font-normal">Our code</th>
                  <th className="pb-2 text-start font-normal">Product</th>
                  <th className="pb-2 text-start font-normal">Their model</th>
                  <th className="pb-2 text-end font-normal">Our cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {supplier.offers.map((offer) => (
                  <tr key={offer.id}>
                    <td className="py-2 font-mono">
                      <Link href={`/admin/dashboard/products/${offer.product.id}`} className="underline">
                        {offer.product.code}
                      </Link>
                    </td>
                    <td className="py-2">{offer.product.nameEn}</td>
                    <td className="py-2 font-mono">
                      {offer.supplierModel}
                      {offer.catalogPage && <span className="text-muted"> · p.{offer.catalogPage}</span>}
                    </td>
                    <td className="py-2 text-end">{offer.price ? formatMoney(offer.price) : <span className="text-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}

function Contacts({ supplierId, contacts, onChange }: { supplierId: string; contacts: Contact[]; onChange: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function remove(contact: Contact) {
    if (!confirm(`Remove ${contact.name}?`)) return;
    const result = await apiDelete(`/admin/sourcing/contacts/${contact.id}`);
    if (result.ok) onChange();
    else alert(failureMessage(result));
  }

  return (
    <Panel
      title={`Contacts (${contacts.length})`}
      actions={
        !adding && (
          <button type="button" onClick={() => setAdding(true)} className={buttonStyles.outline}>
            Add contact
          </button>
        )
      }
    >
      <div className="grid gap-6">
        {adding && (
          <RecordForm
            fields={CONTACT_FIELDS}
            submitLabel="Add contact"
            resetOnSave
            onSubmit={(values) => apiPost(`/admin/sourcing/suppliers/${supplierId}/contacts`, values)}
            onSaved={() => {
              setAdding(false);
              onChange();
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {contacts.length === 0 && !adding && <p className="text-sm text-muted">No contacts yet.</p>}

        <ul className="grid gap-4">
          {contacts.map((contact) =>
            editing === contact.id ? (
              <li key={contact.id} className="border border-ink/10 p-4">
                <RecordForm
                  fields={CONTACT_FIELDS}
                  initial={contact}
                  submitLabel="Save"
                  onSubmit={(values) => apiPatch(`/admin/sourcing/contacts/${contact.id}`, values)}
                  onSaved={() => {
                    setEditing(null);
                    onChange();
                  }}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <li key={contact.id} className="flex flex-wrap items-start justify-between gap-4 border border-ink/10 p-4">
                <div className="grid gap-1 text-sm">
                  <p className="font-medium">
                    {contact.name}
                    {contact.role && <span className="font-normal text-muted"> · {contact.role}</span>}
                  </p>
                  {[
                    ["Email", contact.email],
                    ["Phone", contact.phone],
                    ["WhatsApp", contact.whatsapp],
                    ["WeChat", contact.wechat],
                  ].map(([label, value]) => value && <p key={label}><span className="text-muted">{label}:</span> {value}</p>)}
                  {contact.notes && <p className="whitespace-pre-line text-muted">{contact.notes}</p>}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setEditing(contact.id)} className={buttonStyles.quiet}>
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(contact)} className={buttonStyles.danger}>
                    Remove
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      </div>
    </Panel>
  );
}

"use client";

import { useApiData } from "../../lib/useApiData";
import type { Lead } from "../../types";
import { AdminPage, LoadState } from "../AdminPage";

const KIND: Record<Lead["source"], string> = {
  quote: "Quote request",
  contact: "Contact message",
  catalog_download: "Catalog download",
};

const PROJECT: Record<string, string> = {
  trader: "Equipment trader / distributor",
  fastFood: "Fast food restaurant",
  central: "Central / production kitchen",
  hotel: "Hotel or large kitchen",
  other: "Other",
};

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

/** Everything visitors sent through the site's forms, newest first. Each one was also emailed to sales@. */
export function RequestsPage() {
  const { data, error } = useApiData<Lead[]>("/leads");

  return (
    <AdminPage title="Requests" description="Quote requests and contact messages from the site, newest first. Each one is also emailed to sales@gastrospecs.com.">
      {!data ? (
        <LoadState error={error} />
      ) : data.length === 0 ? (
        <p className="text-sm text-muted">No requests yet.</p>
      ) : (
        <ul className="divide-y divide-ink/10 border border-ink/10 bg-paper">
          {data.map((lead) => (
            <li key={lead.id} className="grid gap-2 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">
                  {KIND[lead.source]}
                  {(lead.company || lead.name) && <span className="text-muted"> · {lead.company ?? lead.name}</span>}
                </span>
                <span className="mono-label text-xs text-steel">{when(lead.createdAt)}</span>
              </div>
              <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[8rem_1fr]">
                {(
                  [
                    ["Name", lead.name],
                    ["Project", lead.projectType && (PROJECT[lead.projectType] ?? lead.projectType)],
                    ["Email", lead.email && <a href={`mailto:${lead.email}`} className="underline">{lead.email}</a>],
                    ["Phone", lead.phone && <a href={`tel:${lead.phone}`} dir="ltr" className="underline">{lead.phone}</a>],
                    ["Message", lead.message && <span className="whitespace-pre-wrap">{lead.message}</span>],
                  ] as const
                )
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-muted">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </AdminPage>
  );
}

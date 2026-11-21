"use client";

import Link from "next/link";
import { useApiData } from "../../lib/useApiData";
import type { Agent } from "../../types";
import { AdminPage, LoadState } from "../AdminPage";

/** The AI agents that work for GastroSpecs; each opens its chats. */
export function AgentsPage() {
  const { data, error } = useApiData<Agent[]>("/admin/agents");

  return (
    <AdminPage title="AI agents" description="Agents prepare work for you; nothing reaches the catalog until you approve it." wide>
      {!data ? (
        <LoadState error={error} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((agent) => (
            <li key={agent.name}>
              <Link href={`/admin/dashboard/agents/${agent.name}`} className="group block h-full border border-ink/10 bg-paper p-6 transition-colors hover:border-ink/40">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-mono text-lg font-medium">{agent.name}</h2>
                  <span className="mono-label bg-green-100 px-2 py-1 text-[0.6875rem] text-green-800">active</span>
                </div>
                <p className="mono-label mt-1 text-xs text-steel">{agent.title}</p>
                <p className="mt-3 text-sm text-muted">{agent.description}</p>
                <span className="mono-label mt-6 inline-block text-xs text-signal">Open chats →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminPage>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiDelete, apiPost, failureMessage } from "../../api";
import { useApiData } from "../../lib/useApiData";
import type { ConversationSummary } from "../../types";
import { AdminPage, LoadState } from "../AdminPage";
import { buttonStyles } from "../Field";
import { ConversationView } from "./ConversationView";

const STATUS_DOT: Record<ConversationSummary["status"], string> = { idle: "bg-ink/20", running: "bg-blue-500 animate-pulse", failed: "bg-signal" };

/** An agent's chats: the list on the side, the open chat (`conversationId`) in the middle. One catalog per chat. */
export function AgentChatPage({ agent, conversationId }: { agent: string; conversationId?: string }) {
  const router = useRouter();
  const { data, error, reload } = useApiData<ConversationSummary[]>(`/admin/agents/${agent}/conversations`);
  const [creating, setCreating] = useState(false);
  const base = `/admin/dashboard/agents/${agent}`;

  async function newChat() {
    setCreating(true);
    const result = await apiPost<{ id: string }>(`/admin/agents/${agent}/conversations`, {});
    setCreating(false);
    if (result.ok) router.push(`${base}/${result.data.id}`);
    else alert(failureMessage(result));
  }

  async function remove(id: string) {
    if (!confirm("Delete this chat and its catalog file? Products already added stay.")) return;
    const result = await apiDelete(`/admin/agents/conversations/${id}`);
    if (!result.ok) return alert(failureMessage(result));
    if (id === conversationId) router.push(base);
    else reload();
  }

  return (
    <AdminPage
      title={agent}
      description="Product importer: send a supplier catalog, review the plan, approve."
      back={{ href: "/admin/dashboard/agents", label: "AI agents" }}
      wide
      actions={
        <button type="button" disabled={creating} onClick={newChat} className={buttonStyles.primary}>
          {creating ? "Starting…" : "New chat"}
        </button>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="grid content-start gap-2">
          <p className="mono-label text-xs text-steel">Chats</p>
          {!data ? (
            <LoadState error={error} />
          ) : data.length === 0 ? (
            <p className="text-sm text-muted">No chats yet.</p>
          ) : (
            <ul className="grid gap-1">
              {data.map((chat) => (
                <li key={chat.id} className={`group flex items-center gap-2 border px-3 py-2 text-sm ${chat.id === conversationId ? "border-ink bg-paper" : "border-transparent hover:bg-paper"}`}>
                  <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT[chat.status]}`} />
                  <Link href={`${base}/${chat.id}`} className="min-w-0 flex-1 truncate">
                    {chat.title}
                  </Link>
                  <button type="button" onClick={() => remove(chat.id)} className="hidden text-xs text-muted hover:text-signal group-hover:block" aria-label="Delete chat">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="min-w-0">
          {conversationId ? (
            <ConversationView key={conversationId} id={conversationId} agentName={agent} />
          ) : (
            <div className="border border-dashed border-ink/20 bg-paper p-10 text-center">
              <p className="font-medium">Start a new chat for each catalog.</p>
              <p className="mt-2 text-sm text-muted">Click &ldquo;New chat&rdquo;, attach the PDF and send.</p>
            </div>
          )}
        </div>
      </div>
    </AdminPage>
  );
}

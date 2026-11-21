"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { apiRequest, failureMessage } from "../../api";
import { useApiData } from "../../lib/useApiData";
import type { AgentPlan, ChatMessage, Conversation } from "../../types";
import { LoadState } from "../AdminPage";
import { buttonStyles } from "../Field";
import { PlanCard } from "./PlanCard";
import { RichText } from "./RichText";

/** How often the chat refreshes while the agent works or a plan is being added. */
const POLL_MS = 2500;

const TOOL_LABELS: Record<string, string> = {
  list_categories: "checked the categories",
  search_suppliers: "searched our suppliers",
  search_products: "searched our products",
  propose_import_plan: "prepared the import plan",
};

type Entry = { at: string; message?: ChatMessage; plan?: AgentPlan };

/** One chat with an agent: messages and plans in time order, and the box to write (and attach a catalog). */
export function ConversationView({ id, agentName }: { id: string; agentName: string }) {
  const { data, error, reload } = useApiData<Conversation>(`/admin/agents/conversations/${id}`);
  const working = data?.status === "running" || data?.plans.some((p) => p.status === "executing");
  const bottom = useRef<HTMLDivElement>(null);
  const count = (data?.messages.length ?? 0) + (data?.plans.length ?? 0);

  // Poll only while something is happening on the server.
  useEffect(() => {
    if (!working) return;
    const timer = setInterval(reload, POLL_MS);
    return () => clearInterval(timer);
  }, [working, reload]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [count, working]);

  if (!data) return <LoadState error={error} />;

  const timeline: Entry[] = [
    ...data.messages.map((message) => ({ at: message.createdAt, message })),
    ...data.plans.map((plan) => ({ at: plan.createdAt, plan })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <div className="grid gap-6">
      {timeline.length === 0 && (
        <div className="border border-dashed border-ink/20 bg-paper p-8 text-center text-sm text-muted">
          Attach a supplier&apos;s catalog (PDF) and send it. {agentName} checks our suppliers and products, then shows you a plan to approve.
        </div>
      )}

      {timeline.map((entry) =>
        entry.plan ? (
          <PlanCard key={entry.plan.id} plan={entry.plan} onChange={reload} busy={data.status === "running"} />
        ) : (
          <Bubble key={entry.message!.id} message={entry.message!} agentName={agentName} />
        ),
      )}

      {data.status === "running" && <p className="mono-label animate-pulse text-xs text-steel">{agentName} is working… (a full catalog can take a few minutes)</p>}
      {data.status === "failed" && data.lastError && <p className="text-sm text-signal">Stopped: {data.lastError}</p>}

      <Composer id={id} hasCatalog={!!data.fileName} disabled={data.status === "running"} onSent={reload} />
      <div ref={bottom} />
    </div>
  );
}

function Bubble({ message, agentName }: { message: ChatMessage; agentName: string }) {
  if (message.role === "event") {
    return (
      <div className="border-s-2 border-ink/30 bg-mist/60 px-4 py-3">
        <p className="mono-label mb-2 text-[0.6875rem] text-steel">GastroSpecs</p>
        <RichText text={message.text ?? ""} />
      </div>
    );
  }

  const mine = message.role === "user";
  return (
    <div className={`grid gap-1 ${mine ? "justify-items-end" : "justify-items-start"}`}>
      <p className="mono-label text-[0.6875rem] text-steel">{mine ? "You" : agentName}</p>
      <div className={`max-w-[46rem] px-4 py-3 ${mine ? "bg-ink text-paper" : "border border-ink/10 bg-paper"}`}>
        {message.attachment && <p className="mono-label mb-2 text-[0.6875rem] opacity-70">📎 catalog attached</p>}
        {message.text && <RichText text={message.text} />}
        {message.tools.length > 0 && (
          <p className="mono-label mt-1 text-[0.6875rem] text-steel">{[...new Set(message.tools)].map((t) => TOOL_LABELS[t] ?? t).join(" · ")}</p>
        )}
      </div>
    </div>
  );
}

function Composer({ id, hasCatalog, disabled, onSent }: { id: string; hasCatalog: boolean; disabled: boolean; onSent: () => void }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() && !file) return;
    const form = new FormData();
    if (text.trim()) form.append("text", text.trim());
    if (file) form.append("file", file);
    setSending(true);
    setError(null);
    const result = await apiRequest(`/admin/agents/conversations/${id}/messages`, { method: "POST", body: form });
    setSending(false);
    if (!result.ok) return setError(failureMessage(result));
    setText("");
    setFile(null);
    onSent();
  }

  return (
    <form onSubmit={send} className="sticky bottom-4 grid gap-3 border border-ink/15 bg-paper p-4 shadow-sm">
      <textarea
        rows={3}
        dir="auto"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send(e);
        }}
        placeholder={hasCatalog ? "Ask a question or request changes to the plan…" : "Add a note (e.g. the supplier's WhatsApp), attach the catalog and send."}
        className="w-full resize-y border border-ink/20 bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
      />
      <div className="flex flex-wrap items-center gap-4">
        {!hasCatalog && (
          <label className={`${buttonStyles.outline} cursor-pointer`}>
            {file ? `📎 ${file.name}` : "Attach catalog (PDF)"}
            <input type="file" accept="application/pdf" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        )}
        <button type="submit" disabled={disabled || sending || (!text.trim() && !file)} className={buttonStyles.primary}>
          {sending ? (file ? "Uploading…" : "Sending…") : "Send"}
        </button>
        <span className="text-xs text-muted">Ctrl + Enter to send</span>
        {error && <p className="text-sm text-signal">{error}</p>}
      </div>
    </form>
  );
}

"use client";

import { createContext, type FormEvent, type ReactNode, type RefObject, useCallback, useContext, useRef, useState } from "react";
import { apiUrl } from "@/shared/lib/api";
import { cn } from "@/shared/lib/cn";
import { ArrowIcon } from "@/shared/ui/ArrowIcon";
import { ctaClass } from "@/shared/ui/ButtonLink";
import type { LeadDialogsConfig } from "./quote";

export type LeadKind = "quote" | "contact";

const LeadDialogContext = createContext<((kind: LeadKind) => void) | null>(null);

/** Opens one of the popup forms. Any button under <LeadDialogs> can call it. */
export function useLeadDialog(kind: LeadKind): () => void {
  const open = useContext(LeadDialogContext);
  if (!open) throw new Error("useLeadDialog must be used inside <LeadDialogs>");
  return () => open(kind);
}

const fieldLabel = "mono-label text-xs text-smoke";
const control = "w-full border border-hairline bg-paper px-4 text-base text-ink transition-colors focus:border-ink";
const input = cn(control, "mt-2 h-12");

/**
 * Mounts the two popup forms once for the whole app ("Request a quote" and "Contact us") and shares
 * `open(kind)` via context. Native <dialog>: Esc, focus trap and backdrop for free. Both forms post to
 * the API, which saves the request and emails it to the sales inbox.
 */
export function LeadDialogs({ config, children }: { config: LeadDialogsConfig; children: ReactNode }) {
  const quoteRef = useRef<HTMLDialogElement>(null);
  const contactRef = useRef<HTMLDialogElement>(null);
  const { quote, contact } = config;

  const open = useCallback((kind: LeadKind) => {
    document.body.style.overflow = "hidden";
    (kind === "quote" ? quoteRef : contactRef).current?.showModal();
  }, []);

  return (
    <LeadDialogContext.Provider value={open}>
      {children}

      <LeadDialog dialogRef={quoteRef} source="quote" title={quote.title} intro={quote.intro} submit={quote.submit} config={config}>
        <label className="block">
          <span className={fieldLabel}>{quote.email}</span>
          <input name="email" type="email" required autoComplete="email" dir="ltr" className={cn(input, "text-start")} />
        </label>
        <label className="block">
          <span className={fieldLabel}>{quote.phone}</span>
          <input name="phone" type="tel" required autoComplete="tel" dir="ltr" className={cn(input, "text-start")} />
        </label>
        <label className="block">
          <span className={fieldLabel}>{quote.type}</span>
          <div className="relative mt-2">
            <select name="projectType" required defaultValue="" className={cn(control, "h-12 appearance-none pe-10")}>
              <option value="" disabled>
                {quote.typePlaceholder}
              </option>
              {quote.types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
              className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-smoke"
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="square" />
            </svg>
          </div>
        </label>
        <label className="block">
          <span className={fieldLabel}>{quote.business}</span>
          <input name="company" type="text" required maxLength={200} autoComplete="organization" className={input} />
        </label>
      </LeadDialog>

      <LeadDialog dialogRef={contactRef} source="contact" title={contact.title} intro={contact.intro} submit={contact.submit} config={config}>
        <label className="block">
          <span className={fieldLabel}>{contact.name}</span>
          <input name="name" type="text" required maxLength={100} autoComplete="name" className={input} />
        </label>
        <label className="block">
          <span className={fieldLabel}>{contact.phone}</span>
          <input name="phone" type="tel" required autoComplete="tel" dir="ltr" className={cn(input, "text-start")} />
        </label>
        <label className="block">
          <span className={fieldLabel}>{contact.message}</span>
          <textarea name="message" required rows={5} maxLength={3000} className={cn(control, "mt-2 resize-y py-3")} />
        </label>
      </LeadDialog>
    </LeadDialogContext.Provider>
  );
}

type Status = "idle" | "sending" | "sent" | "error";

type LeadDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  source: LeadKind;
  title: string;
  intro: string;
  submit: string;
  config: LeadDialogsConfig;
  children: ReactNode;
};

/** One popup form: sends its fields to the API, then thanks the visitor in place. */
function LeadDialog({ dialogRef, source, title, intro, submit, config, children }: LeadDialogProps) {
  const [status, setStatus] = useState<Status>("idle");
  const { status: text } = config;
  const close = () => dialogRef.current?.close();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, String(value).trim()]).filter(([, value]) => value));
    setStatus("sending");
    try {
      const res = await fetch(apiUrl("/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, source, page: window.location.pathname, locale: config.locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={() => {
        document.body.style.overflow = "";
        setStatus((s) => (s === "sending" ? s : "idle"));
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
      className="m-auto max-h-[85svh] w-[min(34rem,100vw-2rem)] overflow-y-auto border border-hairline bg-paper p-0 text-ink"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <h2 className="text-2xl sm:text-3xl">{status === "sent" ? text.sentTitle : title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label={config.close}
            className="-me-2 -mt-1 grid size-10 shrink-0 place-items-center text-smoke transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="square" />
            </svg>
          </button>
        </div>

        {status === "sent" ? (
          <div role="status">
            <p className="text-muted mt-3 text-sm sm:text-base">{text.sentText}</p>
            <button type="button" onClick={close} className={ctaClass("primary", "md", "mt-8 w-full")}>
              {text.done}
            </button>
          </div>
        ) : (
          <>
            <p className="text-muted mt-3 text-sm sm:text-base">{intro}</p>
            <form onSubmit={onSubmit} className="mt-6 grid gap-5">
              {children}
              {/* Honeypot: hidden from people, bots fill it and the API quietly drops the request. */}
              <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -start-[9999px] size-px opacity-0" />
              {status === "error" && (
                <p role="alert" className="text-sm text-signal">
                  {text.error}
                </p>
              )}
              <button type="submit" disabled={status === "sending"} className={ctaClass("primary", "md", "mt-1 w-full disabled:opacity-60")}>
                {status === "sending" ? text.sending : submit}
                {status !== "sending" && <ArrowIcon />}
              </button>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}

"use client";

import { createContext, type FormEvent, type ReactNode, useCallback, useContext, useRef } from "react";
import { cn } from "@/shared/lib/cn";
import { ArrowIcon } from "@/shared/ui/ArrowIcon";
import { ctaClass } from "@/shared/ui/ButtonLink";
import type { QuoteConfig } from "./quote";

const QuoteContext = createContext<(() => void) | null>(null);

/** Opens the single quote dialog. Any button under <QuoteProvider> can call it. */
export function useQuote(): () => void {
  const open = useContext(QuoteContext);
  if (!open) throw new Error("useQuote must be used inside <QuoteProvider>");
  return open;
}

const fieldLabel = "mono-label text-xs text-smoke";
const control =
  "h-12 w-full border border-hairline bg-paper px-4 text-base text-ink transition-colors focus:border-ink";

/**
 * Mounts one booking dialog for the whole app and shares an `open()` via context, so every
 * "Request a quote" button opens the popup in place instead of scrolling to a section first.
 * Native <dialog>: Esc, focus trap and backdrop for free. Submit composes a prefilled email.
 */
export function QuoteProvider({ config, children }: { config: QuoteConfig; children: ReactNode }) {
  const { email, subject, types, labels } = config;
  const ref = useRef<HTMLDialogElement>(null);

  const open = useCallback(() => {
    document.body.style.overflow = "hidden";
    ref.current?.showModal();
  }, []);
  const close = () => ref.current?.close();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const typeLabel = types.find((t) => t.value === get("type"))?.label ?? get("type");
    const body = [
      `${labels.type}: ${typeLabel}`,
      `${labels.business}: ${get("business")}`,
      `${labels.email}: ${get("email")}`,
      `${labels.phone}: ${get("phone")}`,
    ].join("\n");
    const href = `mailto:${email}?subject=${encodeURIComponent(`${subject} — ${get("business")}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    close();
  };

  return (
    <QuoteContext.Provider value={open}>
      {children}

      <dialog
        ref={ref}
        onClose={() => {
          document.body.style.overflow = "";
        }}
        onClick={(e) => {
          if (e.target === ref.current) close();
        }}
        className="m-auto w-[min(34rem,100vw-2rem)] max-h-[85svh] overflow-y-auto border border-hairline bg-paper p-0 text-ink"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <h2 className="text-2xl sm:text-3xl">{labels.title}</h2>
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="-me-2 -mt-1 grid size-10 shrink-0 place-items-center text-smoke transition-colors hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="square" />
              </svg>
            </button>
          </div>
          <p className="text-muted mt-3 text-sm sm:text-base">{labels.intro}</p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-5">
            <label className="block">
              <span className={fieldLabel}>{labels.email}</span>
              <input name="email" type="email" required autoComplete="email" className={cn(control, "mt-2")} />
            </label>
            <label className="block">
              <span className={fieldLabel}>{labels.phone}</span>
              <input name="phone" type="tel" required autoComplete="tel" dir="ltr" className={cn(control, "mt-2 text-start")} />
            </label>
            <label className="block">
              <span className={fieldLabel}>{labels.type}</span>
              <div className="relative mt-2">
                <select name="type" required defaultValue="" className={cn(control, "appearance-none pe-10")}>
                  <option value="" disabled>
                    {labels.typePlaceholder}
                  </option>
                  {types.map((t) => (
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
              <span className={fieldLabel}>{labels.business}</span>
              <input name="business" type="text" required autoComplete="organization" className={cn(control, "mt-2")} />
            </label>
            <button type="submit" className={ctaClass("primary", "md", "mt-1 w-full")}>
              {labels.submit}
              <ArrowIcon />
            </button>
          </form>
        </div>
      </dialog>
    </QuoteContext.Provider>
  );
}

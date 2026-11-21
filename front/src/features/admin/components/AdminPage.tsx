import type { ReactNode } from "react";
import Link from "next/link";

type AdminPageProps = {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  /** Shown on the right of the title, e.g. a "New" button. */
  actions?: ReactNode;
  wide?: boolean;
  children: ReactNode;
};

/** Frame of every dashboard page: back link, title, then the content. */
export function AdminPage({ title, description, back = { href: "/admin/dashboard", label: "Dashboard" }, actions, wide, children }: AdminPageProps) {
  return (
    <main className={`mx-auto px-6 py-10 ${wide ? "max-w-6xl" : "max-w-4xl"}`}>
      <Link href={back.href} className="text-sm text-muted hover:text-ink">
        ← {back.label}
      </Link>

      <header className="mt-4 mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-6">
        <div>
          <p className="mono-label text-xs text-steel">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted">{description}</p>}
        </div>
        {actions}
      </header>

      {children}
    </main>
  );
}

/** Loading text, or the error with a way back to sign-in. */
export function LoadState({ error }: { error: string | null }) {
  if (!error) return <p className="text-sm text-muted">Loading…</p>;
  return (
    <p className="text-sm text-signal">
      {error}{" "}
      <Link href="/admin/sign-in" className="underline">
        Sign in
      </Link>
    </p>
  );
}

/** A titled block inside a page. */
export function Panel({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-ink/10 bg-paper">
      <header className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-3">
        <h2 className="font-semibold">{title}</h2>
        {actions}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

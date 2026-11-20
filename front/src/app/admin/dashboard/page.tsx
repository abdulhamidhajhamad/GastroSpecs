import Link from "next/link";
import { SignOutButton } from "@/features/admin";

/**
 * Dashboard shell. The page itself has no auth check yet (kept open during setup);
 * the API routes behind it (change password, leads) do require a signed-in admin.
 */
const sections = [
  { href: "/admin/dashboard/agents", title: "AI agents", text: "The AI agents that work for GastroSpecs." },
  { href: "/admin/dashboard/products", title: "Products", text: "Manage catalog items, specs and photos." },
  { href: "/admin/dashboard/categories", title: "Categories", text: "Group products shown on the public catalog." },
  { href: "/admin/dashboard/quotes", title: "Quote requests", text: "Leads submitted through the public site." },
  { href: "/admin/dashboard/users", title: "Admin users", text: "Who can sign in to this dashboard." },
  { href: "/admin/dashboard/account", title: "Account", text: "Change your password." },
];

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex items-end justify-between border-b border-ink/10 pb-6">
        <div>
          <p className="mono-label text-xs text-steel">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold">GastroSpecs Admin</h1>
        </div>
        <SignOutButton />
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group border border-ink/10 bg-paper p-6 transition-colors hover:border-ink/40"
          >
            <h2 className="text-lg font-medium">{s.title}</h2>
            <p className="mt-2 text-sm text-muted">{s.text}</p>
            <span className="mono-label mt-6 inline-block text-xs text-signal">
              Open →
            </span>
          </Link>
        ))}
      </section>

      <p className="mono-label mt-12 text-xs text-steel">
        Auth guard not yet wired — any visitor can open this URL. Enable before deploying.
      </p>
    </main>
  );
}

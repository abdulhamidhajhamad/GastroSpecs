import Link from "next/link";
import { ChangePasswordForm } from "@/features/admin";

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/admin/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>

      <header className="mt-4 border-b border-ink/10 pb-6">
        <p className="mono-label text-xs text-steel">Dashboard</p>
        <h1 className="mt-1 text-3xl font-semibold">Account</h1>
      </header>

      <section className="mt-10 max-w-sm bg-paper p-8">
        <h2 className="text-lg font-medium">Change password</h2>
        <p className="mt-1 mb-6 text-sm text-muted">Only a secure hash of the new password is stored.</p>
        <ChangePasswordForm />
      </section>
    </main>
  );
}

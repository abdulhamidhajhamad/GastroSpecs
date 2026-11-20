import Link from "next/link";
import { CategoryImages } from "@/features/admin";

export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/admin/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>

      <header className="mt-4 mb-10 border-b border-ink/10 pb-6">
        <p className="mono-label text-xs text-steel">Dashboard</p>
        <h1 className="mt-1 text-3xl font-semibold">Categories</h1>
        <p className="mt-2 text-sm text-muted">JPEG, PNG, WebP or AVIF, up to 10 MB. A square photo works best.</p>
      </header>

      <CategoryImages />
    </main>
  );
}

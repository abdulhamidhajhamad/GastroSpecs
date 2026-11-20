"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Photo } from "@/shared/ui/Photo";
import { apiRequest, failureMessage } from "../api";

type AdminCategory = { id: string; slug: string; nameEn: string; nameAr: string; imageUrl: string | null };
type AdminCategoryNode = AdminCategory & { children: AdminCategory[] };

const ACCEPTED = "image/jpeg,image/png,image/webp,image/avif";

/** Lists every category with its image; each row can upload, replace or remove the image. */
export function CategoryImages() {
  const [tree, setTree] = useState<AdminCategoryNode[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await apiRequest<AdminCategoryNode[]>("/admin/catalog/categories", { auth: true });
    if (result.ok) setTree(result.data);
    else setError(failureMessage(result));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <p className="text-sm text-signal">
        {error}{" "}
        <Link href="/admin/sign-in" className="underline">
          Sign in
        </Link>
      </p>
    );
  }
  if (!tree) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="grid gap-10">
      {tree.map((main) => (
        <section key={main.id} className="border border-ink/10 bg-paper">
          <CategoryRow category={main} isMain onChange={load} />
          <ul className="divide-y divide-ink/10 border-t border-ink/10">
            {main.children.map((child) => (
              <li key={child.id}>
                <CategoryRow category={child} onChange={load} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function CategoryRow({ category, isMain = false, onChange }: { category: AdminCategory; isMain?: boolean; onChange: () => Promise<void> }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(request: () => ReturnType<typeof apiRequest<unknown>>) {
    setBusy(true);
    setError(null);
    const result = await request();
    if (result.ok) await onChange();
    else setError(failureMessage(result));
    setBusy(false);
  }

  const upload = (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return run(() => apiRequest(`/admin/catalog/categories/${category.id}/image`, { method: "PUT", body: form, auth: true }));
  };

  const remove = () => run(() => apiRequest(`/admin/catalog/categories/${category.id}/image`, { method: "DELETE", auth: true }));

  return (
    <div className={`flex items-center gap-4 p-4 ${isMain ? "bg-mist/60" : "ps-8"}`}>
      <div className="relative size-16 shrink-0 overflow-hidden bg-mist">
        {category.imageUrl ? (
          <Photo src={category.imageUrl} alt={category.nameEn} fill sizes="64px" className="object-cover" />
        ) : (
          <span className="mono-label absolute inset-0 grid place-items-center text-[0.625rem] text-steel">No image</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={isMain ? "font-semibold" : "font-medium"}>
          {category.nameEn} <span className="text-muted" dir="rtl">· {category.nameAr}</span>
        </p>
        <p className="mono-label text-[0.6875rem] text-steel">{category.slug}</p>
        {error && <p className="mt-1 text-sm text-signal">{error}</p>}
      </div>

      <input
        ref={input}
        type="file"
        accept={ACCEPTED}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) upload(file);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="border border-ink px-3 py-1.5 text-sm transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
      >
        {busy ? "Saving…" : category.imageUrl ? "Replace" : "Upload"}
      </button>
      {category.imageUrl && (
        <button type="button" disabled={busy} onClick={remove} className="text-sm text-muted hover:text-signal disabled:opacity-50">
          Remove
        </button>
      )}
    </div>
  );
}

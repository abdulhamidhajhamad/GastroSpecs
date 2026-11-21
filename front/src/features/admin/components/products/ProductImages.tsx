"use client";

import { useRef, useState } from "react";
import { Photo } from "@/shared/ui/Photo";
import { apiDelete, apiRequest, failureMessage } from "../../api";
import { Panel } from "../AdminPage";
import { buttonStyles } from "../Field";

const ACCEPTED = "image/jpeg,image/png,image/webp,image/avif";

/** A product's photos: the first one is the main photo on the site. Several files can be added at once. */
export function ProductImages({ productId, images, onChange }: { productId: string; images: { id: string; url: string }[]; onChange: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: File[]) {
    setBusy(true);
    setError(null);
    // One at a time keeps the photos in the order they were picked.
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      const result = await apiRequest(`/admin/catalog/products/${productId}/images`, { method: "POST", body: form });
      if (!result.ok) {
        setError(`${file.name}: ${failureMessage(result)}`);
        break;
      }
    }
    setBusy(false);
    onChange();
  }

  async function remove(imageId: string) {
    setBusy(true);
    const result = await apiDelete(`/admin/catalog/products/${productId}/images/${imageId}`);
    setBusy(false);
    if (result.ok) onChange();
    else setError(failureMessage(result));
  }

  return (
    <Panel
      title={`Photos (${images.length})`}
      actions={
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className={buttonStyles.outline}>
          {busy ? "Working…" : "Add photos"}
        </button>
      }
    >
      <input
        ref={input}
        type="file"
        accept={ACCEPTED}
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) upload(files);
        }}
      />
      {error && <p className="mb-4 text-sm text-signal">{error}</p>}
      {images.length === 0 ? (
        <p className="text-sm text-muted">No photos yet. White background, JPEG/PNG/WebP/AVIF, up to 10 MB.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {images.map((image, i) => (
            <li key={image.id} className="grid gap-2">
              <div className="relative aspect-square overflow-hidden border border-ink/10 bg-white">
                <Photo src={image.url} alt="" fill sizes="200px" className="object-contain" />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">{i === 0 ? "Main photo" : `#${i + 1}`}</span>
                <button type="button" disabled={busy} onClick={() => remove(image.id)} className={buttonStyles.danger}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

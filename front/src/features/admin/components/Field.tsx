import type { InputHTMLAttributes } from "react";

/** Labelled input used by every admin form. */
export function Field({ label, ...input }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <input {...input} className="border border-ink/20 bg-paper px-3 py-2 outline-none focus:border-ink" />
    </label>
  );
}

export function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

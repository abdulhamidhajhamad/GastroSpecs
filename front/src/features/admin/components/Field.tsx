import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/** Form controls and button styles shared by every admin screen. */

const control = "border border-ink/20 bg-paper px-3 py-2 outline-none focus:border-ink";

export const buttonStyles = {
  primary: "bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-60",
  outline: "border border-ink px-3 py-1.5 text-sm transition-colors hover:bg-ink hover:text-paper disabled:opacity-50",
  quiet: "text-sm text-muted hover:text-ink disabled:opacity-50",
  danger: "text-sm text-muted hover:text-signal disabled:opacity-50",
};

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      {children}
    </label>
  );
}

/** Labelled input used by every admin form. */
export function Field({ label, ...input }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <Labelled label={label}>
      <input {...input} className={control} />
    </Labelled>
  );
}

export function TextArea({ label, ...input }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <Labelled label={label}>
      <textarea rows={4} {...input} className={control} />
    </Labelled>
  );
}

export function SelectField({ label, children, ...select }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <Labelled label={label}>
      <select {...select} className={control}>
        {children}
      </select>
    </Labelled>
  );
}

export function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button type="submit" disabled={loading} className={`mt-2 ${buttonStyles.primary}`}>
      {loading ? loadingLabel : label}
    </button>
  );
}

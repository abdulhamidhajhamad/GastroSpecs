"use client";

import { useState, type FormEvent } from "react";
import type { ApiResult } from "../api";
import { failureMessage } from "../api";
import { buttonStyles, Field, TextArea } from "./Field";

export type FieldDef<K extends string> = {
  name: K;
  label: string;
  type?: "text" | "email" | "url" | "tel";
  multiline?: boolean;
  required?: boolean;
  /** Takes the full row instead of half of it. */
  wide?: boolean;
};

type RecordFormProps<K extends string> = {
  fields: FieldDef<K>[];
  initial?: Partial<Record<K, string | null>>;
  submitLabel: string;
  /** Receives every field as text; the API turns "" into "empty". */
  onSubmit: (values: Record<K, string>) => Promise<ApiResult<unknown>>;
  /** Called after a successful save, e.g. to reload or close. */
  onSaved?: () => void;
  onCancel?: () => void;
  /** Empties the form after saving (for "add another" forms). */
  resetOnSave?: boolean;
};

const valuesFrom = <K extends string>(fields: FieldDef<K>[], initial: Partial<Record<K, string | null>> = {}) =>
  Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? ""])) as Record<K, string>;

/** A form described by a list of fields: the supplier and contact forms are both this, with different fields. */
export function RecordForm<K extends string>({ fields, initial, submitLabel, onSubmit, onSaved, onCancel, resetOnSave }: RecordFormProps<K>) {
  const [values, setValues] = useState(() => valuesFrom(fields, initial));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await onSubmit(values);
    setBusy(false);
    if (!result.ok) return setMessage({ error: true, text: failureMessage(result) });

    if (resetOnSave) setValues(valuesFrom(fields));
    else setMessage({ error: false, text: "Saved." });
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {fields.map(({ name, label, type = "text", multiline, required, wide }) => {
        const common = { label, required, value: values[name], onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [name]: e.target.value })) };
        return (
          <div key={name} className={wide || multiline ? "sm:col-span-2" : undefined}>
            {multiline ? <TextArea {...common} /> : <Field {...common} type={type} />}
          </div>
        );
      })}

      <div className="flex items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={busy} className={buttonStyles.primary}>
          {busy ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonStyles.quiet}>
            Cancel
          </button>
        )}
        {message && <p className={`text-sm ${message.error ? "text-signal" : "text-muted"}`}>{message.text}</p>}
      </div>
    </form>
  );
}

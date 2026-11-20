"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { apiPost, PASSWORD_MIN_LENGTH } from "../api";
import { Field, SubmitButton } from "./Field";

const EMPTY = { current: "", next: "", confirm: "" };

/** Sends the current and new password; the backend checks the current one and stores only a hash of the new one. */
export function ChangePasswordForm() {
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState<{ kind: "error" | "done" | "signedOut"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (values.next !== values.confirm) {
      setStatus({ kind: "error", message: "The new passwords do not match." });
      return;
    }

    setLoading(true);
    setStatus(null);
    const result = await apiPost("/auth/change-password", { currentPassword: values.current, newPassword: values.next });
    setLoading(false);

    if (result.ok) {
      setValues(EMPTY);
      setStatus({ kind: "done", message: "Password changed." });
    } else if (result.status === 401) {
      setStatus({ kind: "signedOut", message: "Your session has ended. Sign in again, then retry." });
    } else {
      setStatus({ kind: "error", message: result.message });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field
        label="Current password"
        type="password"
        required
        autoComplete="current-password"
        value={values.current}
        onChange={update("current")}
      />
      <Field
        label={`New password (at least ${PASSWORD_MIN_LENGTH} characters)`}
        type="password"
        required
        minLength={PASSWORD_MIN_LENGTH}
        autoComplete="new-password"
        value={values.next}
        onChange={update("next")}
      />
      <Field
        label="Confirm new password"
        type="password"
        required
        autoComplete="new-password"
        value={values.confirm}
        onChange={update("confirm")}
      />

      {status && (
        <p className={status.kind === "done" ? "text-sm text-green-700" : "text-sm text-signal"}>
          {status.message}{" "}
          {status.kind === "signedOut" && (
            <Link href="/admin/sign-in" className="underline">
              Sign in
            </Link>
          )}
        </p>
      )}

      <SubmitButton loading={loading} label="Change password" loadingLabel="Saving…" />
    </form>
  );
}

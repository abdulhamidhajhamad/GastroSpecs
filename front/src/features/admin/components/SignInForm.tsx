"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiPost, session } from "../api";
import { Field, SubmitButton } from "./Field";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await apiPost<{ accessToken: string }>("/auth/sign-in", { email, password });
    setLoading(false);

    if (!result.ok) {
      setError(result.status === 401 ? "Invalid email or password." : result.message);
      return;
    }
    session.set(result.data.accessToken);
    router.push("/admin/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
      <Field label="Email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-signal">{error}</p>}
      <SubmitButton loading={loading} label="Sign in" loadingLabel="Signing in…" />
    </form>
  );
}

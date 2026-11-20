"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../api";

/**
 * Shows the dashboard only after the API confirms the session (GET /auth/me), otherwise goes to sign-in.
 * This hides the screens; the real protection is the API itself, which refuses every admin call without
 * a valid session cookie.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    apiRequest("/auth/me").then((result) => {
      if (result.ok) setAllowed(true);
      else router.replace("/admin/sign-in");
    });
  }, [router]);

  if (!allowed) return <p className="px-6 py-10 text-sm text-muted">Checking your session…</p>;
  return children;
}

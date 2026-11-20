"use client";

import { useRouter } from "next/navigation";
import { apiPost } from "../api";

/** Asks the API to clear the session cookie, then goes back to sign-in. */
export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await apiPost("/auth/sign-out");
        router.replace("/admin/sign-in");
      }}
      className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
    >
      Sign out
    </button>
  );
}

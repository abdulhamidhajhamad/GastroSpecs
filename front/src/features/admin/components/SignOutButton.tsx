"use client";

import { useRouter } from "next/navigation";
import { session } from "../api";

/** Forgets the token on this device, then goes back to sign-in. */
export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        session.clear();
        router.push("/admin/sign-in");
      }}
      className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
    >
      Sign out
    </button>
  );
}

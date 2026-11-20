import type { ReactNode } from "react";
import { RequireAdmin } from "@/features/admin";

/** Every page under /admin/dashboard requires a signed-in admin. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}

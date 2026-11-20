import { redirect } from "next/navigation";

/** Entering /admin sends to the dashboard. Auth guard will be added later. */
export default function AdminIndex() {
  redirect("/admin/dashboard");
}

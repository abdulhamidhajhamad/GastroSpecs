import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/shared/config/fonts";
import "../globals.css";

/**
 * Admin shell — no public header, no footer, no locale routing.
 * Lives outside /[locale] on purpose: it's an internal tool, not part of the marketing site.
 * `noindex` keeps it out of search engines even if the URL leaks.
 * We render the full <html>/<body> here because /admin bypasses the [locale] layout.
 */
export const metadata: Metadata = {
  title: "GastroSpecs Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body className="min-h-screen bg-mist text-ink antialiased">{children}</body>
    </html>
  );
}

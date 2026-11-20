"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/lib/cn";

/** Switches between English and Arabic while staying on the same page. */
export function LocaleSwitcher({ label, className }: { label: string; className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const target = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={pathname}
      locale={target}
      lang={target}
      hrefLang={target}
      className={cn(
        "mono-label inline-flex h-10 items-center px-2 text-xs text-steel transition-colors hover:text-paper",
        className,
      )}
    >
      {label}
    </Link>
  );
}

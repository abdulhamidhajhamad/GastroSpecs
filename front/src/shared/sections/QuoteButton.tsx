"use client";

import type { ReactNode } from "react";
import { ctaClass } from "@/shared/ui/ButtonLink";
import { useQuote } from "./QuoteProvider";

type QuoteButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "outlineDark";
  size?: "sm" | "md";
  /** Runs before the dialog opens, e.g. to close the mobile menu. */
  onClick?: () => void;
};

/** Opens the quote popup in place (no scroll). Works anywhere under <QuoteProvider>. */
export function QuoteButton({ children, className, variant = "primary", size = "md", onClick }: QuoteButtonProps) {
  const open = useQuote();
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        open();
      }}
      className={ctaClass(variant, size, className)}
    >
      {children}
    </button>
  );
}

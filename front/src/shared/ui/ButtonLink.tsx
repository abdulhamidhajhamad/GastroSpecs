import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

const base =
  "inline-flex shrink-0 items-center justify-center gap-3 font-display font-extrabold tracking-[0.06em] uppercase [font-stretch:125%] transition-colors duration-200 rtl:tracking-normal";

const variants = {
  primary: "bg-signal text-paper hover:bg-signal-dark",
  outline: "border border-current hover:bg-paper hover:text-ink",
  outlineDark: "border border-ink text-ink hover:bg-ink hover:text-paper",
} as const;

const sizes = {
  sm: "h-10 px-4 text-[0.6875rem]",
  md: "h-12 px-6 text-xs sm:h-14 sm:px-8",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

/** Brand call-to-action classes. Shared by <ButtonLink> (links) and real <button> elements. */
export function ctaClass(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonLinkProps = ComponentProps<"a"> & { variant?: Variant; size?: Size };

/**
 * Brand call-to-action link: Archivo Expanded, uppercase, square corners.
 * A plain <a> on purpose: used for in-page anchors and external links (WhatsApp, mail).
 */
export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return <a className={ctaClass(variant, size, className)} {...props} />;
}

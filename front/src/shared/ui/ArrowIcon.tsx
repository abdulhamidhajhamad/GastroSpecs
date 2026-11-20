import type { SVGProps } from "react";
import { cn } from "@/shared/lib/cn";

/** Arrow pointing "forward" in reading direction (flips automatically in RTL). */
export function ArrowIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
      className={cn("size-4 rtl:-scale-x-100", className)}
      {...props}
    >
      <path d="M4 12h16m-6-6 6 6-6 6" strokeLinecap="square" />
    </svg>
  );
}

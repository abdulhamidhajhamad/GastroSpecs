import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  /** Optional element shown at the end of the header row on large screens (e.g. a link). */
  aside?: ReactNode;
  className?: string;
};

export function SectionHeader({ eyebrow, title, lead, aside, className }: SectionHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-3xl">
        <p className="eyebrow text-muted">{eyebrow}</p>
        <h2 className="mt-5 text-3xl leading-[1.1] sm:text-4xl lg:text-5xl">{title}</h2>
        {lead && <p className="text-muted mt-5 max-w-2xl text-base sm:text-lg">{lead}</p>}
      </div>
      {aside}
    </header>
  );
}

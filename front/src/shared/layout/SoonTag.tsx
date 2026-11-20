import { cn } from "@/shared/lib/cn";

/** Small "Soon" tag next to a navigation label. */
export function SoonTag({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "mono-label inline-block border border-graphite px-1.5 py-0.5 align-middle text-[0.5625rem] leading-none font-normal text-steel",
        className,
      )}
    >
      {label}
    </span>
  );
}

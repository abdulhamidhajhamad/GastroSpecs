import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Container } from "./Container";

const tones = {
  light: "bg-paper text-ink",
  muted: "bg-mist text-ink",
  dark: "bg-ink text-paper",
} as const;

export type Tone = keyof typeof tones;

type SectionProps = {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
};

/** Page section with consistent vertical rhythm. `data-tone` lets children adapt colors. */
export function Section({ id, tone = "light", className, children }: SectionProps) {
  return (
    <section
      id={id}
      data-tone={tone}
      className={cn("scroll-mt-16 py-20 sm:py-28 lg:py-32", tones[tone], className)}
    >
      <Container>{children}</Container>
    </section>
  );
}

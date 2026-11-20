import type { ReactNode } from "react";
import { Container } from "./Container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
};

/** Opening block of inner pages (about, services, brand): black panel, page H1, short lead. */
export function PageHero({ eyebrow, title, lead, children }: PageHeroProps) {
  return (
    <section data-tone="dark" className="bg-ink text-paper">
      <Container className="py-20 sm:py-28 lg:py-32">
        <p className="eyebrow text-steel">{eyebrow}</p>
        <h1 className="mt-6 max-w-4xl text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h1>
        {lead && <p className="mt-6 max-w-2xl text-base text-steel sm:text-lg">{lead}</p>}
        {children}
      </Container>
    </section>
  );
}

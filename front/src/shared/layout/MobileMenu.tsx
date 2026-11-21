"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { pad } from "@/shared/lib/format";
import { ContactButton, QuoteButton } from "@/shared/sections/QuoteButton";
import type { NavLink } from "./nav";
import { SoonTag } from "./SoonTag";

type MobileMenuProps = {
  links: NavLink[];
  quoteLabel: string;
  contactLabel: string;
  labels: { open: string; close: string; soon: string };
};

export function MobileMenu({ links, quoteLabel, contactLabel, labels }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.close : labels.open}
        className="-me-2 grid size-11 place-items-center"
      >
        <span className="relative block h-3 w-6" aria-hidden="true">
          <span
            className={cn(
              "absolute inset-x-0 top-0 h-0.5 bg-paper transition-transform duration-300",
              open && "translate-y-[5px] rotate-45",
            )}
          />
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 h-0.5 bg-paper transition-transform duration-300",
              open && "-translate-y-[5px] -rotate-45",
            )}
          />
        </span>
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-ink"
      >
        <nav className="flex min-h-full flex-col px-5 pt-6 pb-10 sm:px-8">
          <ul className="border-t border-graphite">
            {links.map((link, i) => (
              <li key={link.href} className="border-b border-graphite">
                <NextLink
                  href={link.href}
                  onClick={close}
                  className="flex items-center gap-4 py-5 font-display text-2xl font-extrabold [font-stretch:125%]"
                >
                  <span className="font-mono text-xs font-normal text-steel">{pad(i + 1)}</span>
                  {link.label}
                  {link.soon && <SoonTag label={labels.soon} />}
                </NextLink>
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-3 pt-8">
            <ContactButton variant="outline" onClick={close} className="w-full">
              {contactLabel}
            </ContactButton>
            <QuoteButton onClick={close} className="w-full">
              {quoteLabel}
            </QuoteButton>
          </div>
        </nav>
      </div>
    </div>
  );
}

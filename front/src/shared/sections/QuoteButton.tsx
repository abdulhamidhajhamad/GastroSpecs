"use client";

import type { ReactNode } from "react";
import { ctaClass } from "@/shared/ui/ButtonLink";
import { type LeadKind, useLeadDialog } from "./LeadDialogs";

type DialogButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "outlineDark";
  size?: "sm" | "md";
  /** Runs before the dialog opens, e.g. to close the mobile menu. */
  onClick?: () => void;
};

function DialogButton({ kind, children, className, variant = "primary", size = "md", onClick }: DialogButtonProps & { kind: LeadKind }) {
  const open = useLeadDialog(kind);
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

/** Opens the quote popup in place (no scroll). Works anywhere under <LeadDialogs>. */
export const QuoteButton = (props: DialogButtonProps) => <DialogButton kind="quote" {...props} />;

/** Opens the "Contact us" popup (name, phone, message). Works anywhere under <LeadDialogs>. */
export const ContactButton = (props: DialogButtonProps) => <DialogButton kind="contact" {...props} />;

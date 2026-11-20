import { twMerge } from "tailwind-merge";

/**
 * Joins class names, drops falsy values and resolves Tailwind conflicts,
 * so a caller's "hidden" correctly overrides a component's "inline-flex".
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(" "));
}

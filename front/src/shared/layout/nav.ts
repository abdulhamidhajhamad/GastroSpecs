import { mainNav } from "@/shared/config/site";
import { localeHref } from "@/shared/lib/routes";

export type NavKey = (typeof mainNav)[number]["key"];
export type NavLink = { href: string; label: string; soon?: boolean };

/** Localized links for the main navigation, shared by the header, mobile menu and footer. */
export function buildNav(locale: string, label: (key: NavKey) => string): NavLink[] {
  return mainNav.map((item) => ({
    href: localeHref(locale, item.href),
    label: label(item.key),
    soon: "soon" in item ? item.soon : undefined,
  }));
}

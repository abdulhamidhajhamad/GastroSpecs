/**
 * Adds the locale to a site path: "/about" -> "/ar/about", "/#sectors" -> "/ar#sectors", "/" -> "/ar".
 */
export function localeHref(locale: string, path: string): string {
  if (path === "/") return `/${locale}`;
  if (path.startsWith("/#")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

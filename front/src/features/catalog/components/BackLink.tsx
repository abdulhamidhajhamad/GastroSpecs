import { Link } from "@/i18n/navigation";
import { ArrowIcon } from "@/shared/ui/ArrowIcon";

/** "← Catalog" above a detail page. The arrow points backwards in both reading directions. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mono-label inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-ink">
      <ArrowIcon className="-scale-x-100 rtl:scale-x-100" />
      {label}
    </Link>
  );
}

import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/cn";

export type CatalogView = "business" | "equipment";

type CatalogTabsProps = {
  active: CatalogView;
  labels: Record<CatalogView, string>;
};

/**
 * The two ways to browse. Plain links (`?view=equipment`), so each view has its own shareable URL
 * and the page stays server-rendered with no client JavaScript.
 */
export function CatalogTabs({ active, labels }: CatalogTabsProps) {
  const tabs: { view: CatalogView; href: { pathname: "/catalog"; query?: { view: string } } }[] = [
    { view: "business", href: { pathname: "/catalog" } },
    { view: "equipment", href: { pathname: "/catalog", query: { view: "equipment" } } },
  ];

  return (
    <nav aria-label={`${labels.business} / ${labels.equipment}`} className="inline-flex border border-ink">
      {tabs.map(({ view, href }) => (
        <Link
          key={view}
          href={href}
          scroll={false}
          aria-current={view === active ? "page" : undefined}
          className={cn(
            "mono-label px-5 py-3 text-xs transition-colors sm:px-7",
            view === active ? "bg-ink text-paper" : "text-ink hover:bg-mist",
          )}
        >
          {labels[view]}
        </Link>
      ))}
    </nav>
  );
}

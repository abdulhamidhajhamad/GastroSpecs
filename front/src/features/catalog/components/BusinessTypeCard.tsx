import { Link } from "@/i18n/navigation";
import { ArrowIcon } from "@/shared/ui/ArrowIcon";

/** How many equipment names a card lists before "+N more", so long lists (Central kitchen) stay tidy. */
const PREVIEW_COUNT = 6;

type BusinessTypeCardProps = {
  href: string;
  title: string;
  equipment: string[];
  /** Label for the hidden rest, e.g. "+11 more". */
  moreLabel: (count: number) => string;
};

/** Text-only card for a business type: "Fried chicken equipment" and the equipment it includes. */
export function BusinessTypeCard({ href, title, equipment, moreLabel }: BusinessTypeCardProps) {
  const shown = equipment.slice(0, PREVIEW_COUNT);
  const hidden = equipment.length - shown.length;

  return (
    <li>
      <Link
        href={href}
        className="group flex h-full flex-col justify-between gap-8 border border-ink/10 bg-paper p-6 transition-colors hover:border-ink sm:p-7"
      >
        <div>
          <h3 className="text-xl leading-snug sm:text-2xl">{title}</h3>
          <p className="mono-label mt-4 text-xs leading-relaxed text-muted">
            {shown.join(" · ")}
            {hidden > 0 && <span className="text-steel"> · {moreLabel(hidden)}</span>}
          </p>
        </div>
        <ArrowIcon className="size-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
      </Link>
    </li>
  );
}

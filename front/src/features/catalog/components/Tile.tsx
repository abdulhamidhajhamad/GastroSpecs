import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowIcon } from "@/shared/ui/ArrowIcon";
import { Photo } from "@/shared/ui/Photo";

type TileProps = {
  href: ComponentProps<typeof Link>["href"];
  title: string;
  imageUrl: string | null;
  /** Shown in the image area until an image is uploaded. */
  placeholder: string;
  size?: "large" | "small";
};

/** Image card linking to a business type or a category. Used by every catalog grid, so they all match. */
export function Tile({ href, title, imageUrl, placeholder, size = "large" }: TileProps) {
  return (
    <li>
    <Link href={href} className="group flex h-full flex-col border border-ink/10 bg-paper transition-colors hover:border-ink">
      <div className={`relative w-full overflow-hidden bg-mist ${size === "large" ? "aspect-[4/3]" : "aspect-square"}`}>
        {imageUrl ? (
          <Photo
            src={imageUrl}
            alt={title}
            fill
            sizes={size === "large" ? "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" : "(min-width: 1024px) 18vw, 45vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="mono-label absolute inset-0 grid place-items-center text-[0.6875rem] text-steel">{placeholder}</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <h3 className={size === "large" ? "text-lg leading-snug" : "text-sm font-medium leading-snug"}>{title}</h3>
        <ArrowIcon />
      </div>
    </Link>
    </li>
  );
}

/** Responsive grid of tiles. `dense` fits more, smaller tiles per row. */
export function TileGrid({ dense = false, children }: { dense?: boolean; children: ReactNode }) {
  return (
    <ul className={`grid gap-4 sm:gap-6 ${dense ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {children}
    </ul>
  );
}

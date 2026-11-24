"use client";

import { useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Photo } from "@/shared/ui/Photo";

type Image = { url: string; alt: string };
type Labels = { previous: string; next: string; show: string };

/**
 * The product's photos as a slider: the first is the main photo, the rest (e.g. the dimension drawing)
 * follow. Native scroll-snap does the sliding, so swiping works on phones without any library; the arrows
 * and thumbnails just scroll to a slide.
 */
export function ProductGallery({ images, labels }: { images: Image[]; labels: Labels }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const many = images.length > 1;

  const go = (index: number) => {
    const el = track.current;
    if (!el) return;
    const i = (index + images.length) % images.length;
    // Logical position: in RTL the track scrolls with negative offsets.
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollTo({ left: (rtl ? -1 : 1) * i * el.clientWidth, behavior: "smooth" });
    setCurrent(i);
  };

  const onScroll = () => {
    const el = track.current;
    if (el) setCurrent(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };

  return (
    <div className="grid gap-4">
      <div className="relative border border-ink/10 bg-white">
        <div ref={track} onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, i) => (
            <div key={image.url} className="relative aspect-square w-full shrink-0 snap-center">
              <Photo src={image.url} alt={image.alt} fill priority={i === 0} sizes="(min-width: 1024px) 55vw, 100vw" className="object-contain p-8" />
            </div>
          ))}
        </div>
        {many && (
          <>
            <Arrow label={labels.previous} onClick={() => go(current - 1)} className="start-3" flip />
            <Arrow label={labels.next} onClick={() => go(current + 1)} className="end-3" />
          </>
        )}
      </div>

      {many && (
        <ul className="grid grid-cols-4 gap-4">
          {images.map((image, i) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`${labels.show} ${i + 1}`}
                aria-current={i === current}
                className={cn("relative block aspect-square w-full border bg-white transition-colors", i === current ? "border-ink" : "border-ink/10 hover:border-ink/40")}
              >
                <Photo src={image.url} alt="" fill sizes="(min-width: 1024px) 12vw, 25vw" className="object-contain p-2" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Arrow({ label, onClick, className, flip }: { label: string; onClick: () => void; className: string; flip?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn("absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center border border-ink/10 bg-paper/90 text-ink transition-colors hover:bg-ink hover:text-paper", className)}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true" className={cn("size-5 rtl:-scale-x-100", flip && "-scale-x-100 rtl:scale-x-100")}>
        <path d="M9 6l6 6-6 6" strokeLinecap="square" />
      </svg>
    </button>
  );
}

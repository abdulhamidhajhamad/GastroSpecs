"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { pad } from "@/shared/lib/format";
import { ArrowIcon } from "@/shared/ui/ArrowIcon";
import { QuoteButton } from "@/shared/sections/QuoteButton";
import { Container } from "@/shared/ui/Container";
import { Photo } from "@/shared/ui/Photo";

/** Time each slide stays on screen. The progress bar animation drives the autoplay. */
const SLIDE_MS = 7000;
const SWIPE_PX = 50;
/**
 * Hero photos are square. Below desktop the box is as wide as the screen and never taller, so the photo
 * is as wide as the screen. On desktop the panel can be taller than it is wide, and then the photo is as
 * wide as the panel is tall (the screen height, up to the section's 62rem limit).
 */
const PHOTO_RATIO = 1;
const PHOTO_SIZES = "(min-width: 1024px) max(56vw, min(100vh, 62rem)), 100vw";

export type HeroSlide = {
  key: string;
  src: string;
  alt: string;
  title: string;
  items: string;
};

type HeroSliderProps = {
  id: string;
  heading: string;
  cta: { label: string };
  slides: HeroSlide[];
  isRtl: boolean;
  labels: { region: string; slide: string; prev: string; next: string; pause: string; play: string };
};

/**
 * Sector slider. The photo carries the message: text stays short and overlays only darken the edges.
 */
export function HeroSlider({ id, heading, cta, slides, isRtl, labels }: HeroSliderProps) {
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Only images that have been (or are about to be) shown are mounted, to keep the first load light.
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));
  const swipeStart = useRef<number | null>(null);

  const goTo = useCallback((i: number) => setActive(((i % count) + count) % count), [count]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const next = (active + 1) % count;
    setMounted((prev) => (prev.has(active) && prev.has(next) ? prev : new Set([...prev, active, next])));
  }, [active, count]);

  const autoplay = !paused && !reducedMotion;

  const onSwipeEnd = (clientX: number) => {
    if (swipeStart.current === null) return;
    const dx = clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    const forward = isRtl ? dx > 0 : dx < 0;
    goTo(active + (forward ? 1 : -1));
  };

  return (
    <section
      id={id}
      aria-roledescription="carousel"
      aria-label={labels.region}
      className="relative isolate flex touch-pan-y flex-col overflow-hidden bg-ink text-paper lg:h-[calc(100svh-4rem)] lg:max-h-[62rem] lg:min-h-[40rem] lg:justify-end"
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") swipeStart.current = e.clientX;
      }}
      onPointerUp={(e) => onSwipeEnd(e.clientX)}
      onPointerCancel={() => (swipeStart.current = null)}
    >
      {/*
        Photos: a framed block on phones, a large panel on the end side from desktop up (text sits on black
        at the start side). Photos are shown close to their real size, so they stay sharp instead of being
        stretched across the whole screen.
      */}
      <div className="relative aspect-square w-full sm:aspect-[4/3] md:aspect-[16/10] lg:absolute lg:inset-y-0 lg:end-0 lg:-z-10 lg:aspect-auto lg:w-[56%]">
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            aria-hidden={i !== active}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1200ms] ease-out motion-reduce:transition-none",
              i === active ? "opacity-100" : "opacity-0",
            )}
          >
            {mounted.has(i) && (
              <Photo
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                cropRatio={PHOTO_RATIO}
                sizes={PHOTO_SIZES}
                quality={85}
                className="object-cover"
              />
            )}
          </div>
        ))}
        {/* Light overlays only at the edges: blend into black, keep the equipment bright. */}
        <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink to-transparent lg:h-36 lg:from-ink/80" />
        <div className="absolute inset-y-0 hidden w-1/4 from-ink to-transparent lg:block ltr:left-0 ltr:bg-linear-to-r rtl:right-0 rtl:bg-linear-to-l" />
      </div>

      {/* Text */}
      <Container className="relative -mt-10 sm:-mt-16 lg:mt-0">
        {/* On desktop the text column stays on the black side, clear of the photo panel. */}
        <div className="lg:max-w-md xl:max-w-lg">
          <h1 className="eyebrow text-steel">{heading}</h1>

          {/* All titles share one grid cell, so the height never jumps between slides. */}
          <div className="mt-4 grid sm:mt-5">
            {slides.map((slide, i) => (
              <div
                key={slide.key}
                aria-hidden={i !== active}
                className={cn(
                  "[grid-area:1/1] transition-[opacity,translate] duration-700 ease-out motion-reduce:transition-none",
                  i === active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
                )}
              >
                <h2 className="text-[2.5rem] leading-[1.02] sm:text-6xl lg:text-5xl xl:text-[3.5rem]">{slide.title}</h2>
                <p className="mono-label mt-4 text-xs leading-relaxed text-steel sm:text-sm">{slide.items}</p>
              </div>
            ))}
          </div>

          <QuoteButton className="mt-8 w-full sm:w-auto">
            {cta.label}
            <ArrowIcon />
          </QuoteButton>
        </div>
      </Container>

      {/* Controls */}
      <Container className="relative pt-8 pb-5 sm:pt-10 sm:pb-8">
        <div className="flex items-center gap-4 lg:gap-8">
          <ol className="grid flex-1 gap-2 sm:gap-4" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
            {slides.map((slide, i) => {
              const isActive = i === active;
              return (
                <li key={slide.key}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`${labels.slide} ${i + 1}: ${slide.title}`}
                    aria-current={isActive}
                    className="group block w-full py-3 text-start"
                  >
                    <span className="block h-0.5 overflow-hidden bg-paper/25">
                      <span
                        key={isActive ? `run-${active}` : "idle"}
                        onAnimationEnd={isActive ? () => goTo(active + 1) : undefined}
                        className={cn(
                          "block h-full origin-left bg-paper rtl:origin-right",
                          isActive && autoplay && "animate-progress",
                          isActive && reducedMotion && "scale-x-100",
                          !isActive && "scale-x-0 group-hover:scale-x-100 group-hover:bg-paper/50",
                        )}
                        style={
                          isActive
                            ? { animationDuration: `${SLIDE_MS}ms`, animationPlayState: autoplay ? "running" : "paused" }
                            : undefined
                        }
                      />
                    </span>
                    <span className="mono-label mt-3 hidden gap-2 text-[0.6875rem] lg:flex">
                      <span className="text-steel">{pad(i + 1)}</span>
                      <span className={cn("truncate transition-colors", isActive ? "text-paper" : "text-steel")}>
                        {slide.title}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="flex shrink-0 items-center">
            <ControlButton label={labels.prev} onClick={() => goTo(active - 1)}>
              <path d="M15 6l-6 6 6 6" className="rtl:hidden" />
              <path d="M9 6l6 6-6 6" className="ltr:hidden" />
            </ControlButton>
            <ControlButton label={paused ? labels.play : labels.pause} onClick={() => setPaused((p) => !p)}>
              {paused ? <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" /> : <path d="M9 6v12M15 6v12" />}
            </ControlButton>
            <ControlButton label={labels.next} onClick={() => goTo(active + 1)}>
              <path d="M9 6l6 6-6 6" className="rtl:hidden" />
              <path d="M15 6l-6 6 6 6" className="ltr:hidden" />
            </ControlButton>
          </div>
        </div>

        <p className="mono-label mt-1 text-[0.6875rem] text-steel lg:hidden" aria-live="polite">
          <span dir="ltr">
            {pad(active + 1)} / {pad(count)}
          </span>
        </p>
      </Container>
    </section>
  );
}

function ControlButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-10 place-items-center text-steel transition-colors hover:text-paper"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

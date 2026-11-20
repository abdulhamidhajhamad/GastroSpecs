"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";
import { siteConfig } from "@/shared/config/site";

/**
 * Unsplash's CDN resizes, crops and serves AVIF/WebP itself, so the browser loads it directly (no extra hop).
 * `ratio` is width / height; without it the photo keeps its own shape.
 */
const unsplashLoader =
  (ratio?: number): ImageLoader =>
  ({ src, width, quality }) => {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    if (ratio) url.searchParams.set("h", String(Math.round(width / ratio)));
    url.searchParams.set("q", String(quality ?? 70));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    return url.toString();
  };

/**
 * How each source is delivered:
 * - Local files (/public) and uploaded catalog images (R2): optimized by Next.js (resized, AVIF/WebP).
 * - Unsplash: resized (and cropped, if asked) by its own CDN.
 * - Any other remote URL: served as-is.
 */
function delivery(src: ImageProps["src"], cropRatio?: number): Partial<ImageProps> {
  if (typeof src !== "string") return {};
  if (src.startsWith(`${siteConfig.mediaUrl}/`)) return {};
  if (src.startsWith("https://images.unsplash.com/")) return { loader: unsplashLoader(cropRatio) };
  if (src.startsWith("http")) return { unoptimized: true };
  return {};
}

type PhotoProps = ImageProps & {
  /**
   * Shape (width / height) of the box the photo fills, e.g. 1 for a square. The CDN then sends that
   * crop, so every downloaded pixel is shown and `sizes` can simply describe the box. Without it, a
   * wide photo in a tall box is scaled up by its height and looks soft. Local files are used as they
   * are: save them in the shape of their box.
   */
  cropRatio?: number;
};

/** The only image component the site uses. */
export function Photo({ alt, cropRatio, ...props }: PhotoProps) {
  return <Image alt={alt} {...props} {...delivery(props.src, cropRatio)} />;
}

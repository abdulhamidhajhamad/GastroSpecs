import type { NextConfig } from "next";
import { siteConfig } from "./src/shared/config/site";

/**
 * next-intl is wired by aliasing `next-intl/config` to our request config, which is exactly what
 * `createNextIntlPlugin` does for Turbopack. We set the alias directly and skip the plugin on purpose:
 * the plugin eagerly loads `@swc/core` (only needed for the message-declaration feature we don't use),
 * and its native binary can be blocked by Windows Smart App Control / Application Control policies.
 * Both `dev` and `build` scripts run with `--turbopack`, so the Turbopack alias is all that's needed.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The floating "N" badge in development. It never appears in production builds.
  devIndicators: false,
  images: {
    // Local images and our own R2 media are resized and converted here. Other remote images: see shared/ui/Photo.tsx.
    formats: ["image/avif", "image/webp"],
    qualities: [65, 70, 75, 85],
    remotePatterns: [{ protocol: "https", hostname: new URL(siteConfig.mediaUrl).hostname }],
  },
  /** Browser security headers on every page. */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Only HTTPS from now on (two years, subdomains too).
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          // Nobody may show the site inside a frame (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      "next-intl/config": "./src/i18n/request.ts",
    },
  },
};

export default nextConfig;

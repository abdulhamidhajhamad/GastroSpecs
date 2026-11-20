import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";

/** Brand display + body font. The variable width axis gives us "Archivo Expanded". */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** Brand technical voice: labels, specs, contact details. */
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

/** Arabic companion from the same IBM Plex family. Only downloaded when Arabic glyphs render. */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
});

export const fontVariables = [archivo.variable, plexMono.variable, plexArabic.variable].join(" ");

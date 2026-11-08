import { Major_Mono_Display, Martian_Mono } from "next/font/google";

/**
 * The Lattice's two faces. Martian Mono, a wide, engineered monospace with
 * Cyrillic built in (so half the garbled letters stay in the same face), for
 * everything you read. Major Mono Display, whose letters can't decide between
 * upper and lower case, for the few words the machines say out loud. Shared
 * by the window, its row in the sidebar and the scene.
 */
export const martian = Martian_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mx-mono",
  axes: ["wdth"],
  display: "swap",
});

export const major = Major_Mono_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mx-display",
  display: "swap",
});

/** Both, for a className. */
export const mxFonts = `${martian.variable} ${major.variable}`;

import { Fraunces, Nunito } from "next/font/google";

/**
 * WorkshopChat's two faces: Fraunces, soft and a little wonky, for the
 * storybook headings, and Nunito, round and friendly, for everything you read.
 * The handwriting on the tags is Caveat, loaded for the whole site. Shared by
 * the window and its row in the sidebar.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-elf-display",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

export const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-elf-body",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

/** Both, for a className. */
export const elfFonts = `${fraunces.variable} ${nunito.variable}`;

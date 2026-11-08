import { DM_Mono, DM_Sans, DM_Serif_Display } from "next/font/google";

/**
 * The high-limit room's three faces, one family: DM Serif Display for the
 * name on the cabinet and the headings, DM Sans for everything you read, and
 * DM Mono for the token count and code. Shared by the window, its row in the
 * sidebar, the scene and the song player.
 */
export const hlDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-hl-display",
  display: "swap",
});

export const hlBody = DM_Sans({ subsets: ["latin"], variable: "--font-hl-body", display: "swap" });

export const hlMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-hl-mono", display: "swap" });

/** All three, for a className. */
export const hlFonts = `${hlDisplay.variable} ${hlBody.variable} ${hlMono.variable}`;

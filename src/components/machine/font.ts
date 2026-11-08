import { Geist_Mono } from "next/font/google";

/**
 * The Machine's one face: Geist Mono, with its Cyrillic and extra symbols, so
 * machinespeak (half its letters borrowed from other alphabets) stays in the
 * same clean mono instead of falling back mid-word. Greek, kana and kanji
 * come from the system. Shared by the window and its row in the sidebar.
 */
export const mxMono = Geist_Mono({
  subsets: ["latin", "cyrillic", "symbols2"],
  variable: "--font-mx-mono",
  display: "swap",
});

export const mxFonts = mxMono.variable;

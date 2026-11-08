import { Michroma, Share_Tech_Mono } from "next/font/google";

/**
 * The cabinet's lettering. Michroma is a wide, squared face in the spirit of
 * Eurostile, the typeface on half the computer hardware of the 1980s: the
 * nameplate and the button lenses. Share Tech Mono is the small stenciled
 * print: panel labels, the intrusion map, serial numbers. The console itself
 * uses VT323, loaded for the whole site. Shared by the window and its row in
 * the sidebar.
 */
export const plate = Michroma({ weight: "400", subsets: ["latin"], variable: "--font-mf-plate", display: "swap" });

export const stencil = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-mf-label", display: "swap" });

/** Both, for a className. */
export const mfFonts = `${plate.variable} ${stencil.variable}`;

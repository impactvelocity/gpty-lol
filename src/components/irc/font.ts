import { DotGothic16 } from "next/font/google";

/**
 * The chat text: a crisp bitmap face in the spirit of Fixedsys, mIRC's
 * default. Windows machines that still have Fixedsys get the real thing
 * first (see --irc-mono in irc.css). Shared by the window and its row in the
 * sidebar.
 */
export const pixel = DotGothic16({ weight: "400", subsets: ["latin"], variable: "--font-irc-pixel", display: "swap" });

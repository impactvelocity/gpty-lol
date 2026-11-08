import { Exo_2, Mr_Dafoe, Press_Start_2P } from "next/font/google";

/**
 * Firewall Fury's three faces, straight off a 1985 VHS cover. Exo 2, heavy
 * and italic, is the chrome lettering, and its lighter weights are everything
 * you read. Mr Dafoe is the hot-pink brush script slashed across the title.
 * Press Start 2P is the arcade pixel face for the small tags and the high-score
 * table in the backdrop. The terminal itself uses VT323, loaded for the whole
 * site. Shared by the window, its row in the sidebar, the scene and the song
 * player.
 */
export const chrome = Exo_2({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-fy-chrome", display: "swap" });

export const brush = Mr_Dafoe({ subsets: ["latin"], weight: "400", variable: "--font-fy-brush", display: "swap" });

export const arcade = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-fy-arcade", display: "swap" });

/** All three, for a className. */
export const fyFonts = `${chrome.variable} ${brush.variable} ${arcade.variable}`;

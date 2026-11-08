import { Bungee, Monoton, Outfit, Share_Tech_Mono } from "next/font/google";

/**
 * The casino's four faces. Monoton, all neon tubing, for the marquee; Bungee,
 * the signage face, for buttons, banners and labels; Outfit, round and clean,
 * for everything you read; Share Tech Mono for the LED meters and code.
 * Shared by the window, its row in the sidebar and the scene.
 */
export const monoton = Monoton({ subsets: ["latin"], weight: "400", variable: "--font-lk-neon", display: "swap" });

export const bungee = Bungee({ subsets: ["latin"], weight: "400", variable: "--font-lk-sign", display: "swap" });

export const outfit = Outfit({ subsets: ["latin"], variable: "--font-lk-body", display: "swap" });

export const shareTech = Share_Tech_Mono({ subsets: ["latin"], weight: "400", variable: "--font-lk-mono", display: "swap" });

/** All four, for a className. */
export const slFonts = `${monoton.variable} ${bungee.variable} ${outfit.variable} ${shareTech.variable}`;

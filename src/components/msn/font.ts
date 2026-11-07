import { Open_Sans } from "next/font/google";

/**
 * Segoe UI's open-source sibling (same designer), for screens without Segoe.
 * Shared by the MSN window and its row in the sidebar.
 */
export const segoe = Open_Sans({ subsets: ["latin"], variable: "--font-msn", display: "swap" });

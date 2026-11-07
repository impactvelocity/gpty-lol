import { Nunito } from "next/font/google";

/** Body text is Segoe UI, with the same open-source stand-in the MSN window uses. */
export { segoe } from "@/components/msn/font";

/**
 * A soft, rounded display face for names, buttons and headings: close to the
 * bubbly lettering of the 2007 cloud logo, without being it.
 */
export const rounded = Nunito({ subsets: ["latin"], variable: "--font-skype-round", display: "swap" });

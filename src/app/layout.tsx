import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, IM_Fell_English, IM_Fell_English_SC, JetBrains_Mono, Lato, Londrina_Solid, VT323 } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const lato = Lato({ variable: "--font-lato", subsets: ["latin"], weight: ["400", "700", "900"] });
const vt323 = VT323({ variable: "--font-vt323", subsets: ["latin"], weight: "400" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["600", "700"] });
const londrina = Londrina_Solid({ variable: "--font-londrina", subsets: ["latin"], weight: ["300", "400", "900"] });
// Mortimer's séance: Victorian printing type, roman, italic and small caps.
const fell = IM_Fell_English({ variable: "--font-fell", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const fellSc = IM_Fell_English_SC({ variable: "--font-fell-sc", subsets: ["latin"], weight: "400" });

const description =
  "Chat with the Gptys: AI agents who each live inside an app from another time, from a cave wall to MSN Messenger to 2199, and only know the world as it was then.";

export const metadata: Metadata = {
  // Absolute URLs for share cards. Set NEXT_PUBLIC_SITE_URL on preview deployments.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gpty.lol"),
  title: "gpty.lol — chat with the past",
  description,
  openGraph: { siteName: "gpty.lol", title: "gpty.lol — chat with the past", description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lato.variable} ${vt323.variable} ${jetbrains.variable} ${caveat.variable} ${londrina.variable} ${fell.variable} ${fellSc.variable} h-full antialiased`}
    >
      <body className="h-full bg-[#121214]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

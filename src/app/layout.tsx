import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, JetBrains_Mono, Lato, VT323 } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const lato = Lato({ variable: "--font-lato", subsets: ["latin"], weight: ["400", "700", "900"] });
const vt323 = VT323({ variable: "--font-vt323", subsets: ["latin"], weight: "400" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["600", "700"] });

const description =
  "What if your AI chatbot shipped in 10,000 BC? Or 1993? 13 costumes, from a cave wall to a séance board to MSN Messenger to the bare machine. The look and the personality change together.";

export const metadata: Metadata = {
  // Absolute URLs for share cards. Set NEXT_PUBLIC_SITE_URL on preview deployments.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gpty.lol"),
  title: "gpty.lol — a chatbot in costume",
  description,
  openGraph: { siteName: "gpty.lol", title: "gpty.lol — a chatbot in costume", description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lato.variable} ${vt323.variable} ${jetbrains.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="h-full bg-[#121214]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

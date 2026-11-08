import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, IM_Fell_English, IM_Fell_English_SC, JetBrains_Mono, Lato, Londrina_Solid, VT323 } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SHARE_DESCRIPTION, SHARE_TITLE, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
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

export const metadata: Metadata = {
  // Absolute URLs for share cards. Set NEXT_PUBLIC_SITE_URL on preview deployments.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gpty.lol"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "gpty.lol",
  openGraph: { siteName: "gpty.lol", title: SHARE_TITLE, description: SHARE_DESCRIPTION, type: "website", url: "/" },
  twitter: { card: "summary_large_image", title: SHARE_TITLE, description: SHARE_DESCRIPTION },
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

import type { Metadata } from "next";
import { LogoLab } from "@/components/LogoLab";

export const metadata: Metadata = {
  title: "Logo lab — gpty.lol",
  robots: { index: false, follow: false },
};

/** gpty.lol/logo-lab: try candidate wordmarks on every agent's scene, at sidebar size. */
export default function Page() {
  return <LogoLab />;
}

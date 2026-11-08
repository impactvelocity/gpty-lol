import { Bug, ChartColumn, CodeXml, Feather, FileText, Image as ImageIcon, type LucideIcon, Mail, Presentation } from "lucide-react";
import type { Kind, Sym } from "@/components/slots/engine";

/**
 * The reel symbols for the high-limit machine: the same nine as Lucky's 3 a.m.
 * machine (the things people pull AI for, a bug and AGI), drawn as plain line
 * icons in one ink on ivory, so a reel reads at a glance. The bug is red; AGI
 * is a little seal with its name on it.
 */
const ICONS: Record<Exclude<Sym, "agi">, LucideIcon> = {
  text: FileText,
  email: Mail,
  image: ImageIcon,
  code: CodeXml,
  deck: Presentation,
  chart: ChartColumn,
  poem: Feather,
  bug: Bug,
};

/** What a payout is, in a word. */
export const KIND_NAME: Record<Kind, string> = {
  text: "Text",
  email: "Email",
  image: "Image",
  code: "Code",
  deck: "Slides",
  chart: "Chart",
  poem: "Poem",
};

const SERIF = "var(--font-hl-display), 'DM Serif Display', Georgia, serif";

export function HlSymbol({ sym, className = "" }: { sym: Sym; className?: string }) {
  if (sym === "agi") {
    return (
      <svg viewBox="0 0 24 24" className={`hl-sym ${className}`} data-sym="agi" aria-hidden>
        <circle cx="12" cy="12" r="10.1" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <text x="12" y="15.3" textAnchor="middle" fontSize="8.8" fill="currentColor" style={{ fontFamily: SERIF }}>
          AGI
        </text>
      </svg>
    );
  }
  const Icon = ICONS[sym];
  return <Icon className={`hl-sym ${className}`} data-sym={sym} strokeWidth={1.75} aria-hidden />;
}

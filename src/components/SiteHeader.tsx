"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Share2, Volume2, VolumeX } from "lucide-react";
import type { Costume } from "@/lib/costumes";

export const HACKATHON_URL = "https://kiroween.devpost.com/";

const iconBtn =
  "grid h-8 w-8 place-items-center rounded-md text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white/60";
const link = "transition hover:text-white focus-visible:outline-2 focus-visible:outline-white/60 rounded-sm";

/** Native share sheet on phones, copy-to-clipboard everywhere else. */
async function shareCostume(c: Costume): Promise<"shared" | "copied" | "failed"> {
  const url = `${window.location.origin}/${c.id}`;
  const text = `gpty, dressed as ${c.name} (${c.year}). ${c.tagline}`;
  if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
    try {
      await navigator.share({ title: "gpty.lol", text, url });
      return "shared";
    } catch {
      return "failed";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

export function SiteHeader({
  costume,
  candy,
  candyTotal,
  sound,
  onToggleSound,
  onPrev,
  onNext,
  onOpenPicker,
  onOpenAbout,
}: {
  costume: Costume;
  candy: number;
  candyTotal: number;
  sound: boolean;
  onToggleSound: () => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenPicker: () => void;
  onOpenAbout: () => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <header className="grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 font-sans text-sm text-white/55 sm:gap-4">
      <Link
        href="/"
        className={`justify-self-start px-1 text-[15px] font-semibold leading-none tracking-[-0.02em] text-white ${link}`}
        aria-label="gpty.lol home"
      >
        gpty<span className="font-normal text-white/45">.lol</span>
      </Link>

      <nav aria-label="Costumes" className="flex items-center gap-1">
        <button onClick={onPrev} className={`${iconBtn} max-sm:hidden`} aria-label="Previous costume" title="Previous costume ( [ )">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onOpenPicker}
          // Fixed width so the arrows don't jump around as the name changes.
          className="flex h-8 w-40 items-center justify-center gap-2 rounded-md px-2.5 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white/60 sm:w-60"
          aria-label={`Costume: ${costume.name}. Open the costume picker`}
          title="All costumes (⌘K)"
        >
          <span aria-hidden className="shrink-0">{costume.avatar}</span>
          <span className="min-w-0 truncate font-medium">{costume.name}</span>
          <span className="hidden shrink-0 text-white/40 sm:inline">{costume.year}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/40" />
        </button>
        <button onClick={onNext} className={`${iconBtn} max-sm:hidden`} aria-label="Next costume" title="Next costume ( ] )">
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>

      <div className="flex items-center gap-1 justify-self-end sm:gap-3">
        <button
          onClick={onOpenPicker}
          className="flex h-8 items-center gap-1 rounded-md px-2 tabular-nums transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white/60"
          aria-label={`Trick-or-treat bag: ${candy} of ${candyTotal} costumes collected. Open the costume picker`}
          title="Trick or treat! Chat in every costume to fill the bag"
        >
          <span key={candy} className="candy-pop inline-block" aria-hidden>
            🎃
          </span>
          <span className={candy === candyTotal ? "font-semibold text-amber-300" : ""}>
            {candy}/{candyTotal}
          </span>
        </button>
        <button
          onClick={async () => {
            if ((await shareCostume(costume)) !== "copied") return;
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className={`flex h-8 items-center gap-1.5 rounded-md px-2 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white/60 ${
            copied ? "text-white" : ""
          }`}
          title={`Share a link to ${costume.name}`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          <span className="hidden sm:inline">{copied ? "Link copied" : "Share"}</span>
          <span className="sr-only" role="status">
            {copied ? "Link copied" : ""}
          </span>
        </button>
        <button
          onClick={onToggleSound}
          className={iconBtn}
          aria-pressed={sound}
          aria-label={sound ? "Mute sounds" : "Turn sounds on"}
          title={sound ? "Sounds on" : "Sounds off"}
        >
          {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
        <button onClick={onOpenAbout} className={`px-1 ${link}`}>
          About
        </button>
        <a href={HACKATHON_URL} target="_blank" rel="noreferrer" className={`hidden lg:inline ${link}`}>
          Kiroween ↗
        </a>
        <span className="hidden text-white/35 xl:inline">made by Dylan</span>
      </div>
    </header>
  );
}

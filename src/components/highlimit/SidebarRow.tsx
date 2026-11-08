"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import type { Sym } from "@/components/slots/engine";
import { hlFonts } from "./font";
import { HlSymbol } from "./symbols";
import "./highlimit.css";

/** Three tiny reels: each rests on its first symbol and rolls through the strip while Lucky spins. */
const MINI: Sym[][] = [
  ["email", "code", "email"],
  ["image", "text", "image"],
  ["code", "poem", "code"],
];

/**
 * The open High Limit Lucky in the sidebar: a dark green chip with a brass
 * hairline, his gpty in a dark disc, and three tiny ivory reels that roll
 * while he answers.
 */
export function HighLimitActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const busy = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className={`${hlFonts} hl-pick group`} data-busy={busy || undefined}>
      <span className="hl-pick-av">
        <Gpty agent={agent} size={30} mood={mood} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="hl-pick-name">
          {agent.name}
          <small>{agent.costume.name}</small>
        </span>
        <span className="hl-pick-sub" data-error={mood === "error" || undefined}>
          {mood === "thinking" ? "Spinning…" : mood === "typing" ? "Paying out…" : mood === "error" ? "Jammed" : "Feeling lucky?"}
        </span>
      </span>
      <span className="hl-pick-reels" data-busy={busy || undefined} aria-hidden>
        {MINI.map((strip, i) => (
          <span key={i} className="hl-pick-reel">
            <span>
              {strip.map((s, j) => (
                <HlSymbol key={j} sym={s} />
              ))}
            </span>
          </span>
        ))}
      </span>
    </button>
  );
}

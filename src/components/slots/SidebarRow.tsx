"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import type { Sym } from "./engine";
import { slFonts } from "./font";
import { SymbolArt } from "./symbols";
import "./slots.css";

/** The three little reels: each shows a symbol at rest and blurs through three while Lucky spins. */
const MINI: Sym[][] = [
  ["code", "email", "image", "code"],
  ["agi", "deck", "text", "agi"],
  ["image", "poem", "chart", "image"],
];

/**
 * The open Lucky in the sidebar: a little cabinet in the same cherry lacquer
 * and gold trim as his machine, bulbs chasing along the top and bottom, his
 * gpty in a dark dome, and three tiny reels that spin while he answers.
 */
export function SlotsActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const busy = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className={`${slFonts} lk-pick group`} data-busy={busy || undefined}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="lk-vblur-sm">
          <feGaussianBlur stdDeviation="0 1.4" />
        </filter>
      </svg>
      <span className="lk-pick-av">
        <Gpty agent={agent} size={32} mood={mood} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="lk-pick-name">
          {agent.name}
          <small>{agent.costume.year}</small>
        </span>
        <span className="lk-pick-sub" data-busy={busy || undefined} data-error={mood === "error" || undefined}>
          {mood === "thinking" ? "spinning…" : mood === "typing" ? "paying out ▮▮▮" : mood === "error" ? "tilt!" : "feeling lucky?"}
        </span>
      </span>
      <span className="lk-pick-reels" data-busy={busy || undefined} aria-hidden>
        {MINI.map((strip, i) => (
          <span key={i} className="lk-pick-reel">
            <span>
              {strip.map((s, j) => (
                <SymbolArt key={j} sym={s} />
              ))}
            </span>
          </span>
        ))}
      </span>
    </button>
  );
}

"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import { PlanchetteGlyph } from "./art";
import "./seance.css";

/**
 * The open Mortimer in the sidebar: a small engraved card, black and bone,
 * with his ghost in an oval cameo. While he answers, the line under his name
 * spells, and the planchette at the end stirs.
 */
export function SeanceActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const busy = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className="sp-pick" data-busy={busy || undefined}>
      <span className="sp-pick-cameo">
        <Gpty agent={agent} size={28} mood={mood} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="sp-pick-name">
          {agent.name}
          <small>{agent.costume.year}</small>
        </span>
        <span className="sp-pick-sub">
          {mood === "thinking" ? (
            "The planchette stirs…"
          ) : mood === "typing" ? (
            <>
              The board spells
              <span className="sp-pick-spell" aria-hidden>
                <i>Y</i>
                <i>E</i>
                <i>S</i>
              </span>
            </>
          ) : mood === "error" ? (
            "The circle is broken"
          ) : (
            "Speaks only through the board"
          )}
        </span>
      </span>
      <PlanchetteGlyph className="sp-pick-plan" />
    </button>
  );
}

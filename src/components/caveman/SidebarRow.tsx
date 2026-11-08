"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { HandStencil, PaintedGrug } from "./art";
import { Picto } from "./pictos";
import "./caveman.css";

/**
 * The open Grug in the sidebar: a small slab of the cave's rock with a hand
 * stencil and Grug painted on it, and the fire going. While Grug answers, the
 * line under his name says he's painting, with a wet blob of ochre.
 */
export function CavemanActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const busy = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className="cv-pick group">
      <span className="cv-pick-av">
        <HandStencil className="cv-pick-hand" rotate={-14} />
        <PaintedGrug size={36} mood={mood} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="cv-pick-name">
          {agent.name}
          <small>{agent.costume.year}</small>
        </span>
        <span className="cv-pick-sub">
          {mood === "thinking" ? (
            <>
              <i className="cv-pick-blob" aria-hidden />
              Grug think
            </>
          ) : busy ? (
            <>
              <i className="cv-pick-blob" aria-hidden />
              Grug paint
            </>
          ) : mood === "error" ? (
            "Sky angry"
          ) : (
            "Big brain. Small words."
          )}
        </span>
      </span>
      <Picto id="fire" className="cv-pick-fire" paint={false} />
    </button>
  );
}

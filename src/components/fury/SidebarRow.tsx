"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { art, Portrait } from "./art";
import { fyFonts } from "./font";
import "./fury.css";

/**
 * The open Fury agent in the sidebar: Shelly in her shades on a tiny sunset
 * and grid, her name in chrome with the FW-7 tag, and a little meter that
 * charges while she replies (and goes red if the line drops).
 */
export function FuryActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const typing = mood === "thinking" || mood === "typing";
  const photo = art("avatar");
  return (
    <button
      type="button"
      {...button}
      className={`${fyFonts} fy-pick group`}
      data-busy={typing || undefined}
      data-error={mood === "error" || undefined}
    >
      <span className="fy-pick-av" data-photo={photo ? "" : undefined}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" draggable={false} className="fy-pick-photo" data-mood={mood} />
        ) : (
          <Portrait mood={mood === "watching" ? "idle" : mood} beams={false} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="fy-pick-name">
          <span className="fy-chrome">{agent.name}</span>
          <span className="fy-pick-tag">FW-7</span>
        </span>
        <span className="fy-pick-sub">
          {mood === "error" ? (
            "NO CARRIER. Redial?"
          ) : typing ? (
            <>
              charging lasers
              <i className="fy-cursor" />
            </>
          ) : (
            "Firewall Fury '88"
          )}
        </span>
      </span>
      <span className="fy-pick-hp" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}

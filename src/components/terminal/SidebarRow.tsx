"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import { mfFonts } from "./font";
import "./terminal.css";

/**
 * The open Mainframe agent in the sidebar, as a scrap of the cabinet: Shelly
 * glowing in a tiny amber tube, her name with the red FW-7 tag, and a cluster
 * of lamps that chatter while she replies (and flash red if the line drops).
 */
export function TerminalActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const typing = mood === "thinking" || mood === "typing";
  return (
    <button
      type="button"
      {...button}
      className={`${mfFonts} mf-pick group`}
      data-busy={typing || undefined}
      data-error={mood === "error" || undefined}
    >
      <span className="mf-pick-av">
        <Gpty agent={agent} size={30} mood={mood} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mf-pick-name">
          {agent.name.toUpperCase()}
          <span className="mf-pick-tag">FW-7</span>
        </span>
        <span className="mf-pick-sub">
          {mood === "error" ? (
            "CARRIER LOST"
          ) : typing ? (
            <>
              transmitting at 1200 baud
              <i className="mf-cursor" />
            </>
          ) : (
            agent.bio
          )}
        </span>
      </span>
      <span className="mf-pick-lamps" aria-hidden>
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}

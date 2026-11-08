"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import "./bbs.css";

/**
 * The open BBS agent in the sidebar, as a little phosphor screen: the gpty
 * glowing in a tiny CRT, the name with a SYSOP tag, and the bio as the
 * caller's view of the board. While it replies, the modem's RD light flickers.
 */
export function BbsActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const typing = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className="bbs-pick group">
      <span className="bbs-pick-av">
        <Gpty agent={agent} size={30} mood={mood} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="bbs-pick-name">
          {agent.name.toUpperCase()}
          <span className="bbs-pick-tag">SYSOP</span>
        </span>
        <span className="bbs-pick-sub">
          {mood === "error" ? (
            <span className="t-bad">NO CARRIER</span>
          ) : typing ? (
            <>
              <i className="bbs-pick-led" aria-hidden />
              receiving at 2400 baud
            </>
          ) : (
            agent.bio
          )}
        </span>
      </span>
    </button>
  );
}

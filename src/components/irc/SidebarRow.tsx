"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import { pixel } from "./font";
import "./irc.css";

/**
 * The open mIRC agent in the sidebar, as a little Windows 2000 window: the
 * gray frame, the navy title-bar gradient, Nick's gpty in a sunken well, his
 * @ and his channel. While he replies, the bio becomes "is typing..." with a
 * blinking block cursor.
 */
export function IrcActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const typing = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className={`${pixel.variable} irc-pick group`}>
      <span className="irc-pick-inner">
        <span className="irc-pick-av">
          <Gpty agent={agent} size={28} mood={mood} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="irc-pick-name">
            <b className="truncate">@{agent.name}</b>
            <span className="irc-pick-tag">op · #gpty</span>
          </span>
          <span className="irc-pick-sub">
            {typing ? (
              <>
                <span className="irc-pen" /> is typing...
              </>
            ) : (
              agent.bio
            )}
          </span>
        </span>
      </span>
    </button>
  );
}

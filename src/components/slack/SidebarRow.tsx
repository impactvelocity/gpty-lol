"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import { art } from "./art";
import "./slack.css";

/**
 * The open Slack agent in the sidebar, as the active row in Slack's own
 * sidebar: teal on aubergine, a square picture with the green presence dot,
 * the name and a status line. While it replies, the status becomes
 * "is typing..." and a red badge says there's something new.
 */
export function SlackActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const typing = mood === "thinking" || mood === "typing";
  const photo = art("channing");
  return (
    <button type="button" {...button} className="sl-pick group">
      {/* No shared SVG defs in here: on phones this row also sits in the hidden desktop sidebar. */}
      <span className="sl-pick-av">
        <span className="sl-pick-pic">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" />
          ) : (
            <Gpty agent={agent} size={34} mood={mood} />
          )}
        </span>
        <span className="sl-pick-dot" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="sl-pick-name">
          <span className="truncate">{agent.name}</span>
          <small>active</small>
        </span>
        <span className="sl-pick-sub">{typing ? "is typing…" : "I made a channel for that"}</span>
      </span>
      {typing && <span className="sl-pick-badge">1</span>}
    </button>
  );
}

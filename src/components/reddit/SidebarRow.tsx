"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import { VoteArrow } from "./art";
import "./reddit.css";

/**
 * The open reddit agent in the sidebar, as a link on the front page: your
 * orangered upvote and his 42 points, the gpty as the thumbnail, the name in
 * link blue and a tagline. While Arthur replies, the tagline says so and the
 * arrow keeps bouncing.
 */
export function RedditActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const typing = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className="rd-pick group">
      {/* No shared SVG defs in here: on phones this row also sits in the hidden desktop sidebar. */}
      <span className="rd-pick-vote" data-live={typing ? "" : undefined} aria-hidden>
        <VoteArrow dir="up" on />
        <b>{typing ? 43 : 42}</b>
        <VoteArrow dir="down" on={false} />
      </span>
      <span className="rd-pick-thumb">
        <Gpty agent={agent} size={34} mood={mood} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="rd-pick-name">
          <span className="truncate">{agent.name}</span>
          <small>(self.AskReddit)</small>
        </span>
        <span className="rd-pick-sub">
          {typing ? (
            "writing a reply…"
          ) : (
            <>
              by <b>{agent.costume.assistant}</b> · top comment
            </>
          )}
        </span>
      </span>
    </button>
  );
}

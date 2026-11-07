"use client";

import type { ActiveRowProps, HoverBadgeProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import { Pencil } from "./art";
import "./facebook.css";

/**
 * The open Facebook agent in the sidebar, as an online friend: the square
 * picture on a pale wall, the name in Facebook blue with the green dot, and
 * the bio as a status. While Mark replies, the status becomes "is typing...".
 */
export function FacebookActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const typing = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className="fb-pick group">
      <span className="fb-pick-pic fb-dp-gpty">
        <Gpty agent={agent} size={32} mood={mood} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="fb-pick-name">
          <span className="truncate">{agent.name}</span>
          <span className="fb-dot" aria-hidden />
        </span>
        <span className="fb-pick-status">
          {typing ? (
            <>
              <Pencil className="fb-pencil" />
              is typing...
            </>
          ) : (
            agent.bio
          )}
        </span>
      </span>
    </button>
  );
}

/** Facebook's hover label in the sidebar: the lowercase wordmark and the year. */
export function FacebookHoverBadge({ agent }: HoverBadgeProps) {
  return (
    <span className="fb-hover truncate">
      facebook<span>· {agent.costume.year}</span>
    </span>
  );
}

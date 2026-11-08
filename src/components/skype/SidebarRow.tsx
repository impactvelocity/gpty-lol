"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import { Pencil } from "./art";
import { rounded, segoe } from "./font";
import "./skype.css";

/**
 * The open Skype agent in the sidebar, as a selected contact: the glossy
 * sky-blue selection, a round picture with the green tick, the name and the
 * bio as a mood message. While it replies, the mood becomes "is typing...".
 */
export function SkypeActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const typing = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className={`${segoe.variable} ${rounded.variable} sk-pick group`}>
      {/*
        No shared gradient defs in here: on phones this row also sits in the
        hidden desktop sidebar, and gradients defined inside a display:none
        subtree would blank out every icon in the window. The badge is CSS.
      */}
      <span className="sk-pick-av">
        <span className="sk-pick-pic sk-dp-gpty">
          <Gpty agent={agent} size={30} mood={mood} />
        </span>
        <span className="sk-pick-badge" aria-hidden>
          <svg viewBox="0 0 16 16">
            <path d="m4.4 8.3 2.3 2.3 4.9-4.9" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="sk-pick-name">
          <b className="truncate font-extrabold">{agent.name}</b>
          <span className="sk-pick-status">Online</span>
        </span>
        <span className="sk-pick-mood">
          {typing ? (
            <>
              <Pencil className="sk-pencil mr-1 inline-block h-3 w-3 align-[-1px]" />
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

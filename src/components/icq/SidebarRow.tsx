"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import { Flower, MessageNote } from "./art";
import "./icq.css";

/**
 * The open ICQ agent in the sidebar, as the selected contact in a Windows 98
 * list: a bevelled plate, the gpty in a sunken well, the name in the navy
 * selection with its dotted focus ring, and "Online" underneath. While a
 * reply is on its way, the flower turns into the blinking yellow message
 * note and the line reads "is typing...".
 */
export function IcqActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const typing = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className="icq-pick group">
      {/*
        No <IcqDefs /> in here: on phones this row also sits in the hidden
        desktop sidebar, and gradients defined inside a display:none subtree
        would blank out every smiley and icon in the ICQ window. The flower
        and the note use flat colors.
      */}
      <span className="icq-pick-icon">
        <span>
          <Gpty agent={agent} size={30} mood={mood} />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="icq-pick-name">
          {typing ? <MessageNote blink className="h-3.5 w-3.5 shrink-0" /> : <Flower status="online" className="h-3.5 w-3.5 shrink-0" />}
          <b className="truncate">{agent.name}</b>
        </span>
        <span className="icq-pick-bio">{typing ? "is typing..." : "Online"}</span>
      </span>
    </button>
  );
}

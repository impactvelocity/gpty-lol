"use client";

import type { ActiveRowProps, HoverBadgeProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import { Pencil } from "./art";
import { segoe } from "./font";
import "./msn.css";

/**
 * The open MSN agent in the sidebar, as a selected buddy in the contact list:
 * the glossy selection, the green "online" picture frame, the name with
 * (Online) and the bio as a personal message. While it replies, the personal
 * message becomes "is typing a message...".
 */
export function MsnActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const typing = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className={`${segoe.variable} msn-pick group`}>
      {/*
        No <MsnDefs /> in here: on phones this row also sits in the hidden
        desktop sidebar, and gradients defined inside a display:none subtree
        would blank out every icon and emoticon in the MSN window.
      */}
      <span className="msn-pick-dp">
        <span className="msn-pick-pic">
          <Gpty agent={agent} size={30} mood={mood} />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="msn-pick-name">
          <b className="truncate">{agent.name}</b>
          <span className="msn-pick-status">(Online)</span>
        </span>
        <span className="msn-pick-psm">
          {typing ? (
            <>
              <Pencil className="msn-pencil mr-1 inline-block h-3 w-3 align-[-1px]" />
              is typing a message...
            </>
          ) : (
            agent.bio
          )}
        </span>
      </span>
    </button>
  );
}

/**
 * MSN's hover label in the sidebar: "MSN · 2005" ("Messenger" is too long),
 * a little brighter and bolder than the other agents' labels.
 */
export function MsnHoverBadge({ agent }: HoverBadgeProps) {
  return (
    <span className="truncate text-[12px] font-medium text-[var(--shell-soft)]">MSN · {agent.costume.year}</span>
  );
}

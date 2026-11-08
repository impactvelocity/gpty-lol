"use client";

import type { ActiveRowProps } from "@/components/activeRows";
import { CarolFace, Doodle } from "./art";
import { elfFonts } from "./font";
import "./elf.css";

/**
 * The open Carol in the sidebar: a cream gift tag on a twist of baker's
 * twine, Carol in her elf hat, and a gold bell. While she replies, the line
 * under her name says she's wrapping, with three baubles bobbing, and the
 * bell rings.
 */
export function ElfActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const busy = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className={`${elfFonts} el-pick group`}>
      {/* Flat fills only: on phones this row also sits in the hidden desktop sidebar. */}
      <span className="el-pick-tag" aria-hidden />
      <span className="el-pick-hole" aria-hidden />
      <svg className="el-pick-twine" viewBox="0 0 30 60" preserveAspectRatio="none" aria-hidden>
        <path d="M27 30C18 27 9 19 2 4" fill="none" stroke="#f8f0e1" strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d="M27 30C18 27 9 19 2 4" fill="none" stroke="#c8372d" strokeWidth="2.6" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="el-pick-av">
        <CarolFace agent={agent} size={34} mood={mood} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="el-pick-name">
          {agent.name}
          <small>{agent.costume.year}</small>
        </span>
        <span className="el-pick-sub">
          {busy ? (
            <>
              <span className="el-pick-dots" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              {mood === "thinking" ? "finding the tape…" : "wrapping a reply…"}
            </>
          ) : mood === "error" ? (
            "Antenna's down!"
          ) : (
            "Wrapping dept, bench 7"
          )}
        </span>
      </span>
      <span className="el-pick-bell" data-ring={busy || undefined} aria-hidden>
        <Doodle id="bell" paint={false} />
      </span>
    </button>
  );
}

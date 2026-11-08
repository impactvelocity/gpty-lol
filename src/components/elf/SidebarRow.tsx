"use client";

import { useEffect, useRef, useState } from "react";
import type { ActiveRowProps } from "@/components/activeRows";
import { CarolFace, Doodle } from "./art";
import { elfFonts } from "./font";
import "./elf.css";

/* The tag's shape, kept in step with .el-pick-tag in elf.css. */
const POINT = 17; // how far in the arrow's corners sit (its clip-path)
const ROUND = 15; // the right-hand corners (its border-radius)
const INSET = 4; // the stitch's distance from the edge

/**
 * The stitch around the tag, 4px in from every edge, arrow included. Drawn
 * in real pixels so the point keeps the tag's angle at any sidebar width.
 */
function stitch(w: number, h: number) {
  const m = h / 2;
  const edge = Math.hypot(POINT, m);
  // Where the inset arrow meets the inset top and bottom, and its tip.
  const corner = POINT * (1 - (INSET * (1 - POINT / edge)) / m) + (INSET * m) / edge;
  const tip = (INSET / edge) * ((POINT * POINT) / m + m);
  const r = ROUND - INSET;
  const n = (v: number) => +v.toFixed(2);
  return [
    `M${n(corner)} ${INSET}`,
    `H${n(w - INSET - r)}`,
    `A${r} ${r} 0 0 1 ${n(w - INSET)} ${INSET + r}`,
    `V${n(h - INSET - r)}`,
    `A${r} ${r} 0 0 1 ${n(w - INSET - r)} ${n(h - INSET)}`,
    `H${n(corner)}`,
    `L${n(tip)} ${n(m)}`,
    "Z",
  ].join("");
}

/** The tag's size, kept up to date (0×0 while the sidebar is hidden). */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, ...size };
}

/**
 * The open Carol in the sidebar: a cream gift tag on a twist of baker's
 * twine, Carol in her elf hat, and a gold bell. While she replies, the line
 * under her name says she's wrapping, with three baubles bobbing, and the
 * bell rings.
 */
export function ElfActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const busy = mood === "thinking" || mood === "typing";
  const { ref: tag, w, h } = useSize<HTMLSpanElement>();
  return (
    <button type="button" {...button} className={`${elfFonts} el-pick group`}>
      {/* Flat fills only: on phones this row also sits in the hidden desktop sidebar. */}
      <span ref={tag} className="el-pick-tag" aria-hidden>
        {w > 0 && (
          <svg className="el-pick-stitch" width={w} height={h}>
            <path d={stitch(w, h)} />
          </svg>
        )}
      </span>
      <span className="el-pick-hole" aria-hidden />
      <svg className="el-pick-twine" viewBox="0 0 30 60" preserveAspectRatio="none" aria-hidden>
        <path d="M27 30C18 27 9 19 2 4" fill="none" stroke="#f8f0e1" strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d="M27 30C18 27 9 19 2 4" fill="none" stroke="#c8372d" strokeWidth="2.6" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="el-pick-av">
        <CarolFace agent={agent} size={50} mood={mood} />
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
            "Head of wrapping"
          )}
        </span>
      </span>
      <span className="el-pick-bell" data-ring={busy || undefined} aria-hidden>
        <Doodle id="bell" paint={false} />
      </span>
    </button>
  );
}

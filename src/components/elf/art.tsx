"use client";

import { type CSSProperties, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { Gpty, type Mood } from "@/components/Gpty";
import type { Agent } from "@/lib/agents";

/**
 * Art for WorkshopChat, the North Pole's own chat app: Christmas doodles in
 * the cozy, grainy gouache style of a hand-drawn holiday card (cream, holly
 * red, sage, gold and pink on deep pine green), Carol's elf hat, the presents
 * on the belt, the string lights and a snowball splat. Flat fills only; the
 * paint texture is one SVG filter that lives inside the window.
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot = "wallpaper" | "hero" | "carol" | "cocoa" | "snowball" | "bell";

/**
 * Generated pictures that replace the drawn fallbacks (prompts and sizes in
 * src/components/elf/ART.md). Add a line once its file is in public/elf/;
 * remove it to fall back to the drawing.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/elf/wallpaper.webp",
  hero: "/elf/hero.webp",
  carol: "/elf/carol.webp",
  cocoa: "/elf/cocoa.webp",
  snowball: "/elf/snowball.webp",
  bell: "/elf/bell.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/* ───────── Palette ───────── */

export const INK = {
  pine: "#2b4a2f",
  holly: "#c8372d",
  hollyDark: "#a42b23",
  cream: "#f8f0e1",
  sage: "#8fb07c",
  leaf: "#6f9a5f",
  fir: "#4f7f4a",
  gold: "#e2ae4a",
  goldDark: "#b9852b",
  pink: "#f3b7ad",
  teal: "#5aaea2",
  ginger: "#c98d52",
  bark: "#6b4429",
  snow: "#f4f7fb",
  frost: "#c9d6e3",
  ink: "#3a2b20",
};
const I = INK;

/* ───────── Shared filters ───────── */

/**
 * Gouache on paper: edges that wobble a little, and fine specks where the
 * paint skipped. Lives inside the window; anything drawn outside it (the
 * sidebar row, the scene) goes without.
 */
export function ElfDefs() {
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden focusable="false">
      <defs>
        <filter id="el-gouache" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="8" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.9" result="speck" />
          <feComposite in="d" in2="speck" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/* ───────── Doodles ───────── */

export type DoodleId =
  | "cane" | "star" | "bauble" | "holly" | "mitten" | "gift" | "cocoa"
  | "snowflake" | "ginger" | "bell" | "tree" | "stocking" | "sprig" | "snowball";

/** A zigzag stitch from (x, y), `n` teeth of width `w` and height `h`. */
function zig(x: number, y: number, n: number, w = 2.6, h = 2.4) {
  let d = `M${x} ${y}`;
  for (let i = 0; i < n; i++) d += ` l${w} ${i % 2 ? -h : h}`;
  return d;
}

/** A pine sprig: a curved twig with needles both sides. */
const SPRIG = (() => {
  const p0 = [9, 42], p1 = [19, 25], p2 = [40, 7];
  const at = (t: number) => [0, 1].map((k) => (1 - t) ** 2 * p0[k] + 2 * (1 - t) * t * p1[k] + t * t * p2[k]);
  const tan = (t: number) => [0, 1].map((k) => 2 * (1 - t) * (p1[k] - p0[k]) + 2 * t * (p2[k] - p1[k]));
  let needles = "";
  for (let i = 1; i <= 11; i++) {
    const t = i / 12;
    const [x, y] = at(t);
    const [dx, dy] = tan(t);
    const a = Math.atan2(dy, dx);
    const len = 8.5 - t * 3.5;
    for (const s of [-1, 1]) {
      const b = a + s * 0.95;
      needles += `M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(b) * len).toFixed(1)} ${(Math.sin(b) * len).toFixed(1)}`;
    }
  }
  return { stem: `M${p0} Q${p1} ${p2}`, needles };
})();

/** One arm of a snowflake, pointing up from the middle; drawn six times. */
const FLAKE_ARM = "M24 24V7.5M24 12.5l-4.4-3.4M24 12.5l4.4-3.4M24 18l-3.4-2.6M24 18l3.4-2.6";

const DOODLES: Record<DoodleId, ReactNode> = {
  cane: (
    <>
      <path d="M29 43V17a7.5 7.5 0 0 0-15 0" fill="none" stroke={I.cream} strokeWidth="6.5" strokeLinecap="round" />
      <path d="M29 43V17a7.5 7.5 0 0 0-15 0" fill="none" stroke={I.holly} strokeWidth="6.5" strokeDasharray="3.4 3.6" />
    </>
  ),
  star: (
    <>
      <path
        d="M24 6 28.7 18.5 42.1 19.1 31.6 27.5 35.2 40.4 24 33 12.8 40.4 16.4 27.5 5.9 19.1 19.3 18.5Z"
        fill={I.gold}
        stroke={I.gold}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M24 25 24 7M24 25 41 19.3M24 25 34.6 39.6M24 25 13.4 39.6M24 25 7 19.3" stroke={I.goldDark} strokeWidth="1" strokeLinecap="round" opacity=".7" />
    </>
  ),
  bauble: (
    <>
      <path d="M22 10a2.2 2.2 0 0 1 4 0" fill="none" stroke={I.gold} strokeWidth="1.5" />
      <circle cx="24" cy="28" r="15" fill={I.holly} />
      <rect x="19.5" y="10" width="9" height="5.5" rx="1.4" fill={I.gold} />
      <path d={zig(10.2, 26.5, 11, 2.6, 2.6)} fill="none" stroke={I.cream} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M15.5 21a10 10 0 0 1 6.5-4.6" fill="none" stroke={I.cream} strokeWidth="2.2" strokeLinecap="round" opacity=".75" />
    </>
  ),
  holly: (
    <>
      {[-150, -30].map((r) => (
        <g key={r} transform={`translate(24 27) rotate(${r})`}>
          <path
            d="M0 0C3-4 5-3 7-6C9-3 11-4 13-6.5C15-3.5 17-4 19-5.5C20-3 22-2 24 0C22 2 20 3 19 5.5C17 4 15 3.5 13 6.5C11 4 9 3 7 6C5 3 3 4 0 0Z"
            fill={I.leaf}
          />
          <path d="M2 0H21" stroke={I.fir} strokeWidth="1.1" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="20.8" cy="25.6" r="3.4" fill={I.holly} />
      <circle cx="27.4" cy="25.9" r="3.4" fill={I.holly} />
      <circle cx="24.1" cy="30.9" r="3.4" fill={I.holly} />
      <circle cx="20" cy="24.6" r=".9" fill={I.cream} opacity=".8" />
    </>
  ),
  mitten: (
    <>
      <path d="M17 31V18C17 12 20 8.5 25 8.5S33 12.5 33 18V31Z" fill={I.pink} />
      <path d="M17.5 19.5C12.5 17 9 19.5 9.5 23.5S13.5 28 17.5 26Z" fill={I.pink} />
      <path d={zig(18.6, 21.6, 5, 2.7, 2)} fill="none" stroke={I.leaf} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M23 13.5l3.4 3.4m0-3.4-3.4 3.4M26.5 26l3 3m0-3-3 3" stroke={I.holly} strokeWidth="1.3" strokeLinecap="round" />
      <rect x="15.2" y="30" width="19.6" height="8.6" rx="3.4" fill={I.cream} />
      <path d="M17.5 32.5v4M20.5 32.5v4M23.5 32.5v4M26.5 32.5v4M29.5 32.5v4M32.5 32.5v4" stroke={I.frost} strokeWidth="1" strokeLinecap="round" />
    </>
  ),
  gift: (
    <>
      <rect x="10" y="21" width="28" height="19.5" rx="2.2" fill={I.holly} />
      <circle cx="15" cy="27" r="1.2" fill={I.cream} opacity=".8" />
      <circle cx="16" cy="35" r="1.2" fill={I.cream} opacity=".8" />
      <circle cx="32.5" cy="26.5" r="1.2" fill={I.cream} opacity=".8" />
      <circle cx="33" cy="35.5" r="1.2" fill={I.cream} opacity=".8" />
      <rect x="8" y="15.5" width="32" height="7.4" rx="2" fill={I.hollyDark} />
      <rect x="21.4" y="15.5" width="5.2" height="25" fill={I.gold} />
      <path d="M24 15.6C20 8 13 9 15 13.6 16.5 16.6 21 16.2 24 15.6ZM24 15.6C28 8 35 9 33 13.6 31.5 16.6 27 16.2 24 15.6Z" fill={I.gold} />
      <circle cx="24" cy="15.6" r="2.3" fill={I.goldDark} />
    </>
  ),
  cocoa: (
    <>
      <path d="M18 11c-2-3 2-4 0-7M25.5 11c-2-3 2-4 0-7" fill="none" stroke={I.cream} strokeWidth="1.6" strokeLinecap="round" opacity=".85" />
      <path d="M33 21c7.5 0 8 11.5 0 11.5" fill="none" stroke={I.leaf} strokeWidth="3.6" />
      <path d="M11 16H33V35C33 39 30 41.5 26 41.5H18C14 41.5 11 39 11 35Z" fill={I.leaf} />
      <rect x="12.5" y="13" width="6.5" height="5" rx="1.6" fill={I.cream} />
      <rect x="18.6" y="12" width="6.5" height="5" rx="1.6" fill={I.snow} />
      <rect x="24.8" y="13.2" width="6.5" height="5" rx="1.6" fill={I.cream} />
      <path d={zig(12.4, 22.2, 8, 2.6, 2.2)} fill="none" stroke={I.cream} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M15.5 33.5c2.5 1.6 5.5 1.6 8 0" fill="none" stroke={I.cream} strokeWidth="1.5" strokeLinecap="round" opacity=".8" />
    </>
  ),
  snowflake: (
    <g stroke={I.cream} strokeWidth="2.2" strokeLinecap="round" fill="none">
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <path key={r} d={FLAKE_ARM} transform={`rotate(${r} 24 24)`} />
      ))}
    </g>
  ),
  ginger: (
    <>
      <path
        d="M24 5a7 7 0 0 1 4.8 12.1L37 19c3 .6 3 5.4 0 6l-6.5 1 3 12c.8 3-3 4.8-4.5 2.2L24 32.5l-5 7.7c-1.5 2.6-5.3.8-4.5-2.2l3-12-6.5-1c-3-.6-3-5.4 0-6l8.2-1.9A7 7 0 0 1 24 5Z"
        fill={I.ginger}
      />
      <g fill="none" stroke={I.cream} strokeWidth="1.3" strokeLinecap="round">
        <path d="M12 20.2c1 1.1 1 2.9 0 4M36 20.2c-1 1.1-1 2.9 0 4M16.6 37.4c1.4.3 2.6 1.3 3 2.4M31.4 37.4c-1.4.3-2.6 1.3-3 2.4" />
        <path d="M21.5 14.3q2.5 2 5 0" />
      </g>
      <circle cx="21.5" cy="10.8" r="1" fill={I.ink} />
      <circle cx="26.5" cy="10.8" r="1" fill={I.ink} />
      <circle cx="24" cy="22" r="1.4" fill={I.holly} />
      <circle cx="24" cy="27" r="1.4" fill={I.sage} />
    </>
  ),
  bell: (
    <>
      <path d="M24 10.5C16 10.5 14.5 17 14.5 24 14.5 29 12.5 31 10.5 33H37.5C35.5 31 33.5 29 33.5 24 33.5 17 32 10.5 24 10.5Z" fill={I.gold} />
      <path d="M19.2 15.6C17.8 18.4 17.3 21 17.3 25" fill="none" stroke={I.cream} strokeWidth="1.8" strokeLinecap="round" opacity=".6" />
      <rect x="9.5" y="32" width="29" height="4.2" rx="2.1" fill={I.goldDark} />
      <circle cx="24" cy="38.6" r="3" fill={I.goldDark} />
      <path d="M24 10C20 4.5 14 5.5 15.5 9.4 16.5 12 21 11 24 10ZM24 10C28 4.5 34 5.5 32.5 9.4 31.5 12 27 11 24 10Z" fill={I.holly} />
      <circle cx="24" cy="10" r="2.1" fill={I.hollyDark} />
    </>
  ),
  tree: (
    <>
      <rect x="21.5" y="38" width="5" height="6" rx="1" fill={I.bark} />
      <path d="M24 6 34 18.5H29.5L37 28.5H31.5L40 39.5H8L16.5 28.5H11L18.5 18.5H14Z" fill={I.sage} strokeLinejoin="round" />
      <path d="M17.5 24.5c4 2.2 9.5 2.2 13.5-.5M14 34.5c6 2.6 14 2.6 20.5-.6" fill="none" stroke={I.cream} strokeWidth="1.2" strokeDasharray="1.6 2.4" strokeLinecap="round" opacity=".8" />
      <circle cx="21" cy="20.5" r="1.6" fill={I.holly} />
      <circle cx="28.5" cy="30" r="1.7" fill={I.gold} />
      <circle cx="18" cy="32" r="1.7" fill={I.holly} />
      <circle cx="30" cy="37" r="1.5" fill={I.pink} />
      <path d="M24 2.2l1.3 2.6 2.8.4-2 2 .5 2.8L24 8.7 21.4 10l.5-2.8-2-2 2.8-.4Z" fill={I.gold} />
    </>
  ),
  stocking: (
    <>
      <path d="M17 13H31V27C31 31 30 33 27 36L21.5 41C18.5 43.5 13.5 43 11.5 39.5S11 33 14 31L17 28.5Z" fill={I.holly} />
      <g fill={I.pink} opacity=".9">
        <circle cx="20" cy="19" r=".9" /><circle cx="25" cy="17.5" r=".9" /><circle cx="28" cy="22" r=".9" />
        <circle cx="21.5" cy="25" r=".9" /><circle cx="26.5" cy="28" r=".9" /><circle cx="19" cy="31" r=".9" />
        <circle cx="23.5" cy="34" r=".9" /><circle cx="15" cy="36" r=".9" /><circle cx="18" cy="39.5" r=".9" />
      </g>
      <path d="M12.5 36.5c2.5-.6 4.6.6 5.4 3.6" fill="none" stroke={I.cream} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M15.5 9.5c2-1.6 3.6.2 5.4-1.2 1.8-1.3 3.4.6 5.4-.4 1.8-1 3.8.2 5.4 1.6 1.4 1.2.8 6.6-.6 6.9-5 .9-11.2.9-15.4 0-1.6-.4-1.8-5.6-.2-6.9Z" fill={I.cream} />
    </>
  ),
  sprig: (
    <>
      <path d={SPRIG.needles} stroke={I.leaf} strokeWidth="1.7" strokeLinecap="round" />
      <path d={SPRIG.stem} fill="none" stroke={I.bark} strokeWidth="1.9" strokeLinecap="round" />
    </>
  ),
  snowball: (
    <>
      <circle cx="24" cy="26" r="14" fill={I.snow} />
      <path d="M33.5 16.2A14 14 0 0 1 17.6 38.4 13 13 0 0 0 33.5 16.2Z" fill={I.frost} />
      <circle cx="18.5" cy="21" r="1.3" fill="#fff" />
      <circle cx="27" cy="29" r="1" fill={I.frost} />
      <circle cx="20.5" cy="31" r=".9" fill={I.frost} />
    </>
  ),
};

export const DOODLE_IDS = Object.keys(DOODLES) as DoodleId[];

/** A doodle in a 48×48 box. `paint` gives it the gouache texture (inside the window only). */
export function Doodle({ id, className = "", paint = true, style }: { id: DoodleId; className?: string; paint?: boolean; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 48" className={`el-doodle ${className}`} data-paint={paint || undefined} style={style} aria-hidden>
      {DOODLES[id]}
    </svg>
  );
}

/** A doodle, or its generated sticker once it's in (cocoa, snowball, bell). */
export function Sticker({ id, className = "", paint = true }: { id: "cocoa" | "snowball" | "bell"; className?: string; paint?: boolean }) {
  const photo = art(id);
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" draggable={false} className={`el-sticker ${className}`} />;
  }
  return <Doodle id={id} className={className} paint={paint} />;
}

/* ───────── Wrapping paper ───────── */

function rand(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** A clean id for SVG references (React's ids have characters url(#…) won't take). */
function useSvgId() {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

const PAPER_TILE = 360;
const PAPER: { id: DoodleId; x: number; y: number; r: number; s: number; b: boolean }[] = (() => {
  const ids: DoodleId[] = ["cane", "star", "bauble", "holly", "mitten", "gift", "snowflake", "ginger", "bell", "tree", "stocking", "sprig"];
  const r = rand(29);
  // A loose 4×3 grid, nudged, so the doodles never cross the tile's edge.
  return ids.map((id, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    return {
      id,
      x: 46 + col * 89 + (row % 2) * 30 + (r() - 0.5) * 18,
      y: 58 + row * 122 + (r() - 0.5) * 30,
      r: (r() - 0.5) * 50,
      s: 0.9 + r() * 0.35,
      b: (i + row) % 3 === 0,
    };
  });
})();

/**
 * Tone-on-tone wrapping paper: the doodles printed as flat, faintly lighter
 * silhouettes on the pine green, like the paper in the back of the cupboard.
 */
export function WrappingPaper({ className = "" }: { className?: string }) {
  const id = useSvgId();
  return (
    <svg className={className} aria-hidden width="100%" height="100%">
      <defs>
        {[0, 1].map((k) => (
          <filter key={k} id={`${id}f${k}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feFlood floodColor="#f8f0e1" floodOpacity={k ? 0.075 : 0.045} />
            <feComposite in2="SourceAlpha" operator="in" />
          </filter>
        ))}
        <pattern id={`${id}p`} width={PAPER_TILE} height={PAPER_TILE} patternUnits="userSpaceOnUse">
          {[false, true].map((bright) => (
            <g key={String(bright)} filter={`url(#${id}f${bright ? 1 : 0})`}>
              {PAPER.filter((p) => p.b === bright).map((p, i) => (
                <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.r.toFixed(1)}) scale(${p.s.toFixed(2)}) translate(-24 -24)`}>
                  {DOODLES[p.id]}
                </g>
              ))}
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}p)`} />
    </svg>
  );
}

/* ───────── Carol ───────── */

/**
 * Carol's elf hat, in the gpty's own 48-box so it sits on her head: a pine
 * green cone flopping to one side, a pink zigzag cuff and a bell on the tip.
 * It's a second `.gpty` svg with the same mood, so it hops and ponders with
 * her. The empty rect matches her body's box, so both turn about one point.
 */
function ElfHat({ size, mood }: { size: number; mood: Mood }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className="gpty el-hat" data-mood={mood} aria-hidden>
      <g className="gpty-body">
        <rect x="8" y="4" width="32" height="40" fill="none" />
        <path d="M12.5 9.5C14 .5 24-7.5 37-7c4.5.2 7.5 3.5 5.6 6.4-6.1-2.6-11 3-7.1 10.1Z" fill="#3f7a45" />
        <path d="M30.5-4.6c-4 3.8-5.6 8.6-5.2 13.6" fill="none" stroke="#2f6236" strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
        <path
          d="M10 6.5H38V9.8L35.2 13 32.4 10.2 29.6 13.4 26.8 10.4 24 13.6 21.2 10.4 18.4 13.4 15.6 10.2 12.8 13 10 9.8Z"
          fill={I.pink}
          stroke={I.pink}
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path d="M11.5 8.2H36.5" stroke={I.cream} strokeWidth=".9" strokeDasharray="1.4 1.6" strokeLinecap="round" opacity=".9" />
        <circle cx="43" cy=".9" r="2.8" fill={I.gold} />
        <path d="M42.2 1.9h1.6" stroke={I.goldDark} strokeWidth=".9" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * Carol: her portrait once it's in (see ART.md), else her red egg gpty with
 * the elf hat on, eyes and moods and all.
 */
export function CarolFace({ agent, size = 36, mood = "idle", className = "" }: { agent: Agent; size?: number; mood?: Mood; className?: string }) {
  const photo = art("carol");
  if (photo) {
    return (
      <span className={`el-face el-face-photo ${className}`} style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" draggable={false} />
      </span>
    );
  }
  return (
    <span className={`el-face ${className}`} style={{ width: size, height: size }}>
      <Gpty agent={agent} size={size} mood={mood} />
      <ElfHat size={size} mood={mood} />
    </span>
  );
}

/* ───────── The frieze over the empty bench ───────── */

const FRIEZE: { id: DoodleId; x: number; y: number; s: number; r: number }[] = [
  { id: "sprig", x: 4, y: 40, s: 54, r: -20 },
  { id: "cane", x: 13, y: 16, s: 58, r: -14 },
  { id: "ginger", x: 24.5, y: 44, s: 62, r: 8 },
  { id: "bauble", x: 35, y: 14, s: 50, r: -6 },
  { id: "gift", x: 46, y: 36, s: 74, r: -4 },
  { id: "star", x: 57.5, y: 10, s: 56, r: 12 },
  { id: "cocoa", x: 66.5, y: 44, s: 62, r: -6 },
  { id: "mitten", x: 77, y: 16, s: 56, r: 14 },
  { id: "holly", x: 87, y: 44, s: 52, r: -10 },
  { id: "snowflake", x: 95.5, y: 14, s: 36, r: 0 },
];

/**
 * A garland of doodles over "What are we wrapping tonight?", each bobbing a
 * little. The picture once it's in (see ART.md), else drawn.
 */
export function Frieze({ className = "" }: { className?: string }) {
  const photo = art("hero");
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" draggable={false} className={`el-frieze el-frieze-img ${className}`} />;
  }
  return (
    <div className={`el-frieze ${className}`} aria-hidden>
      {FRIEZE.map((d, i) => (
        <span
          key={i}
          className="el-frieze-d"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${(d.s / 600) * 100}%`, "--r": `${d.r}deg`, animationDelay: `${-i * 0.55}s` } as CSSProperties}
        >
          <Doodle id={d.id} />
        </span>
      ))}
    </div>
  );
}

/* ───────── Presents on the belt ───────── */

export interface PresentLook {
  w: number;
  h: number;
  box: string;
  lid: string;
  ribbon: string;
  dots?: string;
  stripes?: string;
}

const WRAPS: Omit<PresentLook, "w" | "h">[] = [
  { box: I.holly, lid: I.hollyDark, ribbon: I.gold, dots: I.cream },
  { box: I.sage, lid: "#7a9c68", ribbon: I.holly },
  { box: I.cream, lid: "#e9dcc4", ribbon: I.holly, stripes: I.sage },
  { box: I.pink, lid: "#e59d92", ribbon: I.fir, dots: I.cream },
  { box: I.gold, lid: I.goldDark, ribbon: I.holly },
  { box: I.teal, lid: "#4a948a", ribbon: I.cream, dots: I.cream },
  { box: I.hollyDark, lid: "#8a231d", ribbon: I.cream, stripes: I.holly },
  { box: "#e9dcc4", lid: "#d8c8aa", ribbon: I.fir, dots: I.holly },
];

/** A fixed parade of presents, so the belt looks the same each time. */
export const PRESENTS: PresentLook[] = (() => {
  const r = rand(53);
  return Array.from({ length: 14 }, (_, i) => ({
    w: Math.round(24 + r() * 14),
    h: Math.round(22 + r() * 12),
    ...WRAPS[(i * 3 + Math.floor(r() * 2)) % WRAPS.length],
  }));
})();

/** One wrapped present: box, lid, ribbon and bow, in a box `w` by `h` (bow included). */
export function Present({ w, h, box, lid, ribbon, dots, stripes }: PresentLook) {
  const bow = 6;
  const top = bow + 1;
  const lidH = 5;
  const bodyY = top + 3;
  const bodyH = h - bodyY;
  const cx = w / 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="el-present" aria-hidden>
      <rect x="1.5" y={bodyY} width={w - 3} height={bodyH} rx="1.8" fill={box} />
      {stripes &&
        Array.from({ length: Math.floor(w / 6) }, (_, i) => (
          <rect key={i} x={3 + i * 6} y={bodyY} width="2.2" height={bodyH} fill={stripes} opacity=".55" />
        ))}
      {dots &&
        [0.22, 0.75].flatMap((fx, a) =>
          [0.35, 0.78].map((fy, b) => <circle key={`${a}${b}`} cx={w * fx} cy={bodyY + bodyH * fy} r="1.1" fill={dots} opacity=".85" />),
        )}
      <rect x="0" y={top} width={w} height={lidH} rx="1.4" fill={lid} />
      <rect x={cx - 2} y={top} width="4" height={h - top} fill={ribbon} />
      <path
        d={`M${cx} ${top}c-3-5.6-8.4-5-7.2-1.6.8 2.2 4.4 2 7.2 1.6Zm0 0c3-5.6 8.4-5 7.2-1.6-.8 2.2-4.4 2-7.2 1.6Z`}
        fill={ribbon}
      />
      <circle cx={cx} cy={top} r="1.7" fill={ribbon} />
    </svg>
  );
}

/* ───────── String lights ───────── */

const BULBS = [I.holly, I.gold, I.sage, I.pink, I.teal];

/** The width of an element, kept up to date. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

/**
 * A string of lights draped along the top of the window, one bulb at the
 * bottom of each swag, glowing in turn. Drawn to the window's real width so
 * the bulbs never stretch.
 */
export function StringLights({ className = "" }: { className?: string }) {
  const { ref, w } = useWidth<HTMLDivElement>();
  const swags = useMemo(() => {
    if (!w) return [];
    const n = Math.max(4, Math.round(w / 74));
    const step = w / n;
    return Array.from({ length: n }, (_, i) => ({ x0: i * step, x1: (i + 1) * step, mid: (i + 0.5) * step }));
  }, [w]);
  const wire = swags.map((s) => `M${s.x0.toFixed(1)} 3Q${s.mid.toFixed(1)} 21 ${s.x1.toFixed(1)} 3`).join("");
  return (
    <div ref={ref} className={`el-lights ${className}`} aria-hidden>
      {w > 0 && (
        <>
          <svg width={w} height="34" viewBox={`0 0 ${w} 34`}>
            <path d={wire} fill="none" stroke="#1b2f1e" strokeWidth="1.6" />
          </svg>
          {/* The bulbs are boxes, not SVG, so each can glow in its own color. */}
          {swags.map((s, i) => (
            <span
              key={i}
              className="el-bulb"
              style={{
                left: s.mid,
                color: BULBS[i % BULBS.length],
                rotate: `${i % 2 ? 7 : -7}deg`,
                animationDelay: `${(i % 5) * 0.32}s`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

/* ───────── Snowball splat ───────── */

/** Where a snowball hit the glass: a soft white burst with a couple of drips. */
export function Splat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M50 18C58 10 70 16 70 26 80 24 88 34 82 42 92 48 88 62 76 60 78 70 66 78 58 70 54 80 40 80 40 68 30 74 18 66 24 56 12 54 12 40 24 38 18 28 28 18 38 24 40 14 46 14 50 18Z"
        fill={I.snow}
      />
      <path d="M44 70C44 80 46 87 44 92 42 96 39.5 92 40 87.5 40.5 82 42 76 44 70ZM64 66c.5 6 2 9.5.6 12.4-1 2.2-3 .4-2.8-2.2.2-3 1-6.4 2.2-10.2Z" fill={I.snow} />
      <path d="M58 30c8 2 13 9 12 17-3-6-7-10-12-11.5Z" fill="#fff" opacity=".9" />
      <path d="M30 56c6 6 16 9 26 6-8 6-20 4-26-6Z" fill={I.frost} opacity=".8" />
      <circle cx="12" cy="24" r="3.2" fill={I.snow} />
      <circle cx="90" cy="26" r="2.6" fill={I.snow} />
      <circle cx="86" cy="76" r="3.4" fill={I.snow} />
      <circle cx="16" cy="78" r="2.2" fill={I.snow} />
      <circle cx="50" cy="6" r="2" fill={I.snow} />
    </svg>
  );
}

/* ───────── Icons ───────── */

type IconName = "plus" | "send" | "stop" | "x" | "arrowDown" | "pen" | "bin";

const ICONS: Record<IconName, ReactNode> = {
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  send: <path d="M12 19V6.5M6.5 11.5 12 6l5.5 5.5" />,
  stop: <rect x="7.5" y="7.5" width="9" height="9" rx="2" fill="currentColor" stroke="none" />,
  x: <path d="m7 7 10 10M17 7 7 17" />,
  arrowDown: <path d="M12 5.5V18M6.5 12.5 12 18l5.5-5.5" />,
  pen: <path d="M14.5 6.5 17.5 9.5M5.5 18.5l.8-3.6L15.6 5.6a1.5 1.5 0 0 1 2.1 0l.7.7a1.5 1.5 0 0 1 0 2.1L9.1 17.7Z" />,
  bin: <path d="M5.5 7.5h13M10 7.5V5.5h4v2M7.5 7.5l.8 11h7.4l.8-11" />,
};

export function Icon({ name, className = "el-ic" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

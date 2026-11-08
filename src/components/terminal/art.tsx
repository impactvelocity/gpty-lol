"use client";

import { type CSSProperties, useId, useMemo } from "react";

/**
 * Art for the Mainframe costume (Shelly, FW-7). The cabinet, the lamps, the
 * map and the trace meter are CSS, because they react to the chat. What's
 * here: the console's big dot-matrix lettering, the tape reels and the
 * firewall's wireframe box. Each optional picture below has a drawn fallback,
 * so the costume is complete without any of them.
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot = "wallpaper" | "reflection" | "steel" | "reel";

/**
 * Generated pictures that replace the drawn fallbacks (prompts in
 * src/components/terminal/ART.md). Remove a line to fall back to the drawing.
 * The wallpaper and reflection are 1536px wide WebP, the steel a 512px tile,
 * the reel 512px with transparency.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/terminal/wallpaper.webp",
  reflection: "/terminal/reflection.webp",
  steel: "/terminal/steel.webp",
  reel: "/terminal/reel.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/** Small deterministic PRNG, so scattered details land in the same place every time. */
export function rand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/* ───────── Big dot-matrix letters ───────── */

/** A 5×7 matrix face, like the character ROM of a 1980s terminal. */
const FONT: Record<string, string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: [".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "#.#.#", ".#.#."],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  "-": [".....", ".....", ".....", ".###.", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", ".....", "..#.."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
};

/**
 * Text in big dot-matrix letters: every dot a little square of phosphor, so
 * it stays crisp at any size and glows like the rest of the screen. With
 * `paint`, the rows draw in from the top, one after another.
 */
export function BigText({
  text,
  className,
  style,
  paint = false,
  step = 80,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  paint?: boolean;
  step?: number;
}) {
  const rows = useMemo(() => {
    const out: number[][] = Array.from({ length: 7 }, () => []);
    [...text.toUpperCase()].forEach((ch, i) => {
      const g = FONT[ch] ?? FONT[" "];
      g.forEach((row, y) => {
        for (let x = 0; x < 5; x++) if (row[x] === "#") out[y].push(i * 6 + x);
      });
    });
    return out;
  }, [text]);
  const w = Math.max(1, text.length * 6 - 1);
  return (
    <svg viewBox={`0 0 ${w} 7`} className={className} style={style} aria-hidden>
      {rows.map((xs, y) => (
        <g
          key={y}
          className={paint ? "mf-paint" : undefined}
          style={paint ? ({ "--at": `${y * step}ms` } as CSSProperties) : undefined}
        >
          {xs.map((x) => (
            <rect key={x} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.14} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ───────── Tape reels ───────── */

/** An annular sector, angles in degrees clockwise from 12 o'clock. */
function sector(a0: number, a1: number, r0: number, r1: number) {
  const p = (a: number, r: number) => {
    const t = ((a - 90) * Math.PI) / 180;
    return `${(Math.cos(t) * r).toFixed(2)} ${(Math.sin(t) * r).toFixed(2)}`;
  };
  return `M${p(a0, r1)}A${r1} ${r1} 0 0 1 ${p(a1, r1)}L${p(a1, r0)}A${r0} ${r0} 0 0 0 ${p(a0, r0)}Z`;
}

/**
 * A 10½-inch reel of half-inch tape, face on: a smoky clear flange with three
 * spokes, the brown tape pack showing between them, the metal hub and the red
 * write-enable ring. `pack` is how full it is, 0 to 1. Spun by CSS.
 */
export function Reel({ pack = 0.7, className }: { pack?: number; className?: string }) {
  const id = useId();
  const src = art("reel");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" draggable={false} className={className} />;
  }
  const R = 48;
  const hub = 15;
  const packR = hub + 1 + (R - 5 - hub) * pack;
  const rings = Array.from({ length: Math.max(0, Math.floor((packR - hub - 2) / 2.6)) }, (_, i) => hub + 2.5 + i * 2.6);
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}p`}>
          <stop offset="0" stopColor="#1d140e" />
          <stop offset=".55" stopColor="#3a281b" />
          <stop offset="1" stopColor="#56402c" />
        </radialGradient>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1f4f7" />
          <stop offset=".45" stopColor="#8f99a5" />
          <stop offset="1" stopColor="#d5dbe1" />
        </linearGradient>
        <radialGradient id={`${id}f`} cx=".35" cy=".3" r=".9">
          <stop offset="0" stopColor="rgba(220,232,245,.22)" />
          <stop offset="1" stopColor="rgba(150,165,185,.08)" />
        </radialGradient>
      </defs>
      {/* The tape pack, with its faint growth rings. */}
      <circle r={packR} fill={`url(#${id}p)`} />
      {rings.map((r) => (
        <circle key={r} r={r} fill="none" stroke="rgba(140,105,70,.22)" strokeWidth=".35" />
      ))}
      <circle r={packR} fill="none" stroke="rgba(190,150,105,.35)" strokeWidth=".6" />
      {/* The flange: smoky clear plastic, three solid spokes between the windows. */}
      <circle r={R} fill={`url(#${id}f)`} />
      {[0, 120, 240].map((a) => (
        <path key={a} d={sector(a - 24, a + 24, hub + 1, R - 2.5)} fill="rgba(165,180,198,.34)" stroke="rgba(225,235,245,.4)" strokeWidth=".5" />
      ))}
      <circle r={R} fill="none" stroke="rgba(214,226,238,.7)" strokeWidth="1.3" />
      <circle r={R - 2.5} fill="none" stroke="rgba(214,226,238,.22)" strokeWidth=".6" />
      {/* The hub and its drive notches. */}
      <circle r={hub + 1.4} fill="none" stroke="#c43a2c" strokeWidth="1.5" />
      <circle r={hub} fill={`url(#${id}h)`} />
      <circle r={hub - 5.5} fill="#16181c" />
      {[0, 120, 240].map((a) => (
        <rect key={a} x="-1.4" y={-(hub - 3.2)} width="2.8" height="4" rx=".5" fill="#9aa4af" transform={`rotate(${a})`} />
      ))}
      <circle r="2.6" fill="#aab3bd" />
      {/* Light on the plastic. */}
      <path d="M-30 -36 A46 46 0 0 1 22 -42" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ───────── The firewall, on the intrusion map ───────── */

/** Shelly on the map: a wireframe box, turning slowly, drawn in vector light. */
export function Cube({ className = "" }: { className?: string }) {
  return (
    <span className={`mf-cube-wrap ${className}`} aria-hidden>
      <span className="mf-cube">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

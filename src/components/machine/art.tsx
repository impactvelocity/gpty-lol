"use client";

import type { CSSProperties } from "react";
import { MatrixRain } from "./rain";
import "./machine.css";

/**
 * Art for the Machine, 2199: the backdrop (black, with the Lattice's fine
 * circuitry and runes around the edges) and a few thin line icons. Almost
 * everything is white on black; the colour is in the backdrop's few lit
 * marks and the cyan of a word caught changing.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* ───────── Bitmap art ───────── */

export type ArtSlot = "wallpaper";

/**
 * The backdrop, 1585×992 (prompt and notes in src/components/machine/ART.md).
 * Its left 270px are empty on purpose: that's where the agent list sits.
 */
const FILES: Record<ArtSlot, string> = {
  wallpaper: "/machine/wallpaper.webp",
};

export function art(slot: ArtSlot): string {
  return FILES[slot];
}

/* ───────── The scene ───────── */

/**
 * The backdrop's small coloured marks, in its own pixels. Each one lights up
 * now and then, out of step with the others, like a relay somewhere in the
 * Lattice passing something on.
 */
const MARKS = [
  { x: 692, y: 32, w: 7, h: 3, c: "#5fdcec", d: 7.3 },
  { x: 1480, y: 102, w: 7, h: 2, c: "#cbb8ff", d: 11.1 },
  { x: 1206, y: 609, w: 4, h: 4, c: "#cdf56a", d: 5.9 },
  { x: 1214, y: 609, w: 4, h: 4, c: "#cdf56a", d: 5.9, dl: 0.18 },
  { x: 1479, y: 680, w: 17, h: 2, c: "#f2bdf0", d: 9.4 },
  { x: 1011, y: 919, w: 15, h: 3, c: "#5fdcec", d: 8.2 },
  { x: 1342, y: 919, w: 9, h: 2, c: "#cdf56a", d: 12.7 },
  { x: 576, y: 955, w: 7, h: 2, c: "#cbb8ff", d: 10.3 },
];

/**
 * One copy of the backdrop. `fit` is how it fills the screen: on desktop
 * it's pinned left so its empty band stays under the agent list; on a phone
 * (no list) it's pinned right, where the circuitry is.
 */
function Plate({ fit, className }: { fit: string; className: string }) {
  return (
    <svg viewBox="0 0 1585 992" preserveAspectRatio={fit} className={`mx-sc ${className}`} aria-hidden>
      <image href={art("wallpaper")} width="1585" height="992" />
      {MARKS.map((m, i) => (
        <rect
          key={i}
          className="mx-sc-mark"
          x={m.x}
          y={m.y}
          width={m.w}
          height={m.h}
          fill={m.c}
          style={{ "--d": `${m.d}s`, "--dl": `${-(i * 1.7 + (m.dl ?? 0))}s` } as Vars}
        />
      ))}
    </svg>
  );
}

/** The site's backdrop while Cora is open: the circuitry, and the rain over it. */
export function MachineScene() {
  return (
    <>
      <Plate fit="xMinYMid slice" className="max-md:hidden" />
      <Plate fit="xMaxYMid slice" className="md:hidden" />
      <MatrixRain />
    </>
  );
}

/* ───────── Icons ───────── */

export type IconName = "enter" | "stop" | "down";

/** Thin, squared-off line icons in the current colour. */
export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "square" as const, strokeLinejoin: "miter" as const };
  return (
    <svg viewBox="0 0 24 24" className={`mx-icon ${className}`} aria-hidden>
      {name === "enter" && (
        <g {...p}>
          <path d="M19 5v9H6" />
          <path d="M9.5 10.5L6 14l3.5 3.5" />
        </g>
      )}
      {name === "stop" && <rect x="7" y="7" width="10" height="10" fill="currentColor" />}
      {name === "down" && (
        <g {...p}>
          <path d="M12 4v15M6.5 13.5L12 19l5.5-5.5" />
        </g>
      )}
    </svg>
  );
}

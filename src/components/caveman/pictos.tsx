"use client";

import type { ReactNode } from "react";

/**
 * Grug's pictograms: the first emoji. Grug writes a code like (mammoth) and
 * the wall paints it, in red ochre with a little yellow, the way the oldest
 * cave paintings were done. Each is drawn in a 32×32 box as flat silhouettes
 * and thin brushed legs, so they read at 20px inside a sentence and at 120px
 * in the frieze. They use currentColor (red ochre) and `--p2` (yellow ochre).
 */

export type PictoId =
  | "mammoth" | "deer" | "bison" | "wolf" | "fish" | "bird" | "snake"
  | "fire" | "sun" | "moon" | "star" | "water" | "tree" | "flower" | "berry"
  | "hand" | "eye" | "man" | "tribe" | "spear" | "meat" | "rock" | "shiny" | "cave";

const BONE = "#f2e0c4";
const P2 = "var(--p2, #eaa64e)";
/** Brushed lines: legs, horns, spears. */
const brush = (w = 1.5) => ({ fill: "none", stroke: "currentColor", strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" }) as const;

/** The 12 rays and the rings of the spiral sun (also the GrugPT mark). */
function SunArt() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + 0.12;
        const r1 = 10.6;
        const r2 = i % 2 ? 13.4 : 14.6;
        return (
          <line
            key={i}
            x1={16 + Math.cos(a) * r1}
            y1={16 + Math.sin(a) * r1}
            x2={16 + Math.cos(a) * r2}
            y2={16 + Math.sin(a) * r2}
            {...brush(1.6)}
          />
        );
      })}
      <circle cx="16" cy="16" r="8.2" {...brush(1.7)} />
      <path d="M16 16.6c.5-.3.2-1.1-.4-1.1-1 0-1.4 1.2-.9 2 .7 1.1 2.4 1 3.1-.1.9-1.5-.1-3.4-1.8-3.6-2.2-.3-3.9 1.6-3.6 3.7.3 2.5 3 3.9 5.3 3.1" {...brush(1.4)} style={{ stroke: P2 }} />
    </>
  );
}

/** A hand, fingers up, as it was pressed on the wall. */
export const HAND_PATH =
  "M11.4 30c-2.2-2.6-3.4-5.4-3.6-8.6l-2.6-4.6c-.8-1.4.9-2.6 2-1.6l2.9 3.1.2-11.6c0-1.6 2.4-1.7 2.5 0l.4 8.7.6-12.2c.1-1.7 2.6-1.7 2.6 0l.2 12 1.3-10.4c.2-1.6 2.6-1.4 2.5.2l-.7 11.1 2.2-7.2c.5-1.5 2.7-.9 2.4.6l-1.8 10.3c-.5 3.1-1.4 6.3-3.3 9.7Z";

const ART: Record<PictoId, ReactNode> = {
  mammoth: (
    <>
      <path d="M4 20C3 14 6.2 9.2 12 7.6c4-1.1 8-.6 11 .9 3.2-.4 6 1.6 6.5 5 .4 2.4 0 5-.7 7.6-.4 1.8 0 3.2 1.7 4-1.9 1-3.6 0-3.9-2.2l-.4-3.4c-.8.7-1.7 1.2-2.4 1.5l.2 5.6h-2.6l-.5-4.8c-2.9.6-6.4.6-9.4.1l-.4 4.7H8.6l-.1-5.3C6.4 20.9 4.7 20.8 4 20Z" fill="currentColor" />
      <path d="M25.4 17.4c1.3 2.2 3.4 2.9 5.4 2.2" {...brush(1.4)} style={{ stroke: BONE }} />
      <path d="M4.4 15.2c-1.4.4-2.2 1.7-2.3 3.4" {...brush(1.3)} />
      <path d="M8 21.6l-.6 1.6M12 22.5l-.4 1.6M17 22.6v1.6" {...brush(1)} style={{ stroke: P2 }} />
    </>
  ),
  deer: (
    <>
      <path d="M7 15.2c2-2.6 7.6-3.1 12.8-2.6 1.8.2 3.4-.5 4.6-2.4l1.4-2.9c.6-.9 1.8-1.1 2.6-.4l2.1 1.6c-1 .6-2.3.7-3.2.5l-1.6 3.8c-.6 2.3-2.4 4-4.8 4.6-4.1 1-9.9 1-12.8 0-1.2-.4-1.6-1.3-1.1-2.2Z" fill="currentColor" />
      <path d="M22.4 16.4 26 21l3.2 1.8M21 17l3.2 6.8-.9 3.2M9.6 16.6 5.4 21 2.2 22.2M10.6 17.2 8.4 23.6l.8 3.4M7.4 14.6 5.6 13.2" {...brush(1.35)} />
      <path d="M27 6.6c-.6-2-2.2-3.2-3.8-3.6M26.2 4.8l1.2-2.2M24.8 3.6l-.3-2.1" {...brush(1.1)} />
      <path d="M12 14.4c2.6-.6 5.4-.6 7.6-.1" {...brush(1.6)} style={{ stroke: P2 }} />
    </>
  ),
  bison: (
    <>
      <path d="M28 17c.5-4-1-6.5-4.5-7-3.5-.5-6.5-.8-9.5-2.2-3-1.4-6.4-.8-8 1.8L4.4 12.4c-1 1.8-1 4.2 0 5.6.6 1 2 1.6 3.2 1.2 1 1.4 2.4 2 3.8 1.8l.2 5h2.4l.4-4.6c3.6.4 7 .2 9-.4l.6 5h2.4l.2-5.6c1-.8 1.4-2 1.4-3.4Z" fill="currentColor" />
      <path d="M6.4 9.4C5 8 5 6.4 6.2 5.4M28 14.4c1.6.6 2.4 2.2 2.2 4.2" {...brush(1.3)} />
      <path d="M12 9.8c1.8 1.6 2 4.6.6 7" {...brush(1.6)} style={{ stroke: P2 }} />
      <circle cx="6.6" cy="12.6" r=".8" fill={BONE} />
    </>
  ),
  wolf: (
    <>
      <path d="M5.2 13.6c2.2.8 4.4 1 6.6.9 3.5-.1 7-.4 9.4-.6l1.8-3.6.6-3.6 1.8 2.6h1.4l1.2-2.6.6 3.6c1.2 1 1.9 2 2 3.2l-2.8 1.4c-.9 1.2-2 2-3 2.6v7.8h-2.2l-.6-6.8c-3.6.6-7.2.6-10.4 0l-.6 6.8H9.6l-.4-7.6c-1.6-.8-3-2.2-4-4.1Z" fill="currentColor" />
      <path d="M5.4 13.8C3.4 13 2.4 11 2.6 8.4" {...brush(1.8)} />
      <circle cx="26.2" cy="11.4" r=".75" fill={BONE} />
    </>
  ),
  fish: (
    <>
      <path d="M3.6 16c3.8-5.8 12-7.4 18.4-3l6.4-4.2-1.4 7.2 1.4 7.2-6.4-4.2c-6.4 4.4-14.6 2.8-18.4-3Z" fill="currentColor" />
      <circle cx="8.6" cy="15" r="1.1" fill={BONE} />
      <path d="M12.6 12.6c1.2 2.2 1.2 4.6 0 6.8M16.4 12.6c.9 2.2.9 4.6 0 6.8" {...brush(1.1)} style={{ stroke: P2 }} />
    </>
  ),
  bird: (
    <>
      <path d="M2.6 11.8c4.6-1.2 8.6.2 11.6 3.6 1-.9 2.6-1.2 4-.4 2.8-3.6 6.8-5 11.2-4.2-3.6 1.2-6.8 3.6-8.6 6.8-1.2 2-3.2 3-5 2.8l-1 2.8-1-3c-1.6-1-2.4-2.6-3.4-4-2.2-2.2-4.8-3.6-7.8-4.4Z" fill="currentColor" />
      <path d="M17.4 14.8l1.8-1.2" {...brush(1.1)} />
    </>
  ),
  snake: (
    <>
      <path d="M3.6 23.4c2.4-5.8 6.8-6.6 8.8-2.4 2.2 4.4 6 4.6 7.8-1.6 1.6-5.6 5.4-7 7.6-4" {...brush(2.8)} />
      <ellipse cx="28.4" cy="14.4" rx="2.4" ry="1.8" fill="currentColor" transform="rotate(-24 28.4 14.4)" />
      <path d="M30.4 13l1.4-1.2M30.6 13.4l1.6-.2" {...brush(0.8)} style={{ stroke: P2 }} />
      <path d="M6.8 19.6l.8 1M15 22.4l.8-.8M22.4 16.6l.6.9" {...brush(1)} style={{ stroke: P2 }} />
    </>
  ),
  fire: (
    <>
      <path d="M16 2.6c1.8 5 7.2 7.2 7.6 13.8.4 5.6-3.2 10.4-7.6 10.4-4.6 0-8-3.4-7.6-8.4.3-3.4 2.4-5.6 3.6-7.8.4 2.4 1.4 3.4 2.4 3.8-.4-4.4.4-8.4 1.6-11.8Z" fill="currentColor" />
      <path d="M16 12.6c1.2 3 4 4.6 3.6 8.4-.2 2.4-1.8 3.8-3.6 3.8-2 0-3.4-1.6-3.2-3.6.2-1.8 1.6-2.8 2.2-4.4.6 1 1 1.4 1.6 1.4-.4-1.8-.8-3.4-.6-5.6Z" style={{ fill: P2 }} />
      <path d="M7.6 28.8 24.4 25.6M7.6 25.6l16.8 3.2" {...brush(1.8)} />
    </>
  ),
  sun: <SunArt />,
  moon: (
    <>
      <path d="M20.4 4.4C13.2 5.4 8.8 10.6 8.8 16.4s4.4 11 11.6 12c-5.2-2.6-7.8-7-7.8-12s2.6-9.4 7.8-12Z" fill="currentColor" />
      <circle cx="25" cy="9" r=".9" style={{ fill: P2 }} />
      <circle cx="27.4" cy="16" r=".7" style={{ fill: P2 }} />
      <circle cx="24.4" cy="23" r=".8" style={{ fill: P2 }} />
    </>
  ),
  star: (
    <>
      <path d="M16 2.6c1 8.4 5 12.4 13.4 13.4-8.4 1-12.4 5-13.4 13.4-1-8.4-5-12.4-13.4-13.4 8.4-1 12.4-5 13.4-13.4Z" style={{ fill: P2 }} />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="26.6" cy="26.4" r="1.1" fill="currentColor" />
      <circle cx="26" cy="6.4" r=".7" fill="currentColor" />
    </>
  ),
  water: (
    <path d="M3 10.4c2.2-2 4.4-2 6.6 0s4.4 2 6.6 0 4.4-2 6.6 0 4.2 2 6.2.2M3 17c2.2-2 4.4-2 6.6 0s4.4 2 6.6 0 4.4-2 6.6 0 4.2 2 6.2.2M3 23.6c2.2-2 4.4-2 6.6 0s4.4 2 6.6 0 4.4-2 6.6 0 4.2 2 6.2.2" {...brush(1.9)} />
  ),
  tree: (
    <>
      <path d="M16 29V6M16 21.4l-5.6-5.2M16 17.4l5.8-5.4M16 13.4l-4.4-4.6M16 10.4l3.6-4" {...brush(1.8)} />
      <path d="M11.4 30h9.2" {...brush(1.4)} style={{ stroke: P2 }} />
      <circle cx="9.6" cy="15.4" r="1.3" style={{ fill: P2 }} />
      <circle cx="22.6" cy="11.2" r="1.3" style={{ fill: P2 }} />
      <circle cx="10.8" cy="8" r="1.1" style={{ fill: P2 }} />
      <circle cx="20.2" cy="5.2" r="1.1" style={{ fill: P2 }} />
    </>
  ),
  flower: (
    <>
      <path d="M16 15.6V29M16 24c-2.6-2.8-5.8-3-7.4-1.6 2.2 1.8 4.6 2.2 7.4 1.6Z" {...brush(1.4)} />
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return <ellipse key={i} cx={16 + Math.cos(a) * 5.2} cy={10.6 + Math.sin(a) * 5.2} rx="3" ry="2.4" transform={`rotate(${(a * 180) / Math.PI} ${16 + Math.cos(a) * 5.2} ${10.6 + Math.sin(a) * 5.2})`} fill="currentColor" />;
      })}
      <circle cx="16" cy="10.6" r="2.6" style={{ fill: P2 }} />
    </>
  ),
  berry: (
    <>
      <path d="M16.6 13.4c0-3.6 1.4-6.4 4.4-8M18.8 7.4c2.4-1.6 5.4-1.4 7 .4-2.2 1.4-4.8 1.4-7-.4Z" {...brush(1.3)} style={{ stroke: P2 }} />
      <circle cx="11.8" cy="18.4" r="4.6" fill="currentColor" />
      <circle cx="20.4" cy="17.4" r="4.6" fill="currentColor" />
      <circle cx="16" cy="24.8" r="4.6" fill="currentColor" />
      <circle cx="10.4" cy="16.8" r="1" fill={BONE} opacity=".8" />
      <circle cx="19" cy="15.8" r="1" fill={BONE} opacity=".8" />
      <circle cx="14.6" cy="23.2" r="1" fill={BONE} opacity=".8" />
    </>
  ),
  hand: <path d={HAND_PATH} fill="currentColor" />,
  eye: (
    <>
      <path d="M2.6 16c3.6-5.6 8-8.2 13.4-8.2S25.8 10.4 29.4 16c-3.6 5.6-8 8.2-13.4 8.2S6.2 21.6 2.6 16Z" {...brush(1.9)} />
      <circle cx="16" cy="16" r="4.4" fill="currentColor" />
      <circle cx="17.4" cy="14.6" r="1.2" style={{ fill: P2 }} />
      <path d="M8 6.4l1.4 2.2M16 4v2.6M24 6.4l-1.4 2.2" {...brush(1.3)} style={{ stroke: P2 }} />
    </>
  ),
  man: (
    <>
      <circle cx="16" cy="6" r="3.2" fill="currentColor" />
      <path d="M13.2 10.6h5.6l-.8 8.6h-4Z" fill="currentColor" />
      <path d="M13.4 11.2 8.6 16.4l-1.2 3.2M18.6 11.2l4.4 3.6 1.6-3.8M14.4 19l-2.6 9.4M17.6 19l2.6 9.4" {...brush(1.9)} />
    </>
  ),
  tribe: (
    <>
      {[
        { x: 7, s: 0.78, y: 6.6 },
        { x: 25, s: 0.78, y: 6.6 },
        { x: 16, s: 0.96, y: 0 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x - 16 * p.s} ${p.y}) scale(${p.s})`}>
          <circle cx="16" cy="7" r="3.2" fill="currentColor" />
          <path d="M13.4 11.4h5.2l-.7 8.4h-3.8Z" fill="currentColor" />
          <path d="M15 19.6l-2 9M17 19.6l2 9" {...brush(2)} />
        </g>
      ))}
      <path d="M2.4 18.4 8 14.4l3.4 2.8L16 14l4.6 3.2 3.4-2.8 5.6 4" {...brush(1.5)} style={{ stroke: P2 }} />
    </>
  ),
  spear: (
    <>
      <path d="M4.4 27.6 22.4 9.6" {...brush(1.9)} />
      <path d="M21.2 10.8c1-3.2 3.6-6 8.2-8.2-2.2 4.6-5 7.2-8.2 8.2Z" style={{ fill: P2 }} stroke="currentColor" strokeWidth=".9" strokeLinejoin="round" />
      <path d="M17.6 12.4l2 2M16.4 13.6l2 2" {...brush(1.1)} />
      <path d="M4.6 27.4 2.4 26.8M4.6 27.4 5.2 29.6" {...brush(1.2)} />
    </>
  ),
  meat: (
    <>
      <path d="M14.6 22.4c-4.2 1-8.6-1.6-9.4-6-.8-4.6 2.6-9 7.6-9.6 5.4-.6 9.6 3.2 9.2 8-.2 2.2-1.2 3.8-2.4 5" fill="currentColor" />
      <path d="M15 21.4l6.6 5.8" fill="none" stroke={BONE} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="23.2" cy="26.4" r="1.7" fill={BONE} />
      <circle cx="21.8" cy="28.6" r="1.7" fill={BONE} />
      <path d="M9.6 12.6c1.4-1.6 3.4-2.2 5.4-1.8" {...brush(1.4)} style={{ stroke: P2 }} />
    </>
  ),
  rock: (
    <>
      <path d="M4.6 24 7.8 13.4 15 8.2l8.4 1.4 5 6.8-.8 8.2-9.6 3.6-9.4-.6Z" fill="currentColor" />
      <path d="M15 8.6 13.4 15.4l4.6 3.4M13.4 15.4 7.8 17" fill="none" stroke="#1d0f0c" strokeOpacity=".55" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 11.4l3.6.8" {...brush(1.2)} style={{ stroke: P2 }} />
    </>
  ),
  shiny: (
    <>
      <path d="M16 3.6 23.4 10.6 20.2 27.6H11.8L8.6 10.6Z" style={{ fill: P2 }} />
      <path d="M8.6 10.6h14.8M16 3.6l-3 7 2.4 17M16 3.6l3 7-2.6 17" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M27 4.4v4.4M24.8 6.6h4.4M5 18.4v3.2M3.4 20h3.2" {...brush(1.2)} />
    </>
  ),
  cave: (
    <>
      <path d="M2.6 28.4C3.4 15.6 8.8 5.4 16 5.4s12.6 10.2 13.4 23h-7c-.4-6.6-2.8-11-6.4-11s-6 4.4-6.4 11Z" fill="currentColor" />
      <path d="M14.2 23.6c.4-1.6 1-2.4 1.8-2.4s1.4.8 1.8 2.4" {...brush(1.3)} style={{ stroke: P2 }} />
      <path d="M8 10.4l1.4 1.4M24 10.4l-1.4 1.4" {...brush(1.2)} style={{ stroke: P2 }} />
    </>
  ),
};

/** Names as Grug would read them (for labels and screen readers). */
export const PICTO_NAMES: Record<PictoId, string> = {
  mammoth: "MAMMOTH", deer: "DEER", bison: "BISON", wolf: "WOLF", fish: "FISH", bird: "BIRD", snake: "SNAKE",
  fire: "FIRE", sun: "SUN", moon: "MOON", star: "STAR", water: "WATER", tree: "TREE", flower: "FLOWER", berry: "BERRY",
  hand: "HAND", eye: "EYE", man: "MAN", tribe: "TRIBE", spear: "SPEAR", meat: "MEAT", rock: "ROCK", shiny: "SHINY ROCK", cave: "CAVE",
};

export const PICTO_IDS = Object.keys(ART) as PictoId[];

/** A code in text: (mammoth), (Fire), (berries) and (stars) all count. */
const ALIASES: Record<string, PictoId> = { berries: "berry", stars: "star", fishes: "fish", birds: "bird", hands: "hand", rocks: "rock", trees: "tree", flowers: "flower", people: "tribe" };
const WORDS = [...PICTO_IDS, ...Object.keys(ALIASES)].sort((a, b) => b.length - a.length).join("|");
export const PICTO_RE = new RegExp(`\\((${WORDS})\\)`, "gi");
const SPLIT = new RegExp(`(\\((?:${WORDS})\\))`, "gi");

export function pictoOf(word: string): PictoId | undefined {
  const w = word.toLowerCase();
  if (ALIASES[w]) return ALIASES[w];
  return (PICTO_IDS as string[]).includes(w) ? (w as PictoId) : undefined;
}

/** One pictogram. Painted with the wall's rough-edge filter when it's in the window. */
export function Picto({ id, className = "cv-picto", label, paint = true, size }: {
  id: PictoId;
  className?: string;
  label?: string;
  paint?: boolean;
  /** Fixed size in px (or user units, nested in another SVG). */
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      data-p={id}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {label && <title>{label}</title>}
      <g filter={paint ? "url(#cv-paint)" : undefined}>{ART[id]}</g>
    </svg>
  );
}

function Inline({ text }: { text: string }) {
  const parts = text.split(SPLIT);
  return (
    <>
      {parts.map((p, i) => {
        const id = i % 2 ? pictoOf(p.slice(1, -1)) : undefined;
        return id ? <Picto key={i} id={id} label={PICTO_NAMES[id]} /> : p || null;
      })}
    </>
  );
}

/** A line that's nothing but two or more pictures: Grug painted something. */
const MURAL = new RegExp(`^\\s*(?:\\((?:${WORDS})\\)[\\s,.→-]*){2,}$`, "i");

/**
 * Text with its (codes) painted as pictograms. With `murals`, a line made only
 * of pictures is painted large, as a little mural of its own.
 */
export function Pictos({ text, murals = false }: { text: string; murals?: boolean }) {
  if (!murals) return <Inline text={text} />;
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const last = i === lines.length - 1;
        if (MURAL.test(line)) {
          const ids = [...line.matchAll(PICTO_RE)].map((m) => pictoOf(m[1])).filter((x): x is PictoId => !!x);
          return (
            <span key={i} className="cv-mural" role="img" aria-label={ids.map((id) => PICTO_NAMES[id]).join(", ")}>
              {ids.map((id, j) => (
                <Picto key={j} id={id} />
              ))}
            </span>
          );
        }
        return (
          <span key={i}>
            <Inline text={line} />
            {last ? null : "\n"}
          </span>
        );
      })}
    </>
  );
}

/* ───────── Gifts ───────── */

/** What you can give Grug, and what Grug gives back. */
export const GIFTS = ["berry", "meat", "fish", "shiny", "flower", "fire"] as const satisfies readonly PictoId[];
export type Gift = (typeof GIFTS)[number];

export const GIFT_RE = /^\/give\s+(berry|berries|meat|fish|shiny(?:\s+rock)?|flower|fire)\s*$/i;

export function giftOf(word: string): Gift {
  const w = word.toLowerCase();
  if (w.startsWith("berr")) return "berry";
  if (w.startsWith("shiny")) return "shiny";
  return (GIFTS as readonly string[]).includes(w) ? (w as Gift) : "berry";
}

export const GIFT_NAMES: Record<Gift, string> = {
  berry: "BERRY", meat: "MEAT", fish: "FISH", shiny: "SHINY ROCK", flower: "FLOWER", fire: "WARM FIRE",
};

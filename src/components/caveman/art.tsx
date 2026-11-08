"use client";

import { type CSSProperties, useId, useMemo } from "react";
import { HAND_PATH, Picto, type PictoId } from "./pictos";

/**
 * Art for GrugPT, the cave's chat app: the spiral-sun mark, the hand stencil,
 * the painted frieze over the empty wall, the old paintings hidden in the rock
 * and the brushed icons. Everything is drawn in the oldest palette there is:
 * red and yellow ochre, charcoal and bone, on warm rock.
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot = "wallpaper" | "wall" | "frieze" | "hand";

/**
 * Generated pictures that replace the drawn fallbacks (prompts and sizes in
 * src/components/caveman/ART.md). Remove a line to fall back to the drawing.
 * The wallpaper and the wall are 1536×1024; the frieze (1536×512) and the
 * hand (512×512) are cut-outs with alpha.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/caveman/wallpaper.webp",
  wall: "/caveman/wall.webp",
  frieze: "/caveman/frieze.webp",
  hand: "/caveman/hand.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/* ───────── Shared filters ───────── */

/**
 * Pigment on rock: edges that wobble a little, and tiny gaps where the paint
 * didn't take. Lives inside the window; anything drawn outside it (the
 * sidebar row, the scene) brings its own or goes without.
 */
export function CaveDefs() {
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden focusable="false">
      <defs>
        <filter id="cv-paint" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves="1" seed="9" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.45" result="speck" />
          <feComposite in="d" in2="speck" operator="in" />
        </filter>
        {/* A brushed edge for big swipes of paint (the composer): long, lazy wobbles. */}
        <filter id="cv-brush" x="-4%" y="-25%" width="108%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.07" numOctaves="3" seed="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/* ───────── Marks ───────── */

/**
 * Your hand on the wall, the oldest signature there is: a hand held to the
 * rock and red ochre blown around it, so the hand stays bare stone.
 */
export function HandStencil({ className = "", rotate = 0, color = "#c9522a" }: { className?: string; rotate?: number; color?: string }) {
  const id = useId().replace(/:/g, "");
  const photo = art("hand");
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" draggable={false} className={className} style={{ rotate: `${rotate}deg` }} />;
  }
  return (
    <svg viewBox="0 0 64 64" className={className} style={{ rotate: `${rotate}deg` }} aria-hidden>
      <defs>
        <radialGradient id={`${id}g`} cx=".5" cy=".52" r=".5">
          <stop offset="0" stopColor={color} stopOpacity=".95" />
          <stop offset=".55" stopColor={color} stopOpacity=".78" />
          <stop offset=".85" stopColor={color} stopOpacity=".28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}s`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2" result="s" />
          <feComposite in="SourceGraphic" in2="s" operator="in" />
        </filter>
        <mask id={`${id}m`}>
          <rect width="64" height="64" fill="#fff" />
          <path d={HAND_PATH} transform="translate(9.4 6.6) scale(1.42)" fill="#000" />
        </mask>
      </defs>
      <g filter={`url(#${id}s)`}>
        <circle cx="32" cy="33" r="31" fill={`url(#${id}g)`} mask={`url(#${id}m)`} />
      </g>
    </svg>
  );
}

/* ───────── The frieze over the empty wall ───────── */

function rand(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** A painted rule of dots, like the borders on the oldest friezes. */
function DotRule({ y, seed, w = 640 }: { y: number; seed: number; w?: number }) {
  const dots = useMemo(() => {
    const r = rand(seed);
    return Array.from({ length: Math.floor(w / 13) }, (_, i) => ({ x: 6 + i * 13 + r() * 3, y: y + (r() - 0.5) * 2, r: 1.5 + r() * 1.1 }));
  }, [seed, y, w]);
  return (
    <>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="currentColor" />
      ))}
    </>
  );
}

const HERD: { id: PictoId; x: number; y: number; s: number; d?: number; flip?: boolean; run?: boolean }[] = [
  { id: "deer", x: 26, y: 30, s: 2.7, run: true, d: 0 },
  { id: "deer", x: 120, y: 54, s: 2.1, run: true, d: 0.25 },
  { id: "mammoth", x: 214, y: 24, s: 3.4, d: 0.5 },
  { id: "bison", x: 338, y: 36, s: 2.9, flip: true, d: 0.15 },
  { id: "deer", x: 444, y: 28, s: 2.5, run: true, d: 0.4 },
  { id: "sun", x: 546, y: 22, s: 2.9 },
];

/**
 * A herd running across the empty wall under the spiral sun, between two
 * painted rules of dots. The picture once it's in (see ART.md), else drawn.
 */
export function Frieze({ className = "" }: { className?: string }) {
  const photo = art("frieze");
  const specks = useMemo(() => {
    const r = rand(77);
    return Array.from({ length: 16 }, () => ({ x: 10 + r() * 620, y: 26 + r() * 98, r: 1.2 + r() * 1.4 }));
  }, []);
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" draggable={false} className={`cv-frieze cv-frieze-img ${className}`} />;
  }
  return (
    <svg viewBox="0 0 640 150" className={`cv-frieze ${className}`} aria-hidden>
      <g filter="url(#cv-paint)">
        <DotRule y={8} seed={41} />
        <DotRule y={142} seed={43} />
        {specks.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="currentColor" opacity=".8" />
        ))}
        {HERD.map((a, i) => (
          <g key={i} transform={`translate(${a.x + (a.flip ? 32 * a.s : 0)} ${a.y}) scale(${a.flip ? -a.s : a.s} ${a.s})`}>
            <g className={a.run ? "cv-run" : a.id === "sun" ? "cv-turn" : "cv-sway"} style={{ animationDelay: `${-(a.d ?? 0)}s` } as CSSProperties}>
              <Picto id={a.id} className="cv-frieze-p" paint={false} size={32} />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ───────── Old paintings in the rock ───────── */

const OLD: { id: PictoId | "stencil" | "tally"; x: string; y: string; w: number; r?: number; o?: number }[] = [
  { id: "hand", x: "3%", y: "13%", w: 58, r: -16 },
  { id: "hand", x: "7.4%", y: "18%", w: 46, r: 10, o: 0.8 },
  { id: "stencil", x: "89%", y: "9%", w: 96, r: 12 },
  { id: "mammoth", x: "74%", y: "46%", w: 190, o: 0.9 },
  { id: "deer", x: "8%", y: "54%", w: 120, r: -4 },
  { id: "deer", x: "16%", y: "62%", w: 92, r: 3, o: 0.8 },
  { id: "tally", x: "58%", y: "10%", w: 120 },
  { id: "sun", x: "44%", y: "68%", w: 96, o: 0.7 },
  { id: "man", x: "88%", y: "74%", w: 64, r: 4 },
  { id: "spear", x: "82%", y: "78%", w: 72, r: -10, o: 0.8 },
  { id: "bison", x: "28%", y: "30%", w: 120, o: 0.7 },
  { id: "stencil", x: "33%", y: "86%", w: 70, r: -20, o: 0.8 },
  { id: "fish", x: "62%", y: "88%", w: 70, o: 0.7 },
];

/** Tally marks: someone counting moons, in fives, long ago. */
function Tally() {
  return (
    <svg viewBox="0 0 120 40" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" filter="url(#cv-paint)">
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${8 + i * 10} 6 L${7 + i * 10} 34`} />
        ))}
        <path d="M2 28 L46 10" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${66 + i * 10} 6 L${65 + i * 10} 34`} />
        ))}
      </g>
    </svg>
  );
}

/**
 * The paintings that were here before Grug: handprints, a herd, someone's
 * tally of moons. Faint until your torch passes over them (the window masks
 * this layer around the pointer).
 */
export function OldPaintings() {
  return (
    <div className="cv-old" aria-hidden>
      {OLD.map((p, i) => (
        <span
          key={i}
          className="cv-old-p"
          style={{ left: p.x, top: p.y, width: p.w, rotate: `${p.r ?? 0}deg`, opacity: p.o ?? 1 }}
        >
          {p.id === "stencil" ? <HandStencil className="block w-full" color="#b4472a" /> : p.id === "tally" ? <Tally /> : <Picto id={p.id} className="block w-full" />}
        </span>
      ))}
    </div>
  );
}

/* ───────── Brushed icons ───────── */

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

type IconName =
  | "plus" | "stop" | "pen" | "arrowDown" | "smash";

const ICONS: Record<IconName, React.ReactNode> = {
  plus: <path d="M12.1 5.2c-.2 4.6-.1 9.2.1 13.6M5.2 12.1c4.6-.3 9.1-.2 13.6.1" {...stroke} />,
  stop: <rect x="7" y="7" width="10" height="10" rx="2.6" fill="currentColor" />,
  pen: (
    <>
      <path d="M5 19.2 6 15l9.6-9.6c.8-.8 2-.8 2.8 0l.2.2c.8.8.8 2 0 2.8L9.1 18Z" {...stroke} />
      <path d="M13.8 7.4l2.8 2.8" {...stroke} />
    </>
  ),
  arrowDown: <path d="M12.1 5c-.2 4.4-.1 8.8.1 13M6.8 12.8c1.9 1.9 3.6 3.7 5.3 5.6 1.8-1.9 3.6-3.8 5.4-5.6" {...stroke} />,
  smash: (
    <>
      <path d="M4.6 19.4 9.4 17l3.2 2.4 2.6-3.6 4.2 1.4" {...stroke} />
      <path d="M8 6.4l1.8 4.2M15.8 5.8l-1.2 4.6M19.6 11l-3.4 1.6M4.4 11.4l3.6 1" {...stroke} strokeWidth={1.8} />
    </>
  ),
};

export function Icon({ name, className = "cv-ic" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

/**
 * The send button's face: a knapped flint arrowhead, point up, the way
 * GrugPT says "send".
 */
export function Arrowhead({ className = "cv-ic" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2.6c2.8 3.2 4.8 7.2 5.6 11.8-1.5 1.7-3.4 2.7-5.6 3.1-2.2-.4-4.1-1.4-5.6-3.1C7.2 9.8 9.2 5.8 12 2.6Z" fill="currentColor" />
      <path d="M12 5.4 10.4 9.6M12 5.4l1.6 4.2M9 11.4l3 2.2 3-2.2M8.2 14l3.8 1.6 3.8-1.6" fill="none" stroke="#f2e0c4" strokeOpacity=".55" strokeWidth=".9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17.4v4.4M10 20.4l2 1.4 2-1.4" {...stroke} strokeWidth={1.9} />
    </svg>
  );
}

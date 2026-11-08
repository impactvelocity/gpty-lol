"use client";

import type { CSSProperties } from "react";

/**
 * Art for Mortimer's séance, 1888: a candlelit spirit board engraved in
 * antique gold and bone on warm charcoal, seen through old film. The sun and
 * moon faces, the planchette, the candles on their saucers, the moths and
 * the little icons are all drawn here, so the whole costume works with no
 * pictures at all. Generated pictures can replace some of them (ART.md).
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot = "wallpaper" | "sun" | "moon" | "eye";

/**
 * Generated pictures that replace the drawn fallbacks (prompts and sizes in
 * src/components/seance/ART.md). Uncomment a line once its file is in
 * public/seance/; remove it to go back to the drawing.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/seance/wallpaper.webp",
  // sun: "/seance/sun.webp",
  // moon: "/seance/moon.webp",
  // eye: "/seance/eye.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/* ───────── Shared ───────── */

/** Bone ink, antique gold for the engraving, ember for anything the spirits touch. */
export const BONE = "#ECE3CF";
export const GOLD = "#C9A55A";
export const EMBER = "#FF6A2B";

export function rand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * Worn printer's ink: line edges that wobble a hair, and specks where the
 * ink didn't take. Lives once inside the window; things drawn outside it go
 * without.
 */
export function SeanceDefs() {
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden focusable="false">
      <defs>
        <filter id="sp-ink" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="12" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.3" result="speck" />
          <feComposite in="d" in2="speck" operator="in" />
        </filter>
        {/* Heavier wear, for the big type: scratched and pitted like an old title card. */}
        <filter id="sp-worn" x="-5%" y="-10%" width="110%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="8" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="3" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -4 3.1" result="speck" />
          <feComposite in="d" in2="speck" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/** A four-point star on a 24-unit grid, pinched thin like an engraving. */
export const STAR = "M12 0C12.6 8.2 15.8 11.4 24 12 15.8 12.6 12.6 15.8 12 24 11.4 15.8 8.2 12.6 0 12 8.2 11.4 11.4 8.2 12 0z";

/** A star centered on x,y, `s` across. */
export function Star({ x = 0, y = 0, s = 12, className = "sp-gold-fill", style }: { x?: number; y?: number; s?: number; className?: string; style?: CSSProperties }) {
  return <path d={STAR} transform={`translate(${x - s / 2} ${y - s / 2}) scale(${s / 24})`} className={className} style={style} />;
}

/* ───────── The sun (YES) ───────── */

/** Fine rays, alternating long and short, every sixth reaching furthest. */
const SUN_RAYS = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2;
  const len = i % 6 === 0 ? 24 : i % 2 === 0 ? 16 : 9;
  const r1 = 40;
  const r2 = r1 + len;
  const f = (n: number) => Math.round(n * 100) / 100;
  return `M${f(Math.sin(a) * r1)} ${f(-Math.cos(a) * r1)}L${f(Math.sin(a) * r2)} ${f(-Math.cos(a) * r2)}`;
}).join("");

/** The sun with a sleeping face in a ring of fine, slowly turning rays. Centered on x,y. */
export function SunFace({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const photo = art("sun");
  if (photo) return <image href={photo} x={x - 70 * s} y={y - 70 * s} width={140 * s} height={140 * s} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g className="sp-sun-rays">
        <path d={SUN_RAYS} className="sp-gold-line" strokeWidth=".8" />
      </g>
      <g className="sp-bone-line">
        <circle r="34" strokeWidth="1.6" />
        <circle r="29.5" strokeWidth=".7" strokeDasharray=".1 3" />
        {/* Sleeping eyes with lashes, a long nose and a small smile. */}
        <path d="M-15 -5Q-9.5 1 -3.5 -5M3.5 -5Q9.5 1 15 -5" strokeWidth="1.4" />
        <path d="M-12.4 -2l-1.1 2.2M-9.4 -1v2.4M-6.4 -2l1.1 2.2M12.4 -2l1.1 2.2M9.4 -1v2.4M6.4 -2l-1.1 2.2" strokeWidth=".9" />
        <path d="M-16 -11.5Q-9.5 -15 -3.5 -11.5M3.5 -11.5Q9.5 -15 16 -11.5" strokeWidth="1" />
        <path d="M0 -5Q-3.6 5.4 -.9 8.2Q.9 9 2.7 7.8" strokeWidth="1.2" />
        <path d="M-9 14.5Q0 20.5 9 14.5" strokeWidth="1.4" />
      </g>
    </g>
  );
}

/* ───────── The moon (NO) ───────── */

/** A crescent moon with a sleeping profile, hatched like an engraving. Centered on x,y. */
export function MoonFace({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const photo = art("moon");
  if (photo) return <image href={photo} x={x - 70 * s} y={y - 70 * s} width={140 * s} height={140 * s} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-50 -50)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g className="sp-bone-line">
        <path
          d="M60 8A43 43 0 1 0 60 92C52 90 46 85 47 79C48 76 51 75 50 72C49 70 46 70 46 69C47 67 51 67 51 66C50 64 48 63 49 61C51 59 56 58 57 56C54 53 48 51 47 48C45 45 44 44 44 42C42 36 42 30 45 24C48 17 53 12 60 8Z"
          strokeWidth="1.6"
        />
        <path d="M33.5 41.5Q38 45 42 41.5" strokeWidth="1.2" />
        <path d="M34.6 43l-1.4 1.9M38 44v2.3M41 43l1.3 1.9" strokeWidth=".8" />
        <path d="M32.5 36Q37.5 33.2 43 35.4" strokeWidth=".9" />
      </g>
      {/* Engraver's hatching down the back of the moon. */}
      <g className="sp-gold-line" strokeWidth=".8" opacity=".7">
        <path d="M14 34Q10 50 15 66" />
        <path d="M19 26Q13 50 20 75" />
        <path d="M25 20Q18 50 26 82" />
        <path d="M31 16Q25 50 32 86" opacity=".6" />
      </g>
      <Star x={84} y={24} s={13} className="sp-gold-fill sp-twinkle" />
      <Star x={92} y={60} s={8} className="sp-gold-fill sp-twinkle" style={{ animationDelay: "-1.4s" }} />
      <circle cx="76" cy="86" r="1.2" className="sp-gold-fill" />
      <circle cx="96" cy="40" r="1" className="sp-gold-fill" />
    </g>
  );
}

/* ───────── The all-seeing eye ───────── */

/** The almond of the eye, centered on 0,0, about 124 wide. */
export const EYE_ALMOND = "M-62 0C-36 -34 36 -34 62 0C36 34 -36 34 -62 0Z";

/* ───────── The planchette ───────── */

/** The planchette's outline: a heart pointing up, its lens (the eye) at 0,0. */
export const PLANCHETTE = "M0 -66C15 -48 47 -15 47 14C47 37 30 49 14 47C7 46 3 42 0 38C-3 42 -7 46 -14 47C-30 49 -47 37 -47 14C-47 -15 -15 -48 0 -66Z";
/** Radius of the lens: the eye's iris is a window onto the board. */
export const LENS_R = 15;

/**
 * The planchette's body, drawn around a lens at 0,0: smoked glass with an
 * eye whose iris is the lens, a crescent near the tip and a fan of rays.
 * The lens itself is drawn by the board (it magnifies the letters).
 */
export function PlanchetteBody() {
  const rays = Array.from({ length: 9 }, (_, i) => {
    const a = ((-150 + i * 15) * Math.PI) / 180;
    const r2 = i % 2 ? 28 : 32;
    return `M${(Math.cos(a) * 22).toFixed(1)} ${(Math.sin(a) * 22).toFixed(1)}L${(Math.cos(a) * r2).toFixed(1)} ${(Math.sin(a) * r2).toFixed(1)}`;
  }).join("");
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d={PLANCHETTE} className="sp-plan-glass" />
      <path d={PLANCHETTE} fill="none" className="sp-bone-line" strokeWidth="1.8" />
      <path d={PLANCHETTE} transform="translate(0 3) scale(.86)" fill="none" className="sp-gold-line" strokeWidth=".9" strokeDasharray=".1 3.4" />
      <path d="M-31 0C-19 -17 19 -17 31 0C19 17 -19 17 -31 0Z" fill="none" className="sp-bone-line" strokeWidth="1.3" />
      <path d={rays} fill="none" className="sp-gold-line" strokeWidth="1" />
      <path d="M-3.2 -50a6 6 0 1 0 6.4 8.8a4.8 4.8 0 1 1 -6.4 -8.8Z" className="sp-gold-fill" />
      <Star x={-24} y={25} s={9} className="sp-bone-fill" />
      <Star x={24} y={25} s={9} className="sp-bone-fill" />
      <circle cx="0" cy="29" r="1.5" className="sp-bone-fill" />
    </g>
  );
}

/** A small planchette glyph for labels, the send button and the sidebar. */
export function PlanchetteGlyph({ className = "sp-ic" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2.6C15.6 6.4 19.2 10.4 19.2 14.4C19.2 17.9 16.8 19.9 14.5 19.7C13.3 19.6 12.5 18.9 12 18C11.5 18.9 10.7 19.6 9.5 19.7C7.2 19.9 4.8 17.9 4.8 14.4C4.8 10.4 8.4 6.4 12 2.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.6" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="12.6" r=".9" fill="currentColor" />
    </svg>
  );
}

/* ───────── Candles on their saucers ───────── */

/** Three candles per side, on a 100 × 124 strip whose floor is y = 116. */
type CandleSpec = { cx: number; w: number; h: number };
const CANDLES: Record<"l" | "r", CandleSpec[]> = {
  l: [
    { cx: 24, w: 12, h: 74 },
    { cx: 49, w: 15, h: 46 },
    { cx: 73, w: 10, h: 28 },
  ],
  r: [
    { cx: 76, w: 12, h: 64 },
    { cx: 51, w: 14, h: 86 },
    { cx: 27, w: 11, h: 36 },
  ],
};
const FLOOR = 116;
const f2 = (n: number) => Math.round(n * 100) / 100;

/**
 * A cluster of three black candles on gold saucers, with pools of light,
 * flickering flames and, once they're snuffed, smoke curling off the wicks.
 * `flare` stretches the flames, for when a spirit is speaking.
 */
export function CandleCluster({ side, lit, flare }: { side: "l" | "r"; lit: boolean; flare: boolean }) {
  return (
    <svg viewBox="0 0 100 124" className="sp-candles" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <defs>
        <radialGradient id={`sp-halo-${side}`}>
          <stop offset="0%" stopColor="#FFB45E" stopOpacity=".55" />
          <stop offset="45%" stopColor={EMBER} stopOpacity=".18" />
          <stop offset="100%" stopColor={EMBER} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`sp-flame-${side}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={EMBER} />
          <stop offset="55%" stopColor="#FFB14E" />
          <stop offset="100%" stopColor="#FFF0C9" />
        </linearGradient>
      </defs>
      {CANDLES[side].map((c, i) => {
        const top = FLOOR - c.h;
        const l = c.cx - c.w / 2;
        const body = `M${f2(l)} ${FLOOR}V${f2(top + 2.5)}c${f2(c.w * 0.2)} 1.6 ${f2(c.w * 0.35)} -1.2 ${f2(c.w * 0.5)} -.4s${f2(c.w * 0.3)} 1.4 ${f2(c.w * 0.5)} .4V${FLOOR}`;
        const dripLen = Math.min(14, c.h * 0.24);
        const drip = `M${f2(l + c.w * 0.26)} ${f2(top + 2.4)}v${f2(dripLen)}a1.3 1.3 0 0 0 2.6 0v${f2(-dripLen * 0.6)}`;
        const wick = top - 4;
        const fh = flare ? 19 : 13;
        return (
          <g key={i}>
            <g className="sp-halo" data-on={lit || undefined}>
              <circle cx={c.cx} cy={wick - 6} r={flare ? 36 : 27} fill={`url(#sp-halo-${side})`} style={{ animationDelay: `${(i * 0.3).toFixed(1)}s`, animationDuration: `${(2.1 + i * 0.4).toFixed(1)}s` }} />
            </g>
            <path d={`M${f2(l - 6)} ${FLOOR}h${f2(c.w + 12)}`} className="sp-gold-line" />
            <path d={`M${f2(l - 4)} ${FLOOR}q${f2(c.w / 2 + 4)} 6 ${f2(c.w + 8)} 0`} className="sp-gold-line" strokeWidth=".7" />
            <path d={body} className="sp-wax sp-gold-line" />
            <path d={drip} className="sp-gold-line" strokeWidth=".8" />
            <path d={`M${c.cx} ${top + 1}V${wick}`} stroke={lit ? "#3A2A1C" : GOLD} strokeWidth="1.2" />
            <g className="sp-flame-wrap" data-on={lit || undefined}>
              <g className="sp-flame" style={{ animationDuration: `${(1.3 + i * 0.37).toFixed(2)}s`, animationDelay: `${(-i * 0.5).toFixed(1)}s` }}>
                <path
                  d={`M${c.cx} ${wick + 1}c-4 -3 -4.2 ${f2(-fh * 0.55)} 0 ${-fh}c4.2 ${f2(fh * 0.45)} 4 ${f2(fh - 3)} 0 ${fh}z`}
                  fill={`url(#sp-flame-${side})`}
                  style={{ filter: `drop-shadow(0 0 4px ${EMBER})` }}
                />
                <path d={`M${c.cx} ${wick + 0.5}c-1.6 -1.4 -1.8 -3.6 0 -6.5c1.8 2.9 1.6 5.1 0 6.5z`} fill="#FFF6DD" />
              </g>
            </g>
            <g className="sp-smoke" data-on={!lit || undefined}>
              <path
                d={`M${c.cx} ${wick - 1}c-3 -4 3 -7 0 -11s3 -7 0 -11 2.5 -6 0 -9`}
                className="sp-bone-line"
                strokeWidth=".8"
                style={{ animationDuration: `${(3.2 + i * 0.6).toFixed(1)}s`, animationDelay: `${(i * 0.9).toFixed(1)}s` }}
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/** A line-art moth, drawn to circle a flame. */
const MOTH = [
  "M12 7.5v10",
  "M12 9C10 5.5 5.5 4.2 4 6.6c-1.5 2.5 2.2 5.6 8 5",
  "M12 9c2-3.5 6.5-4.8 8-2.4 1.5 2.5-2.2 5.6-8 5",
  "M12 12.5c-2.8.2-6 2-5.3 4.2.6 2 3.8.8 5.3-1.5",
  "M12 12.5c2.8.2 6 2 5.3 4.2-.6 2-3.8.8-5.3-1.5",
  "M11.6 7.6c-.6-1.8-1.8-3-3.3-3.3",
  "M12.4 7.6c.6-1.8 1.8-3 3.3-3.3",
];

export function Moth({ size = 16, flap = 0.2 }: { size?: number; flap?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={BONE} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className="sp-moth-wings" style={{ animationDuration: `${flap}s` }} aria-hidden>
      {MOTH.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/* ───────── Old film ───────── */

const DUST = Array.from({ length: 40 }, (_, i) => {
  const r = rand(900 + i * 13);
  return {
    x: r() * 100,
    y: r() * 100,
    s: 1 + r() * 2.4,
    o: 0.04 + r() * 0.1,
    shape: `${40 + r() * 60}% ${30 + r() * 70}% ${40 + r() * 60}% ${35 + r() * 65}%`,
  };
});

/** Scratches down the film: steady, each drifting a hair sideways on a slow clock. */
const SCRATCHES = [
  { x: 9, top: 0, h: 74, rot: 0.6, o: 0.1, dur: 23 },
  { x: 88.5, top: 16, h: 84, rot: -0.8, o: 0.1, dur: 29 },
  { x: 41, top: 56, h: 44, rot: 0.2, o: 0.07, dur: 37 },
  { x: 74, top: 2, h: 20, rot: 58, o: 0.06, dur: 31 },
];

/** Long lines running the height of the frame, wandering slowly across it. */
const FILM_LINES = [
  { from: 18, to: 27, o: 0.13, dur: 26 },
  { from: 64, to: 57, o: 0.1, dur: 34 },
  { from: 83, to: 90, o: 0.08, dur: 41 },
];

/**
 * Old-film effects over the whole séance, text included, kept faint and
 * steady (nothing flashes): dust, scratches, long projector lines that
 * wander slowly across the frame, and a slow warm light leak.
 * Pointer-transparent. (The grain is in the room behind: blended in here,
 * it would show as a grey box.)
 */
export function FilmFX() {
  return (
    <div className="sp-film" aria-hidden>
      {DUST.map((d, i) => (
        <span key={i} className="sp-film-dust" style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s * 0.8, borderRadius: d.shape, opacity: d.o }} />
      ))}
      {SCRATCHES.map((s, i) => (
        <span key={i} className="sp-film-scratch" style={{ left: `${s.x}%`, top: `${s.top}%`, height: `${s.h}%`, transform: `rotate(${s.rot}deg)`, opacity: s.o }}>
          <i style={{ animationDuration: `${s.dur}s`, animationDelay: `${(-i * 5).toFixed(1)}s` }} />
        </span>
      ))}
      {FILM_LINES.map((l, i) => (
        <span
          key={i}
          className="sp-film-line"
          style={{ "--from": `${l.from}%`, "--to": `${l.to}%`, opacity: l.o, animationDuration: `${l.dur}s`, animationDelay: `${-i * 9}s` } as CSSProperties}
        />
      ))}
      <div className="sp-film-leak" />
    </div>
  );
}

/* ───────── Icons, engraved ───────── */

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.45, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export type IconName =
  | "eye" | "hat" | "candle" | "heart" | "quill" | "knock" | "moon" | "sparkle"
  | "skull" | "bell" | "x" | "stop" | "arrowDown" | "door" | "book" | "moth";

const ICONS: Record<IconName, React.ReactNode> = {
  eye: (
    <>
      <path d="M2.5 12C6 6.6 18 6.6 21.5 12C18 17.4 6 17.4 2.5 12Z" {...line} />
      <circle cx="12" cy="12" r="3.3" {...line} />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
      <path d="M12 6.4V4.4M7.6 7.4 6.6 5.8M16.4 7.4l1-1.6" {...line} strokeWidth={1.2} />
    </>
  ),
  hat: (
    <>
      <path d="M8 4.5H16L15.4 15.6H8.6Z" {...line} />
      <path d="M8.4 12.6H15.6" {...line} />
      <path d="M3.8 17.6C6.4 15.9 17.6 15.9 20.2 17.6C17.8 19 6.2 19 3.8 17.6Z" {...line} />
    </>
  ),
  candle: (
    <>
      <path d="M12 3C13.7 4.9 14.1 6.1 14.1 7.2A2.1 2.1 0 0 1 9.9 7.2C9.9 6.1 10.3 4.9 12 3Z" {...line} />
      <path d="M9.4 11H14.6V19H9.4Z" {...line} />
      <path d="M12 9.3V11M5.8 19.4H18.2M8 21.4H16" {...line} />
    </>
  ),
  heart: (
    <>
      <path d="M12 20S4.4 15.4 4.4 10A4.1 4.1 0 0 1 12 7.8A4.1 4.1 0 0 1 19.6 10C19.6 15.4 12 20 12 20Z" {...line} />
      <path d="M12 3.2V5M10.6 4.1H13.4" {...line} strokeWidth={1.1} />
    </>
  ),
  quill: (
    <>
      <path d="M19.8 3.4C12.6 4.4 8.2 9.4 6.4 17.6" {...line} />
      <path d="M19.8 3.4C19 9.6 15 14.2 8.4 16" {...line} />
      <path d="M11.6 9.6 14.8 10.4M10 12.6 13 13.2M5.4 20.6 6.6 17.4" {...line} strokeWidth={1.2} />
    </>
  ),
  knock: (
    <>
      <path d="M3.5 14.5H20.5M6 14.5V20M18 14.5V20" {...line} />
      <circle cx="12" cy="10.6" r="1.6" {...line} />
      <path d="M8.4 7.6 7 6.2M12 6.4V4.4M15.6 7.6 17 6.2M6.6 10.6H4.8M17.4 10.6h1.8" {...line} strokeWidth={1.2} />
    </>
  ),
  moon: <path d="M15.6 4.4A8 8 0 1 0 19.6 16A6.6 6.6 0 1 1 15.6 4.4Z" {...line} />,
  sparkle: <path d="M12 3.2C12.8 9.6 14.4 11.2 20.8 12C14.4 12.8 12.8 14.4 12 20.8C11.2 14.4 9.6 12.8 3.2 12C9.6 11.2 11.2 9.6 12 3.2Z" {...line} />,
  skull: (
    <>
      <path d="M5.4 12.2C4.6 6.6 8.4 3.6 12 3.6S19.4 6.6 18.6 12.2C18.3 14.1 17.2 14.6 16.8 15.4V18.4H7.2V15.4C6.8 14.6 5.7 14.1 5.4 12.2Z" {...line} />
      <circle cx="9.4" cy="11" r="1.8" {...line} />
      <circle cx="14.6" cy="11" r="1.8" {...line} />
      <path d="M10 18.4V20.4M12 18.4V20.6M14 18.4V20.4M12 13.4l-.9 1.6h1.8Z" {...line} strokeWidth={1.1} />
    </>
  ),
  bell: (
    <>
      <path d="M12 4.2A5 5 0 0 0 7 9.2V13.6L5.4 16.6H18.6L17 13.6V9.2A5 5 0 0 0 12 4.2Z" {...line} />
      <path d="M10.2 19A1.9 1.9 0 0 0 13.8 19M12 2.8V4.2" {...line} />
    </>
  ),
  x: <path d="M7 7L17 17M17 7L7 17" {...line} />,
  stop: <rect x="7.6" y="7.6" width="8.8" height="8.8" rx="1" fill="currentColor" />,
  arrowDown: <path d="M12 5V18.4M6.8 13.4 12 18.6 17.2 13.4" {...line} />,
  door: (
    <>
      <path d="M7 20.5V5.5Q7 3.5 9 3.5H15Q17 3.5 17 5.5V20.5" {...line} />
      <path d="M4.5 20.5H19.5M14.2 12.4V12.6" {...line} strokeWidth={2} />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5H16.6Q19 4.5 19 7V19.5H7.4Q5 19.5 5 17.1Z" {...line} />
      <path d="M5 17Q5 15 7.4 15H19M9 8.4H15M9 11H13.4" {...line} strokeWidth={1.2} />
    </>
  ),
  moth: (
    <>
      {MOTH.map((d) => (
        <path key={d} d={d} {...line} strokeWidth={1.3} />
      ))}
    </>
  ),
};

export function Icon({ name, className = "sp-ic" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

"use client";

import { useId, useMemo } from "react";

/**
 * Art for the BBS costume. ANSI pictures are drawn as vector "half-block"
 * pixels in the 16 DOS colors, with ░ ▒ ▓ shading as real dither patterns,
 * so they stay crisp at any size (the font has no block characters). The
 * props around the monitor are CSS; the floppy is SVG.
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot = "wallpaper" | "reflection" | "floppy" | "plastic";

/**
 * Generated pictures that replace the drawn fallbacks (prompts in
 * src/components/bbs/ART.md). Uncomment a line once its file is in
 * public/bbs/. The wallpaper and reflection stay 1536px wide WebP, the
 * floppy 256px with transparency, the plastic a 512px tile.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  // wallpaper: "/bbs/wallpaper.webp",
  // reflection: "/bbs/reflection.webp",
  // floppy: "/bbs/floppy.webp",
  // plastic: "/bbs/plastic.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/* ───────── The 16 DOS colors ───────── */

export const DOS = [
  "#000000", "#0000aa", "#00aa00", "#00aaaa", "#aa0000", "#aa00aa", "#aa5500", "#aaaaaa",
  "#555555", "#5555ff", "#55ff55", "#55ffff", "#ff5555", "#ff55ff", "#ffff55", "#ffffff",
] as const;

const K = {
  Black: 0, Blue: 1, Green: 2, Cyan: 3, Red: 4, Magenta: 5, Brown: 6, Gray: 7,
  Dark: 8, LBlue: 9, LGreen: 10, LCyan: 11, LRed: 12, LMagenta: 13, Yellow: 14, White: 15,
} as const;

/**
 * One half-block pixel (a text cell is two of them, stacked): a color, how
 * much of it shows (4 █, 3 ▓, 2 ▒, 1 ░), the color behind the shading, and
 * the ANSI blink attribute ("wink" blinks rarely, like an eye).
 */
interface Px {
  c: number;
  s?: 1 | 2 | 3 | 4;
  b?: number;
  blink?: "on" | "wink";
}

export interface Grid {
  w: number;
  h: number;
  px: (Px | null)[];
}

function grid(w: number, h: number): Grid {
  return { w, h, px: Array(w * h).fill(null) };
}

function put(g: Grid, x: number, y: number, p: Px | null) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= g.w || y >= g.h) return;
  g.px[y * g.w + x] = p;
}

function at(g: Grid, x: number, y: number) {
  if (x < 0 || y < 0 || x >= g.w || y >= g.h) return null;
  return g.px[y * g.w + x];
}

/** Small deterministic PRNG so the art is the same on every visit. */
function rand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/* ───────── Renderer ───────── */

/** SVG units per pixel. Dither dots are one unit, so four to a pixel. */
const U = 4;

/** Which of the four dots in a 2×2 tile are lit, per shade. */
const DOTS: Record<1 | 2 | 3, [number, number][]> = {
  1: [[0, 0]],
  2: [[0, 0], [1, 1]],
  3: [[0, 0], [1, 0], [0, 1]],
};

interface Run {
  x: number;
  y: number;
  w: number;
  c: number;
  s: 1 | 2 | 3 | 4;
  b?: number;
  blink?: Px["blink"];
}

/** Rows of pixels become runs of same-looking pixels, one rect each. */
function toRuns(g: Grid) {
  const runs: Run[] = [];
  for (let y = 0; y < g.h; y++) {
    let cur: Run | null = null;
    for (let x = 0; x < g.w; x++) {
      const p = g.px[y * g.w + x];
      const s = p?.s ?? 4;
      if (cur && p && cur.c === p.c && cur.s === s && cur.b === p.b && cur.blink === p.blink && cur.x + cur.w === x) {
        cur.w++;
        continue;
      }
      if (cur) runs.push(cur);
      cur = p ? { x, y, w: 1, c: p.c, s, b: p.b, blink: p.blink } : null;
    }
    if (cur) runs.push(cur);
  }
  return runs;
}

/** A grid of ANSI pixels as one crisp SVG. */
export function PixelArt({ g, className, style }: { g: Grid; className?: string; style?: React.CSSProperties }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const runs = useMemo(() => toRuns(g), [g]);
  const patterns = useMemo(() => {
    const seen = new Map<string, { c: number; s: 1 | 2 | 3 }>();
    for (const r of runs) if (r.s < 4) seen.set(`${r.c}-${r.s}`, { c: r.c, s: r.s as 1 | 2 | 3 });
    return [...seen.entries()];
  }, [runs]);

  return (
    <svg
      viewBox={`0 0 ${g.w * U} ${g.h * U}`}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        {patterns.map(([key, { c, s }]) => (
          <pattern key={key} id={`${uid}-${key}`} width="2" height="2" patternUnits="userSpaceOnUse">
            {DOTS[s].map(([dx, dy]) => (
              <rect key={`${dx}${dy}`} x={dx} y={dy} width="1" height="1" fill={DOS[c]} />
            ))}
          </pattern>
        ))}
      </defs>
      {runs.map((r, i) => (
        <g key={i}>
          {r.b !== undefined && <rect x={r.x * U} y={r.y * U} width={r.w * U} height={U} fill={DOS[r.b]} />}
          <rect
            x={r.x * U}
            y={r.y * U}
            width={r.w * U}
            height={U}
            fill={r.s === 4 ? DOS[r.c] : `url(#${uid}-${r.c}-${r.s})`}
            className={r.blink === "on" ? "bbs-px-blink" : r.blink === "wink" ? "bbs-px-wink" : undefined}
          />
        </g>
      ))}
    </svg>
  );
}

/* ───────── Letters ───────── */

/** A chunky 7-pixel-tall face for the logo. */
const BIG: Record<string, string[]> = {
  M: ["##...##", "###.###", "#######", "##.#.##", "##...##", "##...##", "##...##"],
  I: ["####", ".##.", ".##.", ".##.", ".##.", ".##.", "####"],
  D: ["#####.", "##..##", "##..##", "##..##", "##..##", "##..##", "#####."],
  N: ["##..##", "###.##", "######", "##.###", "##..##", "##..##", "##..##"],
  G: [".#####", "##....", "##....", "##.###", "##..##", "##..##", ".####."],
  H: ["##..##", "##..##", "##..##", "######", "##..##", "##..##", "##..##"],
  T: ["######", "..##..", "..##..", "..##..", "..##..", "..##..", "..##.."],
  B: ["#####.", "##..##", "##..##", "#####.", "##..##", "##..##", "#####."],
  S: [".#####", "##....", "##....", ".####.", "....##", "....##", "#####."],
  " ": [".", ".", ".", ".", ".", ".", "."],
};

/** Top-to-bottom shading for a logo row: bright, then dithered down to dark. */
type Ramp = Px[];
const CYAN_RAMP: Ramp = [
  { c: K.White, s: 2, b: K.LCyan },
  { c: K.LCyan },
  { c: K.LCyan, s: 3, b: K.Cyan },
  { c: K.Cyan },
  { c: K.Cyan, s: 2, b: K.Blue },
  { c: K.Blue },
  { c: K.LBlue, s: 1, b: K.Blue },
];
const PINK_RAMP: Ramp = [
  { c: K.White, s: 2, b: K.LMagenta },
  { c: K.LMagenta },
  { c: K.LMagenta, s: 3, b: K.Magenta },
  { c: K.Magenta },
  { c: K.Magenta, s: 2, b: K.Red },
  { c: K.Red },
  { c: K.LRed, s: 1, b: K.Red },
];

function word(g: Grid, text: string, x0: number, y0: number, ramp: Ramp) {
  let x = x0;
  for (const ch of text) {
    const rows = BIG[ch] ?? BIG[" "];
    rows.forEach((row, dy) => {
      [...row].forEach((v, dx) => {
        if (v === "#") put(g, x + dx, y0 + dy, ramp[dy]);
      });
    });
    x += rows[0].length + 1;
  }
  return x - 1;
}

function wordWidth(text: string) {
  return [...text].reduce((w, ch) => w + (BIG[ch] ?? BIG[" "])[0].length + 1, -1);
}

/** A dark dithered drop shadow one pixel down and right of whatever is lit. */
function shadow(g: Grid, x0: number, y0: number, x1: number, y1: number, mask: Grid) {
  for (let y = y0; y <= y1 + 1; y++) {
    for (let x = x0; x <= x1 + 1; x++) {
      if (at(mask, x - 1, y - 1) && !at(mask, x, y)) put(g, x, y, { c: K.Dark, s: 2 });
    }
  }
}

/* ───────── Pieces ───────── */

/** A crescent moon, lit from the right, with a soft blue halo and two craters. */
function moon(g: Grid, cx: number, cy: number, R: number) {
  const ox = cx - R * 0.55;
  const oy = cy - R * 0.28;
  const cut = R * 0.95;
  for (let y = Math.floor(cy - R - 2); y <= cy + R + 2; y++) {
    for (let x = Math.floor(cx - R - 2); x <= cx + R + 2; x++) {
      const d1 = Math.hypot(x - cx, y - cy);
      const d2 = Math.hypot(x - ox, y - oy);
      if (d1 <= R && d2 > cut) {
        const edge = d2 - cut;
        const p: Px =
          edge < 0.8 ? { c: K.Yellow, s: 1 }
          : edge < 1.6 ? { c: K.Yellow, s: 2 }
          : edge < 2.4 ? { c: K.Yellow, s: 3, b: K.Brown }
          : { c: K.Yellow };
        put(g, x, y, p);
      } else if (d1 > R && d1 <= R + 1.7 && d2 > cut + 0.6) {
        put(g, x, y, { c: K.Blue, s: d1 <= R + 0.9 ? 2 : 1 });
      }
    }
  }
  // Craters, on the lit part only.
  for (const [dx, dy] of [[0.45, -0.1], [0.62, 0.38], [0.3, 0.5]] as const) {
    const x = cx + dx * R;
    const y = cy + dy * R;
    if (at(g, Math.round(x), Math.round(y))?.c === K.Yellow) put(g, x, y, { c: K.Brown, s: 2, b: K.Yellow });
  }
}

/** Dale, the gpty: a cyan squircle with blinking eyes. */
function dale(g: Grid, x0: number, y0: number) {
  const body = [".#####.", "#######", "##.#.##", "##.#.##", "#######", "#######", ".#####."];
  body.forEach((row, dy) =>
    [...row].forEach((v, dx) => {
      if (v === "#") put(g, x0 + dx, y0 + dy, dy === 0 || (dy === 1 && dx < 3) ? { c: K.LCyan } : { c: K.Cyan });
      else if (v === ".") {
        if (dy === 2 || dy === 3) put(g, x0 + dx, y0 + dy, { c: K.White, b: K.Cyan, blink: "wink" });
      }
    }),
  );
}

/* ───────── Pictures ───────── */

/** The login splash: night sky, crescent moon, logo, and the town asleep but one basement. */
function buildSplash(): Grid {
  const W = 80;
  const H = 26;
  const g = grid(W, H);
  const r = rand(1993);

  // Stars, a few of them blinking (the ANSI blink attribute).
  const STAR = [K.White, K.LCyan, K.Gray, K.Dark, K.Yellow, K.Gray];
  for (let i = 0; i < 52; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * 17);
    put(g, x, y, { c: STAR[Math.floor(r() * STAR.length)], blink: r() < 0.16 ? "on" : undefined });
  }

  moon(g, 70, 5.5, 5.2);

  // A faint city glow along the horizon.
  for (let x = 0; x < W; x++) {
    put(g, x, 18, r() < 0.5 ? { c: K.Blue, s: 1 } : null);
    put(g, x, 19, { c: K.Blue, s: 1 });
    put(g, x, 20, { c: K.Blue, s: 2 });
  }

  // Far skyline: dim blue towers.
  for (let x = 0; x < W; ) {
    const w = 3 + Math.floor(r() * 4);
    const h = 3 + Math.floor(r() * 6);
    for (let dx = 0; dx < w; dx++) for (let y = 25 - h; y < 25; y++) put(g, x + dx, y, { c: K.Blue, s: 3, b: K.Black });
    x += w + Math.floor(r() * 2);
  }
  // Near skyline: dark blocks with lit windows.
  for (let x = 30; x < W; ) {
    const w = 4 + Math.floor(r() * 5);
    const h = 2 + Math.floor(r() * 5);
    for (let dx = 0; dx < w; dx++) {
      for (let y = 25 - h; y < 25; y++) {
        const win = dx % 2 === 1 && y % 2 === 0 && dx < w - 1 && r() < 0.45;
        put(
          g,
          x + dx,
          y,
          win
            ? { c: r() < 0.7 ? K.Yellow : r() < 0.5 ? K.LCyan : K.LMagenta, blink: r() < 0.08 ? "on" : undefined }
            : { c: K.Dark, s: 3, b: K.Black },
        );
      }
    }
    x += w + 1 + Math.floor(r() * 2);
  }

  // Dale's house: red roof, brown walls, everyone asleep but the basement.
  const hx = 6;
  for (let y = 21; y < 25; y++) for (let x = hx; x < hx + 13; x++) put(g, x, y, { c: K.Brown, s: 3, b: K.Black });
  for (let i = 0; i < 5; i++) {
    for (let x = hx + 4 - i * 1.5; x <= hx + 8 + i * 1.5; x++) put(g, x, 16 + i, i === 0 ? { c: K.LRed, s: 2, b: K.Red } : { c: K.Red });
  }
  for (let y = 22; y < 25; y++) put(g, hx + 2, y, { c: K.Black });
  put(g, hx + 3, 22, { c: K.Black });
  put(g, hx + 6, 22, { c: K.Dark });
  put(g, hx + 7, 22, { c: K.Dark });
  // The basement window: a CRT glowing at midnight.
  for (const x of [hx + 8, hx + 9, hx + 10]) put(g, x, 24, { c: K.LCyan });
  for (const x of [hx + 7, hx + 11]) put(g, x, 24, { c: K.Cyan, s: 2, b: K.Brown });
  put(g, hx + 9, 23, { c: K.Cyan, s: 1, b: K.Brown });

  // The phone pole, with the line running to the house.
  const px = 26;
  for (let y = 15; y < 25; y++) put(g, px, y, { c: K.Brown });
  for (let x = px - 2; x <= px + 2; x++) put(g, x, 16, { c: K.Brown });
  put(g, px - 2, 15, { c: K.Gray });
  put(g, px + 2, 15, { c: K.Gray });
  for (let x = hx + 13; x < px - 2; x++) {
    const t = (x - (hx + 13)) / (px - 2 - (hx + 13));
    put(g, x, 18 + Math.sin(t * Math.PI) * 1.6 - t * 2, { c: K.Dark });
  }

  dale(g, px - 10, 18);

  // Grass.
  for (let x = 0; x < W; x++) put(g, x, 25, { c: K.Green, s: r() < 0.5 ? 2 : 3, b: K.Black });

  // The logo, over everything, with its drop shadow.
  const logo = grid(W, H);
  const total = wordWidth("MIDNIGHT") + 3 + wordWidth("BBS");
  const lx = Math.floor((W - total) / 2);
  const ly = 7;
  const end = word(logo, "MIDNIGHT", lx, ly, CYAN_RAMP);
  word(logo, "BBS", end + 4, ly, PINK_RAMP);
  shadow(g, lx, ly, lx + total, ly + 6, logo);
  logo.px.forEach((p, i) => {
    if (p) g.px[i] = p;
  });

  return g;
}

let splash: Grid | null = null;
export function splashGrid() {
  return (splash ??= buildSplash());
}

/** Just the moon, for the desktop scene. */
let moonOnly: Grid | null = null;
export function moonGrid() {
  if (moonOnly) return moonOnly;
  const g = grid(30, 30);
  moon(g, 15, 15, 12);
  return (moonOnly = g);
}

/** A tiny Dale, for the sidebar. */
let daleOnly: Grid | null = null;
export function daleGrid() {
  if (daleOnly) return daleOnly;
  const g = grid(7, 7);
  dale(g, 0, 0);
  return (daleOnly = g);
}

/* ───────── Props ───────── */

/** A 3.5" floppy with a handwritten label. */
export function Floppy({ label }: { label: string }) {
  const photo = art("floppy");
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" draggable={false} className="h-full w-full object-contain" />;
  }
  return (
    <svg viewBox="0 0 90 92" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="bbs-fl-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a3f4a" />
          <stop offset=".55" stopColor="#1f232b" />
          <stop offset="1" stopColor="#14171d" />
        </linearGradient>
        <linearGradient id="bbs-fl-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9aa1ab" />
          <stop offset=".35" stopColor="#eef1f4" />
          <stop offset=".6" stopColor="#b8bec7" />
          <stop offset="1" stopColor="#d9dde2" />
        </linearGradient>
        <linearGradient id="bbs-fl-label" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfaf4" />
          <stop offset="1" stopColor="#ebe7da" />
        </linearGradient>
      </defs>
      {/* Body with the cut corner */}
      <path d="M4 2h76l8 8v78a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="url(#bbs-fl-body)" />
      <path d="M4 2h76l8 8" fill="none" stroke="#5a6170" strokeWidth="1" />
      {/* Metal shutter and its window */}
      <rect x="22" y="2" width="44" height="30" rx="1.5" fill="url(#bbs-fl-metal)" />
      <rect x="46" y="7" width="10" height="20" rx="1" fill="#2a2e36" />
      <rect x="22" y="2" width="44" height="2" fill="#fff" opacity=".6" />
      {/* Write-protect tab */}
      <rect x="7" y="78" width="6" height="7" rx="1" fill="#0d0f13" />
      <rect x="8" y="79" width="4" height="3" fill="#59606c" />
      {/* Label */}
      <rect x="12" y="42" width="66" height="44" rx="2" fill="url(#bbs-fl-label)" />
      <rect x="12" y="42" width="66" height="5" rx="1" fill="#e4572e" opacity=".85" />
      <text
        x="45"
        y="68"
        textAnchor="middle"
        fontFamily="var(--font-caveat), 'Comic Sans MS', cursive"
        fontSize="15"
        fontWeight="700"
        fill="#23308a"
        transform="rotate(-4 45 68)"
      >
        {label}
      </text>
      <path d="M20 76c12-2 34-2 48 0" stroke="#23308a" strokeWidth="1" fill="none" opacity=".5" />
    </svg>
  );
}

/** The sun and half-moon marks under the monitor's knobs. */
export function KnobMark({ kind }: { kind: "bright" | "contrast" }) {
  if (kind === "contrast") {
    return (
      <svg viewBox="0 0 12 12" className="h-[9px] w-[9px]" aria-hidden>
        <circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6 1.4a4.6 4.6 0 0 1 0 9.2Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 12 12" className="h-[9px] w-[9px]" aria-hidden>
      <circle cx="6" cy="6" r="2.4" fill="currentColor" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={6 + Math.cos(a) * 3.7}
            y1={6 + Math.sin(a) * 3.7}
            x2={6 + Math.cos(a) * 5.3}
            y2={6 + Math.sin(a) * 5.3}
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function PowerMark() {
  return (
    <svg viewBox="0 0 12 12" className="h-[9px] w-[9px]" aria-hidden>
      <path d="M3.6 3.3a4 4 0 1 0 4.8 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 1.2v4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

"use client";

import { type CSSProperties, useId, useMemo } from "react";

/**
 * Art for Firewall Fury (Shelly, FW-7, 1985). The monitor and the terminal
 * are CSS, because they react to the chat. What's here: the striped synth
 * sun, the wireframe mountains, the stars, a palm, the block letters for the
 * terminal's banners, and Shelly herself in shades and a headband for the
 * sidebar. Each optional picture below has a drawn fallback, so the costume
 * is complete without any of them.
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot = "wallpaper" | "reflection" | "chrome" | "avatar";

/**
 * Generated pictures that replace the drawn fallbacks (prompts in
 * src/components/fury/ART.md). Save the file in public/fury/ and uncomment its
 * line; comment it out again to fall back to the drawing.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/fury/wallpaper.webp",
  // Shelly in her shades and headband, for the open agent's row in the sidebar (from public/fury-guy.png).
  avatar: "/fury/avatar.webp",
  // reflection: "/fury/reflection.webp",
  // chrome: "/fury/chrome.webp",
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

/** A useId that's safe inside url(#…). */
function useSvgId() {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

/* ───────── The sun ───────── */

/**
 * The synth sun: yellow at the top, hot pink at the horizon, cut by bands
 * that widen as it sinks. Its colors are CSS variables (--fy-sun-a, -b, -c),
 * so an alarm can turn it red.
 */
export function Sun({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = useSvgId();
  const bands = useMemo(() => {
    const out: { y: number; h: number }[] = [];
    let y = 92;
    let h = 1.6;
    while (y < 200) {
      out.push({ y, h });
      y += h + 10.5 - out.length * 0.9;
      h += 1.35;
    }
    return out;
  }, []);
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="fy-sun-a" />
          <stop offset=".5" className="fy-sun-b" />
          <stop offset="1" className="fy-sun-c" />
        </linearGradient>
        <mask id={`${id}m`}>
          <rect width="200" height="200" fill="#fff" />
          {bands.map((b) => (
            <rect key={b.y} y={b.y} width="200" height={b.h} fill="#000" />
          ))}
        </mask>
      </defs>
      <circle cx="100" cy="100" r="100" fill={`url(#${id}g)`} mask={`url(#${id}m)`} />
    </svg>
  );
}

/* ───────── Mountains ───────── */

/** Jagged peaks along a 1000×100 strip, from a seed. */
function peaks(seed: number, n: number, lo: number, hi: number) {
  const r = rand(seed);
  const pts: [number, number][] = [[0, 100 - lo - r() * (hi - lo) * 0.4]];
  for (let i = 1; i < n; i++) {
    const x = (i / n) * 1000 + (r() - 0.5) * (600 / n);
    const up = i % 2 === 1;
    pts.push([x, 100 - (up ? lo + (0.45 + r() * 0.55) * (hi - lo) : lo * (0.4 + r() * 0.5))]);
  }
  pts.push([1000, 100 - lo - r() * (hi - lo) * 0.4]);
  return pts;
}

/**
 * Wireframe mountains on the horizon: a dark range edged in neon, with faint
 * lines dropping from every peak, like the vector graphics on an arcade
 * monitor. Two ranges, the far one in cyan.
 */
export function Mountains({ className, seed = 85 }: { className?: string; seed?: number }) {
  const id = useSvgId();
  const far = useMemo(() => peaks(seed, 16, 18, 70), [seed]);
  const near = useMemo(() => peaks(seed * 7 + 3, 11, 10, 46), [seed]);
  const path = (pts: [number, number][]) => `M0 100 ${pts.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")} L1000 100Z`;
  const line = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0b52" />
          <stop offset="1" stopColor="#0c0322" />
        </linearGradient>
        <linearGradient id={`${id}n`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a0d5e" />
          <stop offset="1" stopColor="#12042a" />
        </linearGradient>
      </defs>
      <path d={path(far)} fill={`url(#${id}f)`} />
      <g className="fy-mtn-wire fy-mtn-far">
        {far.map(([x, y], i) => (i % 2 ? <path key={i} d={`M${x.toFixed(1)} ${y.toFixed(1)}L${(x + (i % 4 === 1 ? -18 : 14)).toFixed(1)} 100`} /> : null))}
        <path d={line(far)} className="fy-mtn-edge" />
      </g>
      <path d={path(near)} fill={`url(#${id}n)`} />
      <g className="fy-mtn-wire fy-mtn-near">
        {near.map(([x, y], i) => (i % 2 ? <path key={i} d={`M${x.toFixed(1)} ${y.toFixed(1)}L${(x + (i % 4 === 1 ? 22 : -16)).toFixed(1)} 100`} /> : null))}
        <path d={line(near)} className="fy-mtn-edge" />
      </g>
    </svg>
  );
}

/* ───────── Stars ───────── */

/** A sky's worth of stars, a few twinkling. `w`×`h` is the viewBox. */
export function Stars({ seed, n, className, w = 1000, h = 400 }: { seed: number; n: number; className?: string; w?: number; h?: number }) {
  const stars = useMemo(() => {
    const r = rand(seed);
    return Array.from({ length: n }, () => {
      const big = r() < 0.12;
      return {
        x: r() * w,
        y: Math.pow(r(), 1.35) * h,
        r: big ? 1.3 + r() * 0.9 : 0.45 + r() * 0.6,
        o: 0.35 + r() * 0.65,
        tw: r() < 0.3,
        d: 1.8 + r() * 3.2,
        dl: -r() * 5,
        c: r() < 0.18 ? "#9fe8ff" : r() < 0.3 ? "#ffc1ec" : "#ffffff",
      };
    });
  }, [seed, n, w, h]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x.toFixed(1)}
          cy={s.y.toFixed(1)}
          r={s.r.toFixed(2)}
          fill={s.c}
          opacity={s.o.toFixed(2)}
          className={s.tw ? "fy-twinkle" : undefined}
          style={s.tw ? ({ "--d": `${s.d.toFixed(2)}s`, "--dl": `${s.dl.toFixed(2)}s` } as CSSProperties) : undefined}
        />
      ))}
    </svg>
  );
}

/* ───────── A palm ───────── */

/** One frond: a long, drooping leaf from the crown. */
function frond(cx: number, cy: number, a: number, len: number, droop: number) {
  const t = (a * Math.PI) / 180;
  const tip = [cx + Math.cos(t) * len, cy + Math.sin(t) * len + droop];
  const mid = [cx + Math.cos(t) * len * 0.5, cy + Math.sin(t) * len * 0.5 - droop * 0.35];
  const n = [-Math.sin(t), Math.cos(t)];
  const wd = len * 0.11;
  return `M${cx} ${cy}Q${(mid[0] + n[0] * wd).toFixed(1)} ${(mid[1] + n[1] * wd).toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)}Q${(mid[0] - n[0] * wd * 0.3).toFixed(1)} ${(mid[1] - n[1] * wd * 0.3).toFixed(1)} ${cx} ${cy}Z`;
}

/**
 * A palm tree in silhouette against the sunset, with a thin neon rim, as on
 * every Miami VHS cover. `flip` leans it the other way.
 */
export function Palm({ className, flip = false, style }: { className?: string; flip?: boolean; style?: CSSProperties }) {
  const d = useMemo(() => {
    const cx = 130;
    const cy = 42;
    const fronds = [
      [-168, 92, 34],
      [-140, 96, 30],
      [-112, 70, 14],
      [-80, 64, 10],
      [-42, 84, 18],
      [-12, 100, 32],
      [16, 94, 40],
      [176, 88, 40],
      [140, 60, 26],
    ].map(([a, l, dr]) => frond(cx, cy, a, l, dr));
    // A trunk that curves up from the ground to the crown, tapering, with rings.
    const trunk = "M96 400C100 300 112 160 126 46L134 46C122 160 112 300 114 400Z";
    return { fronds: fronds.join(""), trunk };
  }, []);
  return (
    <svg viewBox="0 0 260 400" className={className} style={{ ...style, transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <path d={d.trunk} className="fy-palm-trunk" />
      <path d={d.fronds} className="fy-palm-leaf" />
      <circle cx="128" cy="48" r="6" className="fy-palm-trunk" />
    </svg>
  );
}

/* ───────── Shelly ───────── */

/** The Gpty cone (see components/Gpty.tsx), in a 48×48 box. */
const CONE = "M24 6C26 6 27.5 7.2 28.6 9L43 36C44.5 39 42.5 42 39 42H9C5.5 42 3.5 39 5 36L19.4 9C20.5 7.2 22 6 24 6Z";
const LENS_L = "M12.6 26.6H22.7Q23.4 26.6 23.2 27.4L22.4 31Q22.1 32.3 20.7 32.3H15.3Q13.9 32.3 13.5 31L12.2 27.4Q12 26.6 12.6 26.6Z";
const LENS_R = "M35.4 26.6H25.3Q24.6 26.6 24.8 27.4L25.6 31Q25.9 32.3 27.3 32.3H32.7Q34.1 32.3 34.5 31L35.8 27.4Q36 26.6 35.4 26.6Z";

export type PortraitMood = "idle" | "watching" | "thinking" | "typing" | "error";

/**
 * Shelly as the boss at the end of the Grid: the pink Gpty cone in wayfarers
 * and a red headband whose tails flutter behind her. While she thinks, the
 * sunset slides across her lenses; when the alarm sounds, she fires lasers
 * out of them. Mood and alarm come from data attributes, so CSS does the rest.
 */
export function Portrait({
  className = "",
  mood = "idle",
  alarm = false,
  hit = false,
  beams = true,
  size,
}: {
  className?: string;
  mood?: PortraitMood;
  alarm?: boolean;
  hit?: boolean;
  /** Whether the alarm's lasers are drawn (off in tight spots). */
  beams?: boolean;
  size?: number;
}) {
  const id = useSvgId();
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={`fy-por ${className}`}
      data-mood={mood}
      data-alarm={alarm || undefined}
      data-hit={hit || undefined}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}b`} x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#ff9be0" />
          <stop offset=".45" stopColor="#ff2e88" />
          <stop offset="1" stopColor="#8d0f6e" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14042c" />
          <stop offset=".42" stopColor="#5b1677" />
          <stop offset=".56" stopColor="#ff4fa3" />
          <stop offset=".7" stopColor="#ffb35c" />
          <stop offset=".78" stopColor="#3a0b52" />
          <stop offset="1" stopColor="#14042c" />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff5a4a" />
          <stop offset="1" stopColor="#b3001b" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={LENS_L} />
          <path d={LENS_R} />
        </clipPath>
      </defs>

      <g className="fy-por-body">
        {/* The headband's tails, fluttering behind her. */}
        <g className="fy-por-tails">
          <path d="M14 18.2C9.5 16.2 6.2 18.4 1.2 15.6C5.4 19.6 9.4 19.6 13.8 19.8Z" fill={`url(#${id}r)`} />
          <path d="M13.7 19.6C9.6 20.6 7 23.2 2.6 22.8C6.6 24.8 10.2 22.5 14 20.6Z" fill={`url(#${id}r)`} />
        </g>
        <path d={CONE} fill={`url(#${id}b)`} />
        {/* Rim light from the sun behind her, and the cyan sky on her other side. */}
        <path d="M24 6C26 6 27.5 7.2 28.6 9L43 36C44.5 39 42.5 42 39 42" fill="none" stroke="#ffd36b" strokeWidth=".9" strokeLinecap="round" opacity=".8" />
        <path d="M19.4 9L5 36C3.5 39 5.5 42 9 42" fill="none" stroke="#7df3ff" strokeWidth=".7" strokeLinecap="round" opacity=".55" />
        <path d="M14.9 17.3Q24 16.2 33.1 17.3L34.8 20.6Q24 19.5 13.2 20.6Z" fill={`url(#${id}r)`} />
        <path d="M14.4 18.1Q24 17.1 33.6 18.1" fill="none" stroke="#ffb0a0" strokeWidth=".35" opacity=".7" />
        <circle cx="13.9" cy="19.2" r="1.25" fill="#c8001f" />

        {/* The wayfarers. */}
        <path d="M11.6 26.7H36.4" stroke="#09020f" strokeWidth="1.5" strokeLinecap="round" />
        <path d={LENS_L} fill={`url(#${id}l)`} stroke="#09020f" strokeWidth=".9" />
        <path d={LENS_R} fill={`url(#${id}l)`} stroke="#09020f" strokeWidth=".9" />
        <path d="M23 27.6Q24 26.9 25 27.6" fill="none" stroke="#09020f" strokeWidth=".9" />
        <g clipPath={`url(#${id}c)`}>
          {/* A glint that sweeps the lenses while she thinks. */}
          <rect className="fy-por-glint" x="6" y="24" width="3.2" height="12" fill="#fff" opacity=".8" transform="skewX(-24)" />
          <rect className="fy-por-red" x="10" y="24" width="28" height="10" fill="#ff1f3d" />
        </g>
        <path d="M14 27.8L15.6 27.8M26.4 27.8L28 27.8" stroke="#fff" strokeWidth=".55" strokeLinecap="round" opacity=".75" />

        {/* Laser eyes. */}
        {beams && (
          <g className="fy-por-beams">
            <path d="M17.9 29.5L-80 41" />
            <path d="M30.1 29.5L-80 47" />
          </g>
        )}
      </g>
    </svg>
  );
}

/* ───────── Neon block letters ───────── */

/** A 5×7 matrix face, like a terminal's character ROM, for banners. */
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
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  "-": [".....", ".....", ".....", ".###.", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", ".....", "..#.."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "?": [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
};

/**
 * Text in big block letters, the way an 80s color terminal prints a banner:
 * every cell a square of light, in bands of color down the rows like ANSI
 * art (yellow, orange, pink: a sunset), with a cyan ghost knocked off to one
 * side like a misaligned CRT gun. The colors are CSS variables (--bt-a, -b,
 * -c, --bt-ghost), so ACCESS DENIED can burn red and a mono screen can go
 * green. With `paint`, the rows draw in from the top.
 */
export function BlockText({
  text,
  className,
  paint = false,
  step = 70,
  delay = 0,
}: {
  text: string;
  className?: string;
  paint?: boolean;
  step?: number;
  /** ms before the first row paints. */
  delay?: number;
}) {
  const id = useSvgId();
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
  const cells = (y: number, xs: number[]) =>
    xs.map((x) => <rect key={x} x={x + 0.06} y={y + 0.06} width={0.88} height={0.88} />);
  return (
    <svg viewBox={`-0.3 -0.3 ${w + 0.8} 7.7`} className={`fy-bt ${className ?? ""}`} aria-hidden>
      <defs>
        {/* Hard bands, two rows, two rows, three rows: a terminal has no gradients. */}
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0" className="fy-bt-a" />
          <stop offset=".2857" className="fy-bt-a" />
          <stop offset=".2857" className="fy-bt-b" />
          <stop offset=".5714" className="fy-bt-b" />
          <stop offset=".5714" className="fy-bt-c" />
          <stop offset="1" className="fy-bt-c" />
        </linearGradient>
      </defs>
      <g className="fy-bt-ghost" transform="translate(.22 .14)">
        {rows.map((xs, y) => (
          <g key={y} className={paint ? "fy-paint" : undefined} style={paint ? ({ "--at": `${delay + y * step}ms` } as CSSProperties) : undefined}>
            {cells(y, xs)}
          </g>
        ))}
      </g>
      <g fill={`url(#${id}g)`} className="fy-bt-face">
        {rows.map((xs, y) => (
          <g key={y} className={paint ? "fy-paint" : undefined} style={paint ? ({ "--at": `${delay + y * step}ms` } as CSSProperties) : undefined}>
            {cells(y, xs)}
          </g>
        ))}
      </g>
    </svg>
  );
}

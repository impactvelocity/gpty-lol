"use client";

import { type CSSProperties, type ReactNode, useMemo } from "react";
import { art as bbsArt, moonGrid, PixelArt } from "./bbs/art";
import { art as caveArt } from "./caveman/art";
import { art as elfArt } from "./elf/art";
import { Picto } from "./caveman/pictos";
import { art as fbArt, Sheep, SheepSkyHill } from "./facebook/art";
import { art as icqArt } from "./icq/art";
import { art as ircArt, Trout } from "./irc/art";
import { MachineScene } from "./machine/art";
import { Envelope as RedditEnvelope, Lantern, art as redditArt } from "./reddit/art";
import { MoonFace, art as seanceArt, STAR } from "./seance/art";
import { art as skypeArt } from "./skype/art";
import { art as slackArt } from "./slack/art";
import { SlotsScene } from "./slots/art";
import { MainframeScene } from "./terminal/scene";

/**
 * One illustrated backdrop per agent: a sky, a scene along the bottom and a
 * few floating period details, all in SVG and CSS (animations are the `sc-*`
 * classes in globals.css). Classic subjects, drawn flat and soft so they sit
 * behind a modern app instead of competing with it.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;
const v = (s: Vars) => s as CSSProperties;

/** Whether the shell should draw light text (dark scene) or dark text (light scene). */
export type Tone = "dark" | "light";

/** Small deterministic PRNG so scattered details land in the same place every time. */
function rand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Seeded scatter, computed once: `make` is read on first render only. */
function useScatter<T>(seed: number, n: number, make: (r: () => number, i: number) => T) {
  return useMemo(
    () => {
      const r = rand(seed);
      return Array.from({ length: n }, (_, i) => make(r, i));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, n],
  );
}

/**
 * A random spot that keeps clear of the sidebar column, where the agent list
 * is. The chat window fills the rest, so what you mostly see of a scene is the
 * sidebar column and the margins. Each scene's featured pieces sit at the foot
 * of that column, in px from the bottom-left, marked `sc-under`: they only
 * show on screens tall enough to leave room under the list.
 */
function spot(r: () => number) {
  return { x: 23 + r() * 72, y: 4 + r() * 88 };
}

/** A wobbly horizon for a 1600-wide SVG: rocky (`sharp`) or rolling. */
function edge(seed: number, { h, base, amp, step, sharp = false, top = false }: {
  h: number; base: number; amp: number; step: number; sharp?: boolean; top?: boolean;
}) {
  const r = rand(seed);
  const pts: [number, number][] = [];
  for (let x = 0; x <= 1600 + step; x += step * (0.6 + r() * 0.8)) {
    const y = top ? base + (sharp && pts.length % 2 ? amp * (0.4 + r() * 0.9) : r() * amp * 0.3) : base - r() * amp;
    pts.push([Math.min(x, 1600), y]);
  }
  const line = sharp
    ? pts.map(([x, y]) => `L${x.toFixed(0)} ${y.toFixed(0)}`).join(" ")
    : pts.map(([x, y], i) => {
        if (i === 0) return `L${x} ${y.toFixed(0)}`;
        const [px, py] = pts[i - 1];
        return `C${(px + (x - px) / 2).toFixed(0)} ${py.toFixed(0)} ${(px + (x - px) / 2).toFixed(0)} ${y.toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)}`;
      }).join(" ");
  return top ? `M0 0 ${line} L1600 0 Z` : `M0 ${h} ${line} L1600 ${h} Z`;
}

function Layer({ d, fill, height, top = false, h = 300, className = "", style }: {
  d: string; fill: string; height: string; top?: boolean; h?: number; className?: string; style?: CSSProperties;
}) {
  return (
    <svg
      viewBox={`0 0 1600 ${h}`}
      preserveAspectRatio="none"
      className={`absolute inset-x-0 w-full ${top ? "top-0" : "bottom-0"} ${className}`}
      style={{ height, ...style }}
      aria-hidden
    >
      <path d={d} fill={fill} />
    </svg>
  );
}

function Stars({ seed, n, top = 0, bottom = 60, color = "#fff", square = false, max = 2.4 }: {
  seed: number; n: number; top?: number; bottom?: number; color?: string; square?: boolean; max?: number;
}) {
  const stars = useScatter(seed, n, (r) => ({
    x: r() * 100, y: top + r() * (bottom - top), s: 1 + r() * max, d: 2 + r() * 4, dl: -r() * 6,
  }));
  return (
    <>
      {stars.map((s, i) => (
        <span
          key={i}
          className="sc-twinkle absolute"
          style={v({
            left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, background: color,
            borderRadius: square ? 0 : "50%", "--d": `${s.d}s`, "--dl": `${s.dl}s`,
          })}
        />
      ))}
    </>
  );
}

/** A flat, puffy cloud. */
function Cloud({ width, color = "#fff", opacity = 1 }: { width: number; color?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 220 100" width={width} style={{ opacity }} aria-hidden>
      <g fill={color}>
        <circle cx="62" cy="60" r="32" />
        <circle cx="108" cy="44" r="40" />
        <circle cx="156" cy="58" r="30" />
        <circle cx="186" cy="74" r="20" />
        <circle cx="32" cy="76" r="20" />
        <rect x="30" y="62" width="160" height="34" rx="17" />
      </g>
    </svg>
  );
}

/** Clouds that cross the sky slowly, each on its own lane. */
function DriftingClouds({ seed, n, top = 4, bottom = 40, color = "#fff", min = 120, max = 260, speed = 1 }: {
  seed: number; n: number; top?: number; bottom?: number; color?: string; min?: number; max?: number; speed?: number;
}) {
  const clouds = useScatter(seed, n, (r, i) => ({
    y: top + ((i + r() * 0.8) / n) * (bottom - top), w: min + r() * (max - min),
    d: (110 + r() * 90) / speed, dl: -r() * 200, o: 0.75 + r() * 0.25,
  }));
  return (
    <>
      {clouds.map((c, i) => (
        <div key={i} className="sc-drift absolute left-0" style={v({ top: `${c.y}%`, "--d": `${c.d}s`, "--dl": `${c.dl}s` })}>
          <Cloud width={c.w} color={color} opacity={c.o} />
        </div>
      ))}
    </>
  );
}

/** Something that floats in place, bobbing gently. */
function Float({ x, y, b, children, d = 7, dl = 0, r = 0, className = "" }: {
  x: string; y?: string; b?: number; children: ReactNode; d?: number; dl?: number; r?: number; className?: string;
}) {
  return (
    <div
      className={`sc-bob absolute ${b !== undefined ? "sc-under" : ""} ${className}`}
      style={v({ left: x, top: y, bottom: b, "--d": `${d}s`, "--dl": `${-dl}s`, "--r": `${r}deg` })}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────── 10,000 BC ─────────────────────────── */

const OCHRE = "#d0773a";

function Mammoth() {
  return (
    <svg viewBox="0 0 150 110" width="190" aria-hidden>
      <g fill="none" stroke={OCHRE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 74 C18 44 42 22 76 24 C98 26 114 38 118 56 C124 68 128 84 120 96" />
        <path d="M24 74 C46 86 88 86 106 74" />
        <path d="M112 66 C124 74 136 72 140 60" />
        <path d="M36 80 L34 104 M54 84 L54 106 M84 84 L84 106 M100 78 L102 102" />
        <path d="M40 34 C30 30 22 36 18 46" />
      </g>
      <circle cx="104" cy="46" r="2.6" fill={OCHRE} />
    </svg>
  );
}

function Hunter({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 60 90" width="44" style={{ transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <g fill="none" stroke={OCHRE} strokeWidth="3.5" strokeLinecap="round">
        <circle cx="30" cy="14" r="7" fill={OCHRE} stroke="none" />
        <path d="M30 22 L28 52 M28 52 L18 82 M28 52 L40 80 M29 32 L12 44 M29 32 L48 22 M54 4 L36 46" />
      </g>
    </svg>
  );
}

function Hand({ size = 54, rotate = 0 }: { size?: number; rotate?: number }) {
  return (
    <svg viewBox="0 0 60 70" width={size} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden>
      <g fill={OCHRE}>
        <ellipse cx="30" cy="48" rx="16" ry="18" />
        <rect x="11" y="10" width="7" height="30" rx="3.5" transform="rotate(-14 14 30)" />
        <rect x="21" y="3" width="7" height="32" rx="3.5" />
        <rect x="32" y="4" width="7" height="31" rx="3.5" />
        <rect x="42" y="12" width="7" height="27" rx="3.5" transform="rotate(12 45 26)" />
        <rect x="46" y="36" width="7" height="22" rx="3.5" transform="rotate(48 50 46)" />
      </g>
    </svg>
  );
}

/** Flat-topped mesas along a 1600-wide horizon, for the valley below the cave. */
function mesas(seed: number, { base, amp }: { base: number; amp: number }) {
  const r = rand(seed);
  let x = 0;
  let d = `M0 300 L0 ${base}`;
  while (x < 1600) {
    const flat = 60 + r() * 160;
    const top = base - amp * (0.35 + r() * 0.65);
    const rise = 14 + r() * 26;
    d += ` L${(x + rise).toFixed(0)} ${top.toFixed(0)} L${(x + rise + flat).toFixed(0)} ${(top + r() * 6).toFixed(0)} L${(x + rise * 2 + flat).toFixed(0)} ${(base - r() * 10).toFixed(0)}`;
    x += rise * 2 + flat + 40 + r() * 160;
    d += ` L${Math.min(x, 1600).toFixed(0)} ${(base - r() * 8).toFixed(0)}`;
  }
  return `${d} L1600 300 Z`;
}

/** The cave wall around the mouth: the left side (the sidebar sits in its shadow) or the right. */
function CaveWall({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  const edge = left
    ? "M0 0 L330 0 L296 64 L338 150 L288 236 L322 330 L268 424 L312 522 L276 612 L330 716 L296 818 L350 918 L330 1000 L0 1000 Z"
    : "M400 0 L150 0 L196 90 L140 190 L206 300 L156 410 L214 520 L170 640 L226 760 L180 880 L220 1000 L400 1000 Z";
  const rim = left
    ? "M330 0 L296 64 L338 150 L288 236 L322 330 L268 424 L312 522 L276 612 L330 716 L296 818 L350 918 L330 1000"
    : "M150 0 L196 90 L140 190 L206 300 L156 410 L214 520 L170 640 L226 760 L180 880 L220 1000";
  return (
    <svg
      viewBox="0 0 400 1000"
      preserveAspectRatio="none"
      className={`absolute inset-y-0 h-full ${left ? "left-0 w-[min(32vw,440px)]" : "right-0 w-[min(14vw,170px)]"}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={`cave-${side}`} x1={left ? "0" : "1"} x2={left ? "1" : "0"} y1="0" y2="0">
          <stop offset="0" stopColor="#0b0403" />
          <stop offset=".7" stopColor="#140806" />
          <stop offset="1" stopColor="#24100b" />
        </linearGradient>
      </defs>
      <path d={edge} fill={`url(#cave-${side})`} />
      <path d={rim} fill="none" stroke="#7a2e1f" strokeOpacity=".55" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

/** A small campfire at the foot of the sidebar. */
function Campfire() {
  return (
    <svg viewBox="0 0 80 70" width="92" aria-hidden>
      <g className="sc-flicker">
        <path d="M40 6c4 10 15 15 15 29 0 11-7 19-15 19s-16-7-15-17c1-8 6-12 8-17 1 5 3 7 5 8-1-9 0-16 2-22Z" fill="#e8642c" />
        <path d="M40 26c2 6 8 9 7 16-.4 5-3.4 8-7 8-4 0-6.6-3.2-6.2-7 .4-3.6 3.2-5.6 4.4-8.8 1.2 2 2 2.8 3.2 2.8-.8-3.6-1.6-6.8-1.4-11Z" fill="#ffc35a" />
      </g>
      <path d="M14 64 66 55M14 55l52 9" stroke="#3a1a10" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Grug's cave at red twilight: the view out of the cave mouth over a valley,
 * a low sun going down behind the mesas, a herd of mammoths crossing far off,
 * the first stars. The sidebar sits in the shadow of the cave wall on the
 * left, where the old paintings are and the fire is lit. The picture once
 * it's in (see src/components/caveman/ART.md), else drawn.
 */
function Cave() {
  const photo = caveArt("wallpaper");
  const herd = useScatter(14, 5, (r, i) => ({ w: 46 + r() * 34, d: 340 + r() * 160, dl: -(i * 70 + r() * 60) }));
  const birds = useScatter(15, 4, (r) => ({ y: 18 + r() * 26, s: 12 + r() * 10, d: 90 + r() * 60, dl: -r() * 150 }));
  const embers = useScatter(11, 14, (r) => ({ x: 70 + r() * 70, d: 4 + r() * 4, dl: -r() * 8, s: 2 + r() * 3, dx: (r() - 0.5) * 80 }));
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt="" draggable={false} decoding="async" className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[60%_62%]" />
    );
  }
  return (
    <>
      <Stars seed={13} n={46} top={0} bottom={36} color="#ffdcb8" max={2} />
      {/* The sun, low and red, with its haze. */}
      <div className="absolute left-[68%] top-[48%] h-[90vh] w-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,150,70,.42),rgba(255,110,50,.12)_55%,transparent)]" />
      <div className="absolute left-[68%] top-[66%] h-[22vh] w-[22vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_40%,#ffe0a0,#f7a14e_55%,#e46a30)] shadow-[0_0_80px_30px_rgba(255,120,50,.35)]" />
      {birds.map((b, i) => (
        <div key={i} className="sc-drift absolute left-0" style={v({ top: `${b.y}%`, "--d": `${b.d}s`, "--dl": `${b.dl}s` })}>
          <svg viewBox="0 0 24 10" width={b.s} aria-hidden>
            <path d="M1 3c3-1.6 6-1 10 3 4-4 7-4.6 12-3" fill="none" stroke="#2a0c10" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      ))}
      <Layer d={mesas(21, { base: 200, amp: 150 })} fill="#7a2824" height="46%" style={{ opacity: 0.9 }} />
      <Layer d={edge(22, { h: 300, base: 120, amp: 50, step: 160 })} fill="#4a161a" height="30%" />
      {/* A herd crossing the valley, very slowly. */}
      <div className="absolute inset-x-0 bottom-[19.5%] h-0">
        {herd.map((m, i) => (
          <div key={i} className="sc-drift absolute bottom-0 left-0" style={v({ "--d": `${m.d}s`, "--dl": `${m.dl}s` })}>
            <span className="block" style={{ color: "#2b0d10", ["--p2" as string]: "#2b0d10", width: m.w }}>
              <Picto id={i % 3 === 2 ? "bison" : "mammoth"} className="block w-full" paint={false} />
            </span>
          </div>
        ))}
      </div>
      <Layer d={edge(23, { h: 300, base: 200, amp: 70, step: 110, sharp: true })} fill="#26100e" height="20%" />
      <CaveWall side="right" />
      <CaveWall side="left" />
      <Layer top h={120} d={edge(3, { h: 120, base: 18, amp: 90, step: 46, sharp: true, top: true })} fill="#0b0403" height="120px" />
      <Layer d={edge(6, { h: 300, base: 250, amp: 50, step: 90, sharp: true })} fill="#0b0403" height="9%" />
      {/* Firelight on the left wall, and the paintings it lights. */}
      <div className="sc-flicker absolute bottom-[-30%] left-[150px] h-[80%] w-[min(80vw,900px)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,130,40,.34),rgba(255,100,30,.1)_55%,transparent)]" />
      <div className="absolute left-[24px] top-[14%] flex gap-2 opacity-40"><Hand size={44} rotate={-18} /><Hand size={36} rotate={8} /></div>
      <div className="absolute left-[150px] top-[40%] opacity-30"><Hunter /></div>
      <div className="sc-under absolute bottom-[70px] left-[100px] rotate-[-4deg] opacity-45"><Mammoth /></div>
      <div className="sc-under absolute bottom-[10px] left-[106px]"><Campfire /></div>
      {embers.map((e, i) => (
        <span
          key={i}
          className="sc-rise sc-under absolute rounded-full bg-[#ffb35c]"
          style={v({ left: e.x, bottom: 46, width: e.s, height: e.s, "--d": `${e.d}s`, "--dl": `${e.dl}s`, "--x": `${e.dx}px`, boxShadow: "0 0 8px #ff8a2a" })}
        />
      ))}
      {/* Grain over everything, like the prints this is styled after. */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "180px" }} />
    </>
  );
}

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 .6'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>\")";

/* ─────────────────────────── 1888 ─────────────────────────── */

const GOLD = "#C9A55A";
const BONE = "#ECE3CF";

/** Blotchy, uneven darkness, like a print that's been handled for a century. */
const MOTTLE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='520' height='520'><filter id='m' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='4' seed='9' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.6 0 0 0 -1.15'/></filter><rect width='100%' height='100%' filter='url(%23m)'/></svg>\")";

/** The alphabet of a talking board, engraved in gold, turning very slowly in a ring. */
function LetterRing() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ✦ 1234567890 ✦ YES ✦ NO ✦ ";
  return (
    <svg viewBox="0 0 400 400" className="sc-spin absolute -bottom-[76vh] left-[150px] w-[110vh] -translate-x-1/2 opacity-[.2]" style={v({ "--d": "300s" })} aria-hidden>
      <defs>
        <path id="sc-ring" d="M200 200 m-166 0 a166 166 0 1 1 332 0 a166 166 0 1 1 -332 0" />
      </defs>
      <circle cx="200" cy="200" r="190" fill="none" stroke={GOLD} strokeWidth="0.7" />
      <circle cx="200" cy="200" r="186" fill="none" stroke={GOLD} strokeWidth="0.5" strokeDasharray="0.1 4" strokeLinecap="round" />
      <circle cx="200" cy="200" r="146" fill="none" stroke={GOLD} strokeWidth="0.7" />
      <circle cx="200" cy="200" r="104" fill="none" stroke={GOLD} strokeWidth="0.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={200 + Math.cos(a) * 104} y1={200 + Math.sin(a) * 104} x2={200 + Math.cos(a) * 146} y2={200 + Math.sin(a) * 146} stroke={GOLD} strokeWidth="0.5" />;
      })}
      <text fill={GOLD} fontFamily="var(--font-fell-sc), Georgia, serif" fontSize="19" letterSpacing="8">
        <textPath href="#sc-ring">{letters}</textPath>
      </text>
    </svg>
  );
}

/** A four-pointed star, twinkling. */
function Twinkle({ x, y, s, d, dl }: { x: number; y: number; s: number; d: number; dl: number }) {
  return (
    <svg viewBox="0 0 24 24" width={s} className="sc-twinkle absolute" style={v({ left: `${x}%`, top: `${y}%`, "--d": `${d}s`, "--dl": `${dl}s` })} aria-hidden>
      <path d={STAR} fill={GOLD} />
    </svg>
  );
}

/**
 * The room of the séance, after Lottery Clock's Ouija: warm charcoal that
 * smoulders from below, engraved gold stars, the sleeping crescent moon, a
 * board's alphabet turning behind the sidebar, smoke, and old-film mottling,
 * dust and scratches. The board itself floats in the window. The picture
 * once it's in (see src/components/seance/ART.md), else drawn.
 */
function Parlor() {
  const photo = seanceArt("wallpaper");
  const stars = useScatter(21, 22, (r) => ({ ...spot(r), s: 7 + r() * 11, d: 2.4 + r() * 3, dl: -r() * 5 }));
  const dots = useScatter(23, 30, (r) => ({ x: 3 + r() * 94, y: 4 + r() * 80, r: 1 + r() * 1.8, d: 2.4 + r() * 3, dl: -r() * 5 }));
  const dust = useScatter(24, 40, (r) => ({ x: r() * 100, y: r() * 100, s: 1 + r() * 2.4, o: 0.04 + r() * 0.1 }));
  const wisps = useScatter(22, 5, (r) => ({ x: 24 + r() * 72, d: 10 + r() * 8, dl: -r() * 18 }));
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt="" draggable={false} decoding="async" className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[60%_50%]" />
    );
  }
  return (
    <>
      {/* The room smoulders from below. */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(ellipse_75%_65%_at_50%_100%,rgba(154,106,48,.16)_0%,rgba(154,106,48,.05)_45%,transparent_75%)]" />
      {dots.map((d, i) => (
        <span key={i} className="sc-twinkle absolute rounded-full" style={v({ left: `${d.x}%`, top: `${d.y}%`, width: d.r, height: d.r, background: GOLD, "--d": `${d.d}s`, "--dl": `${d.dl}s` })} />
      ))}
      {stars.map((t, i) => (
        <Twinkle key={i} x={t.x} y={t.y} s={t.s} d={t.d} dl={t.dl} />
      ))}
      <LetterRing />
      <svg viewBox="-80 -80 160 160" className="absolute right-[2.5%] top-[5%] hidden w-[150px] opacity-60 min-[1700px]:block" aria-hidden>
        <circle r="74" fill="none" stroke={GOLD} strokeWidth="0.6" strokeDasharray="0.1 5" strokeLinecap="round" opacity=".6" />
        <g className="seance">
          <MoonFace x={0} y={0} s={1.2} />
        </g>
      </svg>
      {wisps.map((w, i) => (
        <svg key={i} viewBox="0 0 40 200" width="40" className="sc-rise absolute bottom-[10%]" style={v({ left: `${w.x}%`, "--d": `${w.d}s`, "--dl": `${w.dl}s`, "--x": "30px" })} aria-hidden>
          <path d="M20 200 C0 160 40 130 20 100 C0 70 40 40 20 0" fill="none" stroke="rgba(236,227,207,.12)" strokeWidth="2" />
        </svg>
      ))}
      {/* Old film: mottling, grain, dust and a vignette. */}
      <div className="absolute inset-0 opacity-[.18] mix-blend-multiply" style={{ backgroundImage: MOTTLE }} />
      <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "180px" }} />
      {dust.map((d, i) => (
        <span key={i} className="absolute block rounded-full" style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s * 0.8, background: BONE, opacity: d.o }} />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_42%,transparent_52%,rgba(0,0,0,.24)_84%,rgba(0,0,0,.42)_100%)]" />
    </>
  );
}

/* ─────────────────────────── 1993 ─────────────────────────── */

const ANSI = ["#55ffff", "#ff55ff", "#ffff55", "#55ff55"];

function Skyline() {
  const blocks = useScatter(31, 34, (r) => {
    const h = 70 + r() * 200;
    const lit = Array.from({ length: 2 + Math.floor(r() * 7) }, () => ({
      x: Math.floor(r() * 4), y: Math.floor(r() * (h / 14)), c: ANSI[Math.floor(r() * ANSI.length)],
    }));
    return { w: 34 + r() * 46, h, lit, tone: r() > 0.5 ? "#0e1138" : "#121644" };
  });
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between">
      {blocks.map((b, i) => (
        <div key={i} className="relative shrink-0" style={{ width: `${b.w / 16}%`, height: b.h, background: b.tone, boxShadow: "inset 0 2px 0 rgba(85,255,255,.12)" }}>
          {b.lit.map((l, j) => (
            <span key={j} className="sc-blink absolute h-[5px] w-[6px]" style={v({ left: `${14 + l.x * 20}%`, top: 10 + l.y * 14, background: l.c, "--d": `${3 + j}s`, boxShadow: `0 0 6px ${l.c}` })} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** BBS: the night photo once it's in (see src/components/bbs/ART.md), else the drawn town. */
function Midnight() {
  const photo = bbsArt("wallpaper");
  if (!photo) return <Town1993 />;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        alt=""
        draggable={false}
        decoding="async"
        className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[40%_70%]"
      />
      {/* The house's pale siding sits behind the agent list: a little more night there. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,24,.5)_0,rgba(4,6,24,.32)_280px,transparent_520px)] max-md:hidden" />
    </>
  );
}

/**
 * A town asleep at midnight, drawn like the BBS's own ANSI screen: square
 * stars, a dithered crescent moon, lit windows in DOS colors, and the phone
 * line on its pole, carrying little bursts of data off toward the monitor.
 */
function Town1993() {
  const moon = moonGrid();
  return (
    <>
      <Stars seed={9} n={70} square color="#cfe8ff" bottom={55} max={2} />
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-[linear-gradient(0deg,rgba(40,40,170,.28),transparent)]" />
      <PixelArt
        g={moon}
        className="absolute bottom-[300px] left-[130px] hidden w-[120px] -translate-x-1/2 opacity-80 drop-shadow-[0_0_36px_rgba(255,255,85,.16)] [@media(min-height:1280px)]:block"
      />
      <Skyline />
      <PhoneLine />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,.28)_0_1px,transparent_1px_3px)]" />
    </>
  );
}

/** A telephone pole at the foot of the sidebar, its wires running off to the right. */
function PhoneLine() {
  const wires = ["M262 74 C 700 150, 1100 130, 1600 96", "M226 74 C 640 170, 1060 160, 1600 128"];
  return (
    <svg viewBox="0 0 1600 420" preserveAspectRatio="xMinYMax slice" className="absolute inset-x-0 bottom-0 h-[420px] w-full" aria-hidden>
      <g fill="#07081f">
        <rect x="240" y="58" width="9" height="362" />
        <rect x="240" y="58" width="1.5" height="362" fill="#1f2a5c" />
        <rect x="214" y="70" width="62" height="7" rx="1" />
        <rect x="222" y="62" width="6" height="9" rx="1" fill="#2a2f5a" />
        <rect x="258" y="62" width="6" height="9" rx="1" fill="#2a2f5a" />
      </g>
      {wires.map((d, i) => (
        <g key={i}>
          <path id={`sc-wire-${i}`} d={d} fill="none" stroke="#0b0d2a" strokeWidth="2" />
          {[0, 1, 2].map((k) => (
            <rect key={k} width="7" height="3" y="-1.5" x="-3.5" fill={i ? "#ff55ff" : "#55ffff"} style={{ filter: `drop-shadow(0 0 4px ${i ? "#ff55ff" : "#55ffff"})` }}>
              <animateMotion dur={`${5 + i * 1.7}s`} begin={`${-k * (1.9 + i)}s`} repeatCount="indefinite" rotate="auto">
                <mpath href={`#sc-wire-${i}`} />
              </animateMotion>
            </rect>
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────── 1999 ─────────────────────────── */

function MiniWindow({ w, title }: { w: number; title: string }) {
  return (
    <div className="bevel-window bg-[#d4d0c8] p-[2px] font-[Tahoma,Arial,sans-serif] text-[10px]" style={{ width: w }}>
      <div className="flex h-[16px] items-center justify-between bg-gradient-to-r from-[#0a246a] to-[#a6caf0] px-1 font-bold text-white">
        <span className="truncate">{title}</span>
        <span className="flex gap-[2px]">
          {[0, 1, 2].map((i) => <span key={i} className="bevel-out h-[11px] w-[12px] bg-[#d4d0c8]" />)}
        </span>
      </div>
      <div className="bevel-in m-[2px] space-y-1 bg-white p-1.5">
        {[78, 52, 64].map((p, i) => <div key={i} className="h-[4px] rounded-full bg-[#c9d3e3]" style={{ width: `${p}%` }} />)}
      </div>
    </div>
  );
}

const CHANNELS = ["#chat", "#help", "#linux", "#mp3", "#quake", "#y2k", "#efnet", "#winamp", "#coffee"];

/** mIRC: the 3am picture once it's in (see src/components/irc/ART.md), else the drawn night. */
function Night1999() {
  const photo = ircArt("wallpaper");
  if (!photo) return <Desktop2000 />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt=""
      draggable={false}
      decoding="async"
      className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[50%_60%]"
    />
  );
}

/** 3am in 1999: a starry desktop where channel names drift like constellations, and one trout. */
function Desktop2000() {
  const tags = useScatter(41, CHANNELS.length, (r, i) => ({ t: CHANNELS[i], ...spot(r), d: 6 + r() * 5, dl: r() * 8 }));
  return (
    <>
      <Stars seed={43} n={90} top={0} bottom={92} max={1.8} />
      <div className="absolute bottom-[-30%] right-[-10%] h-[80%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(90,170,255,.28),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.05)_1px,transparent_1.5px)] [background-size:22px_22px]" />
      <Float x="24px" b={68} r={-4} d={9}><MiniWindow w={190} title="Status - irc.gpty.lol" /></Float>
      <Float x="150px" b={160} d={7} dl={2}>
        <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-[Tahoma,Arial,sans-serif] text-[13px] font-bold text-white/80 backdrop-blur-sm">#y2k</span>
      </Float>
      <Float x="88%" y="10%" r={3} d={11} dl={3}><MiniWindow w={150} title="Winamp 2.5e" /></Float>
      <Float x="23%" y="44%" r={-2} d={10} dl={5}><MiniWindow w={140} title="Notepad" /></Float>
      <Float x="70%" y="74%" r={-14} d={8} dl={1}>
        <div className="w-[92px] opacity-80 [filter:drop-shadow(0_6px_14px_rgba(0,0,0,.4))]"><Trout className="block h-auto w-full" /></div>
      </Float>
      {tags.map((t, i) => (
        <Float key={i} x={`${t.x}%`} y={`${t.y}%`} d={t.d} dl={t.dl}>
          <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-[Tahoma,Arial,sans-serif] text-[13px] font-bold text-white/80 backdrop-blur-sm">
            {t.t}
          </span>
        </Float>
      ))}
    </>
  );
}

/* ─────────────────────────── 2000 ─────────────────────────── */

function Flower({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx="50" cy="24" rx="12" ry="20" fill={i === 1 ? "#e5382b" : "#5cc14a"} transform={`rotate(${i * 45} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="13" fill="#ffd53d" />
    </svg>
  );
}

/** ICQ: Daisy's meadow photo, daisies in the bottom-left under the sidebar; else the drawn flowers. */
function Win98() {
  const photo = icqArt("wallpaper");
  if (!photo) return <Flowers2000 />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt=""
      draggable={false}
      decoding="async"
      className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[15%_70%]"
    />
  );
}

function Flowers2000() {
  const flowers = useScatter(51, 13, (r) => ({ ...spot(r), s: 34 + r() * 90, d: 50 + r() * 70, o: 0.35 + r() * 0.5, b: 6 + r() * 6, dl: r() * 8 }));
  return (
    <>
      {flowers.map((f, i) => (
        <Float key={i} x={`${f.x}%`} y={`${f.y}%`} d={f.b} dl={f.dl}>
          <div className="sc-spin" style={v({ "--d": `${f.d}s`, opacity: f.o })}><Flower size={f.s} /></div>
        </Float>
      ))}
      <Float x="24px" b={110} d={6}><Bubble text="Uh-oh!" /></Float>
      <div className="sc-under absolute bottom-[64px] left-[190px]"><div className="sc-spin" style={v({ "--d": "70s" })}><Flower size={72} /></div></div>
      <div className="sc-under absolute bottom-[150px] left-[140px] opacity-70"><div className="sc-spin" style={v({ "--d": "50s" })}><Flower size={38} /></div></div>
      <Float x="89%" y="18%" d={7} dl={3}><Bubble text="Uh-oh!" /></Float>
    </>
  );
}

function Bubble({ text, color = "#e5382b" }: { text: string; color?: string }) {
  return (
    <span className="relative inline-block rounded-2xl bg-white px-3 py-1.5 font-[Tahoma,Arial,sans-serif] text-[14px] font-bold shadow-[0_8px_24px_rgba(0,0,0,.18)]" style={{ color }}>
      {text}
      <span className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 bg-white" />
    </span>
  );
}

/* ─────────────────────────── 2005 ─────────────────────────── */

/** MSN: a green hill dotted with daisies under a big blue sky, drifting in very slowly. */
function Bliss() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/msn/wallpaper.webp"
      alt=""
      draggable={false}
      decoding="async"
      className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[50%_70%]"
    />
  );
}

/* ─────────────────────────── 2007 ─────────────────────────── */

/** Skype: a 2007 Aero-blue desktop of light swooshes, else the drawn clouds. */
function Sky2007() {
  const photo = skypeArt("wallpaper");
  if (!photo) return <Clouds2007 />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt=""
      draggable={false}
      decoding="async"
      className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[50%_55%]"
    />
  );
}

function Clouds2007() {
  const bank = useScatter(71, 9, (r, i) => ({ x: i * 12 - 6 + r() * 6, w: 280 + r() * 220, b: -6 + r() * 10 }));
  return (
    <>
      <div className="absolute left-[-10%] top-[-30%] h-[80%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,.7),transparent)]" />
      <DriftingClouds seed={72} n={8} top={6} bottom={58} min={120} max={260} speed={0.8} />
      <Float x="24px" b={96} d={6}><Bubble text="can you hear me?" color="#0091d6" /></Float>
      <Float x="88%" y="20%" d={7} dl={2}><Bubble text="…you froze" color="#0091d6" /></Float>
      <Float x="24%" y="36%" d={5.5} dl={4}><Bubble text="hello?" color="#0091d6" /></Float>
      <div className="absolute inset-x-0 bottom-0 h-[30%]">
        {bank.map((c, i) => (
          <div key={i} className="absolute" style={{ left: `${c.x}%`, bottom: `${c.b}%` }}>
            <Cloud width={c.w} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────── 2008 ─────────────────────────── */

/**
 * Facebook: the photo is soft violet light ribbons on deep blue. Without it, the
 * drawn fallback is a sky full of thrown sheep drifting over a pasture.
 */
function Pasture() {
  const photo = fbArt("wallpaper");
  const flock = useScatter(121, 9, (r, i) => ({
    y: 5 + ((i + r() * 0.8) / 9) * 56, w: 64 + r() * 90, d: 150 + r() * 110, dl: -r() * 260, tilt: -14 + r() * 28, flip: r() > 0.7,
  }));
  const badges = useScatter(122, 5, (r) => ({ ...spot(r), n: 1 + Math.floor(r() * 4), d: 6 + r() * 4, dl: r() * 8 }));
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt="" draggable={false} decoding="async" className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[50%_60%]" />
    );
  }
  return (
    <>
      <div className="absolute right-[-12%] top-[-26%] h-[80%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,.4),transparent)]" />
      {flock.map((s, i) => (
        <div key={i} className="sc-drift absolute left-0" style={v({ top: `${s.y}%`, "--d": `${s.d}s`, "--dl": `${s.dl}s` })}>
          <div style={{ rotate: `${s.tilt}deg`, scale: s.flip ? "-1 1" : undefined, opacity: 0.92 }}>
            <Sheep width={s.w} />
          </div>
        </div>
      ))}
      {badges.map((b, i) => (
        <Float key={i} x={`${b.x}%`} y={`${b.y}%`} d={b.d} dl={b.dl}>
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#e0391e] px-1.5 text-[13px] font-bold text-white shadow-[0_6px_16px_rgba(120,20,0,.35)]">{b.n}</span>
        </Float>
      ))}
      <Float x="24px" b={104} d={6}><Bubble text="Mark poked you!" color="#3b5998" /></Float>
      <Float x="88%" y="62%" d={7} dl={3}><Bubble text="Poke back?" color="#3b5998" /></Float>
      <SheepSkyHill />
    </>
  );
}

/* ─────────────────────────── June 2009 ─────────────────────────── */

/**
 * reddit: the photo is desert dunes at dusk; without it, the drawn fallback is the town
 * outside, where upvotes rise out of the lit windows like paper lanterns and
 * the odd downvote sinks.
 */
function Upvotes() {
  const photo = redditArt("wallpaper");
  const ups = useScatter(131, 20, (r) => {
    const far = r();
    return { x: 18 + r() * 80, b: 10 + r() * 12, s: 12 + (1 - far) * 30, o: 0.5 + (1 - far) * 0.5, d: 34 + far * 40, dl: -r() * 70, sway: -60 + r() * 120, r: -8 + r() * 16 };
  });
  const downs = useScatter(132, 3, (r) => ({ x: 30 + r() * 64, s: 12 + r() * 10, d: 26 + r() * 14, dl: -r() * 30, sway: -40 + r() * 80 }));
  const town = useScatter(133, 30, (r, i) => {
    const back = i % 2 === 0;
    const w = back ? 70 + r() * 70 : 50 + r() * 60;
    const x = (i / 30) * 1640 - 30 + r() * 20;
    const h = back ? 120 + r() * 120 : 60 + r() * 90;
    const roof = r();
    const cols = Math.max(2, Math.floor((w - 12) / 16));
    const rows = Math.max(2, Math.floor((h - 20) / 22));
    const lit: { x: number; y: number; c: string }[] = [];
    for (let row = 0; row < rows; row++) {
      for (let c = 0; c < cols; c++) {
        const p = r();
        if (p < (back ? 0.16 : 0.26)) lit.push({ x: x + 8 + c * 16, y: 300 - h + 14 + row * 22, c: p < 0.09 ? "#9fd2ff" : "#ffcf7a" });
      }
    }
    return { back, x, w, h, roof, lit, mast: roof > 0.86 };
  });
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt="" draggable={false} decoding="async" className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[50%_70%]" />
    );
  }
  const block = (b: (typeof town)[number]) => {
    const top = 300 - b.h;
    const peak = b.roof > 0.62 && b.roof <= 0.86 ? `L${b.x + b.w / 2} ${top - 22}` : "";
    return `M${b.x} 300V${top}${peak}L${b.x + b.w} ${top}V300Z`;
  };
  return (
    <>
      <div className="absolute right-[8%] top-[7%] h-[16vmin] w-[16vmin] rounded-full bg-[radial-gradient(circle_at_40%_38%,#f4f8ff_0%,#cee3f8_45%,#9fbfe4_70%,transparent_72%)] opacity-90" />
      <div className="absolute right-[-6%] top-[-14%] h-[60%] w-[46%] rounded-full bg-[radial-gradient(closest-side,rgba(206,227,248,.22),transparent)]" />
      <div className="absolute bottom-[-12%] left-[30%] h-[46%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(255,110,40,.22),transparent)]" />
      <Stars seed={134} n={46} bottom={52} color="#dbe9ff" max={1.8} />
      {ups.map((u, i) => (
        <div key={i} className="sc-ascend absolute" style={v({ left: `${u.x}%`, bottom: `${u.b}%`, "--d": `${u.d}s`, "--dl": `${u.dl}s`, "--x": `${u.sway}px`, "--o": u.o })}>
          <div className="sc-bob" style={v({ "--d": `${4 + (i % 4)}s`, "--r": `${u.r}deg` })}>
            <Lantern size={u.s} />
          </div>
        </div>
      ))}
      {downs.map((d, i) => (
        <div key={i} className="sc-fall absolute top-0" style={v({ left: `${d.x}%`, "--d": `${d.d}s`, "--dl": `${d.dl}s`, "--x": `${d.sway}px`, opacity: 0.55 })}>
          <Lantern size={d.s} down />
        </div>
      ))}
      <svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[34%] w-full" aria-hidden>
        <defs>
          <linearGradient id="rd-sc-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#21406e" />
            <stop offset="1" stopColor="#152a4c" />
          </linearGradient>
          <linearGradient id="rd-sc-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0f1e38" />
            <stop offset="1" stopColor="#070f20" />
          </linearGradient>
        </defs>
        {[true, false].map((back) => (
          <g key={String(back)}>
            {town.filter((b) => b.back === back).map((b, i) => (
              <g key={i}>
                <path d={block(b)} fill={`url(#${back ? "rd-sc-back" : "rd-sc-front"})`} />
                {b.roof > 0.86 && <rect x={b.x + b.w * 0.6} y={300 - b.h - 26} width="16" height="18" rx="3" fill={back ? "#1b355d" : "#0c1930"} />}
                {b.lit.map((w, j) => (
                  <rect key={j} x={w.x} y={w.y} width="7" height="10" rx="1" fill={w.c} opacity={back ? 0.45 : 0.85} />
                ))}
              </g>
            ))}
          </g>
        ))}
        {town.filter((b) => b.mast).map((b, i) => (
          <g key={i}>
            <path d={`M${b.x + b.w * 0.3} ${300 - b.h}v-34`} stroke={b.back ? "#21406e" : "#0f1e38"} strokeWidth="3" />
            <circle className="sc-blink" cx={b.x + b.w * 0.3} cy={300 - b.h - 36} r="3" fill="#ff4500" />
          </g>
        ))}
      </svg>
      <Float x="24px" b={104} d={6}><Bubble text="Edit: thanks for the upvotes!" color="#ff4500" /></Float>
      <Float x="86%" y="58%" d={7} dl={3}><Bubble text="+1" color="#ff4500" /></Float>
      <Float x="70%" y="16%" d={8} dl={2} r={-8}><RedditEnvelope unread className="h-[22px] w-[32px] drop-shadow-[0_0_10px_rgba(255,69,0,.6)]" /></Float>
    </>
  );
}

/* ─────────────────────────── 2014 ─────────────────────────── */

const HASH = ["#6ecadc", "#e9a820", "#e01563", "#3eb991"];

/** Slack: a granite valley wall in alpenglow (the 2014 Mac desktop), else the drawn wave. */
function Workspace() {
  const photo = slackArt("wallpaper");
  if (!photo) return <Wave2014 />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt=""
      draggable={false}
      decoding="async"
      className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[70%_60%]"
    />
  );
}

/** A small white envelope, tumbling in the spray. */
function Envelope({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 17" width={size} aria-hidden>
      <rect x=".8" y=".8" width="22.4" height="15.4" rx="2" fill="#fff" fillOpacity=".9" stroke="#fff" strokeOpacity=".5" />
      <path d="m1.6 1.8 10.4 8 10.4-8" fill="none" stroke="#9b5c95" strokeOpacity=".55" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The 2014 Mac desktop everyone had was Mavericks' giant wave. This is that
 * wave at dusk in Slack's colors, breaking on the right, with a few emails
 * being washed out of the spray and the team colors twinkling as stars.
 */
function Wave2014() {
  const stars = useScatter(81, 18, (r, i) => ({ x: 4 + r() * 92, y: 3 + r() * 38, s: 9 + r() * 15, c: HASH[i % 4], d: 2.4 + r() * 3.2, dl: r() * 5 }));
  const mail = useScatter(82, 9, (r) => ({ x: 56 + r() * 36, y: 22 + r() * 30, r: -40 + r() * 80, s: 12 + r() * 16, d: 6 + r() * 5, dl: r() * 8 }));
  const foam = useScatter(83, 26, (r, i) => {
    const t = i / 25;
    return { x: 1270 - t * 290 + r() * 30, y: 320 + t * t * 210 - 30 + r() * 26, r: 6 + r() * 16, o: 0.25 + r() * 0.5 };
  });
  return (
    <>
      <div className="absolute right-[6%] top-[8%] h-[42vmin] w-[42vmin] rounded-full bg-[radial-gradient(closest-side,rgba(255,196,170,.55),rgba(233,120,140,.18)_55%,transparent)]" />
      {stars.map((h, i) => (
        <span
          key={i}
          className="sc-twinkle absolute font-[family-name:var(--font-lato)] font-black leading-none"
          style={v({ left: `${h.x}%`, top: `${h.y}%`, fontSize: h.s, color: h.c, "--d": `${h.d}s`, "--dl": `${-h.dl}s` })}
        >
          #
        </span>
      ))}
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMaxYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="sl-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5b3a5a" />
            <stop offset="1" stopColor="#1a1020" />
          </linearGradient>
          <linearGradient id="sl-face" x1=".2" y1="1" x2=".75" y2=".25">
            <stop offset="0" stopColor="#22162a" />
            <stop offset=".55" stopColor="#3f6f78" />
            <stop offset=".85" stopColor="#5fb3b0" />
            <stop offset="1" stopColor="#9fe0d8" />
          </linearGradient>
          <linearGradient id="sl-lip" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c8f2ec" />
            <stop offset=".6" stopColor="#6ecadc" />
            <stop offset="1" stopColor="#4c9689" />
          </linearGradient>
          <filter id="sl-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <rect y="760" width="1600" height="240" fill="url(#sl-sea)" />
        <path d="M0 800c180-14 380-10 560 4" stroke="#fff" strokeOpacity=".08" strokeWidth="3" fill="none" />
        {/* The swell, rising from the left into a crest on the right. */}
        <path
          d="M0 1000V846c300-10 600-40 800-124 140-60 220-160 260-252 40-90 120-150 210-150 90 0 150 60 170 120 30 80 90 160 160 200V1000Z"
          fill="url(#sl-face)"
        />
        <path d="M120 900c240-20 460-50 640-120M300 950c260-30 520-80 720-180M900 700c50-40 90-100 120-170" stroke="#fff" strokeOpacity=".09" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* The barrel under the lip, and the lip throwing forward. */}
        <path d="M1000 548c40-62 110-90 172-78-50 52-110 90-172 98Z" fill="#1d1426" opacity=".85" />
        <path d="M1270 320c-90 0-190 40-250 110-30 35-45 70-35 100 15-30 55-60 105-75 60-15 110-35 140-65 25-25 40-50 40-70Z" fill="url(#sl-lip)" />
        <g filter="url(#sl-soft)">
          {foam.map((f, i) => (
            <circle key={i} cx={f.x} cy={f.y} r={f.r} fill="#fff" opacity={f.o} />
          ))}
        </g>
        <path d="M1270 320c-90 0-190 40-250 110-30 35-45 70-35 100" stroke="#fff" strokeOpacity=".75" strokeWidth="5" fill="none" strokeLinecap="round" />
      </svg>
      {mail.map((m, i) => (
        <Float key={i} x={`${m.x}%`} y={`${m.y}%`} r={m.r} d={m.d} dl={m.dl} className="opacity-80">
          <Envelope size={m.s} />
        </Float>
      ))}
    </>
  );
}

/* ─────────────────────────── 1989 ─────────────────────────── */

// The mainframe hall lives with the costume: see MainframeScene in src/components/terminal/scene.tsx.

/* ─────────────────────────── Dec 24 ─────────────────────────── */

const BULBS = ["#ff4d4d", "#ffd23f", "#3ddc84", "#4dabff", "#ff7ad9"];

function Lights() {
  const n = 30;
  return (
    <div className="absolute inset-x-0 top-0 h-10">
      <svg viewBox="0 0 1600 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M0 8 Q200 60 400 10 T800 10 T1200 10 T1600 8" fill="none" stroke="#0b1a12" strokeWidth="3" />
      </svg>
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const seg = (t * 4) % 1;
        const y = 6 + Math.sin(seg * Math.PI) * 30;
        const c = BULBS[i % BULBS.length];
        return (
          <span
            key={i}
            className="sc-blink absolute h-[14px] w-[9px] rounded-b-full rounded-t-[3px]"
            style={v({ left: `${t * 100}%`, top: `${y}%`, background: c, boxShadow: `0 0 14px 3px ${c}`, "--d": `${1.6 + (i % 3) * 0.7}s` })}
          />
        );
      })}
    </div>
  );
}

function Pine({ h, x }: { h: number; x: string }) {
  return (
    <svg viewBox="0 0 40 60" className="absolute bottom-[14%]" style={{ left: x, height: h }} aria-hidden>
      <path d="M20 0 L34 22 H27 L38 40 H28 L40 56 H0 L12 40 H2 L13 22 H6Z" fill="#14402b" />
      <path d="M20 0 L26 9 L20 7 L14 9Z" fill="#eaf4ff" />
      <rect x="17" y="56" width="6" height="4" fill="#3b2414" />
    </svg>
  );
}

/**
 * The North Pole at night: aurora, string lights, snowy hills and the
 * workshop's lit window. The picture once it's in (see
 * src/components/elf/ART.md), else drawn; the snow falls over either.
 */
function NorthPole() {
  const photo = elfArt("wallpaper");
  const flakes = useScatter(91, 46, (r) => ({ x: r() * 100, s: 2 + r() * 4, d: 9 + r() * 10, dl: -r() * 20, dx: (r() - 0.5) * 80 }));
  const snow = flakes.map((f, i) => (
    <span
      key={i}
      className="sc-fall absolute top-0 rounded-full bg-white"
      style={v({ left: `${f.x}%`, width: f.s, height: f.s, opacity: 0.85, "--d": `${f.d}s`, "--dl": `${f.dl}s`, "--x": `${f.dx}px` })}
    />
  ));
  if (photo) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" draggable={false} decoding="async" className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[60%_62%]" />
        {/* The snowfield is bright; a little dusk in the lower left keeps the agent list readable. */}
        <div className="absolute inset-0 bg-[radial-gradient(70%_75%_at_0%_100%,rgba(7,16,38,.62),rgba(7,16,38,.25)_55%,transparent_80%)]" />
        {snow}
      </>
    );
  }
  return (
    <>
      <div className="sc-aurora absolute left-[-10%] top-[6%] h-[32%] w-[120%] bg-[linear-gradient(90deg,transparent,rgba(80,230,170,.42),rgba(110,160,255,.38),transparent)] blur-[40px]" />
      <div className="sc-aurora absolute left-[-10%] top-[16%] h-[18%] w-[120%] bg-[linear-gradient(90deg,transparent,rgba(170,120,255,.3),rgba(80,230,170,.32),transparent)] blur-[30px]" style={v({ "--d": "16s", "--dl": "-5s" })} />
      <Stars seed={92} n={60} bottom={55} max={1.8} />
      <Lights />
      <svg viewBox="0 0 1600 400" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[34%] w-full" aria-hidden>
        <path d="M0 170 C300 90 600 120 900 160 C1150 190 1400 110 1600 120 V400 H0Z" fill="#5f7fae" />
        <path d="M0 280 C320 210 680 220 980 260 C1240 292 1450 250 1600 240 V400 H0Z" fill="#8ea9cf" />
      </svg>
      <span className="sc-under"><Pine x="3%" h={90} /><Pine x="8%" h={64} /><Pine x="18%" h={78} /></span><Pine x="90%" h={96} /><Pine x="95%" h={70} />
      <div className="sc-under absolute bottom-[15%] left-[150px] h-[52px] w-[64px]">
        <div className="absolute inset-x-0 bottom-0 h-[34px] bg-[#7a3b22]" />
        <div className="absolute -inset-x-2 bottom-[30px] h-0 border-x-[40px] border-b-[26px] border-x-transparent border-b-[#f4f9ff]" />
        <div className="absolute bottom-[8px] left-[22px] h-[14px] w-[16px] bg-[#ffcf6b] shadow-[0_0_18px_6px_rgba(255,190,90,.6)]" />
      </div>
      {snow}
    </>
  );
}

/* ─────────────────────────── 2199 ─────────────────────────── */

/**
 * The city after the Handover: a violet sky, an eye where the moon used to
 * be, searchlights and glyphs drifting up. Lives with the Lattice's art in
 * src/components/machine/art.tsx.
 */
function Machine() {
  return <MachineScene />;
}

/* ─────────────────────────── Meet the gptys ─────────────────────────── */

function Pastel() {
  return (
    <>
      <div className="absolute left-[-10%] top-[-20%] h-[70%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,.75),transparent)]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[70%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(255,214,231,.7),transparent)]" />
      <Stars seed={111} n={30} color="#b9a7e6" bottom={90} max={2} />
      <DriftingClouds seed={112} n={5} top={8} bottom={80} min={140} max={240} color="#ffffff" speed={0.7} />
    </>
  );
}

/* ─────────────────────────── Registry ─────────────────────────── */

export const SCENES: Record<string, { bg: string; tone: Tone; draw: () => ReactNode }> = {
  caveman: { tone: "dark", bg: "linear-gradient(180deg, #160910 0%, #2c0f1a 24%, #561a22 44%, #9a3528 58%, #d2602e 68%, #ee9145 75%, #c4572b 84%, #2a0e0b 100%)", draw: () => <Cave /> },
  seance: { tone: "dark", bg: "radial-gradient(ellipse 80% 70% at 55% 38%, #26221E 0%, #1A1613 48%, #0D0B0A 100%)", draw: () => <Parlor /> },
  bbs: { tone: "dark", bg: "linear-gradient(180deg, #05061a 0%, #0f0b33 50%, #2b0d48 74%, #05061a 100%)", draw: () => <Midnight /> },
  irc: { tone: "dark", bg: "linear-gradient(170deg, #050c2a 0%, #0c1f55 52%, #1f4383 100%)", draw: () => <Night1999 /> },
  icq: { tone: "dark", bg: "linear-gradient(180deg, #1683e3 0%, #2fa0ef 40%, #63c3f2 58%, #5bbf35 62%, #3e9a20 100%)", draw: () => <Win98 /> },
  msn: { tone: "dark", bg: "linear-gradient(180deg, #2f6fe0 0%, #4f8fe8 40%, #8cc0f2 70%, #6cc03a 78%, #4fa524 100%)", draw: () => <Bliss /> },
  skype: { tone: "light", bg: "linear-gradient(160deg, #eaf7ff 0%, #74c6f2 26%, #4aa6ea 58%, #56c2e8 82%, #79e6c8 100%)", draw: () => <Sky2007 /> },
  facebook: { tone: "dark", bg: "linear-gradient(160deg, #2a2f7e 0%, #2e3a92 45%, #4a62c4 75%, #6a4ec0 100%)", draw: () => <Pasture /> },
  reddit: { tone: "dark", bg: "linear-gradient(180deg, #5e4a6e 0%, #86687a 38%, #b47c72 66%, #b06a3c 80%, #7e4422 100%)", draw: () => <Upvotes /> },
  slack: { tone: "dark", bg: "linear-gradient(180deg, #a294cc 0%, #c6a0c6 38%, #eeae88 64%, #6c6488 78%, #252a35 100%)", draw: () => <Workspace /> },
  terminal: { tone: "dark", bg: "#080a0f", draw: () => <MainframeScene /> },
  elf: { tone: "dark", bg: "linear-gradient(180deg, #071029 0%, #0f2356 55%, #1d3d7c 78%)", draw: () => <NorthPole /> },
  machine: { tone: "dark", bg: "linear-gradient(180deg, #030008 0%, #0b0220 34%, #1c0640 62%, #3a0b5c 80%, #12032a 100%)", draw: () => <Machine /> },
  /** The Token Palace floor at 3 a.m.: lives with Lucky's art in src/components/slots/art.tsx. */
  slots: { tone: "dark", bg: "linear-gradient(180deg, #0c0208 0%, #1f0512 38%, #3b0a1c 66%, #22050f 84%, #12030a 100%)", draw: () => <SlotsScene /> },
  /** Not an agent: the backdrop for the Meet the gptys page. */
  meet: { tone: "light", bg: "linear-gradient(160deg, #e8e1f7 0%, #efe6f6 45%, #f8e8ef 100%)", draw: () => <Pastel /> },
};

export const toneOf = (id: string): Tone => SCENES[id]?.tone ?? "dark";

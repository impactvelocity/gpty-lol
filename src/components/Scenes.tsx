"use client";

import { type CSSProperties, type ReactNode, useMemo } from "react";
import { art as fbArt, Sheep, SheepSkyHill } from "./facebook/art";
import { art as skypeArt } from "./skype/art";

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

function Cave() {
  const embers = useScatter(11, 16, (r) => ({ x: 2 + r() * 18, d: 4 + r() * 4, dl: -r() * 8, s: 2 + r() * 3, dx: (r() - 0.5) * 80 }));
  return (
    <>
      <div className="sc-flicker absolute bottom-[-24%] left-[150px] h-[70%] w-[min(90vw,1100px)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,140,40,.42),rgba(255,110,30,.12)_55%,transparent)]" />
      <div className="sc-under absolute bottom-[64px] left-[96px] rotate-[-4deg] opacity-50"><Mammoth /></div>
      <div className="absolute left-[23%] top-[14%] opacity-40"><Hand size={48} rotate={-18} /></div>
      <div className="absolute right-[3%] top-[12%] flex gap-3 opacity-40"><Hand rotate={-12} /><Hand size={44} rotate={14} /></div>
      <div className="absolute right-[2%] top-[44%] flex gap-1 opacity-45"><Hunter flip /><Hunter flip /></div>
      {embers.map((e, i) => (
        <span
          key={i}
          className="sc-rise absolute rounded-full bg-[#ffb35c]"
          style={v({ left: `${e.x}%`, bottom: "8%", width: e.s, height: e.s, "--d": `${e.d}s`, "--dl": `${e.dl}s`, "--x": `${e.dx}px`, boxShadow: "0 0 8px #ff8a2a" })}
        />
      ))}
      <Layer top h={120} d={edge(3, { h: 120, base: 18, amp: 90, step: 46, sharp: true, top: true })} fill="#0d0805" height="110px" />
      <Layer d={edge(5, { h: 300, base: 210, amp: 70, step: 120, sharp: true })} fill="#1d130c" height="26%" />
      <Layer d={edge(6, { h: 300, base: 250, amp: 50, step: 90, sharp: true })} fill="#0e0905" height="18%" />
    </>
  );
}

/* ─────────────────────────── 1888 ─────────────────────────── */

const GOLD = "#d9a441";

function Sun() {
  return (
    <svg viewBox="0 0 100 100" width="84" aria-hidden>
      <g stroke={GOLD} strokeWidth="1.6" fill="none" strokeLinecap="round">
        <circle cx="50" cy="50" r="20" />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const r1 = 27, r2 = i % 2 ? 36 : 44;
          return <line key={i} x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1} x2={50 + Math.cos(a) * r2} y2={50 + Math.sin(a) * r2} />;
        })}
        <path d="M42 46 q3 -3 6 0 M52 46 q3 -3 6 0 M43 57 q7 6 14 0" />
      </g>
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 100 100" width="72" aria-hidden>
      <path d="M62 14 A38 38 0 1 0 86 74 A30 30 0 1 1 62 14 Z" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <circle cx="44" cy="52" r="1.6" fill={GOLD} />
    </svg>
  );
}

function Candles({ heights, flip = false }: { heights: number[]; flip?: boolean }) {
  return (
    <div className={`absolute bottom-0 flex items-end gap-3 ${flip ? "right-[3%] flex-row-reverse" : "sc-under left-[176px]"}`}>
      <div className="sc-flicker pointer-events-none absolute -inset-x-16 -top-24 bottom-0 rounded-full bg-[radial-gradient(closest-side,rgba(255,176,46,.22),transparent)]" />
      {heights.map((h, i) => (
        <div key={i} className="relative flex flex-col items-center">
          <span className="flame mb-0.5" style={{ animationDelay: `${-i * 0.6}s` }} />
          <span className="block w-px bg-[#2a1a10]" style={{ height: 5 }} />
          <span className="block w-4 rounded-t-[3px] bg-gradient-to-r from-[#e9dcc0] via-[#fbf3e1] to-[#cdbd9c]" style={{ height: h }} />
        </div>
      ))}
    </div>
  );
}

function LetterRing() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ✦ 1234567890 ✦ ";
  return (
    <svg viewBox="0 0 400 400" className="sc-spin absolute -bottom-[76vh] left-[150px] w-[110vh] -translate-x-1/2 opacity-[.16]" style={v({ "--d": "240s" })} aria-hidden>
      <defs>
        <path id="sc-ring" d="M200 200 m-170 0 a170 170 0 1 1 340 0 a170 170 0 1 1 -340 0" />
      </defs>
      <circle cx="200" cy="200" r="186" fill="none" stroke={GOLD} strokeWidth="0.8" />
      <circle cx="200" cy="200" r="150" fill="none" stroke={GOLD} strokeWidth="0.8" />
      <text fill={GOLD} fontFamily="Georgia, serif" fontSize="19" letterSpacing="9">
        <textPath href="#sc-ring">{letters}</textPath>
      </text>
    </svg>
  );
}

function Parlor() {
  const wisps = useScatter(21, 5, (r) => ({ x: 24 + r() * 72, d: 10 + r() * 8, dl: -r() * 18 }));
  return (
    <>
      <Stars seed={7} n={40} color={GOLD} bottom={70} max={1.6} />
      <LetterRing />
      <div className="absolute left-[23%] top-[7%] flex flex-col items-center gap-2 opacity-80">
        <Sun />
        <span className="font-serif text-[13px] tracking-[.5em] text-[#d9a441]">YES</span>
      </div>
      <div className="sc-under absolute bottom-[72px] left-[48px] opacity-80">
        <Moon />
      </div>
      {wisps.map((w, i) => (
        <svg key={i} viewBox="0 0 40 200" width="40" className="sc-rise absolute bottom-[10%]" style={v({ left: `${w.x}%`, "--d": `${w.d}s`, "--dl": `${w.dl}s`, "--x": "30px" })} aria-hidden>
          <path d="M20 200 C0 160 40 130 20 100 C0 70 40 40 20 0" fill="none" stroke="rgba(255,240,220,.14)" strokeWidth="2" />
        </svg>
      ))}
      <Candles heights={[88, 128, 64]} />
      <Candles heights={[72, 112, 96]} flip />
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

function Midnight() {
  return (
    <>
      <Stars seed={9} n={70} square color="#cfe8ff" bottom={55} max={2} />
      <div
        className="sc-under absolute bottom-[4%] left-[150px] aspect-square w-[220px] -translate-x-1/2 rounded-full max-md:left-1/2 max-md:w-[70vw]"
        style={{
          background: "linear-gradient(180deg, #ffff55 0%, #ffb03a 38%, #ff55ff 78%)",
          maskImage: "linear-gradient(180deg, #000 52%, transparent 52% 55%, #000 55% 62%, transparent 62% 66%, #000 66% 72%, transparent 72% 77%, #000 77% 82%, transparent 82% 88%, #000 88%)",
          boxShadow: "0 0 120px rgba(255,85,255,.35)",
          opacity: 0.85,
        }}
      />
      <Skyline />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,.28)_0_1px,transparent_1px_3px)]" />
    </>
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

function Desktop2000() {
  const tags = useScatter(41, CHANNELS.length, (r, i) => ({ t: CHANNELS[i], ...spot(r), d: 6 + r() * 5, dl: r() * 8 }));
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.07)_1px,transparent_1.5px)] [background-size:22px_22px]" />
      <Float x="24px" b={68} r={-4} d={9}><MiniWindow w={190} title="#help - nick" /></Float>
      <Float x="150px" b={160} d={7} dl={2}>
        <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-[Tahoma,Arial,sans-serif] text-[13px] font-bold text-white/80 backdrop-blur-sm">#y2k</span>
      </Float>
      <Float x="88%" y="10%" r={3} d={11} dl={3}><MiniWindow w={150} title="Winamp 2.5" /></Float>
      <Float x="23%" y="44%" r={-2} d={10} dl={5}><MiniWindow w={140} title="Notepad" /></Float>
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

function Win98() {
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

/** MSN: a photo of the hill (see src/components/msn/ART.md), drifting in very slowly. */
function Bliss() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/msn/wallpaper.webp"
      alt=""
      draggable={false}
      decoding="async"
      className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[50%_62%]"
    />
  );
}

/* ─────────────────────────── 2007 ─────────────────────────── */

/** Skype: the cloudscape photo once it's in (see src/components/skype/ART.md), else the drawn clouds. */
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
 * Facebook: a sky full of thrown sheep, drifting like clouds over a pasture.
 * The photo once it's in (see src/components/facebook/ART.md), else drawn.
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

/* ─────────────────────────── 2014 ─────────────────────────── */

const HASH = ["#6ecadc", "#e9a820", "#e01563", "#3eb991"];
const REACTIONS = ["🎉 3", "👀 2", "👍 12", "🙌 5", "🔥 4", "✅ 1"];

function Workspace() {
  const hashes = useScatter(81, 11, (r, i) => ({ ...spot(r), s: 48 + r() * 120, c: HASH[i % 4], rot: -20 + r() * 40, d: 7 + r() * 5, dl: r() * 8 }));
  const pills = useScatter(82, REACTIONS.length, (r, i) => ({ t: REACTIONS[i], ...spot(r), d: 6 + r() * 4, dl: r() * 8 }));
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,255,255,.08),transparent_60%)]" />
      <Float x="20px" b={60} r={-12} d={8}>
        <span className="block font-[family-name:var(--font-lato)] text-[120px] font-black leading-none text-[#e9a820] opacity-70">#</span>
      </Float>
      <Float x="150px" b={120} d={6} dl={2}>
        <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-[family-name:var(--font-lato)] text-[14px] font-bold text-white/85 backdrop-blur-sm">🎉 7</span>
      </Float>
      {hashes.map((h, i) => (
        <Float key={i} x={`${h.x}%`} y={`${h.y}%`} r={h.rot} d={h.d} dl={h.dl}>
          <span className="block font-[family-name:var(--font-lato)] font-black leading-none" style={{ fontSize: h.s, color: h.c, opacity: 0.55 }}>#</span>
        </Float>
      ))}
      {pills.map((p, i) => (
        <Float key={i} x={`${p.x}%`} y={`${p.y}%`} d={p.d} dl={p.dl}>
          <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-[family-name:var(--font-lato)] text-[14px] font-bold text-white/85 backdrop-blur-sm">{p.t}</span>
        </Float>
      ))}
    </>
  );
}

/* ─────────────────────────── 2015 ─────────────────────────── */

function ChatBubble({ w, typing = false, mine = false }: { w: number; typing?: boolean; mine?: boolean }) {
  return (
    <div
      className={`flex h-11 items-center gap-1.5 rounded-[22px] px-4 shadow-[0_10px_30px_rgba(0,40,120,.25)] ${mine ? "rounded-br-md bg-white/90" : "rounded-bl-md bg-white/25 backdrop-blur-sm"}`}
      style={{ width: w }}
    >
      {typing ? (
        [0, 1, 2].map((i) => <span key={i} className="dot h-2 w-2 rounded-full bg-[#0084ff]" style={{ animationDelay: `${i * 0.15}s` }} />)
      ) : (
        <span className={`h-2 flex-1 rounded-full ${mine ? "bg-[#0084ff]/30" : "bg-white/60"}`} />
      )}
    </div>
  );
}

function Chats2015() {
  return (
    <>
      <div className="absolute right-[-10%] top-[-20%] h-[80%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,.28),transparent)]" />
      <Float x="24px" b={124} d={6}><ChatBubble w={150} /></Float>
      <Float x="60px" b={68} d={6.5} dl={1}><ChatBubble w={84} typing /></Float>
      <Float x="87%" y="10%" d={7} dl={2}><ChatBubble w={150} mine /></Float>
      <Float x="89%" y="19%" d={7.5} dl={3}><ChatBubble w={110} /></Float>
      <Float x="88%" y="58%" d={8} dl={4} r={-10}><span className="block text-[110px] leading-none drop-shadow-[0_14px_30px_rgba(0,40,120,.35)]">👍</span></Float>
      <Float x="200px" b={120} d={5} dl={2} r={8}><span className="block text-[40px] leading-none">❤️</span></Float>
      <Float x="25%" y="70%" d={5.5}><span className="block text-[36px] leading-none">😂</span></Float>
    </>
  );
}

/* ─────────────────────────── Now ─────────────────────────── */

function Sonoma() {
  return (
    <>
      <div className="sc-blob absolute left-[-10%] top-[-10%] h-[60vh] w-[60vh] rounded-full bg-[#5b3fd6] opacity-60 blur-[90px]" style={v({ "--d": "26s" })} />
      <div className="sc-blob absolute bottom-[-20%] right-[-10%] h-[70vh] w-[70vh] rounded-full bg-[#0f8f9c] opacity-50 blur-[100px]" style={v({ "--d": "32s", "--dl": "-8s" })} />
      <div className="sc-blob absolute left-[30%] top-[40%] h-[40vh] w-[40vh] rounded-full bg-[#7aa2f7] opacity-30 blur-[90px]" style={v({ "--d": "22s", "--dl": "-4s" })} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]" />
      <div className="sc-under absolute bottom-[72px] left-[28px] font-[family-name:var(--font-jetbrains)] text-[13px] leading-6 text-white/25">
        <div><span className="text-[#7aa2f7]/60">❯</span> whoami</div>
        <div>shelly</div>
        <div><span className="text-[#7aa2f7]/60">❯</span> <span className="blink">▍</span></div>
      </div>
    </>
  );
}

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

function NorthPole() {
  const flakes = useScatter(91, 46, (r) => ({ x: r() * 100, s: 2 + r() * 4, d: 9 + r() * 10, dl: -r() * 20, dx: (r() - 0.5) * 80 }));
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
      {flakes.map((f, i) => (
        <span
          key={i}
          className="sc-fall absolute top-0 rounded-full bg-white"
          style={v({ left: `${f.x}%`, width: f.s, height: f.s, opacity: 0.85, "--d": `${f.d}s`, "--dl": `${f.dl}s`, "--x": `${f.dx}px` })}
        />
      ))}
    </>
  );
}

/* ─────────────────────────── 2199 ─────────────────────────── */

const GLYPHS = "01アイウエオカキクケコサシスセソ0110ナニヌネノ10";

function Machine() {
  const cols = useScatter(101, 22, (r) => ({
    x: r() * 100, d: 10 + r() * 14, dl: -r() * 24, o: 0.12 + r() * 0.25,
    text: Array.from({ length: 18 }, () => GLYPHS[Math.floor(r() * GLYPHS.length)]).join(""),
  }));
  return (
    <>
      <div className="absolute inset-x-0 top-[48%] h-[30%] bg-[radial-gradient(ellipse_at_center,rgba(0,230,83,.28),transparent_70%)]" />
      {cols.map((c, i) => (
        <span
          key={i}
          className="sc-fall absolute top-0 font-[family-name:var(--font-jetbrains)] text-[14px] leading-[18px] text-[#00e653] [writing-mode:vertical-rl]"
          style={v({ left: `${c.x}%`, opacity: c.o, "--d": `${c.d}s`, "--dl": `${c.dl}s`, "--x": "0px" })}
        >
          {c.text}
        </span>
      ))}
      <div className="absolute inset-x-0 bottom-0 h-[42%] overflow-hidden [perspective:420px]">
        <div
          className="sc-grid absolute -inset-x-1/2 bottom-0 h-[180%] origin-bottom [transform:rotateX(62deg)]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,230,83,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,83,.55) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to top, #000 30%, transparent 95%)",
          }}
        />
      </div>
    </>
  );
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
  caveman: { tone: "dark", bg: "linear-gradient(175deg, #2a1b11 0%, #1a110b 60%, #120b07 100%)", draw: () => <Cave /> },
  seance: { tone: "dark", bg: "radial-gradient(ellipse 85% 65% at 50% 30%, #34183a 0%, #1b0c1e 55%, #0c060d 100%)", draw: () => <Parlor /> },
  bbs: { tone: "dark", bg: "linear-gradient(180deg, #05061a 0%, #0f0b33 50%, #2b0d48 74%, #05061a 100%)", draw: () => <Midnight /> },
  irc: { tone: "dark", bg: "linear-gradient(160deg, #123a72 0%, #24589a 50%, #3a6ea5 100%)", draw: () => <Desktop2000 /> },
  icq: { tone: "dark", bg: "radial-gradient(ellipse 90% 80% at 50% 30%, #13a9a3 0%, #008080 55%, #005a5a 100%)", draw: () => <Win98 /> },
  msn: { tone: "dark", bg: "linear-gradient(180deg, #1b5ccc 0%, #3580e3 34%, #75b0f1 62%, #c2e2fc 80%)", draw: () => <Bliss /> },
  skype: { tone: "light", bg: "linear-gradient(180deg, #6cc6f3 0%, #a9def8 45%, #e6f6fe 100%)", draw: () => <Sky2007 /> },
  facebook: { tone: "dark", bg: "linear-gradient(180deg, #23407e 0%, #3b5998 34%, #7b96cc 66%, #c3d2ee 100%)", draw: () => <Pasture /> },
  slack: { tone: "dark", bg: "radial-gradient(ellipse 90% 80% at 30% 0%, #5a3e58 0%, #3a2839 50%, #221625 100%)", draw: () => <Workspace /> },
  messenger: { tone: "dark", bg: "linear-gradient(155deg, #0050d8 0%, #0084ff 50%, #3cb4ff 100%)", draw: () => <Chats2015 /> },
  terminal: { tone: "dark", bg: "#0a0c16", draw: () => <Sonoma /> },
  elf: { tone: "dark", bg: "linear-gradient(180deg, #071029 0%, #0f2356 55%, #1d3d7c 78%)", draw: () => <NorthPole /> },
  machine: { tone: "dark", bg: "#010403", draw: () => <Machine /> },
  /** Not an agent: the backdrop for the Meet the gptys page. */
  meet: { tone: "light", bg: "linear-gradient(160deg, #e8e1f7 0%, #efe6f6 45%, #f8e8ef 100%)", draw: () => <Pastel /> },
};

export const toneOf = (id: string): Tone => SCENES[id]?.tone ?? "dark";

"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { hash, rng, type Sym } from "./engine";
import { slFonts } from "./font";
import "./slots.css";

/**
 * Art for the Token Palace, where it's always 3 a.m.: the casino floor behind
 * the site (rows of glowing machines, a carpet only a casino would choose,
 * neon, tokens drifting down like snow), and the "image" card Lucky prints
 * when you ask for a picture. Cherry-red lacquer, gold chrome, hot pink and
 * cyan neon on a dark wine floor.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* ───────── Optional bitmap art ───────── */

export type ArtSlot = "wallpaper" | "velvet" | "token" | "cup" | `sym-${Sym}`;

/**
 * Generated pictures that replace the drawn fallbacks (prompts and sizes in
 * src/components/slots/ART.md). Add a line once a picture is in public/slots/;
 * remove it to fall back to the drawing.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/slots/wallpaper.webp",
  velvet: "/slots/velvet.webp",
  token: "/slots/token.webp",
  cup: "/slots/cup.webp",
  "sym-text": "/slots/sym-text.webp",
  "sym-email": "/slots/sym-email.webp",
  "sym-image": "/slots/sym-image.webp",
  "sym-code": "/slots/sym-code.webp",
  "sym-deck": "/slots/sym-deck.webp",
  "sym-chart": "/slots/sym-chart.webp",
  "sym-poem": "/slots/sym-poem.webp",
  "sym-bug": "/slots/sym-bug.webp",
  "sym-agi": "/slots/sym-agi.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

function useSeeded<T>(seed: string, n: number, make: (r: () => number, i: number) => T) {
  return useMemo(
    () => {
      const r = rng(hash(seed));
      return Array.from({ length: n }, (_, i) => make(r, i));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, n],
  );
}

/* ───────── The token ───────── */

/** A Token Palace token: gold, milled edge, a 7 in the middle. */
export function Token({ size = 22, className = "", style }: { size?: number; className?: string; style?: CSSProperties }) {
  const src = art("token");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} className={`lk-token ${className}`} style={style} draggable={false} />;
  }
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={`lk-token ${className}`} style={style} aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#b8790f" />
      <circle cx="16" cy="16" r="15" fill="none" stroke="#ffe08a" strokeWidth="2" strokeDasharray="1.6 1.6" />
      <circle cx="16" cy="16" r="11.5" fill="#ffc533" stroke="#8a5a0c" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="9" fill="none" stroke="#fff0b3" strokeWidth=".8" opacity=".7" />
      <path d="M11.5 10.5h9l-5 11.5" fill="none" stroke="#8a2a0c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="11.5" cy="9.5" rx="3.5" ry="1.8" fill="#fff" opacity=".45" transform="rotate(-35 11.5 9.5)" />
    </svg>
  );
}

/* ───────── The image card ───────── */

/** What always goes a little wrong in Lucky's pictures. */
const FLAWS = [
  "✋ 6 fingers detected",
  "✋ 7 fingers detected",
  "sign reads “OPNE”",
  "two left feet",
  "one extra moon",
  "cat has five legs",
  "teeth: too many",
  "clock melted (unrequested)",
];

/**
 * The pictures Lucky "generates": each one gorgeous, and each with exactly one
 * thing wrong (prompts in ART.md). A pull's seed picks one; the caption under
 * it names the flaw. Empty the list to fall back to the drawn picture below.
 */
const GEN: { src: string; flaw: string }[] = [
  { src: "/slots/gen/gen-01-cat.webp", flaw: "helmet: fishbowl (occupied)" },
  { src: "/slots/gen/gen-02-handshake.webp", flaw: "✋ 3 hands, 1 deal" },
  { src: "/slots/gen/gen-03-sunset.webp", flaw: "one extra sun" },
  { src: "/slots/gen/gen-04-dog.webp", flaw: "teeth: too many, too human" },
  { src: "/slots/gen/gen-05-pizza.webp", flaw: "1 slice: fruit" },
  { src: "/slots/gen/gen-06-lake.webp", flaw: "reflection: different mountain" },
  { src: "/slots/gen/gen-07-team.webp", flaw: "👍 thumbs: 11, people: 5" },
  { src: "/slots/gen/gen-08-castle.webp", flaw: "door: 2nd floor, no stairs" },
  { src: "/slots/gen/gen-09-clock.webp", flaw: "clock: 13 o’clock" },
  { src: "/slots/gen/gen-10-horse.webp", flaw: "legs: 5 (galloping)" },
  { src: "/slots/gen/gen-11-library.webp", flaw: "every book: “Boook”" },
  { src: "/slots/gen/gen-12-robot-chef.webp", flaw: "pancake: 33⅓ rpm" },
];

const PALETTES = [
  ["#3b2bff", "#ff5fa2", "#ffc46b", "#1f9d6b", "#0c5c4a"],
  ["#0b2a6b", "#3fa9ff", "#bff3ff", "#f2f2f2", "#7d8fb3"],
  ["#2a0845", "#ff3d8b", "#ff9a3d", "#ffd35c", "#6a1b5a"],
  ["#06343b", "#19c3a5", "#f6f1a5", "#e8573d", "#0d6b5c"],
  ["#1d0b3a", "#8f5cff", "#ffd1f2", "#5ce1ff", "#3a1d7a"],
];

/**
 * "Your image": a picture painted from the prompt's seed (a sky, a sun, hills
 * and a subject with eyes, because everything in these is a bit alive), that
 * denoises in from static the first time it prints. Never quite what you
 * asked for. Always one flaw.
 */
export function GenImage({ prompt, seed, fresh }: { prompt: string; seed: string; fresh: boolean }) {
  const s = useMemo(() => {
    const r = rng(hash(`${seed}:${prompt}`));
    const pal = PALETTES[Math.floor(r() * PALETTES.length)];
    const wave = (base: number, amp: number) => {
      let d = `M0 ${base}`;
      for (let x = 0; x <= 400; x += 50) d += ` Q${x + 25} ${base - amp + r() * amp * 2} ${x + 50} ${base + (r() - 0.5) * amp}`;
      return `${d} V300 H0Z`;
    };
    const blob = Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      const rr = 46 + r() * 16;
      return [200 + Math.cos(a) * rr, 168 + Math.sin(a) * rr * 0.9] as const;
    });
    const path = blob
      .map(([x, y], i) => {
        const [nx, ny] = blob[(i + 1) % blob.length];
        return `${i ? "" : `M${((x + nx) / 2).toFixed(1)} ${((y + ny) / 2).toFixed(1)}`} Q${nx.toFixed(1)} ${ny.toFixed(1)} ${((nx + blob[(i + 2) % blob.length][0]) / 2).toFixed(1)} ${((ny + blob[(i + 2) % blob.length][1]) / 2).toFixed(1)}`;
      })
      .join(" ");
    return {
      pal,
      sun: { x: 60 + r() * 280, y: 50 + r() * 50, r: 22 + r() * 22 },
      far: wave(190, 26),
      near: wave(236, 20),
      subject: `${path} Z`,
      flaw: FLAWS[Math.floor(r() * FLAWS.length)],
      n: Math.floor(r() * 9_000_000_000) + 1_000_000_000,
      stars: Array.from({ length: 14 }, () => ({ x: r() * 400, y: r() * 120, s: 0.6 + r() * 1.6 })),
    };
  }, [prompt, seed]);

  const STEPS = 30;
  const [step, setStep] = useState(fresh ? 1 : STEPS);
  useEffect(() => {
    if (!fresh || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setStep((n) => (n >= STEPS ? n : n + 1)), 85);
    return () => clearInterval(t);
  }, [fresh]);
  const done = step >= STEPS;
  const u = `gi${hash(seed + prompt).toString(36)}`;
  /** A generated picture from the pool, if there is one. */
  const pic = GEN.length ? GEN[hash(`${seed}:${prompt}`) % GEN.length] : null;

  return (
    <figure className="lk-img" data-fresh={fresh && !done ? "" : undefined} style={{ "--k": 1 - step / STEPS } as Vars}>
      <div className="lk-img-frame">
        {pic ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pic.src} alt="" className="lk-img-art" draggable={false} />
            {!done && (
              <svg viewBox="0 0 400 300" className="lk-img-static" preserveAspectRatio="none" aria-hidden>
                <filter id={`${u}n`}>
                  <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" />
                  <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.4 -.2" />
                </filter>
                <rect width="400" height="300" filter={`url(#${u}n)`} className="lk-img-noise" />
              </svg>
            )}
          </>
        ) : (
          <svg viewBox="0 0 400 300" className="lk-img-art" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <defs>
              <linearGradient id={`${u}sky`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={s.pal[0]} />
                <stop offset=".6" stopColor={s.pal[1]} />
                <stop offset="1" stopColor={s.pal[2]} />
              </linearGradient>
              <radialGradient id={`${u}sun`}>
                <stop offset="0" stopColor="#fff" />
                <stop offset=".5" stopColor={s.pal[2]} />
                <stop offset="1" stopColor={s.pal[2]} stopOpacity="0" />
              </radialGradient>
              <filter id={`${u}n`}>
                <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" />
                <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.4 -.2" />
              </filter>
            </defs>
            <rect width="400" height="300" fill={`url(#${u}sky)`} />
            {s.stars.map((st, i) => (
              <circle key={i} cx={st.x} cy={st.y} r={st.s} fill="#fff" opacity=".7" />
            ))}
            <circle cx={s.sun.x} cy={s.sun.y} r={s.sun.r * 2.2} fill={`url(#${u}sun)`} />
            <circle cx={s.sun.x} cy={s.sun.y} r={s.sun.r} fill="#fff8dc" />
            <path d={s.far} fill={s.pal[4]} opacity=".85" />
            <path d={s.near} fill={s.pal[3]} />
            <path d={s.subject} fill={s.pal[1]} stroke="rgba(0,0,0,.35)" strokeWidth="3" />
            <ellipse cx="184" cy="160" rx="6" ry="8.5" fill="#1a0610" />
            <ellipse cx="216" cy="160" rx="6" ry="8.5" fill="#1a0610" />
            <circle cx="186" cy="157" r="2" fill="#fff" />
            <circle cx="218" cy="157" r="2" fill="#fff" />
            {/* An extra hand, waving. Count the fingers. */}
            <g transform="translate(318 214) rotate(-12)" fill={s.pal[2]} stroke="rgba(0,0,0,.35)" strokeWidth="2">
              <rect x="-15" y="0" width="30" height="34" rx="12" />
              {[-13, -7.5, -2, 3.5, 9, 14].map((x, i) => (
                <rect key={i} x={x - 2.6} y={-18 + Math.abs(x) * 0.4} width="5.2" height="24" rx="2.6" />
              ))}
            </g>
            {!done && <rect width="400" height="300" filter={`url(#${u}n)`} className="lk-img-noise" />}
          </svg>
        )}
        <span className="lk-img-step" aria-hidden>
          {done ? (pic ? "1536 × 1024" : "1024 × 1024") : `denoising ${step}/${STEPS}`}
        </span>
      </div>
      <figcaption className="lk-img-cap">
        <span className="lk-img-prompt">“{prompt}”</span>
        <span className="lk-img-meta">
          <span className="lk-img-flaw">{pic?.flaw ?? s.flaw}</span>
          <span>seed {s.n}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/* ───────── The casino floor (the site backdrop) ───────── */

const NEON = ["#ff3d8b", "#35f0ff", "#ffc533", "#3dff8f", "#b06bff"];

/** A row of slot machines along the floor, screens flickering, marquee bulbs lit. */
function Row({ seed, y, h, n, dim }: { seed: string; y: number; h: number; n: number; dim: number }) {
  const ms = useSeeded(seed, n, (r, i) => ({
    x: (i / n) * 1600 + r() * 10,
    c: NEON[Math.floor(r() * NEON.length)],
    s: NEON[Math.floor(r() * NEON.length)],
    d: 1.4 + r() * 3,
    dl: -r() * 4,
    lever: r() < 0.7,
  }));
  const w = (1600 / n) * 0.78;
  return (
    <svg viewBox="0 0 1600 400" preserveAspectRatio="none" className="lk-sc-row" style={{ bottom: `${y}%`, height: `${h}%`, opacity: dim }} aria-hidden>
      {ms.map((m, i) => (
        <g key={i} transform={`translate(${m.x} 0)`}>
          <rect x="0" y="70" width={w} height="330" rx="14" fill="#1b0610" />
          <rect x="0" y="70" width={w} height="330" rx="14" fill="none" stroke={m.c} strokeOpacity=".35" strokeWidth="3" />
          <path d={`M4 92 Q${w / 2} 30 ${w - 4} 92Z`} fill={m.c} opacity=".75" className="sc-flicker" style={{ animationDelay: `${m.dl}s` }} />
          <rect x={w * 0.14} y="120" width={w * 0.72} height="110" rx="8" fill={m.s} className="lk-sc-screen" style={{ animationDuration: `${m.d}s`, animationDelay: `${m.dl}s` } as Vars} />
          <rect x={w * 0.14} y="120" width={w * 0.72} height="110" rx="8" fill="url(#lk-sc-glass)" />
          <rect x={w * 0.2} y="262" width={w * 0.6} height="18" rx="9" fill={m.c} opacity=".55" />
          {m.lever && (
            <>
              <rect x={w + 6} y="120" width="6" height="110" rx="3" fill="#8b929c" />
              <circle cx={w + 9} cy="116" r="12" fill="#e01b3c" />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

/** Neon on the wall: a sign that hums and, now and then, blinks. */
function Sign({ text, color, className, style }: { text: string; color: string; className?: string; style?: CSSProperties }) {
  return (
    <span className={`lk-sc-sign ${className ?? ""}`} style={{ "--c": color, ...style } as Vars}>
      {text}
    </span>
  );
}

/** At the foot of the agent list: a cup of tokens and a stack of chips. */
function Winnings() {
  const src = art("cup");
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img src={src} alt="" className="lk-sc-cup-img" draggable={false} />;
  const chips = ["#e01b3c", "#1f6bff", "#e01b3c", "#111", "#1fae5b", "#e01b3c", "#ffc533"];
  return (
    <svg viewBox="0 0 200 150" className="lk-sc-cup" aria-hidden>
      <ellipse cx="100" cy="140" rx="92" ry="8" fill="#000" opacity=".45" />
      {chips.map((c, i) => (
        <g key={i} transform={`translate(${30 + (i % 2) * 2} ${118 - i * 11})`}>
          <ellipse cx="22" cy="10" rx="22" ry="8" fill={c} stroke="#000" strokeOpacity=".4" />
          <ellipse cx="22" cy="10" rx="22" ry="8" fill="none" stroke="#fff" strokeWidth="2.4" strokeDasharray="4 6" opacity=".85" />
          <ellipse cx="22" cy="8" rx="13" ry="4.4" fill="#fff" opacity=".18" />
        </g>
      ))}
      <path d="M96 64h70l-7 72a6 6 0 0 1-6 5h-44a6 6 0 0 1-6-5Z" fill="#c9ced6" stroke="#5c626b" strokeWidth="2" />
      <path d="M100 70h62" stroke="#fff" strokeWidth="3" opacity=".7" />
      <text x="131" y="112" textAnchor="middle" fontSize="15" fill="#e01b3c" style={{ fontFamily: "var(--font-lk-sign), Bungee, Impact, sans-serif" }}>
        777
      </text>
      {[
        [104, 58], [118, 52], [132, 56], [146, 50], [158, 58], [112, 44], [140, 42], [126, 40],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${(i * 37) % 60 - 30})`}>
          <ellipse rx="10" ry="4.5" fill="#ffc533" stroke="#8a5a0c" strokeWidth="1.2" />
          <ellipse rx="6" ry="2.4" fill="none" stroke="#fff3c4" strokeWidth=".8" />
        </g>
      ))}
    </svg>
  );
}

/**
 * The site's backdrop for Lucky: the floor of the Token Palace at 3 a.m.
 * Warm light pooling under the ceiling, rows of machines glowing down the
 * aisles, a loud carpet, neon on the walls and tokens drifting down. A
 * generated wallpaper replaces the room; the tokens keep falling over it.
 */
export function SlotsScene() {
  const wall = art("wallpaper");
  const bokeh = useSeeded("bokeh", 22, (r) => ({
    x: r() * 100,
    y: r() * 55,
    s: 30 + r() * 110,
    c: NEON[Math.floor(r() * NEON.length)],
    o: 0.12 + r() * 0.22,
    d: 3 + r() * 5,
    dl: -r() * 8,
  }));
  const coins = useSeeded("coins", 22, (r) => ({
    x: r() * 100,
    s: 12 + r() * 16,
    d: 9 + r() * 12,
    dl: -r() * 22,
    dx: (r() - 0.5) * 90,
    sp: 1.2 + r() * 2.4,
  }));

  return (
    <div className={`lk-sc ${slFonts}`}>
      {wall ? (
        <>
          <div className="lk-sc-wall sc-drift-in" style={{ backgroundImage: `url(${wall})` }} />
          {/* The near aisle is bright; a little shadow on the left keeps the agent list readable. */}
          <div className="lk-sc-shade" />
        </>
      ) : (
        <>
          <div className="lk-sc-ceiling" />
          {bokeh.map((b, i) => (
            <span
              key={i}
              className="lk-sc-bokeh sc-twinkle"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s, background: b.c, "--o": b.o, "--d": `${b.d}s`, "--dl": `${b.dl}s` } as Vars}
            />
          ))}
          <svg width="0" height="0" aria-hidden className="absolute">
            <defs>
              <linearGradient id="lk-sc-glass" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity=".35" />
                <stop offset=".4" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="lk-sc-floor">
            <div className="lk-sc-carpet" />
          </div>
          <Row seed="back" y={22} h={16} n={22} dim={0.5} />
          <Row seed="front" y={8} h={26} n={11} dim={0.92} />
          <div className="lk-sc-haze" />
          <Sign text="OPEN 24/7" color="#ff3d8b" className="lk-sc-sign-a sc-flicker" />
          <Sign text="NO CLOCKS" color="#35f0ff" className="lk-sc-sign-b" />
          <Sign text="777" color="#ffc533" className="lk-sc-sign-c sc-flicker" style={{ animationDelay: "-1.3s" }} />
        </>
      )}
      {coins.map((c, i) => (
        <span key={i} className="lk-sc-coin sc-fall" style={{ left: `${c.x}%`, "--d": `${c.d}s`, "--dl": `${c.dl}s`, "--x": `${c.dx}px` } as Vars}>
          <Token size={c.s} style={{ animationDuration: `${c.sp}s` }} className="lk-sc-flip" />
        </span>
      ))}
      <div className="sc-under lk-sc-under">
        <Winnings />
      </div>
    </div>
  );
}

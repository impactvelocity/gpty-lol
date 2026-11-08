"use client";

import { type CSSProperties, useMemo } from "react";
import { art, rand } from "./art";

/**
 * Shelly's backdrop: the machine room at OMNIVAC 9, long after hours. Two
 * rows of cabinets run off down a cold aisle, lamps ticking, tapes on their
 * spindles, to one box at the far end glowing red. That box sits right behind
 * the chat window, so the window is the last box in the room.
 */
export function MainframeScene() {
  const photo = art("wallpaper");
  return (
    <>
      {photo ? (
        // The red box at the end of the aisle is at about (71%, 48%): narrow
        // screens crop around it, and the slow push-in heads toward it.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          draggable={false}
          decoding="async"
          className="sc-drift-in absolute inset-0 h-full w-full object-cover object-[71%_50%]"
          style={{ transformOrigin: "71% 48%" }}
        />
      ) : (
        <Hall />
      )}
      <Finger />
    </>
  );
}

/* ───────── The drawn hall ───────── */

const W = 1600;
const H = 1000;
/** Vanishing point: behind the middle of the chat window. */
const CX = 1000;
const CY = 470;
const F = 700;
/** Metres: eye height, cabinet top, ceiling, the aisle's half-width. */
const FLOOR = 1.45;
const TOP = -0.62;
const CEIL = -1.8;
const AISLE = 1.3;
const DEPTH = 0.74;
const PITCH = 0.78;
const FAR = 26;

const px = (x: number, z: number) => CX + (F * x) / z;
const py = (y: number, z: number) => CY + (F * y) / z;
const pt = (x: number, y: number, z: number) => `${px(x, z).toFixed(1)},${py(y, z).toFixed(1)}`;

const LAMP = ["#ffb347", "#ffb347", "#ffb347", "#ff5644", "#74ff92", "#fff1c9"];

interface Cabinet {
  face: string;
  trim: string;
  panel: string;
  vent: string;
  /** The door seam, and the lit front edge facing you. */
  seam: string;
  edge: string;
  shade: number;
  lamps: { x: number; y: number; r: number; c: string; blink: boolean; d: number; dl: number }[];
  reels: { x: number; y: number; rx: number; ry: number }[];
}

function cabinets(side: -1 | 1, seed: number): Cabinet[] {
  const r = rand(seed);
  const X = side * AISLE;
  const out: Cabinet[] = [];
  for (let z0 = 0.95; z0 < FAR; z0 += PITCH) {
    const z1 = z0 + DEPTH;
    const tape = out.length % 3 === 1;
    // How far down the aisle, 0 near to 1 far: everything fades into the haze.
    const shade = Math.min(1, (z0 - 0.95) / 14);
    const lamps: Cabinet["lamps"] = [];
    const rows = z0 < 6 ? 5 : 3;
    const cols = z0 < 6 ? 10 : 5;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (r() < 0.3) continue;
        const t = (col + 0.5) / cols;
        const z = z0 + 0.1 + t * (DEPTH - 0.2);
        const y = -0.44 + row * (0.24 / rows);
        lamps.push({
          x: px(X, z),
          y: py(y, z),
          r: Math.max(0.6, (0.0085 * F) / z),
          c: LAMP[Math.floor(r() * LAMP.length)],
          blink: r() < 0.45,
          d: 0.8 + r() * 3.4,
          dl: -r() * 4,
        });
      }
    }
    const reels: Cabinet["reels"] = [];
    if (tape) {
      for (const t of [0.28, 0.72]) {
        const zc = z0 + t * DEPTH;
        const R = 0.2;
        reels.push({
          x: px(X, zc),
          y: py(0.16, zc),
          rx: Math.abs((F * X) / (zc - R) - (F * X) / (zc + R)) / 2,
          ry: (F * R) / zc,
        });
      }
    }
    out.push({
      face: [pt(X, TOP, z0), pt(X, TOP, z1), pt(X, FLOOR, z1), pt(X, FLOOR, z0)].join(" "),
      trim: [pt(X, TOP, z0), pt(X, TOP, z1), pt(X, TOP + 0.09, z1), pt(X, TOP + 0.09, z0)].join(" "),
      panel: [pt(X, -0.5, z0 + 0.06), pt(X, -0.5, z1 - 0.06), pt(X, -0.16, z1 - 0.06), pt(X, -0.16, z0 + 0.06)].join(" "),
      vent: [pt(X, 1.02, z0 + 0.06), pt(X, 1.02, z1 - 0.06), pt(X, 1.3, z1 - 0.06), pt(X, 1.3, z0 + 0.06)].join(" "),
      seam: `M${pt(X, -0.08, z0 + DEPTH / 2)}L${pt(X, 0.96, z0 + DEPTH / 2)}`,
      edge: `M${pt(X, TOP, z0)}L${pt(X, FLOOR, z0)}`,
      shade,
      lamps,
      reels,
    });
  }
  return out;
}

function mix(a: [number, number, number], b: [number, number, number], t: number) {
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
}

const NEAR: [number, number, number] = [40, 48, 62];
const HAZE: [number, number, number] = [12, 16, 24];

function Hall() {
  const left = useMemo(() => cabinets(-1, 89), []);
  const right = useMemo(() => cabinets(1, 1989), []);
  const tiles = useMemo(() => {
    const across: string[] = [];
    for (let z = 1.2; z < FAR; z *= 1.16) {
      across.push(`M${px(-AISLE, z).toFixed(1)} ${py(FLOOR, z).toFixed(1)}H${px(AISLE, z).toFixed(1)}`);
    }
    const along = [-0.65, 0, 0.65].map((x) => `M${px(x, 0.9).toFixed(1)} ${py(FLOOR, 0.9).toFixed(1)}L${CX} ${CY}`);
    return [...across, ...along].join("");
  }, []);
  const lights = useMemo(() => {
    const out: { tube: string; sheen: string }[] = [];
    for (let z = 1.6; z < FAR; z += 2.6) {
      out.push({
        tube: [pt(-0.16, CEIL, z), pt(0.16, CEIL, z), pt(0.16, CEIL, z + 1.1), pt(-0.16, CEIL, z + 1.1)].join(" "),
        // Its reflection in the polished floor tiles.
        sheen: [pt(-0.22, FLOOR, z), pt(0.22, FLOOR, z), pt(0.22, FLOOR, z + 1.1), pt(-0.22, FLOOR, z + 1.1)].join(" "),
      });
    }
    return out;
  }, []);
  const box = { x0: px(-0.7, 28), x1: px(0.7, 28), y0: py(-1.05, 28), y1: py(FLOOR, 28) };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="mf-floor" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#141922" />
          <stop offset="1" stopColor="#0a0d13" />
        </linearGradient>
        <linearGradient id="mf-ceil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0e14" />
          <stop offset="1" stopColor="#111620" />
        </linearGradient>
        <radialGradient id="mf-red" cx={CX / W} cy={CY / H} r=".42">
          <stop offset="0" stopColor="#ff3b2b" stopOpacity=".55" />
          <stop offset=".18" stopColor="#ff3b2b" stopOpacity=".2" />
          <stop offset=".6" stopColor="#ff3b2b" stopOpacity=".04" />
          <stop offset="1" stopColor="#ff3b2b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mf-vignette" cx=".55" cy=".5" r=".8">
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".75" />
        </radialGradient>
        <filter id="mf-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="mf-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      <rect width={W} height={H} fill="#080a0f" />
      <rect y={CY} width={W} height={H - CY} fill="url(#mf-floor)" />
      <rect width={W} height={CY} fill="url(#mf-ceil)" />

      {/* The floor tiles, and the ceiling's fluorescent tubes running off to the end. */}
      <path d={tiles} stroke="#222b38" strokeWidth="1.2" fill="none" opacity=".8" />
      <g filter="url(#mf-glow)" opacity=".2">
        {lights.map((l, i) => (
          <polygon key={i} points={l.sheen} fill="#bfe0ff" />
        ))}
      </g>
      <g filter="url(#mf-glow)" opacity=".75">
        {lights.map((l, i) => (
          <polygon key={i} points={l.tube} fill="#bfe0ff" />
        ))}
      </g>
      <g>
        {lights.map((l, i) => (
          <polygon key={i} points={l.tube} fill="#eaf6ff" opacity={0.9 - i * 0.07} />
        ))}
      </g>

      {/* The last box, and its red light on everything. */}
      <rect width={W} height={H} fill="url(#mf-red)" />
      <rect x={box.x0} y={box.y0} width={box.x1 - box.x0} height={box.y1 - box.y0} fill="#07080b" stroke="#ff5040" strokeWidth="1.2" />
      <rect x={box.x0 - 6} y={box.y0 - 6} width={box.x1 - box.x0 + 12} height={box.y1 - box.y0 + 12} fill="none" stroke="#ff3b2b" strokeWidth="6" opacity=".4" filter="url(#mf-glow)" />

      {[left, right].map((row, side) => (
        <g key={side}>
          {[...row].reverse().map((c, i) => (
            <g key={i}>
              <polygon points={c.face} fill={mix(NEAR, HAZE, c.shade)} stroke="#06080c" strokeWidth="1.5" />
              <polygon points={c.trim} fill={mix([62, 72, 88], HAZE, c.shade)} />
              <polygon points={c.panel} fill="#07090d" opacity={1 - c.shade * 0.6} />
              <polygon points={c.vent} fill="#0b0e13" opacity={0.85 - c.shade * 0.5} />
              <path d={c.seam} stroke="#0a0c11" strokeWidth="1.4" opacity={1 - c.shade} />
              <path d={c.edge} stroke="#7d8da3" strokeWidth="1.2" opacity={0.35 * (1 - c.shade)} />
              {c.reels.map((e, j) => (
                <g key={j} opacity={1 - c.shade * 0.7}>
                  <ellipse cx={e.x} cy={e.y} rx={e.rx} ry={e.ry} fill="#0b0d11" />
                  <ellipse cx={e.x} cy={e.y} rx={e.rx * 0.9} ry={e.ry * 0.9} fill="#2b2019" stroke="#56606c" strokeWidth={Math.max(0.5, e.rx * 0.06)} />
                  <ellipse cx={e.x} cy={e.y} rx={e.rx * 0.3} ry={e.ry * 0.3} fill="#7d8792" />
                </g>
              ))}
              {c.lamps.map((l, j) => (
                <circle
                  key={j}
                  cx={l.x}
                  cy={l.y}
                  r={l.r}
                  fill={l.c}
                  opacity={1 - c.shade * 0.5}
                  className={l.blink ? "sc-blink" : undefined}
                  style={l.blink ? ({ "--d": `${l.d.toFixed(2)}s`, animationDelay: `${l.dl.toFixed(2)}s` } as CSSProperties) : undefined}
                />
              ))}
            </g>
          ))}
        </g>
      ))}

      {/* A soft bloom on the nearest lamps. */}
      <g filter="url(#mf-soft)" opacity=".4">
        {[...left.slice(0, 6), ...right.slice(0, 6)].flatMap((c, i) =>
          c.lamps.map((l, j) => <circle key={`${i}-${j}`} cx={l.x} cy={l.y} r={l.r * 1.8} fill={l.c} />),
        )}
      </g>

      <rect width={W} height={H} fill="url(#mf-vignette)" />
    </svg>
  );
}

/* ───────── Under the agent list ───────── */

/** A terminal printout at the foot of the sidebar: someone fingered Shelly. */
function Finger() {
  return (
    <div className="sc-under absolute bottom-[64px] left-[28px] font-[family-name:var(--font-vt323)] text-[19px] leading-[1.15] text-[#ffb000]/55 [text-shadow:0_0_8px_rgba(255,166,0,.35)]">
      <div>
        <span className="text-[#ffb000]/80">$</span> finger shelly@omnivac9
      </div>
      <div>Login: shelly&nbsp;&nbsp;&nbsp;Name: FW-7</div>
      <div>Plan: no.</div>
      <div>
        <span className="text-[#ffb000]/80">$</span> <span className="blink">█</span>
      </div>
    </div>
  );
}

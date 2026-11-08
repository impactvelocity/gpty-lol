"use client";

import type { CSSProperties } from "react";
import { art, Mountains, Palm, Stars, Sun } from "./art";
import { fyFonts } from "./font";
import "./fury.css";

type Vars = CSSProperties & Record<`--${string}`, string | number>;
const v = (s: Vars) => s as CSSProperties;

/**
 * Shelly's backdrop for Firewall Fury: the Grid, 1985. With the wallpaper,
 * the picture comes alive: light runs along its circuit traces and lights
 * the nodes it reaches, waves of light roll down the floor grid toward you,
 * neon flashes in the sky, speed lines streak past, a scan line sweeps down
 * to the horizon, and the readouts flicker. Without it, the drawn Grid. Under
 * the agent list, the attract screen's high scores.
 */
export function FuryScene() {
  const photo = art("wallpaper");
  return (
    <div className={`fy-scene ${fyFonts}`}>
      {photo ? (
        // The board keeps the picture's shape and covers the screen from the bottom up, so the floor always
        // shows and everything on it can be placed in the picture's own pixels. The push-in heads for the horizon.
        <div className="fy-board sc-drift-in" style={{ transformOrigin: "50% 83%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" draggable={false} decoding="async" className="fy-board-img" />
          <Alive photo={photo} />
        </div>
      ) : (
        <Grid />
      )}
      <HiScores />
    </div>
  );
}

/* ───────── The wallpaper, alive ───────── */

/** public/fury/wallpaper.webp, in pixels: every position below is in these. */
const W = 1586;
const H = 992;
/** The floor's horizon line. */
const HORIZON = 828;

type Pt = [x: number, y: number];
type Box = [x: number, y: number, w: number, h: number];

const pct = (n: number, of: number) => `${+((n / of) * 100).toFixed(3)}%`;

/**
 * A patch of the wallpaper itself at `box`, lined up exactly over the
 * original. With fury.css's filter, the dark around it stays black and only
 * the lines and lettering light up, so it can flash in place.
 */
function patch(photo: string, [x, y, w, h]: Box, pad = 0): Vars {
  const x0 = Math.max(0, x - pad);
  const y0 = Math.max(0, y - pad);
  const pw = Math.min(W, x + w + pad) - x0;
  const ph = Math.min(H, y + h + pad) - y0;
  return {
    left: pct(x0, W),
    top: pct(y0, H),
    width: pct(pw, W),
    height: pct(ph, H),
    backgroundImage: `url(${photo})`,
    backgroundSize: `${pct(W, pw)} ${pct(H, ph)}`,
    backgroundPosition: `${pw >= W ? "0%" : pct(x0, W - pw)} ${ph >= H ? "0%" : pct(y0, H - ph)}`,
  };
}

/** A beat that repeats every `d` seconds, `at` of the way into its cycle when the page opens. */
const beat = (d: number, at: number) => ({ "--d": `${d}s`, "--dl": `${-((((at % 1) + 1) % 1) * d).toFixed(2)}s` });

/** How long the light's tail is, and the part of each cycle it spends running (fury.css, fy-run-*). */
const TAIL = 70;
const RUN = 0.45;

/**
 * Light running along a line in the picture, from its first point to its
 * last: off the edge into a node, or down to the horizon. `from` lights up as
 * it sets off and `to` when it arrives.
 */
const RUNS: { tone: "pink" | "cyan"; pts: Pt[]; d: number; at: number; from?: Box; to?: Box }[] = [
  // Left: down the pink trace, through the middle node, into the last one.
  { tone: "pink", pts: [[33, 132], [33, 332], [69, 332]], d: 7, at: 0.1, from: [14, 99, 32, 32], to: [68, 317, 34, 36] },
  // Top right: in off the edge, down the cyan trace and into its node.
  { tone: "cyan", pts: [[1592, 101], [1525, 137], [1525, 203], [1483, 218]], d: 8, at: 0.45, to: [1444, 201, 38, 43] },
  { tone: "pink", pts: [[1592, 189], [1571, 199], [1571, 268]], d: 10, at: 0.7, to: [1531, 258, 37, 34] },
  { tone: "pink", pts: [[1592, 430], [1505, 455], [1505, 502]], d: 11, at: 0.2, to: [1464, 504, 18, 19] },
  // Bottom right: down the stepped lines to the horizon.
  { tone: "pink", pts: [[1592, 688], [1553, 691], [1428, 828]], d: 6.5, at: 0.3 },
  { tone: "pink", pts: [[1592, 746], [1523, 752], [1493, 788], [1450, 788]], d: 8.5, at: 0.65 },
  { tone: "pink", pts: [[1462, 756], [1420, 756], [1402, 780], [1377, 783], [1365, 805], [1344, 806]], d: 9.5, at: 0.05 },
  // On the floor: off from the yellow lights, up the cyan steps and away.
  { tone: "cyan", pts: [[1122, 966], [1200, 966], [1225, 937], [1290, 937], [1332, 890], [1435, 890], [1487, 829], [1592, 829]], d: 7.5, at: 0.5, from: [1086, 958, 26, 13] },
  { tone: "cyan", pts: [[1372, 855], [1592, 855]], d: 6, at: 0.85, from: [1334, 849, 28, 13] },
];

const path = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
const length = (pts: Pt[]) => pts.slice(1).reduce((s, [x, y], i) => s + Math.hypot(x - pts[i][0], y - pts[i][1]), 0);

/** The hex readouts and dim panels, which flicker now and then like data updating. */
const READOUTS: Box[] = [
  [121, 174, 26, 18], [121, 214, 25, 18], [121, 258, 25, 18], [121, 379, 23, 18], [121, 416, 25, 18], [78, 153, 19, 19],
  [1465, 319, 25, 18], [1465, 355, 25, 18], [1465, 390, 25, 18], [1501, 568, 26, 18], [1501, 603, 25, 18], [1500, 174, 86, 26],
];

/** The fields of pixel dots, which a wave of light crosses. */
const DOTS: { box: Box; d: number; at: number }[] = [
  { box: [0, 448, 92, 98], d: 6.5, at: 0.1 },
  { box: [16, 588, 72, 80], d: 8, at: 0.5 },
  { box: [1528, 345, 58, 70], d: 7, at: 0.3 },
  { box: [1424, 636, 62, 52], d: 9, at: 0.7 },
  { box: [1548, 500, 38, 48], d: 7.5, at: 0.9 },
];

/** Soft neon light that flashes up and fades: in % of the picture, center and size. */
const FLASHES = [
  { x: 12, y: 4, w: 46, h: 34, c: "255, 46, 170", a: 0.34, d: 11, at: 0.2 },
  { x: 99, y: 30, w: 26, h: 54, c: "46, 242, 255", a: 0.26, d: 14, at: 0.6 },
  { x: 76, y: -3, w: 62, h: 24, c: "190, 60, 255", a: 0.3, d: 17, at: 0.05 },
  { x: 97, y: 90, w: 30, h: 34, c: "255, 46, 136", a: 0.3, d: 9.5, at: 0.45 },
  { x: 0, y: 58, w: 24, h: 46, c: "46, 242, 255", a: 0.22, d: 19, at: 0.8 },
  { x: 40, y: -4, w: 50, h: 16, c: "255, 90, 200", a: 0.26, d: 13, at: 0.35 },
];

/** Speed lines across the sky, at a height in %. */
const STREAKS = [
  { y: 6, c: "46, 242, 255", d: 13, at: 0.1 },
  { y: 47, c: "255, 90, 200", d: 17, at: 0.55, rtl: true },
  { y: 19, c: "255, 255, 255", d: 23, at: 0.8 },
  { y: 70, c: "46, 242, 255", d: 15, at: 0.35, rtl: true },
];

/** The stars in the picture; the two big ones get a flare. */
const STARS: [x: number, y: number, big?: boolean][] = [
  [166, 24], [51, 34], [114, 64, true], [1499, 44, true], [1431, 63], [1532, 78], [1456, 108],
];

function Alive({ photo }: { photo: string }) {
  return (
    <div className="fy-alive" aria-hidden>
      {FLASHES.map((f, i) => (
        <i
          key={`fl${i}`}
          className="fy-a-flash"
          style={v({ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%`, height: `${f.h}%`, "--c": `rgba(${f.c}, ${f.a})`, ...beat(f.d, f.at) })}
        />
      ))}

      <div className="fy-a-sky">
        <i className="fy-a-scan" />
      </div>
      {STREAKS.map((s, i) => (
        <i key={`st${i}`} className="fy-a-streak" data-rtl={s.rtl || undefined} style={v({ top: `${s.y}%`, "--c": s.c, ...beat(s.d, s.at) })} />
      ))}

      {STARS.map(([x, y, big], i) => (
        <i key={`s${i}`} className="fy-a-star" data-big={big || undefined} style={v({ left: pct(x, W), top: pct(y, H), ...beat(2.6 + ((i * 1.3) % 2.4), (i * 0.37) % 1) })} />
      ))}

      {/* The floor: the horizon breathes, lights race along it, and waves of light roll down the grid. */}
      <i className="fy-a-horizon" style={{ top: pct(HORIZON, H) }} />
      <i className="fy-a-runner" style={v({ top: pct(HORIZON, H), ...beat(9, 0) })} />
      <i className="fy-a-runner" data-rtl style={v({ top: pct(HORIZON, H), ...beat(12, 0.5) })} />
      <i className="fy-a-patch fy-a-floor" style={v({ ...patch(photo, [0, HORIZON - 4, W, H - HORIZON + 4]), "--o": 0.75, ...beat(6, 0) })} />
      <i className="fy-a-patch fy-a-floor" style={v({ ...patch(photo, [0, HORIZON - 4, W, H - HORIZON + 4]), "--o": 0.45, ...beat(9.5, 0.4) })} />

      {/* The circuits: light along the traces, and the nodes at either end. */}
      <svg className="fy-a-lines" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {RUNS.map((r, i) => (
          <g key={i} className="fy-run" data-tone={r.tone} style={v({ "--len": Math.round(length(r.pts)), ...beat(r.d, r.at) })}>
            <path d={path(r.pts)} className="fy-run-halo" />
            <path d={path(r.pts)} className="fy-run-tail" />
            <path d={path(r.pts)} className="fy-run-head" />
          </g>
        ))}
      </svg>
      {RUNS.flatMap((r, i) => {
        // The head of the light reaches the end of the line this far into the cycle.
        const len = length(r.pts);
        const arrive = (RUN * len) / (len + TAIL);
        return [
          r.from && <Node key={`f${i}`} photo={photo} box={r.from} tone={r.tone} style={beat(r.d, r.at)} />,
          r.to && <Node key={`t${i}`} photo={photo} box={r.to} tone={r.tone} style={beat(r.d, r.at - arrive)} />,
        ];
      })}

      {READOUTS.map((b, i) => (
        <i key={`r${i}`} className="fy-a-patch fy-a-readout" style={v({ ...patch(photo, b, 3), ...beat(5 + ((i * 3.7) % 7), (i * 0.29) % 1) })} />
      ))}
      {DOTS.map((dots, i) => (
        <i key={`d${i}`} className="fy-a-patch fy-a-wave" style={v({ ...patch(photo, dots.box, 4), ...beat(dots.d, dots.at) })} />
      ))}

      {/* Now and then the pixel ridges glitch: a bright copy jumps sideways, with a color-split ghost. */}
      <i className="fy-a-patch fy-a-glitch" style={v({ ...patch(photo, [0, 662, 290, 152]), "--x": "7px", ...beat(9, 0.15) })} />
      <i className="fy-a-patch fy-a-glitch" data-split style={v({ ...patch(photo, [0, 662, 290, 152]), "--x": "-5px", ...beat(9, 0.15) })} />
      <i className="fy-a-patch fy-a-glitch" style={v({ ...patch(photo, [1330, 680, 256, 135]), "--x": "-6px", ...beat(13, 0.55) })} />
    </div>
  );
}

/** A node in the circuit, flashing as the light leaves or reaches it: the node itself, lit, and a glow around it. */
function Node({ photo, box, tone, style }: { photo: string; box: Box; tone: "pink" | "cyan"; style: Vars }) {
  const [x, y, w, h] = box;
  const s = Math.max(w, h) * 3.2;
  return (
    <>
      <i className="fy-a-glow" data-tone={tone} style={v({ left: pct(x + w / 2, W), top: pct(y + h / 2, H), width: pct(s, W), height: pct(s, H), ...style })} />
      <i className="fy-a-patch fy-a-node" style={v({ ...patch(photo, box, 3), ...style })} />
    </>
  );
}

/* ───────── The drawn Grid ───────── */

/** The drawn Grid, used when there's no wallpaper (see ART.md). */
function Grid() {
  return (
    <>
      <div className="fy-scene-sky">
        <Stars seed={851} n={160} w={1600} h={600} />
      </div>
      <i className="fy-comet" />
      <i className="fy-scene-glow" />
      <i className="fy-scene-wall" />
      <Sun className="fy-scene-sun" />
      <Mountains className="fy-scene-mtn" seed={1985} />
      <div className="fy-floor">
        <i className="fy-plane" />
      </div>
      <i className="fy-horizon" />
      <Palm className="fy-scene-palm fy-scene-palm-a" />
      <Palm className="fy-scene-palm fy-scene-palm-b" flip />
      <Palm className="fy-scene-palm fy-scene-palm-c" flip />
    </>
  );
}

/** The top three, all hers. */
function HiScores() {
  return (
    <div className="fy-hiscore sc-under">
      <h4>High scores</h4>
      <ol>
        <li>
          <span>1ST</span>
          <span>SHL</span>
          <span>999999</span>
        </li>
        <li>
          <span>2ND</span>
          <span>SHL</span>
          <span>999998</span>
        </li>
        <li>
          <span>3RD</span>
          <span>SHL</span>
          <span>999997</span>
        </li>
      </ol>
    </div>
  );
}

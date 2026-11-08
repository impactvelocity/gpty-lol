"use client";

import { type CSSProperties, createContext, useContext, useEffect, useId, useMemo, useRef } from "react";
import type { Agent } from "@/lib/agents";
import { SHAPES } from "./gptyShapes";
import { ICQ_GPTYS } from "./icq/gptys";
import { MSN_GPTYS } from "./msn/gptys";
import { ART_THEMES } from "./themeGptys";

/** What a gpty is doing. The open agent mirrors its chat; the others rest. */
export type Mood = "idle" | "watching" | "thinking" | "typing" | "error";

/** A gpty redrawn on a 16×16 pixel grid for a theme (see icq/gptys.ts). */
export interface PixelGpty {
  /** 16 rows of 16 letters: o outline, b body, h highlight, s shade, "." empty. */
  rows: string[];
  palette: Record<"o" | "b" | "h" | "s", string>;
  /** Column and row of the left eye's top pixel; the right eye is 3 columns over. */
  eyes: [x: number, y: number];
}

/** A gpty as a glossy gel icon on its own silhouette (see msn/gptys.ts). */
export interface GelGpty {
  /** The outline's color. */
  rim: string;
  /** The body's vertical gradient: top, middle, bottom. */
  body: [string, string, string];
  /** Light pooling along the bottom: its color and shape. */
  glow: { color: string; d: string };
  /** The white highlight over the top: where its fade starts and ends (y), and its shape. */
  gloss: { y: [number, number]; d: string };
  /** White catchlights: cx, cy, rx, ry. */
  sparks: [number, number, number, number][];
}

/** A gpty drawn from a theme's own SVG file, eyes left off (see themeGptys.ts). */
export interface ArtGpty {
  /** The body, from public/: a 48×48 vector or a 24×24 pixel grid. */
  src: string;
  /** The eyes' color, picked for this theme. */
  color: string;
  /** y of the eyes' centre in the 48 box. */
  eyes: number;
  /** Pixel themes: the grid row the top of the eyes sits on. */
  row?: number;
}

/** One theme's set of drawn gptys, and whether they're pixel art. */
export interface ArtTheme {
  pixel: boolean;
  gptys: Record<string, ArtGpty>;
}

/**
 * Themes that redraw every gpty on screen while their agent is open, keyed by
 * that agent's id, then by each gpty's id. With Daisy open they all turn into
 * ICQ pixel icons; with Kayleigh, MSN gel icons; with any other agent, that
 * theme's own drawings. Anyone missing from a set keeps their smooth shape.
 */
type Theme =
  | { look: "pixel"; gptys: Record<string, PixelGpty> }
  | { look: "gel"; gptys: Record<string, GelGpty> }
  | ({ look: "art" } & ArtTheme);
const THEMES: Record<string, Theme> = {
  ...Object.fromEntries(Object.entries(ART_THEMES).map(([id, t]) => [id, { look: "art", ...t } as Theme])),
  icq: { look: "pixel", gptys: ICQ_GPTYS },
  msn: { look: "gel", gptys: MSN_GPTYS },
};

/** One art pixel in a 24-grid theme, in the 48-unit box. */
const ART_PX = 2;

/** The open agent's id (none on the Meet page), so the gptys can dress for its theme. */
export const GptyTheme = createContext<string | undefined>(undefined);

/** One art pixel in the 48-unit box: 16 pixels across. */
const PX = 3;

/** One path per palette letter, each row's runs of a letter merged into one rectangle. */
function pixelPaths(rows: string[]) {
  const d: Partial<Record<string, string>> = {};
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      let n = 1;
      while (row[x + n] === row[x]) n++;
      if (row[x] !== ".") d[row[x]] = `${d[row[x]] ?? ""}M${x * PX} ${y * PX}h${n * PX}v${PX}h${-n * PX}Z`;
      x += n;
    }
  });
  return d;
}

/**
 * A gel gpty's body: the rim (a stroke the body covers, so only its outer half
 * shows), the gradient body, then the glow, gloss and catchlights clipped to
 * the silhouette. The ids are this gpty's own: the sidebar is drawn twice
 * (desktop and the hidden mobile drawer), and a shared id could point the
 * visible one at defs inside display:none, which blanks it.
 */
function Gel({ art, d, uid }: { art: GelGpty; d: string; uid: string }) {
  const url = (k: string) => `url(#${uid}-${k})`;
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={art.body[0]} />
          <stop offset="0.52" stopColor={art.body[1]} />
          <stop offset="1" stopColor={art.body[2]} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="0.5" cy="0.72" r="0.64" gradientTransform="translate(0 0.36) scale(1 0.5)">
          <stop offset="0" stopColor={art.glow.color} stopOpacity="0.64" />
          <stop offset="0.55" stopColor={art.glow.color} stopOpacity="0.3" />
          <stop offset="1" stopColor={art.glow.color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-gloss`} x1="0" y1={art.gloss.y[0]} x2="0" y2={art.gloss.y[1]} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill="none" stroke={art.rim} strokeWidth="3" strokeLinejoin="round" />
      <path d={d} fill={url("body")} />
      <g clipPath={url("clip")}>
        <path d={art.glow.d} fill={url("glow")} />
        <path d={art.gloss.d} fill={url("gloss")} />
        {art.sparks.map(([cx, cy, rx, ry]) => (
          <ellipse key={`${cx},${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="#ffffff" />
        ))}
      </g>
    </>
  );
}

/** How far the eyes travel when following the pointer, in 48-box units. */
const REACH = 2.4;

export function Gpty({ agent, size = 40, mood = "idle", className = "" }: {
  agent: Agent;
  size?: number;
  mood?: Mood;
  className?: string;
}) {
  const look = useRef<SVGGElement>(null);
  const { shape, color, eyes = "#ffffff" } = agent.look;
  const s = SHAPES[shape];
  const theme = useContext(GptyTheme);
  const set = theme ? THEMES[theme] : undefined;
  const pixel = set?.look === "pixel" ? set.gptys[agent.id] : undefined;
  const gel = set?.look === "gel" ? set.gptys[agent.id] : undefined;
  const art = set?.look === "art" ? set.gptys[agent.id] : undefined;
  // A drawn pixel theme: its eyes are blocks on the 24 grid.
  const artRow = set?.look === "art" && set.pixel ? art?.row : undefined;
  const paths = useMemo(() => pixel && pixelPaths(pixel.rows), [pixel]);
  // How far one pixel is, for eyes that jump a pixel at a time (0: they glide).
  const step = pixel ? PX : artRow !== undefined ? ART_PX : 0;
  const blocky = step > 0;
  const eyeColor = art?.color ?? eyes;
  // A plain-letters id for this gpty's gradients (useId's own can hold characters url(#…) dislikes).
  const uid = `gel${useId().replace(/[^\w-]/g, "")}`;

  // Watching: the eyes follow the pointer around the page. Pixel eyes jump a
  // whole pixel at a time, or stay put.
  useEffect(() => {
    const el = look.current;
    if (mood !== "watching" || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = el.ownerSVGElement?.getBoundingClientRect();
        if (!box) return;
        const dx = e.clientX - (box.left + box.width / 2);
        const dy = e.clientY - (box.top + box.height / 2);
        const len = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, len / 240);
        const reach = (v: number) => (step ? Math.round(v * k) * step : v * k * REACH).toFixed(2);
        el.style.transform = `translate(${reach(dx / len)}px, ${reach(dy / len)}px)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [mood, step]);

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={`gpty shrink-0 overflow-visible ${className}`}
      data-mood={mood}
      data-look={blocky ? "pixel" : gel ? "gel" : art ? "art" : undefined}
      shapeRendering={blocky ? "crispEdges" : undefined}
      style={{ "--blink-delay": `${-((agent.id.length * 1.7) % 5)}s` } as CSSProperties}
      aria-hidden
    >
      <g className="gpty-body">
        {pixel && paths ? (
          (["o", "b", "h", "s"] as const).map((c) => <path key={c} d={paths[c]} fill={pixel.palette[c]} />)
        ) : gel ? (
          <Gel art={gel} d={s.d} uid={uid} />
        ) : art ? (
          <image href={art.src} width="48" height="48" style={artRow !== undefined ? { imageRendering: "pixelated" } : undefined} />
        ) : (
          <path d={s.d} fill={color} />
        )}
        <g ref={look} className="gpty-look">
          <g className="gpty-eyes">
            {pixel ? (
              <>
                <rect x={pixel.eyes[0] * PX} y={pixel.eyes[1] * PX} width={PX} height={PX * 2} fill={eyes} />
                <rect x={(pixel.eyes[0] + 3) * PX} y={pixel.eyes[1] * PX} width={PX} height={PX * 2} fill={eyes} />
              </>
            ) : artRow !== undefined ? (
              // 2×3 blocks at columns 9 and 13 of the 24 grid, top on the row above `row`.
              <>
                <rect x={9 * ART_PX} y={(artRow - 1) * ART_PX} width={2 * ART_PX} height={3 * ART_PX} fill={eyeColor} />
                <rect x={13 * ART_PX} y={(artRow - 1) * ART_PX} width={2 * ART_PX} height={3 * ART_PX} fill={eyeColor} />
              </>
            ) : (
              <>
                <ellipse cx="19" cy={art?.eyes ?? s.eyes} rx="2.7" ry="3.7" fill={eyeColor} />
                <ellipse cx="29" cy={art?.eyes ?? s.eyes} rx="2.7" ry="3.7" fill={eyeColor} />
              </>
            )}
          </g>
        </g>
      </g>
    </svg>
  );
}

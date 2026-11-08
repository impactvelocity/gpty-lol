"use client";

import { memo, type Ref, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { art, EYE_ALMOND, LENS_R, MoonFace, PlanchetteBody, Star, SunFace } from "./art";

/**
 * The talking board: two arcs of letters, the numbers, YES under the sun, NO
 * under the moon, GOODBYE at the foot and an eye at the top that watches
 * you, engraved in antique gold and bone on warm charcoal. One SVG, 1000×480
 * units, so every letter has a known spot and the planchette can travel
 * between them.
 *
 * The planchette is driven by a spring in a requestAnimationFrame loop (no
 * React renders per frame): give it an `aim` and it glides there, hopping
 * at most every HOP ms, with a little drift and tilt like hands resting on
 * it. Whatever sits under its lens flares ember, and the lens magnifies it.
 */

export const BOARD_W = 1000;
export const BOARD_H = 480;

const CX = 500;
const CY = 1200;
const ROW1 = "ABCDEFGHIJKLM";
const ROW2 = "NOPQRSTUVWXYZ";
const NUMS = "1234567890";

/** How long the planchette dwells before it moves on to the next letter. */
const HOP = 140;
/** How much the lens magnifies the board. */
const MAG = 1.55;

type Glyph = { c: string; x: number; y: number; rot: number; size: number };

function arc(chars: string, r: number, half: number, size: number): Glyph[] {
  const a0 = Math.asin(half / r);
  return chars.split("").map((c, i) => {
    const a = -a0 + (2 * a0 * i) / (chars.length - 1);
    return { c, x: CX + r * Math.sin(a), y: CY - r * Math.cos(a), rot: (a * 180) / Math.PI, size };
  });
}

const R1 = 1022;
const R2 = 942;
const GLYPHS: Glyph[] = [
  ...arc(ROW1, R1, 350, 52),
  ...arc(ROW2, R2, 328, 52),
  ...NUMS.split("").map((c, i) => ({ c, x: 320 + i * 40, y: 392, rot: 0, size: 32 })),
];

export const WORDS = {
  YES: { x: 236, y: 104 },
  NO: { x: 764, y: 104 },
  GOODBYE: { x: 500, y: 438 },
} as const;
export type Word = keyof typeof WORDS;
export const isWord = (w: string): w is Word => w in WORDS;
/** How wide each word's bracket is. */
const WORD_W: Record<Word, number> = { YES: 110, NO: 86, GOODBYE: 196 };

const REST = { x: 500, y: 326 };
const EYE = { x: 500, y: 92 };

const SPOTS: Record<string, { x: number; y: number }> = {
  ...Object.fromEntries(GLYPHS.map((g) => [g.c, { x: g.x, y: g.y }])),
  ...WORDS,
};

/** A dotted arc that follows a row of letters. */
function dottedArc(r: number, half: number) {
  const a = Math.asin(half / r);
  const x1 = CX - r * Math.sin(a);
  const x2 = CX + r * Math.sin(a);
  const y = CY - r * Math.cos(a);
  return `M${x1.toFixed(1)} ${y.toFixed(1)}A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y.toFixed(1)}`;
}

/** The board's edge: a rule with a concave notch cut into each corner. */
function notched(x0: number, y0: number, x1: number, y1: number, r: number) {
  return `M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 0 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 0 ${x1 - r} ${y1}H${x0 + r}A${r} ${r} 0 0 0 ${x0} ${y1 - r}V${y0 + r}A${r} ${r} 0 0 0 ${x0 + r} ${y0}Z`;
}

/** The second rule, `g` inside the first, its notches on the same centers. */
function notchedInner(x0: number, y0: number, x1: number, y1: number, r: number, g: number) {
  const R = r + g;
  const ri = Math.sqrt(R * R - g * g);
  const f = (n: number) => n.toFixed(2);
  return `M${f(x0 + ri)} ${y0 + g}H${f(x1 - ri)}A${R} ${R} 0 0 0 ${x1 - g} ${f(y0 + ri)}V${f(y1 - ri)}A${R} ${R} 0 0 0 ${f(x1 - ri)} ${y1 - g}H${f(x0 + ri)}A${R} ${R} 0 0 0 ${x0 + g} ${f(y1 - ri)}V${f(y0 + ri)}A${R} ${R} 0 0 0 ${f(x0 + ri)} ${y0 + g}Z`;
}

/** Four corner marks around a word, like the YES and NO on a spirit board. */
function bracket(cx: number, cy: number, w: number, h: number, k = 10) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const t = cy - h / 2;
  const b = cy + h / 2;
  return `M${l} ${t + k}V${t}H${l + k}M${r - k} ${t}H${r}V${t + k}M${r} ${b - k}V${b}H${r - k}M${l + k} ${b}H${l}V${b - k}`;
}

const FRAME = notched(8, 8, 992, 472, 30);
const FRAME_IN = notchedInner(8, 8, 992, 472, 30, 7);

export interface BoardApi {
  /** Rings ripple out across the board, one per rap. */
  knock: (n: number) => void;
}

/** The static engraving: frame, sunburst, sun, moon, eye and the dotted arcs. */
function Engraving({ irisRef }: { irisRef: Ref<SVGGElement> }) {
  const burst = useMemo(
    () =>
      Array.from({ length: 29 }, (_, i) => {
        const a = ((-74 + (i * 148) / 28) * Math.PI) / 180;
        return `M500 540L${(500 + Math.sin(a) * 780).toFixed(0)} ${(540 - Math.cos(a) * 780).toFixed(0)}`;
      }).join(""),
    [],
  );
  const rays = useMemo(
    () =>
      Array.from({ length: 13 }, (_, i) => {
        const a = ((-162 + i * 12) * Math.PI) / 180;
        const r2 = i % 2 ? 58 : 70;
        return `M${(Math.cos(a) * 42).toFixed(1)} ${(Math.sin(a) * 42).toFixed(1)}L${(Math.cos(a) * r2).toFixed(1)} ${(Math.sin(a) * r2).toFixed(1)}`;
      }).join(""),
    [],
  );
  const striae = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return `M${(Math.cos(a) * 9).toFixed(1)} ${(Math.sin(a) * 9).toFixed(1)}L${(Math.cos(a) * 15).toFixed(1)} ${(Math.sin(a) * 15).toFixed(1)}`;
      }).join(""),
    [],
  );
  const eyePhoto = art("eye");
  return (
    <>
      <path d={FRAME} className="sp-board-fill" />
      <g clipPath="url(#sp-board-clip)">
        <path d={burst} className="sp-burst" />
      </g>
      <g filter="url(#sp-ink)" fill="none">
        <path d={FRAME} className="sp-gold-line" strokeWidth="1.6" />
        <path d={FRAME_IN} className="sp-gold-line" strokeWidth=".8" opacity=".6" />
        {/* A star in each notch. */}
        <Star x={14} y={14} s={11} />
        <Star x={986} y={14} s={11} />
        <Star x={14} y={466} s={11} />
        <Star x={986} y={466} s={11} />

        {/* Dotted arcs over and under the letters. */}
        <path d={dottedArc(R1 + 44, 372)} className="sp-dots" />
        <path d={dottedArc(R2 - 40, 312)} className="sp-dots" />

        <SunFace x={104} y={100} s={0.86} />
        <MoonFace x={896} y={100} s={1.2} />

        {/* The eye at the top, watching. */}
        {eyePhoto ? (
          <image href={eyePhoto} x={EYE.x - 110} y={EYE.y - 80} width="220" height="160" />
        ) : (
          <g transform={`translate(${EYE.x} ${EYE.y})`} strokeLinecap="round" strokeLinejoin="round">
            <path d={rays} className="sp-gold-line" strokeWidth="1.2" />
            <g className="sp-blink">
              <path d={EYE_ALMOND} className="sp-eye-white" />
              <g clipPath="url(#sp-eye-clip)">
                <g ref={irisRef}>
                  <circle r="17" className="sp-iris" />
                  <path d={striae} className="sp-gold-line" strokeWidth=".9" />
                  <circle r="7.5" className="sp-pupil" />
                  <circle cx="-4.6" cy="-4.8" r="2.4" className="sp-bone-fill" />
                </g>
              </g>
              <path d={EYE_ALMOND} className="sp-bone-line" strokeWidth="1.6" />
            </g>
            <path d="M-50 -16.5l-5 -6M-34 -24.5l-3 -7.4M-17 -28.5l-1.4 -8M0 -29.6v-8.2M17 -28.5l1.4 -8M34 -24.5l3 -7.4M50 -16.5l5 -6" className="sp-bone-line" strokeWidth="1" />
            <Star x={-98} y={-24} s={20} className="sp-gold-fill sp-twinkle" />
            <Star x={98} y={-24} s={20} className="sp-gold-fill sp-twinkle" style={{ animationDelay: "-1.6s" }} />
            <Star x={-122} y={12} s={10} className="sp-gold-fill sp-twinkle" style={{ animationDelay: "-.8s" }} />
            <Star x={122} y={12} s={10} className="sp-gold-fill sp-twinkle" style={{ animationDelay: "-2.4s" }} />
          </g>
        )}
        <path d="M304 104H362M638 104H696" className="sp-dots" />

        {/* Stars scattered low on the board, and either side of GOODBYE. */}
        <Star x={150} y={392} s={14} className="sp-gold-fill sp-twinkle" style={{ animationDelay: "-.6s" }} />
        <Star x={850} y={392} s={14} className="sp-gold-fill sp-twinkle" style={{ animationDelay: "-2s" }} />
        <Star x={88} y={300} s={8} className="sp-gold-fill sp-twinkle" style={{ animationDelay: "-1.1s" }} />
        <Star x={912} y={300} s={8} className="sp-gold-fill sp-twinkle" style={{ animationDelay: "-3s" }} />
        <path d="M290 438H380M620 438H710" className="sp-gold-line" strokeWidth=".7" opacity=".55" />
        <Star x={276} y={438} s={10} />
        <Star x={724} y={438} s={10} />

        {/* Where the planchette rests. */}
        <circle cx={REST.x} cy={REST.y} r="54" className="sp-dots" opacity=".6" />
      </g>
    </>
  );
}

export const Board = memo(function Board({
  aim,
  disabled,
  onWord,
  onLetter,
  apiRef,
}: {
  /** Where the planchette goes: "rest", "wander", YES/NO/GOODBYE, or one letter or digit. */
  aim: string;
  disabled: boolean;
  onWord: (w: Word) => void;
  onLetter: (c: string) => void;
  apiRef?: Ref<BoardApi>;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const plan = useRef<SVGGElement>(null);
  const lens = useRef<SVGUseElement>(null);
  const iris = useRef<SVGGElement>(null);
  const ripple = useRef<SVGGElement>(null);
  const aimRef = useRef(aim);
  useEffect(() => {
    aimRef.current = aim;
  }, [aim]);

  useImperativeHandle(
    apiRef,
    () => ({
      knock(n: number) {
        const g = ripple.current;
        if (!g || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        Array.from(g.children)
          .slice(0, n)
          .forEach((c, i) =>
            c.animate(
              [
                { transform: "scale(.3)", opacity: 0.85 },
                { transform: "scale(5.5)", opacity: 0 },
              ],
              { duration: 1100, delay: i * 380, easing: "cubic-bezier(.2,.7,.3,1)", fill: "backwards" },
            ),
          );
      },
    }),
    [],
  );

  /* The planchette and the eye, every frame. */
  useEffect(() => {
    const s = svg.current;
    const p = plan.current;
    const l = lens.current;
    if (!s || !p || !l) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const keys: { el: Element; x: number; y: number; r: number }[] = [];
    s.querySelectorAll<SVGElement>("#sp-glyphs [data-key]").forEach((el) => {
      const k = el.dataset.key!;
      const spot = SPOTS[k];
      if (spot) keys.push({ el, x: spot.x, y: spot.y, r: k.length > 1 ? 44 : 24 });
    });

    let x = REST.x;
    let y = REST.y;
    let vx = 0;
    let vy = 0;
    let rot = 0;
    let committed = "rest";
    let lastHop = 0;
    let prev = performance.now();
    let lit: Element | null = null;
    let reading = false;
    let ptr: { x: number; y: number } | null = null;
    let ix = 0;
    let iy = 0;

    const onMove = (e: PointerEvent) => {
      ptr = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const t = now / 1000;

      // Hop to the newest aim, but not faster than a hand could. Back to
      // rest only after a pause, so the last letter can be read.
      const want = aimRef.current;
      if (want !== committed) {
        const wait = want === "rest" && committed !== "wander" ? 1500 : HOP;
        if (now - lastHop > wait) {
          committed = want;
          lastHop = now;
        }
      }

      let tx = REST.x;
      let ty = REST.y;
      let k = 110;
      if (committed === "wander") {
        tx = 500 + 205 * Math.sin(t * 0.85);
        ty = 272 + 64 * Math.sin(t * 1.7 + 0.6);
        k = 14;
      } else if (committed === "rest") {
        tx = REST.x + 4 * Math.sin(t * 0.45);
        ty = REST.y + 3 * Math.sin(t * 0.63);
        k = 36;
      } else {
        const spot = SPOTS[committed];
        if (spot) {
          tx = spot.x + 1.6 * Math.sin(t * 1.9);
          ty = spot.y + 1.6 * Math.cos(t * 1.5);
        }
      }

      if (reduce) {
        x = tx;
        y = ty;
      } else {
        const c = 2 * Math.sqrt(k) * 0.74;
        vx += (k * (tx - x) - c * vx) * dt;
        vy += (k * (ty - y) - c * vy) * dt;
        x += vx * dt;
        y += vy * dt;
      }
      const tilt = Math.max(-11, Math.min(11, vx * 0.028)) + (reduce ? 0 : 1.6 * Math.sin(t * 0.7));
      rot += (tilt - rot) * Math.min(1, dt * 7);

      p.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)})`);
      l.setAttribute("transform", `scale(${MAG}) rotate(${(-rot).toFixed(2)}) translate(${(-x).toFixed(1)} ${(-y).toFixed(1)})`);

      // Light whatever is under the lens.
      let best: Element | null = null;
      let bd = Infinity;
      for (const key of keys) {
        const d = (key.x - x) ** 2 + (key.y - y) ** 2;
        if (d < key.r * key.r && d < bd) {
          bd = d;
          best = key.el;
        }
      }
      if (best !== lit) {
        lit?.removeAttribute("data-on");
        best?.setAttribute("data-on", "");
        lit = best;
      }
      const isReading = committed !== "rest" && committed !== "wander";
      if (isReading !== reading) {
        reading = isReading;
        p.toggleAttribute("data-reading", reading);
      }

      // The eye: it follows you, and watches the planchette while it spells.
      const ir = iris.current;
      if (ir) {
        let gx = 0;
        let gy = 0;
        if (reading) {
          gx = x - EYE.x;
          gy = y - EYE.y;
        } else if (ptr) {
          const m = s.getScreenCTM();
          if (m) {
            gx = ptr.x - (m.a * EYE.x + m.c * EYE.y + m.e);
            gy = ptr.y - (m.b * EYE.x + m.d * EYE.y + m.f);
          }
        }
        const len = Math.hypot(gx, gy) || 1;
        const reach = Math.min(1, len / 260);
        const wx = (gx / len) * reach * 15;
        const wy = (gy / len) * reach * 7;
        const ease = reduce ? 1 : Math.min(1, dt * 9);
        ix += (wx - ix) * ease;
        iy += (wy - iy) * ease;
        ir.setAttribute("transform", `translate(${ix.toFixed(2)} ${iy.toFixed(2)})`);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const press = (fn: () => void) => ({
    onClick: () => !disabled && fn(),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (disabled || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      fn();
    },
  });

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
      className="sp-board"
      data-disabled={disabled || undefined}
      role="group"
      aria-label="The talking board"
    >
      <defs>
        <clipPath id="sp-board-clip">
          <path d={FRAME_IN} />
        </clipPath>
        <clipPath id="sp-eye-clip">
          <path d={EYE_ALMOND} />
        </clipPath>
        <clipPath id="sp-lens-clip">
          <circle r={LENS_R} />
        </clipPath>
        <radialGradient id="sp-board-grad" cx=".5" cy=".42" r=".66">
          <stop offset="0" stopColor="#25201C" />
          <stop offset=".6" stopColor="#191512" />
          <stop offset="1" stopColor="#110E0C" />
        </radialGradient>
        <radialGradient id="sp-glass" cx=".34" cy=".28" r=".7">
          <stop offset="0" stopColor="#FFE2B8" stopOpacity=".3" />
          <stop offset=".45" stopColor="#FFE2B8" stopOpacity=".05" />
          <stop offset="1" stopColor="#FFE2B8" stopOpacity="0" />
        </radialGradient>
        <filter id="sp-lift" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity=".7" />
        </filter>
        {/* Ember: a blurred orange copy behind the shape, like a letter catching light. */}
        <filter id="sp-ember" x="-80%" y="-80%" width="260%" height="260%">
          <feFlood floodColor="#FF6A2B" result="c" />
          <feComposite in="c" in2="SourceAlpha" operator="in" result="s" />
          <feGaussianBlur in="s" stdDeviation="4.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <Engraving irisRef={iris} />

      {/* Everything the planchette can point at. The lens shows a copy of this group, magnified. */}
      <g id="sp-glyphs">
        {GLYPHS.map((g) => (
          <g
            key={g.c}
            data-key={g.c}
            className="sp-key"
            transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)})`}
            {...press(() => onLetter(g.c))}
          >
            <text className="sp-glyph" fontSize={g.size} textAnchor="middle" dominantBaseline="central">
              {g.c}
            </text>
          </g>
        ))}
        {(Object.keys(WORDS) as Word[]).map((w) => {
          const { x, y } = WORDS[w];
          const wide = w === "GOODBYE";
          return (
            <g
              key={w}
              data-key={w}
              className="sp-key sp-word"
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={w === "GOODBYE" ? "Say goodbye and close the circle" : `Point to ${w}`}
              {...press(() => onWord(w))}
            >
              {/* An invisible hit area, so the whole bracket is clickable. */}
              <rect x={x - WORD_W[w] / 2} y={y - (wide ? 20 : 26)} width={WORD_W[w]} height={wide ? 40 : 52} className="sp-hit" />
              <path d={bracket(x, y, WORD_W[w], wide ? 40 : 52, wide ? 9 : 12)} className="sp-bracket" />
              <text x={x} y={y + 1} className="sp-glyph sp-word-t" fontSize={wide ? 26 : 38} textAnchor="middle" dominantBaseline="central">
                {w}
              </text>
            </g>
          );
        })}
      </g>

      <g ref={ripple} transform="translate(500 260)" className="sp-ripples" aria-hidden>
        <circle r="40" />
        <circle r="40" />
        <circle r="40" />
      </g>

      {/* The planchette: smoked glass. */}
      <g ref={plan} className="sp-plan" transform={`translate(${REST.x} ${REST.y})`} aria-hidden>
        <g filter="url(#sp-lift)">
          <PlanchetteBody />
        </g>
        <g clipPath="url(#sp-lens-clip)">
          <circle r={LENS_R} className="sp-lens-back" />
          <use ref={lens} href="#sp-glyphs" />
        </g>
        <circle r={LENS_R} fill="url(#sp-glass)" />
        <circle r={LENS_R} fill="none" className="sp-gold-line sp-lens-ring" strokeWidth="1.6" />
      </g>
    </svg>
  );
});

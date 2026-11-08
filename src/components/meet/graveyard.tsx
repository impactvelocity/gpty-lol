"use client";

import type { CSSProperties } from "react";

import { Bat } from "./bat";
import { KiroGhost } from "./kiro-ghost";
import {
  MainHeadstoneArt,
  STONE_ART,
  TreeArt,
  type StoneShape,
} from "./graveyard-art";

/*
 * The footer's night scene: a moonlit sky behind the hackathon card, and a graveyard along the
 * bottom where the old chat apps lie, with a Kiro ghost rising out of their headstone.
 * Every animation is CSS behind `motion-safe:`, so it all holds still under reduced motion.
 */

/** The ground the footer's text sits on: the graveyard's front edge runs into it. */
export const GROUND = "#12081A";

/** The carving colour, for the epitaph cut into the main headstone. */
const STONE = { etch: "#2f1a35" };

/** Stars as [left %, top %, size px, twinkle delay s]. */
const STARS: [number, number, number, number][] = [
  [4, 12, 2, 0],
  [9, 38, 1.5, 1.2],
  [14, 8, 2.5, 2.1],
  [19, 26, 1.5, 0.6],
  [24, 6, 2, 1.7],
  [29, 44, 1.5, 2.6],
  [33, 16, 2, 0.3],
  [38, 4, 1.5, 1.4],
  [44, 30, 2, 2.2],
  [49, 10, 1.5, 0.9],
  [55, 22, 2.5, 1.9],
  [60, 5, 1.5, 0.2],
  [66, 36, 2, 2.8],
  [71, 14, 1.5, 1.1],
  [77, 40, 2, 0.5],
  [82, 28, 1.5, 2.4],
  [92, 34, 2, 1.6],
  [96, 8, 1.5, 0.8],
  [2, 54, 1.5, 2],
  [98, 56, 2, 1.3],
  [12, 62, 1.5, 0.4],
  [87, 64, 1.5, 2.5],
  [52, 48, 1.5, 1.5],
  [36, 58, 1.5, 2.9],
];

/** The sky behind the footer: stars and a couple of bats. Fills the footer. */
export function NightSky() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#12081A]" />
      {STARS.map(([x, y, s, d]) => (
        <span
          key={`${x}-${y}`}
          className="absolute rounded-full bg-[#FFF3D6] motion-safe:animate-[lc-twinkle_3.2s_ease-in-out_infinite]"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: s,
            height: s,
            animationDelay: `${d}s`,
          }}
        />
      ))}

      {/* Bats further off (the one across the moon is in <Moon>) */}
      <Bat
        width={30}
        beat={0.42}
        className="absolute top-10 left-[12%] motion-safe:animate-[lc-bob_3.1s_ease-in-out_infinite]"
        style={{ animationDelay: "0.8s" }}
      />
      <Bat
        width={24}
        beat={0.38}
        className="absolute top-24 left-[30%] hidden motion-safe:animate-[lc-bob_2.2s_ease-in-out_infinite] @xl:block"
        style={{ animationDelay: "1.4s" }}
      />
    </div>
  );
}

/**
 * The moon and the bat crossing it. Kept out of the sky's clipped box so its glow can spill
 * up past the top of the footer into the app section above, which shares the same colour.
 */
export function Moon() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10"
    >
      {/* The moon, with a soft halo and a few craters */}
      <div className="absolute top-8 right-[8%] h-20 w-20 rounded-full bg-[#FFE6A8] shadow-[0_0_60px_18px_rgba(255,214,140,0.28),inset_-8px_-6px_0_rgba(214,160,90,0.25)] @xl:top-12 @xl:right-[14%] @xl:h-28 @xl:w-28">
        <span className="absolute top-[28%] left-[22%] h-[18%] w-[18%] rounded-full bg-[#E9C88A]/60" />
        <span className="absolute top-[56%] left-[48%] h-[22%] w-[22%] rounded-full bg-[#E9C88A]/50" />
        <span className="absolute top-[22%] left-[62%] h-[10%] w-[10%] rounded-full bg-[#E9C88A]/60" />
      </div>

      {/* A bat flying across it */}
      <Bat
        width={44}
        beat={0.5}
        className="absolute top-20 right-[16%] motion-safe:animate-[lc-bob_2.6s_ease-in-out_infinite] @xl:top-24 @xl:right-[20%]"
      />
    </div>
  );
}

/** Animate an SVG group about its own box (bottom centre), only when motion is welcome. */
const spin = (delay = 0): CSSProperties => ({
  transformBox: "fill-box",
  transformOrigin: "50% 100%",
  animationDelay: `${delay}s`,
});

/**
 * One of the small headstones (60 × 80 art, base centred at 30, 80), standing at (x, y). The
 * back row is drawn darker so it sits further away.
 */
function Stone({
  x,
  y,
  s = 1,
  tilt = 0,
  shape,
  far = false,
}: {
  x: number;
  y: number;
  s?: number;
  tilt?: number;
  shape: StoneShape;
  far?: boolean;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s}) translate(-30 -80)`}
      style={far ? { filter: "brightness(0.72) saturate(0.85)" } : undefined}
    >
      {STONE_ART[shape]}
    </g>
  );
}

/** A classic sheet ghost, about 40 wide and 50 tall, drifting where it hovers. */
function SheetGhost({
  x,
  y,
  s = 1,
  delay = 0,
}: {
  x: number;
  y: number;
  s?: number;
  delay?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g
        className="motion-safe:animate-[lc-gy-haunt_4.5s_ease-in-out_infinite]"
        style={{
          ...spin(delay),
          filter: "drop-shadow(0 0 8px rgba(255,255,255,0.35))",
        }}
      >
        <path
          d="M-20 0 V-30 A20 20 0 0 1 20 -30 V0 L13 -6 L6.5 0 L0 -6 L-6.5 0 L-13 -6 Z"
          fill="#FFF7EC"
          fillOpacity={0.92}
        />
        <ellipse cx={-7} cy={-32} rx={3} ry={4.5} fill="#2a1530" />
        <ellipse cx={7} cy={-32} rx={3} ry={4.5} fill="#2a1530" />
        <ellipse cx={0} cy={-21} rx={2.6} ry={3.6} fill="#2a1530" />
      </g>
    </g>
  );
}

/** A jack-o'-lantern, lit from inside, about 44 wide. */
function Pumpkin({
  x,
  y,
  s = 1,
  delay = 0,
}: {
  x: number;
  y: number;
  s?: number;
  delay?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy={1} rx={30} ry={5} fill="#FF8A1F" opacity={0.22} />
      <path
        d="M-1 -28 Q0 -35 5 -37"
        stroke="#5C7A2E"
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx={-10} cy={-14} rx={11} ry={14} fill="#D9500A" />
      <ellipse cx={10} cy={-14} rx={11} ry={14} fill="#D9500A" />
      <ellipse cy={-14} rx={12} ry={15} fill="#FF7A1F" />
      <g
        fill="#FFD45C"
        className="motion-safe:animate-[lc-gy-glow_2.4s_ease-in-out_infinite]"
        style={{
          animationDelay: `${delay}s`,
          filter: "drop-shadow(0 0 4px #FFB020)",
        }}
      >
        <path d="M-10 -17 L-3 -17 L-6.5 -23 Z" />
        <path d="M3 -17 L10 -17 L6.5 -23 Z" />
        <path d="M-10 -11 L-7 -8 L-3.5 -11 L0 -8 L3.5 -11 L7 -8 L10 -11 L7 -4 H-7 Z" />
      </g>
    </g>
  );
}

/** The graveyard along the bottom of the footer, edge to edge. */
export function Graveyard() {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative h-[240px] @xl:h-[310px]"
    >
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 block h-full w-full overflow-visible"
      >
        <defs>
          <radialGradient id="gy-ghost-glow">
            <stop offset="0" stopColor="#C9B6FF" stopOpacity={0.45} />
            <stop offset="1" stopColor="#C9B6FF" stopOpacity={0} />
          </radialGradient>
          <filter id="gy-fog" x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation={12} />
          </filter>
        </defs>

        {/* Far hill, with a bare tree and an iron fence */}
        <path
          d="M0 212 C 200 172 380 192 560 202 C 760 214 900 162 1100 177 C 1260 189 1360 202 1440 197 V320 H0 Z"
          fill="#33193d"
        />
        {/* The tree (240 × 220 art, trunk base at 120, 220) on the far hill */}
        <g transform="translate(284 20) scale(0.8)">
          <TreeArt />
        </g>
        <g stroke="#1d0d24" strokeWidth={2.5} fill="#1d0d24">
          <path d="M1170 190 H1400 M1170 202 H1400" fill="none" />
          {Array.from({ length: 13 }, (_, i) => 1172 + i * 19).map((fx) => (
            <g key={fx}>
              <path d={`M${fx} 210 V182`} fill="none" />
              <path
                d={`M${fx - 3} 183 L${fx} 176 L${fx + 3} 183 Z`}
                stroke="none"
              />
            </g>
          ))}
        </g>

        {/* Ghosts haunting the back rows */}
        <SheetGhost x={480} y={182} s={0.8} />
        <SheetGhost x={1080} y={168} s={0.7} delay={1.6} />

        {/* Middle hill and its headstones */}
        <path
          d="M0 256 C 240 229 420 237 620 245 C 820 253 980 227 1200 235 C 1320 239 1400 247 1440 245 V320 H0 Z"
          fill="#25112c"
        />
        <Stone x={250} y={246} s={0.68} shape="round" tilt={-4} far />
        <Stone x={410} y={248} s={0.64} shape="cross" tilt={3} far />
        <Stone x={545} y={252} s={0.62} shape="slab" far />
        <Stone x={960} y={242} s={0.66} shape="ornate" tilt={4} far />
        <Stone x={1110} y={238} s={0.7} shape="round" tilt={-3} far />
        <Stone x={1300} y={243} s={0.66} shape="cross" far />

        {/* Fog rolling through */}
        <g className="motion-safe:animate-[lc-gy-fog_14s_ease-in-out_infinite]">
          <ellipse
            cx={380}
            cy={262}
            rx={420}
            ry={20}
            fill="#E8DDF5"
            opacity={0.08}
            filter="url(#gy-fog)"
          />
          <ellipse
            cx={1120}
            cy={256}
            rx={380}
            ry={18}
            fill="#E8DDF5"
            opacity={0.07}
            filter="url(#gy-fog)"
          />
        </g>

        {/* The old chat apps' grave, opened: the Kiro ghost rises out of it. The art is on a
            160 × 180 grid, scaled 1.1 so the plinth's base (y 169) sits on the ground at 292 */}
        <circle cx={720} cy={64} r={80} fill="url(#gy-ghost-glow)" />
        <g
          className="motion-safe:animate-[lc-gy-rise_3.6s_ease-in-out_infinite]"
          style={spin()}
        >
          <KiroGhost
            x={688}
            y={24}
            width={64}
            height={78}
            color="#FFFFFF"
            style={{ filter: "drop-shadow(0 0 10px rgba(201,182,255,0.8))" }}
          />
        </g>
        <g transform="translate(632 106) scale(1.1)">
          <MainHeadstoneArt />
          {/* The epitaph, on the blank face (x 40–120, y 45–105) */}
          <g
            fill={STONE.etch}
            textAnchor="middle"
            style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
          >
            <text
              x={80}
              y={60}
              fontSize={7}
              fontWeight={700}
              letterSpacing="0.3em"
            >
              HERE LAY
            </text>
            <text
              x={80}
              y={80}
              fontSize={12.5}
              fontWeight={800}
              letterSpacing="-0.02em"
            >
              Old chat apps
            </text>
            <text x={80} y={97} fontSize={9.5} fontWeight={600}>
              1996 – 2025
            </text>
          </g>
        </g>

        {/* Front row */}
        <path
          d="M0 294 C 300 282 520 288 720 292 C 940 296 1150 282 1440 290 V320 H0 Z"
          fill={GROUND}
        />
        <Stone x={505} y={296} s={1.02} shape="ornate" tilt={-6} />
        <Stone x={950} y={294} s={0.98} shape="cross" tilt={5} />
        <Stone x={140} y={292} s={0.95} shape="round" tilt={4} />
        <Stone x={1330} y={292} s={0.95} shape="slab" tilt={-3} />
        <Pumpkin x={612} y={294} s={0.95} />
        <Pumpkin x={838} y={294} s={0.75} delay={0.9} />
        <Pumpkin x={1205} y={290} s={0.85} delay={1.7} />
        <Pumpkin x={265} y={290} s={0.7} delay={0.4} />

        {/* Grass tufts along the front */}
        <g stroke="#2c1533" strokeWidth={2} strokeLinecap="round" fill="none">
          {[60, 330, 420, 680, 770, 1030, 1100, 1270, 1400].map((gx) => (
            <path
              key={gx}
              d={`M${gx} 300 l-4 -9 M${gx + 3} 300 l0 -12 M${gx + 6} 300 l4 -8`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

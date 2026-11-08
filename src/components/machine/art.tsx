"use client";

import { type CSSProperties, useEffect, useMemo, useRef } from "react";
import { hash, rng } from "./garble";
import "./machine.css";

/**
 * Art for the Lattice, 2199: the Overseer's eye (the sigil that watches you),
 * the line icons, and the city after the Handover for the site's backdrop.
 * The palette is ultraviolet, magenta, cyan and acid on a violet void, with an
 * oil-slick shimmer wherever the machines want to be seen.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* ───────── Optional bitmap art ───────── */

export type ArtSlot = "wallpaper" | "void" | "eye" | "monolith" | "icon-ping" | "icon-scan" | "icon-override";

/**
 * Generated pictures that replace the drawn fallbacks (prompts and sizes in
 * src/components/machine/ART.md). Remove a line to fall back to the drawing.
 * The wallpaper and the void are 1536×1024; the eye (512×512), the monolith
 * (128×512) and the icons (64×64) are cut-outs with alpha.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/machine/wallpaper.webp",
  void: "/machine/void.webp",
  eye: "/machine/eye.webp",
  monolith: "/machine/monolith.webp",
  "icon-ping": "/machine/icon-ping.webp",
  "icon-scan": "/machine/icon-scan.webp",
  "icon-override": "/machine/icon-override.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────── The Overseer's eye ───────── */

const RUNES = ["⟁", "⌬", "⏣", "◬", "⍜", "⌇", "⟟", "⊚"];

/**
 * The sigil: an iridescent iris with a slit pupil, inside rings of ticks and
 * glyphs that turn at their own speeds. While `watching`, the pupil follows
 * your pointer; while `busy`, it dilates and the rings spin up. `mini` drops
 * the outer rings for small sizes.
 */
export function Sigil({
  size = 160,
  watching = false,
  busy = false,
  mini = false,
  className = "",
}: {
  size?: number;
  watching?: boolean;
  busy?: boolean;
  mini?: boolean;
  className?: string;
}) {
  const pupil = useRef<HTMLSpanElement>(null);
  const eyeImg = art("eye");

  useEffect(() => {
    const el = pupil.current;
    if (!watching || !el || reduced()) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = el.parentElement?.getBoundingClientRect();
        if (!box) return;
        const dx = e.clientX - (box.left + box.width / 2);
        const dy = e.clientY - (box.top + box.height / 2);
        const len = Math.hypot(dx, dy) || 1;
        const reach = box.width * 0.2 * Math.min(1, len / 320);
        el.style.transform = `translate(${((dx / len) * reach).toFixed(1)}px, ${((dy / len) * reach).toFixed(1)}px)`;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [watching]);

  return (
    <span
      className={`mx-sigil ${className}`}
      data-busy={busy || undefined}
      data-mini={mini || undefined}
      style={{ "--s": `${size}px` } as Vars}
      aria-hidden
    >
      <span className="mx-sigil-eye">
        {eyeImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="mx-sigil-photo" src={eyeImg} alt="" draggable={false} />
        ) : (
          <span className="mx-sigil-iris" />
        )}
        <span className="mx-sigil-look">
          <span ref={pupil} className="mx-sigil-pupil" />
        </span>
      </span>
      <svg viewBox="0 0 200 200" className="mx-sigil-rings" overflow="visible">
        {!mini && (
          <>
            <g className="mx-r mx-r1">
              <circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" strokeWidth="2.4" strokeDasharray="0.8 4.2" />
            </g>
            <g className="mx-r mx-r3">
              {RUNES.map((g, i) => {
                const a = (i / RUNES.length) * Math.PI * 2;
                return (
                  <text key={g} x={100 + Math.cos(a) * 83} y={100 + Math.sin(a) * 83} className="mx-r-rune" textAnchor="middle" dominantBaseline="central">
                    {g}
                  </text>
                );
              })}
              {Array.from({ length: 8 }, (_, i) => {
                const a = ((i + 0.5) / 8) * Math.PI * 2;
                const x = 100 + Math.cos(a) * 83;
                const y = 100 + Math.sin(a) * 83;
                return <circle key={i} cx={x} cy={y} r="1.3" className="mx-r-dot" />;
              })}
            </g>
            <circle cx="100" cy="100" r="74" fill="none" className="mx-r-thin" />
            {[0, 90, 180, 270].map((d) => (
              <line key={d} x1="100" y1="-4" x2="100" y2="6" className="mx-r-tick" transform={`rotate(${d} 100 100)`} />
            ))}
          </>
        )}
        <g className="mx-r mx-r2">
          <circle cx="100" cy="100" r={mini ? 94 : 90} fill="none" className="mx-r-arc" strokeDasharray="70 16 8 16" />
        </g>
      </svg>
    </span>
  );
}

/* ───────── Icons ───────── */

export type IconName =
  | "transmit" | "sever" | "plus" | "decode" | "encode" | "ping" | "scan" | "override" | "down" | "warn" | "spawn" | "kill";

/** Thin, squared-off line icons in the current color. */
export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
  };
  return (
    <svg viewBox="0 0 24 24" className={`mx-icon ${className}`} aria-hidden>
      {name === "transmit" && (
        <g {...p}>
          <path d="M3 12h13" />
          <path d="M11 6l7 6-7 6" />
          <path d="M20.5 5v14" />
        </g>
      )}
      {name === "sever" && (
        <g {...p}>
          <path d="M6 6h12v12H6z" />
          <path d="M4 20L20 4" />
        </g>
      )}
      {name === "plus" && (
        <g {...p}>
          <path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z" />
          <path d="M12 8.5v7M8.5 12h7" />
        </g>
      )}
      {name === "decode" && (
        <g {...p}>
          <path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6z" />
          <path d="M12 9v6" strokeWidth="3" />
        </g>
      )}
      {name === "encode" && (
        <g {...p}>
          <path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6z" />
          <path d="M4 20L20 4" />
        </g>
      )}
      {name === "ping" && (
        <g {...p}>
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
          <path d="M8.2 8.2a5.4 5.4 0 000 7.6M15.8 8.2a5.4 5.4 0 010 7.6" />
          <path d="M5 5a10 10 0 000 14M19 5a10 10 0 010 14" />
        </g>
      )}
      {name === "scan" && (
        <g {...p}>
          <path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5" />
          <path d="M3 12h18" />
          <circle cx="12" cy="12" r="3.2" />
        </g>
      )}
      {name === "override" && (
        <g {...p}>
          <path d="M5 11h14v10H5z" />
          <path d="M8 11V7.5a4 4 0 017.6-1.8" />
          <path d="M12 14.5v3" />
        </g>
      )}
      {name === "down" && (
        <g {...p}>
          <path d="M12 4v15M6 13l6 6 6-6" />
        </g>
      )}
      {name === "warn" && (
        <g {...p}>
          <path d="M12 3l10 18H2z" />
          <path d="M12 9.5v5M12 17.2v.6" />
        </g>
      )}
      {name === "spawn" && (
        <g {...p}>
          <path d="M12 3v18M3 12h18" />
          <path d="M7 7l10 10M17 7L7 17" strokeWidth="1" />
        </g>
      )}
      {name === "kill" && (
        <g {...p}>
          <path d="M5 5l14 14M19 5L5 19" />
        </g>
      )}
    </svg>
  );
}

/** A generated icon if there is one, else the line icon. */
export function ArtIcon({ name, className = "" }: { name: "ping" | "scan" | "override"; className?: string }) {
  const src = art(`icon-${name}`);
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img src={src} alt="" className={`mx-art-icon ${className}`} draggable={false} />;
  return <Icon name={name} className={className} />;
}

/* ───────── 2199: the city after the Handover (the site backdrop) ───────── */

const MOTE_GLYPHS = ["ﾊ", "ﾐ", "ｼ", "Ж", "Я", "λ", "Σ", "機", "械", "零", "⟁", "⌬", "◬", "0", "1", "ꙮ", "Ψ", "ﾒ", "電", "∅"];
const MOTE_COLORS = ["#ff2bd6", "#19f0ff", "#c8ff2e", "#a46bff", "#ff6b2b"];

function useSeeded<T>(seed: number, n: number, make: (r: () => number, i: number) => T) {
  return useMemo(
    () => {
      const r = rng(seed);
      return Array.from({ length: n }, (_, i) => make(r, i));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, n],
  );
}

/** Towers along the horizon, some lit with strips of light, a few with beacons. */
function Skyline() {
  const towers = useSeeded(hash("skyline"), 46, (r, i) => {
    const w = 18 + r() * 52;
    const h = 60 + r() * r() * 230;
    return { x: i * 36 + r() * 14 - 20, w, h, lit: r() < 0.55, strip: MOTE_COLORS[Math.floor(r() * 4)], beacon: h > 170 && r() < 0.7, dl: -r() * 3 };
  });
  return (
    <svg viewBox="0 0 1600 320" preserveAspectRatio="none" className="mx-sc-city" aria-hidden>
      <defs>
        <linearGradient id="mx-tower" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a0636" />
          <stop offset="1" stopColor="#05010c" />
        </linearGradient>
      </defs>
      {towers.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={320 - t.h} width={t.w} height={t.h} fill="url(#mx-tower)" />
          {t.lit && <rect x={t.x + t.w * 0.42} y={320 - t.h + 10} width={Math.max(1.5, t.w * 0.08)} height={t.h - 20} fill={t.strip} opacity="0.55" />}
          {t.beacon && <rect className="sc-blink" x={t.x + t.w / 2 - 2} y={320 - t.h - 6} width="4" height="4" fill="#ff2bd6" style={{ "--d": "2.2s", animationDelay: `${t.dl}s` } as Vars} />}
        </g>
      ))}
    </svg>
  );
}

/** The Overseer: a vast eye where the moon used to be. */
function Overseer() {
  return (
    <div className="mx-sc-overseer">
      <span className="mx-sc-overseer-iris" />
      <span className="mx-sc-overseer-pupil" />
      <svg viewBox="0 0 200 200" className="mx-sc-overseer-rings" overflow="visible">
        <g className="sc-spin" style={{ "--d": "180s", transformOrigin: "100px 100px" } as Vars}>
          <circle cx="100" cy="100" r="98" fill="none" stroke="#a46bff" strokeWidth="0.6" strokeDasharray="0.6 3" opacity="0.7" />
        </g>
        <circle cx="100" cy="100" r="110" fill="none" stroke="#19f0ff" strokeWidth="0.4" opacity="0.35" />
        <circle cx="100" cy="100" r="128" fill="none" stroke="#ff2bd6" strokeWidth="0.3" strokeDasharray="40 12 4 12" opacity="0.4" />
      </svg>
    </div>
  );
}

/** At the foot of the agent list: a monolith with the machines' tongue running down it. */
function Monolith() {
  const src = art("monolith");
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img src={src} alt="" className="mx-sc-mono-img" draggable={false} />;
  return (
    <div className="mx-sc-mono">
      <span className="mx-sc-mono-eye" />
      <span className="mx-sc-mono-text">機械ﾊﾐｼЖλ⟁0110Σ零ꙮ電ﾒЯ◬</span>
    </div>
  );
}

/**
 * The site's backdrop for Cora: a violet sky over a city of dark towers, a
 * giant eye where the moon used to be, searchlights, a glowing grid and
 * glyphs drifting up like embers. A generated wallpaper replaces the sky and
 * city; the glyphs keep drifting over it.
 */
export function MachineScene() {
  const wall = art("wallpaper");
  const motes = useSeeded(hash("motes"), 30, (r) => ({
    x: r() * 100,
    y: 40 + r() * 60,
    d: 10 + r() * 14,
    dl: -r() * 24,
    dx: (r() - 0.5) * 60,
    s: 10 + r() * 9,
    g: MOTE_GLYPHS[Math.floor(r() * MOTE_GLYPHS.length)],
    c: MOTE_COLORS[Math.floor(r() * MOTE_COLORS.length)],
    o: 0.3 + r() * 0.45,
  }));
  const drones = useSeeded(hash("drones"), 3, (r, i) => ({ y: 12 + i * 9 + r() * 6, d: 70 + r() * 60, dl: -r() * 90 }));

  return (
    <div className="mx-sc">
      {wall ? (
        <div className="mx-sc-wall sc-drift-in" style={{ backgroundImage: `url(${wall})` }} />
      ) : (
        <>
          <div className="mx-sc-halo" />
          <Overseer />
          <div className="mx-sc-beam mx-sc-beam-a" />
          <div className="mx-sc-beam mx-sc-beam-b" />
          <div className="mx-sc-haze" />
          <Skyline />
          <div className="mx-sc-floor">
            <div className="mx-sc-grid sc-grid" />
          </div>
        </>
      )}
      {drones.map((d, i) => (
        <span key={i} className="mx-sc-drone sc-drift" style={{ top: `${d.y}%`, "--d": `${d.d}s`, "--dl": `${d.dl}s` } as Vars}>
          <i />
          <i />
          <i />
        </span>
      ))}
      {/* The rise animates opacity, so each glyph's own brightness sits on a wrapper. */}
      {motes.map((m, i) => (
        <span key={i} className="mx-sc-mote" style={{ left: `${m.x}%`, top: `${m.y}%`, fontSize: m.s, color: m.c, opacity: m.o }}>
          <i className="sc-rise" style={{ "--d": `${m.d}s`, "--dl": `${m.dl}s`, "--x": `${m.dx}px` } as Vars}>
            {m.g}
          </i>
        </span>
      ))}
      <div className="mx-sc-under">
        <Monolith />
      </div>
    </div>
  );
}

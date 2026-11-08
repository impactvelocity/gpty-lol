"use client";

import { useId } from "react";
import { art } from "./art";
import type { Sym } from "./engine";

/**
 * The reel symbols, drawn the way slot symbols are: chunky, glossy, one bold
 * outline, readable at 20px and handsome at 80. The fruit machine's cherries,
 * bells and BARs, swapped for what people pull AI for: a page of text, an
 * airmail envelope, a framed (generated) picture, a code window, a slide deck,
 * a BAR that's a bar chart, a quill for poems, a bug where the lemon used to
 * be, and AGI in the jackpot burst.
 */

const INK = "#2b0710";
const SIGN = "var(--font-lk-sign), Bungee, 'Arial Black', Impact, sans-serif";

/** A twelve-point jackpot burst around (32, 32). */
const STAR = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
  const r = i % 2 ? 22.5 : 30;
  return `${i ? "L" : "M"}${(32 + Math.cos(a) * r).toFixed(2)} ${(32 + Math.sin(a) * r).toFixed(2)}`;
}).join("") + "Z";

export function SymbolArt({ sym, className = "" }: { sym: Sym; className?: string }) {
  // Gradient ids must be unique per drawing, and safe inside url(#…).
  const u = `sl${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const line = { stroke: INK, strokeWidth: 2.8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const src = art(`sym-${sym}`);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`lk-sym ${className}`} data-sym={sym} draggable={false} />;
  }
  return (
    <svg viewBox="0 0 64 64" className={`lk-sym ${className}`} data-sym={sym} aria-hidden overflow="visible">
      {sym === "text" && (
        <>
          <defs>
            <linearGradient id={`${u}p`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#f1e4c8" />
            </linearGradient>
          </defs>
          <path d="M17 5h21l13 13v38a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z" fill={`url(#${u}p)`} {...line} />
          <path d="M19.5 33.5h26" stroke="#ff3d8b" strokeOpacity=".38" strokeWidth="7.5" strokeLinecap="round" />
          <path d="M20 26h20M20 33.5h25M20 41h22M20 48.5h14" stroke="#3563e9" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M38 5v9a4 4 0 0 0 4 4h9" fill="#e6d3ad" {...line} />
          <path d="M17.6 10v41" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".9" />
        </>
      )}

      {sym === "email" && (
        <>
          <rect x="5" y="13" width="54" height="38" rx="5" fill="#fffaf0" {...line} />
          <rect x="9.5" y="17.5" width="45" height="29" rx="2.5" fill="none" stroke="#e8283c" strokeWidth="3.4" strokeDasharray="5.4 5.4" />
          <rect x="9.5" y="17.5" width="45" height="29" rx="2.5" fill="none" stroke="#2f6bff" strokeWidth="3.4" strokeDasharray="5.4 5.4" strokeDashoffset="5.4" />
          <path d="M7.5 49l17-14.5M56.5 49l-17-14.5" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity=".5" />
          <path d="M7 16.5l25 19 25-19" fill="#fff6e4" {...line} />
          <circle cx="32" cy="35.5" r="7.2" fill="#e8283c" stroke={INK} strokeWidth="2.4" />
          <path d="M32 39.6l-3.7-3.6a2.4 2.4 0 0 1 3.7-3a2.4 2.4 0 0 1 3.7 3Z" fill="#ffd3d9" />
        </>
      )}

      {sym === "image" && (
        <>
          <defs>
            <linearGradient id={`${u}f`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff0a8" />
              <stop offset=".45" stopColor="#ffc533" />
              <stop offset="1" stopColor="#c4840f" />
            </linearGradient>
            <linearGradient id={`${u}s`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6d55ff" />
              <stop offset=".55" stopColor="#ff6fa8" />
              <stop offset="1" stopColor="#ffc46b" />
            </linearGradient>
          </defs>
          <rect x="6" y="10" width="52" height="45" rx="5" fill={`url(#${u}f)`} {...line} />
          <rect x="12.5" y="16.5" width="39" height="32" rx="2" fill={`url(#${u}s)`} stroke={INK} strokeWidth="2.2" />
          <circle cx="40.5" cy="27" r="5.5" fill="#fff4b8" />
          <path d="M12.5 48.5l11-14 6.5 8 5.5-6 15.5 12Z" fill="#22b46a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M23.5 34.5l3.2 4-3.2-1-3.2 1Z" fill="#fff" />
          <path d="M13 3.6l2 4.4 4.4 2-4.4 2-2 4.4-2-4.4-4.4-2 4.4-2Z" fill="#fff" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M54 50.5l1.3 2.7 2.7 1.3-2.7 1.3-1.3 2.7-1.3-2.7-2.7-1.3 2.7-1.3Z" fill="#fff" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        </>
      )}

      {sym === "code" && (
        <>
          <defs>
            <linearGradient id={`${u}c`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3d43a0" />
              <stop offset="1" stopColor="#14173f" />
            </linearGradient>
          </defs>
          <rect x="5" y="9" width="54" height="46" rx="9" fill={`url(#${u}c)`} {...line} />
          <path d="M6.4 20.5h51.2" stroke={INK} strokeWidth="2.2" />
          <circle cx="13" cy="14.8" r="2.4" fill="#ff5f57" />
          <circle cx="20" cy="14.8" r="2.4" fill="#febc2e" />
          <circle cx="27" cy="14.8" r="2.4" fill="#28c840" />
          <path d="M23 28.5l-8 9 8 9M41 28.5l8 9-8 9" fill="none" stroke="#3dff8f" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M35.6 26.5l-7.2 22" stroke="#ff4f9a" strokeWidth="4.4" strokeLinecap="round" />
          <path d="M10.5 25v24" stroke="#fff" strokeOpacity=".22" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}

      {sym === "deck" && (
        <>
          <path d="M32 44v5M32 47.5L20 60M32 47.5L44 60" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
          <rect x="6" y="6" width="52" height="39" rx="4" fill="#fffdf7" {...line} />
          <path d="M6 10a4 4 0 0 1 4-4h44a4 4 0 0 1 4 4v5H6Z" fill="#ff8a1f" {...line} />
          <g stroke={INK} strokeWidth="1.6">
            <rect x="12.5" y="33" width="7" height="6.5" rx="1" fill="#3563e9" />
            <rect x="22.5" y="29" width="7" height="10.5" rx="1" fill="#ff3d8b" />
            <rect x="32.5" y="25" width="7" height="14.5" rx="1" fill="#ffc533" />
            <rect x="42.5" y="21" width="7" height="18.5" rx="1" fill="#3dd17a" />
          </g>
          <path d="M11 29l11-5.5 9 2 15-8" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 29l11-5.5 9 2 15-8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M44.5 15.5l6 1.2-2.6 5.6" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {sym === "chart" && (
        <>
          <defs>
            <linearGradient id={`${u}b`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3b3438" />
              <stop offset="1" stopColor="#0b0809" />
            </linearGradient>
            <linearGradient id={`${u}g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff3c4" />
              <stop offset=".5" stopColor="#ffc533" />
              <stop offset="1" stopColor="#c4840f" />
            </linearGradient>
          </defs>
          <rect x="4" y="9" width="56" height="46" rx="7" fill={`url(#${u}b)`} {...line} />
          <rect x="7.6" y="12.6" width="48.8" height="38.8" rx="4.5" fill="none" stroke={`url(#${u}g)`} strokeWidth="2" />
          <text x="32" y="26.6" textAnchor="middle" fontSize="12.5" letterSpacing="1" fill={`url(#${u}g)`} style={{ fontFamily: SIGN }}>
            BAR
          </text>
          <g stroke={INK} strokeWidth="1.4">
            <rect x="15" y="38" width="8.5" height="9.5" rx="1" fill="#3dff8f" />
            <rect x="28" y="33" width="8.5" height="14.5" rx="1" fill="#ffc533" />
            <rect x="41" y="29" width="8.5" height="18.5" rx="1" fill="#ff3d5a" />
          </g>
          <path d="M12 47.8h40" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}

      {sym === "poem" && (
        <>
          <path d="M15 45h24l3 11a2 2 0 0 1-2 2.5H14a2 2 0 0 1-2-2.5Z" fill="#6b3cff" {...line} />
          <rect x="18" y="40" width="18" height="6" rx="2" fill="#3a1d9a" stroke={INK} strokeWidth="2.4" />
          <path d="M17 49.5l-1.4 5.5" stroke="#fff" strokeOpacity=".55" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M27 42C31 31 39 17 55 5c-1.5 13-9 26-24 37Z" fill="#ffffff" {...line} strokeWidth="2.6" />
          <path d="M33.5 33.5l6.5-1.5M37.5 26.5l7-2M42 19.5l6.5-2.5" stroke="#b8a6ff" strokeWidth="2" strokeLinecap="round" />
          <path d="M28 41C34 30 42 17 53.5 7" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="27" r="4.2" fill="#ff3d8b" stroke={INK} strokeWidth="2" />
          <path d="M15.8 27V12.5l7.5 3" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {sym === "bug" && (
        <>
          <defs>
            <radialGradient id={`${u}g`} cx=".38" cy=".3" r=".8">
              <stop offset="0" stopColor="#9dffbe" />
              <stop offset=".55" stopColor="#2fd36b" />
              <stop offset="1" stopColor="#13863f" />
            </radialGradient>
          </defs>
          <path d="M21 31l-10-6M20 39H8M22 47l-9 7M43 31l10-6M44 39h12M42 47l9 7" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M28.5 13.5c-2-4.5-5-6.5-10-6.5M35.5 13.5c2-4.5 5-6.5 10-6.5" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="18" cy="7" r="2.6" fill="#ff3d8b" stroke={INK} strokeWidth="1.6" />
          <circle cx="46" cy="7" r="2.6" fill="#ff3d8b" stroke={INK} strokeWidth="1.6" />
          <ellipse cx="32" cy="39" rx="14" ry="17" fill={`url(#${u}g)`} {...line} />
          <path d="M32 25v30.5" stroke={INK} strokeWidth="2.2" />
          <g fill="#13863f">
            <circle cx="25.5" cy="36" r="2.6" />
            <circle cx="38.5" cy="44" r="3" />
            <circle cx="26.5" cy="47.5" r="2" />
            <circle cx="39" cy="33" r="2" />
          </g>
          <ellipse cx="25.5" cy="31" rx="2.6" ry="5" fill="#fff" opacity=".4" transform="rotate(24 25.5 31)" />
          <circle cx="32" cy="19.5" r="8" fill="#1d6b3a" {...line} strokeWidth="2.6" />
          <circle cx="28.7" cy="18.6" r="2.7" fill="#fff" />
          <circle cx="35.3" cy="18.6" r="2.7" fill="#fff" />
          <circle cx="29.3" cy="19.3" r="1.25" fill={INK} />
          <circle cx="34.7" cy="19.3" r="1.25" fill={INK} />
        </>
      )}

      {sym === "agi" && (
        <>
          <defs>
            <radialGradient id={`${u}g`} cx=".4" cy=".35" r=".75">
              <stop offset="0" stopColor="#fff6c4" />
              <stop offset=".5" stopColor="#ffc533" />
              <stop offset="1" stopColor="#c27c0e" />
            </radialGradient>
            <linearGradient id={`${u}r`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ff4a5e" />
              <stop offset="1" stopColor="#a30a22" />
            </linearGradient>
          </defs>
          <path d={STAR} fill={`url(#${u}g)`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
          <circle cx="32" cy="32" r="17.5" fill={`url(#${u}r)`} stroke={INK} strokeWidth="2.6" />
          <circle cx="32" cy="32" r="14" fill="none" stroke="#ffd968" strokeWidth="1.6" strokeDasharray="0.1 3.4" strokeLinecap="round" />
          <text
            x="32"
            y="36.6"
            textAnchor="middle"
            fontSize="12.5"
            fill="#fff6d0"
            stroke={INK}
            strokeWidth="2.6"
            strokeLinejoin="round"
            paintOrder="stroke"
            style={{ fontFamily: SIGN }}
          >
            AGI
          </text>
          <ellipse cx="25" cy="24.5" rx="5" ry="2.6" fill="#fff" opacity=".35" transform="rotate(-30 25 24.5)" />
        </>
      )}
    </svg>
  );
}

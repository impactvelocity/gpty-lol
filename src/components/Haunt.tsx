"use client";

import { useEffect, useState } from "react";

/** Cobweb in one corner. Mirrored with CSS transforms for the others. */
function Web({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`pointer-events-none absolute h-24 w-24 text-white/15 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      aria-hidden
    >
      <path d="M0 0 L100 0 M0 0 L90 40 M0 0 L65 65 M0 0 L40 90 M0 0 L0 100" />
      <path d="M22 0 Q18 18 0 22 M45 0 Q38 38 0 45 M70 0 Q58 58 0 70 M95 0 Q78 78 0 95" />
    </svg>
  );
}

const ROAMERS = ["👻", "🦇", "🕷️", "🎃", "💀", "🕯️"];

/**
 * Decorative layer for haunted costumes. Everything is pointer-events-none
 * and hidden from assistive tech. Respects reduced-motion via CSS.
 */
export function HauntOverlay() {
  const [roamer, setRoamer] = useState<{ k: number; e: string; y: number } | null>(
    null,
  );

  useEffect(() => {
    let n = 0;
    let timer: ReturnType<typeof setTimeout>;
    const spawn = () => {
      n += 1;
      setRoamer({
        k: n,
        e: ROAMERS[Math.floor(Math.random() * ROAMERS.length)],
        y: 8 + Math.random() * 70,
      });
      timer = setTimeout(spawn, 9000 + Math.random() * 12000);
    };
    timer = setTimeout(spawn, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      <div className="fog fog-a" />
      <div className="fog fog-b" />
      <Web className="left-0 top-0" />
      <Web className="right-0 top-0 -scale-x-100" />
      {roamer && (
        <span
          key={roamer.k}
          className="roamer absolute text-4xl"
          style={{ top: `${roamer.y}%` }}
        >
          {roamer.e}
        </span>
      )}
      <div className="vignette absolute inset-0" />
    </div>
  );
}

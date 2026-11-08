"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import type { Agent, GptyShape } from "@/lib/agents";

/** What a gpty is doing. The open agent mirrors its chat; the others rest. */
export type Mood = "idle" | "watching" | "thinking" | "typing" | "error";

/**
 * Each silhouette in a 48×48 box, plus where its eyes sit (y of their
 * centre). Flat vector shapes in one solid color, so a dozen read as one
 * family but no two look alike.
 */
const SHAPES: Record<GptyShape, { d: string; eyes: number }> = {
  circle: { d: "M24 4a20 20 0 1 1 0 40a20 20 0 1 1 0-40Z", eyes: 22 },
  drop: { d: "M24 3C24 3 40 19.5 40 30A16 16 0 0 1 8 30C8 19.5 24 3 24 3Z", eyes: 29 },
  cloud: {
    d: "M13 38C6.5 38 3 33.5 3 29C3 24 7 20.5 11.5 20.5C12.5 13.5 18 9 24.5 9C31.5 9 36.5 14 37 20.5C41.5 21 45 24.5 45 29.5C45 34.5 41 38 36 38Z",
    eyes: 25,
  },
  squircle: { d: "M24 5C38 5 43 10 43 24C43 38 38 43 24 43C10 43 5 38 5 24C5 10 10 5 24 5Z", eyes: 22 },
  diamond: {
    d: "M20.5 6.5C22.4 4.6 25.6 4.6 27.5 6.5L41.5 20.5C43.4 22.4 43.4 25.6 41.5 27.5L27.5 41.5C25.6 43.4 22.4 43.4 20.5 41.5L6.5 27.5C4.6 25.6 4.6 22.4 6.5 20.5Z",
    eyes: 23,
  },
  flower: {
    // Eight petals round a centre: the shape of a certain 2000s flower.
    d: Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const x = 24 + Math.cos(a) * 12.5;
      const y = 24 + Math.sin(a) * 12.5;
      return `M${(x - 8.5).toFixed(2)} ${y.toFixed(2)}a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0Z`;
    }).join("") + "M10 24a14 14 0 1 0 28 0a14 14 0 1 0 -28 0Z",
    eyes: 24,
  },
  ghost: {
    d: "M9 23C9 14 15.7 7 24 7C32.3 7 39 14 39 23V39C39 41 37 42 35.5 40.5L33 38L30.5 40.5C29 42 27 42 25.5 40.5L24 39L22.5 40.5C21 42 19 42 17.5 40.5L15 38L12.5 40.5C11 42 9 41 9 39Z",
    eyes: 21,
  },
  capsule: { d: "M15 12H33A12 12 0 0 1 33 36H15A12 12 0 0 1 15 12Z", eyes: 24 },
  bubble: {
    d: "M24 6C35 6 43 13 43 22C43 31 35 38 24 38C22 38 20 37.8 18.2 37.4L10 42L11.8 34.4C7.5 31.2 5 26.8 5 22C5 13 13 6 24 6Z",
    eyes: 21,
  },
  cone: {
    d: "M24 6C26 6 27.5 7.2 28.6 9L43 36C44.5 39 42.5 42 39 42H9C5.5 42 3.5 39 5 36L19.4 9C20.5 7.2 22 6 24 6Z",
    eyes: 30,
  },
  egg: { d: "M24 4C33 4 40 17 40 28C40 37 33 44 24 44C15 44 8 37 8 28C8 17 15 4 24 4Z", eyes: 26 },
  bean: {
    // A jellybean, tipped over: soft, round, a dent on one side.
    d: "M17 7.5C23.5 4 33 5 38.5 10.5C44 16 44.5 25 41 31.5C37.5 38.5 30 43 22.5 42.5C15.5 42 10.5 37.5 11 32C11.3 29 13.6 27.6 12.6 25C11.6 22.4 7.2 21 7 16.5C6.8 12.3 11 9.5 17 7.5Z",
    eyes: 22,
  },
  rock: {
    d: "M10 34C6 30 6 22 10 18C12 12 18 8 25 9C31 8 37 11 39 17C43 21 44 28 41 33C38 39 31 42 24 41C17 42 13 39 10 34Z",
    eyes: 24,
  },
  alien: {
    // A wide head with one antenna and a ball on top. All three parts wind the
    // same way, so where the stalk meets the head stays filled.
    d: "M5.5 28.5a18.5 12.5 0 1 0 37 0a18.5 12.5 0 1 0 -37 0Z" +
      "M25.9 17.4C26.7 13.6 29 10.9 32.2 9.4L31.2 7.6C27.4 9.4 24.6 12.6 23.6 17.2Z" +
      "M30 6a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z",
    eyes: 27.5,
  },
  slot: {
    // A one-armed bandit: a domed cabinet, the arm out to the right and the
    // ball on top. All three parts wind clockwise, so the joins stay filled.
    d: "M11 21C11 13.5 16.5 9 24 9C31.5 9 37 13.5 37 21V38Q37 43 32 43H16Q11 43 11 38Z" +
      "M36 27H39.2V13H42V31H36Z" +
      "M37 9.8a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1 -7.2 0Z",
    eyes: 25,
  },
};

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

  // Watching: the eyes follow the pointer around the page.
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
        el.style.transform = `translate(${((dx / len) * REACH * k).toFixed(2)}px, ${((dy / len) * REACH * k).toFixed(2)}px)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [mood]);

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={`gpty shrink-0 overflow-visible ${className}`}
      data-mood={mood}
      style={{ "--blink-delay": `${-((agent.id.length * 1.7) % 5)}s` } as CSSProperties}
      aria-hidden
    >
      <g className="gpty-body">
        <path d={s.d} fill={color} />
        <g ref={look} className="gpty-look">
          <g className="gpty-eyes">
            <ellipse cx="19" cy={s.eyes} rx="2.7" ry="3.7" fill={eyes} />
            <ellipse cx="29" cy={s.eyes} rx="2.7" ry="3.7" fill={eyes} />
          </g>
        </g>
      </g>
    </svg>
  );
}

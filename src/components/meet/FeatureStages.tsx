"use client";

import { Pause, Play, SkipForward } from "lucide-react";
import { type CSSProperties, type HTMLAttributes, type ReactNode, type Ref, useEffect, useRef, useState } from "react";
import { Gpty } from "@/components/Gpty";
import { AGENTS, type Agent, getAgent } from "@/lib/agents";
import { useReducedMotion } from "./bat";

/*
 * The art on the Meet page's three feature cards. Deliberately quiet: a light panel tinted by
 * one Gpty's colour, holding a single thing. A year, a window, a song.
 */

/** The Gptys in the sidebar (hidden ones keep their routes but stay off the Meet page). */
const ROSTER: Agent[] = AGENTS.filter((a) => !a.hidden);

/** True while `ref` is at least partly on screen, so nothing cycles off-screen. */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/** Steps through `length` items every `ms` while on screen; hovering holds it. */
function useCycle(length: number, ms: number) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const still = useReducedMotion();
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (!inView || held || still) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % length), ms);
    return () => window.clearInterval(t);
  }, [inView, held, still, length, ms]);
  const hold = { onMouseEnter: () => setHeld(true), onMouseLeave: () => setHeld(false) };
  return { ref, i, hold };
}

/** The panel every card shares: a soft wash of `color`, easing between Gptys. */
function Panel({ color, children, ...rest }: { color: string; children: ReactNode; ref?: Ref<HTMLDivElement> } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className="@container relative grid h-48 place-items-center overflow-hidden transition-[background-color] duration-700"
      style={{ "--c": color, backgroundColor: `color-mix(in srgb, ${color} 10%, #fbfaff)` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/** Fades and lifts its content in whenever `k` changes. */
function Enter({ k, children, className = "" }: { k: string; children: ReactNode; className?: string }) {
  return (
    <span key={k} className={`motion-safe:animate-[meet-in_.5s_cubic-bezier(.2,.7,.2,1)_both] ${className}`}>
      {children}
    </span>
  );
}

/* ───────── Personality: the year each Gpty is stuck in ───────── */

/** Oldest to newest. */
const ERAS = ["caveman", "seance", "fury", "icq", "msn", "skype", "facebook", "reddit", "slack", "machine"].map(getAgent);

export function TimeStage() {
  const { ref, i, hold } = useCycle(ERAS.length, 2600);
  const a = ERAS[i];
  return (
    <Panel ref={ref} color={a.look.color} {...hold} aria-label={`${a.name} thinks it's ${a.costume.year}`}>
      <div className="flex flex-col items-center text-center">
        <Enter k={a.id}>
          <span className="meet-bob block">
            <Gpty agent={a} size={40} mood="watching" />
          </span>
        </Enter>
        <Enter k={`${a.id}-who`} className="mt-3 block text-[13px] text-[#6d6a80]">
          {a.name} thinks it’s
        </Enter>
        <Enter k={`${a.id}-year`} className="block text-[40px] font-extrabold leading-none tracking-[-0.045em] text-[#15131f] tabular-nums @xs:text-[48px]">
          {a.costume.year}
        </Enter>
      </div>
    </Panel>
  );
}

/* ───────── Theme: one window, every Gpty's world ───────── */

export function ThemeStage() {
  const { ref, i, hold } = useCycle(ROSTER.length, 3200);
  const a = ROSTER[i];
  const next = ROSTER[(i + 1) % ROSTER.length];

  // Warm up the next wallpaper so the window never shows an empty frame
  useEffect(() => {
    const img = new Image();
    img.src = `/${next.id}/wallpaper.webp`;
  }, [next.id]);

  return (
    <Panel ref={ref} color={a.look.color} {...hold} aria-label={`${a.costume.app}, ${a.costume.year}`}>
      <div className="relative mt-3 w-[min(196px,76%)]">
        {/* Two more windows peeking out behind */}
        <span aria-hidden className="absolute inset-x-[10%] -top-[14px] bottom-0 rounded-xl bg-white/40 ring-1 ring-black/[.04]" />
        <span aria-hidden className="absolute inset-x-[5%] -top-[7px] bottom-0 rounded-xl bg-white/70 ring-1 ring-black/[.04]" />

        <div className="relative overflow-hidden rounded-xl bg-white shadow-[0_14px_30px_-14px_rgba(40,25,80,.4)] ring-1 ring-black/[.06]">
          <div className="relative flex h-6 items-center gap-1 px-2.5">
            <i className="h-[7px] w-[7px] rounded-full bg-[#ff6159]" />
            <i className="h-[7px] w-[7px] rounded-full bg-[#ffbd2e]" />
            <i className="h-[7px] w-[7px] rounded-full bg-[#28c941]" />
            <Enter k={`${a.id}-app`} className="absolute inset-x-12 truncate text-center text-[10.5px] font-medium text-[#6d6a80]">
              {a.costume.app}
            </Enter>
          </div>
          <div className="relative aspect-[16/10] bg-[var(--c)]">
            <Enter k={`${a.id}-wall`} className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- each theme's own wallpaper, swapped as the window cycles */}
              <img src={`/${a.id}/wallpaper.webp`} alt="" className="h-full w-full object-cover" />
            </Enter>
            <Enter k={`${a.id}-gpty`} className="absolute bottom-2 right-2">
              <Gpty agent={a} size={28} mood="watching" />
            </Enter>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ───────── Music: a little player that plays each Gpty's song ───────── */

const clock = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

export function SongStage() {
  const tracks = ROSTER.filter((t) => t.song);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ now: 0, total: 0 });
  const audio = useRef<HTMLAudioElement>(null);
  const a = tracks[i % tracks.length];
  const song = a.song!;

  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    el.volume = 0.7;
    if (playing) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, i]);
  useEffect(() => {
    const el = audio.current;
    return () => el?.pause();
  }, []);

  const skip = () => {
    setTime({ now: 0, total: 0 });
    setI((n) => n + 1);
  };
  const pct = time.total ? (time.now / time.total) * 100 : 0;

  return (
    <Panel color={a.look.color}>
      <audio
        ref={audio}
        src={song.src}
        preload="metadata"
        onLoadedMetadata={(e) => setTime({ now: 0, total: e.currentTarget.duration })}
        onTimeUpdate={(e) => setTime({ now: e.currentTarget.currentTime, total: e.currentTarget.duration })}
        onEnded={skip}
      />
      <div className="w-[min(240px,86%)] rounded-2xl bg-white p-3 shadow-[0_14px_30px_-14px_rgba(40,25,80,.4)] ring-1 ring-black/[.06]">
        <div className="flex items-center gap-3">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-xl transition-colors duration-500"
            style={{ background: `color-mix(in srgb, ${a.look.color} 18%, white)` }}
          >
            <span className={playing ? "meet-bob" : ""} style={{ "--d": "1s" } as CSSProperties}>
              <Gpty agent={a} size={36} mood="watching" />
            </span>
          </span>
          <span className="min-w-0 flex-1 text-left">
            <Enter k={`${a.id}-title`} className="block truncate text-[14px] font-semibold tracking-[-0.01em] text-[#15131f]">
              {song.title}
            </Enter>
            <Enter k={`${a.id}-artist`} className="block truncate text-[12.5px] text-[#8a879c]">
              {song.artist ?? a.name}
            </Enter>
          </span>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/[.06]">
          <div className="h-full rounded-full bg-[var(--c)] transition-[width] duration-300 ease-linear" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="w-9 text-left text-[11px] tabular-nums text-[#a3a0b4]">{clock(time.now)}</span>
          <span className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : `Play ${a.name}'s song, ${song.title}`}
              title={playing ? "Pause" : "Play"}
              className="grid h-8 w-8 place-items-center rounded-full bg-[#15131f] text-white transition-transform hover:scale-105 active:scale-95"
            >
              {playing ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
            </button>
            <button
              type="button"
              onClick={skip}
              aria-label="Next song"
              title="Next song"
              className="grid h-8 w-8 place-items-center rounded-full text-[#5b5870] transition-colors hover:bg-black/[.05] hover:text-[#15131f]"
            >
              <SkipForward className="h-3.5 w-3.5 fill-current" />
            </button>
          </span>
          <span className="w-9 text-right text-[11px] tabular-nums text-[#a3a0b4]">{clock(time.total)}</span>
        </div>
      </div>
    </Panel>
  );
}

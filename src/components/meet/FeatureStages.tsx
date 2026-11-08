"use client";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { type CSSProperties, type HTMLAttributes, type ReactNode, type Ref, useEffect, useMemo, useRef, useState } from "react";
import { Gpty } from "@/components/Gpty";
import { AGENTS, type Agent, getAgent } from "@/lib/agents";
import { useReducedMotion } from "./bat";

/*
 * The art on the Meet page's three feature cards. Deliberately quiet: a light panel tinted by
 * one Gpty's colour, holding a single thing. A question, a logo, a playlist.
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
  return { ref, i, go: setI, hold };
}

const INK = "#15131f";
const CARD = "rounded-2xl bg-white shadow-[0_10px_24px_-14px_rgba(40,25,80,.22)] ring-1 ring-black/[.06]";
/** A Gpty's colour pulled toward ink, so light ones (Cora's lime, Lucky's gold) still read on white. */
const deep = (c: string) => `color-mix(in srgb, ${c} 72%, ${INK})`;

/** The panel every card shares: plain white, like the rest of the card. `color` is the lit Gpty's, as --c. */
function Panel({ color, children, ...rest }: { color: string; children: ReactNode; ref?: Ref<HTMLDivElement> } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className="@container relative grid h-48 place-items-center bg-white"
      style={{ "--c": color } as CSSProperties}
    >
      {children}
    </div>
  );
}

/* ───────── Personality: ask every Gpty the year ───────── */

/** Oldest to newest. */
const ERAS = ["caveman", "seance", "fury", "icq", "msn", "skype", "facebook", "reddit", "slack", "machine"].map(getAgent);

/** What each Gpty says when asked the year, in its own voice. */
const YEAR_LINES: Record<string, string> = {
  caveman: "YEAR? GRUG COUNT MOONS. 10,000 BC.",
  seance: "Why, 1888, naturally.",
  fury: "1985. THE GRID NEVER SLEEPS.",
  icq: "its 2000!! y2k didnt even happen lol",
  msn: "omg its 2005 obv :P",
  skype: "2007! And calls are free (wave)",
  facebook: "2008! did u know facebook has chat now??",
  reddit: "2009. Source: my calendar. Edit: typo",
  slack: "2014. I made a #what-year channel",
  machine: "2199. organic time is deprecated.",
};

/** One Gpty's side of the chat: it types for a beat, then answers. Remounted per Gpty. */
function YearChat({ a }: { a: Agent }) {
  const still = useReducedMotion();
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setTyping(false), 950);
    return () => window.clearTimeout(t);
  }, []);
  const busy = typing && !still;
  const tint = `color-mix(in srgb, ${a.look.color} 16%, white)`;

  return (
    <>
      <div className="flex h-11 items-center gap-2.5 border-b border-black/[.05] px-3">
        <span className="relative shrink-0 motion-safe:animate-[meet-fade_.35s_ease-out_both]">
          <Gpty agent={a} size={24} mood="watching" />
          <i className="absolute -bottom-px -right-px h-2 w-2 rounded-full bg-[#2fc76b] ring-2 ring-white" />
        </span>
        <span className="min-w-0 flex-1 leading-tight motion-safe:animate-[meet-fade_.35s_ease-out_both]">
          <span className="block truncate text-[13px] font-semibold tracking-[-0.01em] text-[#15131f]">{a.name}</span>
          <span className="block truncate text-[11px] text-[#8a879c]">{busy ? "typing…" : a.costume.app}</span>
        </span>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums motion-safe:animate-[meet-fade_.35s_ease-out_both]"
          style={{ background: tint, color: deep(a.look.color) }}
        >
          {a.costume.year}
        </span>
      </div>

      <div className="flex h-[108px] flex-col justify-end gap-2 px-3 pb-3">
        <span className="ml-auto rounded-[16px] rounded-br-[5px] px-3 py-1.5 text-[13px] font-medium text-white" style={{ background: INK }}>
          what year is it?
        </span>
        <span className="flex items-end gap-1.5">
          {busy ? (
            <span aria-hidden className="flex h-[30px] items-center gap-1 rounded-[16px] rounded-bl-[5px] px-3" style={{ background: tint }}>
              {[0, 1, 2].map((d) => (
                <i
                  key={d}
                  className="h-1.5 w-1.5 rounded-full animate-[meet-bob_.9s_ease-in-out_infinite]"
                  style={{ animationDelay: `${d * 0.12}s`, background: deep(a.look.color) }}
                />
              ))}
            </span>
          ) : (
            <span
              className="max-w-[88%] rounded-[16px] rounded-bl-[5px] px-3 py-1.5 text-[13px] leading-snug text-[#15131f] motion-safe:animate-[meet-in_.35s_cubic-bezier(.2,.7,.2,1)_both]"
              style={{ background: tint }}
            >
              {YEAR_LINES[a.id]}
            </span>
          )}
        </span>
      </div>
    </>
  );
}

export function TimeStage() {
  const { ref, i, hold } = useCycle(ERAS.length, 3400);
  const a = ERAS[i];
  return (
    <Panel ref={ref} color={a.look.color} {...hold} aria-label={`What year is it? ${a.name}: ${YEAR_LINES[a.id]}`}>
      <div className={`w-[min(264px,88%)] overflow-hidden ${CARD}`}>
        <YearChat key={a.id} a={a} />
      </div>
    </Panel>
  );
}

/* ───────── Design: every world redraws the gpty logo ───────── */

export function ThemeStage() {
  const { ref, i, go, hold } = useCycle(ROSTER.length, 2600);
  const a = ROSTER[i];

  // Every world is stacked and already loaded; switching is a quick crossfade, never a flash of empty frame.
  return (
    <Panel ref={ref} color={a.look.color} {...hold} aria-label={`The gpty logo, dressed for ${a.costume.app}`}>
      <div className="flex w-[min(300px,90%)] flex-col items-center">
        <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#e9e6f2] shadow-[0_10px_24px_-14px_rgba(40,25,80,.28)] ring-1 ring-black/[.06]">
          {ROSTER.map((e, j) => (
            <span
              key={e.id}
              aria-hidden
              className="absolute inset-0 grid place-items-center transition-opacity duration-200 ease-out"
              style={{ opacity: j === i ? 1 : 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- each theme's own wallpaper */}
              <img src={`/${e.id}/wallpaper.webp`} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,.18),transparent_70%)]" />
              {/* eslint-disable-next-line @next/next/no-img-element -- each world's own wordmark */}
              <img src={`/logos/${e.id}.webp`} alt="" draggable={false} className="relative h-12 w-auto drop-shadow-[0_6px_14px_rgba(0,0,0,.25)]" />
            </span>
          ))}
          {/* Prev / next, shown while the frame is hovered (or a button has focus) */}
          {([
            ["Previous theme", -1, ChevronLeft, "left-2"],
            ["Next theme", 1, ChevronRight, "right-2"],
          ] as const).map(([label, step, Icon, side]) => (
            <button
              key={label}
              type="button"
              onClick={() => go((i + step + ROSTER.length) % ROSTER.length)}
              aria-label={label}
              title={label}
              className={`absolute top-1/2 ${side} grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#15131f] opacity-0 shadow-[0_6px_16px_-6px_rgba(20,10,40,.5)] ring-1 ring-black/[.06] backdrop-blur transition-[opacity,transform] duration-150 hover:scale-105 focus-visible:opacity-100 active:scale-95 group-hover:opacity-100`}
            >
              <Icon className="h-4 w-4" strokeWidth={2.5} />
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-1">
          {ROSTER.map((e, j) => (
            <button
              key={e.id}
              type="button"
              onClick={() => go(j)}
              aria-label={e.costume.app}
              className="h-1.5 rounded-full transition-[width,background-color] duration-200"
              style={{ width: j === i ? 16 : 6, background: j === i ? deep(e.look.color) : "rgba(0,0,0,.12)" }}
            />
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ───────── Music: the whole soundtrack as a playlist ───────── */

export function SongStage() {
  const tracks = useMemo(() => ROSTER.filter((t) => t.song), []);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(0);
  const audio = useRef<HTMLAudioElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const a = tracks[i];

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
  // Keep the playing row in view inside the list (never scrolls the page)
  useEffect(() => {
    const box = list.current;
    const row = box?.children[i] as HTMLElement | undefined;
    if (box && row) box.scrollTo({ top: row.offsetTop - box.offsetTop - 4, behavior: "smooth" });
  }, [i]);

  const go = (j: number) => {
    setPct(0);
    setI(j % tracks.length);
  };

  return (
    <Panel color={a.look.color}>
      <audio
        ref={audio}
        src={a.song!.src}
        preload="metadata"
        onTimeUpdate={(e) => setPct(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
        onEnded={() => go(i + 1)}
      />
      <div className={`w-[min(260px,90%)] overflow-hidden ${CARD}`}>
        <ol ref={list} className="no-scrollbar h-[150px] overflow-y-auto p-1 [mask-image:linear-gradient(transparent,#000_8px,#000_calc(100%-22px),transparent)]">
          {tracks.map((t, j) => {
            const on = j === i;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!on) go(j);
                    setPlaying((p) => (on ? !p : true));
                  }}
                  aria-label={on && playing ? `Pause ${t.song!.title}` : `Play ${t.name}'s song, ${t.song!.title}`}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-[7px] text-left transition-colors duration-300 hover:bg-black/[.03]"
                  style={on ? { background: `color-mix(in srgb, ${t.look.color} 14%, white)` } : undefined}
                >
                  <Gpty agent={t} size={24} mood={on ? "watching" : "idle"} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-[-0.01em] text-[#15131f]">{t.song!.title}</span>
                  <span className="grid h-5 w-5 shrink-0 place-items-center">
                    {on && playing ? (
                      <span className="flex h-3 items-end gap-[2px]">
                        {[0.9, 0.6, 1.1].map((d, k) => (
                          <i
                            key={k}
                            className="block h-full w-[3px] origin-bottom rounded-full motion-safe:animate-[meet-eq_ease-in-out_infinite]"
                            style={{ animationDuration: `${d}s`, background: deep(t.look.color) }}
                          />
                        ))}
                      </span>
                    ) : (
                      <Play className={`h-3 w-3 fill-current text-[#15131f] transition-opacity ${on ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="h-[2px] bg-black/[.05]">
          <div className="h-full transition-[width] duration-300 ease-linear" style={{ width: `${pct * 100}%`, background: deep(a.look.color) }} />
        </div>
      </div>
    </Panel>
  );
}

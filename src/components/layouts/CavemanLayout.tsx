"use client";

import { useState } from "react";
import { useComposer, useStickyScroll } from "./hooks";
import type { LayoutProps, ThreadItem } from "./types";

const OCHRE = "#f3a05c";
const CHALK = "#d9d2bf";
const FAINT = "#8a7a62";

/** Faint handprints stamped around the wall. Positions are stable per mount. */
const PRINTS = [
  { left: "6%", top: "12%", r: -18 },
  { left: "88%", top: "18%", r: 14 },
  { left: "12%", top: "78%", r: 8 },
  { left: "82%", top: "72%", r: -10 },
];

/** A cave wall, 10,000 BC. Messages are painted on rock slabs by torchlight. */
export function CavemanLayout({
  costume,
  lines,
  busy,
  waiting,
  error,
  onSend,
  threads,
  activeId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
}: LayoutProps) {
  const { value, setValue, submit, onKeyDown } = useComposer(onSend, busy);
  const scroller = useStickyScroll<HTMLDivElement>(lines);
  const [dots] = useState("🪨🪨🪨");

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-2xl font-[family-name:var(--font-caveat)] text-[20px] shadow-[0_24px_80px_rgba(0,0,0,.8)] ring-1 ring-black/60"
      style={{
        background:
          "radial-gradient(ellipse 50% 40% at 70% 20%, #35291e, transparent 70%), radial-gradient(ellipse 60% 50% at 20% 80%, #3b2c1e, transparent 70%), linear-gradient(165deg, #2a211a, #1c1510 60%, #241b13)",
        color: CHALK,
      }}
    >
      {/* Torchlight and old handprints */}
      <div className="torch pointer-events-none absolute inset-0" aria-hidden style={{ background: "radial-gradient(ellipse 45% 55% at 0% 100%, rgba(255,140,40,.22), transparent 70%)" }} />
      <div className="torch pointer-events-none absolute inset-0" aria-hidden style={{ background: "radial-gradient(ellipse 45% 55% at 100% 100%, rgba(255,120,30,.16), transparent 70%)", animationDelay: "-1.2s" }} />
      {PRINTS.map((h, i) => (
        <span key={i} className="pointer-events-none absolute text-3xl opacity-[.13]" aria-hidden style={{ left: h.left, top: h.top, transform: `rotate(${h.r}deg)`, color: OCHRE }}>
          ✋
        </span>
      ))}

      <header className="z-[1] flex shrink-0 items-center justify-between px-5 pt-3 text-[22px] tracking-wide" style={{ color: OCHRE }}>
        <span>𖡼 CAVE OF OOG 𖡼</span>
        <span className="hidden text-[17px] text-[#8a7a62] sm:inline">year of big mammoth · moon almost round</span>
      </header>

      <div className="z-[1] flex min-h-0 flex-1 gap-3 p-3 sm:px-5">
        {/* Walls of the cave */}
        <aside className="hidden w-48 shrink-0 flex-col rounded-xl bg-black/25 p-2 ring-1 ring-white/5 md:flex">
          <div className="pb-1 text-center text-[17px] tracking-[0.2em]" style={{ color: FAINT }}>
            WALLS
          </div>
          <button onClick={onNewThread} className="slab mb-1 px-2 py-0.5 text-left text-[19px] hover:bg-white/5" style={{ color: OCHRE }}>
            ✦ {costume.newThread}
          </button>
          <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Walls">
            {threads
              .filter((t) => !t.draft)
              .map((t) => (
                <Wall key={t.id} t={t} active={t.id === activeId} onSelect={onSelectThread} onDelete={onDeleteThread} />
              ))}
          </nav>
          <div className="pt-1 text-center text-[15px]" style={{ color: FAINT }}>
            many wall. much wisdom.
          </div>
        </aside>

        {/* The wall being painted */}
        <section className="flex min-w-0 flex-1 flex-col gap-2">
          <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-black/20 p-3 ring-1 ring-white/5">
            <Slab who="OOG" them text={costume.greeting} />
            {lines.map((l) => (
              <Slab key={l.id} who={l.role === "user" ? costume.user : costume.assistant} them={l.role === "assistant"} text={l.text} />
            ))}
            {waiting && (
              <div className="flex items-center gap-2 pl-1" style={{ color: FAINT }}>
                <span className="text-[17px] tracking-[0.2em]">{costume.typing}</span>
                <span className="inline-flex gap-0.5 text-[13px]">
                  {dots.split("🪨").slice(0, -1).map((_, i) => (
                    <span key={i} className="dot" style={{ animationDelay: `${i * 0.18}s` }}>🪨</span>
                  ))}
                </span>
              </div>
            )}
            {error && (
              <div className="slab inline-block bg-[#4a1f14]/60 px-3 py-1 text-[19px]" style={{ color: "#ff9d7a" }}>
                {costume.error}
              </div>
            )}
          </div>

          {/* Make mark */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-2xl" aria-hidden>✍️</span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Message"
              spellCheck={false}
              className="slab min-w-0 flex-1 bg-black/30 px-4 py-1.5 text-[20px] outline-none ring-1 ring-white/10 placeholder:text-[#6d5e49] focus:ring-[#c96f2e]"
              placeholder="make mark here…"
            />
            <button
              onClick={submit}
              disabled={busy || !value.trim()}
              className="slab-alt px-4 py-1.5 text-[20px] font-bold ring-1 ring-[#c96f2e]/60 transition hover:bg-[#c96f2e]/20 disabled:opacity-40"
              style={{ color: OCHRE }}
            >
              🪨 GRUNT
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Slab({ who, text, them }: { who: string; text: string; them?: boolean }) {
  return (
    <div className="mb-2.5">
      <div className="pl-2 text-[14px] uppercase tracking-[0.25em]" style={{ color: FAINT }}>
        {them ? "🦣 " : "✋ "}
        {who}
      </div>
      <div
        className={`${them ? "slab" : "slab-alt"} inline-block max-w-[85%] whitespace-pre-wrap break-words px-4 py-1.5 text-[21px] leading-snug ring-1 ring-white/5`}
        style={them ? { background: "rgba(201,111,46,.14)", color: OCHRE } : { background: "rgba(0,0,0,.3)", color: CHALK }}
      >
        {text}
      </div>
    </div>
  );
}

function Wall({
  t,
  active,
  onSelect,
  onDelete,
}: {
  t: ThreadItem;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`group flex items-center rounded px-1 ${active ? "bg-[#c96f2e]/20" : "hover:bg-white/5"}`}>
      <button onClick={() => onSelect(t.id)} className="min-w-0 flex-1 truncate py-0.5 text-left text-[18px] uppercase">
        {t.title}
      </button>
      <button onClick={() => onDelete(t.id)} className="hidden px-1 group-hover:block" aria-label={`Smash ${t.title}`} title="Smash wall">
        💥
      </button>
    </div>
  );
}

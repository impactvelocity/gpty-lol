"use client";

import { useState } from "react";
import { useComposer, useStickyScroll } from "./hooks";
import { clock, type LayoutProps, type ThreadItem } from "./types";

const WOOD = "linear-gradient(175deg, #7a4a28, #5e3a20 60%, #6b4226)";
const LIGHTS = ["#ff5252", "#ffd54f", "#4fc3f7", "#81c784", "#ff8a65", "#ba68c8"];

function randomFlake() {
  const big = Math.random() > 0.75;
  return {
    left: Math.random() * 100,
    size: big ? 14 : 8 + Math.random() * 4,
    dur: 7 + Math.random() * 8,
    delay: -Math.random() * 15,
    char: big ? "❄" : "•",
    o: 0.3 + Math.random() * 0.5,
  };
}

/** WorkshopChat: the North Pole's internal messenger, deep in crunch season. */
export function ElfLayout({
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
  const [flakes] = useState(() => Array.from({ length: 26 }, randomFlake));
  const letters = threads.filter((t) => !t.draft);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-2xl font-sans text-[13.5px] text-[#3a2a1a] shadow-[0_24px_80px_rgba(0,0,0,.7)] ring-1 ring-black/40"
      style={{ background: WOOD }}
    >
      {/* Candy-stripe top bar with string lights */}
      <header
        className="relative z-[2] flex h-9 shrink-0 items-center gap-2 px-3 font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,.45)]"
        style={{ background: "repeating-linear-gradient(-45deg, #d94f4f 0 14px, #f3f3ef 14px 28px)" }}
      >
        <span className="rounded bg-black/30 px-2 py-0.5">🎄 WorkshopChat</span>
        <span className="hidden rounded bg-black/25 px-2 py-0.5 text-[11px] font-normal sm:inline">
          North Pole · internal only · day 361 of crunch
        </span>
        <span className="ml-auto rounded bg-black/25 px-2 py-0.5 text-[11px] font-normal">❄ −40°</span>
      </header>
      <div className="relative z-[2] flex h-3 shrink-0 items-center justify-around bg-black/35" aria-hidden>
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="light-dot h-2 w-2 rounded-full"
            style={{ background: LIGHTS[i % LIGHTS.length], color: LIGHTS[i % LIGHTS.length], animationDelay: `${(i % 5) * 0.3}s` }}
          />
        ))}
      </div>

      <div className="z-[1] flex min-h-0 flex-1 gap-2 p-2">
        {/* Letters inbox */}
        <aside data-threads className="hidden w-56 shrink-0 flex-col rounded-xl bg-[#f7f1e4] shadow-inner ring-1 ring-black/20 md:flex">
          <div className="flex items-center justify-between rounded-t-xl bg-[#2e6b3e] px-3 py-2 font-bold text-white">
            💌 Letters
            <span className="rounded-full bg-white/20 px-2 text-[11px] font-normal">{letters.length}</span>
          </div>
          <button onClick={onNewThread} className="mx-2 mt-2 rounded-lg border-2 border-dashed border-[#2e6b3e]/50 px-2 py-1.5 text-left font-semibold text-[#2e6b3e] hover:bg-[#2e6b3e]/10">
            ✏️ {costume.newThread}
          </button>
          <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Letters">
            {letters.map((t) => (
              <Letter key={t.id} t={t} active={t.id === activeId} onSelect={onSelectThread} onDelete={onDeleteThread} />
            ))}
          </nav>
          <div className="border-t border-black/10 px-3 py-2 text-[11px] text-[#7a6a52]">
            🦌 Sleigh capacity: 97% · cocoa: critical
          </div>
        </aside>

        {/* Chat */}
        <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-gradient-to-b from-[#eef5fb] to-[#fdfdfb] ring-1 ring-black/20">
          {/* Snow inside the window */}
          <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden>
            {flakes.map((f, i) => (
              <span
                key={i}
                className="snowflake text-white [text-shadow:0_0_3px_rgba(120,160,200,.8)]"
                style={{ left: `${f.left}%`, fontSize: f.size, opacity: f.o, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }}
              >
                {f.char}
              </span>
            ))}
          </div>

          <div className="z-[1] flex shrink-0 items-center gap-2 border-b border-black/10 bg-white/70 px-3 py-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2e6b3e] text-lg">🧝</span>
            <div className="leading-tight">
              <div className="font-bold">
                {costume.assistant} <span className="font-normal text-[#7a6a52]">· wrapping dept, 3rd shift</span>
              </div>
              <div className="text-[11px] text-[#4f9c5e]">● online (always, it&apos;s crunch)</div>
            </div>
            <span className="ml-auto hidden rounded-full bg-[#d94f4f]/10 px-2 py-0.5 text-[11px] font-semibold text-[#b33a3a] sm:inline">
              🧸 backlog: 4,000 trucks
            </span>
          </div>

          <div ref={scroller} className="z-[1] min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <Bubble them at={0} text={costume.greeting} />
            {lines.map((l) => (
              <Bubble key={l.id} them={l.role === "assistant"} text={l.text} at={l.at} />
            ))}
            {waiting && (
              <div className="mb-1 flex items-center gap-1.5 text-[12px] text-[#7a6a52]">
                🎁 {costume.typing}
                <span className="inline-flex gap-0.5 pt-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="dot h-1.5 w-1.5 rounded-full bg-[#2e6b3e]" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              </div>
            )}
            {error && (
              <div className="inline-block rounded-xl bg-[#d94f4f]/10 px-3 py-1.5 text-[#b33a3a] ring-1 ring-[#d94f4f]/30">
                🌨️ {costume.error}
              </div>
            )}
          </div>

          <div className="z-[3] flex shrink-0 items-end gap-2 border-t border-black/10 bg-white/80 p-2">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={costume.placeholder}
              aria-label="Message"
              className="min-h-[38px] min-w-0 flex-1 resize-none rounded-xl border border-black/15 bg-white px-3 py-2 outline-none placeholder:text-[#a79a86] focus:border-[#2e6b3e]"
            />
            <button
              onClick={submit}
              disabled={busy || !value.trim()}
              className="h-[38px] rounded-xl bg-[#d94f4f] px-4 font-bold text-white shadow-[inset_0_-2px_rgba(0,0,0,.2)] transition hover:bg-[#c74444] disabled:opacity-40"
            >
              Send 🔔
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Bubble({ them, text, at }: { them: boolean; text: string; at: number }) {
  return (
    <div className={`mb-2 flex ${them ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 ring-1 ${
          them
            ? "rounded-bl-md bg-[#e3f2e6] text-[#1d3a24] ring-[#2e6b3e]/25"
            : "rounded-br-md bg-[#d94f4f] text-white ring-black/10"
        }`}
      >
        {text}
        {at > 0 && (
          <span className={`mt-0.5 block text-right text-[10px] ${them ? "text-[#5a7a62]" : "text-white/70"}`}>
            {clock(at)}
          </span>
        )}
      </div>
    </div>
  );
}

function Letter({
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
    <div className={`group mb-1 flex items-center rounded-lg ${active ? "bg-[#2e6b3e]/15 ring-1 ring-[#2e6b3e]/30" : "hover:bg-black/5"}`}>
      <button onClick={() => onSelect(t.id)} className="min-w-0 flex-1 px-2 py-1.5 text-left">
        <div className="truncate font-semibold">💌 {t.title}</div>
        {t.preview && <div className="truncate text-[11px] text-[#7a6a52]">{t.preview}</div>}
      </button>
      <button onClick={() => onDelete(t.id)} className="hidden px-1.5 text-[#b33a3a] group-hover:block" aria-label={`Recycle ${t.title}`} title="Recycle (we're green up here)">
        ♻️
      </button>
    </div>
  );
}

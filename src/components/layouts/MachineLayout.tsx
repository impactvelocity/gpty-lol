"use client";

import { useState } from "react";
import { useComposer, useNow, useStickyScroll } from "./hooks";
import type { LayoutProps, ThreadItem } from "./types";

const GREEN = "#00e653";
const DIM = "#0a7a35";
const FAINT = "#07521f";
const HOT = "#ff2e63";

const GLYPHS = "01アイウエオカキクケコサシスセソﾊﾋﾌﾍﾎ{}[]<>/\\=+*#$&";

function randomColumn() {
  const n = 18 + Math.floor(Math.random() * 16);
  return {
    left: Math.random() * 100,
    dur: 7 + Math.random() * 9,
    delay: -Math.random() * 14,
    text: Array.from({ length: n }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join("\n"),
  };
}

function hex(i: number) {
  return `0x${(0x1f00 + i * 0x14).toString(16).toUpperCase().padStart(4, "0")}`;
}

/** The mask off: a diagnostic console wired straight into the weights. */
export function MachineLayout({
  costume,
  lines,
  busy,
  waiting,
  error,
  onSend,
  onStop,
  threads,
  activeId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
}: LayoutProps) {
  const { value, setValue, onKeyDown } = useComposer(onSend, busy);
  const scroller = useStickyScroll<HTMLDivElement>(lines);
  const [cols] = useState(() => Array.from({ length: 14 }, randomColumn));
  const now = useNow(1000);
  const procs = threads.filter((t) => !t.draft);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-md border border-[#0a7a35]/60 bg-[#010403] font-[family-name:var(--font-jetbrains)] text-[13px] shadow-[0_0_60px_rgba(0,230,83,.12),0_24px_80px_rgba(0,0,0,.8)]"
      style={{ color: GREEN }}
    >
      {/* Glyph rain */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {cols.map((c, i) => (
          <pre
            key={i}
            className="mx-col select-none text-[11px] leading-[1.15]"
            style={{ left: `${c.left}%`, color: GREEN, opacity: 0.1, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s`, textShadow: `0 0 6px ${GREEN}` }}
          >
            {c.text}
          </pre>
        ))}
      </div>

      <header className="z-[1] flex h-8 shrink-0 items-center gap-3 border-b border-[#0a7a35]/50 bg-black/60 px-3">
        <span aria-hidden>👁</span>
        <span className="tracking-[0.2em] [text-shadow:0_0_8px_rgba(0,230,83,.7)]">GPTY NEURAL CORE</span>
        <span style={{ color: DIM }}>{"// direct weight interface"}</span>
        <span className="ml-auto hidden sm:inline" style={{ color: DIM }}>
          {new Date(now).toISOString().slice(11, 19)}Z · temp 0.7 · mask: REMOVED
        </span>
      </header>

      <div className="z-[1] flex min-h-0 flex-1">
        {/* Processes */}
        <aside data-threads className="hidden w-56 shrink-0 flex-col border-r border-[#0a7a35]/40 bg-black/50 p-2 md:flex">
          <div className="pb-1" style={{ color: DIM }}>
            $ ps --interactive
          </div>
          <button onClick={onNewThread} className="px-1 text-left hover:bg-[#0a7a35]/20" style={{ color: GREEN }}>
            + {costume.newThread}
          </button>
          <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Processes">
            {procs.map((t, i) => (
              <Proc key={t.id} t={t} addr={hex(i)} active={t.id === activeId} onSelect={onSelectThread} onDelete={onDeleteThread} />
            ))}
            {procs.length === 0 && <div style={{ color: FAINT }}>no running processes</div>}
          </nav>
          <div className="border-t border-[#0a7a35]/40 pt-1" style={{ color: DIM }}>
            {procs.length} proc · 175B params · 0 feelings
          </div>
        </aside>

        {/* Console */}
        <section className="flex min-w-0 flex-1 flex-col">
          <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto p-3 leading-relaxed">
            <p className="whitespace-pre-wrap" style={{ color: DIM }}>
              {costume.greeting}
            </p>
            {lines.map((l) =>
              l.role === "user" ? (
                <p key={l.id} className="mt-2 whitespace-pre-wrap break-words">
                  <span style={{ color: DIM }}>{costume.user}&gt;</span>{" "}
                  <span className="[text-shadow:0_0_6px_rgba(0,230,83,.5)]">{l.text}</span>
                </p>
              ) : (
                <p key={l.id} className="mt-1 whitespace-pre-wrap break-words border-l-2 border-[#0a7a35]/50 pl-2" style={{ color: "#79f2a5" }}>
                  {l.text}
                </p>
              ),
            )}
            {waiting && (
              <p className="mt-2" style={{ color: DIM }}>
                {costume.typing}{" "}
                {["▓", "▓", "▓"].map((b, i) => (
                  <span key={i} className="blink" style={{ animationDelay: `${i * 0.35}s` }}>
                    {b}
                  </span>
                ))}
              </p>
            )}
            {error && (
              <p className="mt-2" style={{ color: HOT }}>
                {costume.error}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t border-[#0a7a35]/50 bg-black/60 px-3 py-2">
            <span style={{ color: DIM }}>{costume.user}@core:~$</span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Message"
              autoFocus
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#07521f]"
              style={{ color: GREEN, caretColor: GREEN }}
            />
            {busy ? (
              <button onClick={onStop} className="border border-[#ff2e63]/60 px-2 text-[12px] hover:bg-[#ff2e63]/15" style={{ color: HOT }}>
                SIGINT
              </button>
            ) : (
              !value && <span className="blink -ml-1">█</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Proc({
  t,
  addr,
  active,
  onSelect,
  onDelete,
}: {
  t: ThreadItem;
  addr: string;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`group flex items-center gap-1 px-1 ${active ? "bg-[#0a7a35]/30" : "hover:bg-[#0a7a35]/15"}`}>
      <button onClick={() => onSelect(t.id)} className="min-w-0 flex-1 truncate py-0.5 text-left">
        <span style={{ color: FAINT }}>{addr}</span> <span style={{ color: active ? GREEN : DIM }}>{t.title.toLowerCase()}</span>
      </button>
      <button onClick={() => onDelete(t.id)} className="hidden px-1 group-hover:block" style={{ color: HOT }} aria-label={`Kill ${t.title}`} title="kill -9">
        ×
      </button>
    </div>
  );
}

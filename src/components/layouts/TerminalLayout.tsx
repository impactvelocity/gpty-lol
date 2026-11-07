"use client";

import { useState } from "react";
import { TrafficLights } from "@/components/chrome";
import { useComposer, useNow, useStickyScroll } from "./hooks";
import { slug, type LayoutProps } from "./types";

/* Tokyo Night */
const T = {
  bg: "#1a1b26",
  fg: "#c0caf5",
  dim: "#565f89",
  blue: "#7aa2f7",
  purple: "#bb9af7",
  green: "#9ece6a",
  red: "#f7768e",
  yellow: "#e0af68",
  panel: "#16161e",
  bar: "#1f2335",
};

function hms(at: number) {
  return new Date(at || Date.now()).toLocaleTimeString([], { hour12: false });
}

function Prompt({ dir, time }: { dir: string; time?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center text-[13px]">
        <span className="rounded-l-[4px] px-2 font-bold" style={{ background: T.blue, color: T.bg }}>
          you@gpty
        </span>
        <span className="px-2" style={{ background: "#3b4261", color: T.fg }}>
          {dir}
        </span>
        <span className="rounded-r-[4px] px-2" style={{ background: T.purple, color: T.bg }}>
          ⎇ main
        </span>
      </span>
      {time && (
        <span className="ml-auto text-[12px]" style={{ color: T.dim }}>
          at {time}
        </span>
      )}
    </div>
  );
}

/** A modern GPU terminal with a sessions panel, starship prompt and tmux bar. */
export function TerminalLayout({
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
  const [cleared, setCleared] = useState(0);
  const [interrupted, setInterrupted] = useState<string[]>([]);
  const now = useNow(30_000);
  const run = (text: string) => {
    const cmd = text.trim();
    if (cmd === "clear") return setCleared(lines.length);
    if (cmd === "exit") return onNewThread();
    onSend(text);
  };
  const { value, setValue, onKeyDown } = useComposer(run, busy);
  const shown = lines.slice(cleared);
  const scroller = useStickyScroll<HTMLDivElement>(shown);
  const active = threads.find((t) => t.id === activeId);
  const name = (t: { title: string; draft?: boolean }) => (t.draft ? costume.newThread : slug(t.title, "session"));
  const dir = `~/threads/${active ? name(active) : "session"}`;
  const index = Math.max(0, threads.findIndex((t) => t.id === activeId));

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[12px] font-[family-name:var(--font-jetbrains)] text-[13.5px] leading-[1.55] shadow-[0_24px_80px_rgba(0,0,0,.55)] ring-1 ring-white/15 backdrop-blur-2xl"
      style={{ background: "rgba(26,27,38,.88)", color: T.fg }}
    >
      <div className="relative flex h-[38px] shrink-0 items-center border-b border-white/5 px-3.5">
        <TrafficLights />
        <span className="absolute inset-x-0 text-center text-[12px]" style={{ color: T.dim }}>
          {dir} — zsh — 120×36
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside data-threads className="hidden w-56 shrink-0 flex-col border-r border-white/5 md:flex" style={{ background: "rgba(22,22,30,.6)" }}>
          <div className="flex items-center justify-between px-3 pb-1 pt-3 text-[11px] tracking-widest" style={{ color: T.dim }}>
            SESSIONS
            <button onClick={onNewThread} className="rounded px-1 hover:bg-white/10" style={{ color: T.blue }} title="New session (exit)">
              + ⌘T
            </button>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2" aria-label="Sessions">
            {threads.map((t, i) => {
              const on = t.id === activeId;
              return (
                <div key={t.id} className={`group flex items-center rounded-[6px] ${on ? "bg-white/10" : "hover:bg-white/5"}`}>
                  <button onClick={() => onSelectThread(t.id)} className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1 text-left">
                    <span style={{ color: on ? T.green : T.dim }}>{on ? "▸" : " "}</span>
                    <span style={{ color: T.dim }}>{i}:</span>
                    <span className="truncate" style={{ color: on ? T.fg : "#a9b1d6" }}>
                      {name(t)}
                    </span>
                  </button>
                  {!t.draft && (
                    <button
                      onClick={() => onDeleteThread(t.id)}
                      className="hidden px-2 group-hover:block"
                      style={{ color: T.red }}
                      aria-label={`Kill session ${name(t)}`}
                      title="kill-session"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="border-t border-white/5 px-3 py-2 text-[11px]" style={{ color: T.dim }}>
            ~/threads · {threads.filter((t) => !t.draft).length} saved
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {cleared === 0 && (
              <div className="mb-3" style={{ color: T.dim }}>
                Last login: {new Date(now - 3_600_000).toString().slice(0, 24)} on ttys001
                <br />
                <span style={{ color: T.green }}>❯</span> {costume.greeting}
              </div>
            )}
            {shown.map((l) =>
              l.role === "user" ? (
                <div key={l.id} className="mt-3">
                  <Prompt dir={dir} time={hms(l.at)} />
                  <div className="whitespace-pre-wrap break-words">
                    <span style={{ color: T.green }}>❯</span> {l.text}
                  </div>
                  {interrupted.includes(l.id) && <div style={{ color: T.red }}>^C</div>}
                </div>
              ) : (
                <div key={l.id} className="whitespace-pre-wrap break-words">
                  {l.text}
                </div>
              ),
            )}
            {waiting && (
              <div style={{ color: T.dim }}>
                <span className="spin inline-block" style={{ color: T.blue }}>
                  ◜
                </span>{" "}
                {costume.typing}…
              </div>
            )}
            {error && <div style={{ color: T.red }}>{costume.error}</div>}
          </div>

          <div className="shrink-0 px-4 pb-2.5 pt-1">
            <Prompt dir={dir} />
            <div className="flex items-start gap-2">
              <span style={{ color: busy ? T.yellow : T.green }}>❯</span>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key.toLowerCase() === "c" && busy) {
                    e.preventDefault();
                    const lastUser = [...lines].reverse().find((l) => l.role === "user");
                    if (lastUser) setInterrupted((x) => [...x, lastUser.id]);
                    onStop();
                    return;
                  }
                  if (e.ctrlKey && e.key.toLowerCase() === "l") {
                    e.preventDefault();
                    setCleared(lines.length);
                    return;
                  }
                  onKeyDown(e);
                }}
                rows={1}
                autoFocus
                spellCheck={false}
                aria-label="Command"
                className="min-w-0 flex-1 resize-none bg-transparent outline-none"
                style={{ caretColor: T.fg }}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="flex h-[22px] shrink-0 items-center gap-0 overflow-hidden whitespace-nowrap text-[12px]" style={{ background: T.bar }}>
        <span className="h-full px-2 font-bold leading-[22px]" style={{ background: T.green, color: T.bg }}>
          [gpty]
        </span>
        <span className="px-2" style={{ color: T.blue }}>
          {index}:{active ? name(active) : "zsh"}*
        </span>
        <span className="hidden sm:inline" style={{ color: T.dim }}>
          {busy ? "running" : "idle"}
        </span>
        <span className="ml-auto px-2" style={{ color: T.dim }}>
          &quot;gpty.local&quot;
        </span>
        <span className="h-full px-2 leading-[22px]" style={{ background: T.blue, color: T.bg }}>
          {new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}{" "}
          {new Date(now).toLocaleDateString([], { day: "2-digit", month: "short", year: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

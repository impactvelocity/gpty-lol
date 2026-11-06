"use client";

import { useState } from "react";
import { useComposer, useNow, useStickyScroll } from "./hooks";
import type { LayoutProps } from "./types";

/* DOS 16-color palette */
const C = {
  black: "#000000",
  blue: "#0000aa",
  cyan: "#00aaaa",
  gray: "#aaaaaa",
  dark: "#555555",
  lblue: "#5555ff",
  lgreen: "#55ff55",
  lcyan: "#55ffff",
  lred: "#ff5555",
  lmag: "#ff55ff",
  yellow: "#ffff55",
  white: "#ffffff",
};

const LOGO = [
  " ██████  ██████  ████████ ██    ██     ██████  ██████  ███████",
  "██       ██   ██    ██     ██  ██      ██   ██ ██   ██ ██     ",
  "██   ███ ██████     ██      ████       ██████  ██████  ███████",
  "██    ██ ██         ██       ██        ██   ██ ██   ██      ██",
  " ██████  ██         ██       ██        ██████  ██████  ███████",
];
const LOGO_COLORS = [C.lcyan, C.lcyan, C.cyan, C.lblue, C.blue];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Beige CRT running a terminal program connected to a 1993 BBS. */
export function BbsLayout({
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
  const { value, setValue, onKeyDown } = useComposer(onSend, busy);
  const scroller = useStickyScroll<HTMLDivElement>(lines);
  const now = useNow(1000);
  const [since] = useState(() => Date.now());
  const up = Math.floor((now - since) / 1000);
  const online = `${pad(Math.floor(up / 3600))}:${pad(Math.floor(up / 60) % 60)}:${pad(up % 60)}`;
  const d = new Date(now);
  const stamp = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}-93 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const active = threads.find((t) => t.id === activeId);

  return (
    <div className="flex h-full items-center justify-center">
      {/* Monitor bezel */}
      <div className="flex h-full w-full max-w-[1120px] flex-col rounded-[38px] bg-gradient-to-b from-[#e6dfcd] via-[#d9d1bd] to-[#bdb39b] p-4 pb-2.5 shadow-[0_30px_80px_rgba(0,0,0,.7),inset_0_2px_rgba(255,255,255,.6),inset_0_-3px_rgba(0,0,0,.15)] md:p-6 md:pb-3">
        <div className="rounded-[28px] bg-[#2b2925] p-2.5 shadow-[inset_0_3px_10px_rgba(0,0,0,.8)] min-h-0 flex-1">
          <div className="crt-screen h-full rounded-[22px] bg-[#050805]">
            <div
              className="crt-glow relative z-[1] flex h-full flex-col p-3 font-[family-name:var(--font-vt323)] text-[19px] leading-[1.15] md:p-4"
              style={{ color: C.gray }}
            >
              <div className="flex justify-between px-1" style={{ background: C.blue, color: C.white }}>
                <span>
                  <span style={{ color: C.yellow }}>{costume.app}</span> ─ Node 1 ─ Chat with SysOp
                </span>
                <span className="hidden sm:inline">{stamp}</span>
              </div>

              <div className="mt-2 flex min-h-0 flex-1 gap-2">
                <aside
                  className="relative hidden w-[30ch] shrink-0 flex-col border-4 border-double px-2 pb-1 pt-3 md:flex"
                  style={{ borderColor: C.cyan }}
                >
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#050805] px-1" style={{ color: C.yellow }}>
                    ╡ MESSAGE BASES ╞
                  </span>
                  <button
                    onClick={onNewThread}
                    className="text-left hover:brightness-150"
                    style={{ color: C.lgreen }}
                  >
                    [N] {costume.newThread}
                  </button>
                  <div className="my-1 border-t border-dashed" style={{ borderColor: C.dark }} />
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {threads
                      .filter((t) => !t.draft)
                      .map((t, i) => {
                        const on = t.id === activeId;
                        return (
                          <button
                            key={t.id}
                            onClick={() => onSelectThread(t.id)}
                            className="block w-full truncate text-left uppercase"
                            style={on ? { background: C.cyan, color: C.black } : { color: C.lcyan }}
                          >
                            <span style={on ? undefined : { color: C.white }}>[{i + 1}]</span> {t.title}
                          </button>
                        );
                      })}
                    {threads.every((t) => t.draft) && (
                      <div style={{ color: C.dark }}>NO MESSAGES YET.</div>
                    )}
                  </div>
                  {active && !active.draft && (
                    <button
                      onClick={() => onDeleteThread(active.id)}
                      className="mt-1 text-left hover:brightness-150"
                      style={{ color: C.lred }}
                    >
                      [D] DELETE THIS MESSAGE
                    </button>
                  )}
                </aside>

                <section
                  className="relative flex min-w-0 flex-1 flex-col border-4 border-double px-2 pt-3"
                  style={{ borderColor: C.lblue }}
                >
                  <span className="absolute -top-3 left-3 max-w-[80%] truncate bg-[#050805] px-1" style={{ color: C.lmag }}>
                    ╡ FROM: {costume.user} ─ TO: {costume.assistant} ─ SUBJ:{" "}
                    {(active?.title || "CHAT").toUpperCase()} ╞
                  </span>
                  <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto pb-2">
                    <pre
                      aria-hidden
                      className="mb-2 overflow-hidden font-[Menlo,ui-monospace,monospace] text-[9px] leading-[1.05] sm:text-[11px]"
                    >
                      {LOGO.map((row, i) => (
                        <div key={i} style={{ color: LOGO_COLORS[i] }}>
                          {row}
                        </div>
                      ))}
                    </pre>
                    <div style={{ color: C.lgreen }}>CONNECT 2400/ARQ/V42BIS</div>
                    <div className="mb-3 whitespace-pre-wrap" style={{ color: C.white }}>
                      {costume.greeting}
                    </div>
                    {lines.map((l) => (
                      <div key={l.id} className="mb-2 whitespace-pre-wrap break-words">
                        {l.role === "user" ? (
                          <>
                            <span style={{ color: C.lcyan }}>{costume.user}&gt; </span>
                            <span style={{ color: C.white }}>{l.text}</span>
                          </>
                        ) : (
                          <>
                            <span style={{ color: C.yellow }}>{costume.assistant}&gt; </span>
                            <span style={{ color: C.gray }}>{l.text}</span>
                          </>
                        )}
                      </div>
                    ))}
                    {waiting && (
                      <div style={{ color: C.yellow }}>
                        {costume.typing}
                        <span className="blink">...</span>
                      </div>
                    )}
                    {error && <div style={{ color: C.lred }}>{costume.error}</div>}
                  </div>
                </section>
              </div>

              <div className="mt-2 flex items-start gap-2 px-1">
                <span className="shrink-0" style={{ color: C.lgreen }}>
                  [{Math.max(0, 59 - Math.floor(up / 60))} min left]{" "}
                  <span style={{ color: C.white }}>Chat ({costume.user})</span>
                  <span style={{ color: C.yellow }}> &gt;</span>
                </span>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  autoFocus
                  aria-label="Message"
                  spellCheck={false}
                  className="min-w-0 flex-1 resize-none bg-transparent uppercase outline-none"
                  style={{ color: C.white, caretColor: C.white }}
                />
                {!value && <span className="blink -ml-1" style={{ color: C.white }}>█</span>}
              </div>

              <div className="mt-1 flex gap-0 overflow-hidden whitespace-nowrap px-1" style={{ background: C.gray, color: C.black }}>
                <span>ALT-Z FOR HELP</span>
                <span className="px-2">│</span>
                <span>ANSI-BBS</span>
                <span className="px-2">│</span>
                <span>2400 N81</span>
                <span className="px-2">│</span>
                <span>FDX</span>
                <span className="hidden px-2 sm:inline">│</span>
                <span className="hidden sm:inline">{busy ? "RECEIVING" : "IDLE"}</span>
                <span className="ml-auto">ON-LINE {online}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Bezel bottom: badge, knobs and power LED */}
        <div className="flex items-center justify-between px-6 pt-2 font-sans text-[10px] font-bold tracking-[0.25em] text-[#8a8170]">
          <span>GPTY · 14&quot; COLOR</span>
          <span className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-gradient-to-b from-[#cfc7b3] to-[#9f9681] shadow-inner" />
            <span className="h-3 w-3 rounded-full bg-gradient-to-b from-[#cfc7b3] to-[#9f9681] shadow-inner" />
            <span className="h-2 w-2 rounded-full bg-[#5bff6a] shadow-[0_0_8px_#5bff6a]" />
          </span>
        </div>
      </div>
    </div>
  );
}

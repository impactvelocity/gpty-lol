"use client";

import { useState } from "react";
import { ClassicMenu, ClassicTitleBar } from "@/components/chrome";
import { useComposer, useStickyScroll } from "./hooks";
import { slug, type LayoutProps } from "./types";

const MONO = "font-[Fixedsys,'Lucida_Console',Monaco,Consolas,monospace]";
const TOOLBAR = ["⚡", "🔌", "|", "⚙️", "📂", "⭐", "|", "📜", "👥", "📝", "|", "🎨", "🔔", "|", "❓"];

function stamp(at: number) {
  const d = new Date(at || Date.now());
  return `[${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}]`;
}

/** mIRC 6 on Windows 2000, treebar on the left, one channel per thread. */
export function IrcLayout({
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
  const channel = (t: { title: string; draft?: boolean }) => `#${t.draft ? "new-channel" : slug(t.title, "gpty")}`;
  const active = threads.find((t) => t.id === activeId);
  const chan = active ? channel(active) : "#gpty";
  const [opened] = useState(() => new Date(Date.now() - 1000 * 60 * 42).toString().slice(0, 24));

  return (
    <div className="pixel-text bevel-window flex h-full flex-col bg-[#d4d0c8] p-[3px] font-[Tahoma,Arial,sans-serif] text-[11px] text-black">
      <ClassicTitleBar
        title={`mIRC - [${chan} [+nt] (2): ${costume.greeting.split("|")[0].trim()}]`}
        icon={<span className="grid h-4 w-4 place-items-center rounded-sm bg-[#1f6f3a] text-[10px] font-bold">#</span>}
      />
      <div className="flex items-center">
        <ClassicMenu items={["File", "View", "Favorites", "Tools", "Commands", "Window", "Help"]} />
        <span className="ml-auto flex gap-0.5 pr-1 text-[9px]" aria-hidden>
          <span className="btn-classic grid h-3.5 w-4 place-items-center">_</span>
          <span className="btn-classic grid h-3.5 w-4 place-items-center">❐</span>
          <span className="btn-classic grid h-3.5 w-4 place-items-center">×</span>
        </span>
      </div>
      <div className="flex h-[28px] shrink-0 items-center gap-0.5 border-y border-t-white border-b-[#808080] px-1" aria-hidden>
        {TOOLBAR.map((g, i) =>
          g === "|" ? (
            <span key={i} className="mx-1 h-5 w-px bg-[#808080] shadow-[1px_0_#fff]" />
          ) : (
            <span key={i} className="grid h-[22px] w-[23px] place-items-center text-[13px] hover:bg-[#e6e3dd]">
              {g}
            </span>
          ),
        )}
      </div>

      <div className="mt-[3px] flex min-h-0 flex-1 gap-[3px]">
        {/* Treebar */}
        <nav data-threads className="bevel-in hidden w-48 shrink-0 overflow-y-auto bg-white p-1.5 md:block" aria-label="Channels">
          <div className="flex items-center gap-1">
            <span>🖥️</span> <span>irc.gpty.lol</span>
          </div>
          <div className="ml-2 border-l border-dotted border-[#808080] pl-2">
            <button onClick={onNewThread} className="flex items-center gap-1 py-px text-[#00007f] hover:underline">
              <span>└</span> /join #new-channel
            </button>
            {threads.map((t) => {
              const on = t.id === activeId;
              return (
                <div key={t.id} className="group flex items-center gap-1 py-px">
                  <span className="text-[#808080]">└</span>
                  <button
                    onClick={() => onSelectThread(t.id)}
                    className={`truncate px-0.5 text-left ${on ? "bg-[#0a246a] text-white" : ""}`}
                  >
                    {channel(t)}
                  </button>
                  {!t.draft && (
                    <button
                      onClick={() => onDeleteThread(t.id)}
                      className="ml-auto hidden px-1 text-[#7f0000] group-hover:block"
                      aria-label={`Part ${channel(t)}`}
                      title="/part"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Channel window */}
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <div className="flex min-h-0 flex-1 gap-[3px]">
            <div
              ref={scroller}
              className={`bevel-in min-w-0 flex-1 overflow-y-auto bg-white p-1.5 text-[12px] leading-[1.35] ${MONO}`}
            >
              <p className="text-[#009300]">* Now talking in {chan}</p>
              <p className="text-[#009300]">* Topic is &apos;{costume.greeting}&apos;</p>
              <p className="text-[#009300]">* Set by ChanServ on {opened}</p>
              <p className="text-[#009300]">* {costume.assistant} sets mode: +nt</p>
              {lines.map((l) => (
                <p key={l.id} className="whitespace-pre-wrap break-words">
                  <span>{stamp(l.at)} </span>
                  {l.role === "user" ? (
                    <>
                      <span>&lt;{costume.user}&gt;</span> {l.text}
                    </>
                  ) : l.text.startsWith("* ") ? (
                    <span className="text-[#9c009c]">{l.text}</span>
                  ) : (
                    <>
                      <span className="text-[#00007f]">&lt;@{costume.assistant}&gt;</span> {l.text}
                    </>
                  )}
                </p>
              ))}
              {error && <p className="text-[#00007f]">{costume.error}</p>}
            </div>
            <ul className={`bevel-in hidden w-32 shrink-0 overflow-y-auto bg-white p-1.5 text-[12px] sm:block ${MONO}`}>
              <li>@{costume.assistant}</li>
              <li>@ChanServ</li>
              <li>{costume.user}</li>
            </ul>
          </div>
          <div className="bevel-in flex items-center bg-white px-1.5">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Message"
              autoFocus
              spellCheck={false}
              className={`h-[20px] min-w-0 flex-1 bg-transparent text-[12px] outline-none ${MONO}`}
            />
            {waiting && <span className="text-[#808080]">{costume.typing}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

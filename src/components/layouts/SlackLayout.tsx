"use client";

import { TrafficLights } from "@/components/chrome";
import { useComposer, useStickyScroll } from "./hooks";
import { clock, slug, type ChatLine, type LayoutProps } from "./types";

const FIVE_MIN = 5 * 60_000;

/** The 2014 Slack Mac app on Yosemite. */
export function SlackLayout({
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
  const name = (t: { title: string; draft?: boolean }) => (t.draft ? costume.newThread : slug(t.title, "general"));
  const active = threads.find((t) => t.id === activeId);
  const channel = active ? name(active) : "general";

  return (
    <div className="flex h-full overflow-hidden rounded-[6px] bg-white font-[family-name:var(--font-lato)] text-[15px] text-[#2c2d30] shadow-[0_22px_70px_rgba(0,0,0,.55)] ring-1 ring-black/30">
      <aside data-threads className="hidden w-[220px] shrink-0 flex-col bg-[#4d394b] text-[#ab9ba9] md:flex">
        <div className="px-3 pt-3">
          <TrafficLights />
        </div>
        <div className="flex items-center justify-between px-4 pb-3 pt-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[18px] font-black text-white">
              gpty.lol <span className="text-[13px] font-normal text-[#ab9ba9]">⌄</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px]">
              <span className="h-2 w-2 rounded-full bg-[#2ab27b]" /> {costume.user}
            </div>
          </div>
          <span aria-hidden>🔔</span>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto pb-3" aria-label="Channels">
          <div className="flex items-center justify-between px-4 pb-1 pt-2 text-[13px] font-bold uppercase tracking-wide">
            Channels <span className="text-[11px] font-normal normal-case">({threads.length})</span>
            <button onClick={onNewThread} className="ml-auto pl-2 text-[16px] leading-none hover:text-white" aria-label="New channel" title="Create a channel">
              ⊕
            </button>
          </div>
          {threads.map((t) => {
            const on = t.id === activeId;
            return (
              <div
                key={t.id}
                className={`group mr-2 flex items-center rounded-r-[5px] ${on ? "bg-[#4c9689] text-white" : "hover:bg-[#3e313c]"}`}
              >
                <button onClick={() => onSelectThread(t.id)} className="min-w-0 flex-1 truncate py-[3px] pl-4 text-left">
                  <span className="opacity-60">#</span> {name(t)}
                </button>
                {!t.draft && (
                  <button
                    onClick={() => onDeleteThread(t.id)}
                    className="hidden px-2 opacity-70 hover:opacity-100 group-hover:block"
                    aria-label={`Archive #${name(t)}`}
                    title="Archive channel"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
          <div className="px-4 pb-1 pt-4 text-[13px] font-bold uppercase tracking-wide">Direct Messages</div>
          <div className="flex items-center gap-1.5 px-4 py-[3px]">
            <span className="text-[#e01563]">♥</span> {costume.assistant}
          </div>
          <div className="flex items-center gap-1.5 px-4 py-[3px]">
            <span className="h-2 w-2 rounded-full bg-[#2ab27b]" /> {costume.user} <span className="opacity-60">(you)</span>
          </div>
          <div className="px-4 pb-1 pt-4 text-[13px] font-bold uppercase tracking-wide">Private Groups</div>
          <div className="px-4 py-[3px] opacity-60">+ Create a private group</div>
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[58px] shrink-0 items-center gap-4 border-b border-[#e8e8e8] px-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[18px] font-black">
              #{channel} <span className="text-[14px] font-normal text-[#bbb]">☆</span>
            </div>
            <div className="flex items-center gap-2 truncate text-[13px] text-[#9e9ea6]">
              <span>👤 2</span> <span>|</span> <span>📌 0</span> <span>|</span>
              <span className="truncate">{costume.tagline}</span>
            </div>
          </div>
          <div className="ml-auto hidden items-center gap-3 text-[#9e9ea6] lg:flex" aria-hidden>
            <span className="w-48 rounded-[5px] border border-[#ccc] px-2 py-1 text-[13px]">🔍 Search</span>
            <span className="text-[16px]">@</span>
            <span className="text-[16px]">☆</span>
            <span className="text-[16px]">⋮</span>
          </div>
        </header>

        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto pb-2">
          <div className="px-5 pb-3 pt-6">
            <div className="text-[28px] font-black leading-tight">#{channel}</div>
            <p className="text-[#717274]">
              This is the very beginning of the <b className="text-[#4c9689]">#{channel}</b> channel.{" "}
              {costume.greeting}
            </p>
          </div>
          <Divider label="Today" />
          {lines.map((l, i) => (
            <Message key={l.id} line={l} prev={lines[i - 1]} costume={costume} />
          ))}
          {error && (
            <p role="alert" className="mx-5 my-2 rounded-[4px] border-l-4 border-[#eb4d5c] bg-[#fdf3f4] px-3 py-2 text-[14px] text-[#a13a46]">
              {costume.error}
            </p>
          )}
        </div>

        <div className="shrink-0 px-5 pb-2">
          <div className="flex items-stretch overflow-hidden rounded-[6px] border-2 border-[#e0e0e0] focus-within:border-[#c5c5c5]">
            <span className="grid w-11 shrink-0 place-items-center border-r-2 border-[#e0e0e0] text-[22px] text-[#bbb]" aria-hidden>
              +
            </span>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={`Message #${channel}`}
              aria-label="Message"
              className="max-h-32 min-w-0 flex-1 resize-none px-3 py-2.5 outline-none placeholder:text-[#9e9ea6]"
            />
            <span className="grid w-10 place-items-center text-[18px] text-[#bbb]" aria-hidden>
              ☺
            </span>
          </div>
          <div className="flex h-5 items-center justify-between text-[11px] text-[#9e9ea6]">
            <span>
              {waiting && (
                <>
                  <b>{costume.assistant}</b> is typing
                  <span className="dot ml-1 inline-block">.</span>
                  <span className="dot inline-block [animation-delay:.15s]">.</span>
                  <span className="dot inline-block [animation-delay:.3s]">.</span>
                </>
              )}
            </span>
            <span className="hidden sm:inline">
              <b>*bold*</b> <i>_italics_</i> ~strike~ <code>`code`</code> <code>```preformatted```</code> &gt;quote
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="relative mx-5 my-2 border-t border-[#e8e8e8] text-center">
      <span className="relative -top-2.5 bg-white px-3 text-[13px] font-bold text-[#555459]">{label}</span>
    </div>
  );
}

function Message({ line, prev, costume }: { line: ChatLine; prev?: ChatLine; costume: LayoutProps["costume"] }) {
  const bot = line.role === "assistant";
  const grouped = prev && prev.role === line.role && Math.abs(line.at - prev.at) < FIVE_MIN;
  if (grouped) {
    return (
      <div className="group flex px-5 py-0.5 hover:bg-[#f9f9f9]">
        <span className="w-[46px] shrink-0 pt-0.5 text-[10px] text-transparent group-hover:text-[#9e9ea6]">
          {clock(line.at)}
        </span>
        <div className="min-w-0 whitespace-pre-wrap break-words">{line.text}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5 px-5 pb-0.5 pt-2 hover:bg-[#f9f9f9]">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-[4px] text-lg ${
          bot ? "border border-[#e0e0e0] bg-white" : "bg-[#e8912d] font-black text-white"
        }`}
      >
        {bot ? costume.avatar : costume.user[0].toUpperCase()}
      </span>
      <div className="min-w-0">
        <div className="leading-tight">
          <b>{bot ? costume.assistant : costume.user}</b>
          {bot && <span className="ml-1 rounded-[3px] bg-[#e8e8e8] px-1 text-[10px] font-bold uppercase text-[#717274]">bot</span>}
          <span className="ml-1.5 text-[12px] text-[#9e9ea6]">{clock(line.at)}</span>
        </div>
        <div className="whitespace-pre-wrap break-words">{line.text}</div>
      </div>
    </div>
  );
}

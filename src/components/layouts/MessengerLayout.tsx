"use client";

import { Info, Phone, Settings, SquarePen, ThumbsUp, Video } from "lucide-react";
import { ChromeFrame } from "@/components/chrome";
import { useComposer, useStickyScroll } from "./hooks";
import { clock, type ChatLine, type LayoutProps } from "./types";

const BLUE = "#0084ff";
const LIKE = "👍";
const TEN_MIN = 10 * 60_000;

function shortTime(at: number) {
  const diff = Date.now() - at;
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return new Date(at).toLocaleDateString([], { weekday: "short" });
}

function Avatar({ emoji, size = 50 }: { emoji: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#e9ebee] to-[#cfd5df]"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {emoji}
    </span>
  );
}

/** messenger.com (2015) in a Chrome window on Windows 10. */
export function MessengerLayout({
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
  const lastUserIdx = lines.map((l) => l.role).lastIndexOf("user");
  const seen = lastUserIdx !== -1 && lastUserIdx < lines.length - 1;

  return (
    <ChromeFrame
      tab="Messenger"
      favicon={<span className="grid h-4 w-4 place-items-center rounded-full bg-[#0084ff] text-[9px] text-white">⚡</span>}
      url={`www.messenger.com/t/${costume.assistant}`}
    >
      <div className="flex h-full font-[Helvetica,Arial,sans-serif] text-[14px] text-[#1d2129]">
        <aside className="hidden w-[320px] shrink-0 flex-col border-r border-[#e5e5e5] md:flex">
          <div className="flex h-[50px] shrink-0 items-center justify-between border-b border-[#e5e5e5] px-3">
            <Settings className="h-5 w-5" style={{ color: BLUE }} aria-hidden />
            <b className="text-[16px]">Messenger</b>
            <button onClick={onNewThread} aria-label="New message" title="New message">
              <SquarePen className="h-5 w-5" style={{ color: BLUE }} />
            </button>
          </div>
          <div className="px-3 py-2">
            <div className="rounded-[4px] bg-[#f6f7f9] px-3 py-1.5 text-[13px] text-[#90949c]">🔍 Search Messenger</div>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Conversations">
            {threads.map((t) => {
              const on = t.id === activeId;
              return (
                <div key={t.id} className={`group flex items-center gap-3 px-3 py-2 ${on ? "bg-[#f1f0f0]" : "hover:bg-[#f6f7f9]"}`}>
                  <button onClick={() => onSelectThread(t.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Avatar emoji={t.draft ? "✏️" : costume.avatar} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[14px] font-bold">{t.draft ? costume.newThread : t.title}</span>
                        {!t.draft && <span className="shrink-0 text-[12px] text-[#90949c]">{shortTime(t.updatedAt)}</span>}
                      </span>
                      <span className="block truncate text-[13px] text-[#90949c]">{t.draft ? "Start a conversation" : t.preview}</span>
                    </span>
                  </button>
                  {!t.draft && (
                    <button
                      onClick={() => onDeleteThread(t.id)}
                      className="hidden h-6 w-6 shrink-0 place-items-center rounded-full text-[#90949c] hover:bg-[#e9ebee] group-hover:grid"
                      aria-label="Delete conversation"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[50px] shrink-0 items-center gap-3 border-b border-[#e5e5e5] px-4">
            <div className="min-w-0 flex-1 text-center md:text-left">
              <b className="block text-[16px] leading-tight">{costume.assistant}</b>
              <span className="text-[12px] text-[#90949c]">Active now</span>
            </div>
            <span className="flex gap-4" style={{ color: BLUE }} aria-hidden>
              <Phone className="h-5 w-5" />
              <Video className="h-5 w-5" />
              <Info className="h-5 w-5" />
            </span>
          </header>

          <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <div className="mb-6 flex flex-col items-center pt-4 text-center">
              <Avatar emoji={costume.avatar} size={72} />
              <b className="mt-2 text-[18px]">{costume.assistant}</b>
              <span className="text-[13px] text-[#90949c]">You&apos;re friends on Facebook · Works at gpty.lol</span>
            </div>
            <Bubbles lines={[{ id: "greet", role: "assistant", text: costume.greeting, at: 0 }, ...lines]} costume={costume} />
            {seen && (
              <div className="mt-0.5 flex justify-end">
                <span className="grid h-[14px] w-[14px] place-items-center rounded-full bg-[#e9ebee] text-[8px]" title="Seen">
                  {costume.avatar}
                </span>
              </div>
            )}
            {waiting && (
              <div className="mt-2 flex items-end gap-2">
                <Avatar emoji={costume.avatar} size={28} />
                <span className="flex gap-1 rounded-[18px] bg-[#f1f0f0] px-3 py-3" role="status" aria-label={costume.typing}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="dot h-2 w-2 rounded-full bg-[#90949c]" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              </div>
            )}
            {error && (
              <p role="alert" className="mt-2 text-right text-[12px] text-[#fa3e3e]">
                {costume.error}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t border-[#e5e5e5] px-3 py-2">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={costume.placeholder}
              aria-label="Message"
              className="max-h-28 min-w-0 flex-1 resize-none py-1.5 outline-none placeholder:text-[#90949c]"
            />
            <span className="flex items-center gap-3 text-[18px] grayscale-[.2]" aria-hidden>
              <span>🖼️</span>
              <span className="rounded-[3px] border border-[#90949c] px-0.5 text-[9px] font-bold leading-tight text-[#90949c]">GIF</span>
              <span>😊</span>
            </span>
            {value.trim() ? (
              <button onClick={submit} disabled={busy} className="px-1 text-[14px] font-bold disabled:opacity-50" style={{ color: BLUE }}>
                Send
              </button>
            ) : (
              <button onClick={() => !busy && onSend(LIKE)} disabled={busy} aria-label="Send a like" className="disabled:opacity-50">
                <ThumbsUp className="h-6 w-6" fill={BLUE} stroke="white" strokeWidth={1.2} />
              </button>
            )}
          </div>
        </section>
      </div>
    </ChromeFrame>
  );
}

function Bubbles({ lines, costume }: { lines: ChatLine[]; costume: LayoutProps["costume"] }) {
  return (
    <>
      {lines.map((l, i) => {
        const prev = lines[i - 1];
        const next = lines[i + 1];
        const mine = l.role === "user";
        const first = !prev || prev.role !== l.role;
        const last = !next || next.role !== l.role;
        const gap = Boolean(prev && l.at && prev.at && l.at - prev.at > TEN_MIN);
        const like = l.text.trim() === LIKE;
        // Corners round fully at the ends of a group and tighten in the middle.
        const r = mine
          ? `rounded-l-[18px] ${first ? "rounded-tr-[18px]" : "rounded-tr-[4px]"} ${last ? "rounded-br-[18px]" : "rounded-br-[4px]"}`
          : `rounded-r-[18px] ${first ? "rounded-tl-[18px]" : "rounded-tl-[4px]"} ${last ? "rounded-bl-[18px]" : "rounded-bl-[4px]"}`;
        return (
          <div key={l.id}>
            {gap && <div className="my-3 text-center text-[12px] font-bold uppercase text-[#90949c]">{clock(l.at)}</div>}
            <div className={`flex items-end gap-2 ${first && i > 0 ? "mt-2" : "mt-[2px]"} ${mine ? "justify-end" : ""}`}>
              {!mine && (last ? <Avatar emoji={costume.avatar} size={28} /> : <span className="w-7 shrink-0" />)}
              {like ? (
                <ThumbsUp className="h-11 w-11" fill={BLUE} stroke="white" strokeWidth={1} aria-label="Like" />
              ) : (
                <div
                  className={`max-w-[62%] whitespace-pre-wrap break-words px-3 py-[7px] text-[14px] leading-[1.35] ${r}`}
                  style={mine ? { background: BLUE, color: "#fff" } : { background: "#f1f0f0", color: "#000" }}
                  title={l.at ? clock(l.at) : undefined}
                >
                  {l.text}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

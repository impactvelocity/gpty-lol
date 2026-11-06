"use client";

import { AeroTitleBar, SkypeLogo, SkypeTick } from "@/components/chrome";
import { useComposer, useNow, useStickyScroll } from "./hooks";
import { clock, type LayoutProps } from "./types";

/** Skype 3 on Windows Vista: Aero glass, contacts left, chat right, big call buttons. */
export function SkypeLayout({
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
  const { value, setValue, submit, onKeyDown } = useComposer(onSend, busy);
  const scroller = useStickyScroll<HTMLDivElement>(lines);
  const now = useNow(30_000);
  const active = threads.find((t) => t.id === activeId);
  const name = active && !active.draft ? active.title : costume.assistant;

  return (
    <div className="aero-window flex h-full flex-col px-[7px] pb-[7px] font-['Segoe_UI',Tahoma,sans-serif] text-[12px] text-[#222]">
      <AeroTitleBar
        title={`Skype™ - ${name}`}
        icon={<span className="grid h-4 w-4 place-items-center rounded-full bg-[#00aff0] text-[9px] font-black italic text-white">S</span>}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2px] border border-black/40 bg-white">
        <div className="flex h-[22px] shrink-0 items-center gap-3 border-b border-[#d5dfe5] bg-gradient-to-b from-white to-[#eef3f7] px-2 text-[12px]">
          {["Skype", "Contacts", "Conversation", "Call", "View", "Tools", "Help"].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>

        {/* Profile strip */}
        <div className="flex shrink-0 items-center gap-3 border-b border-[#c7dbe8] bg-gradient-to-b from-[#f5fbff] to-[#dceffa] px-3 py-2">
          <SkypeLogo small />
          <span className="flex items-center gap-1.5 font-semibold">
            <SkypeTick /> {costume.user} <span className="font-normal text-[#888]">▾</span>
          </span>
          <span className="hidden truncate italic text-[#5d7c90] sm:inline">“free calls?? in this economy??”</span>
          <span className="ml-auto hidden text-[#0078c8] md:inline">SkypeOut credit: €0.00 · Skype Find</span>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Contacts */}
          <aside className="hidden w-64 shrink-0 flex-col border-r border-[#c7dbe8] bg-[#f7fbfe] md:flex">
            <div className="flex shrink-0 gap-0.5 px-2 pt-2 text-[12px]">
              <span className="rounded-t-[4px] border border-b-0 border-[#b9cfdf] bg-white px-3 py-1 font-semibold text-[#0078c8]">
                Contacts
              </span>
              <span className="rounded-t-[4px] border border-b-0 border-transparent px-3 py-1 text-[#666]">History</span>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto border-t border-[#b9cfdf] bg-white py-1" aria-label="Contacts">
              {threads.map((t) => {
                const on = t.id === activeId;
                return (
                  <div
                    key={t.id}
                    className={`group mx-1 flex items-center gap-2 rounded-[3px] px-2 py-1.5 ${
                      on ? "bg-gradient-to-b from-[#dff3fd] to-[#bfe6fa] ring-1 ring-[#7cc7ec]" : "hover:bg-[#eef8fd]"
                    }`}
                  >
                    <SkypeTick away={!t.draft && now - t.updatedAt > 3_600_000} />
                    <button onClick={() => onSelectThread(t.id)} className="min-w-0 flex-1 text-left leading-tight">
                      <span className="block truncate font-semibold">{t.draft ? costume.newThread : t.title}</span>
                      {t.preview && <span className="block truncate text-[11px] italic text-[#7a8c99]">{t.preview}</span>}
                    </button>
                    {!t.draft && (
                      <button
                        onClick={() => onDeleteThread(t.id)}
                        className="hidden text-[#999] hover:text-[#d9381e] group-hover:block"
                        aria-label="Delete conversation"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>
            <div className="flex shrink-0 gap-2 border-t border-[#c7dbe8] p-2">
              <button onClick={onNewThread} className="flex-1 rounded-[3px] border border-[#9cc2da] bg-gradient-to-b from-white to-[#e2eef6] py-1 text-[#0078c8] hover:brightness-105">
                ＋ Add contact
              </button>
              <span className="rounded-[3px] border border-[#9cc2da] bg-gradient-to-b from-white to-[#e2eef6] px-3 py-1 text-[#0078c8]">
                🔍
              </span>
            </div>
            {/* The famous big buttons */}
            <div className="flex shrink-0 gap-2 px-2 pb-2">
              <span
                className="grid h-11 flex-1 place-items-center rounded-full bg-gradient-to-b from-[#9be36a] via-[#4fb31f] to-[#2e8a0e] text-xl text-white shadow-[inset_0_1px_rgba(255,255,255,.7),0_1px_2px_rgba(0,0,0,.3)]"
                title="Call (decorative)"
                aria-hidden
              >
                📞
              </span>
              <button
                onClick={onStop}
                disabled={!busy}
                title="Hang up (stops the reply)"
                className="grid h-11 flex-1 place-items-center rounded-full bg-gradient-to-b from-[#ff9a86] via-[#e2401f] to-[#b0230a] text-xl text-white shadow-[inset_0_1px_rgba(255,255,255,.6),0_1px_2px_rgba(0,0,0,.3)] disabled:opacity-70"
              >
                <span className="rotate-[135deg]">📞</span>
              </button>
            </div>
          </aside>

          {/* Chat */}
          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center gap-3 border-b border-[#d5e3ec] px-3 py-2">
              <span className="grid h-12 w-12 place-items-center rounded-[4px] border border-[#b9cfdf] bg-gradient-to-b from-[#f1f9ff] to-[#d4ecfa] text-2xl">
                {costume.avatar}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-1.5 truncate text-[15px] font-semibold">
                  <SkypeTick /> {costume.assistant}
                </div>
                <div className="truncate text-[11px] italic text-[#7a8c99]">
                  {busy ? "typing…" : "can u hear me now?? 🎧"} · Local time: {clock(now)}
                </div>
              </div>
              <span className="hidden gap-1.5 lg:flex" aria-hidden>
                <span className="rounded-[3px] bg-gradient-to-b from-[#8ddc5b] to-[#3d9b17] px-3 py-1 font-semibold text-white">📞 Call</span>
                <span className="rounded-[3px] border border-[#9cc2da] bg-gradient-to-b from-white to-[#e2eef6] px-2 py-1">🎥 Video</span>
                <span className="rounded-[3px] border border-[#9cc2da] bg-gradient-to-b from-white to-[#e2eef6] px-2 py-1">📁 Send file</span>
              </span>
            </div>

            <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
              <Row who={costume.assistant} text={costume.greeting} at={0} them />
              {lines.map((l, i) => (
                <Row
                  key={l.id}
                  who={l.role === "user" ? costume.user : costume.assistant}
                  text={l.text}
                  at={l.at}
                  them={l.role === "assistant"}
                  compact={i > 0 && lines[i - 1].role === l.role}
                />
              ))}
              {waiting && <p className="py-1 text-[11px] italic text-[#7a8c99]">✎ {costume.typing}</p>}
              {error && <p className="py-1 text-[#d9381e]">⚠ {costume.error}</p>}
            </div>

            <div className="flex shrink-0 items-end gap-2 border-t border-[#d5e3ec] bg-[#f4f9fc] p-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-b from-[#ffe46b] to-[#f5b400] text-[15px] shadow-inner" aria-hidden>
                🙂
              </span>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder={costume.placeholder}
                aria-label="Message"
                className="min-w-0 flex-1 resize-none rounded-[3px] border border-[#9cc2da] bg-white px-2 py-1 outline-none focus:border-[#00aff0]"
              />
              <button
                onClick={submit}
                disabled={busy || !value.trim()}
                className="h-8 rounded-[3px] border border-[#0a8ccc] bg-gradient-to-b from-[#5fcdf8] to-[#0094d9] px-4 font-semibold text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </section>
        </div>

        <div className="flex h-[22px] shrink-0 items-center gap-2 border-t border-[#c7dbe8] bg-gradient-to-b from-[#f4f8fb] to-[#e3ecf2] px-2 text-[11px] text-[#555]">
          <SkypeTick className="h-3 w-3" /> Online
          <span className="ml-auto">8,214,322 users online</span>
        </div>
      </div>
    </div>
  );
}

function Row({
  who,
  text,
  at,
  them,
  compact,
}: {
  who: string;
  text: string;
  at: number;
  them?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`grid grid-cols-[96px_1fr_auto] gap-2 ${compact ? "pt-0.5" : "mt-1.5 border-t border-[#eef3f6] pt-1.5 first:mt-0 first:border-t-0"}`}>
      <span className={`truncate text-right font-semibold ${them ? "text-[#0078c8]" : "text-[#555]"}`}>
        {compact ? "" : who}
      </span>
      <span className="min-w-0 whitespace-pre-wrap break-words">{text}</span>
      <span className="text-[11px] text-[#9aa8b2]">{at ? clock(at) : ""}</span>
    </div>
  );
}

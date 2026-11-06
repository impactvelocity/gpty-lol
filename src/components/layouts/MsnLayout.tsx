"use client";

import { useRef, useState } from "react";
import { MsnBuddy, XpTitleBar } from "@/components/chrome";
import { playNudge } from "@/lib/sounds";
import { useComposer, useNow, useOnNewReply, useStickyScroll } from "./hooks";
import { clock, type LayoutProps, type ThreadItem } from "./types";

export const NUDGE = "/nudge";

/** MSN-era text emoticons rendered as smileys. Longest codes first. */
const EMOTICONS: [RegExp, string][] = [
  [/\(Y\)/gi, "👍"],
  [/\(N\)/gi, "👎"],
  [/\(L\)/gi, "❤️"],
  [/\(U\)/gi, "💔"],
  [/\(K\)/gi, "💋"],
  [/\(F\)/gi, "🌹"],
  [/\(\*\)/g, "⭐"],
  [/\(8\)/g, "🎵"],
  [/:-?D/g, "😃"],
  [/:-?P/gi, "😛"],
  [/;-?\)/g, "😉"],
  [/:'\(/g, "😢"],
  [/:-?\(/g, "🙁"],
  [/:-?\)/g, "🙂"],
  [/:-?O/g, "😮"],
  [/:-?S/g, "😕"],
  [/:-?\|/g, "😐"],
  [/:-?\$/g, "😳"],
  [/:-?@/g, "😠"],
  [/8-?\)/g, "😎"],
];

function emoticons(text: string) {
  return EMOTICONS.reduce((s, [re, e]) => s.replace(re, e), text);
}

const TOOLS = [
  ["🧑‍🤝‍🧑", "Invite"],
  ["📁", "Send Files"],
  ["📷", "Webcam"],
  ["🎧", "Audio"],
  ["🧩", "Activities"],
  ["🎲", "Games"],
];

/** MSN Messenger 7.5 on Windows XP. */
export function MsnLayout({
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
  const win = useRef<HTMLDivElement>(null);
  const now = useNow(30_000);
  const [toast, setToast] = useState<{ k: number; id: string } | null>(null);

  const shake = () => {
    const el = win.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.remove("nudge");
    void el.offsetWidth; // restart the animation
    el.classList.add("nudge");
  };

  useOnNewReply(lines, () => {
    // Keep the id, not the text: the reply is still streaming at this point.
    const last = lines.at(-1);
    if (last) setToast({ k: Date.now(), id: last.id });
  });

  const lastReply = [...lines].reverse().find((l) => l.role === "assistant");
  const sendNudge = () => {
    if (busy) return;
    shake();
    playNudge();
    onSend(NUDGE);
  };

  return (
    <div ref={win} className="xp-window flex h-full flex-col font-[Tahoma,Verdana,sans-serif] text-[12px] text-black">
      <XpTitleBar title={`${costume.assistant} - Conversation`} icon={<MsnBuddy className="h-4 w-4" />} />

      <div className="flex min-h-0 flex-1 bg-[#ece9d8]">
        {/* Contact list */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-[#7f9db9] bg-white md:flex">
          <div className="bg-gradient-to-b from-[#c7d8f6] via-[#e3ecfb] to-white px-2.5 pb-2 pt-2.5">
            <div className="flex items-center gap-2">
              <span className="grid h-11 w-11 place-items-center rounded-[4px] border border-[#7f9db9] bg-white text-2xl shadow-[inset_0_0_0_2px_#fff]">
                {costume.userAvatar}
              </span>
              <div className="min-w-0 leading-tight">
                <div className="truncate font-bold">
                  {costume.user} <span className="font-normal text-[#4f6fa8]">(Online) ▾</span>
                </div>
                <div className="truncate italic text-[#7d8aa3]">&lt;Type a personal message&gt;</div>
                <div className="truncate text-[11px] text-[#5470b9]">♫ Hoobastank - The Reason</div>
              </div>
            </div>
            <div className="mt-2 rounded-[3px] border border-[#a5b9de] bg-white px-2 py-0.5 text-[#9aa6bd]">
              Find a contact...
            </div>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto px-1.5 py-1" aria-label="Conversations">
            <div className="flex items-center gap-1 px-1 py-0.5 font-bold text-[#1b3fa0]">
              <span className="text-[9px]">▼</span> Conversations ({threads.filter((t) => !t.draft).length})
            </div>
            {threads.map((t) => (
              <Contact
                key={t.id}
                t={t}
                label={t.draft ? costume.newThread : t.title}
                active={t.id === activeId}
                onSelect={onSelectThread}
                onDelete={onDeleteThread}
              />
            ))}
            <div className="mt-1 flex items-center gap-1 px-1 py-0.5 font-bold text-[#1b3fa0]">
              <span className="text-[9px]">▶</span> Offline (12)
            </div>
          </nav>
          <button onClick={onNewThread} className="flex items-center gap-1.5 px-3 py-1.5 text-left text-[#1b3fa0] hover:underline">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[#4fc22c] text-[11px] font-bold text-white">+</span>
            Start a new conversation
          </button>
          <div className="m-2 mt-0 rounded-[3px] border border-[#c5d3ee] bg-gradient-to-r from-[#fff6d6] to-[#ffe7a8] px-2 py-1.5 text-center text-[11px] text-[#7a5300]">
            <b>MSN Spaces</b> — share your blog, photos &amp; music!
          </div>
        </aside>

        {/* Conversation */}
        <section className="flex min-w-0 flex-1 flex-col bg-gradient-to-b from-[#d8e5f9] to-[#f1f5fc]">
          <div className="border-b border-[#a9bfe5] bg-gradient-to-b from-white to-[#e4ecfb] px-3 py-1.5">
            <div className="truncate">
              To: <b>{costume.assistant}</b> <span className="text-[#5470b9]">&lt;gpty@hotmail.com&gt;</span>
            </div>
            <div className="truncate text-[11px] italic text-[#7d8aa3]">~*~ im not addicted 2 msn, i can stop whenever i want ~*~</div>
          </div>
          <div className="flex items-end gap-1 border-b border-[#a9bfe5] px-2 py-1" aria-hidden>
            {TOOLS.map(([icon, label]) => (
              <span key={label} className="flex w-[62px] flex-col items-center rounded-[3px] px-1 py-0.5 hover:bg-white/70">
                <span className="text-[20px] leading-none">{icon}</span>
                <span className="mt-0.5 text-[11px] text-[#1b3fa0]">{label}</span>
              </span>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[1fr_auto] grid-rows-[1fr_auto] gap-2 p-2">
            <div ref={scroller} className="col-start-1 row-start-1 min-h-0 overflow-y-auto rounded-[3px] border border-[#7f9db9] bg-white p-2">
              <p className="mb-2 text-[11px] text-[#7d8aa3]">
                Never give out your password or credit card number in an instant message conversation.
              </p>
              <Said who={costume.assistant} text={emoticons(costume.greeting)} buddy />
              {lines.map((l) =>
                l.role === "user" && l.text === NUDGE ? (
                  <p key={l.id} className="my-1.5 border-y border-[#e3e8f2] py-1 text-[#7d8aa3]">
                    You have just sent a nudge.
                  </p>
                ) : (
                  <Said
                    key={l.id}
                    who={l.role === "user" ? costume.user : costume.assistant}
                    text={emoticons(l.text)}
                    buddy={l.role === "assistant"}
                  />
                ),
              )}
              {error && <p className="mt-1 text-[#c00000]">{costume.error}</p>}
            </div>
            <Picture emoji={costume.avatar} className="col-start-2 row-start-1" />

            <div className="col-start-1 row-start-2 flex min-w-0 flex-col overflow-hidden rounded-[3px] border border-[#7f9db9] bg-white">
              <div className="flex items-center gap-0.5 border-b border-[#d5deef] bg-gradient-to-b from-white to-[#eef3fc] px-1 py-0.5">
                <span className="rounded px-1.5 font-serif text-[14px] font-bold text-[#1b3fa0]">A</span>
                <span className="rounded px-1 hover:bg-[#dce7fb]" aria-hidden>🙂▾</span>
                <span className="rounded px-1 hover:bg-[#dce7fb]" aria-hidden>😉▾</span>
                <button
                  onClick={sendNudge}
                  disabled={busy}
                  title="Send a nudge"
                  className="rounded px-1.5 text-[#1b3fa0] hover:bg-[#dce7fb] disabled:opacity-50"
                >
                  📳 Nudge
                </button>
                <span className="rounded px-1 hover:bg-[#dce7fb]" aria-hidden>🎤</span>
                <span className="rounded px-1 hover:bg-[#dce7fb]" aria-hidden>🖼️▾</span>
              </div>
              <div className="flex min-h-0 gap-1.5 p-1.5">
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={3}
                  aria-label="Message"
                  className="min-w-0 flex-1 resize-none font-[Tahoma,sans-serif] text-[12px] outline-none"
                />
                <div className="flex w-[62px] flex-col gap-1">
                  <button onClick={submit} disabled={busy || !value.trim()} className="xp-btn flex-1 font-bold">
                    Send
                  </button>
                  <span className="xp-btn py-0.5 text-center text-[11px]" aria-hidden>
                    Search ▾
                  </span>
                </div>
              </div>
            </div>
            <Picture emoji={costume.userAvatar} className="col-start-2 row-start-2" />
          </div>

          <div className="flex h-[22px] items-center border-t border-[#a9bfe5] bg-[#ece9d8] px-2 text-[11px] text-[#444]">
            {waiting
              ? costume.typing
              : lastReply
                ? `Last message received at ${clock(lastReply.at)} on ${new Date(lastReply.at || now).toLocaleDateString()}.`
                : ""}
          </div>
        </section>
      </div>

      {toast && (
        <div
          key={toast.k}
          className="toast-up pointer-events-none fixed bottom-4 right-4 z-50 w-[210px] overflow-hidden rounded-t-[4px] border border-[#3a62c1] bg-gradient-to-b from-[#f3f7ff] to-[#c8d9f7] text-[11px] shadow-xl"
          role="status"
        >
          <div className="flex items-center gap-1 bg-gradient-to-b from-[#7ea4ea] to-[#3d6ad1] px-1.5 py-0.5 font-bold text-white">
            <MsnBuddy className="h-3.5 w-3.5" /> MSN Messenger
          </div>
          <div className="px-2.5 py-2">
            <b className="text-[#1b3fa0]">{costume.assistant}</b> says:
            <div className="line-clamp-2 text-[#333]">{emoticons(lines.find((l) => l.id === toast.id)?.text ?? "")}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Contact({
  t,
  label,
  active,
  onSelect,
  onDelete,
}: {
  t: ThreadItem;
  label: string;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`group flex items-center gap-1.5 rounded-[3px] px-2 py-[3px] ${
        active ? "bg-[#c5d6f5] ring-1 ring-[#7d9ee0]" : "hover:bg-[#e8effc]"
      }`}
    >
      <MsnBuddy className="h-4 w-4 shrink-0" />
      <button onClick={() => onSelect(t.id)} className="min-w-0 flex-1 truncate text-left">
        {label}
        {t.preview && <span className="text-[#8c96a8]"> - {emoticons(t.preview)}</span>}
      </button>
      {!t.draft && (
        <button onClick={() => onDelete(t.id)} className="hidden text-[#8c96a8] hover:text-[#c00000] group-hover:block" aria-label={`Delete ${label}`}>
          ×
        </button>
      )}
    </div>
  );
}

function Picture({ emoji, className = "" }: { emoji: string; className?: string }) {
  return (
    <div className={`hidden w-[104px] flex-col items-center sm:flex ${className}`}>
      <div className="grid h-[96px] w-[96px] place-items-center rounded-[6px] border border-[#7f9db9] bg-gradient-to-b from-white to-[#dfe9fb] p-1 text-[52px] shadow-[inset_0_0_0_3px_#fff]">
        {emoji}
      </div>
      <span className="mt-0.5 text-[10px] text-[#5470b9]">▾</span>
    </div>
  );
}

function Said({ who, text, buddy }: { who: string; text: string; buddy?: boolean }) {
  return (
    <div className="mb-1.5 whitespace-pre-wrap break-words">
      <div className="text-[#666]">{who} says:</div>
      <div
        className={`pl-3 ${buddy ? "font-['Comic_Sans_MS','Comic_Sans',cursive] text-[13px] text-[#7b2cbf]" : "text-black"}`}
      >
        {text}
      </div>
    </div>
  );
}

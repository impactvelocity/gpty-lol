"use client";

import { useComposer, useStickyScroll } from "./hooks";
import type { LayoutProps, ThreadItem } from "./types";

const ROW1 = "ABCDEFGHIJKLM".split("");
const ROW2 = "NOPQRSTUVWXYZ".split("");
const NUMS = "1234567890".split("");

const INK = "#cdab6e";
const GLOW = "#ffcf66";
const PALE = "#e9d8ae";

/** A wooden planchette with a window, drawn inline so it can glow. */
function Planchette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 72" className={className} aria-hidden>
      <path
        d="M30 2C46 2 58 16 58 32c0 18-16 30-28 38C18 62 2 50 2 32 2 16 14 2 30 2Z"
        fill="#5a3a1e"
        stroke="#2b1a0c"
        strokeWidth="2.5"
      />
      <circle cx="30" cy="27" r="9" fill="#0d0906" stroke="#c9a227" strokeWidth="2" />
    </svg>
  );
}

function Key({ c, active }: { c: string; active: boolean }) {
  return (
    <span
      className="grid h-7 w-5 place-items-center font-serif text-[17px] transition-all duration-100 sm:h-8 sm:w-6 sm:text-[21px]"
      style={
        active
          ? { color: GLOW, textShadow: `0 0 16px ${GLOW}, 0 0 5px ${GLOW}`, transform: "scale(1.6)" }
          : { color: INK, textShadow: "0 1px 0 rgba(0,0,0,.6)" }
      }
    >
      {c}
    </span>
  );
}

/** A candlelit séance, 1888. Replies are spelled out on the board as they stream in. */
export function SeanceLayout({
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
  const active = threads.find((t) => t.id === activeId);

  // The letter under the planchette: the newest character of a streaming reply.
  const last = lines.at(-1);
  const streamText = busy && last?.role === "assistant" ? last.text : "";
  const spelled = streamText.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const lit = busy ? spelled.at(-1) ?? null : null;
  const word = (w: string) => busy && streamText.toUpperCase().includes(w);

  const ask = (w: string) => !busy && onSend(w);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-xl font-serif text-[15px] shadow-[0_24px_80px_rgba(0,0,0,.8)] ring-1 ring-[#3a2414]"
      style={{ background: "radial-gradient(ellipse 90% 80% at 50% 0%, #1d1009, #0d0806 70%)", color: "#d8c49a" }}
    >
      {/* Candles */}
      <div className="pointer-events-none absolute left-5 top-4 z-10 hidden flex-col items-center sm:flex" aria-hidden>
        <span className="flame" />
        <span className="h-9 w-3 rounded-sm" style={{ background: "linear-gradient(#f3e6c8,#b3a07a)" }} />
      </div>
      <div className="pointer-events-none absolute right-5 top-4 z-10 hidden flex-col items-center sm:flex" aria-hidden>
        <span className="flame" />
        <span className="h-7 w-3 rounded-sm" style={{ background: "linear-gradient(#f3e6c8,#b3a07a)" }} />
      </div>

      <header className="shrink-0 pt-3 text-center tracking-[0.5em] text-[#c9a227]">
        ✦ THE SPIRIT BOARD ✦
      </header>

      <div className="flex min-h-0 flex-1 gap-3 p-3 sm:px-6">
        {/* The medium's ledger */}
        <aside data-threads className="hidden w-52 shrink-0 flex-col rounded-lg border border-[#3a2414] bg-black/30 p-2 md:flex">
          <div className="pb-1 text-center text-[12px] tracking-[0.3em] text-[#9a7b4f]">
            THE LEDGER
          </div>
          <button
            onClick={onNewThread}
            className="rounded px-2 py-1 text-left italic text-[#c9a227] hover:bg-white/5"
          >
            ✎ {costume.newThread}
          </button>
          <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Sittings">
            {threads
              .filter((t) => !t.draft)
              .map((t, i) => (
                <Sitting key={t.id} t={t} n={i + 1} active={t.id === activeId} onSelect={onSelectThread} onDelete={onDeleteThread} />
              ))}
          </nav>
          <div className="pt-1 text-center text-[11px] italic text-[#6d5636]">
            Sitting of {active?.draft || !active ? "this evening" : "record"} · est. 1888
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-2">
          {/* The board */}
          <div
            className="relative shrink-0 rounded-[1.6rem] border-4 border-[#1b0f06] px-3 pb-2 pt-2 shadow-[inset_0_2px_18px_rgba(0,0,0,.55),0_10px_30px_rgba(0,0,0,.5)] sm:px-6"
            style={{ background: "radial-gradient(ellipse at center, #5a3a1e 0%, #3b2412 70%, #24150a 100%)" }}
          >
            <div className="flex items-center justify-between font-serif text-xl sm:text-2xl" style={{ color: PALE }}>
              <button onClick={() => ask("YES")} disabled={busy} className="rounded px-2 transition hover:text-[#ffcf66] disabled:opacity-60" style={word("YES") ? { color: GLOW, textShadow: `0 0 14px ${GLOW}` } : undefined}>
                YES
              </button>
              <span style={{ color: GLOW }}>☾ ✦ ☽</span>
              <button onClick={() => ask("NO")} disabled={busy} className="rounded px-2 transition hover:text-[#ffcf66] disabled:opacity-60" style={word("NO") ? { color: GLOW, textShadow: `0 0 14px ${GLOW}` } : undefined}>
                NO
              </button>
            </div>
            <div className="flex justify-center">{ROW1.map((c) => <Key key={c} c={c} active={lit === c} />)}</div>
            <div className="flex justify-center">{ROW2.map((c) => <Key key={c} c={c} active={lit === c} />)}</div>
            <div className="flex justify-center">{NUMS.map((c) => <Key key={c} c={c} active={lit === c} />)}</div>
            <div className="mt-0.5 text-center">
              <button
                onClick={() => ask("GOODBYE")}
                disabled={busy}
                className="font-serif text-lg tracking-[0.45em] transition hover:text-[#ffcf66] disabled:opacity-60"
                style={word("GOODBYE") ? { color: GLOW, textShadow: `0 0 14px ${GLOW}` } : { color: PALE }}
              >
                GOODBYE
              </button>
            </div>
            {waiting && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <Planchette className="planchette h-16 w-14 drop-shadow-[0_0_18px_rgba(255,207,102,.55)]" />
              </div>
            )}
          </div>

          {/* The record of the sitting */}
          <div
            ref={scroller}
            className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-[#3a2414] bg-black/30 px-4 py-3 leading-relaxed"
            aria-live="polite"
          >
            <p className="mb-3 whitespace-pre-wrap tracking-[0.12em] text-[#b89a62]">{costume.greeting}</p>
            {lines.map((l) =>
              l.role === "user" ? (
                <p key={l.id} className="mb-1 italic text-[#9b8a6a]">
                  The {costume.user.toLowerCase().replace("the ", "")} asks — {l.text}
                </p>
              ) : (
                <p key={l.id} className="mb-3 whitespace-pre-wrap break-words tracking-[0.14em] text-[#ecd9a8] [text-shadow:0_0_10px_rgba(255,207,102,.25)]">
                  {l.text}
                </p>
              ),
            )}
            {waiting && <p className="italic text-[#8a6f45]">{costume.typing}</p>}
            {error && <p className="tracking-[0.12em] text-[#c0392b]">{costume.error}</p>}
          </div>

          {/* Invocation */}
          <div className="flex shrink-0 gap-2">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={costume.placeholder}
              aria-label="Message"
              spellCheck={false}
              className="min-w-0 flex-1 rounded-lg border border-[#4a2f18] bg-black/45 px-3 py-2 font-serif italic text-[#e9d8ae] outline-none placeholder:text-[#6d5636] focus:border-[#c9a227]"
            />
            <button
              onClick={submit}
              disabled={busy || !value.trim()}
              className="rounded-lg border border-[#c9a227] px-5 font-serif tracking-[0.25em] text-[#ffcf66] transition hover:bg-[#c9a227]/15 disabled:opacity-40"
            >
              INVOKE
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Sitting({
  t,
  n,
  active,
  onSelect,
  onDelete,
}: {
  t: ThreadItem;
  n: number;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`group flex items-center gap-1 rounded px-1 ${active ? "bg-[#c9a227]/15" : "hover:bg-white/5"}`}>
      <button onClick={() => onSelect(t.id)} className="min-w-0 flex-1 truncate py-1 text-left">
        <span className="text-[#9a7b4f]">{String(n).padStart(2, "0")}.</span>{" "}
        <span className={active ? "text-[#ffcf66]" : ""}>{t.title}</span>
      </button>
      <button
        onClick={() => onDelete(t.id)}
        className="hidden px-1 text-[#8a4a3a] group-hover:block"
        aria-label={`Burn the record of ${t.title}`}
        title="Burn this record"
      >
        🔥
      </button>
    </div>
  );
}

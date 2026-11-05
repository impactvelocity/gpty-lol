"use client";

import { useEffect, useState } from "react";
import { useComposer } from "./hooks";
import type { LayoutProps } from "./types";

const ROW1 = "ABCDEFGHIJKLM".split("");
const ROW2 = "NOPQRSTUVWXYZ".split("");
const NUMS = "1234567890".split("");

/**
 * Ouija board. The latest reply is spelled out one letter at a time while the
 * planchette glows over the matching letter. The full reply is also shown as
 * plain text below the board, so nothing depends on the animation.
 */
export function SeanceLayout({
  costume,
  lines,
  busy,
  waiting,
  error,
  onSend,
  onOpenWardrobe,
}: LayoutProps) {
  const { value, setValue, submit, onKeyDown } = useComposer(onSend, busy);
  const lastReply = [...lines].reverse().find((l) => l.role === "assistant");
  const lastAsk = [...lines].reverse().find((l) => l.role === "user");
  const reply = lastReply && lines.at(-1)?.role === "assistant" ? lastReply.text : "";
  return (
    <div
      className="relative flex h-dvh flex-col items-center gap-3 overflow-y-auto p-3 sm:p-6"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <div className="candle" aria-hidden />
      <div className="flex w-full max-w-3xl items-center justify-between text-sm">
        <span className="font-serif text-lg tracking-widest" style={{ color: "var(--glow)" }}>
          ✦ {costume.name.toUpperCase()} ✦
        </span>
        <button
          onClick={onOpenWardrobe}
          className="rounded border px-3 py-1 hover:bg-white/10"
          style={{ borderColor: "var(--glow)", color: "var(--glow)" }}
        >
          🎭 Change costume
        </button>
      </div>

      <Board key={lastReply?.id ?? "none"} reply={reply} waiting={waiting} />

      <div
        className="min-h-24 w-full max-w-3xl whitespace-pre-wrap break-words rounded-lg border p-4 font-serif text-lg"
        style={{ borderColor: "color-mix(in srgb, var(--glow) 40%, transparent)" }}
        aria-live="polite"
      >
        {lastAsk && (
          <div className="mb-2 text-sm opacity-60">
            {costume.user}: {lastAsk.text}
          </div>
        )}
        {waiting ? (
          <span className="animate-pulse">{costume.typing}</span>
        ) : error ? (
          costume.error
        ) : reply ? (
          <>
            <span style={{ color: "var(--glow)" }}>{costume.avatar} </span>
            {reply}
          </>
        ) : (
          <span className="opacity-70">{costume.greeting}</span>
        )}
      </div>

      <div className="flex w-full max-w-3xl gap-2 pb-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={costume.placeholder}
          aria-label="Message"
          className="min-w-0 flex-1 resize-none rounded border bg-black/40 p-3 font-serif text-lg outline-none"
          style={{ borderColor: "var(--glow)", color: "var(--ink)" }}
        />
        <button
          onClick={submit}
          disabled={busy || !value.trim()}
          className="rounded px-5 font-serif text-lg font-bold text-black disabled:opacity-40"
          style={{ background: "var(--glow)" }}
        >
          {costume.send}
        </button>
      </div>
    </div>
  );
}

function Key({ c, active }: { c: string; active: string | null }) {
  const on = active === c;
  return (
    <span
      className="grid h-8 w-6 place-items-center font-serif text-lg transition-all sm:h-10 sm:w-8 sm:text-2xl"
      style={{
        color: on ? "var(--glow)" : "var(--ink)",
        textShadow: on ? "0 0 14px var(--glow), 0 0 4px var(--glow)" : "none",
        transform: on ? "scale(1.5)" : "none",
      }}
    >
      {c}
    </span>
  );
}

/** Lights up the letters of `reply` one by one. Remount (key) to restart. */
function Board({ reply, waiting }: { reply: string; waiting: boolean }) {
  const chars = reply.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((n) => n + 1), 140);
    return () => clearInterval(t);
  }, []);

  const active = step < chars.length ? chars[step] : null;

  return (
    <div
      className="relative w-full max-w-3xl rounded-[2rem] border-4 p-4 shadow-2xl sm:p-8"
      style={{
        background:
          "radial-gradient(ellipse at center, #5a3a1e 0%, var(--board) 70%, #24150a 100%)",
        borderColor: "#1b0f06",
      }}
    >
      <div className="mb-3 flex justify-between font-serif text-2xl sm:text-3xl" style={{ color: "var(--ink)" }}>
        <span>YES</span>
        <span style={{ color: "var(--glow)" }}>☾ ✦ ☽</span>
        <span>NO</span>
      </div>
      <div className="flex justify-center">{ROW1.map((c) => <Key key={c} c={c} active={active} />)}</div>
      <div className="flex justify-center">{ROW2.map((c) => <Key key={c} c={c} active={active} />)}</div>
      <div className="mt-1 flex justify-center">{NUMS.map((c) => <Key key={c} c={c} active={active} />)}</div>
      <div className="mt-3 text-center font-serif text-xl tracking-[0.4em]">GOODBYE</div>
      {waiting && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="planchette">🔍</span>
        </div>
      )}
    </div>
  );
}

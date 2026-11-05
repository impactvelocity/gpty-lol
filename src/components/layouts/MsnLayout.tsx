"use client";

import { useEffect, useRef } from "react";
import { useComposer, useStickyScroll } from "./hooks";
import { clock, type LayoutProps } from "./types";

/** Windows XP–era buddy chat window. Palette comes from CSS variables. */
export function MsnLayout({
  costume,
  lines,
  busy,
  waiting,
  error,
  onSend,
  onOpenWardrobe,
}: LayoutProps) {
  const { value, setValue, submit, onKeyDown } = useComposer(onSend, busy);
  const scroller = useStickyScroll<HTMLDivElement>(lines);
  const win = useRef<HTMLDivElement>(null);

  // Shake the window when the assistant starts replying, like a nudge.
  const lastId = lines.at(-1)?.id;
  useEffect(() => {
    if (!lastId || lines.at(-1)?.role !== "assistant") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    win.current?.animate(
      [
        { transform: "translate(0,0)" },
        { transform: "translate(-8px,3px)" },
        { transform: "translate(7px,-4px)" },
        { transform: "translate(-6px,-2px)" },
        { transform: "translate(5px,4px)" },
        { transform: "translate(0,0)" },
      ],
      { duration: 450 },
    );
    // Only nudge when a new assistant message appears, not on every token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastId]);

  return (
    <div
      className="flex h-dvh items-center justify-center p-2 sm:p-8"
      style={{ background: "var(--desk)" }}
    >
      <div
        ref={win}
        className="flex h-full max-h-[760px] w-full max-w-3xl flex-col overflow-hidden rounded-t-lg border-[3px] shadow-2xl"
        style={{
          background: "var(--win)",
          borderColor: "var(--tA)",
          color: "var(--ink)",
          fontFamily: "Tahoma, Verdana, Segoe UI, sans-serif",
          fontSize: 13,
        }}
      >
        <div
          className="flex items-center gap-2 px-2 py-1 text-white"
          style={{
            background: "linear-gradient(#3d95ff, var(--tA) 20%, var(--tA))",
          }}
        >
          <span>{costume.avatar}</span>
          <span className="flex-1 truncate font-bold">
            {costume.assistant} - Conversation
          </span>
          {["_", "□", "✕"].map((g) => (
            <span
              key={g}
              className="grid h-5 w-5 place-items-center rounded-sm border border-white/70 text-xs"
              style={{ background: g === "✕" ? "#d9421c" : "#2a6be0" }}
            >
              {g}
            </span>
          ))}
        </div>

        <div
          className="flex items-center gap-4 border-b px-2 py-1"
          style={{ borderColor: "color-mix(in srgb, var(--ink) 20%, transparent)" }}
        >
          {["File", "Edit", "Actions", "Tools", "Help"].map((m) => (
            <span key={m}>{m}</span>
          ))}
          <button
            onClick={onOpenWardrobe}
            className="ml-auto underline"
            style={{ color: "var(--accent)" }}
          >
            Change costume…
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col p-2">
            <div
              className="px-2 py-1 text-[12px]"
              style={{ background: "var(--side)" }}
            >
              To: <b>{costume.assistant}</b>{" "}
              <span style={{ color: "var(--me)" }}>
                ({busy ? "Busy" : "Online"})
              </span>
            </div>
            <div
              ref={scroller}
              className="mt-1 min-h-0 flex-1 overflow-y-auto border p-2"
              style={{
                background: "var(--pane)",
                borderColor: "color-mix(in srgb, var(--ink) 30%, transparent)",
              }}
            >
              <p className="mb-2 text-[11px]" style={{ color: "var(--me)" }}>
                Never give out your password or credit card number in an
                instant message conversation.
              </p>
              <Line who={costume.assistant} text={costume.greeting} accent />
              {lines.map((l) => (
                <Line
                  key={l.id}
                  who={l.role === "user" ? costume.user : costume.assistant}
                  text={l.text}
                  accent={l.role === "assistant"}
                  at={l.at}
                />
              ))}
              {error && <Line who="System" text={costume.error} />}
            </div>
            <div
              className="h-5 px-1 pt-1 text-[11px] italic"
              style={{ color: "var(--me)" }}
            >
              {waiting ? costume.typing : ""}
            </div>
            <div className="flex gap-2">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                rows={3}
                aria-label="Message"
                className="min-w-0 flex-1 resize-none border p-1 outline-none"
                style={{
                  background: "var(--pane)",
                  color: "var(--ink)",
                  borderColor: "color-mix(in srgb, var(--ink) 40%, transparent)",
                  font: "inherit",
                }}
              />
              <button
                onClick={submit}
                disabled={busy || !value.trim()}
                className="w-20 rounded border border-[#003c74] px-2 font-bold text-black disabled:opacity-50"
                style={{
                  background: "linear-gradient(#fff, #ece9d8 60%, #d6d0c0)",
                }}
              >
                {costume.send}
              </button>
            </div>
          </div>

          <aside
            className="hidden w-36 shrink-0 flex-col items-center gap-2 p-2 sm:flex"
            style={{ background: "var(--side)" }}
          >
            <Avatar emoji={costume.avatar} />
            <div className="flex-1" />
            <Avatar emoji={costume.userAvatar} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Avatar({ emoji }: { emoji: string }) {
  return (
    <div
      className="grid h-24 w-24 place-items-center rounded border-2 text-5xl"
      style={{
        background: "var(--pane)",
        borderColor: "var(--tB)",
      }}
    >
      {emoji}
    </div>
  );
}

function Line({
  who,
  text,
  accent,
  at,
}: {
  who: string;
  text: string;
  accent?: boolean;
  at?: number;
}) {
  return (
    <div className="mb-1.5 whitespace-pre-wrap break-words">
      <span style={{ color: accent ? "var(--accent)" : "var(--me)" }}>
        {who} says{at ? ` (${clock(at)})` : ""}:
      </span>
      <div className="pl-3">{text}</div>
    </div>
  );
}

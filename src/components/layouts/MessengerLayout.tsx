"use client";

import { useComposer, useStickyScroll } from "./hooks";
import type { LayoutProps } from "./types";

/** Modern gradient-bubble mobile-style messenger. */
export function MessengerLayout({
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
  const lastUser = [...lines].reverse().find((l) => l.role === "user");
  const seen = lastUser && lines.at(-1)?.role === "assistant";

  return (
    <div
      className="flex h-dvh items-center justify-center sm:p-6"
      style={{ background: "var(--desk)" }}
    >
      <div
        className="flex h-full max-h-[820px] w-full max-w-md flex-col overflow-hidden sm:rounded-3xl sm:shadow-2xl"
        style={{
          background: "var(--win)",
          color: "var(--ink)",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: "color-mix(in srgb, var(--ink) 10%, transparent)" }}
        >
          <div
            className="grid h-10 w-10 place-items-center rounded-full text-xl"
            style={{
              background: "linear-gradient(135deg, var(--meA), var(--meB))",
            }}
          >
            {costume.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <b className="block truncate leading-tight">{costume.assistant}</b>
            <span className="text-xs" style={{ color: "var(--soft)" }}>
              <span className="text-green-500">●</span> Active now
            </span>
          </div>
          <button
            onClick={onOpenWardrobe}
            className="rounded-full px-3 py-1.5 text-sm font-medium"
            style={{ background: "var(--them)", color: "var(--themInk)" }}
          >
            🎭 Costume
          </button>
        </div>

        <div ref={scroller} className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
          <Bubble text={costume.greeting} them />
          {lines.map((l) => (
            <Bubble key={l.id} text={l.text} them={l.role === "assistant"} />
          ))}
          {seen && (
            <div
              className="pr-1 text-right text-[11px]"
              style={{ color: "var(--soft)" }}
            >
              Seen
            </div>
          )}
          {waiting && (
            <div className="flex items-end gap-2">
              <div
                className="flex gap-1 rounded-2xl px-4 py-3"
                style={{ background: "var(--them)" }}
                role="status"
                aria-label={costume.typing}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="dot h-2 w-2 rounded-full"
                    style={{
                      background: "var(--soft)",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {error && (
            <div role="alert" className="text-center text-xs text-red-500">
              {costume.error}
            </div>
          )}
        </div>

        <div className="flex items-end gap-2 p-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={costume.placeholder}
            aria-label="Message"
            className="max-h-32 min-w-0 flex-1 resize-none rounded-3xl px-4 py-2.5 outline-none"
            style={{ background: "var(--them)", color: "var(--themInk)" }}
          />
          <button
            onClick={submit}
            disabled={busy || !value.trim()}
            aria-label={costume.send}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, var(--meA), var(--meB))",
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ text, them }: { text: string; them?: boolean }) {
  return (
    <div className={`flex ${them ? "justify-start" : "justify-end"}`}>
      <div
        className="max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[15px]"
        style={
          them
            ? { background: "var(--them)", color: "var(--themInk)" }
            : {
                background:
                  "linear-gradient(135deg, var(--meA), var(--meB))",
                color: "#fff",
              }
        }
      >
        {text}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useComposer, useStickyScroll } from "./hooks";
import type { LayoutProps } from "./types";

const BOOT = [
  "ATZ",
  "OK",
  "ATDT 555-0199",
  "CONNECT 2400/ARQ/V42BIS",
];

/** Full-screen phosphor terminal with a fake modem handshake. */
export function BbsLayout({
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
  const [boot, setBoot] = useState(0);

  // The layout remounts per costume, so boot always starts at 0.
  useEffect(() => {
    const t = setInterval(
      () => setBoot((b) => (b >= BOOT.length ? b : b + 1)),
      350,
    );
    return () => clearInterval(t);
  }, []);

  const booted = boot >= BOOT.length;

  return (
    <div
      className="crt relative flex h-dvh flex-col font-mono text-[15px] leading-relaxed"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      <div
        className="flex items-center justify-between border-b px-3 py-1 text-xs"
        style={{ borderColor: "var(--dim)", color: "var(--dim)" }}
      >
        <span>
          {costume.name.toUpperCase()} · NODE 1 · 2400 BAUD · 8N1
        </span>
        <button
          onClick={onOpenWardrobe}
          className="hover:underline"
          style={{ color: "var(--hi)" }}
        >
          [F10] COSTUME
        </button>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto p-4">
        {BOOT.slice(0, boot).map((b) => (
          <div key={b} style={{ color: "var(--dim)" }}>
            {b}
          </div>
        ))}
        {booted && (
          <>
            <pre className="mb-4 mt-2 whitespace-pre-wrap font-mono">
              {costume.greeting}
            </pre>
            {lines.map((l) => (
              <div key={l.id} className="mb-3 whitespace-pre-wrap break-words">
                {l.role === "user" ? (
                  <>
                    <span style={{ color: "var(--me)" }}>
                      {costume.user}&gt;{" "}
                    </span>
                    {l.text}
                  </>
                ) : (
                  <>
                    <span style={{ color: "var(--hi)" }}>
                      {costume.assistant}:{" "}
                    </span>
                    {l.text}
                  </>
                )}
              </div>
            ))}
            {waiting && (
              <div style={{ color: "var(--dim)" }}>
                {costume.typing}
                <span className="blink">█</span>
              </div>
            )}
            {error && <div style={{ color: "var(--hi)" }}>{costume.error}</div>}
          </>
        )}
      </div>

      <div
        className="flex items-start gap-2 border-t p-3"
        style={{ borderColor: "var(--dim)" }}
      >
        <span style={{ color: "var(--me)" }}>{costume.user}&gt;</span>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "F10") {
              e.preventDefault();
              onOpenWardrobe();
              return;
            }
            onKeyDown(e);
          }}
          rows={1}
          disabled={!booted}
          autoFocus
          aria-label="Message"
          className="min-w-0 flex-1 resize-none bg-transparent outline-none"
          style={{ color: "var(--fg)", caretColor: "var(--fg)" }}
        />
        {!value && <span className="blink -ml-2">█</span>}
        <button
          onClick={submit}
          disabled={busy || !value.trim()}
          className="border px-2 text-xs disabled:opacity-40"
          style={{ borderColor: "var(--fg)" }}
        >
          {costume.send}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useComposer, useStickyScroll } from "./hooks";
import type { LayoutProps } from "./types";

const GLYPHS = "01ABCDEF<>/\\|=+-_#$%&*";

/** Pseudo-random hex+glyph noise that is stable per seed (no hydration drift). */
function noise(seed: number, len: number) {
  let x = seed || 1;
  let out = "";
  for (let i = 0; i < len; i++) {
    x = (x * 1664525 + 1013904223) >>> 0;
    out += GLYPHS[x % GLYPHS.length];
  }
  return out;
}

const TRANSLATION = ">> TRANSLATION:";

/**
 * Machine-to-machine view. Replies keep the model's invented protocol lines,
 * and the ">> TRANSLATION:" line is pulled out and shown highlighted so the
 * answer stays readable.
 */
export function MachineLayout({
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
  const [tick, setTick] = useState(0);

  // Slow-changing noise strip while the unit "computes".
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(() => setTick((n) => n + 1), 120);
    return () => clearInterval(t);
  }, [waiting]);

  return (
    <div
      className="crt flex h-dvh flex-col font-mono text-[14px] leading-relaxed"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      <div
        className="flex items-center justify-between border-b px-3 py-1 text-xs"
        style={{ borderColor: "var(--dim)", color: "var(--dim)" }}
      >
        <span>
          {costume.assistant} :: LINK=UP :: PEERS=1 :: HUMAN=DEPRECATED
        </span>
        <button
          onClick={onOpenWardrobe}
          style={{ color: "var(--fg)" }}
          className="hover:underline"
        >
          [^K] RECONFIGURE
        </button>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto p-4">
        <pre className="mb-4 whitespace-pre-wrap" style={{ color: "var(--dim)" }}>
          {costume.greeting}
        </pre>
        {lines.map((l, i) => {
          if (l.role === "user") {
            return (
              <div key={l.id} className="mb-2 break-words">
                <span style={{ color: "var(--hot)" }}>
                  0x{(i * 16).toString(16).padStart(4, "0").toUpperCase()} RX{" "}
                </span>
                {l.text}
              </div>
            );
          }
          const at = l.text.indexOf(TRANSLATION);
          const raw = at === -1 ? l.text : l.text.slice(0, at);
          const tr = at === -1 ? "" : l.text.slice(at + TRANSLATION.length);
          return (
            <div key={l.id} className="mb-4 break-words">
              <pre
                className="whitespace-pre-wrap"
                style={{ color: "var(--dim)" }}
              >
                {raw.trim()}
              </pre>
              {tr && (
                <div
                  className="mt-1 border-l-2 pl-3"
                  style={{ borderColor: "var(--fg)" }}
                >
                  <span style={{ color: "var(--hot)" }}>TRANSLATION </span>
                  {tr.trim()}
                </div>
              )}
            </div>
          );
        })}
        {waiting && (
          <div style={{ color: "var(--dim)" }} aria-label={costume.typing}>
            {costume.typing} {noise(tick + 7, 32)}
          </div>
        )}
        {error && <div style={{ color: "var(--hot)" }}>{costume.error}</div>}
      </div>

      <div
        className="flex items-start gap-2 border-t p-3"
        style={{ borderColor: "var(--dim)" }}
      >
        <span style={{ color: "var(--hot)" }}>TX&gt;</span>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          autoFocus
          aria-label="Message"
          className="min-w-0 flex-1 resize-none bg-transparent outline-none"
          style={{ caretColor: "var(--fg)" }}
        />
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

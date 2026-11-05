"use client";

import { useComposer, useStickyScroll } from "./hooks";
import type { LayoutProps } from "./types";

function Prompt({ dir, git }: { dir: string; git: string }) {
  return (
    <span className="select-none">
      <span style={{ color: "var(--dir)" }}>{dir}</span>{" "}
      <span style={{ color: "var(--git)" }}>on  {git}</span>{" "}
      <span style={{ color: "var(--ok)" }}>❯</span>{" "}
    </span>
  );
}

/** Modern terminal: window chrome, two-tone prompt, command blocks. */
export function TerminalLayout({
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
  const dir = costume.haunted ? "~/crypt" : "~/gpty";
  const git = costume.haunted ? "main ✗" : "main";

  return (
    <div
      className="flex h-dvh items-center justify-center sm:p-6"
      style={{ background: "color-mix(in srgb, var(--bg) 70%, #000)" }}
    >
      <div
        className="flex h-full w-full max-w-4xl flex-col overflow-hidden font-mono text-[14px] leading-relaxed sm:rounded-xl sm:shadow-2xl sm:ring-1 sm:ring-white/10"
        style={{ background: "var(--bg)", color: "var(--fg)" }}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="flex-1 text-center text-xs" style={{ color: "var(--soft)" }}>
            {costume.name.toLowerCase()} — zsh — 100×30
          </span>
          <button
            onClick={onOpenWardrobe}
            className="text-xs hover:underline"
            style={{ color: "var(--dir)" }}
          >
            ⌘K costume
          </button>
        </div>

        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mb-4" style={{ color: "var(--soft)" }}>
            {costume.avatar} {costume.greeting}
          </div>
          {lines.map((l) =>
            l.role === "user" ? (
              <div key={l.id} className="mt-3 whitespace-pre-wrap break-words">
                <Prompt dir={dir} git={git} />
                {l.text}
              </div>
            ) : (
              <div
                key={l.id}
                className="mb-1 whitespace-pre-wrap break-words border-l-2 pl-3"
                style={{ borderColor: "var(--git)" }}
              >
                {l.text}
              </div>
            ),
          )}
          {waiting && (
            <div style={{ color: "var(--soft)" }}>
              ⠋ {costume.typing}
            </div>
          )}
          {error && <div style={{ color: "var(--bad)" }}>{costume.error}</div>}
        </div>

        <div className="flex items-start border-t border-white/10 p-4">
          <Prompt dir={dir} git={git} />
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            autoFocus
            aria-label="Message"
            className="min-w-0 flex-1 resize-none bg-transparent outline-none"
            style={{ caretColor: "var(--ok)" }}
          />
          <button
            onClick={submit}
            disabled={busy || !value.trim()}
            className="ml-2 rounded px-2 text-xs disabled:opacity-40"
            style={{ background: "var(--dir)", color: "var(--bg)" }}
          >
            {costume.send} ⏎
          </button>
        </div>
      </div>
    </div>
  );
}

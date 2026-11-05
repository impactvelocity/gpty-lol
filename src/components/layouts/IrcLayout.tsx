"use client";

import { useComposer, useStickyScroll } from "./hooks";
import type { LayoutProps } from "./types";

function stamp(at: number) {
  const d = at ? new Date(at) : new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `[${p(d.getHours())}:${p(d.getMinutes())}]`;
}

/** mIRC-style channel window: topic bar, <nick> lines, nick list, input line. */
export function IrcLayout({
  costume,
  lines,
  busy,
  waiting,
  error,
  onSend,
  onOpenWardrobe,
}: LayoutProps) {
  const { value, setValue, onKeyDown } = useComposer(onSend, busy);
  const scroller = useStickyScroll<HTMLDivElement>(lines);
  const chan = costume.haunted ? "#graveyard" : "#gpty";

  return (
    <div
      className="flex h-dvh flex-col font-mono text-[14px]"
      style={{ background: "var(--frame)", color: "var(--ink)" }}
    >
      <div
        className="flex items-center gap-3 border-b border-black/30 px-2 py-1 text-xs"
        style={{ background: "var(--frame)" }}
      >
        <b>{chan}</b>
        <span className="opacity-70">[{costume.user}]</span>
        <button
          onClick={onOpenWardrobe}
          className="ml-auto underline"
          title="Ctrl/Cmd+K"
        >
          /costume
        </button>
      </div>
      <div
        className="truncate border-b border-black/30 px-2 py-0.5"
        style={{ background: "var(--topic)" }}
      >
        {costume.greeting.replace(/^Topic for [^:]+: /, "")}
      </div>

      <div className="flex min-h-0 flex-1">
        <div
          ref={scroller}
          className="min-w-0 flex-1 overflow-y-auto border border-black/30 p-2"
          style={{ background: "var(--bg)" }}
        >
          <p style={{ color: "var(--join)" }}>
            *** Now talking in {chan}
            <br />*** Topic is: {costume.greeting.replace(/^Topic for [^:]+: /, "")}
            <br />*** {costume.assistant} (~gpty@irc.gpty.lol) has joined {chan}
          </p>
          {lines.map((l) => (
            <p key={l.id} className="whitespace-pre-wrap break-words">
              <span className="opacity-60">{stamp(l.at)} </span>
              <b
                style={{
                  color: l.role === "user" ? "var(--me)" : "var(--them)",
                }}
              >
                &lt;{l.role === "user" ? costume.user : costume.assistant}&gt;
              </b>{" "}
              {l.text}
            </p>
          ))}
          {waiting && (
            <p style={{ color: "var(--join)" }}>
              *** {costume.typing}
            </p>
          )}
          {error && <p style={{ color: "var(--join)" }}>{costume.error}</p>}
        </div>
        <aside
          className="hidden w-36 shrink-0 overflow-y-auto border border-black/30 p-2 text-xs sm:block"
          style={{ background: "var(--side)" }}
        >
          <div className="mb-1 opacity-60">2 users</div>
          <div>@{costume.assistant}</div>
          <div>{costume.user}</div>
        </aside>
      </div>

      <div
        className="flex items-center gap-2 border-t border-black/30 px-2 py-1"
        style={{ background: "var(--bg)" }}
      >
        <span className="opacity-60">[{costume.user}]</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim() === "/costume") {
              e.preventDefault();
              setValue("");
              onOpenWardrobe();
              return;
            }
            onKeyDown(e);
          }}
          aria-label="Message"
          autoFocus
          className="min-w-0 flex-1 bg-transparent outline-none"
        />
      </div>
    </div>
  );
}

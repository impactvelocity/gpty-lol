"use client";

import { useComposer, useStickyScroll } from "./hooks";
import { clock, type LayoutProps } from "./types";

const CHANNELS = ["general", "random", "dev", "design"];

/** Early (2014) Slack: aubergine sidebar, channel header, flat message rows. */
export function SlackLayout({
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
  const channel = costume.haunted ? "crypt" : "general";

  return (
    <div
      className="flex h-dvh"
      style={{
        background: "var(--win)",
        color: "var(--ink)",
        fontFamily: "Lato, system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <aside
        className="hidden w-60 shrink-0 flex-col py-3 sm:flex"
        style={{ background: "var(--sb)", color: "var(--sbInk)" }}
      >
        <div className="px-4 pb-3">
          <b className="block text-lg text-white">gpty.lol</b>
          <span className="text-xs">
            <span style={{ color: "var(--accent)" }}>●</span> {costume.user}
          </span>
        </div>
        <div className="px-4 pb-1 pt-2 text-xs uppercase tracking-wider opacity-70">
          Channels
        </div>
        {[channel, ...CHANNELS.filter((c) => c !== channel)].map((c, i) => (
          <div
            key={c}
            className="px-4 py-0.5"
            style={
              i === 0
                ? { background: "var(--sbActive)", color: "#fff" }
                : undefined
            }
          >
            # {c}
          </div>
        ))}
        <div className="px-4 pb-1 pt-4 text-xs uppercase tracking-wider opacity-70">
          Direct Messages
        </div>
        <div className="px-4 py-0.5">
          <span style={{ color: "var(--accent)" }}>●</span> {costume.assistant}
        </div>
        <div className="flex-1" />
        <button
          onClick={onOpenWardrobe}
          className="mx-4 rounded border border-white/30 px-2 py-1 text-left text-sm text-white hover:bg-white/10"
        >
          🎭 Change costume
        </button>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center gap-3 border-b px-4 py-2"
          style={{ borderColor: "var(--line)" }}
        >
          <b className="text-lg"># {channel}</b>
          <span className="truncate text-sm" style={{ color: "var(--soft)" }}>
            {costume.tagline}
          </span>
          <button
            onClick={onOpenWardrobe}
            className="ml-auto rounded border px-2 py-0.5 text-sm sm:hidden"
            style={{ borderColor: "var(--line)" }}
          >
            🎭
          </button>
        </header>

        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto py-3">
          <Row
            name={costume.assistant}
            emoji={costume.avatar}
            text={costume.greeting}
            bot
          />
          {lines.map((l) => (
            <Row
              key={l.id}
              name={l.role === "user" ? costume.user : costume.assistant}
              emoji={l.role === "user" ? costume.userAvatar : costume.avatar}
              text={l.text}
              at={l.at}
              bot={l.role === "assistant"}
            />
          ))}
          {error && (
            <p
              role="alert"
              className="mx-4 my-2 rounded border-l-4 px-3 py-2 text-sm"
              style={{ borderColor: "#e01e5a", background: "var(--line)" }}
            >
              {costume.error}
            </p>
          )}
        </div>

        <div className="px-4 pb-4">
          <div className="h-5 text-xs" style={{ color: "var(--soft)" }}>
            {waiting ? costume.typing : ""}
          </div>
          <div
            className="flex items-end gap-2 rounded-md border-2 p-2"
            style={{ borderColor: "var(--line)" }}
          >
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={costume.placeholder}
              aria-label="Message"
              className="max-h-32 min-w-0 flex-1 resize-none bg-transparent outline-none"
              style={{ color: "var(--ink)" }}
            />
            <button
              onClick={submit}
              disabled={busy || !value.trim()}
              className="rounded px-3 py-1 text-sm font-bold text-white disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              {costume.send}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({
  name,
  emoji,
  text,
  at,
  bot,
}: {
  name: string;
  emoji: string;
  text: string;
  at?: number;
  bot?: boolean;
}) {
  return (
    <div className="flex gap-3 px-4 py-1.5 hover:bg-black/5">
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded text-xl"
        style={{ background: "var(--line)" }}
      >
        {emoji}
      </div>
      <div className="min-w-0">
        <div>
          <b>{name}</b>
          {bot && (
            <span
              className="ml-1 rounded px-1 text-[10px] font-bold uppercase"
              style={{ background: "var(--line)", color: "var(--soft)" }}
            >
              bot
            </span>
          )}
          {at ? (
            <span className="ml-2 text-xs" style={{ color: "var(--soft)" }}>
              {clock(at)}
            </span>
          ) : null}
        </div>
        <div className="whitespace-pre-wrap break-words">{text}</div>
      </div>
    </div>
  );
}

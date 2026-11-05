"use client";

import { useComposer, useStickyScroll } from "./hooks";
import { clock, type LayoutProps } from "./types";

/** Early Skype: contact list on the left, chat with call buttons on the right. */
export function SkypeLayout({
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

  return (
    <div
      className="flex h-dvh items-center justify-center p-2 sm:p-6"
      style={{ background: "var(--desk)" }}
    >
      <div
        className="flex h-full max-h-[760px] w-full max-w-4xl overflow-hidden rounded-lg border shadow-2xl"
        style={{
          background: "var(--win)",
          color: "var(--ink)",
          borderColor: "var(--tA)",
          fontFamily: "Tahoma, Verdana, sans-serif",
          fontSize: 13,
        }}
      >
        <aside
          className="hidden w-56 shrink-0 flex-col sm:flex"
          style={{ background: "var(--side)" }}
        >
          <div
            className="px-3 py-2 text-lg font-bold text-white"
            style={{ background: "linear-gradient(var(--tA), var(--tB))" }}
          >
            skype<span className="text-xs align-top">™</span>
          </div>
          <div className="px-3 py-2 text-[12px]">
            <span style={{ color: "var(--good)" }}>●</span> {costume.user}
            <div className="opacity-60">Online</div>
          </div>
          <div className="px-3 pt-2 text-[11px] font-bold uppercase opacity-60">
            Contacts (1)
          </div>
          <div
            className="mx-2 mt-1 flex items-center gap-2 rounded px-2 py-1.5"
            style={{ background: "color-mix(in srgb, var(--accent) 20%, transparent)" }}
          >
            <span>{costume.avatar}</span>
            <span className="truncate">{costume.assistant}</span>
            <span
              className="ml-auto"
              style={{ color: busy ? "var(--bad)" : "var(--good)" }}
            >
              ●
            </span>
          </div>
          <div className="flex-1" />
          <button
            onClick={onOpenWardrobe}
            className="m-3 rounded border px-2 py-1 text-left text-[12px] hover:underline"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            🎭 Change costume…
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="flex items-center gap-3 border-b px-3 py-2"
            style={{ borderColor: "color-mix(in srgb, var(--ink) 15%, transparent)" }}
          >
            <span className="text-2xl">{costume.avatar}</span>
            <div className="min-w-0 flex-1">
              <b className="block truncate">{costume.assistant}</b>
              <span className="text-[11px] opacity-60">
                {busy ? "Typing…" : "Online · Skype Chat"}
              </span>
            </div>
            <button
              onClick={onOpenWardrobe}
              className="sm:hidden rounded border px-2 py-1 text-xs"
            >
              🎭
            </button>
            <span
              className="rounded px-3 py-1 text-white"
              style={{ background: "var(--good)" }}
              title="Calls are decorative"
            >
              📞 Call
            </span>
            <span
              className="rounded px-3 py-1 text-white"
              style={{ background: "var(--bad)" }}
              title="Hang-ups are decorative"
            >
              ✕
            </span>
          </div>

          <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto p-3">
            <Bubble who={costume.assistant} text={costume.greeting} them />
            {lines.map((l) => (
              <Bubble
                key={l.id}
                who={l.role === "user" ? costume.user : costume.assistant}
                text={l.text}
                them={l.role === "assistant"}
                at={l.at}
              />
            ))}
            {error && <Bubble who="Skype" text={costume.error} them />}
          </div>

          <div className="h-5 px-3 text-[11px] italic opacity-70">
            {waiting ? costume.typing : ""}
          </div>
          <div
            className="flex gap-2 border-t p-2"
            style={{ borderColor: "color-mix(in srgb, var(--ink) 15%, transparent)" }}
          >
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              placeholder={costume.placeholder}
              aria-label="Message"
              className="min-w-0 flex-1 resize-none rounded border p-2 outline-none"
              style={{
                background: "var(--win)",
                color: "var(--ink)",
                borderColor: "var(--accent)",
                font: "inherit",
              }}
            />
            <button
              onClick={submit}
              disabled={busy || !value.trim()}
              className="rounded px-4 font-bold text-white disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {costume.send}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  who,
  text,
  them,
  at,
}: {
  who: string;
  text: string;
  them?: boolean;
  at?: number;
}) {
  return (
    <div className={`mb-2 flex ${them ? "justify-start" : "justify-end"}`}>
      <div
        className="max-w-[80%] whitespace-pre-wrap break-words rounded-lg px-3 py-2"
        style={{
          background: them
            ? "color-mix(in srgb, var(--accent) 18%, var(--win))"
            : "color-mix(in srgb, var(--ink) 10%, var(--win))",
        }}
      >
        <div className="mb-0.5 text-[11px] opacity-60">
          {who}
          {at ? ` · ${clock(at)}` : ""}
        </div>
        {text}
      </div>
    </div>
  );
}

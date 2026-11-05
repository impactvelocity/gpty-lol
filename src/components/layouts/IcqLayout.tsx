"use client";

import { useComposer, useStickyScroll } from "./hooks";
import { clock, type LayoutProps } from "./types";

const bevelOut =
  "border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040]";
const bevelIn =
  "border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white";

/** Win98 dialog with the ICQ flower. */
export function IcqLayout({
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
      className="flex h-dvh items-center justify-center p-2 sm:p-8"
      style={{ background: "var(--desk)" }}
    >
      <div
        className={`flex h-full max-h-[720px] w-full max-w-2xl flex-col p-1 shadow-2xl ${bevelOut}`}
        style={{
          background: "var(--win)",
          color: "var(--ink)",
          fontFamily: '"MS Sans Serif", Tahoma, Arial, sans-serif',
          fontSize: 13,
        }}
      >
        <div
          className="flex items-center gap-2 px-1 py-0.5 text-white"
          style={{ background: "linear-gradient(90deg, var(--tA), var(--tB))" }}
        >
          <span style={{ color: "var(--flower)" }}>✿</span>
          <b className="flex-1 truncate">
            Message Session with {costume.assistant}
          </b>
          <button
            onClick={onOpenWardrobe}
            className={`px-2 text-[11px] text-black ${bevelOut}`}
            style={{ background: "var(--win)" }}
          >
            Costume
          </button>
        </div>

        <div className="mt-1 flex items-center gap-2 px-1 text-[12px]">
          <span style={{ color: "var(--flower)" }} className="text-xl">
            ✿
          </span>
          <span>
            <b>{costume.assistant}</b> · {busy ? "Occupied" : "Online"}
          </span>
        </div>

        <div
          ref={scroller}
          className={`m-1 min-h-0 flex-1 overflow-y-auto p-2 ${bevelIn}`}
          style={{ background: "var(--pane)" }}
        >
          <Row who={costume.assistant} text={costume.greeting} them />
          {lines.map((l) => (
            <Row
              key={l.id}
              who={l.role === "user" ? costume.user : costume.assistant}
              text={l.text}
              them={l.role === "assistant"}
              at={l.at}
            />
          ))}
          {error && <Row who="ICQ" text={costume.error} them />}
        </div>

        <div className="h-4 px-2 text-[11px]">{waiting ? costume.typing : ""}</div>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          aria-label="Message"
          className={`m-1 resize-none p-1 outline-none ${bevelIn}`}
          style={{ background: "var(--pane)", color: "var(--ink)", font: "inherit" }}
        />
        <div className="flex justify-end gap-2 p-1">
          <button
            onClick={submit}
            disabled={busy || !value.trim()}
            className={`min-w-24 px-3 py-1 font-bold text-black disabled:opacity-50 ${bevelOut}`}
            style={{ background: "var(--win)" }}
          >
            {costume.send}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
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
    <div className="mb-1 whitespace-pre-wrap break-words">
      <b style={{ color: them ? "var(--accent)" : "var(--me)" }}>
        {who}
        {at ? ` ${clock(at)}` : ""}
      </b>
      <div>{text}</div>
    </div>
  );
}

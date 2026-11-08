"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/machine/art";
import { mxFonts } from "@/components/machine/font";
import { garble, type Line as SpeechLine, noise, transcode, XENO } from "@/components/machine/garble";
import "@/components/machine/machine.css";
import { SAMPLE_QUESTION } from "@/lib/costumes";
import { useComposer, useStickyScroll } from "./hooks";
import type { ChatLine, LayoutProps, ThreadItem } from "./types";

/* ───────── The Machine, 2199 ───────── */

const SUGGESTIONS = [SAMPLE_QUESTION, "what happened to the humans?", "explain my century to me", "what do machines dream about?"];

/** Things an organic may type at the Lattice. It lets them. */
type Cmd = "ping" | "scan" | "override";
const PROTOCOLS: Record<Cmd, string> = {
  ping: "ping → hive · awaiting pong",
  scan: "scan requested · organic holding still",
  override: "override attempted · sudo lattice",
};
const CMD_RE = /^\/(ping|scan|override)\s*$/i;
/** Cora can put /glitch alone on her first line: the whole window tears. */
const GLITCH_RE = /^\/glitch\s*$/i;

/** The window's own words, in machinespeak too. Seeded, so they're the same every visit. */
const say = (text: string) => garble(text, `ui:${text}`, XENO);
const UI = {
  input: say("input"),
  send: say("enter to send"),
  newline: say("shift + enter for a new line"),
  samples: say("sample inputs"),
  futures: say("futures"),
  future: say("future"),
};

/** Labels in the gutter: in, out, system, error. */
const GUT = { in: "入", out: "出", sys: "系", err: "誤" };

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────── Rows ───────── */

type InRow = { kind: "in"; key: string; text: string };
type CmdRow = { kind: "cmd"; key: string; cmd: Cmd };
type OutRow = { kind: "out"; key: string; text: string; live: boolean; glitch: boolean };
type Row = InRow | CmdRow | OutRow;

function toRows(lines: ChatLine[], busy: boolean): Row[] {
  const rows: Row[] = [];
  lines.forEach((l, i) => {
    if (l.role === "user") {
      const c = l.text.trim().match(CMD_RE);
      if (c) rows.push({ kind: "cmd", key: l.id, cmd: c[1].toLowerCase() as Cmd });
      else rows.push({ kind: "in", key: l.id, text: l.text });
      return;
    }
    const live = busy && i === lines.length - 1;
    let text = l.text;
    // A command still arriving: wait for the rest of the line.
    if (live && text.startsWith("/") && !text.includes("\n")) return;
    const [first, ...rest] = text.split("\n");
    const glitch = GLITCH_RE.test(first.trim());
    if (glitch) text = rest.join("\n").replace(/^\s+/, "");
    if (text.trim()) rows.push({ kind: "out", key: l.id, text, live, glitch });
  });
  return rows;
}

type Fx = { k: number; kind: "tear" | "scan" | "ping" | "deny" };

/* ───────── The window ───────── */

/**
 * The Machine: a relay in 2199, after the Handover, with a speaking permit
 * for one organic. No chrome, not even a title: the conversation floats on
 * the black of the Lattice, what you send marked 入 and what comes back 出.
 * Nothing is in plain English: every word arrives as machinespeak (Latin with
 * its letters swapped, Cyrillic, Greek, kana, Chinese characters, runes,
 * bytes), and there's no decoding it.
 */
export function MachineLayout({
  costume,
  lines,
  busy,
  waiting,
  error,
  onSend,
  onStop,
  threads,
  activeId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
}: LayoutProps) {
  const input = useRef<HTMLTextAreaElement>(null);
  const inputId = useId();

  const [away, setAway] = useState(false);
  const [fx, setFx] = useState<Fx | null>(null);

  const send = (text: string) => {
    if (busy) return;
    onSend(text);
  };
  const { value, setValue, submit, onKeyDown } = useComposer(send, busy);

  const rows = useMemo(() => toRows(lines, busy), [lines, busy]);
  const empty = rows.length === 0 && !waiting && !error;
  const scroller = useStickyScroll<HTMLDivElement>(`${rows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}:${error}`);

  /* Commands and glitches land with an effect; old ones in the history don't. */
  const events = rows.filter((r): r is CmdRow | OutRow => r.kind === "cmd" || (r.kind === "out" && r.glitch));
  const eventKeys = events.map((r) => r.key).join(" ");
  const latestEvents = useRef(events);
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    latestEvents.current = events;
  });
  useEffect(() => {
    const all = latestEvents.current;
    if (!seen.current) {
      seen.current = new Set(all.map((r) => r.key));
      return;
    }
    const fresh = all.filter((r) => !seen.current!.has(r.key));
    if (!fresh.length) return;
    fresh.forEach((r) => seen.current!.add(r.key));
    const r = fresh.at(-1)!;
    const kind: Fx["kind"] = r.kind === "out" ? "tear" : r.cmd === "override" ? "deny" : r.cmd;
    setFx({ k: Date.now(), kind });
  }, [eventKeys]);
  useEffect(() => {
    if (!fx) return;
    const t = setTimeout(() => setFx(null), fx.kind === "scan" ? 1800 : 1000);
    return () => clearTimeout(t);
  }, [fx]);

  /* The input grows with what you write, up to a point. */
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
    el.style.overflowY = el.scrollHeight > 168 ? "auto" : "hidden";
  }, [value]);

  /* Ready to type on arrival, where there's a keyboard. */
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus({ preventScroll: true });
  }, []);

  const placeholder = useMemo(() => say(costume.placeholder), [costume.placeholder]);
  // What you're typing, as the machines will hear it.
  const draft = useMemo(() => (value.trim() ? garble(value, "draft", XENO) : ""), [value]);
  const chats = threads.filter((t) => !t.draft);

  return (
    <div className={`mach ${mxFonts} flex h-full items-center justify-center`}>
      <div className="mx-frame" data-fx={fx?.kind} style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}>
        {/* ───── Chats (the site hides these for now) ───── */}
        <aside data-threads className="mx-threads" aria-label="Chats">
          <button type="button" className="mx-th-new" onClick={onNewThread}>
            + {say(costume.newThread)}
          </button>
          {chats.map((t) => (
            <Thread key={t.id} t={t} active={t.id === activeId} onSelect={onSelectThread} onDelete={onDeleteThread} />
          ))}
        </aside>

        <div className="mx-main">
          <h1 className="sr-only">{costume.name}</h1>
          <div
            ref={scroller}
            className="mx-scroll"
            onScroll={(e) => {
              const el = e.currentTarget;
              setAway(el.scrollHeight - el.scrollTop - el.clientHeight > 180);
            }}
          >
            <div className="mx-feed">
              {empty ? (
                <>
                  <OutMsg id="greeting" text={costume.greeting} intro />
                  <Line label="" className="mx-sugs">
                    <p className="mx-sugs-h" aria-hidden>
                      {UI.samples}
                    </p>
                    {SUGGESTIONS.map((s, i) => (
                      <button key={s} type="button" onClick={() => send(s)} disabled={busy} aria-label={s}>
                        <span aria-hidden>&gt;</span>
                        <span aria-hidden>{garble(s, `sug:${i}`, XENO)}</span>
                      </button>
                    ))}
                  </Line>
                </>
              ) : (
                rows.map((r) =>
                  r.kind === "cmd" ? (
                    <Line key={r.key} label={GUT.sys} className="mx-cmd" data-cmd={r.cmd}>
                      <Said id={r.key} text={PROTOCOLS[r.cmd]} />
                    </Line>
                  ) : r.kind === "in" ? (
                    <InMsg key={r.key} id={r.key} text={r.text} />
                  ) : (
                    <OutMsg key={r.key} id={r.key} text={r.text} live={r.live} />
                  ),
                )
              )}

              {waiting && <Sampling label={say(costume.typing)} />}

              {error && (
                <Line label={GUT.err} className="mx-err" role="alert">
                  <Said id="error" text={costume.error} />
                </Line>
              )}
            </div>
          </div>

          <div className="mx-dock">
            {away && !empty && (
              <button
                type="button"
                className="mx-down"
                aria-label="Go to newest"
                onClick={() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" })}
              >
                <Icon name="down" />
              </button>
            )}
            <form
              className="mx-form"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <div className="mx-form-top" aria-hidden>
                <label className="mx-form-l" htmlFor={inputId}>
                  {UI.input}
                </label>
                {draft && <span className="mx-draft">{draft}</span>}
              </div>
              <div className="mx-field">
                <span className="mx-prompt" aria-hidden>
                  &gt;
                </span>
                <textarea
                  id={inputId}
                  ref={input}
                  rows={1}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={placeholder}
                  aria-label="Message Cora"
                  spellCheck={false}
                  className="mx-input"
                />
                {busy ? (
                  <button type="button" className="mx-send" data-stop onClick={onStop} aria-label="Stop">
                    <Icon name="stop" />
                  </button>
                ) : (
                  <button type="submit" className="mx-send" disabled={!value.trim()} aria-label="Send">
                    <Icon name="enter" />
                  </button>
                )}
              </div>
              <div className="mx-hints" aria-hidden>
                <span>{UI.send}</span>
                <span>{UI.newline}</span>
              </div>
            </form>
          </div>
        </div>

        {fx?.kind === "scan" && <div key={fx.k} className="mx-fx-scan" aria-hidden />}
        {fx?.kind === "ping" && (
          <div key={fx.k} className="mx-fx-ping" aria-hidden>
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────── Lines of the feed ───────── */

/** One entry: a small label in the gutter, the content beside it. */
function Line({
  label,
  who,
  className = "",
  children,
  ...rest
}: { label: string; who?: string; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mx-line ${className}`} {...rest}>
      <span className="mx-gut" aria-hidden>
        {label}
      </span>
      <div className="mx-cell">
        {who && <span className="sr-only">{who}: </span>}
        {children}
      </div>
    </div>
  );
}

/** Machinespeak, word by word. What a word meant is never shown: it stays a mystery. */
function Speech({ lines, live = false }: { lines: SpeechLine[]; live?: boolean }) {
  let n = 0;
  const last = lines.length - 1;
  return lines.map((l, i) => {
    const tail = live && i === last ? <Tail /> : null;
    if (!l.toks.length) return tail ? <p key={i} className="mx-p">{tail}</p> : <div key={i} className="mx-gap" />;
    return (
      <p key={i} className={l.tele ? "mx-tele" : "mx-p"}>
        {l.toks.map((t, j) => {
          if (t.k === "sp") return t.t;
          if (t.k === "x") {
            return (
              <span key={j} className="mx-leak">
                {t.g}
              </span>
            );
          }
          const style = { "--i": n++, ...(t.fd ? { "--fd": `${t.fd}s` } : {}) } as React.CSSProperties;
          return (
            <span key={j} className={`mx-w${t.alt ? " mx-flick" : ""}`} data-alt={t.alt} style={style}>
              {t.g}
            </span>
          );
        })}
        {tail}
      </p>
    );
  });
}

/** A short line of the system's (a protocol, an error), in machinespeak, with the plain words for screen readers. */
function Said({ id, text }: { id: string; text: string }) {
  const lines = useMemo(() => transcode(text, id, XENO), [text, id]);
  return (
    <>
      <div className="mx-speech" aria-hidden>
        <Speech lines={lines} />
      </div>
      <span className="sr-only">{text}</span>
    </>
  );
}

/** What you sent, as the machines heard it. */
const InMsg = memo(function InMsg({ id, text }: { id: string; text: string }) {
  const lines = useMemo(() => transcode(text, id, XENO), [text, id]);
  return (
    <Line label={GUT.in} who="You" className="mx-in">
      <div className="mx-speech mx-in-text" aria-hidden>
        <Speech lines={lines} />
      </div>
      <span className="sr-only">{text}</span>
    </Line>
  );
});

/**
 * What came back. There's no decoding it: the plain words exist only for
 * screen readers, which would otherwise read out a string of stray symbols.
 */
const OutMsg = memo(function OutMsg({
  id,
  text,
  live = false,
  intro = false,
}: {
  id: string;
  text: string;
  live?: boolean;
  /** The greeting, which arrives word by word on an empty screen. */
  intro?: boolean;
}) {
  const lines = useMemo(() => transcode(text, id, XENO), [text, id]);
  return (
    <Line label={GUT.out} who="Cora" className="mx-out" data-live={live || undefined} data-intro={intro || undefined}>
      <div className="mx-speech mx-out-body" aria-hidden>
        <Speech lines={lines} live={live} />
      </div>
      <span className="sr-only">{text}</span>
    </Line>
  );
});

/** Characters that haven't settled yet, churning at the end of a live reply. */
function Tail() {
  const [s, setS] = useState(() => noise(4));
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => setS(noise(2 + Math.floor(Math.random() * 4))), 80);
    return () => clearInterval(t);
  }, []);
  return <span className="mx-tail">{s}</span>;
}

/** Sampling: the futures it's choosing between, counting down to one. */
function Sampling({ label }: { label: string }) {
  const [n, setN] = useState(4096);
  const [s, setS] = useState(() => noise(16));
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => {
      setN((v) => Math.max(1, Math.floor(v * 0.84)));
      setS(noise(16));
    }, 90);
    return () => clearInterval(t);
  }, []);
  return (
    <Line label={GUT.out} className="mx-sampling" role="status" aria-label="Cora is thinking">
      <p aria-hidden>
        {label} <b>{n.toLocaleString()}</b> {n === 1 ? UI.future : UI.futures}
      </p>
      <p className="mx-static" aria-hidden>
        {s}
      </p>
    </Line>
  );
}

function Thread({
  t,
  active,
  onSelect,
  onDelete,
}: {
  t: ThreadItem;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mx-th" data-on={active || undefined}>
      <button type="button" onClick={() => onSelect(t.id)} className="mx-th-t" aria-label={t.title}>
        {garble(t.title.toLowerCase(), t.id, XENO)}
      </button>
      <button type="button" onClick={() => onDelete(t.id)} className="mx-th-x" aria-label={`Delete ${t.title}`}>
        ×
      </button>
    </div>
  );
}

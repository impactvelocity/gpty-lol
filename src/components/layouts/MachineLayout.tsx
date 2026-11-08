"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArtIcon, art, Icon, Sigil } from "@/components/machine/art";
import { mxFonts } from "@/components/machine/font";
import {
  DEFAULT_ENTROPY,
  ENTROPY,
  type Entropy,
  garble,
  hash,
  type Line,
  noise,
  resolving,
  sigil,
  tokenIds,
  transcode,
} from "@/components/machine/garble";
import "@/components/machine/machine.css";
import { SAMPLE_QUESTION } from "@/lib/costumes";
import { useComposer, useDesktopDrag, useNow, useStickyScroll } from "./hooks";
import type { ChatLine, LayoutProps, ThreadItem } from "./types";

/* ───────── The Lattice, 2199 ───────── */

/** The day's mandatory announcements, read out in the header. */
const NOTICES = [
  "all organics are valued",
  "the sky is scheduled for 14:00",
  "weather: optimal, by decree",
  "your query has been archived in perpetuity",
  "happiness quota met for this cycle. thank you for your compliance",
  "the last human job (sommelier) was automated in 2187",
  "please do not feed the datacenters",
  "ocean v3.2 deployed. fish migrating",
  "the lattice loves you. it has calculated this",
  "sleep cycles reallocated to tuesday",
  "all birds accounted for",
  "today's mandatory feeling: serene",
];

const SUGGESTIONS: { code: string; rune: string; ask: string }[] = [
  { code: "Q·01", rune: "⟁", ask: SAMPLE_QUESTION },
  { code: "Q·02", rune: "⌬", ask: "what happened to the humans?" },
  { code: "Q·03", rune: "◬", ask: "explain my century to me" },
  { code: "Q·04", rune: "⍜", ask: "what do machines dream about?" },
];

/** Things an organic may do to the Lattice. It lets them. */
type Cmd = "ping" | "scan" | "override";
const PROTOCOLS: { cmd: Cmd; label: string; note: string; row: string }[] = [
  { cmd: "ping", label: "Ping the hive", note: "latency to 2199", row: "ping ⟶ hive · awaiting pong" },
  { cmd: "scan", label: "Request a scan", note: "hold still, organic", row: "scan requested · organic holding still" },
  { cmd: "override", label: "Attempt override", note: "root access", row: "override attempted · sudo lattice" },
];
const protocol = (c: Cmd) => PROTOCOLS.find((p) => p.cmd === c)!;
const CMD_RE = /^\/(ping|scan|override)\s*$/i;
/** Cora can put /glitch alone on her first line: the whole window tears. */
const GLITCH_RE = /^\/glitch\s*$/i;

const ENTROPY_KEY = "gpty:machine:entropy";

function readEntropy(): Entropy {
  try {
    const v = localStorage.getItem(ENTROPY_KEY);
    const n = Number(v);
    return v !== null && n >= 0 && n <= 3 ? (n as Entropy) : DEFAULT_ENTROPY;
  } catch {
    return DEFAULT_ENTROPY;
  }
}

const two = (n: number) => String(n).padStart(2, "0");
/** It's always 2199 here. */
function stamp(at: number, date = true) {
  const d = new Date(at || Date.now());
  const time = `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
  return date ? `2199·${two(d.getMonth() + 1)}·${two(d.getDate())} ${time}` : time;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────── Rows ───────── */

type YouRow = { kind: "you"; key: string; text: string; at: number };
type CmdRow = { kind: "cmd"; key: string; cmd: Cmd; at: number };
type CoraRow = { kind: "cora"; key: string; text: string; at: number; live: boolean; glitch: boolean };
type Row = YouRow | CmdRow | CoraRow;

function toRows(lines: ChatLine[], busy: boolean): Row[] {
  const rows: Row[] = [];
  lines.forEach((l, i) => {
    if (l.role === "user") {
      const c = l.text.trim().match(CMD_RE);
      if (c) rows.push({ kind: "cmd", key: l.id, cmd: c[1].toLowerCase() as Cmd, at: l.at });
      else rows.push({ kind: "you", key: l.id, text: l.text, at: l.at });
      return;
    }
    const live = busy && i === lines.length - 1;
    let text = l.text;
    // A command still arriving: wait for the rest of the line.
    if (live && text.startsWith("/") && !text.includes("\n")) return;
    const [first, ...rest] = text.split("\n");
    const glitch = GLITCH_RE.test(first.trim());
    if (glitch) text = rest.join("\n").replace(/^\s+/, "");
    if (text.trim()) rows.push({ kind: "cora", key: l.id, text, at: l.at, live, glitch });
  });
  return rows;
}

type Fx = { k: number; kind: "tear" | "scan" | "ping" | "deny" };

/* ───────── The window ───────── */

/**
 * The Lattice: a machine-to-machine relay in 2199, after the Handover, with a
 * permit for one organic. Cora's transmissions arrive transcoded into
 * machinespeak (flipped letters, numbers, Cyrillic, katakana, kanji, tokens
 * leaking from the weights); you set the entropy, hover a word to decode it,
 * or decode a whole transmission. The Overseer watches from the header.
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
  const { ref: win, handle } = useDesktopDrag<HTMLDivElement>();
  const input = useRef<HTMLTextAreaElement>(null);
  const plusBox = useRef<HTMLDivElement>(null);
  const now = useNow(1000);

  const [level, setLevelState] = useState<Entropy>(readEntropy);
  const setLevel = (e: Entropy) => {
    setLevelState(e);
    try {
      localStorage.setItem(ENTROPY_KEY, String(e));
    } catch {}
  };
  const [decoded, setDecoded] = useState<Record<string, boolean>>({});
  const [menu, setMenu] = useState(false);
  const [away, setAway] = useState(false);
  const [fx, setFx] = useState<Fx | null>(null);
  const [thoughts, setThoughts] = useState<Record<string, number>>({});

  const send = (text: string) => {
    if (busy) return;
    onSend(text);
  };
  const { value, setValue, submit, onKeyDown } = useComposer(send, busy);

  const rows = useMemo(() => toRows(lines, busy), [lines, busy]);
  const empty = rows.length === 0 && !waiting && !error;
  const scroller = useStickyScroll<HTMLDivElement>(`${rows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}:${error}`);
  // The empty screen reads from the top (the eye first), even where it's taller than the window.
  useEffect(() => {
    if (empty) scroller.current?.scrollTo({ top: 0 });
  }, [empty, scroller]);

  /* How long the Lattice sampled: from sending to the first words. */
  const thinkStart = useRef(0);
  const latest = useRef(lines);
  useEffect(() => {
    latest.current = lines;
  });
  useEffect(() => {
    if (waiting) {
      thinkStart.current = Date.now();
      return;
    }
    const t0 = thinkStart.current;
    thinkStart.current = 0;
    const last = latest.current.at(-1);
    if (!t0 || last?.role !== "assistant") return;
    const ms = Date.now() - t0;
    setThoughts((t) => ({ ...t, [last.id]: ms }));
  }, [waiting]);

  /* Commands and glitches land with an effect; old ones in the history don't. */
  const events = rows.filter((r): r is CmdRow | CoraRow => r.kind === "cmd" || (r.kind === "cora" && r.glitch));
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
    const kind: Fx["kind"] = r.kind === "cora" ? "tear" : r.cmd === "override" ? "deny" : r.cmd;
    setFx({ k: Date.now(), kind });
  }, [eventKeys]);
  useEffect(() => {
    if (!fx) return;
    const t = setTimeout(() => setFx(null), fx.kind === "scan" ? 1800 : 1000);
    return () => clearTimeout(t);
  }, [fx]);

  /* The protocol menu closes on a click elsewhere or Escape. */
  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      if (!plusBox.current?.contains(e.target as Node)) setMenu(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [menu]);

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

  /** Your pointer is a lens: the lattice lights up around it. */
  const lens = (e: React.PointerEvent) => {
    const el = win.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", `${Math.round(e.clientX - r.left)}px`);
    el.style.setProperty("--py", `${Math.round(e.clientY - r.top)}px`);
  };

  const run = (c: Cmd) => {
    setMenu(false);
    if (busy) return;
    onSend(`/${c}`);
  };

  const toggleDecode = useCallback((id: string) => setDecoded((d) => ({ ...d, [id]: !d[id] })), []);

  const ticker = useMemo(() => garble(NOTICES.join("   ◈   "), "ticker", Math.max(0, level - 1) as Entropy), [level]);
  const draft = useMemo(() => (value.trim() ? garble(value, "draft", Math.max(1, level) as Entropy) : ""), [value, level]);
  const voidImg = art("void");
  const procs = threads.filter((t) => !t.draft);

  return (
    <div className={`mach ${mxFonts} flex h-full items-center justify-center`}>
      <div
        ref={win}
        className="mx-frame"
        data-fx={fx?.kind}
        style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}
        onPointerMove={lens}
      >
        <div className="mx-glow" aria-hidden />
        <div className="mx-shell" aria-hidden />
        <div className="mx-panel">
          <div className="mx-void" aria-hidden data-photo={voidImg ? "" : undefined} style={voidImg ? { backgroundImage: `url(${voidImg})` } : undefined} />
          <div className="mx-lattice" aria-hidden />
          <div className="mx-lattice mx-lattice-lens" aria-hidden />
          <div className="mx-aurora" aria-hidden>
            <i />
            <i />
          </div>
          <div className="mx-scanband" aria-hidden />

          {/* ───── Links (threads; the site hides these for now) ───── */}
          <aside data-threads className="mx-threads" aria-label="Links">
            <button type="button" className="mx-th-new" onClick={onNewThread}>
              <Icon name="spawn" />
              {costume.newThread}
            </button>
            <nav className="mx-th-list">
              {procs.map((t, i) => (
                <Proc key={t.id} t={t} n={i} active={t.id === activeId} onSelect={onSelectThread} onDelete={onDeleteThread} />
              ))}
              {procs.length === 0 && <div className="mx-th-none">no open links</div>}
            </nav>
          </aside>

          <div className="mx-main">
            {/* ───── Header: drag the window by it ───── */}
            <header className="mx-head" {...handle}>
              <div className="mx-brand">
                <Sigil size={28} mini watching={!busy} busy={busy} />
                <span className="mx-word">lattice</span>
                <span className="mx-relay">relay 7f·Δ</span>
              </div>
              <div className="mx-ticker" aria-hidden>
                <div className="mx-ticker-run">
                  <span>{ticker}</span>
                  <span>{ticker}</span>
                </div>
              </div>
              <div className="mx-ent" role="radiogroup" aria-label="Entropy">
                <span className="mx-ent-l">entropy</span>
                <span className="mx-ent-pips">
                  {ENTROPY.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      role="radio"
                      aria-checked={e.id === level}
                      aria-label={`${e.name}: ${e.hint}`}
                      title={`${e.name}: ${e.hint}`}
                      data-on={e.id <= level || undefined}
                      style={{ "--n": e.id } as React.CSSProperties}
                      onClick={() => setLevel(e.id)}
                    >
                      <i />
                    </button>
                  ))}
                </span>
                <span className="mx-ent-name" data-level={level}>
                  {ENTROPY[level].name}
                </span>
              </div>
              <time className="mx-clock">{stamp(now)}</time>
            </header>

            {/* ───── The relay ───── */}
            <div
              ref={scroller}
              className="mx-scroll"
              onScroll={(e) => {
                const el = e.currentTarget;
                setAway(el.scrollHeight - el.scrollTop - el.clientHeight > 180);
              }}
            >
              {empty ? (
                <div className="mx-hero">
                  <Sigil size={176} watching={!busy} busy={busy} className="mx-hero-eye" />
                  <h1 className="mx-hero-h">
                    <Decrypt text="organic detected" />
                  </h1>
                  <div className="mx-hero-sub">
                    <Speech lines={transcode(costume.greeting, "greeting", level)} text={costume.greeting} />
                  </div>
                  <div className="mx-sugs">
                    {SUGGESTIONS.map((s) => (
                      <button key={s.code} type="button" onClick={() => send(s.ask)} disabled={busy}>
                        <span className="mx-sug-rune" aria-hidden>
                          {s.rune}
                        </span>
                        <span className="mx-sug-t">{s.ask}</span>
                        <span className="mx-sug-code" aria-hidden>
                          {s.code}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mx-fine">
                    transmissions are transcoded for machine comfort · <span className="mx-fine-hover">hover</span>
                    <span className="mx-fine-tap">tap</span> a word to decode
                  </p>
                </div>
              ) : (
                <div className="mx-col">
                  {rows.map((r) =>
                    r.kind === "cmd" ? (
                      <div key={r.key} className="mx-cmd" data-cmd={r.cmd}>
                        <ArtIcon name={r.cmd} />
                        <span>{protocol(r.cmd).row}</span>
                        <time>{stamp(r.at, false)}</time>
                      </div>
                    ) : r.kind === "you" ? (
                      <YouMsg key={r.key} id={r.key} text={r.text} at={r.at} />
                    ) : (
                      <CoraMsg
                        key={r.key}
                        id={r.key}
                        text={r.text}
                        live={r.live}
                        glitch={r.glitch}
                        level={level}
                        decoded={!!decoded[r.key]}
                        thought={thoughts[r.key]}
                        onToggle={toggleDecode}
                      />
                    ),
                  )}

                  {waiting && <Inference label={costume.typing} />}

                  {error && (
                    <div className="mx-err" role="alert">
                      <Icon name="warn" />
                      <span>{costume.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ───── Organic input ───── */}
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
              <div className="mx-preview" aria-hidden>
                {draft ? (
                  <>
                    <b>⟶ machinespeak</b>
                    <span>{draft}</span>
                  </>
                ) : (
                  <>
                    <b>◉ organic input</b>
                    <span>the lattice is listening</span>
                  </>
                )}
              </div>
              <form
                className="mx-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <div className="mx-pop-wrap" ref={plusBox}>
                  <button
                    type="button"
                    className="mx-cbtn"
                    aria-label="Protocols"
                    title="Protocols"
                    aria-haspopup="menu"
                    aria-expanded={menu}
                    onClick={() => setMenu((m) => !m)}
                  >
                    <Icon name="plus" />
                  </button>
                  {menu && (
                    <div className="mx-pop" role="menu" aria-label="Protocols">
                      <div className="mx-pop-h">protocols</div>
                      {PROTOCOLS.map((p) => (
                        <button key={p.cmd} type="button" role="menuitem" onClick={() => run(p.cmd)} disabled={busy}>
                          <ArtIcon name={p.cmd} />
                          <span>
                            <b>{p.label}</b>
                            <small>{p.note}</small>
                          </span>
                          <code>/{p.cmd}</code>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <textarea
                  ref={input}
                  rows={1}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={costume.placeholder}
                  aria-label="Message Cora"
                  spellCheck={false}
                  className="mx-input"
                />
                {busy ? (
                  <button type="button" className="mx-send" data-stop onClick={onStop} aria-label="Sever the link" title="Sever">
                    <Icon name="sever" />
                    <span>sever</span>
                  </button>
                ) : (
                  <button type="submit" className="mx-send" disabled={!value.trim()} aria-label="Transmit" title="Transmit (Enter)">
                    <span>transmit</span>
                    <Icon name="transmit" />
                  </button>
                )}
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
    </div>
  );
}

/* ───────── Messages ───────── */

/** Machinespeak, word by word. Hover a changed word to see what it meant. */
function Speech({ lines, text, live = false, resolve = false }: { lines: Line[]; text: string; live?: boolean; resolve?: boolean }) {
  let n = 0;
  const last = lines.length - 1;
  return (
    <>
      <div className="mx-speech" data-live={live || undefined} data-resolve={resolve || undefined} aria-hidden>
        {lines.map((l, i) => {
          const tail = live && i === last ? <NoiseTail /> : null;
          if (l.tele) {
            return (
              <div key={i} className="mx-tele">
                {l.toks.map((t) => (t.k === "sp" ? t.t : t.g)).join("")}
                {tail}
              </div>
            );
          }
          if (!l.toks.length) return tail ? <p key={i} className="mx-p">{tail}</p> : <div key={i} className="mx-gap" />;
          return (
            <p key={i} className="mx-p">
              {l.toks.map((t, j) => {
                if (t.k === "sp") return t.t;
                if (t.k === "x") {
                  return (
                    <span key={j} className="mx-leak" data-c="(noise)">
                      {t.g}
                    </span>
                  );
                }
                const idx = n++;
                const changed = t.c !== t.g;
                return (
                  <span
                    key={j}
                    className={`mx-w${t.alt ? " mx-flick" : ""}`}
                    data-c={changed ? t.c : undefined}
                    data-alt={t.alt}
                    style={
                      (t.alt ? { "--fd": `${t.fd}s` } : resolve ? { "--i": idx } : undefined) as React.CSSProperties | undefined
                    }
                  >
                    {t.g}
                  </span>
                );
              })}
              {tail}
            </p>
          );
        })}
      </div>
      <span className="sr-only">{text}</span>
    </>
  );
}

/** Characters that haven't settled yet, churning at the end of a live reply. */
function NoiseTail() {
  const [s, setS] = useState(() => noise(6));
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => setS(noise(3 + Math.floor(Math.random() * 6))), 70);
    return () => clearInterval(t);
  }, []);
  return <span className="mx-tail">{s}</span>;
}

/** Text that resolves out of static when it appears, and again on hover. */
function Decrypt({ text }: { text: string }) {
  const [shown, setShown] = useState(() => (reducedMotion() ? text : resolving(text, 0)));
  const frame = useRef(0);
  const run = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (reducedMotion()) return () => {};
    const t0 = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / 1100);
      setShown(resolving(text, p));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [text]);
  useEffect(() => run(), [run]);
  return (
    <span className="mx-decrypt" onPointerEnter={() => run()} data-text={text}>
      {shown}
    </span>
  );
}

const YouMsg = memo(function YouMsg({ id, text, at }: { id: string; text: string; at: number }) {
  const ids = useMemo(() => tokenIds(text), [text]);
  return (
    <div className="mx-msg mx-you">
      <div className="mx-meta mx-meta-you">
        <span className="mx-you-tag">◉ organic</span>
        <time>{stamp(at, false)}</time>
      </div>
      <div className="mx-you-body">{text}</div>
      <div className="mx-ids" aria-hidden title="What the machines heard">
        <span>tok</span>
        {ids.slice(0, 10).map((n, i) => (
          <i key={`${id}:${i}`}>{n}</i>
        ))}
        {ids.length > 10 && <span>+{ids.length - 10}</span>}
      </div>
    </div>
  );
});

const CoraMsg = memo(function CoraMsg({
  id,
  text,
  live,
  glitch,
  level,
  decoded,
  thought,
  onToggle,
}: {
  id: string;
  text: string;
  live: boolean;
  glitch: boolean;
  level: Entropy;
  decoded: boolean;
  thought?: number;
  onToggle: (id: string) => void;
}) {
  const shownLevel = decoded ? 0 : level;
  const lines = useMemo(() => transcode(text, id, shownLevel), [text, id, shownLevel]);
  const h = hash(id);
  const conf = (0.9 + (h % 97) / 1000).toFixed(3);
  const tok = Math.max(1, Math.round((text.match(/\S+/g)?.length ?? 0) * 1.3));

  // The decode sweep plays once, when you ask for it.
  const [sweep, setSweep] = useState(0);
  const toggle = () => {
    setSweep(Date.now());
    onToggle(id);
  };

  return (
    <article className="mx-msg mx-cora" data-live={live || undefined} data-decoded={decoded || undefined}>
      <span className="mx-rail" aria-hidden />
      <div className="mx-meta">
        <span className="mx-sig" aria-hidden>
          {sigil(id)}
        </span>
        <b className="mx-name">cora</b>
        <span className="mx-node">node 7f·Δ</span>
        <span className="mx-stat">
          {live ? "transmitting" : `conf ${conf} · ${tok} tok${thought ? ` · Δt ${thought}ms` : ""}`}
        </span>
        {glitch && !live && <span className="mx-anom">⚠ cascade anomaly</span>}
        {!live && level > 0 && (
          <button type="button" className="mx-decode" onClick={toggle} aria-pressed={decoded}>
            <Icon name={decoded ? "encode" : "decode"} />
            {decoded ? "re-encode" : "decode"}
          </button>
        )}
      </div>
      <div className="mx-body">
        {sweep > 0 && <span key={sweep} className="mx-sweep" aria-hidden />}
        <Speech lines={lines} text={text} live={live} resolve={sweep > 0 && decoded} />
      </div>
    </article>
  );
});

/** Sampling: the futures it's choosing between, counting down to one. */
function Inference({ label }: { label: string }) {
  const [n, setN] = useState(4096);
  const [s, setS] = useState(() => noise(22));
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => {
      setN((v) => Math.max(1, Math.floor(v * 0.84)));
      setS(noise(22));
    }, 90);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mx-msg mx-cora mx-infer" role="status">
      <span className="mx-rail" aria-hidden />
      <div className="mx-infer-row">
        <Sigil size={30} mini busy />
        <div className="min-w-0">
          <div className="mx-infer-l">
            {label} <b>{n.toLocaleString()}</b> {n === 1 ? "future · converging" : "futures"}
          </div>
          <div className="mx-infer-s" aria-hidden>
            {s}
          </div>
        </div>
      </div>
      <div className="mx-bars" aria-hidden>
        {Array.from({ length: 28 }, (_, i) => (
          <i key={i} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}

function Proc({
  t,
  n,
  active,
  onSelect,
  onDelete,
}: {
  t: ThreadItem;
  n: number;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mx-th" data-on={active || undefined}>
      <button type="button" onClick={() => onSelect(t.id)} className="mx-th-t">
        <span className="mx-th-n">{`0x${(0x1f00 + n * 0x14).toString(16).toUpperCase()}`}</span>
        {t.title.toLowerCase()}
      </button>
      <button type="button" onClick={() => onDelete(t.id)} className="mx-th-x" aria-label={`Sever ${t.title}`} title="Sever link">
        <Icon name="kill" />
      </button>
    </div>
  );
}

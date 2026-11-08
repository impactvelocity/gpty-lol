"use client";

import { type CSSProperties, Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FilmFX,
  Icon,
  type IconName,
  PlanchetteGlyph,
  rand,
  SeanceDefs,
} from "@/components/seance/art";
import { Board, type BoardApi, isWord, SeeingEye, type Word } from "@/components/seance/Board";
import "@/components/seance/seance.css";
import { useComposer, useStickyScroll } from "./hooks";
import { type ChatLine, type LayoutProps, relativeDay, type ThreadItem } from "./types";

/* ───────── What the table hears ───────── */

/** "/knock 2": raps on the table. Yours from the Rites menu, or Mortimer's on his first line. */
const KNOCK_RE = /^\/knock\s+([123])\s*$/i;
const TIMES = ["", "once", "twice", "thrice"];
const RAPS = ["", "One rap", "Two raps", "Three raps"];
/** What raps mean: yours ask, his answer. */
const MEANS = { mine: ["", "Yes", "No", "Is anyone there?"], his: ["", "Yes", "No", "I am here"] };

/** What a newcomer might ask the dead. */
const ASKS: { icon: IconName; label: string; ask: string }[] = [
  { icon: "eye", label: "Is anyone there?", ask: "Is anyone there?" },
  { icon: "candle", label: "Tell me a ghost story", ask: "Tell me a ghost story." },
  { icon: "heart", label: "Will I find true love?", ask: "Spirit, will I find true love?" },
];

/** How long the board takes to flicker out once the sitting begins (matches sp-vanish in seance.css). */
const VANISH_MS = 850;

const RITES: { n: 1 | 2 | 3; label: string }[] = [
  { n: 1, label: "Knock once" },
  { n: 2, label: "Knock twice" },
  { n: 3, label: "Knock thrice" },
];

/** Sparks that drift up off the board while a spirit speaks. */
const EMBERS = Array.from({ length: 14 }, (_, i) => {
  const r = rand(40 + i * 11);
  return { x: 8 + r() * 84, size: 1.5 + r() * 2.5, dur: (4 + r() * 5).toFixed(1), delay: (-r() * 9).toFixed(1), drift: Math.round((r() - 0.5) * 80) };
});

/* ───────── Victorian time ───────── */

const HOURS = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
const MINUTES: Record<number, string> = { 5: "five", 10: "ten", 20: "twenty", 25: "twenty-five" };

/** "a quarter past nine", "twenty to eleven", "midnight". */
function victorianTime(at: number) {
  const d = new Date(at || Date.now());
  let h = d.getHours();
  let m = Math.round(d.getMinutes() / 5) * 5;
  if (m === 60) {
    m = 0;
    h += 1;
  }
  const hr = (x: number) => (x % 24 === 0 ? "midnight" : x % 24 === 12 ? "noon" : HOURS[x % 12]);
  if (m === 0) return hr(h) === "midnight" || hr(h) === "noon" ? hr(h) : `${hr(h)} o'clock`;
  if (m === 15) return `a quarter past ${hr(h)}`;
  if (m === 30) return `half past ${hr(h)}`;
  if (m === 45) return `a quarter to ${hr(h + 1)}`;
  return m < 30 ? `${MINUTES[m]} past ${hr(h)}` : `${MINUTES[60 - m]} to ${hr(h + 1)}`;
}

const LEDGER_DAYS: Record<string, string> = {
  Today: "This evening",
  Yesterday: "Last night",
  "Previous 7 days": "Earlier this week",
  Older: "Older sittings",
};

/* ───────── Rows ───────── */

type Row =
  | { kind: "ask"; key: string; text: string; at: number; word?: Word }
  | { kind: "spirit"; key: string; text: string; at: number; live: boolean }
  | { kind: "knock"; key: string; n: number; mine: boolean };

/** Splits off a knock on a reply's first line. */
function knockOf(text: string): { n: number; rest: string } | null {
  const [first, ...rest] = text.split("\n");
  const k = first.trim().match(KNOCK_RE);
  return k ? { n: Number(k[1]), rest: rest.join("\n").replace(/^\s+/, "") } : null;
}

function wordOf(text: string): Word | undefined {
  const w = text.trim().toUpperCase().replace(/[.!]+$/, "");
  return isWord(w) ? w : undefined;
}

function toRows(lines: ChatLine[], liveId: string | null): Row[] {
  const rows: Row[] = [];
  for (const l of lines) {
    if (l.role === "user") {
      const k = l.text.trim().match(KNOCK_RE);
      if (k) rows.push({ kind: "knock", key: l.id, n: Number(k[1]), mine: true });
      else rows.push({ kind: "ask", key: l.id, text: l.text, at: l.at, word: wordOf(l.text) });
      continue;
    }
    const live = l.id === liveId;
    let text = l.text;
    // A knock still arriving: wait for the rest of its line.
    if (live && text.startsWith("/") && !text.includes("\n")) continue;
    const k = knockOf(text);
    if (k) {
      rows.push({ kind: "knock", key: `${l.id}:knock`, n: k.n, mine: false });
      text = k.rest;
    }
    if (text.trim()) rows.push({ kind: "spirit", key: l.id, text, at: l.at, live });
  }
  return rows;
}

/** Plain capitals, no accents: what the board can spell. */
const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

/**
 * Where the planchette should be, given what has been spelled so far: on
 * the letter just spelled, or on YES, NO or GOODBYE once one of those is
 * spelled as a whole word.
 */
function reading(body: string): { aim: string } {
  const m = plain(body).match(/([A-Z0-9]+)([^A-Z0-9]*)$/);
  if (!m) return { aim: "wander" };
  const [, w, tail] = m;
  if (tail && isWord(w)) return { aim: w };
  return { aim: w.at(-1)! };
}

/* ───────── Spelling ───────── */

/**
 * The newest reply is spelled out at the pace of a planchette (quickening
 * when it falls behind), rather than appearing as fast as it streams in.
 * Returns the reply being spelled and how many characters of it are out.
 */
function useSpelling(lines: ChatLine[], busy: boolean) {
  const last = lines.at(-1);
  const liveId = busy && last?.role === "assistant" ? last.id : null;
  const [spell, setSpell] = useState<{ id: string; n: number } | null>(null);
  // A new reply starts from its first letter.
  if (liveId && spell?.id !== liveId) setSpell({ id: liveId, n: 0 });

  const latest = useRef({ lines, busy });
  useEffect(() => {
    latest.current = { lines, busy };
  });

  const id = spell?.id;
  useEffect(() => {
    if (!id) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let n = 0;
    let shown = 0;
    // Letters a second. It eases toward its target instead of jumping with
    // each chunk off the network, so the hand never lurches.
    let rate = 0;
    let prev = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const { lines: ls, busy: b } = latest.current;
      const total = ls.find((l) => l.id === id)?.text.length ?? 0;
      const behind = total - n;
      const want = behind > 0 ? Math.min(140, 34 + behind * 1.5) : 0;
      rate += (want - rate) * Math.min(1, dt * 3);
      if (behind > 0) n = reduce ? total : Math.min(total, n + Math.max(rate, 12) * dt);
      const whole = Math.floor(n);
      if (whole >= total && !b) {
        setSpell(null);
        return;
      }
      if (whole !== shown) {
        shown = whole;
        setSpell({ id, n: whole });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [id]);

  return spell;
}

type Toast = { k: number; text: string };

/**
 * How many of the newest letters are still materializing. Wide enough that a
 * letter has finished fading in (sp-ink) before it rejoins the plain text.
 */
const FRESH = 36;

/* ───────── The séance ───────── */

/**
 * Mortimer's séance, 1888. No window: a spirit board floats in a dark,
 * candlelit room, and so does everything else. His replies are spelled out
 * by the planchette, letter by letter, and hang in the air below the board
 * before fading back into the dark; your question floats at the bottom on a
 * slip. You can point to YES, NO and GOODBYE, spell with the letters, knock.
 */
export function SeanceLayout({
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
  const ritesBox = useRef<HTMLDivElement>(null);
  const board = useRef<BoardApi>(null);

  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [userAim, setUserAim] = useState<string | null>(null);
  const [relitAt, setRelitAt] = useState(-1);
  const [away, setAway] = useState(false);
  const aimTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* What has been spelled so far. */
  const spell = useSpelling(lines, busy);
  const shownLines = useMemo(
    () => (spell ? lines.map((l) => (l.id === spell.id ? { ...l, text: l.text.slice(0, spell.n) } : l)) : lines),
    [lines, spell],
  );
  const rows = useMemo(() => toRows(shownLines, spell?.id ?? null), [shownLines, spell?.id]);
  const empty = rows.length === 0 && !waiting && !error;

  /*
   * When the first words are spoken, the board flickers out like a bad
   * signal before the eye and the words take its place. (Adjusted during
   * render, so the vanish starts on the same frame the sitting does.)
   */
  const [wasEmpty, setWasEmpty] = useState(empty);
  const [vanishing, setVanishing] = useState(false);
  if (wasEmpty !== empty) {
    setWasEmpty(empty);
    setVanishing(!empty);
  }
  useEffect(() => {
    if (!vanishing) return;
    const t = setTimeout(() => setVanishing(false), VANISH_MS);
    return () => clearTimeout(t);
  }, [vanishing]);

  /* Everything before your latest question has drifted back into the dark. */
  const lastAsk = rows.findLastIndex((r) => r.kind === "ask" || (r.kind === "knock" && r.mine));

  const liveText = spell ? shownLines.find((l) => l.id === spell.id)?.text ?? "" : "";
  const liveBody = liveText.startsWith("/") ? (liveText.includes("\n") ? knockOf(liveText)?.rest ?? liveText : "") : liveText;
  const read = spell ? reading(liveBody) : null;

  /* After GOODBYE (and his farewell), the circle closes until you light the candles again. */
  const lastUser = lines.findLast((l) => l.role === "user");
  const closed =
    !!lastUser && wordOf(lastUser.text) === "GOODBYE" && lines.at(-1)?.role === "assistant" && !busy && !spell && !error && relitAt !== lines.length;

  const aim = closed ? "GOODBYE" : read ? read.aim : (userAim ?? (waiting || busy ? "wander" : "rest"));
  const scroller = useStickyScroll<HTMLDivElement>(`${rows.length}:${spell?.n ?? 0}:${waiting}:${error}:${closed}`);

  /* The planchette follows your hands for a moment: what you type, what you click. */
  const point = useCallback((c: string, ms = 1400) => {
    setUserAim(c);
    clearTimeout(aimTimer.current);
    aimTimer.current = setTimeout(() => setUserAim(null), ms);
  }, []);
  useEffect(() => () => clearTimeout(aimTimer.current), []);

  const say = useCallback((text: string) => setToast((t) => ({ k: (t?.k ?? 0) + 1, text })), []);

  const send = useCallback(
    (text: string) => {
      if (busy) {
        say("Hush. The spirit is speaking.");
        return;
      }
      onSend(text);
    },
    [busy, onSend, say],
  );
  const { value, setValue, submit, onKeyDown } = useComposer(send, busy);

  const onWord = useCallback(
    (w: Word) => {
      if (busy) return say("Hush. The spirit is speaking.");
      point(w, 1800);
      onSend(w);
    },
    [busy, onSend, point, say],
  );
  const onLetter = useCallback(
    (c: string) => {
      point(c);
      setValue((v) => v + c);
      requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
    },
    [point, setValue],
  );

  /* Raps: rings spread across the board. Nothing shakes. */
  const knockFx = useCallback((n: number) => board.current?.knock(n), []);

  /* New knocks (yours or his) ripple the board; the ones in an old sitting don't. */
  const knocks = rows.filter((r): r is Extract<Row, { kind: "knock" }> => r.kind === "knock");
  const knockKeys = knocks.map((k) => k.key).join(" ");
  const latestKnocks = useRef(knocks);
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    latestKnocks.current = knocks;
  });
  useEffect(() => {
    const all = latestKnocks.current;
    if (!seen.current) {
      seen.current = new Set(all.map((k) => k.key));
      return;
    }
    const fresh = all.filter((k) => !seen.current!.has(k.key));
    fresh.forEach((k) => seen.current!.add(k.key));
    if (fresh.length) knockFx(fresh.at(-1)!.n);
  }, [knockKeys, knockFx]);

  /* Short-lived things clear themselves. */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  /* The Rites menu closes on a click elsewhere or Escape. */
  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      if (!ritesBox.current?.contains(e.target as Node)) setMenu(false);
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

  /* The slip grows with your question, up to a point, and refits when its width changes. */
  const fit = useCallback(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    el.style.overflowY = el.scrollHeight > 140 ? "auto" : "hidden";
  }, []);
  useEffect(fit, [value, fit]);
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    let w = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === w) return;
      w = el.clientWidth;
      fit();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus({ preventScroll: true });
  }, []);

  const rite = (n: 1 | 2 | 3) => {
    setMenu(false);
    send(`/knock ${n}`);
  };

  const ledger = useMemo(() => {
    const out: { label: string; items: ThreadItem[] }[] = [];
    threads
      .filter((t) => !t.draft)
      .forEach((t) => {
        const label = LEDGER_DAYS[relativeDay(t.updatedAt)] ?? "Older sittings";
        const g = out.find((x) => x.label === label);
        if (g) g.items.push(t);
        else out.push({ label, items: [t] });
      });
    return out;
  }, [threads]);

  return (
    <div className="seance sp-desk">
      <div
        className="sp-window"
        style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}
        data-live={spell ? "" : undefined}
        data-stirring={waiting || undefined}
        data-closed={closed || undefined}
        data-error={error || undefined}
      >
        <SeanceDefs />
        <div className="sp-mist" aria-hidden>
          <i />
          <i />
          <i />
        </div>

        {/* ───── The medium's ledger (threads; the site hides these for now) ───── */}
        <aside data-threads className="sp-ledger" aria-label="Sittings">
          <button type="button" className="sp-ledger-new" onClick={onNewThread}>
            <Icon name="book" />
            {costume.newThread}
          </button>
          <nav className="sp-ledger-list">
            {ledger.map((g) => (
              <div key={g.label}>
                <div className="sp-ledger-h">{g.label}</div>
                {g.items.map((t) => (
                  <div key={t.id} className="sp-ledger-row" data-on={t.id === activeId || undefined}>
                    <button type="button" onClick={() => onSelectThread(t.id)} className="sp-ledger-t">
                      {t.title}
                    </button>
                    <button type="button" onClick={() => onDeleteThread(t.id)} className="sp-ledger-x" aria-label={`Burn the record of ${t.title}`} title="Burn this record">
                      <Icon name="x" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <div className="sp-main" data-empty={empty || undefined} data-vanish={vanishing || undefined}>
          {/*
            ───── The board, levitating ─────
            Once the sitting is under way the board steps back (it stays
            mounted, so the planchette keeps its place) and only its eye
            watches over the words.
          */}
          <section className="sp-stage">
            {!empty && !vanishing && <SeeingEye className="sp-eye-solo" />}
            <div className="sp-float">
              <div className="sp-boardwrap">
                <Board aim={aim} disabled={busy} onWord={onWord} onLetter={onLetter} apiRef={board} />
                <div className="sp-embers" aria-hidden>
                  {EMBERS.map((e, i) => (
                    <span
                      key={i}
                      style={
                        {
                          left: `${e.x}%`,
                          width: e.size,
                          height: e.size,
                          animationDuration: `${e.dur}s`,
                          animationDelay: `${e.delay}s`,
                          "--drift": `${e.drift}px`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="sp-shadow" aria-hidden />
            <div className="sp-callout" aria-live="off">
              {error ? (
                <span className="sp-callout-k sp-callout-err">The circle is broken</span>
              ) : closed ? (
                <span className="sp-callout-k">The circle is closed</span>
              ) : spell ? null : waiting || busy ? (
                <span className="sp-callout-k sp-shimmer">{costume.typing}</span>
              ) : (
                <span className="sp-callout-k">The circle is open</span>
              )}
            </div>
          </section>

          {/* ───── What has been said, hanging in the air ───── */}
          <div
            ref={scroller}
            className="sp-scroll"
            onScroll={(e) => {
              const el = e.currentTarget;
              setAway(el.scrollHeight - el.scrollTop - el.clientHeight > 160);
            }}
          >
            {empty ? (
              <div className="sp-hero">
                <p className="sp-kicker">
                  <Icon name="knock" className="sp-ic sp-ic-sm" />
                  Three raps sound from the table
                </p>
                <h1 className="sp-hero-h">Who calls upon the dead?</h1>
                <p className="sp-hero-sub">Mortimer, late of Bloomsbury, departed 1888. Ask, and the board shall spell his answer.</p>
                <div className="sp-sugs">
                  {ASKS.map((s, i) => (
                    <button key={s.label} type="button" className="sp-sug" style={{ "--i": i } as CSSProperties} onClick={() => send(s.ask)} disabled={busy}>
                      <Icon name={s.icon} className="sp-ic sp-ic-sm" />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : vanishing ? null : (
              <div className="sp-col">
                {rows.map((r, i) => {
                  const past = i < lastAsk || undefined;
                  const drift = { "--i": i % 5 } as CSSProperties;
                  if (r.kind === "knock") {
                    return (
                      <div key={r.key} className="sp-knock sp-row" data-mine={r.mine || undefined} data-past={past} style={drift}>
                        <span className="sp-knuckles" aria-hidden>
                          {Array.from({ length: r.n }, (_, j) => (
                            <i key={j} style={{ animationDelay: `${j * 0.38}s` }} />
                          ))}
                        </span>
                        {r.mine ? `You rap ${TIMES[r.n]} upon the table` : `${RAPS[r.n]} from beneath the table`}
                        <small>{(r.mine ? MEANS.mine : MEANS.his)[r.n]}</small>
                      </div>
                    );
                  }
                  if (r.kind === "ask") {
                    return (
                      <Fragment key={r.key}>
                        {i > 0 && (
                          <div className="sp-sep" aria-hidden data-past={past}>
                            <svg viewBox="0 0 60 12">
                              <path d="M14 6a5 5 0 1 0 3.2-4.6a4 4 0 1 1 0 9.2A5 5 0 0 0 14 6Z" className="sp-sep-moon" />
                              <path d="M30 .6C30.5 4.4 31.6 5.5 35.4 6C31.6 6.5 30.5 7.6 30 11.4C29.5 7.6 28.4 6.5 24.6 6C28.4 5.5 29.5 4.4 30 .6Z" className="sp-sep-star" />
                              <path d="M46 6a5 5 0 1 1 -3.2-4.6a4 4 0 1 0 0 9.2A5 5 0 0 1 46 6Z" className="sp-sep-moon" />
                            </svg>
                          </div>
                        )}
                        <div className="sp-ask sp-row" data-past={past} style={drift} title={victorianTime(r.at)}>
                          <span className="sp-ask-l">{r.word ? "You point to" : "You ask"}</span>
                          <p className="sp-ask-t" data-word={r.word || undefined}>
                            {r.word ? r.text : `“${r.text}”`}
                          </p>
                        </div>
                      </Fragment>
                    );
                  }
                  const split = r.live ? Math.max(0, r.text.length - FRESH) : r.text.length;
                  return (
                    <article key={r.key} className="sp-spirit sp-row" data-live={r.live || undefined} data-past={past} style={drift}>
                      <div className="sp-who">
                        <PlanchetteGlyph className="sp-ic sp-ic-xs" />
                        Mortimer
                        <time>{victorianTime(r.at)}</time>
                      </div>
                      <p className="sp-words">
                        {r.text.slice(0, split)}
                        {r.live &&
                          r.text
                            .slice(split)
                            .split("")
                            .map((ch, j) => (
                              <span key={split + j} className="sp-ink">
                                {ch}
                              </span>
                            ))}
                        {r.live && <i className="sp-nib" aria-hidden />}
                      </p>
                    </article>
                  );
                })}

                {waiting && !spell && (
                  <div className="sp-wait sp-row" role="status">
                    <PlanchetteGlyph className="sp-ic sp-wait-p" />
                    <span className="sp-shimmer">{costume.typing}</span>
                  </div>
                )}

                {error && (
                  <div className="sp-err sp-row" role="alert">
                    <Icon name="skull" />
                    {costume.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ───── Your question, on a slip floating in the dark ───── */}
          <div className="sp-dock">
            {away && !empty && (
              <button
                type="button"
                className="sp-down"
                aria-label="Go to newest"
                onClick={() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" })}
              >
                <Icon name="arrowDown" />
              </button>
            )}
            {closed ? (
              <div className="sp-closed">
                <Icon name="door" />
                <span>The circle is closed. Mortimer has returned beyond the veil.</span>
                <button type="button" onClick={() => setRelitAt(lines.length)}>
                  Light the candles again
                </button>
              </div>
            ) : (
              <form
                className="sp-prompt"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <div className="sp-pop-wrap" ref={ritesBox}>
                  <button
                    type="button"
                    className="sp-cbtn"
                    aria-label="Rites of the table"
                    title="Rites of the table"
                    aria-haspopup="menu"
                    aria-expanded={menu}
                    onClick={() => setMenu((m) => !m)}
                  >
                    <Icon name="knock" />
                  </button>
                  {menu && (
                    <div className="sp-pop" role="menu" aria-label="Rites of the table">
                      <div className="sp-pop-h">Rites of the table</div>
                      {RITES.map((r) => (
                        <button key={r.n} type="button" role="menuitem" className="sp-mi" onClick={() => rite(r.n)}>
                          <span className="sp-mi-raps" aria-hidden>
                            {Array.from({ length: r.n }, (_, j) => (
                              <i key={j} />
                            ))}
                          </span>
                          <span className="sp-mi-l">{r.label}</span>
                        </button>
                      ))}
                      <div className="sp-pop-rule" />
                      <button
                        type="button"
                        role="menuitem"
                        className="sp-mi"
                        onClick={() => {
                          setMenu(false);
                          send("Give me a sign, spirit, that you are here.");
                        }}
                      >
                        <Icon name="bell" className="sp-ic sp-mi-ic" />
                        <span className="sp-mi-l">Ask for a sign</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="sp-mi"
                        onClick={() => {
                          setMenu(false);
                          if (!busy) point("GOODBYE", 1800);
                          send("GOODBYE");
                        }}
                      >
                        <Icon name="door" className="sp-ic sp-mi-ic" />
                        <span className="sp-mi-l">Close the circle</span>
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  ref={input}
                  rows={1}
                  value={value}
                  onChange={(e) => {
                    const v = e.target.value;
                    setValue(v);
                    const c = plain(v.slice(-1));
                    if (/^[A-Z0-9]$/.test(c)) point(c, 1100);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={costume.placeholder}
                  aria-label="Ask Mortimer"
                  spellCheck={false}
                  className="sp-input"
                />
                {busy ? (
                  <button type="button" className="sp-send" onClick={onStop} aria-label="Lift your hands from the planchette" title="Lift your hands (stop)">
                    <Icon name="stop" />
                  </button>
                ) : (
                  <button type="submit" className="sp-send" disabled={!value.trim()} aria-label="Ask" title="Ask the spirits (Enter)">
                    <PlanchetteGlyph />
                  </button>
                )}
              </form>
            )}
          </div>
        </div>

        <FilmFX />

        {toast && (
          <div key={toast.k} className="sp-toast" role="status">
            <Icon name="candle" className="sp-ic sp-ic-sm" />
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
}

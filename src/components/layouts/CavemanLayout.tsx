"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Arrowhead, art, CaveDefs, Frieze, Icon, OldPaintings } from "@/components/caveman/art";
import "@/components/caveman/caveman.css";
import {
  GIFT_NAMES,
  GIFT_RE,
  GIFTS,
  type Gift,
  giftOf,
  Picto,
  PICTO_IDS,
  PICTO_NAMES,
  type PictoId,
  Pictos,
} from "@/components/caveman/pictos";
import { Gpty } from "@/components/Gpty";
import { getAgent } from "@/lib/agents";
import { useComposer, useDesktopDrag, useStickyScroll } from "./hooks";
import { type ChatLine, type LayoutProps, relativeDay, type ThreadItem } from "./types";

/* ───────── Modes ───────── */

/**
 * Older chats may have Quick or Thinking messages from when the wall had a
 * model picker: they start "/quick …" or "/think …". The wall hides the prefix
 * and shows a small tag instead.
 */
type Mode = "quick" | "think";
const MODES: { id: Mode; label: string; p: PictoId }[] = [
  { id: "quick", label: "Quick", p: "bird" },
  { id: "think", label: "Thinking", p: "fire" },
];
const modeOf = (m: Mode) => MODES.find((x) => x.id === m)!;
const MODE_RE = /^\/(quick|think)\s+([\s\S]+)$/i;

/** What the empty wall offers, like any good chat app. */
const SUGGESTIONS: { p: PictoId; label: string; ask: string }[] = [
  { p: "mammoth", label: "Plan big hunt", ask: "Help me plan a mammoth hunt." },
  { p: "fire", label: "Make fire", ask: "How do I make a fire?" },
  { p: "hand", label: "Paint picture", ask: "Paint me a picture of a mammoth hunt." },
  { p: "rock", label: "What is wheel?", ask: "What's a wheel?" },
];

/** What's in Grug's head while he thinks, one picture at a time. */
const THOUGHTS: PictoId[] = ["fire", "star", "mammoth", "moon", "hand"];

/* ───────── Cave time ───────── */

const NUMBERS = ["NO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"];
/** Grug counts on his fingers. Past ten is MANY. */
const count = (n: number) => NUMBERS[n] ?? "MANY";

/** A breath is about two seconds, give or take a mammoth. */
const breaths = (ms: number) => count(Math.max(1, Math.round(ms / 2000)));

/** Where the sun was when you said it. */
function sunTime(at: number) {
  const h = new Date(at || Date.now()).getHours();
  if (h >= 5 && h < 9) return "Sun come up";
  if (h < 12 && h >= 9) return "Sun climb";
  if (h < 15 && h >= 12) return "Sun high";
  if (h < 18 && h >= 15) return "Sun sleepy";
  if (h < 20 && h >= 18) return "Sun go down";
  return "Moon up";
}

const CAVE_DAYS: Record<string, string> = {
  Today: "This sun",
  Yesterday: "Last sun",
  "Previous 7 days": "Few sun ago",
  Older: "Many moon ago",
};

/* ───────── Rows ───────── */

type MsgRow = { kind: "msg"; key: string; mine: boolean; text: string; mode?: Mode; at: number; askedAt?: number; live: boolean };
type GiftRow = { kind: "gift"; key: string; mine: boolean; gift: Gift };
type Row = MsgRow | GiftRow;

/** Lines become rows: "/give …" becomes a gift, a mode prefix becomes a tag. */
function toRows(lines: ChatLine[], busy: boolean): Row[] {
  const rows: Row[] = [];
  let mode: Mode | undefined;
  let askedAt = 0;
  lines.forEach((l, i) => {
    if (l.role === "user") {
      const g = l.text.trim().match(GIFT_RE);
      if (g) {
        mode = undefined;
        rows.push({ kind: "gift", key: l.id, mine: true, gift: giftOf(g[1]) });
        return;
      }
      const m = l.text.match(MODE_RE);
      mode = m ? (m[1].toLowerCase() as Mode) : undefined;
      askedAt = l.at;
      rows.push({ kind: "msg", key: l.id, mine: true, text: m ? m[2].trim() : l.text, mode, at: l.at, live: false });
      return;
    }
    const live = busy && i === lines.length - 1;
    let text = l.text;
    // A command still arriving: wait for the rest of the line.
    if (live && text.startsWith("/") && !text.includes("\n")) return;
    const [first, ...rest] = text.split("\n");
    const g = first.trim().match(GIFT_RE);
    if (g) {
      rows.push({ kind: "gift", key: `${l.id}:gift`, mine: false, gift: giftOf(g[1]) });
      text = rest.join("\n").replace(/^\s+/, "");
    }
    if (text.trim()) rows.push({ kind: "msg", key: l.id, mine: false, text, mode, at: l.at, askedAt, live });
  });
  return rows;
}

type Toast = { k: number; text: string; p?: PictoId };

/* ───────── The window ───────── */

/**
 * GrugPT: the chat app of 10,000 BC. A whole modern AI chat window, painted
 * in ochre on a cave wall at red twilight: the model picker, the big empty
 * question, a band painted across the foot of the wall to write in (with a
 * flint send button), and answers with pictures in them.
 */
export function CavemanLayout({
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
  const agent = getAgent(costume.id);
  const { ref: win, handle } = useDesktopDrag<HTMLDivElement>();
  const input = useRef<HTMLTextAreaElement>(null);
  const plusBox = useRef<HTMLDivElement>(null);

  const [menu, setMenu] = useState<"plus" | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [cheer, setCheer] = useState(0);
  const [away, setAway] = useState(false);
  const [fx, setFx] = useState<{ k: number; gift: Gift; mine: boolean } | null>(null);
  const [thoughts, setThoughts] = useState<Record<string, number>>({});

  const send = (text: string) => {
    if (busy) return;
    onSend(text);
  };
  const { value, setValue, submit, onKeyDown } = useComposer(send, busy);

  const rows = useMemo(() => toRows(lines, busy), [lines, busy]);
  const empty = rows.length === 0 && !waiting && !error;
  const scroller = useStickyScroll<HTMLDivElement>(`${rows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}:${error}`);
  const lastGrug = rows.findLast((r): r is MsgRow => r.kind === "msg" && !r.mine)?.key;
  const lastMine = rows.findLast((r) => r.mine);
  const pendingMode = lastMine?.kind === "msg" ? lastMine.mode : undefined;


  /* How long Grug thought: from sending to the first words. */
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

  /* Gifts land with a little show; old ones in the history don't. */
  const gifts = rows.filter((r): r is GiftRow => r.kind === "gift");
  const giftKeys = gifts.map((g) => g.key).join(" ");
  const latestGifts = useRef(gifts);
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    latestGifts.current = gifts;
  });
  useEffect(() => {
    const all = latestGifts.current;
    if (!seen.current) {
      seen.current = new Set(all.map((g) => g.key));
      return;
    }
    const fresh = all.filter((g) => !seen.current!.has(g.key));
    if (!fresh.length) return;
    fresh.forEach((g) => seen.current!.add(g.key));
    const g = fresh.at(-1)!;
    setFx({ k: Date.now(), gift: g.gift, mine: g.mine });
    if (g.mine) setCheer(Date.now());
  }, [giftKeys]);

  /* Short-lived things clear themselves. */
  useEffect(() => {
    if (!fx) return;
    const t = setTimeout(() => setFx(null), 2000);
    return () => clearTimeout(t);
  }, [fx]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!cheer) return;
    const t = setTimeout(() => setCheer(0), 1100);
    return () => clearTimeout(t);
  }, [cheer]);

  /* Menus close on a click elsewhere or Escape. */
  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      if (!plusBox.current?.contains(e.target as Node)) setMenu(null);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [menu]);

  /* The stone grows with what you write, up to a point. */
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
  }, [value]);

  /* Ready to write on arrival, where there's a keyboard. */
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus({ preventScroll: true });
  }, []);

  const say = (text: string, p?: PictoId) => setToast((t) => ({ k: (t?.k ?? 0) + 1, text, p }));

  /** Your pointer is a torch: the window lights the rock around it. */
  const torch = (e: React.PointerEvent) => {
    const el = win.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--tx", `${Math.round(e.clientX - r.left)}px`);
    el.style.setProperty("--ty", `${Math.round(e.clientY - r.top)}px`);
  };

  const insert = (code: string) => {
    const el = input.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const pad = start > 0 && !/\s$/.test(value.slice(0, start)) ? " " : "";
    setValue(`${value.slice(0, start)}${pad}${code} ${value.slice(end)}`);
    setMenu(null);
    const caret = start + pad.length + code.length + 1;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  };

  const give = (g: Gift) => {
    setMenu(null);
    if (busy) {
      say("Grug busy. Give after.", "hand");
      return;
    }
    onSend(`/give ${g}`);
  };

  const groups = useMemo(() => {
    const out: { label: string; items: ThreadItem[] }[] = [];
    threads
      .filter((t) => !t.draft)
      .forEach((t) => {
        const label = CAVE_DAYS[relativeDay(t.updatedAt)] ?? "Many moon ago";
        const g = out.find((x) => x.label === label);
        if (g) g.items.push(t);
        else out.push({ label, items: [t] });
      });
    return out;
  }, [threads]);

  const wall = art("wall");

  return (
    <div className="cave flex h-full items-center justify-center">
      <div
        ref={win}
        className="cv-window"
        style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}
        onPointerMove={torch}
        onPointerDown={torch}
      >
        <CaveDefs />
        <div
          className="cv-rock"
          aria-hidden
          data-photo={wall ? "" : undefined}
          style={wall ? { backgroundImage: `url(${wall})` } : undefined}
        />
        <OldPaintings />
        <div className="cv-glow" aria-hidden />

        {/* ───── Walls (threads) ───── */}
        <aside data-threads className="cv-threads" aria-label="Walls">
          <button type="button" className="cv-newwall" onClick={onNewThread}>
            <Icon name="pen" />
            {costume.newThread}
          </button>
          <nav className="cv-th-list">
            {groups.map((g) => (
              <div key={g.label}>
                <div className="cv-th-h">{g.label}</div>
                {g.items.map((t) => (
                  <div key={t.id} className="cv-th" data-on={t.id === activeId || undefined}>
                    <button type="button" onClick={() => onSelectThread(t.id)} className="cv-th-t">
                      {t.title.replace(MODE_RE, "$2")}
                    </button>
                    <button type="button" onClick={() => onDeleteThread(t.id)} className="cv-th-x" aria-label={`Smash ${t.title}`} title="Smash wall">
                      <Icon name="smash" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <div className="cv-main" data-empty={empty || undefined}>
          {/* ───── Top: the model picker ───── */}
          {/* No title bar: a painted rule of dots along the top, to drag the slab by. */}
          <div className="cv-top" {...handle} aria-hidden>
            <div className="cv-rule" />
          </div>

          {/* ───── The wall ───── */}
          <div
            ref={scroller}
            className="cv-scroll"
            onScroll={(e) => {
              const el = e.currentTarget;
              setAway(el.scrollHeight - el.scrollTop - el.clientHeight > 180);
            }}
          >
            {empty ? (
              <div className="cv-hero">
                <Frieze className="cv-hero-frieze" />
                <h1 className="cv-hero-h">
                  <span className="cv-hero-grug">
                    <Gpty agent={agent} size={54} mood={cheer ? "typing" : "watching"} />
                  </span>
                  What Grug help with?
                </h1>
                <div className="cv-sugs">
                  {SUGGESTIONS.map((s) => (
                    <button key={s.label} type="button" onClick={() => send(s.ask)} disabled={busy}>
                      <Picto id={s.p} />
                      {s.label}
                    </button>
                  ))}
                </div>
                <p className="cv-fine">Grug can be wrong. Ask elder about big thing.</p>
              </div>
            ) : (
              <div className="cv-col">
                {rows.map((r) =>
                  r.kind === "gift" ? (
                    <div key={r.key} className="cv-gift" data-mine={r.mine || undefined}>
                      <span className="cv-gift-ring">
                        <Picto id={r.gift} label={GIFT_NAMES[r.gift]} />
                      </span>
                      <span>{r.mine ? `You give Grug ${GIFT_NAMES[r.gift]}` : `Grug give you ${GIFT_NAMES[r.gift]}`}</span>
                    </div>
                  ) : r.mine ? (
                    <div key={r.key} className="cv-msg cv-you" title={sunTime(r.at)}>
                      {r.mode && (
                        <span className="cv-tag">
                          <Picto id={modeOf(r.mode).p} />
                          {modeOf(r.mode).label}
                        </span>
                      )}
                      <div className="cv-mine">
                        <Pictos text={r.text} />
                      </div>
                    </div>
                  ) : (
                    <article key={r.key} className="cv-msg cv-grug" data-live={r.live || undefined} data-last={r.key === lastGrug || undefined}>
                      <div className="cv-body">
                        {r.mode === "think" && (
                          <div className="cv-thought">
                            <Picto id="fire" />
                            Thought for {breaths(thoughts[r.key] ?? (r.askedAt && r.at ? r.at - r.askedAt : 0))} breath
                          </div>
                        )}
                        <div className="cv-text">
                          <Pictos text={r.text} murals />
                          {r.live && <i className="cv-blob" aria-hidden />}
                        </div>
                      </div>
                    </article>
                  ),
                )}

                {waiting && (
                  <div className="cv-msg cv-grug cv-wait" role="status">
                    <div className="cv-thinking">
                      <span className="cv-shimmer">
                        {pendingMode === "think" ? "Grug thinking long" : pendingMode === "quick" ? "Grug think fast" : costume.typing}
                      </span>
                      <span className="cv-cycle" aria-hidden>
                        {THOUGHTS.map((p, i) => (
                          <span key={p} style={{ animationDelay: `${i * 0.7}s` }}>
                            <Picto id={p} />
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="cv-err" role="alert">
                    <Picto id="snake" />
                    {costume.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ───── Where you write: painted across the foot of the wall, under painted waves ───── */}
          <div className="cv-dock">
            {away && !empty && (
              <button
                type="button"
                className="cv-down"
                aria-label="Go to newest"
                onClick={() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" })}
              >
                <Icon name="arrowDown" />
              </button>
            )}
            <div className="cv-waves" aria-hidden />
            <div className="cv-band">
              <form
                className="cv-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <div className="cv-pop-wrap" ref={plusBox}>
                  <button
                    type="button"
                    className="cv-cbtn"
                    aria-label="Paint a picture or give Grug something"
                    aria-haspopup="menu"
                    aria-expanded={menu === "plus"}
                    onClick={() => setMenu((m) => (m === "plus" ? null : "plus"))}
                  >
                    <Icon name="plus" />
                  </button>
                  {menu === "plus" && (
                    <div className="cv-pop cv-pop-plus" role="menu" aria-label="Paint and give">
                      <div className="cv-pop-h">Paint</div>
                      <div className="cv-paints">
                        {PICTO_IDS.map((id) => (
                          <button key={id} type="button" role="menuitem" title={`${PICTO_NAMES[id]}  (${id})`} aria-label={PICTO_NAMES[id]} onClick={() => insert(`(${id})`)}>
                            <Picto id={id} />
                          </button>
                        ))}
                      </div>
                      <div className="cv-pop-h">Give Grug</div>
                      <div className="cv-gifts">
                        {GIFTS.map((g) => (
                          <button key={g} type="button" role="menuitem" onClick={() => give(g)}>
                            <Picto id={g} />
                            <span>{g}</span>
                          </button>
                        ))}
                      </div>
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
                  aria-label="Message Grug"
                  spellCheck={false}
                  className="cv-input"
                />
                {busy ? (
                  <button type="button" className="cv-send" onClick={onStop} aria-label="Stop Grug" title="Stop Grug">
                    <Icon name="stop" />
                  </button>
                ) : (
                  <button type="submit" className="cv-send" disabled={!value.trim()} aria-label="Send" title="Throw (Enter)">
                    <Arrowhead />
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>


        {toast && (
          <div key={toast.k} className="cv-toast" role="status">
            {toast.p && <Picto id={toast.p} />}
            {toast.text}
          </div>
        )}

        {fx && (
          <div key={fx.k} className="cv-fx" aria-hidden data-mine={fx.mine || undefined}>
            <span className="cv-fx-ring">
              <Picto id={fx.gift} />
            </span>
            <span className="cv-fx-t">{fx.mine ? `Grug get ${GIFT_NAMES[fx.gift]}!` : `Grug give you ${GIFT_NAMES[fx.gift]}!`}</span>
          </div>
        )}
      </div>
    </div>
  );
}

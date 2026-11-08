"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import {
  CarolFace,
  Doodle,
  type DoodleId,
  ElfDefs,
  Frieze,
  Icon,
  Splat,
  Sticker,
  StringLights,
  WrappingPaper,
} from "@/components/elf/art";
import "@/components/elf/elf.css";
import { elfFonts } from "@/components/elf/font";
import type { Mood } from "@/components/Gpty";
import { getAgent } from "@/lib/agents";
import { useComposer, useDesktopDrag, useNow, useStickyScroll } from "./hooks";
import { type ChatLine, clock, type LayoutProps, relativeDay, type ThreadItem } from "./types";

/* ───────── Workshop breaks ───────── */

/**
 * Three things one elf does to another between presents. Each is a message
 * on its own ("/snowball"), and Carol can do any of them back by starting
 * her reply with it (see personas.ts).
 */
type Act = "snowball" | "cocoa" | "jingle";
const ACT_RE = /^\/(snowball|cocoa|jingle)\b[ \t]*(.*)$/i;
const ACT_ONLY = /^\/(snowball|cocoa|jingle)\s*$/i;

const ACTS: { id: Act; label: string; note: string }[] = [
  { id: "snowball", label: "Snowball", note: "Throw one at Carol" },
  { id: "cocoa", label: "Cocoa", note: "Bring her a hot one" },
  { id: "jingle", label: "Jingle", note: "Ring the bell on her bench" },
];

const ACT_LINES: Record<Act, { mine: string; hers: string; fxMine: string; fxHers: string }> = {
  snowball: { mine: "You threw a snowball at Carol", hers: "Carol threw a snowball back!", fxMine: "Direct hit!", fxHers: "Got you!" },
  cocoa: { mine: "You brought Carol a cocoa", hers: "Carol made you a cocoa", fxMine: "Cocoa for Carol!", fxHers: "Cocoa for you!" },
  jingle: { mine: "You rang Carol's bell", hers: "Carol rang your bell", fxMine: "Jingle jingle!", fxHers: "Jingle jingle!" },
};

const STICKER: Record<Act, "snowball" | "cocoa" | "bell"> = { snowball: "snowball", cocoa: "cocoa", jingle: "bell" };

/** What the empty bench offers, written on gift tags. */
const SUGGESTIONS: { d: DoodleId; label: string; ask: string }[] = [
  { d: "gift", label: "Wrap a bicycle?!", ask: "How do I wrap a bicycle so nobody can guess what it is?" },
  { d: "mitten", label: "Gift for my dad", ask: "Help me pick a present for my dad. He says he wants nothing." },
  { d: "star", label: "Write the tag", ask: "Write a short, funny poem for a gift tag." },
  { d: "tree", label: "Pack the sleigh", ask: "We've got two billion presents and one sleigh. How do we pack it?" },
  { d: "stocking", label: "Am I on the list?", ask: "Be honest: am I on the nice list this year?" },
];

/** The window's title, next to the traffic lights. */
const TITLE = "Workshop Team Chat";

/** Saved letters by day, the workshop way. */
const LETTER_DAYS: Record<string, string> = {
  Today: "This shift",
  Yesterday: "Last shift",
  "Previous 7 days": "This week",
  Older: "Earlier this season",
};

/* ───────── The sleigh ───────── */

/**
 * The sleigh leaves at six on Christmas Eve, local time, and is back by the
 * 26th; after that the count starts over for next year.
 */
function sleigh(now: number) {
  const y = new Date(now).getFullYear();
  let leaves = new Date(y, 11, 24, 18).getTime();
  if (now >= new Date(y, 11, 26).getTime()) leaves = new Date(y + 1, 11, 24, 18).getTime();
  if (now >= leaves) return { out: true as const };
  return { out: false as const, days: Math.floor((leaves - now) / 86_400_000) };
}

const sleeps = (days: number) => `${days} ${days === 1 ? "sleep" : "sleeps"}`;

/** "The sleigh leaves in 47 sleeps." for the empty bench. */
function SleighLine() {
  const s = sleigh(useNow(60_000));
  if (s.out) return <>The sleigh is out tonight!</>;
  return s.days === 0 ? <>The sleigh leaves tonight!</> : <>The sleigh leaves in {sleeps(s.days)}.</>;
}

/* ───────── Rows ───────── */

type MsgRow = { kind: "msg"; key: string; mine: boolean; text: string; at: number; live: boolean };
type ActRow = { kind: "act"; key: string; mine: boolean; act: Act };
type Row = MsgRow | ActRow;

const actOf = (s: string) => s.toLowerCase() as Act;

/** Lines become rows: "/snowball" on its own (or atop Carol's reply) becomes a workshop break. */
function toRows(lines: ChatLine[], busy: boolean): Row[] {
  const rows: Row[] = [];
  lines.forEach((l, i) => {
    if (l.role === "user") {
      const a = l.text.trim().match(ACT_ONLY);
      if (a) rows.push({ kind: "act", key: l.id, mine: true, act: actOf(a[1]) });
      else rows.push({ kind: "msg", key: l.id, mine: true, text: l.text, at: l.at, live: false });
      return;
    }
    const live = busy && i === lines.length - 1;
    let text = l.text;
    // A break still arriving: wait for the rest of its line.
    if (live && text.startsWith("/") && !text.includes("\n")) return;
    const [first, ...rest] = text.split("\n");
    const a = first.trim().match(ACT_RE);
    if (a) {
      rows.push({ kind: "act", key: `${l.id}:act`, mine: false, act: actOf(a[1]) });
      text = [a[2], ...rest].join("\n").replace(/^\s+/, "");
    }
    if (text.trim()) rows.push({ kind: "msg", key: l.id, mine: false, text, at: l.at, live });
  });
  return rows;
}

/* ───────── Snow ───────── */

function rand(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const FLAKES = (() => {
  const r = rand(7);
  return Array.from({ length: 36 }, () => ({ x: r() * 100, s: 2 + r() * 3.4, d: 11 + r() * 13, dl: -r() * 24, dx: (r() - 0.5) * 70, o: 0.25 + r() * 0.45 }));
})();

type Fx = { k: number; act: Act; mine: boolean; x: number; y: number };
type Toast = { k: number; text: string };

/* ───────── The window ───────── */

/**
 * WorkshopChat: the North Pole's own chat app, a few weeks before the big
 * night. You're the elf at the next bench; Carol's in wrapping. It's drawn
 * like a hand-made holiday card: pine-green felt printed with doodles,
 * cream stitched notes and falling snow, under an app title bar with string
 * lights hung from it.
 */
export function ElfLayout({
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

  const [menu, setMenu] = useState(false);
  const [away, setAway] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [fx, setFx] = useState<Fx | null>(null);
  const [ring, setRing] = useState(0);

  const { value, setValue, submit, onKeyDown } = useComposer(onSend, busy);
  const rows = useMemo(() => toRows(lines, busy), [lines, busy]);
  const empty = rows.length === 0 && !waiting && !error;
  const scroller = useStickyScroll<HTMLDivElement>(`${rows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}:${error}`);
  const liveMsg = rows.some((r) => r.kind === "msg" && r.live);
  const typing = waiting || (busy && !liveMsg);

  const mood: Mood = error ? "error" : typing ? "thinking" : busy ? "typing" : "watching";
  const status = error ? "antenna's down" : typing ? "finding the good tape…" : busy ? "wrapping a reply…" : "on shift · wrapping, bench 7";

  /* Breaks land with a little show; old ones in the history don't. */
  const acts = rows.filter((r): r is ActRow => r.kind === "act");
  const actKeys = acts.map((a) => a.key).join(" ");
  const latestActs = useRef(acts);
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    latestActs.current = acts;
  });
  useEffect(() => {
    const all = latestActs.current;
    if (!seen.current) {
      seen.current = new Set(all.map((a) => a.key));
      return;
    }
    const fresh = all.filter((a) => !seen.current!.has(a.key));
    if (!fresh.length) return;
    fresh.forEach((a) => seen.current!.add(a.key));
    const a = fresh.at(-1)!;
    const r = Math.random;
    // Yours fly up from your bench; Carol's come in from over the top.
    const x = a.mine ? 30 + r() * 40 : 48 + r() * 28;
    const y = a.mine ? 22 + r() * 26 : 42 + r() * 24;
    setFx({ k: Date.now(), act: a.act, mine: a.mine, x, y });
    if (a.act === "jingle") setRing(Date.now());
  }, [actKeys]);

  /* Short-lived things clear themselves. */
  useEffect(() => {
    if (!fx) return;
    const t = setTimeout(() => setFx(null), fx.act === "snowball" ? 4600 : 2200);
    return () => clearTimeout(t);
  }, [fx]);
  useEffect(() => {
    if (!ring) return;
    const t = setTimeout(() => setRing(0), 1000);
    return () => clearTimeout(t);
  }, [ring]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  /* The menu closes on a click elsewhere or Escape. */
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

  /* The note grows with what you write, up to a point. */
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
    el.style.overflowY = el.scrollHeight > 180 ? "auto" : "hidden";
  }, [value]);

  /* Ready to write on arrival, where there's a keyboard. */
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus({ preventScroll: true });
  }, []);

  const doBreak = (a: Act) => {
    setMenu(false);
    if (busy) {
      setToast((t) => ({ k: (t?.k ?? 0) + 1, text: "Carol's mid-bow. Try in a sec!" }));
      return;
    }
    onSend(`/${a}`);
  };

  const letters = useMemo(() => {
    const out: { label: string; items: ThreadItem[] }[] = [];
    threads
      .filter((t) => !t.draft)
      .forEach((t) => {
        const label = LETTER_DAYS[relativeDay(t.updatedAt)] ?? "Earlier this season";
        const g = out.find((x) => x.label === label);
        if (g) g.items.push(t);
        else out.push({ label, items: [t] });
      });
    return out;
  }, [threads]);

  const fxText = fx ? (fx.mine ? ACT_LINES[fx.act].fxMine : ACT_LINES[fx.act].fxHers) : "";

  return (
    <div className={`elf ${elfFonts} flex h-full items-center justify-center`}>
      <div
        ref={win}
        className="el-window"
        data-ring={ring ? "" : undefined}
        style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}
      >
        <ElfDefs />
        <WrappingPaper className="el-paper" />
        <div className="el-snow" aria-hidden>
          {FLAKES.map((f, i) => (
            <span
              key={i}
              className="el-flake"
              style={{ left: `${f.x}%`, width: f.s, height: f.s, opacity: f.o, "--d": `${f.d}s`, "--dl": `${f.dl}s`, "--x": `${f.dx}px` } as CSSProperties}
            />
          ))}
        </div>

        {/* ───── The app's title bar, with Carol on the right ───── */}
        <header className="el-bar" {...handle}>
          <span className="el-traffic" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="el-title">{TITLE}</span>
          <div className="el-who">
            <CarolFace agent={agent} size={28} mood={mood} />
            <b>{costume.assistant}</b>
            <span className="el-who-s">
              <i className="el-dot" data-state={error ? "error" : busy ? "busy" : undefined} aria-hidden />
              <span className="el-who-st">{status}</span>
            </span>
          </div>
        </header>
        <StringLights className="el-bar-lights" />

        <div className="el-body">
          {/* ───── Letters (threads; the site hides these for now) ───── */}
          <aside data-threads className="el-threads" aria-label="Letters">
            <button type="button" className="el-newletter" onClick={onNewThread}>
              <Icon name="pen" />
              {costume.newThread}
            </button>
            <nav className="el-th-list">
              {letters.map((g) => (
                <div key={g.label}>
                  <div className="el-th-h">{g.label}</div>
                  {g.items.map((t) => {
                    const a = t.title.trim().match(ACT_ONLY);
                    return (
                      <div key={t.id} className="el-th" data-on={t.id === activeId || undefined}>
                        <button type="button" onClick={() => onSelectThread(t.id)} className="el-th-t">
                          {a ? ACTS.find((x) => x.id === actOf(a[1]))!.label : t.title}
                        </button>
                        <button type="button" onClick={() => onDeleteThread(t.id)} className="el-th-x" aria-label={`Recycle ${t.title}`} title="Recycle">
                          <Icon name="bin" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>

          <div className="el-main" data-empty={empty || undefined}>
            {/* ───── The conversation ───── */}
            <div
              ref={scroller}
              className="el-scroll"
              onScroll={(e) => {
                const el = e.currentTarget;
                setAway(el.scrollHeight - el.scrollTop - el.clientHeight > 180);
              }}
            >
              {empty ? (
                <div className="el-hero">
                  <Frieze className="el-hero-frieze" />
                  <div className="el-hero-carol">
                    <CarolFace agent={agent} size={64} mood="watching" />
                  </div>
                  <h1 className="el-hero-h">What are we wrapping tonight?</h1>
                  <p className="el-hero-sub">
                    Carol&apos;s at bench 7 with the good tape. <SleighLine />
                  </p>
                  <div className="el-sugs">
                    {SUGGESTIONS.map((s) => (
                      <button key={s.label} type="button" className="el-tag" onClick={() => onSend(s.ask)} disabled={busy}>
                        <Doodle id={s.d} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="el-col">
                  {rows.map((r) =>
                    r.kind === "act" ? (
                      <div key={r.key} className="el-act" data-mine={r.mine || undefined}>
                        <span className="el-act-ic">
                          <Sticker id={STICKER[r.act]} />
                        </span>
                        {r.mine ? ACT_LINES[r.act].mine : ACT_LINES[r.act].hers}
                      </div>
                    ) : r.mine ? (
                      <div key={r.key} className="el-msg el-you">
                        <div className="el-name">
                          <b>You</b>
                          {r.at > 0 && <time dateTime={new Date(r.at).toISOString()}>{clock(r.at)}</time>}
                        </div>
                        <div className="el-bubble el-bubble-you">{r.text}</div>
                      </div>
                    ) : (
                      <div key={r.key} className="el-msg el-carol" data-live={r.live || undefined}>
                        <CarolFace agent={agent} size={34} className="el-msg-face" />
                        <div className="el-msg-b">
                          <div className="el-name">
                            <b>{costume.assistant}</b>
                            {r.at > 0 && <time dateTime={new Date(r.at).toISOString()}>{clock(r.at)}</time>}
                          </div>
                          <div className="el-bubble el-bubble-carol">
                            {r.text}
                            {r.live && <i className="el-caret" aria-hidden />}
                          </div>
                        </div>
                      </div>
                    ),
                  )}

                  {typing && (
                    <div className="el-msg el-carol el-wait" role="status">
                      <CarolFace agent={agent} size={34} mood="thinking" className="el-msg-face" />
                      <div className="el-msg-b">
                        <div className="el-name">{costume.typing}</div>
                        <div className="el-bubble el-bubble-carol el-baubles" aria-hidden>
                          <i />
                          <i />
                          <i />
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="el-err" role="alert">
                      <Doodle id="snowflake" />
                      {costume.error}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ───── Where you write: a cream note with a stitched edge ───── */}
            <div className="el-dock">
              {away && !empty && (
                <button
                  type="button"
                  className="el-down"
                  aria-label="Go to newest"
                  onClick={() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" })}
                >
                  <Icon name="arrowDown" />
                </button>
              )}
              <form
                className="el-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <div className="el-pop-wrap" ref={plusBox}>
                  <button
                    type="button"
                    className="el-cbtn"
                    aria-label="Take a workshop break"
                    aria-haspopup="menu"
                    aria-expanded={menu}
                    onClick={() => setMenu((m) => !m)}
                  >
                    <Icon name="plus" />
                  </button>
                  {menu && (
                    <div className="el-pop" role="menu" aria-label="Workshop break">
                      <div className="el-pop-h">Workshop break</div>
                      {ACTS.map((a) => (
                        <button key={a.id} type="button" role="menuitem" className="el-mi" onClick={() => doBreak(a.id)}>
                          <span className="el-mi-ic">
                            <Sticker id={STICKER[a.id]} />
                          </span>
                          <span className="min-w-0">
                            <b>{a.label}</b>
                            <small>{a.note}</small>
                          </span>
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
                  aria-label="Message Carol"
                  className="el-input"
                />
                {busy ? (
                  <button type="button" className="el-send" onClick={onStop} aria-label="Stop Carol" title="Stop">
                    <Icon name="stop" />
                  </button>
                ) : (
                  <button type="submit" className="el-send" disabled={!value.trim()} aria-label="Send" title="Send (Enter)">
                    <Icon name="send" />
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {toast && (
          <div key={toast.k} className="el-toast" role="status">
            <Doodle id="bell" />
            {toast.text}
          </div>
        )}

        {fx && (
          <div
            key={fx.k}
            className="el-fx"
            data-act={fx.act}
            data-mine={fx.mine || undefined}
            style={{ "--ex": `${fx.x}%`, "--ey": `${fx.y}%` } as CSSProperties}
            aria-hidden
          >
            {fx.act === "snowball" ? (
              <>
                <span className="el-fx-ball">
                  <Sticker id="snowball" />
                </span>
                <Splat className="el-fx-splat" />
                <span className="el-fx-t">{fxText}</span>
              </>
            ) : fx.act === "cocoa" ? (
              <>
                <span className="el-fx-ring">
                  <Sticker id="cocoa" />
                </span>
                <span className="el-fx-t">{fxText}</span>
              </>
            ) : (
              <>
                <span className="el-fx-bell">
                  <Sticker id="bell" />
                </span>
                <span className="el-fx-t">{fxText}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

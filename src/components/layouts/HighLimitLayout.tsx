"use client";

import { ArrowDown, Check, Copy, RotateCw, Volume2, VolumeX } from "lucide-react";
import { Fragment, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { hlFonts } from "@/components/highlimit/font";
import { readSound, saveSound, sfx } from "@/components/highlimit/sound";
import { HlSymbol, KIND_NAME } from "@/components/highlimit/symbols";
import "@/components/highlimit/highlimit.css";
import {
  type Block,
  blocks,
  hash,
  inferKind,
  type Kind,
  type Outcome,
  outcome,
  PULL_FEE,
  rng,
  splitReply,
  STRIPS,
  type Sym,
  TILT,
  toks,
} from "@/components/slots/engine";
import { SAMPLE_QUESTION } from "@/lib/costumes";
import { useDesktopDrag, useStickyScroll } from "./hooks";
import type { ChatLine, LayoutProps } from "./types";

/* ───────── The high-limit room ───────── */

const SUGGESTIONS: { sym: Kind; ask: string }[] = [
  { sym: "email", ask: "Write an email asking my boss for a raise" },
  { sym: "image", ask: "Draw me a cat in a tiny astronaut suit" },
  { sym: "code", ask: "Code a button that runs away from the mouse" },
  { sym: "text", ask: SAMPLE_QUESTION },
];

/** Where the reels rest before the first spin: AGI on the line, as a tease. */
const IDLE: [Sym, Sym, Sym] = ["code", "agi", "image"];

/** The reels turn at least this long, however fast the answer comes. */
const MIN_SPIN = 1100;
/** One full turn of a reel at speed. */
const TURN_MS = 300;
const STOP_EASE = "cubic-bezier(.22,.62,.32,1.06)";

/* ───────── Tokens ───────── */

const BANK_KEY = "gpty:highlimit:bank";
const START_BANK = 2000;
/** Free, like everything here. */
const REFILL = 1000;

function readBank(): number {
  try {
    const v = localStorage.getItem(BANK_KEY);
    const n = v === null ? NaN : Number(v);
    return Number.isFinite(n) ? n : START_BANK;
  } catch {
    return START_BANK;
  }
}

function saveBank(n: number) {
  try {
    localStorage.setItem(BANK_KEY, String(n));
  } catch {}
}

/** One bet size in this room: the fee plus the prompt's tokens. */
const stakeOf = (prompt: string) => PULL_FEE + toks(prompt);

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The status line under the reels, and the label on each payout. */
function verdict(o: Outcome): { label: string; note: string } {
  switch (o.result) {
    case "win":
      return { label: "Three of a kind", note: `+${o.payout.toLocaleString()} tokens back` };
    case "big":
      return { label: "Big win", note: `+${o.payout.toLocaleString()} tokens back` };
    case "near":
      return { label: "So close", note: "Two of a kind" };
    case "agi":
      return { label: "AGI, almost", note: "The jackpot is due" };
    case "bust":
      return { label: "Hallucination", note: "Nothing back" };
    case "tilt":
      return { label: "Jammed", note: "Try again" };
  }
}

/* ───────── Rows ───────── */

type PromptRow = { kind: "prompt"; key: string; text: string; again: number };
type PayRow = {
  kind: "pay";
  key: string;
  body: string;
  sym: Kind;
  tagged: boolean;
  outcome: Outcome;
  live: boolean;
  stake: number;
  out: number;
};
type Row = PromptRow | PayRow;

/**
 * Prompts and payouts. The same prompt twice in a row is a re-spin. Each
 * payout lands by its own id, so history always reads the same way.
 */
function toRows(lines: ChatLine[], busy: boolean): Row[] {
  const rows: Row[] = [];
  let last = "";
  let again = 0;
  let stake = 0;
  lines.forEach((l, i) => {
    if (l.role === "user") {
      const p = l.text.trim();
      again = last && p === last ? again + 1 : 0;
      last = p;
      stake = stakeOf(p);
      rows.push({ kind: "prompt", key: l.id, text: l.text, again });
      return;
    }
    const live = busy && i === lines.length - 1;
    const r = splitReply(l.text, live);
    if (r.pending || (live && !r.body.trim())) return;
    const sym = r.kind ?? inferKind(r.body);
    rows.push({
      kind: "pay",
      key: l.id,
      body: r.body,
      sym,
      tagged: !!r.kind,
      outcome: outcome(l.id, sym, stake),
      live,
      stake,
      out: toks(r.body),
    });
  });
  return rows;
}

type Landed = { key: string; o: Outcome; fresh: boolean };

/* ───────── The machine ───────── */

/**
 * High Limit: Lucky's machine, moved off the 3 a.m. floor into the quiet room
 * at the back. One cabinet, one reel line, one number to watch. Your prompt
 * is the spin: the reels turn while Lucky thinks and stop on what he paid out,
 * with the same odds as ever (near misses, wins that pay back less than you
 * put in, the odd hallucination, an AGI that never lines up three times).
 * Everything else from the floor (bets, meters, paytable, lever, lights) has
 * been left outside the velvet rope.
 */
export function HighLimitLayout({ costume, lines, busy, waiting, error, onSend, onStop }: LayoutProps) {
  const { ref: win, handle } = useDesktopDrag<HTMLDivElement>();
  const input = useRef<HTMLTextAreaElement>(null);

  /* ── Tokens and sound, kept across visits ── */
  const [bank, setBankState] = useState(readBank);
  /** Changes apply to what's saved, so a second tab can't put spent tokens back. */
  const changeBank = useCallback((by: number) => {
    const next = readBank() + by;
    saveBank(next);
    setBankState(next);
  }, []);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === BANK_KEY) setBankState(readBank());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const [sound, setSound] = useState(readSound);
  const soundOn = useRef(sound);
  useEffect(() => {
    soundOn.current = sound;
  }, [sound]);
  const play = useCallback((k: keyof typeof sfx) => {
    if (soundOn.current) sfx[k]();
  }, []);

  const [value, setValue] = useState("");
  const [away, setAway] = useState(false);

  const rows = useMemo(() => toRows(lines, busy), [lines, busy]);
  const empty = rows.length === 0 && !waiting && !error;
  const lastPay = rows.findLast((r): r is PayRow => r.kind === "pay");
  const lastPrompt = rows.findLast((r): r is PromptRow => r.kind === "prompt");

  /** Payouts already here when the machine was opened: no spin, no charge, no payout. */
  const [old] = useState(() => new Set(lines.filter((l) => l.role === "assistant").map((l) => l.id)));
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [landed, setLanded] = useState<Landed | null>(() => {
    const p = toRows(lines, false).findLast((r): r is PayRow => r.kind === "pay");
    return p ? { key: p.key, o: p.outcome, fresh: false } : null;
  });
  const [spinning, setSpinning] = useState(false);
  /** What the status line says the reels came to; null while they're turning. */
  const [shown, setShown] = useState<Outcome | null>(() => landed?.o ?? null);
  const [pulled, setPulled] = useState(false);
  const spinT0 = useRef(0);
  const sawBusy = useRef(false);

  const scroller = useStickyScroll<HTMLDivElement>(
    // `busy` too: the payout's footer appears when the answer finishes.
    `${rows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}:${busy}:${error}:${revealed.size}`,
  );
  useEffect(() => {
    if (empty) scroller.current?.scrollTo({ top: 0 });
  }, [empty, scroller]);

  const working = busy || spinning;
  const need = stakeOf(value.trim());
  const broke = bank < need;

  /* ── Spinning ── */
  const pull = (prompt: string) => {
    const p = prompt.trim();
    if (!p || working) return false;
    const stake = stakeOf(p);
    if (readBank() < stake) {
      play("buzz");
      return false;
    }
    changeBank(-stake);
    sawBusy.current = false;
    setShown(null);
    setPulled(true);
    setSpinning(true);
    onSend(p);
    return true;
  };
  const submit = () => {
    if (pull(value)) setValue("");
  };
  const again = () => {
    if (lastPrompt) pull(lastPrompt.text);
  };
  const refill = () => {
    changeBank(REFILL);
    play("coin");
    input.current?.focus();
  };

  useEffect(() => {
    if (busy) sawBusy.current = true;
  }, [busy]);
  useEffect(() => {
    if (spinning) spinT0.current = Date.now();
  }, [spinning]);

  /* ── Landing: once the payout says what it is, and the reels have turned long enough ── */
  const fresh = lastPay && !old.has(lastPay.key) && !revealed.has(lastPay.key) ? lastPay : undefined;
  const latestFresh = useRef(fresh);
  useEffect(() => {
    latestFresh.current = fresh;
  });
  const landKey = spinning && fresh && (fresh.tagged || !fresh.live || fresh.body.length > 160) ? fresh.key : null;
  useEffect(() => {
    if (!landKey) return;
    const t = setTimeout(
      () => {
        const f = latestFresh.current;
        setLanded({ key: landKey, o: f?.key === landKey ? f.outcome : TILT, fresh: true });
        setSpinning(false);
      },
      Math.max(0, MIN_SPIN - (Date.now() - spinT0.current)),
    );
    return () => clearTimeout(t);
  }, [landKey]);

  // A spin that ended with nothing to pay out (an error, or stopped before a word): jammed.
  useEffect(() => {
    if (!spinning || busy || !sawBusy.current || latestFresh.current) return;
    const t = setTimeout(() => {
      setLanded({ key: `tilt:${spinT0.current}`, o: TILT, fresh: true });
      setSpinning(false);
    }, 250);
    return () => clearTimeout(t);
  }, [spinning, busy]);

  /** The last reel has stopped: show the payout, pay what it pays. */
  const landedRef = useRef(landed);
  useEffect(() => {
    landedRef.current = landed;
  });
  const paid = useRef(new Set<string>());
  const onLanded = useCallback(() => {
    const l = landedRef.current;
    if (!l?.fresh || paid.current.has(l.key)) return;
    paid.current.add(l.key);
    setRevealed((s) => new Set(s).add(l.key));
    setShown(l.o);
    if (l.o.payout > 0) changeBank(l.o.payout);
    const r = l.o.result;
    play(r === "win" ? "win" : r === "big" ? "big" : r === "near" ? "near" : r === "agi" ? "agi" : "buzz");
  }, [play, changeBank]);

  /* ── The answer's own tokens come off once it's finished ── */
  const settleKey = lastPay && !lastPay.live && !old.has(lastPay.key) ? lastPay.key : null;
  const settleOut = lastPay?.out ?? 0;
  const charged = useRef(new Set<string>());
  useEffect(() => {
    if (!settleKey || charged.current.has(settleKey)) return;
    charged.current.add(settleKey);
    changeBank(-settleOut);
  }, [settleKey, settleOut, changeBank]);

  /* ── The input grows with what you write, up to a point ── */
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
    el.style.overflowY = el.scrollHeight > 132 ? "auto" : "hidden";
  }, [value]);

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus({ preventScroll: true });
  }, []);

  const toggleSound = () => {
    const on = !sound;
    setSound(on);
    saveSound(on);
    soundOn.current = on;
    if (on) sfx.coin();
  };

  const v = shown ? verdict(shown) : null;
  const status = v ? (
    <>
      <b>{v.label}</b>
      <span>{v.note}</span>
    </>
  ) : pulled ? (
    <span>
      Spinning
      <Dots />
    </span>
  ) : (
    <span>Three of a kind pays. Two of a kind is so close.</span>
  );

  return (
    <div className={`highlimit ${hlFonts} flex h-full items-center justify-center`}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        {/* Motion blur that only smears up and down, like a real reel. */}
        <filter id="hl-vblur">
          <feGaussianBlur stdDeviation="0 2.4" />
        </filter>
      </svg>
      <div
        ref={win}
        className="hl-cab"
        data-busy={working || undefined}
        style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}
      >
        {/* ───── The top of the cabinet: drag the machine by it ───── */}
        <header className="hl-top" {...handle}>
          <button
            type="button"
            className="hl-snd"
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? "Sound on" : "Sound off"}
            title={sound ? "Sound: on" : "Sound: off"}
          >
            {sound ? <Volume2 /> : <VolumeX />}
          </button>
          <div className="hl-mark">
            <b>Lucky</b>
            <span>{costume.name}</span>
          </div>
          <div className="hl-bank" data-low={bank < PULL_FEE || undefined} title="Your tokens">
            <b>
              <Count value={bank} />
            </b>
            <span>tokens</span>
          </div>
        </header>

        {/* ───── The reels ───── */}
        <section className="hl-machine" aria-label="Reels">
          <Reels spinning={spinning} landed={landed} onLanded={onLanded} play={play} />
          <p className="hl-status" data-r={shown?.result} role="status">
            {status}
          </p>
        </section>

        {/* ───── Prompts and payouts ───── */}
        <div className="hl-screen">
          <div
            ref={scroller}
            className="hl-scroll"
            onScroll={(e) => {
              const el = e.currentTarget;
              setAway(el.scrollHeight - el.scrollTop - el.clientHeight > 180);
            }}
          >
            {empty ? (
              <Hero greeting={costume.greeting} disabled={working} onPick={(ask) => pull(ask)} />
            ) : (
              <div className="hl-col">
                {rows.map((r) =>
                  r.kind === "prompt" ? (
                    <Ask key={r.key} r={r} />
                  ) : (
                    <Payout
                      key={r.key}
                      r={r}
                      o={r.key === landed?.key ? landed.o : r.outcome}
                      revealed={old.has(r.key) || revealed.has(r.key) || (!spinning && r.key !== fresh?.key)}
                      fresh={!old.has(r.key)}
                      canAgain={r === lastPay && !working && !!lastPrompt}
                      onAgain={again}
                    />
                  ),
                )}
                {busy && (lines.at(-1)?.role !== "assistant" || lastPay?.key !== lines.at(-1)?.id) && <Waiting />}
                {error && (
                  <p className="hl-jam" role="alert">
                    {costume.error}
                  </p>
                )}
              </div>
            )}
          </div>
          {away && !empty && (
            <button
              type="button"
              className="hl-down"
              aria-label="Go to newest"
              onClick={() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" })}
            >
              <ArrowDown />
            </button>
          )}
        </div>

        {/* ───── The prompt and the one button ───── */}
        <form
          className="hl-composer"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className="hl-field">
            <textarea
              ref={input}
              rows={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={costume.placeholder}
              aria-label="Your prompt"
              className="hl-input"
            />
            <span className="hl-cost" data-low={broke || undefined} aria-live="polite">
              {broke
                ? `Out of tokens. A spin costs ${need.toLocaleString()}; refills are free.`
                : value.trim()
                  ? `This spin costs ${need.toLocaleString()} tokens`
                  : `A spin costs ${PULL_FEE} tokens, plus your words`}
            </span>
          </label>
          {busy ? (
            <button type="button" className="hl-spin" data-stop onClick={onStop} title="Stop">
              Stop
            </button>
          ) : broke ? (
            <button type="button" className="hl-spin" data-refill onClick={refill} title={`Add ${REFILL.toLocaleString()} free tokens`}>
              Refill
            </button>
          ) : (
            <button type="submit" className="hl-spin" disabled={!value.trim() || spinning} title="Spin (Enter)">
              Spin
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

/* ───────── The reels ───────── */

const currentY = (el: HTMLElement) => {
  const t = getComputedStyle(el).transform;
  return !t || t === "none" ? 0 : new DOMMatrixReadOnly(t).m42;
};

/**
 * Three reels behind glass, each a strip of the same nine symbols five copies
 * tall, moved with the Web Animations API: a small wind-up, a blur, then each
 * one runs down onto its symbol, left to right. On a near miss the third reel
 * slows before it stops, one past the line.
 */
function Reels({
  spinning,
  landed,
  onLanded,
  play,
}: {
  spinning: boolean;
  landed: Landed | null;
  onLanded: () => void;
  play: (k: keyof typeof sfx) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const strips = useRef<(HTMLDivElement | null)[]>([]);
  const anims = useRef<(Animation | null)[]>([null, null, null]);
  const ticker = useRef(0);
  const [stopped, setStopped] = useState(3);
  const [tease, setTease] = useState(false);
  const target = landed?.o.reels ?? IDLE;
  const targetRef = useRef(target);
  const teaseRef = useRef(false);
  useEffect(() => {
    targetRef.current = target;
    teaseRef.current = !!landed?.o.tease;
  });

  const cellOf = (el: HTMLElement) => (el.firstElementChild as HTMLElement | null)?.offsetHeight || 60;
  /** The strip's offset that puts `sym` (in its second copy) in the middle of the window. */
  const yOf = useCallback((el: HTMLElement, i: number, sym: Sym) => {
    const cell = cellOf(el);
    const view = el.parentElement?.clientHeight ?? cell;
    return (view - cell) / 2 - (STRIPS[i].length + STRIPS[i].indexOf(sym)) * cell;
  }, []);

  /** Puts a reel straight onto its symbol, no animation. */
  const rest = useCallback(
    (i: number, sym: Sym) => {
      const el = strips.current[i];
      if (el) el.style.transform = `translateY(${yOf(el, i, sym)}px)`;
    },
    [yOf],
  );

  // Rest where they landed, and stay put through resizes.
  const spinningRef = useRef(spinning);
  useEffect(() => {
    spinningRef.current = spinning;
  });
  useLayoutEffect(() => {
    const restAll = () => {
      if (spinningRef.current || anims.current.some((a) => a && a.playState === "running")) return;
      targetRef.current.forEach((s, i) => rest(i, s));
    };
    restAll();
    const ro = new ResizeObserver(restAll);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [rest]);

  // Spin.
  useEffect(() => {
    if (!spinning || reduced()) return;
    clearInterval(ticker.current);
    ticker.current = window.setInterval(() => play("tick"), 90);
    STRIPS.forEach((strip, i) => {
      const el = strips.current[i];
      if (!el) return;
      const n = strip.length;
      const cell = cellOf(el);
      const loop = n * cell;
      anims.current[i]?.cancel();
      // The same picture, a couple of turns up the strip, so there's room to run down.
      let y = currentY(el);
      while (y > -(3 * n - 2) * cell) y -= loop;
      while (y < -(4 * n - 2) * cell) y += loop;
      el.dataset.spin = "";
      const a = el.animate(
        [
          { transform: `translateY(${y}px)` },
          { transform: `translateY(${y - cell * 0.22}px)`, offset: 0.16, easing: "cubic-bezier(.6,0,.9,.6)" },
          { transform: `translateY(${y + loop}px)` },
        ],
        { duration: 760, delay: i * 90, easing: "ease-out" },
      );
      anims.current[i] = a;
      a.onfinish = () => {
        if (anims.current[i] !== a) return;
        anims.current[i] = el.animate([{ transform: `translateY(${y}px)` }, { transform: `translateY(${y + loop}px)` }], {
          duration: TURN_MS,
          iterations: Infinity,
        });
      };
    });
  }, [spinning, play]);

  // Stop, one reel at a time.
  const landedKey = landed?.key;
  const landedFresh = landed?.fresh;
  useEffect(() => {
    if (spinning || !landedKey) return;
    const reels = targetRef.current;
    if (!landedFresh || reduced()) {
      clearInterval(ticker.current);
      anims.current.forEach((a) => a?.cancel());
      reels.forEach((s, i) => {
        rest(i, s);
        delete strips.current[i]?.dataset.spin;
      });
      const t = window.setTimeout(() => {
        setStopped(3);
        setTease(false);
        if (landedFresh) onLanded();
      }, 0);
      return () => clearTimeout(t);
    }
    const timers: number[] = [];
    const stopReel = (i: number, slow: boolean) => {
      const el = strips.current[i];
      if (!el) return;
      const n = STRIPS[i].length;
      const cell = cellOf(el);
      const loop = n * cell;
      const yEnd = yOf(el, i, reels[i]);
      const yNow = currentY(el);
      const L = ((((yEnd - yNow) % loop) + loop) % loop) + loop;
      const speed = (loop / TURN_MS) * (slow ? 0.35 : 1);
      const dur = Math.min(slow ? 1900 : 1200, Math.max(520, (2.8 * L) / speed));
      anims.current[i]?.cancel();
      el.style.transform = `translateY(${yEnd}px)`;
      const a = el.animate([{ transform: `translateY(${yEnd - L}px)` }, { transform: `translateY(${yEnd}px)` }], {
        duration: dur,
        easing: STOP_EASE,
      });
      anims.current[i] = a;
      timers.push(
        window.setTimeout(() => {
          delete el.dataset.spin;
          play("stop");
        }, dur * 0.62),
      );
      a.onfinish = () => {
        anims.current[i] = null;
        setStopped(i + 1);
        if (i === 2) {
          clearInterval(ticker.current);
          setTease(false);
          onLanded();
        }
      };
    };
    const teasing = teaseRef.current;
    timers.push(
      window.setTimeout(() => {
        setStopped(0);
        stopReel(0, false);
      }, 0),
    );
    timers.push(window.setTimeout(() => stopReel(1, false), 360));
    if (teasing) {
      timers.push(
        window.setTimeout(() => {
          setTease(true);
          const a = anims.current[2];
          if (a?.updatePlaybackRate) a.updatePlaybackRate(0.4);
          else if (a) a.playbackRate = 0.4;
        }, 720),
      );
      timers.push(window.setTimeout(() => stopReel(2, true), 1800));
    } else {
      timers.push(window.setTimeout(() => stopReel(2, false), 720));
    }
    return () => timers.forEach(clearTimeout);
    // Runs once per landing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, landedKey]);

  useEffect(() => () => clearInterval(ticker.current), []);

  const o = landed?.o;
  const hit = (i: number) => !!o && !spinning && stopped === 3 && matches(o, i);

  return (
    <div ref={box} className="hl-reels" aria-hidden>
      {STRIPS.map((strip, i) => (
        <div key={i} className="hl-reel" data-tease={(i === 2 && tease) || undefined} data-hit={hit(i) || undefined}>
          <div
            ref={(el) => {
              strips.current[i] = el;
            }}
            className="hl-strip"
          >
            {Array.from({ length: strip.length * 5 }, (_, j) => (
              <div key={j} className="hl-cell">
                <HlSymbol sym={strip[j % strip.length]} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Which reels count: all three on a win, the first two on a near miss. */
function matches(o: Outcome, i: number) {
  if (o.result === "win" || o.result === "big") return true;
  if (o.result === "near" || o.result === "agi") return i < 2;
  return false;
}

/* ───────── Small parts ───────── */

function Dots() {
  return (
    <span className="hl-dots" aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

/** A number that rolls to its new value. */
function Count({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    const dur = reduced() ? 1 : Math.min(700, 160 + Math.abs(value - start) * 1.2);
    const t0 = performance.now();
    let f = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      const v = Math.round(start + (value - start) * (1 - (1 - p) ** 3));
      from.current = v;
      setShown(v);
      if (p < 1) f = requestAnimationFrame(tick);
    };
    f = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(f);
  }, [value]);
  return <>{shown.toLocaleString()}</>;
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1400);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      className="hl-act"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => setDone(true), () => {});
      }}
    >
      {done ? <Check /> : <Copy />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

/* ───────── The screen ───────── */

function Hero({ greeting, disabled, onPick }: { greeting: string; disabled: boolean; onPick: (ask: string) => void }) {
  return (
    <div className="hl-hero">
      <h1>
        Pull to <em>prompt.</em>
      </h1>
      <p>
        {greeting.split("\n").map((l, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {l}
          </Fragment>
        ))}
      </p>
      <div className="hl-sugs">
        {SUGGESTIONS.map((s) => (
          <button key={s.ask} type="button" onClick={() => onPick(s.ask)} disabled={disabled}>
            <span className="hl-tile">
              <HlSymbol sym={s.sym} />
            </span>
            <span>{s.ask}</span>
          </button>
        ))}
      </div>
      <p className="hl-fine">Tokens have no cash value. Neither does the jackpot.</p>
    </div>
  );
}

const Ask = memo(function Ask({ r }: { r: PromptRow }) {
  if (r.again > 0) {
    return (
      <div className="hl-again-row">
        <RotateCw />
        Spun again, same prompt · try {r.again + 1}
      </div>
    );
  }
  return <div className="hl-ask">{r.text}</div>;
});

function Waiting() {
  return (
    <div className="hl-pay" role="status">
      <header className="hl-pay-head">
        <span className="hl-who">Lucky</span>
        <span className="hl-wait">
          Spinning
          <Dots />
        </span>
      </header>
    </div>
  );
}

/** Longer than this, a line in a poem payout is Lucky talking, not verse. */
const VERSE_MAX = 72;

const Payout = memo(function Payout({
  r,
  o,
  revealed,
  fresh,
  canAgain,
  onAgain,
}: {
  r: PayRow;
  o: Outcome;
  revealed: boolean;
  fresh: boolean;
  canAgain: boolean;
  onAgain: () => void;
}) {
  if (!revealed) return <Waiting />;
  const v = verdict(o);
  const net = o.payout - r.stake - r.out;
  return (
    <article className="hl-pay" data-r={o.result}>
      <header className="hl-pay-head">
        <span className="hl-who">Lucky</span>
        <span className="hl-mini" aria-hidden>
          {o.reels.map((s, i) => (
            <i key={i} data-hit={matches(o, i) || undefined}>
              <HlSymbol sym={s} />
            </i>
          ))}
        </span>
        <span className="hl-verdict">{v.label}</span>
        <span className="hl-kind">{KIND_NAME[r.sym]}</span>
      </header>
      <div className="hl-pay-body">
        <Body body={r.body} kind={r.sym} seed={r.key} fresh={fresh} />
      </div>
      {!r.live && (
        <footer className="hl-pay-foot">
          <span
            className="hl-net"
            data-up={net >= 0 || undefined}
            title={`Spin ${r.stake.toLocaleString()} + answer ${r.out.toLocaleString()} − paid back ${o.payout.toLocaleString()}`}
          >
            {net >= 0 ? "+" : "−"}
            {Math.abs(net).toLocaleString()} tokens
          </span>
          <CopyButton text={r.body} />
          {canAgain && (
            <button type="button" className="hl-act" data-main onClick={onAgain}>
              <RotateCw />
              Spin again
            </button>
          )}
        </footer>
      )}
    </article>
  );
});

/** A payout, printed as what it is: an email, code, slides, a table, a picture or plain words. */
function Body({ body, kind, seed, fresh }: { body: string; kind: Kind; seed: string; fresh: boolean }) {
  const bs = useMemo(() => blocks(body), [body]);
  const mailAt = bs.findIndex((b) => b.t === "mail");
  const one = (b: Block, i: number) => <BlockView key={i} b={b} kind={kind} seed={`${seed}:${i}`} fresh={fresh} />;
  if (mailAt < 0) return <>{bs.map(one)}</>;
  const head = bs[mailAt] as Extract<Block, { t: "mail" }>;
  let inside = bs.slice(mailAt + 1);
  let after: Block[] = [];
  const tail = inside.at(-1);
  // A one-liner after the email is Lucky talking, not the email.
  if (inside.length >= 2 && tail?.t === "p" && tail.lines.length === 1 && tail.lines[0].length <= 140) {
    after = [tail];
    inside = inside.slice(0, -1);
  }
  const mailText = [
    ...head.head.map(([k, v]) => `${k}: ${v}`),
    "",
    ...inside.map((b) => (b.t === "p" ? b.lines.join("\n") : b.t === "code" ? b.text : "")),
  ].join("\n");
  return (
    <>
      {bs.slice(0, mailAt).map(one)}
      <div className="hl-mail">
        <div className="hl-mail-head">
          {head.head.map(([k, v], i) => (
            <div key={i} className="hl-mail-row" data-k={k.toLowerCase()}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
          <CopyButton text={mailText} />
        </div>
        <div className="hl-mail-body">{inside.map((b, i) => one(b, mailAt + 1 + i))}</div>
      </div>
      {after.map((b, i) => one(b, bs.length + i))}
    </>
  );
}

function BlockView({ b, kind, seed, fresh }: { b: Block; kind: Kind; seed: string; fresh: boolean }) {
  switch (b.t) {
    case "p": {
      // In a poem, a long line is Lucky talking, not verse: it prints as plain text.
      const runs: { verse: boolean; lines: string[] }[] = [];
      for (const l of b.lines) {
        const verse = kind === "poem" && l.length <= VERSE_MAX;
        if (runs.at(-1)?.verse === verse) runs.at(-1)!.lines.push(l);
        else runs.push({ verse, lines: [l] });
      }
      return (
        <>
          {runs.map((r, j) => (
            <p key={j} className={r.verse ? "hl-poem" : "hl-p"}>
              {r.lines.map((l, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {l}
                </Fragment>
              ))}
            </p>
          ))}
        </>
      );
    }
    case "code":
      return (
        <div className="hl-code">
          <div className="hl-code-bar">
            <span>Code</span>
            <CopyButton text={b.text} />
          </div>
          <pre>
            <code>{b.text}</code>
          </pre>
        </div>
      );
    case "image":
      return <Picture prompt={b.prompt} seed={seed} fresh={fresh} />;
    case "mail":
      return null;
    case "deck":
      return (
        <div className="hl-slides">
          {b.slides.map((s, i) => (
            <div key={i} className="hl-slide">
              <b>{s.title}</b>
              {s.bullets.length > 0 && (
                <ul>
                  {s.bullets.slice(0, 4).map((x, j) => (
                    <li key={j}>{x}</li>
                  ))}
                </ul>
              )}
              <span className="hl-slide-n">{s.n}</span>
            </div>
          ))}
        </div>
      );
    case "table": {
      const [headRow, ...rows] = b.rows;
      return (
        <div className="hl-table-wrap">
          <table className="hl-table">
            {headRow && (
              <thead>
                <tr>
                  {headRow.map((c, i) => (
                    <th key={i}>{c}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {row.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}

/* ───────── "Your image" ───────── */

/** Dusk, night, rose, sea: sky top, sky bottom, sun, far hills, near hills. */
const PALETTES = [
  ["#1d3b5c", "#e9a46a", "#fff2cf", "#2f5d4e", "#173a2c"],
  ["#1b2550", "#8fa6d8", "#f4f1e6", "#3b5a7a", "#1c2f45"],
  ["#3a1f3d", "#e07a6a", "#ffe3b3", "#6b3a4f", "#2b1626"],
  ["#123c36", "#7cc6a4", "#f6f0c4", "#2e6b54", "#163f31"],
];

/** What always goes a little wrong in Lucky's pictures. */
const FLAWS = [
  "six fingers on one hand",
  "the sign says “OPNE”",
  "one moon too many",
  "the cat has five legs",
  "a clock melted (unrequested)",
  "two left feet",
];

/**
 * A quiet landscape painted from the prompt's seed, which develops in the
 * first time it prints. Never quite what you asked for; the caption admits it.
 */
function Picture({ prompt, seed, fresh }: { prompt: string; seed: string; fresh: boolean }) {
  const s = useMemo(() => {
    const r = rng(hash(`${seed}:${prompt}`));
    const pal = PALETTES[Math.floor(r() * PALETTES.length)];
    const hill = (base: number, amp: number) => {
      let d = `M0 ${base}`;
      for (let x = 0; x < 400; x += 80) {
        d += ` Q${x + 40} ${(base - amp + r() * amp * 2).toFixed(1)} ${x + 80} ${(base + (r() - 0.5) * amp).toFixed(1)}`;
      }
      return `${d} V260 H0Z`;
    };
    return {
      pal,
      sun: { x: 70 + r() * 260, y: 62 + r() * 40, r: 20 + r() * 16 },
      far: hill(168, 22),
      near: hill(206, 16),
      flaw: FLAWS[Math.floor(r() * FLAWS.length)],
    };
  }, [prompt, seed]);
  const u = `hl${hash(seed + prompt).toString(36)}`;
  return (
    <figure className="hl-img" data-fresh={fresh || undefined}>
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id={`${u}s`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={s.pal[0]} />
            <stop offset="1" stopColor={s.pal[1]} />
          </linearGradient>
        </defs>
        <rect width="400" height="260" fill={`url(#${u}s)`} />
        <circle cx={s.sun.x} cy={s.sun.y} r={s.sun.r} fill={s.pal[2]} />
        <path d={s.far} fill={s.pal[3]} />
        <path d={s.near} fill={s.pal[4]} />
      </svg>
      <figcaption>
        <span>“{prompt}”</span>
        <small>1024 × 1024 · Note: {s.flaw}</small>
      </figcaption>
    </figure>
  );
}

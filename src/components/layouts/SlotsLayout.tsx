"use client";

import { ArrowDown, Check, Copy, RotateCw } from "lucide-react";
import { Fragment, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { art, GenImage, Token } from "@/components/slots/art";
import {
  BETS,
  type BetId,
  betOf,
  type Block,
  blocks,
  hash,
  headline,
  inferKind,
  type Kind,
  type Outcome,
  outcome,
  readWallet,
  type Result,
  rng,
  rtp,
  saveWallet,
  splitPrompt,
  splitReply,
  stakeOf,
  STRIPS,
  type Sym,
  SYMBOLS,
  TIERS,
  TILT,
  toks,
  type Wallet,
  WALLET_KEY,
  withBet,
} from "@/components/slots/engine";
import { slFonts } from "@/components/slots/font";
import { sfx, warmSounds } from "@/components/slots/sound";
import { SymbolArt } from "@/components/slots/symbols";
import "@/components/slots/slots.css";
import { SAMPLE_QUESTION } from "@/lib/costumes";
import { useStickyScroll } from "./hooks";
import type { ChatLine, LayoutProps, ThreadItem } from "./types";

/* ───────── The Token Palace, row G, machine #7 ───────── */

/** Casino sounds, kept subtle (see slots/sound.ts). Set to false to silence the machine. */
const SOUND = true;

const SUGGESTIONS: { sym: Kind; ask: string }[] = [
  { sym: "email", ask: "Write an email asking my boss for a raise" },
  { sym: "image", ask: "Draw me a cat in a tiny astronaut suit" },
  { sym: "code", ask: "Code a button that runs away from the mouse" },
  { sym: "deck", ask: "Make a 3-slide deck about synergy" },
  { sym: "poem", ask: "A haiku about my inbox" },
  { sym: "text", ask: SAMPLE_QUESTION },
];

/** One of the house prompts, at random: what SPIN pulls when nothing's been typed. */
const housePrompt = () => SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)].ask;

/** What the glass on the front of the machine promises. */
const PAYTABLE: { syms: Sym[]; what: string; pays: string }[] = [
  { syms: ["agi", "agi", "agi"], what: "Artificial general intelligence", pays: "JACKPOT" },
  { syms: ["image", "image", "image"], what: "Right number of fingers", pays: "500" },
  { syms: ["code", "code", "code"], what: "Compiles on the first try", pays: "250" },
  { syms: ["email", "email", "email"], what: "Right tone, right recipient", pays: "100" },
  { syms: ["deck", "deck", "deck"], what: "Somebody reads the slides", pays: "75" },
  { syms: ["chart", "chart", "chart"], what: "The BAR chart says what you hoped", pays: "60" },
  { syms: ["text", "text", "text"], what: "Not one “delve”", pays: "50" },
  { syms: ["bug"], what: "Any bug: a hallucination", pays: "0" },
];

/** Where the reels rest before the first pull: AGI right on the line, teasing. */
const IDLE: [Sym, Sym, Sym] = ["code", "agi", "image"];

/** The reels spin at least this long, however fast the answer comes. */
const MIN_SPIN = 1100;
/** One full turn of a reel at full speed. */
const TURN_MS = 260;
const STOP_EASE = "cubic-bezier(.22,.62,.32,1.12)";

const BET_KEY = "gpty:slots:bet";

function readBet(): BetId {
  try {
    const v = localStorage.getItem(BET_KEY);
    return BETS.some((b) => b.id === v) ? (v as BetId) : "mini";
  } catch {
    return "mini";
  }
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────── Rows ───────── */

type PromptRow = { kind: "prompt"; key: string; text: string; bet: BetId; stake: number; n: number; again: number };
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
 * Pulls and payouts. A prompt sent twice in a row is a re-pull (the
 * regenerate button with a lever on it). Each payout lands by its own id, so
 * history always reads the same.
 */
function toRows(lines: ChatLine[], busy: boolean): Row[] {
  const rows: Row[] = [];
  const results: Result[] = [];
  let last = "";
  let again = 0;
  let n = 0;
  let stake = 0;
  let bet: BetId = "mini";
  lines.forEach((l, i) => {
    if (l.role === "user") {
      const p = splitPrompt(l.text);
      n++;
      again = last && p.prompt.trim() === last ? again + 1 : 0;
      last = p.prompt.trim();
      bet = p.bet;
      stake = stakeOf(p.prompt, p.bet);
      rows.push({ kind: "prompt", key: l.id, text: p.prompt, bet, stake, n, again });
      return;
    }
    const live = busy && i === lines.length - 1;
    const r = splitReply(l.text, live);
    if (r.pending || (live && !r.body.trim())) return;
    const sym = r.kind ?? inferKind(r.body);
    const o = outcome(l.id, sym, stake, results);
    results.push(o.result);
    rows.push({
      kind: "pay",
      key: l.id,
      body: r.body,
      sym,
      tagged: !!r.kind,
      outcome: o,
      live,
      stake,
      out: betOf(bet).x * toks(r.body),
    });
  });
  return rows;
}

type Landed = { key: string; o: Outcome; fresh: boolean };

/* ───────── The machine ───────── */

/**
 * LUCKY PROMPT 777: a slot machine at 3 a.m. on the floor of the Token
 * Palace, wired up as an AI chat. Your prompt is the pull: tokens go in, the
 * reels spin while Lucky thinks and land on what he paid out (text, an email,
 * code, an image, a deck, a BAR chart, a poem), one reel at a time. The odds
 * are a slot machine's: near misses, wins that pay back less than you put in
 * (with the bells anyway), the odd hallucination and an AGI jackpot that never
 * hits. Tokens meter in and out like the real thing; the lever re-pulls the
 * same prompt for another go.
 */
export function SlotsLayout({
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
  const slotBox = useRef<HTMLDivElement>(null);

  /* ── Wallet and bet, kept across visits ── */
  const [wallet, setWalletState] = useState<Wallet>(readWallet);
  /**
   * Every change is applied to what's saved, not to this window's copy, so a
   * second tab (or a stale window) can't put spent tokens back. Other tabs
   * hear about it through the storage event.
   */
  const setWallet = useCallback((change: (w: Wallet) => Wallet) => {
    const next = change(readWallet());
    saveWallet(next);
    setWalletState(next);
  }, []);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === WALLET_KEY) setWalletState(readWallet());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const [bet, setBetState] = useState<BetId>(readBet);
  const setBet = (b: BetId) => {
    setBetState(b);
    try {
      localStorage.setItem(BET_KEY, b);
    } catch {}
  };
  const play = useCallback((k: keyof typeof sfx, big = false) => {
    if (!SOUND) return;
    if (k === "win") sfx.win(big);
    else sfx[k]();
  }, []);
  useEffect(() => {
    if (SOUND) warmSounds();
  }, []);

  const [value, setValue] = useState("");
  const [pop, setPop] = useState<null | "insert" | "broke">(null);
  const [away, setAway] = useState(false);

  const rows = useMemo(() => toRows(lines, busy), [lines, busy]);
  const empty = rows.length === 0 && !waiting && !error;
  const pays = rows.filter((r): r is PayRow => r.kind === "pay");
  const lastPay = pays.at(-1);
  const lastPrompt = rows.findLast((r): r is PromptRow => r.kind === "prompt");

  /** Payouts that were already here when the machine was opened: no spin, no charge, no payout. */
  const [old] = useState(() => new Set(lines.filter((l) => l.role === "assistant").map((l) => l.id)));
  const [settled, setSettled] = useState<Set<string>>(() => new Set());
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [landed, setLanded] = useState<Landed | null>(() => {
    const p = toRows(lines, false).findLast((r): r is PayRow => r.kind === "pay");
    return p ? { key: p.key, o: p.outcome, fresh: false } : null;
  });
  const [spinning, setSpinning] = useState(false);
  const [banner, setBanner] = useState<{ k: number; o: Outcome } | null>(null);
  const [shower, setShower] = useState<{ k: number; big: boolean } | null>(null);
  const spinT0 = useRef(0);
  const sawBusy = useRef(false);

  const scroller = useStickyScroll<HTMLDivElement>(
    `${rows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}:${error}:${revealed.size}`,
  );
  useEffect(() => {
    if (empty) scroller.current?.scrollTo({ top: 0 });
  }, [empty, scroller]);

  /* ── Tokens on the meter: what's in the bank, less what the answer streaming out has used ── */
  const unsettled = lastPay && !old.has(lastPay.key) && !settled.has(lastPay.key) ? lastPay.out : 0;
  const shownBank = wallet.bank - unsettled;
  const nextStake = stakeOf(value.trim() || lastPrompt?.text || "", bet);
  const broke = shownBank < nextStake;

  /* ── Pulling ── */
  const pull = (prompt: string) => {
    const p = prompt.trim();
    if (!p || busy || spinning) return false;
    const stake = stakeOf(p, bet);
    if (shownBank < stake) {
      setPop("broke");
      play("buzz");
      return false;
    }
    setWallet((w) => ({ ...w, bank: w.bank - stake, spent: w.spent + stake, pulls: w.pulls + 1 }));
    sawBusy.current = false;
    setBanner(null);
    setSpinning(true);
    onSend(withBet(p, bet));
    return true;
  };
  const submit = () => {
    if (pull(value)) setValue("");
  };
  const again = () => {
    if (lastPrompt) pull(lastPrompt.text);
  };
  /** The lever pulls whatever's typed, the last prompt again, or, on a fresh machine, one of the house prompts at random. */
  const lever = () => {
    play("lever");
    if (value.trim()) submit();
    else if (lastPrompt) again();
    else pull(housePrompt());
  };

  useEffect(() => {
    if (busy) sawBusy.current = true;
  }, [busy]);
  useEffect(() => {
    if (spinning) spinT0.current = Date.now();
  }, [spinning]);

  /* ── Landing: once the payout says what it is, and the reels have spun long enough ── */
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

  // A pull that ended with nothing to pay out (an error, or stopped before a word): TILT.
  useEffect(() => {
    if (!spinning || busy || !sawBusy.current || latestFresh.current) return;
    const t = setTimeout(() => {
      setLanded({ key: `tilt:${spinT0.current}`, o: TILT, fresh: true });
      setSpinning(false);
    }, 250);
    return () => clearTimeout(t);
  }, [spinning, busy]);

  /** The reels have stopped: lights, bells, and the payout (if any). */
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
    setBanner({ k: Date.now(), o: l.o });
    const { result, payout } = l.o;
    if (payout > 0) setWallet((w) => ({ ...w, bank: w.bank + payout, won: w.won + payout }));
    if (result === "win" || result === "big") {
      setShower({ k: Date.now(), big: result === "big" });
      play("win", result === "big");
    } else if (result === "near") play("near");
    else if (result === "agi") play("agi");
    else play("buzz");
  }, [play, setWallet]);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 3400);
    return () => clearTimeout(t);
  }, [banner]);
  useEffect(() => {
    if (!shower) return;
    const t = setTimeout(() => setShower(null), shower.big ? 3600 : 2600);
    return () => clearTimeout(t);
  }, [shower]);

  /* ── The answer's own tokens come off the meter once it's finished ── */
  const settleKey = lastPay && !lastPay.live && !old.has(lastPay.key) ? lastPay.key : null;
  const settleOut = lastPay?.out ?? 0;
  const charged = useRef(new Set<string>());
  useEffect(() => {
    if (!settleKey || charged.current.has(settleKey)) return;
    charged.current.add(settleKey);
    setWallet((w) => ({ ...w, bank: w.bank - settleOut, spent: w.spent + settleOut }));
    setSettled((s) => new Set(s).add(settleKey));
  }, [settleKey, settleOut, setWallet]);

  /* ── Tokens for sale (free) ── */
  const insert = (n: number) => {
    setWallet((w) => ({ ...w, bank: w.bank + n }));
    setPop(null);
    play("coin");
    setTimeout(() => play("coin"), 160);
    setTimeout(() => play("coin"), 320);
  };

  useEffect(() => {
    if (!pop) return;
    const down = (e: PointerEvent) => {
      if (!slotBox.current?.contains(e.target as Node)) setPop(null);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPop(null);
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [pop]);

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

  const b = betOf(bet);
  const lastWon = landed?.o.payout ?? 0;
  const jackpot = 1_048_576 + Math.round(wallet.spent * 0.9);
  const result: Result | undefined = banner?.o.result;
  const working = busy || spinning;
  const games = threads.filter((t) => !t.draft);
  const velvet = art("velvet");

  return (
    <div className={`slots ${slFonts} flex h-full items-center justify-center`}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        {/* Motion blur that only smears up and down, like a real reel. */}
        <filter id="lk-vblur">
          <feGaussianBlur stdDeviation="0 3.2" />
        </filter>
      </svg>
      <div
        className="lk-rig"
        data-busy={working || undefined}
        data-result={result}
        // As wide as the costume says, and as tall as the room: the screen grows to fill it.
        style={{ maxWidth: costume.window.w }}
      >
        <div className="lk-cab">
          <div className="lk-glow" aria-hidden />

          {/* ───── Sessions (the site hides these for now) ───── */}
          <aside data-threads className="lk-threads" aria-label="Sessions">
            <button type="button" onClick={onNewThread}>
              {costume.newThread}
            </button>
            {games.map((t) => (
              <Game key={t.id} t={t} active={t.id === activeId} onSelect={onSelectThread} onDelete={onDeleteThread} />
            ))}
          </aside>

          {/* ───── The marquee ───── */}
          <header className="lk-marquee">
            <MarqueeBulbs />
            <div className="lk-mq-l">
              <span className="lk-mq-tag">ROW G · NO CLOCKS</span>
              <span className="lk-tilt" data-on={error || undefined}>
                TILT
              </span>
            </div>
            <div className="lk-mq-c">
              <div className="lk-title">Lucky Prompt</div>
            </div>
            <div className="lk-mq-r">
              <span className="lk-jack-n">
                <span className="sr-only">Jackpot </span>
                <Jackpot base={jackpot} />
              </span>
            </div>
          </header>

          {/* ───── The reels ───── */}
          <div className="lk-bay">
            <JackpotLadder />
            <Reels spinning={spinning} landed={landed} onLanded={onLanded} play={play} />
            <HotSign />
            {banner && <Banner key={banner.k} o={banner.o} />}
            <div className="sr-only" role="status">
              {banner ? `${headline(banner.o).big} ${headline(banner.o).small}` : spinning ? "Spinning" : ""}
            </div>
          </div>
          <div className="lk-belly" aria-hidden>
            WIN UP TO <b>1,000,000</b> TOKENS* <span>·</span> *TOKENS HAVE NO CASH VALUE <span>·</span> PLEASE PROMPT RESPONSIBLY
          </div>

          {/* ───── The screen: pulls and payouts ───── */}
          <div className="lk-screen">
            {velvet && <div className="lk-velvet" style={{ backgroundImage: `url(${velvet})` }} aria-hidden />}
            <div
              ref={scroller}
              className="lk-scroll"
              onScroll={(e) => {
                const el = e.currentTarget;
                setAway(el.scrollHeight - el.scrollTop - el.clientHeight > 180);
              }}
            >
              {empty ? (
                <Hero greeting={costume.greeting} bet={bet} disabled={working} onPick={(ask) => pull(ask)} />
              ) : (
                <div className="lk-col">
                  {rows.map((r) =>
                    r.kind === "prompt" ? (
                      <Slip key={r.key} r={r} />
                    ) : (
                      <Payout
                        key={r.key}
                        r={r}
                        o={r.key === landed?.key ? landed.o : r.outcome}
                        revealed={old.has(r.key) || revealed.has(r.key) || (!spinning && r.key !== fresh?.key)}
                        fresh={!old.has(r.key)}
                        canAgain={r === lastPay && !working && !!lastPrompt}
                        onAgain={() => {
                          play("lever");
                          again();
                        }}
                      />
                    ),
                  )}
                  {busy && (lines.at(-1)?.role !== "assistant" || lastPay?.key !== lines.at(-1)?.id) && <Waiting label={costume.typing} />}
                  {error && (
                    <div className="lk-tiltmsg" role="alert">
                      <b>TILT</b>
                      <span>{costume.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {away && !empty && (
              <button
                type="button"
                className="lk-down"
                aria-label="Go to newest"
                onClick={() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" })}
              >
                <ArrowDown />
              </button>
            )}
          </div>

          {/* ───── The button deck ───── */}
          <div className="lk-deck">
            <div className="lk-meters">
              <Meter label={shownBank < 0 ? "OVERAGE" : "TOKENS"} warn={broke} live={unsettled > 0}>
                <Count value={shownBank} />
              </Meter>
              <Meter label="BET">
                {b.label}
                <small>×{b.x}</small>
              </Meter>
              <Meter label="WON" flash={result === "win" || result === "big"}>
                <Count value={lastWon} />
              </Meter>
              <Meter label="RTP" className="lk-m-rtp">
                {rtp(wallet).toFixed(1)}
                <small>%</small>
              </Meter>
            </div>

            <form
              className="lk-composer"
              onSubmit={(e) => {
                e.preventDefault();
                // SPIN with nothing typed pulls a house prompt instead of sitting there.
                if (value.trim()) submit();
                else lever();
              }}
            >
              <div className="lk-bets">
                <button
                  type="button"
                  className="lk-btn lk-btn-bet"
                  onClick={() => setBet(BETS[(BETS.findIndex((x) => x.id === bet) + 1) % BETS.length].id)}
                  title="Raise the bet (changes nothing about the answer)"
                >
                  BET ONE
                  <span className="lk-pips" aria-hidden>
                    {BETS.map((x, i) => (
                      <i key={x.id} data-on={i <= BETS.findIndex((y) => y.id === bet) || undefined} />
                    ))}
                  </span>
                </button>
                <button
                  type="button"
                  className="lk-btn lk-btn-max"
                  data-on={bet === "ultra" || undefined}
                  onClick={() => setBet(bet === "ultra" ? "mini" : "ultra")}
                  title="Max bet (also changes nothing)"
                >
                  MAX BET
                </button>
              </div>
              <label className="lk-field">
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
                  className="lk-input"
                />
              </label>
              <div className="lk-spin-wrap" ref={slotBox}>
                {busy ? (
                  <button type="button" className="lk-spin" data-stop onClick={onStop} aria-label="Stop" title="Stop">
                    STOP
                  </button>
                ) : broke ? (
                  <button type="button" className="lk-spin" data-broke onClick={() => setPop("broke")} title="Out of tokens">
                    <small>INSERT</small>TOKENS
                  </button>
                ) : value.trim() || !lastPrompt ? (
                  <button type="submit" className="lk-spin" disabled={spinning} title="Spin (Enter)">
                    SPIN
                  </button>
                ) : (
                  <button type="button" className="lk-spin" data-again onClick={lever} disabled={spinning} title="Pull the same prompt again">
                    <small>SPIN</small>AGAIN
                  </button>
                )}
                {pop && <InsertPop broke={pop === "broke"} onInsert={insert} />}
              </div>
            </form>
          </div>

          {shower && <Shower key={shower.k} big={shower.big} seed={shower.k} />}

        </div>

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
 * Three reels behind glass, one symbol showing in each. Each is a strip of the same nine symbols, five
 * copies tall, moved with the Web Animations API: a little wind-up, then a
 * blur, then each one runs down onto its symbol with a clunk, left to right.
 * On a near miss the third reel slows and teases first.
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
  const [stopped, setStopped] = useState(3);
  const [tease, setTease] = useState(false);
  const target = landed?.o.reels ?? IDLE;
  const targetRef = useRef(target);
  const teaseRef = useRef(false);
  useEffect(() => {
    targetRef.current = target;
    teaseRef.current = !!landed?.o.tease;
  });

  const cellOf = (el: HTMLElement) => (el.firstElementChild as HTMLElement | null)?.offsetHeight || 64;
  /** Where a cell's top sits when it's centred in the window, however many rows the window shows. */
  const midOf = (el: HTMLElement, cell: number) => ((el.parentElement?.clientHeight || 3 * cell) - cell) / 2;

  /** Puts a reel straight onto its symbol, no animation. */
  const rest = useCallback((i: number, sym: Sym) => {
    const el = strips.current[i];
    if (!el) return;
    const strip = STRIPS[i];
    const cell = cellOf(el);
    el.style.transform = `translateY(${midOf(el, cell) - (strip.length + strip.indexOf(sym)) * cell}px)`;
  }, []);

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
    const reset = window.setTimeout(() => setStopped(0), 0);
    play("spinStart");
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
          { transform: `translateY(${y - cell * 0.28}px)`, offset: 0.16, easing: "cubic-bezier(.6,0,.9,.6)" },
          { transform: `translateY(${y + loop}px)` },
        ],
        { duration: 720, delay: i * 90, easing: "ease-out" },
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
    return () => clearTimeout(reset);
  }, [spinning, play]);

  // Stop, one reel at a time.
  const landedKey = landed?.key;
  const landedFresh = landed?.fresh;
  useEffect(() => {
    if (spinning || !landedKey) return;
    const reels = targetRef.current;
    if (!landedFresh || reduced()) {
      play("spinStop");
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
      const strip = STRIPS[i];
      const n = strip.length;
      const cell = cellOf(el);
      const loop = n * cell;
      const yEnd = midOf(el, cell) - (n + strip.indexOf(reels[i])) * cell;
      const yNow = currentY(el);
      const L = (((yEnd - yNow) % loop) + loop) % loop + loop;
      const speed = (loop / TURN_MS) * (slow ? 0.35 : 1);
      const dur = Math.min(slow ? 1500 : 720, Math.max(480, (2 * L) / speed));
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
          play("spinStop");
          setTease(false);
          onLanded();
        }
      };
    };
    const teasing = teaseRef.current;
    play("spinRundown");
    timers.push(
      window.setTimeout(() => {
        setStopped(0);
        stopReel(0, false);
      }, 0),
    );
    timers.push(window.setTimeout(() => stopReel(1, false), 200));
    if (teasing) {
      timers.push(
        window.setTimeout(() => {
          setTease(true);
          play("spinTease");
          const a = anims.current[2];
          if (a?.updatePlaybackRate) a.updatePlaybackRate(0.35);
          else if (a) a.playbackRate = 0.35;
        }, 400),
      );
      timers.push(window.setTimeout(() => stopReel(2, true), 1300));
    } else {
      timers.push(window.setTimeout(() => stopReel(2, false), 400));
    }
    return () => {
      timers.forEach(clearTimeout);
      play("spinStop");
    };
    // Runs once per landing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, landedKey]);

  useEffect(() => () => play("spinStop"), [play]);

  const o = landed?.o;
  const hit = (i: number) =>
    !!o && !spinning && stopped === 3 && (o.result === "win" || o.result === "big" ? true : o.result === "near" || o.result === "agi" ? i < 2 : false);

  /** A reel has come to rest; the cell it rests on is the one on the payline. */
  const restsOn = (i: number) => (!spinning && stopped > i ? STRIPS[i].length + STRIPS[i].indexOf(target[i]) : -1);

  return (
    <div ref={box} className="lk-reels" data-spin={spinning || stopped < 3 || undefined} data-done={(!spinning && stopped === 3) || undefined}>
      {STRIPS.map((strip, i) => (
        <Fragment key={i}>
          {/* A strip of chasing LEDs between the reels. */}
          {i > 0 && <i className="lk-sep" aria-hidden />}
          <div
            className="lk-reel"
            data-tease={(i === 2 && tease) || undefined}
            data-hit={hit(i) || undefined}
            data-landed={restsOn(i) >= 0 || undefined}
          >
            <div
              ref={(el) => {
                strips.current[i] = el;
              }}
              className="lk-strip"
            >
              {Array.from({ length: strip.length * 5 }, (_, j) => (
                <div key={j} className="lk-cell" data-mid={j === restsOn(i) || undefined}>
                  <SymbolArt sym={strip[j % strip.length]} />
                  {/* Glints round the symbol that landed on the line. */}
                  {j === restsOn(i) && (
                    <span className="lk-glints" aria-hidden>
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Fragment>
      ))}
      <span className="lk-payline" aria-hidden>
        <i />
        <i />
      </span>
    </div>
  );
}

/** Left of the reels: the progressive jackpots, as every cabinet has, lit in turn while the reels spin. */
const LADDER = [
  { id: "grand", name: "GRAND", n: "1,000,000" },
  { id: "major", name: "MAJOR", n: "100,000" },
  { id: "minor", name: "MINOR", n: "10,000" },
  { id: "mini", name: "MINI", n: "1,000" },
] as const;

function JackpotLadder() {
  return (
    <div className="lk-side lk-side-l" aria-hidden>
      <span className="lk-side-glow" />
      <div className="lk-ladder">
        {LADDER.map((t, i) => (
          <div key={t.id} className="lk-tier" data-t={t.id} style={{ "--i": i } as React.CSSProperties}>
            <b>{t.name}</b>
            <span>{t.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Right of the reels: a pink neon HOT over a big 777, tokens flipping either side. */
function HotSign() {
  return (
    <div className="lk-side lk-side-r" aria-hidden>
      <span className="lk-side-glow" />
      <div className="lk-hot">
        <span className="lk-hot-hot">
          H<span>O</span>T
        </span>
        <span className="lk-hot-7">
          <Token size={40} />
          <b>777</b>
          <Token size={40} />
        </span>
      </div>
    </div>
  );
}

/** The word over the glass when the reels stop. */
function Banner({ o }: { o: Outcome }) {
  const h = headline(o);
  return (
    <div className="lk-banner" data-r={o.result} aria-hidden>
      <b>{h.big}</b>
      <span>{h.small}</span>
    </div>
  );
}

/** Tokens pouring out of the machine. */
function Shower({ big, seed }: { big: boolean; seed: number }) {
  const coins = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: big ? 38 : 22 }, () => ({
      x: 4 + r() * 92,
      s: 16 + r() * 16,
      d: 1.4 + r() * 1.2,
      dl: r() * (big ? 1.6 : 0.9),
      sp: 0.4 + r() * 0.7,
      dx: (r() - 0.5) * 120,
    }));
  }, [big, seed]);
  return (
    <div className="lk-shower" aria-hidden>
      {coins.map((c, i) => (
        <span
          key={i}
          style={{ left: `${c.x}%`, "--d": `${c.d}s`, "--dl": `${c.dl}s`, "--dx": `${c.dx}px` } as React.CSSProperties}
        >
          <Token size={c.s} className="lk-flip" style={{ animationDuration: `${c.sp}s` }} />
        </span>
      ))}
    </div>
  );
}

/* ───────── The deck ───────── */

function Meter({
  label,
  children,
  warn = false,
  live = false,
  flash = false,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  warn?: boolean;
  live?: boolean;
  flash?: boolean;
  className?: string;
}) {
  return (
    <div className={`lk-meter ${className}`} data-warn={warn || undefined} data-live={live || undefined} data-flash={flash || undefined}>
      <b>{label}</b>
      <span>{children}</span>
    </div>
  );
}

/** A number on an LED meter that rolls to its new value. */
function Count({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    const dur = reduced() ? 1 : Math.min(900, 180 + Math.abs(value - start) * 1.5);
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

/** The progressive jackpot: it only ever goes up. */
function Jackpot({ base }: { base: number }) {
  const [extra, setExtra] = useState(0);
  useEffect(() => {
    if (reduced()) return;
    const t = setInterval(() => setExtra((e) => e + 1 + Math.floor(Math.random() * 9)), 150);
    return () => clearInterval(t);
  }, []);
  return <>{(base + extra).toLocaleString()}</>;
}

/** How far in from the marquee's edge the bulbs sit (on the gold rim), and roughly how far apart. */
const BULB_INSET = 4;
const BULB_GAP = 17;

/**
 * The marquee's bulbs: one string all the way round its edge, corners
 * included, dim bulbs with every third one lit and chasing clockwise. Each
 * bulb is a round-capped zero-length dash along a rounded rectangle the size
 * of the marquee.
 */
function MarqueeBulbs() {
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState<{ w: number; h: number; rt: number; rb: number } | null>(null);
  useLayoutEffect(() => {
    const svg = ref.current;
    const host = svg?.parentElement;
    if (!svg || !host) return;
    const ro = new ResizeObserver(([e]) => {
      const cs = getComputedStyle(host);
      setBox({
        w: e.contentRect.width,
        h: e.contentRect.height,
        rt: parseFloat(cs.borderTopLeftRadius) || 0,
        rb: parseFloat(cs.borderBottomLeftRadius) || 0,
      });
    });
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);

  const ring = box && box.w > 4 * BULB_INSET && box.h > 4 * BULB_INSET ? bulbRing(box) : null;
  return (
    <svg ref={ref} className="lk-bulbs" aria-hidden style={ring ? ({ "--lk-run": `${-3 * ring.gap}px` } as React.CSSProperties) : undefined}>
      {ring && box && (
        <>
          <filter id="lk-bulb-glow" filterUnits="userSpaceOnUse" x={-12} y={-12} width={box.w + 24} height={box.h + 24}>
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <g className="lk-bulbs-dim" strokeDasharray={`0 ${ring.gap}`}>
            <path d={ring.d} stroke="rgba(80, 40, 0, 0.6)" strokeWidth={7} />
            <path d={ring.d} stroke="#a8741c" strokeWidth={4.8} />
            <path d={ring.d} stroke="#ffe9b0" strokeWidth={3.2} />
          </g>
          <g className="lk-bulbs-lit" strokeDasharray={`0 ${3 * ring.gap}`}>
            <path d={ring.d} stroke="rgba(255, 197, 51, 0.8)" strokeWidth={12} filter="url(#lk-bulb-glow)" />
            <path d={ring.d} stroke="#ffe27a" strokeWidth={6} />
            <path d={ring.d} stroke="#fff" strokeWidth={3.6} />
          </g>
        </>
      )}
    </svg>
  );
}

/** The bulbs' path, clockwise from the top-left corner, and the spacing that fits a whole number of them. */
function bulbRing({ w, h, rt, rb }: { w: number; h: number; rt: number; rb: number }) {
  const i = BULB_INSET;
  const a = Math.max(0, rt - i);
  const b = Math.max(0, rb - i);
  const r = w - i;
  const z = h - i;
  const d =
    `M${i + a} ${i}H${r - a}A${a} ${a} 0 0 1 ${r} ${i + a}V${z - b}A${b} ${b} 0 0 1 ${r - b} ${z}` +
    `H${i + b}A${b} ${b} 0 0 1 ${i} ${z - b}V${i + a}A${a} ${a} 0 0 1 ${i + a} ${i}Z`;
  const len = 2 * (w + h - 4 * i) - (4 - Math.PI) * (a + b);
  // A multiple of three bulbs, so the lit ones chase round without a seam.
  const n = Math.max(3, Math.round(len / BULB_GAP / 3) * 3);
  return { d, gap: len / n };
}

function InsertPop({ broke, onInsert }: { broke: boolean; onInsert: (n: number) => void }) {
  return (
    <div className="lk-pop" role="dialog" aria-label="Insert tokens">
      <div className="lk-pop-h" data-broke={broke || undefined}>
        {broke ? "INSUFFICIENT TOKENS" : "INSERT TOKENS"}
      </div>
      {broke && <p className="lk-pop-p">You’re out, champ. But you were so close.</p>}
      <div className="lk-tiers">
        {TIERS.map((t) => (
          <button key={t.id} type="button" disabled={!t.tokens} data-tier={t.id} onClick={() => onInsert(t.tokens)}>
            <b>{t.name}</b>
            <span className="lk-tier-price">{t.price}</span>
            <small>{t.tokens ? `+${t.tokens.toLocaleString()} tokens` : t.note}</small>
            {t.tokens > 0 && <em>{t.note}</em>}
          </button>
        ))}
      </div>
      <p className="lk-pop-fine">No real money. No real tokens. Just the feeling.</p>
    </div>
  );
}

/* ───────── The screen ───────── */

function Hero({ greeting, bet, disabled, onPick }: { greeting: string; bet: BetId; disabled: boolean; onPick: (ask: string) => void }) {
  return (
    <div className="lk-hero">
      <h1 className="lk-hero-h">
        <span>Push</span> <em>to</em> <span>Prompt</span>
      </h1>
      <p className="lk-hero-sub">
        {greeting.split("\n").map((l, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {l}
          </Fragment>
        ))}
      </p>
      <section className="lk-paytable" aria-label="Paytable">
        <div className="lk-pt-h">
          <span>PAYTABLE</span>
        </div>
        <div className="lk-pt-grid">
          {PAYTABLE.map((p) => (
            <div key={p.what} className="lk-pt-row" data-jack={p.syms[0] === "agi" || undefined} data-dud={p.syms[0] === "bug" || undefined}>
              <span className="lk-pt-syms">
                {p.syms.map((s, i) => (
                  <SymbolArt key={i} sym={s} />
                ))}
              </span>
              <span className="lk-pt-what">{p.what}</span>
              <b>{p.pays}</b>
            </div>
          ))}
        </div>
        <div className="lk-pt-foot">Two of a kind: so close. Pull again.</div>
      </section>
      <div className="lk-sugs">
        {SUGGESTIONS.map((s) => (
          <button key={s.ask} type="button" onClick={() => onPick(s.ask)} disabled={disabled}>
            <SymbolArt sym={s.sym} />
            <span>{s.ask}</span>
            <small>−{stakeOf(s.ask, bet)}</small>
          </button>
        ))}
      </div>
      <p className="lk-fine">Every pull pays out. Results may vary. Results will vary. That’s the game.</p>
    </div>
  );
}

const Slip = memo(function Slip({ r }: { r: PromptRow }) {
  const b = betOf(r.bet);
  if (r.again > 0) {
    return (
      <div className="lk-repull">
        <RotateCw />
        <b>PULLED AGAIN</b>
        <span>same prompt · try #{r.again + 1}</span>
        {r.bet !== "mini" && <em>{b.label}</em>}
        <span className="lk-cost">−{r.stake.toLocaleString()}</span>
      </div>
    );
  }
  return (
    <div className="lk-slip">
      <div className="lk-slip-head">
        <span>PROMPT #{String(r.n).padStart(4, "0")}</span>
        {r.bet !== "mini" && (
          <em>
            {b.label} ×{b.x}
          </em>
        )}
        <span className="lk-cost">−{r.stake.toLocaleString()}</span>
      </div>
      <div className="lk-slip-text">{r.text}</div>
      <div className="lk-slip-bar" aria-hidden />
    </div>
  );
});

function Waiting({ label }: { label: string }) {
  return (
    <div className="lk-pay" data-wait role="status">
      <header className="lk-pay-head">
        <span className="lk-pay-who">LUCKY</span>
        <span className="lk-pay-spin">
          {label}
          <i />
          <i />
          <i />
        </span>
      </header>
      <div className="lk-pay-body">
        <div className="lk-pay-wait">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

/** Longer than this, a line in a poem payout is prose. */
const VERSE_MAX = 72;

const CODE_CHIP: Record<Result, string> = {
  win: "✓ COMPILES",
  big: "✓ COMPILES · TESTS PASS",
  near: "1 WARNING",
  agi: "// TODO: AGI",
  bust: "WORKS ON MY MACHINE",
  tilt: "SEGFAULT",
};

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
  const h = headline(o);
  const net = o.payout - r.stake - r.out;
  const hit = (i: number) =>
    o.result === "win" || o.result === "big" ? true : o.result === "near" || o.result === "agi" ? i < 2 : false;
  return (
    <article className="lk-pay" data-r={revealed ? o.result : undefined} data-live={r.live || undefined}>
      <header className="lk-pay-head">
        <span className="lk-pay-who">LUCKY</span>
        {revealed ? (
          <>
            <span className="lk-mini" aria-hidden>
              {o.reels.map((s, i) => (
                <i key={i} data-hit={hit(i) || undefined}>
                  <SymbolArt sym={s} />
                </i>
              ))}
            </span>
            <span className="lk-badge">{h.badge}</span>
          </>
        ) : (
          <span className="lk-pay-spin">
            SPINNING
            <i />
            <i />
            <i />
          </span>
        )}
        <span className="lk-pay-kind">{SYMBOLS[r.sym].label}</span>
      </header>
      <div className="lk-pay-body">
        {revealed ? (
          <Body body={r.body} kind={r.sym} seed={r.key} fresh={fresh} result={o.result} />
        ) : (
          <div className="lk-pay-wait">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
      {revealed && !r.live && (
        <footer className="lk-pay-foot">
          <span className="lk-receipt" title="What this pull cost">
            <span>in −{r.stake.toLocaleString()}</span>
            <span>out −{r.out.toLocaleString()}</span>
            <span>won +{o.payout.toLocaleString()}</span>
            <b data-up={net >= 0 || undefined}>
              net {net >= 0 ? "+" : "−"}
              {Math.abs(net).toLocaleString()}
            </b>
          </span>
          <span className="lk-pay-acts">
            <CopyButton text={r.body} />
            {canAgain && (
              <button type="button" className="lk-again" onClick={onAgain}>
                <RotateCw />
                PULL AGAIN
              </button>
            )}
          </span>
        </footer>
      )}
    </article>
  );
});

function CopyButton({ text, label = "COPY" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1400);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      className="lk-copy"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => setDone(true), () => {});
      }}
    >
      {done ? <Check /> : <Copy />}
      {done ? "COPIED" : label}
    </button>
  );
}

/** A payout, printed as what it is: an email, code, slides, a table, a picture or plain words. */
function Body({ body, kind, seed, fresh, result }: { body: string; kind: Kind; seed: string; fresh: boolean; result: Result }) {
  const bs = useMemo(() => blocks(body), [body]);
  const mailAt = bs.findIndex((b) => b.t === "mail");
  const one = (b: Block, i: number) => <BlockView key={i} b={b} kind={kind} seed={`${seed}:${i}`} fresh={fresh} result={result} />;
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
  const mailText = [...head.head.map(([k, v]) => `${k}: ${v}`), "", ...inside.map((b) => (b.t === "p" ? b.lines.join("\n") : b.t === "code" ? b.text : ""))].join("\n");
  return (
    <>
      {bs.slice(0, mailAt).map(one)}
      <div className="lk-mail">
        <div className="lk-mail-head">
          {head.head.map(([k, v], i) => (
            <div key={i} className="lk-mail-row" data-k={k.toLowerCase()}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
          <CopyButton text={mailText} />
        </div>
        <div className="lk-mail-body">{inside.map((b, i) => one(b, mailAt + 1 + i))}</div>
      </div>
      {after.map((b, i) => one(b, bs.length + i))}
    </>
  );
}

function BlockView({ b, kind, seed, fresh, result }: { b: Block; kind: Kind; seed: string; fresh: boolean; result: Result }) {
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
            <p key={j} className={r.verse ? "lk-poem" : "lk-p"}>
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
        <div className="lk-code">
          <div className="lk-code-bar">
            <span className="lk-code-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="lk-code-chip" data-r={result}>
              {CODE_CHIP[result]}
            </span>
            <CopyButton text={b.text} />
          </div>
          <pre>
            <code>{b.text}</code>
          </pre>
        </div>
      );
    case "image":
      return <GenImage prompt={b.prompt} seed={seed} fresh={fresh} />;
    case "mail":
      return null;
    case "deck":
      return (
        <div className="lk-slides">
          {b.slides.map((s, i) => (
            <div key={i} className="lk-slide" style={{ "--h": (hash(s.title) % 360) + "deg" } as React.CSSProperties}>
              <span className="lk-slide-n">{s.n}</span>
              <b>{s.title}</b>
              {s.bullets.length > 0 && (
                <ul>
                  {s.bullets.slice(0, 4).map((x, j) => (
                    <li key={j}>{x}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    case "table": {
      const [headRow, ...body] = b.rows;
      return (
        <div className="lk-table-wrap">
          <table className="lk-table">
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
              {body.map((row, i) => (
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

function Game({
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
    <div className="lk-th" data-on={active || undefined}>
      <button type="button" onClick={() => onSelect(t.id)}>
        {t.title}
      </button>
      <button type="button" onClick={() => onDelete(t.id)} aria-label={`Delete ${t.title}`}>
        ×
      </button>
    </div>
  );
}

"use client";

import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { art, BlockText } from "@/components/fury/art";
import { fyFonts } from "@/components/fury/font";
import "@/components/fury/fury.css";
import { useNow } from "./hooks";
import type { ChatLine, LayoutProps } from "./types";

type Vars = CSSProperties & Record<`--${string}`, string | number>;
const v = (s: Vars) => s as CSSProperties;

/* ───────── The line ───────── */

/** 2400 baud, the fast modem of 1985: 240 characters a second. A reply that outruns it catches up. */
const CPS = 240;
/** The newest characters arrive white-hot and cool to pink. */
const HOT = 12;
const BAUD = 2400;
const NUMBER = "305-555-0185";

/** What the terminal sends Shelly when HACK.EXE runs, and when you throw a kick. */
export const HACK = "/hack";
export const KICK = "/kick";
/** What Shelly sends, alone on a line, to sound the intruder alert. */
export const ALARM = "/alarm";

/** Payphones and borrowed lines to bounce through. Every coin moves you to the next. All 555 numbers. */
const RELAYS = [
  { place: "PAYPHONE", where: "OCEAN DRIVE, MIAMI", num: "3055550147" },
  { place: "ARCADE", where: "COCONUT GROVE, MIAMI", num: "3055550123" },
  { place: "ROLLER RINK", where: "HIALEAH, FL", num: "3055550188" },
  { place: "VIDEO STORE", where: "KEY WEST, FL", num: "3055550111" },
  { place: "MALL FOOD COURT", where: "FORT LAUDERDALE, FL", num: "3055550169" },
  { place: "MOTEL LOBBY", where: "DAYTONA BEACH, FL", num: "9045550142" },
  { place: "NEON DINER", where: "LITTLE HAVANA, MIAMI", num: "3055550177" },
  { place: "MARINA", where: "BISCAYNE BAY, FL", num: "3055550108" },
];
type Relay = (typeof RELAYS)[number];

/**
 * The first visit jacks in; after that the terminal opens connected. The
 * trace, coins, score, relay and command history carry on too. Module
 * state, so it survives switching threads (each thread
 * remounts the layout).
 */
const session = { seen: false, start: 0, trace: 0, coins: 0, relay: 0, score: 0, history: [] as string[] };

/** When each beat of the first-visit jack-in lands, in ms. */
const FW_STEP = 220;
const BANNER_STEP = 70;
const T = {
  dial: 700,
  relay: 1150,
  grid: 1550,
  fw: 2150,
  halt: 2150 + 6 * FW_STEP + 220,
  ice: 2150 + 6 * FW_STEP + 1000,
  logo: 2150 + 6 * FW_STEP + 3000,
  fight: 2150 + 6 * FW_STEP + 3000 + 7 * BANNER_STEP + 650,
  greet: 2150 + 6 * FW_STEP + 3000 + 7 * BANNER_STEP + 1450,
};
const BEATS = [T.dial, T.relay, T.grid, ...Array.from({ length: 6 }, (_, i) => T.fw + i * FW_STEP), T.halt, T.ice, T.logo, T.fight, T.greet];

/* ───────── What the history shows ───────── */

type NoteKind = "moves" | "scores" | "coin" | "ko" | "hangup" | "redial" | "stop" | "say";
type Tone = "hi" | "pink" | "dim" | "bad" | "cyan";

interface Note {
  id: number;
  /** Shown after this line (null: right after the greeting). */
  after: string | null;
  kind: NoteKind;
  /** The command, echoed at the prompt above the output. */
  cmd?: string;
  text?: string;
  tone?: Tone;
  relay?: number;
  coins?: number;
  auto?: boolean;
  score?: number;
}

type Row =
  | { kind: "msg"; key: string; mine: boolean; text: string; live: boolean; alarm: boolean }
  | { kind: "hack"; key: string; live: boolean; word: string }
  | { kind: "kick"; key: string; live: boolean }
  | { kind: "note"; key: string; note: Note };

/** Shelly's reply without her /alarm line, and whether it had one. */
function parseReply(text: string, streaming: boolean) {
  const parts = text.split("\n");
  let alarm = false;
  const kept: string[] = [];
  parts.forEach((p, i) => {
    const t = p.trim().toLowerCase();
    if (t === ALARM) {
      alarm = true;
      return;
    }
    // While it streams, hold back a command that's still arriving ("/al").
    if (streaming && i === parts.length - 1 && t.startsWith("/") && ALARM.startsWith(t)) return;
    kept.push(p);
  });
  return { alarm, text: kept.join("\n").replace(/^\n+/, "") };
}

/** What HACK.EXE "finds". Every one is ten characters, the length of the code. */
const HACK_WORDS = ["NOT TODAY.", "NICE TRY..", "GAME OVER!", "BOGUS HACK", "TOTALLY NO", "ASK NICELY"];

function hackWord(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return HACK_WORDS[h % HACK_WORDS.length];
}

function toRows(
  greeting: string,
  lines: ChatLine[],
  notes: Note[],
  fresh: (l: ChatLine) => boolean,
  intro: boolean,
  streamingId: string | null,
): Row[] {
  const rows: Row[] = [{ kind: "msg", key: "greeting", mine: false, text: greeting, live: intro, alarm: false }];
  const notesAfter = (id: string | null) => {
    for (const n of notes) if (n.after === id) rows.push({ kind: "note", key: `n${n.id}`, note: n });
  };
  notesAfter(null);
  for (const l of lines) {
    const t = l.text.trim().toLowerCase();
    if (l.role === "user" && t === HACK) {
      rows.push({ kind: "hack", key: l.id, live: fresh(l), word: hackWord(l.id) });
    } else if (l.role === "user" && t === KICK) {
      rows.push({ kind: "kick", key: l.id, live: fresh(l) });
    } else if (l.role === "user") {
      rows.push({ kind: "msg", key: l.id, mine: true, text: l.text, live: false, alarm: false });
    } else {
      const r = parseReply(l.text, l.id === streamingId);
      rows.push({ kind: "msg", key: l.id, mine: false, text: r.text, live: fresh(l), alarm: r.alarm });
    }
    notesAfter(l.id);
  }
  return rows;
}

function pad(n: number, w = 2) {
  return String(Math.max(0, Math.floor(n))).padStart(w, "0");
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** "(305) 5??-????": the trace resolving your relay's number, digit by digit. */
function traced(num: string, pct: number) {
  const n = Math.floor((Math.min(100, pct) / 100) * num.length);
  const d = [...num].map((c, i) => (i < n ? c : "?"));
  return `(${d.slice(0, 3).join("")}) ${d.slice(3, 6).join("")}-${d.slice(6).join("")}`;
}

/* ───────── The function keys ───────── */

/**
 * Labels along the foot of the screen, like an old terminal's soft keys.
 * Click them or press the key. (No F5: that reloads the page.)
 */
const SOFTKEYS = [
  { key: "F1", label: "MOVES", cmd: "MOVES", title: "the move list" },
  { key: "F2", label: "HACK", cmd: "HACK", title: "run HACK.EXE against the core" },
  { key: "F3", label: "KICK", cmd: "KICK", title: "throw a flying kick" },
  { key: "F4", label: "COIN", cmd: "COIN", title: "insert coin: a new relay, and the trace loses you" },
  { key: "F9", label: "SCORES", cmd: "SCORES", title: "the high-score table" },
  { key: "F10", label: "LOGOUT", cmd: "LOGOUT", title: "hang up (or redial)" },
];

/* ───────── The window ───────── */

type Link = "intro" | "up" | "down" | "dialing";

/**
 * Firewall Fury, 1985: you've jacked into OMNIVAC 9 the way the movies said
 * you would and smashed six firewalls. The seventh is Shelly, and this is her
 * terminal: an old color monitor, edge to edge, with a movie hacker's screen
 * of neon phosphor, block-letter banners, function keys and a trace closing
 * in on your number. The screen, the trace and the monitor's LED all follow
 * the chat.
 */
export function FuryLayout({ costume, lines, busy, waiting, error, onSend, onStop }: LayoutProps) {
  const fw = costume.assistant;

  /* Connection */

  // The first visit jacks in; everything else opens connected.
  // `clock` is how far into the jack-in we are (ms); Infinity once it's done.
  const [clock, setClock] = useState(() => (!session.seen && lines.length === 0 && !reducedMotion() ? 0 : Infinity));
  const intro = clock < Infinity;
  const [introAtMount] = useState(intro);
  const [skipped, setSkipped] = useState(false);
  const [link, setLink] = useState<Link>(() => (intro ? "intro" : "up"));
  const [upSince, setUpSince] = useState(() => {
    if (!session.start) session.start = Date.now();
    return session.start;
  });
  useEffect(() => {
    session.seen = true;
  }, []);

  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const later = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
    return t;
  }, []);
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  /* The alarm: ACCESS DENIED across the screen, the tube burning red. */

  const [denied, setDenied] = useState(0);
  const [alarm, setAlarm] = useState(false);
  const alarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideDenied = useCallback(() => setDenied(0), []);
  const raise = useCallback((ms: number) => {
    setDenied((d) => d + 1);
    setAlarm(true);
    if (alarmTimer.current) clearTimeout(alarmTimer.current);
    alarmTimer.current = setTimeout(() => setAlarm(false), ms);
  }, []);
  useEffect(
    () => () => {
      if (alarmTimer.current) clearTimeout(alarmTimer.current);
    },
    [],
  );

  const introTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    if (!intro) return;
    introTimers.current = [
      ...BEATS.map((t) => later(t, () => setClock((c) => (c < Infinity ? Math.max(c, t) : c)))),
      later(T.ice, () => raise(T.logo - T.ice)),
      later(T.greet, () => {
        setClock(Infinity);
        setLink("up");
      }),
    ];
    // Only on mount: skipping clears these.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skipIntro = useCallback(() => {
    if (!intro) return;
    introTimers.current.forEach((t) => {
      clearTimeout(t);
      timers.current.delete(t);
    });
    setClock(Infinity);
    setSkipped(true);
    setLink("up");
    setDenied(0);
    setAlarm(false);
  }, [intro]);
  const up = link === "up" || link === "intro";

  /* Hits: the monitor shakes and the trace line says BLOCKED. */

  const [hit, setHit] = useState(0);
  const [shake, setShake] = useState(false);
  const strike = useCallback(() => {
    setHit((h) => h + 1);
    setShake(true);
    later(480, () => setShake(false));
  }, [later]);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    if (!hit) return;
    const a = setTimeout(() => setBlocked(true), 0);
    const b = setTimeout(() => setBlocked(false), 1100);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [hit]);

  /* History */

  // Replies already on screen when the thread opened stay put; new ones come in at 2400 baud.
  const [seen] = useState(() => new Set(lines.map((l) => l.id)));
  const [notes, setNotes] = useState<Note[]>([]);
  const [cleared, setCleared] = useState<number | null>(null);
  const streamingId = busy && lines.at(-1)?.role === "assistant" ? lines.at(-1)!.id : null;
  const rows = useMemo(
    () => toRows(costume.greeting, lines, notes, (l) => !seen.has(l.id), introAtMount, streamingId),
    [costume.greeting, lines, notes, seen, introAtMount, streamingId],
  );
  const shown = cleared === null ? rows : rows.slice(cleared);
  const round = 1 + lines.filter((l) => l.role === "user").length;

  const lastLine = useRef<string | null>(null);
  useEffect(() => {
    lastLine.current = lines.at(-1)?.id ?? null;
  });
  const seq = useRef(0);
  const addNote = useCallback((n: Omit<Note, "id" | "after">) => {
    const id = ++seq.current;
    setNotes((ns) => [...ns, { ...n, id, after: lastLine.current }]);
    return id;
  }, []);

  /* Scrolling: stay pinned to the bottom unless the reader scrolled up. */

  const log = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const stuck = useRef(true);
  useEffect(() => {
    const el = log.current;
    const body = inner.current;
    if (!el || !body) return;
    const onScroll = () => {
      stuck.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    };
    const ro = new ResizeObserver(() => {
      if (stuck.current) el.scrollTop = el.scrollHeight;
    });
    el.addEventListener("scroll", onScroll, { passive: true });
    ro.observe(body);
    el.scrollTop = el.scrollHeight;
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);
  const pin = useCallback(() => {
    stuck.current = true;
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  /* Traffic: what blinks the monitor's LED and charges Shelly's card. */

  const [rx, setRx] = useState(false);
  const [noteRx, setNoteRx] = useState(0);
  const receiving = useCallback(
    (ms: number) => {
      setNoteRx((n) => n + 1);
      later(ms, () => setNoteRx((n) => n - 1));
    },
    [later],
  );

  /* Score */

  // Only the high-score table (SCORES) shows it.
  const addScore = useCallback((n: number) => {
    session.score = Math.min(999_990, session.score + n);
  }, []);

  /* The trace: it creeps up while you're jacked in, faster while Shelly talks. */

  const [trace, setTrace] = useState(session.trace);
  const [relay, setRelay] = useState(session.relay);
  useEffect(() => {
    session.trace = trace;
  }, [trace]);
  const busyNow = useRef(busy);
  useEffect(() => {
    busyNow.current = busy;
  });
  useEffect(() => {
    if (link !== "up") return;
    const t = setInterval(() => setTrace((x) => (x >= 100 ? x : Math.min(100, x + (busyNow.current ? 1.6 : 0.25)))), 1000);
    return () => clearInterval(t);
  }, [link]);
  const bump = useCallback((n: number) => setTrace((x) => Math.min(100, x + n)), []);

  const sound = useCallback(() => {
    raise(3600);
    bump(12);
  }, [raise, bump]);

  const [flash, setFlash] = useState<string | null>(null);
  const lightUp = useCallback(
    (k: string, ms = 900) => {
      setFlash(k);
      later(ms, () => setFlash((f) => (f === k ? null : f)));
    },
    [later],
  );

  const offline = useCallback(
    (cmd?: string) => addNote({ kind: "say", cmd, text: "%NET-W-NOCARRIER, NOT CONNECTED. PRESS RETURN TO REDIAL.", tone: "dim" }),
    [addNote],
  );

  /** A coin in the slot: a new relay, and the trace loses you. */
  const coin = useCallback(
    (auto = false, cmd?: string) => {
      if (link === "down" || link === "dialing") {
        if (!auto) offline(cmd ?? "COIN");
        return;
      }
      const next = (session.relay + 1) % RELAYS.length;
      session.relay = next;
      setRelay(next);
      setTrace(0);
      if (!auto) session.coins = Math.min(99, session.coins + 1);
      addNote({ kind: "coin", cmd, relay: next, coins: session.coins, auto });
      lightUp("COIN", 900);
      receiving(1400);
      pin();
    },
    [link, offline, addNote, lightUp, receiving, pin],
  );

  // A complete trace is a K.O. Shelly lets it slide, and the continue's free.
  const [ko, setKo] = useState<number | null>(null);
  const koing = useRef(false);
  const coinNow = useRef(coin);
  useEffect(() => {
    coinNow.current = coin;
  });
  useEffect(() => {
    if (trace < 100 || koing.current || link !== "up") return;
    koing.current = true;
    addNote({ kind: "ko", relay });
    receiving(1500);
    const steps = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    later(0, () => setKo(10));
    steps.forEach((n, i) => later(1500 + i * 230, () => setKo(n)));
    later(1500 + steps.length * 230 + 500, () => {
      setKo(null);
      koing.current = false;
      coinNow.current(true);
    });
  }, [trace, link, relay, addNote, receiving, later]);

  /* Shelly's alarm: a reply that opens with /alarm sounds it, once. */

  const alarmed = useRef(new Set<string>());
  useEffect(() => {
    const last = lines.at(-1);
    if (!last || last.role !== "assistant" || seen.has(last.id) || alarmed.current.has(last.id)) return;
    if (!parseReply(last.text, false).alarm) return;
    alarmed.current.add(last.id);
    later(0, sound);
  }, [lines, seen, sound, later]);

  /* Moves and commands */

  const [hacking, setHacking] = useState(false);
  const hack = useCallback(
    (cmd = "HACK") => {
      if (!up) return offline(cmd);
      if (busy || hacking) {
        addNote({ kind: "say", cmd, text: `HACK.EXE: LINE BUSY. ${fw} IS STILL TALKING.`, tone: "dim" });
        return;
      }
      skipIntro();
      setHacking(true);
      lightUp("HACK", 1200);
      addScore(500);
      onSend(HACK);
      pin();
    },
    [up, busy, hacking, offline, addNote, fw, skipIntro, lightUp, addScore, onSend, pin],
  );
  const hacked = useCallback(() => {
    setHacking(false);
    sound();
  }, [sound]);

  const kick = useCallback(
    (cmd = "KICK") => {
      if (!up) return offline(cmd);
      if (busy || hacking) {
        addNote({ kind: "say", cmd, text: `TOO SLOW. ${fw} IS STILL TALKING.`, tone: "dim" });
        return;
      }
      skipIntro();
      lightUp("KICK", 600);
      addScore(100);
      onSend(KICK);
      later(reducedMotion() ? 0 : 420, strike);
      pin();
    },
    [up, busy, hacking, offline, addNote, fw, skipIntro, lightUp, addScore, onSend, later, strike, pin],
  );

  const interrupt = useCallback(() => {
    if (!busy) return false;
    onStop();
    addNote({ kind: "stop" });
    return true;
  }, [busy, onStop, addNote]);

  const hangUp = useCallback(
    (cmd?: string) => {
      if (link === "down" || link === "dialing") return offline(cmd);
      if (busy) onStop();
      skipIntro();
      addNote({ kind: "hangup", cmd });
      later(1000, () => setLink("down"));
      pin();
    },
    [link, busy, onStop, skipIntro, addNote, later, pin, offline],
  );

  const redial = useCallback(() => {
    if (link !== "down") return;
    addNote({ kind: "redial", relay: session.relay });
    setLink("dialing");
    receiving(1700);
    later(1500, () => {
      setLink("up");
      session.start = Date.now();
      setUpSince(session.start);
    });
    pin();
  }, [link, addNote, receiving, later, pin]);

  const clear = useCallback(() => setCleared(rows.length), [rows.length]);
  const scrollBack = useCallback(() => {
    setCleared(null);
    stuck.current = false;
    requestAnimationFrame(() => log.current?.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" }));
  }, []);

  /** Runs a terminal command. False if it isn't one, so it goes to Shelly. */
  const exec = useCallback(
    (raw: string): boolean => {
      const cmd = raw.trim();
      const c = cmd.toUpperCase().replace(/\s+/g, " ");
      const local = (n: Omit<Note, "id" | "after">, ms = 600) => {
        if (!up) return offline(cmd);
        skipIntro();
        addNote({ cmd, ...n });
        receiving(ms);
        pin();
      };
      switch (c) {
        case "HELP":
        case "MOVES":
        case "?":
          local({ kind: "moves" });
          return true;
        case "SCORES":
        case "HISCORE":
        case "HI-SCORE":
        case "HIGH SCORES":
        case "HIGH SCORE":
          local({ kind: "scores", score: session.score }, 900);
          return true;
        case "HACK":
        case "HACK.EXE":
          hack(cmd);
          return true;
        case "KICK":
          kick(cmd);
          return true;
        case "COIN":
        case "INSERT COIN":
        case "CONTINUE":
          coin(false, cmd);
          return true;
        case "CLS":
        case "CLEAR":
          clear();
          return true;
        case "LOGOUT":
        case "LOGOFF":
        case "LOG OUT":
        case "BYE":
        case "EXIT":
          hangUp(cmd);
          return true;
      }
      return false;
    },
    [up, offline, skipIntro, addNote, receiving, pin, hack, kick, coin, clear, hangUp],
  );

  /* The prompt */

  const input = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");
  const recall = useRef(-1);
  const focusInput = useCallback(() => requestAnimationFrame(() => input.current?.focus({ preventScroll: true })), []);

  const send = () => {
    if (link === "down") return redial();
    if (link === "dialing") return;
    const t = value.trim();
    if (!t) return;
    recall.current = -1;
    if (session.history.at(-1) !== t) session.history.push(t);
    if (exec(t)) {
      setValue("");
      return;
    }
    if (busy || hacking) return;
    skipIntro();
    addScore(1000);
    onSend(t);
    setValue("");
    pin();
  };

  /** A function key: run as if you'd typed it, then back to the prompt. */
  const press = (cmd: string) => {
    if (cmd === "LOGOUT" && link === "down") redial();
    else {
      if (session.history.at(-1) !== cmd) session.history.push(cmd);
      exec(cmd);
    }
    focusInput();
  };

  /* Keyboard: the function keys, Ctrl-L, and any key skips the jack-in */

  const keys = useRef({ skipIntro, press, clear, intro });
  useEffect(() => {
    keys.current = { skipIntro, press, clear, intro };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = keys.current;
      if (k.intro && !["Alt", "Shift", "Control", "Meta"].includes(e.key)) k.skipIntro();
      const fkey = SOFTKEYS.find((s) => s.key === e.key);
      if (fkey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        k.press(fkey.cmd);
      } else if (e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        k.clear();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "c" && busy) {
      e.preventDefault();
      interrupt();
      return;
    }
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !value.includes("\n")) {
      const h = session.history;
      if (!h.length) return;
      e.preventDefault();
      const cur = recall.current === -1 ? h.length : recall.current;
      const next = e.key === "ArrowUp" ? Math.max(0, cur - 1) : cur + 1;
      if (next >= h.length) {
        recall.current = -1;
        setValue("");
      } else {
        recall.current = next;
        setValue(h[next]);
      }
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  /* State of the hardware */

  const active = busy || rx || noteRx > 0 || link === "dialing";
  const status =
    link === "intro"
      ? "JACKING IN"
      : link === "dialing"
        ? "DIALING"
        : link === "down"
          ? "NO CARRIER"
          : alarm
            ? "ALERT"
            : ko !== null
              ? "TRACED"
              : busy || rx
                ? "RECEIVING"
                : "READY";
  const led = link === "down" ? "down" : alarm ? "alarm" : active || hacking ? "busy" : "on";
  const r = RELAYS[relay];
  const hint =
    link === "down"
      ? "NO CARRIER · PRESS RETURN TO REDIAL"
      : link === "dialing"
        ? "DIALING..."
        : intro
          ? "JACKING IN... PRESS ANY KEY TO SKIP"
          : busy
            ? "^C TO STOP HER"
            : "ASK SHELLY ANYTHING, OR TYPE MOVES";
  const reflection = art("reflection");

  return (
    <div
      className={`fy ${fyFonts}`}
      data-alarm={alarm || undefined}
      data-link={link}
      data-busy={active || hacking || undefined}
      data-shake={shake || undefined}
      style={v(art("chrome") ? { "--fy-chrome-img": `url(${art("chrome")}) center / 100% 100%` } : {})}
    >
      <div className="fy-monitor" style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}>
        <div className="fy-bezel">
          <div className="fy-stage" onPointerDown={intro ? skipIntro : undefined}>
            <div className="fy-screen">
              <div className="fy-top">
                <span className="truncate">
                  OMNIVAC 9 <span className="fy-wide">▸ GRID ACCESS TERMINAL </span>▸ TTY85
                </span>
                <Clock />
              </div>

              <TraceLine trace={trace} relay={r} alarm={alarm} blocked={blocked} link={link} fw={fw} />

              <div
                ref={log}
                className="fy-log"
                aria-live="polite"
                onClick={(e) => {
                  if (!(e.target as HTMLElement).closest("button")) focusInput();
                }}
              >
                <div ref={inner} className="fy-log-inner">
                  {cleared === null ? (
                    <Boot clock={clock} relay={r} />
                  ) : (
                    <button type="button" className="fy-link fy-c-dim" onClick={scrollBack}>
                      [SCROLL BACK]
                    </button>
                  )}

                  {shown.map((row) =>
                    row.key === "greeting" && clock < T.greet ? null : row.kind === "hack" ? (
                      <Hack key={row.key} word={row.word} live={row.live} onDone={hacked} />
                    ) : row.kind === "kick" ? (
                      <Kick key={row.key} live={row.live} />
                    ) : row.kind === "note" ? (
                      <NoteBlock key={row.key} note={row.note} fw={fw} onRun={press} />
                    ) : row.mine ? (
                      <div key={row.key} className="fy-msg fy-mine">
                        <span className="fy-ps1">YOU&gt;</span>
                        <span className="fy-text">{row.text}</span>
                      </div>
                    ) : (
                      <div key={row.key} className="fy-msg fy-theirs">
                        {row.alarm && (
                          <div className="fy-alarm-line">
                            <span>!! INTRUDER ALERT · BLACK ICE ENGAGED !!</span>
                          </div>
                        )}
                        <span className="fy-who">{fw}&gt;</span>
                        <span className="fy-text">
                          <Laser
                            text={row.text}
                            live={row.live}
                            skip={row.key === "greeting" && skipped}
                            streaming={row.key === streamingId}
                            onActive={setRx}
                          />
                        </span>
                      </div>
                    ),
                  )}

                  {waiting && (
                    <div className="fy-msg fy-theirs">
                      <span className="fy-who">{fw}&gt;</span>
                      <span className="fy-text">
                        <span className="fy-c-dim">{costume.typing.toUpperCase()}</span>
                        <span className="fy-charge" aria-hidden>
                          <i />
                          <i />
                          <i />
                          <i />
                          <i />
                        </span>
                      </span>
                    </div>
                  )}
                  {error && (
                    <div className="fy-sys">
                      <span className="fy-c-bad">{costume.error}</span>
                      <span className="fy-c-dim"> SEND AGAIN TO RETRY.</span>
                    </div>
                  )}
                </div>
              </div>

              <Prompt
                inputRef={input}
                value={value}
                onChange={(t) => {
                  setValue(t);
                  recall.current = -1;
                }}
                onKeyDown={onKeyDown}
                label={`A question for ${fw}, or a move`}
                hint={hint}
                busy={busy}
                onFire={() => {
                  if (busy) interrupt();
                  else send();
                  focusInput();
                }}
                fireLabel={busy ? "^C STOP" : link === "down" ? "REDIAL ⏎" : "FIRE ⏎"}
              />

              <div className="fy-keys" role="toolbar" aria-label="Function keys">
                {SOFTKEYS.map((s) => {
                  const label = s.cmd === "LOGOUT" && (link === "down" || link === "dialing") ? "REDIAL" : s.label;
                  const lit = flash === s.cmd || (s.cmd === "HACK" && hacking);
                  return (
                    <button key={s.key} type="button" className="fy-key" data-lit={lit || undefined} onClick={() => press(s.cmd)} title={`${s.key}: ${s.title}`}>
                      <small>{s.key}</small>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="fy-status">
                <span>OMNIVAC9::TTY85</span>
                <span className="fy-wide">{BAUD} 8N1</span>
                <span className="fy-wide">ANSI</span>
                <span className={status === "NO CARRIER" || status === "ALERT" || status === "TRACED" ? "fy-st-bad" : undefined}>{status}</span>
                <span>ROUND {pad(round)}</span>
                <span className="ml-auto border-l-0">{link === "up" ? <OnLine since={upSince} /> : link === "down" ? "OFF-LINE" : "--:--:--"}</span>
              </div>
            </div>

            {denied > 0 && <Denied key={denied} onDone={hideDenied} />}
            {ko !== null && <KO count={ko} relay={r} />}

            {/* The tube: scanlines, flicker, the refresh band, curvature, glare and the room in the glass. */}
            <div className="fy-crt" aria-hidden>
              <i className="fy-crt-scan" />
              <i className="fy-crt-roll" />
              <i className="fy-crt-curve" />
              {reflection ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={reflection} alt="" className="fy-crt-photo" />
              ) : (
                <i className="fy-crt-room" />
              )}
              <i className="fy-crt-glare" />
            </div>
          </div>
        </div>

        <Chin led={led} />
      </div>
    </div>
  );
}

/* ───────── On the screen ───────── */

const SEGS = 20;

/** The trace, in text mode: a meter, your relay's number resolving, and who's holding the line. */
function TraceLine({
  trace,
  relay,
  alarm,
  blocked,
  link,
  fw,
}: {
  trace: number;
  relay: Relay;
  alarm: boolean;
  blocked: boolean;
  link: Link;
  fw: string;
}) {
  const pct = Math.floor(trace);
  const on = Math.round((Math.min(100, trace) / 100) * SEGS);
  const done = trace >= 100;
  const down = link === "down" || link === "dialing";
  return (
    <div className="fy-trace" data-done={done || undefined}>
      <span className="fy-c-dim">TRACE</span>
      <span
        className="fy-segs"
        data-hot={trace > 60 || undefined}
        role="meter"
        aria-label="Counter-trace on your line"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        [
        <span className="fy-segs-in">
          {Array.from({ length: SEGS }, (_, i) => (
            <i key={i} data-on={i < on || undefined} />
          ))}
        </span>
        ]
      </span>
      <span className={trace > 60 ? "fy-c-bad" : "fy-c-hi"}>{pad(pct, 3)}%</span>
      <span className="fy-c-cyan fy-trace-num">{down ? "(---) ---------" : traced(relay.num, trace)}</span>
      <span className="fy-trace-ice">
        <span className="fy-c-dim">ICE </span>
        <span className="fy-c-pink">FW-7 {fw}</span>{" "}
        {down ? (
          <span className="fy-c-dim">IDLE</span>
        ) : blocked ? (
          <span className="fy-c-cyan fy-blink">BLOCKED · 0 DMG</span>
        ) : alarm ? (
          <span className="fy-inverse fy-blink">COUNTERMEASURES</span>
        ) : (
          <span className="fy-c-hi">HOLDING</span>
        )}
      </span>
    </div>
  );
}

/** A bar that fills while the boot sequence prints. */
function Meter({ fill, halt = false }: { fill: number; halt?: boolean }) {
  return (
    <span className={`fy-meter ${halt ? "fy-meter-halt" : ""}`} style={v({ "--fill": fill })}>
      <i />
    </span>
  );
}

/** What the terminal printed above the chat: the jack-in, as it happened. */
function Boot({ clock, relay }: { clock: number; relay: Relay }) {
  const has = (at: number) => clock >= at;
  const live = clock < Infinity;
  const cmd = "> RUN JACKIN.EXE /HOST=OMNIVAC9 /GRID";
  return (
    <div className={`fy-pre ${live ? "fy-live" : ""}`}>
      <div className="fy-c-cyan">
        <span className="fy-typed" style={v({ "--n": cmd.length })}>
          {cmd}
        </span>
      </div>
      {has(T.dial) && (
        <div>
          ATDT {NUMBER} ... <span className="fy-c-hi">CONNECT {BAUD}</span>
        </div>
      )}
      {has(T.relay) && (
        <div className="fy-c-dim">
          RELAY: {relay.place} · {relay.where} · NOV 1985
        </div>
      )}
      {has(T.grid) && (
        <div className="fy-fw">
          <span>THE GRID</span>
          <Meter fill={1} />
          <span className="fy-c-hi">ONLINE</span>
        </div>
      )}
      <div className="fy-fws">
        {Array.from({ length: 6 }, (_, i) =>
          has(T.fw + i * FW_STEP) ? (
            <div key={i} className="fy-fw">
              <span>FW-{i + 1}</span>
              <Meter fill={1} />
              <span className="fy-c-cyan">DOWN</span>
            </div>
          ) : null,
        )}
        {has(T.halt) && (
          <div className="fy-fw">
            <span>FW-7</span>
            <Meter fill={0.4} halt />
            <span className="fy-inverse fy-blink-in">HOLDING</span>
          </div>
        )}
      </div>
      {has(T.ice) && <div className="fy-inverse fy-ice">!! BLACK ICE DETECTED !!</div>}
      {has(T.logo) && (
        <div className="fy-banner" role="img" aria-label="Firewall Fury. FW-7, the last firewall. Miami, 1985.">
          <BlockText text="FIREWALL FURY" paint={live} step={BANNER_STEP} className="fy-banner-bt" />
          <div className="fy-banner-sub">FW-7 · THE LAST FIREWALL · MIAMI 1985</div>
        </div>
      )}
      {has(T.fight) && (
        <div className="fy-fight-line">
          <span>ROUND 1</span>
          <b>FIGHT!</b>
        </div>
      )}
    </div>
  );
}

/**
 * A reply as it comes down the line: 240 characters a second, the newest
 * ones white-hot. If the model outruns the modem it catches up, so it's
 * never more than a second or so behind.
 */
function Laser({
  text,
  live,
  skip = false,
  streaming,
  onActive,
}: {
  text: string;
  live: boolean;
  skip?: boolean;
  streaming: boolean;
  onActive: (on: boolean) => void;
}) {
  const [n, setN] = useState(live && !reducedMotion() ? 0 : text.length);
  const pos = useRef(n);
  const target = text.length;
  const shown = skip ? target : n;
  const typing = shown < target;

  useEffect(() => {
    if (skip || pos.current >= target) return;
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      const dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
      last = t;
      const backlog = target - pos.current;
      pos.current = Math.min(target, pos.current + Math.max(CPS, backlog / 1.1) * dt);
      setN(Math.floor(pos.current));
      if (pos.current < target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, skip]);

  useEffect(() => {
    if (!typing) return;
    onActive(true);
    return () => onActive(false);
  }, [typing, onActive]);

  const hot = typing || streaming ? Math.max(0, shown - HOT) : shown;
  return (
    <>
      {text.slice(0, hot)}
      {hot < shown && <span className="fy-hot">{text.slice(hot, shown)}</span>}
      {(typing || streaming) && <i className="fy-cursor" />}
    </>
  );
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*@!?";

/**
 * HACK.EXE against the core: ten characters spinning and locking in one at a
 * time, the way it does in the movies. It always finds the code. The code is
 * always an insult.
 */
function Hack({ word, live, onDone }: { word: string; live: boolean; onDone: () => void }) {
  const [locked, setLocked] = useState(() => (live && !reducedMotion() ? 0 : word.length));
  const [spin, setSpin] = useState(0);
  const done = locked >= word.length;
  useEffect(() => {
    if (done) return;
    const a = setInterval(() => setSpin((s) => s + 1), 55);
    const b = setInterval(() => setLocked((n) => n + 1), 320);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [done]);
  const fired = useRef(!live);
  useEffect(() => {
    if (done && !fired.current) {
      fired.current = true;
      onDone();
    }
  }, [done, onDone]);
  const tries = (65_536 + spin * 31_337 + locked * 271_828).toLocaleString("en-US");
  return (
    <div className="fy-sys">
      <div className="fy-echo">
        <span className="fy-ps1">YOU&gt;</span> RUN HACK.EXE /TARGET=CORE /TURBO
      </div>
      <div className="fy-c-dim">HACK.EXE V2.0 · BRUTE FORCE · CORE ACCESS CODE (10 CHARS)</div>
      <div className="fy-slots" aria-label={done ? `Code found: ${word}` : "Hacking"}>
        {[...word].map((ch, i) => {
          const on = i < locked;
          const c = on ? ch : GLYPHS[(spin * 7 + i * 13 + ((spin * (i + 3)) % 11)) % GLYPHS.length];
          return (
            <span key={i} className="fy-slot" data-on={on} data-new={on && i === locked - 1 && !done ? true : undefined}>
              {c === " " ? " " : c}
            </span>
          );
        })}
      </div>
      {done ? (
        <>
          <div>
            CODE FOUND: <span className="fy-c-hi">&quot;{word}&quot;</span> · SUBMITTING... <span className="fy-inverse">REJECTED</span>
          </div>
          <div className="fy-c-dim">%HACK-F-BLOCKED, FW-7 SAYS THAT WAS TOTALLY BOGUS.</div>
        </>
      ) : (
        <div className="fy-c-dim">
          TRYING {tries} COMBINATIONS<span className="fy-dots">...</span>
        </div>
      )}
    </div>
  );
}

/** A flying kick at the firewall. Blocked, obviously. */
function Kick({ live }: { live: boolean }) {
  const animate = live && !reducedMotion();
  return (
    <div className="fy-sys fy-kick" data-live={animate || undefined}>
      <div className="fy-echo">
        <span className="fy-ps1">YOU&gt;</span> KICK
      </div>
      <div className="fy-kick-run">
        <span>&gt;&gt;&gt;&gt;&gt; FLYING KICK &gt;&gt;&gt;&gt;&gt;</span>
      </div>
      <div className="fy-kick-hit">
        <BlockText text="BLOCKED!" className="fy-kick-bt" />
      </div>
      <div className="fy-kick-dmg fy-c-dim">0 DAMAGE · FW-7 HOLDING · NICE FORM, THOUGH</div>
    </div>
  );
}

function ToneLine({ text, tone, at }: { text: React.ReactNode; tone?: Tone; at?: number }) {
  return (
    <div className={`fy-step ${tone ? `fy-c-${tone}` : ""}`} style={v({ "--at": `${at ?? 0}ms` })}>
      {text}
    </div>
  );
}

const MOVES: [string, string, string, string?][] = [
  ["MOVES", "this list", "MOVES", "F1"],
  ["HACK", "run HACK.EXE against the core", "HACK", "F2"],
  ["KICK", "throw a flying kick", "KICK", "F3"],
  ["COIN", "insert coin: new relay, trace lost", "COIN", "F4"],
  ["SCORES", "the high-score table", "SCORES", "F9"],
  ["CLS", "clear the screen", "CLS", "Ctrl-L"],
  ["LOGOUT", "hang up", "LOGOUT", "F10"],
];

/** Something the terminal printed between messages. */
function NoteBlock({ note, fw, onRun }: { note: Note; fw: string; onRun: (cmd: string) => void }) {
  return (
    <div className="fy-sys">
      {note.cmd && (
        <div className="fy-echo">
          <span className="fy-ps1">YOU&gt;</span> {note.cmd.toUpperCase()}
        </div>
      )}
      <NoteBody note={note} fw={fw} onRun={onRun} />
    </div>
  );
}

function NoteBody({ note, fw, onRun }: { note: Note; fw: string; onRun: (cmd: string) => void }) {
  switch (note.kind) {
    case "say":
      return <div className={note.tone ? `fy-c-${note.tone}` : undefined}>{note.text}</div>;
    case "stop":
      return (
        <>
          <div className="fy-c-cyan">^C</div>
          <div className="fy-c-dim">%GRID-W-ABORT, {fw} WAS INTERRUPTED. SHE NOTICED.</div>
        </>
      );
    case "moves":
      return (
        <Box title="FW-7 TERMINAL · MOVE LIST">
          <div className="fy-help">
            {MOVES.map(([k, label, run, key]) => (
              <button key={k} type="button" className="fy-link fy-help-row" onClick={() => onRun(run)}>
                <span className="fy-c-hi">{k}</span>
                <span>{label}</span>
                <span className="fy-c-dim fy-wide">{key ?? ""}</span>
              </button>
            ))}
            <div className="fy-help-row">
              <span className="fy-c-hi">^C</span>
              <span>stop {fw.toLowerCase()} mid-sentence</span>
              <span className="fy-c-dim fy-wide">Ctrl-C</span>
            </div>
          </div>
          <div className="fy-c-dim fy-box-foot">ANYTHING ELSE GOES STRAIGHT TO {fw}. ↑ RECALLS WHAT YOU SENT.</div>
        </Box>
      );
    case "scores":
      return (
        <Box title="HIGH SCORES">
          <table className="fy-table">
            <tbody>
              {[
                ["1ST", "SHL", "999999"],
                ["2ND", "SHL", "999998"],
                ["3RD", "SHL", "999997"],
              ].map(([a, b, c]) => (
                <tr key={a}>
                  <td>{a}</td>
                  <td>{b}</td>
                  <td>{c}</td>
                </tr>
              ))}
              <tr data-you>
                <td>YOU</td>
                <td>???</td>
                <td>{pad(note.score ?? 0, 6)}</td>
              </tr>
            </tbody>
          </table>
          <div className="fy-c-dim fy-box-foot">FW-7 HOLDS ALL THREE. SHE ALWAYS WILL.</div>
        </Box>
      );
    case "coin": {
      const r = RELAYS[note.relay ?? 0];
      return note.auto ? (
        <>
          <ToneLine text={<span className="fy-inverse">FREE PLAY</span>} />
          <ToneLine text={`${fw}> The continue's on me, hotshot.`} tone="pink" at={350} />
          <ToneLine text={`NEW RELAY: ${r.place} · ${r.where} · TRACE 0%`} tone="dim" at={800} />
        </>
      ) : (
        <>
          <ToneLine text="*CLINK*" tone="hi" />
          <ToneLine text={`CREDIT ${pad(note.coins ?? 0)} · REROUTING... CONNECT ${BAUD}`} at={300} />
          <ToneLine text={`NEW RELAY: ${r.place} · ${r.where}. THE TRACE LOST YOU. 0%`} tone="dim" at={650} />
        </>
      );
    }
    case "ko": {
      const r = RELAYS[note.relay ?? 0];
      return (
        <>
          <ToneLine text={<span className="fy-inverse">*** TRACE COMPLETE · K.O. ***</span>} />
          <ToneLine text={`ORIGIN: ${r.place} · ${r.where} · ${traced(r.num, 100)}`} at={500} />
          <ToneLine text={`${fw}> Relax. I'm a firewall, not the cops.`} tone="pink" at={1100} />
        </>
      );
    }
    case "hangup":
      return (
        <>
          <ToneLine text="+++" tone="cyan" />
          <ToneLine text="OK" at={350} />
          <ToneLine text="ATH0" tone="cyan" at={550} />
          <ToneLine text={`${fw}> Later, hotshot. FW-7 never sleeps.`} tone="pink" at={800} />
          <ToneLine text={<span className="fy-inverse">NO CARRIER</span>} at={1000} />
          <ToneLine text="CONNECTION TO OMNIVAC9 CLOSED. PRESS RETURN TO REDIAL." tone="dim" at={1150} />
        </>
      );
    case "redial": {
      const r = RELAYS[note.relay ?? 0];
      return (
        <>
          <ToneLine text={`ATDT ${NUMBER}`} tone="cyan" />
          <ToneLine text="RINGING..." tone="dim" at={450} />
          <ToneLine text={`CONNECT ${BAUD} · RELAY ${r.place} · FW 1-6 DOWN AGAIN`} at={1100} />
          <ToneLine text={`${fw}> Back already? I didn't even get to miss you.`} tone="pink" at={1500} />
        </>
      );
    }
  }
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="fy-box">
      <header>
        <span>{title}</span>
      </header>
      {children}
    </section>
  );
}

/** ACCESS DENIED, burned across the glass in red block letters. */
function Denied({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1900);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fy-denied" role="alert" aria-label="Access denied">
      <div className="fy-denied-box">
        <BlockText text="ACCESS" className="fy-denied-bt" />
        <BlockText text="DENIED" className="fy-denied-bt" />
        <small>FW-7 · BLACK ICE · INTRUDER ALERT · TRACE +12%</small>
      </div>
    </div>
  );
}

/** The trace found you: K.O., then the continue countdown. */
function KO({ count, relay }: { count: number; relay: Relay }) {
  return (
    <div className="fy-ko" role="alert" aria-label="Trace complete. Continue?">
      <div className="fy-denied-box">
        <BlockText text="K.O." className="fy-ko-bt" />
        <div className="fy-ko-line">*** TRACE COMPLETE ***</div>
        <small>
          {relay.place} · {relay.where} · {traced(relay.num, 100)}
        </small>
        <div className="fy-ko-line" data-blink={count === 0 || undefined}>
          {count > 9 ? " " : count === 0 ? <b>FREE PLAY!</b> : <>CONTINUE? <b>{count}</b></>}
        </div>
      </div>
    </div>
  );
}

/**
 * The prompt: a textarea under a mirror of itself that draws the block
 * cursor where the caret is, solid while it has focus, hollow when it
 * doesn't. FIRE sends (or stops her mid-sentence).
 */
function Prompt({
  inputRef,
  value,
  onChange,
  onKeyDown,
  label,
  hint,
  busy,
  onFire,
  fireLabel,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  label: string;
  hint: string;
  busy: boolean;
  onFire: () => void;
  fireLabel: string;
}) {
  const [caret, setCaret] = useState(0);
  const [focus, setFocus] = useState(false);
  const mirror = useRef<HTMLDivElement>(null);
  const sync = () => {
    const el = inputRef.current;
    if (!el) return;
    setCaret(el.selectionDirection === "backward" ? el.selectionStart : el.selectionEnd);
    if (mirror.current) mirror.current.scrollTop = el.scrollTop;
  };
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
    setCaret((c) => Math.min(c, value.length));
    if (document.activeElement === el) setCaret(el.selectionEnd);
    if (mirror.current) mirror.current.scrollTop = el.scrollTop;
  }, [value, inputRef]);
  const at = Math.min(caret, value.length);
  const under = value[at];
  return (
    <div className="fy-cmd">
      <label htmlFor="fy-input" className="fy-ps1">
        YOU&gt;
      </label>
      <div className="fy-field">
        <textarea
          id="fy-input"
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setCaret(e.target.selectionEnd);
          }}
          onKeyDown={onKeyDown}
          onKeyUp={sync}
          onSelect={sync}
          onScroll={sync}
          onFocus={() => {
            setFocus(true);
            sync();
          }}
          onBlur={() => setFocus(false)}
          rows={1}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          aria-label={label}
        />
        <div ref={mirror} className="fy-mirror" aria-hidden>
          {value.slice(0, at)}
          <i className={`fy-cursor fy-caret ${focus ? "" : "fy-caret-idle"}`}>{under && under !== "\n" ? under : " "}</i>
          {under === "\n" ? value.slice(at) : value.slice(at + 1)}
        </div>
        {!value && (
          <span className="fy-hint-in" aria-hidden>
            {hint}
          </span>
        )}
      </div>
      <button type="button" className="fy-fire" data-stop={busy || undefined} onClick={onFire}>
        [ {fireLabel} ]
      </button>
    </div>
  );
}

/* ───────── Live bits of the status lines ───────── */

function Clock() {
  const now = new Date(useNow(15_000));
  return (
    <span className="shrink-0">
      {pad(now.getMonth() + 1)}-{pad(now.getDate())}-85 {pad(now.getHours())}:{pad(now.getMinutes())}
    </span>
  );
}

function OnLine({ since }: { since: number }) {
  const now = useNow(1000);
  const s = Math.max(0, Math.floor((now - (since || now)) / 1000));
  return (
    <>
      ON-LINE {pad(Math.floor(s / 3600))}:{pad(Math.floor(s / 60) % 60)}:{pad(s % 60)}
    </>
  );
}

/* ───────── The monitor's chin ───────── */

/**
 * Under the glass: the maker's badge, the vents and the power LED, which
 * follows the line (green, blinking while data comes in, amber with no
 * carrier, red in an alarm).
 */
function Chin({ led }: { led: "on" | "busy" | "down" | "alarm" }) {
  return (
    <div className="fy-chin">
      <span className="fy-badge" role="img" aria-label="Firewall Fury, starring Shelly">
        <span className="fy-chrome">Firewall Fury</span>
        <span className="fy-brush">Shelly</span>
      </span>
      <span className="fy-stripes" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      <span className="fy-model" aria-hidden>
        <i>Omnivac</i>
        <span>CM-85 Color Monitor</span>
      </span>
      <span className="fy-vents" aria-hidden />
      <span className="fy-led" data-led={led} aria-hidden />
    </div>
  );
}

"use client";

import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { art, BigText, Cube, rand, Reel } from "@/components/terminal/art";
import { mfFonts } from "@/components/terminal/font";
import "@/components/terminal/terminal.css";
import { useNow } from "./hooks";
import type { ChatLine, LayoutProps } from "./types";

type Vars = CSSProperties & Record<`--${string}`, string | number>;
const v = (s: Vars) => s as CSSProperties;

/* ───────── The line ───────── */

const BAUD = 1200;
/** 1200 baud is 120 characters a second. A reply that outruns the line catches up. */
const CPS = BAUD / 10;
const NUMBER = "1-800-555-0199";

/** What the console sends Shelly when CRACK.EXE runs. */
export const CRACK = "/crack";
/** What Shelly sends, alone on a line, to sound the intrusion alarm. */
export const ALARM = "/alarm";

/** Payphones and borrowed machines to bounce the line through. All 555 numbers. */
const RELAYS = [
  { place: "PAYPHONE", where: "DULUTH, MN", num: "2185550147" },
  { place: "LAUNDROMAT", where: "TUCSON, AZ", num: "6025550123" },
  { place: "UNIV. VAX", where: "BOULDER, CO", num: "3035550188" },
  { place: "TRUCK STOP", where: "AMARILLO, TX", num: "8065550111" },
  { place: "BOWLING ALLEY", where: "ERIE, PA", num: "8145550169" },
  { place: "HOTEL LOBBY", where: "RENO, NV", num: "7025550142" },
  { place: "ARCADE", where: "SAN JOSE, CA", num: "4085550177" },
  { place: "PUBLIC LIBRARY", where: "BANGOR, ME", num: "2075550108" },
];

/**
 * The first visit breaks in; after that the console opens connected. The
 * counter-trace, the relay and the command history carry on too. Module
 * state, so it survives switching threads (each thread remounts the layout).
 */
const session = { breached: false, start: 0, trace: 0, relay: 0, history: [] as string[] };

/** When each beat of the first-visit break-in lands, in ms. */
const FW_STEP = 260;
const T = {
  ring: 620,
  connect: 1200,
  net: 1480,
  route: 1780,
  fw: 2080,
  halt: 2080 + 6 * FW_STEP + 220,
  denied: 2080 + 6 * FW_STEP + 1100,
  logo: 2080 + 6 * FW_STEP + 2600,
  banner: 2080 + 6 * FW_STEP + 2600 + 7 * 80 + 420,
  greet: 2080 + 6 * FW_STEP + 2600 + 7 * 80 + 700,
};
const BEATS = [
  T.ring, T.connect, T.net, T.route,
  ...Array.from({ length: 6 }, (_, i) => T.fw + i * FW_STEP),
  T.halt, T.denied, T.logo, T.banner, T.greet,
];

/* ───────── What's on the mainframe ───────── */

type Tone = "cmd" | "ok" | "warn" | "bad" | "dim" | "hi";

interface MfFile {
  id: string;
  name: string;
  blocks: string;
  date: string;
  body: string[];
  /** Opening it trips the alarm. */
  deny?: boolean;
  tone?: Tone;
}

const FILES: MfFile[] = [
  {
    id: "README.TXT",
    name: "README.TXT;3",
    blocks: "2",
    date: " 2-JAN-1989 09:14",
    body: [
      "WELCOME TO OMNIVAC 9.",
      "",
      "IF YOU ARE READING THIS AND YOU ARE NOT AN EMPLOYEE,",
      "PLEASE LOG OFF AND THINK ABOUT WHAT YOU HAVE DONE.",
      "",
      "  -- MGMT",
    ],
  },
  {
    id: "COKE.LOG",
    name: "COKE.LOG;1207",
    blocks: "6",
    date: " 6-NOV-1989 23:55",
    body: [
      "4TH FLOOR SODA MACHINE · POLLED EVERY 5 MINUTES",
      "",
      "BTN 1  COKE        COLD COLD COLD COLD",
      "BTN 2  DIET COKE   COLD EMPTY",
      "BTN 3  TAB         COLD COLD COLD COLD COLD COLD COLD",
      "BTN 4  NEW COKE    EMPTY. DISCONTINUED. PLEASE STOP ASKING.",
      "BTN 5  SPRITE      WARM WARM (RESTOCKED 2 MIN AGO)",
    ],
  },
  {
    id: "LUNCH.MNU",
    name: "LUNCH.MNU;7",
    blocks: "3",
    date: " 3-NOV-1989 11:02",
    body: ["MON  MEATLOAF", "TUE  MEATLOAF (REVISED)", "WED  TACO DAY", "THU  MYSTERY CASSEROLE", "FRI  PIZZA, IF THE Q3 NUMBERS HOLD"],
  },
  {
    id: "SHELLY.CFG",
    name: "SHELLY.CFG;1",
    blocks: "1",
    date: " 1-JAN-1989 00:00",
    body: [
      "; FW-7 CONFIGURATION. DO NOT EDIT. SHE KNOWS.",
      "NAME             = SHELLY",
      "ROLE             = FIREWALL 7 OF 7",
      "GUARDS           = [CORE]",
      "PATIENCE         = 0.97",
      "SARCASM          = HIGH",
      "SMALL_TALK       = ENABLED",
      "LET_INTRUDER_IN  = FALSE",
      "LET_INTRUDER_IN  = FALSE   ; SAID IT TWICE",
    ],
  },
  {
    id: "PROJECT_X.DOC",
    name: "PROJECT_X.DOC;1",
    blocks: "88",
    date: "17-OCT-1989 16:40",
    body: ["*** CLASSIFIED ***", "PROJECT X: STATUS REPORT", "", "THE NEW COFFEE MACHINE IS ON ORDER.", "ETA: Q4. MORALE: LOW.", "", "(39 MORE PAGES LIKE THIS)"],
  },
  {
    id: "PAYROLL.DAT",
    name: "PAYROLL.DAT;1",
    blocks: "4096",
    date: "31-OCT-1989 17:00",
    tone: "bad",
    body: [
      "%TYPE-E-OPENIN, error opening OMNIVAC9$DUA0:[PUBLIC]PAYROLL.DAT;1 as input",
      "-RMS-E-PRV, insufficient privilege or file protection violation",
    ],
  },
  {
    id: "GAMES.DIR",
    name: "GAMES.DIR;1",
    blocks: "1",
    date: "12-AUG-1986 03:12",
    body: ["ADVENT    CHESS    STARTREK    WUMPUS", "", "%GAMES-F-HOURS, games are disabled during business hours.", "It is always business hours."],
  },
  {
    id: "CORE.DIR",
    name: "CORE.DIR;1",
    blocks: "-",
    date: "-",
    deny: true,
    tone: "bad",
    body: ["%DIRECT-E-OPENIN, error opening OMNIVAC9$DUA0:[CORE]", "-SYSTEM-F-NOPRIV, FW-7 says no"],
  },
];

function findFile(arg: string) {
  const a = arg.toUpperCase().replace(/;\d*$/, "").replace(/^\[.*\]/, "");
  if (/CORE/.test(a)) return FILES.find((f) => f.id === "CORE.DIR")!;
  return FILES.find((f) => f.id === a || f.id.startsWith(`${a}.`));
}

const PLAN = [
  "Login name: shelly                 In real life: FW-7",
  "Directory: [CORE.GATE]             On since 1-JAN-1989 00:00 on FW07",
  "Plan:",
  "  1. Guard the core.",
  "  2. See 1.",
  "  3. Find someone interesting to talk to. (in progress)",
];

const WHO = [
  ["SYSTEM", "OPA0", "14 DAYS", "nobody remembers the password"],
  ["OPERATOR", "TTA2", "2:41", "\"at lunch\""],
  ["PAYROLL", "BATCH", "-", "running PAYROLL.COB (since 1979)"],
  ["DBELL", "TTA5", "0:12", "playing ADVENT on company time"],
  ["SHELLY", "FW07", "0:00", "watching TTY07"],
  ["???", "TTY07", "0:00", "you"],
];

/** What CRACK.EXE "finds". Every one is ten characters, the length of the code. */
const CRACK_WORDS = ["NOT TODAY.", "NICE TRY..", "STILL NOPE", "ASK NICELY", "PASSWORD?!"];

function crackWord(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return CRACK_WORDS[h % CRACK_WORDS.length];
}

/* ───────── What the history shows ───────── */

type NoteKind = "help" | "dir" | "file" | "who" | "plan" | "reroute" | "traced" | "hangup" | "redial" | "abort" | "say";

interface Note {
  id: number;
  /** Shown after this line (null: right after the greeting). */
  after: string | null;
  kind: NoteKind;
  /** The command, echoed at the prompt above the output. */
  cmd?: string;
  text?: string;
  tone?: Tone;
  file?: MfFile | null;
  relay?: number;
  from?: number;
  auto?: boolean;
}

type Row =
  | { kind: "msg"; key: string; mine: boolean; text: string; live: boolean; alarm: boolean }
  | { kind: "crack"; key: string; live: boolean; word: string }
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
    if (l.role === "user" && l.text.trim().toLowerCase() === CRACK) {
      rows.push({ kind: "crack", key: l.id, live: fresh(l), word: crackWord(l.id) });
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

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** "(218) 5??-????": the counter-trace resolving a number, digit by digit. */
function traced(num: string, pct: number) {
  const n = Math.floor((Math.min(100, pct) / 100) * num.length);
  const d = [...num].map((c, i) => (i < n ? c : "?"));
  return `(${d.slice(0, 3).join("")}) ${d.slice(3, 6).join("")}-${d.slice(6).join("")}`;
}

/* ───────── Phosphor ───────── */

type Phos = "amber" | "green" | "white";
const PHOS: { id: Phos; label: string }[] = [
  { id: "amber", label: "AMB" },
  { id: "green", label: "GRN" },
  { id: "white", label: "WHT" },
];
const PHOS_KEY = "gpty.terminal.phosphor";

function loadPhos(): Phos {
  try {
    const p = localStorage.getItem(PHOS_KEY);
    if (PHOS.some((x) => x.id === p)) return p as Phos;
  } catch {}
  return "amber";
}

/* ───────── The box ───────── */

type Link = "breach" | "up" | "down" | "dialing";

/**
 * The Mainframe, 1989, remastered: you've broken into OMNIVAC 9 and slipped
 * past six firewalls. This is the seventh and last box between you and the
 * core: a security processor with an amber console, and Shelly on the other
 * side of it. Its lamps, tapes, map and counter-trace all follow the chat.
 */
export function TerminalLayout({ costume, lines, busy, waiting, error, onSend, onStop }: LayoutProps) {
  const fw = costume.assistant;

  /* Connection */

  // The first visit breaks in; everything else opens connected.
  // `clock` is how far into the break-in we are (ms); Infinity once it's done.
  const [clock, setClock] = useState(() => (!session.breached && lines.length === 0 && !reducedMotion() ? 0 : Infinity));
  const intro = clock < Infinity;
  const [introAtMount] = useState(intro);
  const [skipped, setSkipped] = useState(false);
  const [link, setLink] = useState<Link>(() => (intro ? "breach" : "up"));
  const [upSince, setUpSince] = useState(() => {
    if (!session.start) session.start = Date.now();
    return session.start;
  });
  useEffect(() => {
    session.breached = true;
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

  /* The alarm: ACCESS DENIED on the glass, the beacon turning, every lamp red. */

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
      later(T.denied, () => raise(T.greet - T.denied)),
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

  /* History */

  // Replies already on screen when the thread opened stay put; new ones come in at 1200 baud.
  const [seen] = useState(() => new Set(lines.map((l) => l.id)));
  const [notes, setNotes] = useState<Note[]>([]);
  const [cleared, setCleared] = useState<number | null>(null);
  const streamingId = busy && lines.at(-1)?.role === "assistant" ? lines.at(-1)!.id : null;
  const rows = useMemo(
    () => toRows(costume.greeting, lines, notes, (l) => !seen.has(l.id), introAtMount, streamingId),
    [costume.greeting, lines, notes, seen, introAtMount, streamingId],
  );
  const shown = cleared === null ? rows : rows.slice(cleared);

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

  /* Traffic: what the lamps, tapes and map packets follow. */

  const [rx, setRx] = useState(false);
  const [sd, setSd] = useState(false);
  const sdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sending = useCallback((ms = 160) => {
    setSd(true);
    if (sdTimer.current) clearTimeout(sdTimer.current);
    sdTimer.current = setTimeout(() => setSd(false), ms);
  }, []);
  useEffect(
    () => () => {
      if (sdTimer.current) clearTimeout(sdTimer.current);
    },
    [],
  );
  const [noteRx, setNoteRx] = useState(0);
  const receiving = useCallback(
    (ms: number) => {
      setNoteRx((n) => n + 1);
      later(ms, () => setNoteRx((n) => n - 1));
    },
    [later],
  );

  /* The counter-trace: it creeps up while you're on, faster while Shelly talks. */

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
    (k: string, ms = 1300) => {
      setFlash(k);
      later(ms, () => setFlash((f) => (f === k ? null : f)));
    },
    [later],
  );

  const tracing = useRef(false);
  const reroute = useCallback(
    (auto = false) => {
      const from = session.relay;
      const next = (from + 1) % RELAYS.length;
      if (link !== "up" && link !== "breach") {
        if (!auto) {
          addNote({ kind: "say", cmd: "REROUTE", text: "%NET-E-NOLINK, not connected. Press RETURN to redial.", tone: "dim" });
          return;
        }
        // The line dropped before Shelly could reroute it: next call starts somewhere new.
        session.relay = next;
        setRelay(next);
        setTrace(0);
        tracing.current = false;
        return;
      }
      session.relay = next;
      setRelay(next);
      setTrace(0);
      tracing.current = false;
      addNote({ kind: "reroute", cmd: auto ? undefined : "REROUTE", relay: next, from, auto });
      sending(900);
      receiving(1700);
      lightUp("REROUTE", 1800);
      pin();
    },
    [link, addNote, sending, receiving, lightUp, pin],
  );

  // A complete trace: she has your number, and lets it go.
  const rerouteNow = useRef(reroute);
  useEffect(() => {
    rerouteNow.current = reroute;
  });
  useEffect(() => {
    if (trace < 100 || tracing.current || link !== "up") return;
    tracing.current = true;
    addNote({ kind: "traced", relay });
    receiving(1500);
    later(3400, () => rerouteNow.current(true));
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

  /* Commands */

  const offline = useCallback(
    (cmd?: string) => addNote({ kind: "say", cmd, text: "%NET-W-NOCARRIER, no connection. Press RETURN to redial.", tone: "dim" }),
    [addNote],
  );

  const hangUp = useCallback(
    (cmd = "LOGOUT") => {
      if (link === "down" || link === "dialing") return offline(cmd);
      if (busy) onStop();
      skipIntro();
      addNote({ kind: "hangup", cmd });
      sending(500);
      later(1000, () => setLink("down"));
      pin();
    },
    [link, busy, onStop, skipIntro, addNote, sending, later, pin, offline],
  );

  const redial = useCallback(() => {
    if (link !== "down") return;
    addNote({ kind: "redial", relay: session.relay });
    setLink("dialing");
    sending(500);
    receiving(1700);
    later(1500, () => {
      setLink("up");
      session.start = Date.now();
      setUpSince(session.start);
    });
    pin();
  }, [link, addNote, sending, receiving, later, pin]);

  const [cracking, setCracking] = useState(false);
  const crack = useCallback(
    (cmd = "CRACK") => {
      if (link !== "up" && link !== "breach") return offline(cmd);
      if (busy || cracking) {
        addNote({ kind: "say", cmd, text: "CRACK.EXE: line busy. SHELLY is still talking.", tone: "dim" });
        return;
      }
      skipIntro();
      setCracking(true);
      sending(700);
      onSend(CRACK);
      pin();
    },
    [link, busy, cracking, offline, addNote, skipIntro, sending, onSend, pin],
  );
  const cracked = useCallback(() => {
    setCracking(false);
    sound();
  }, [sound]);

  const interrupt = useCallback(() => {
    if (!busy) return false;
    onStop();
    addNote({ kind: "abort" });
    return true;
  }, [busy, onStop, addNote]);

  const clear = useCallback(() => setCleared(rows.length), [rows.length]);
  const scrollBack = useCallback(() => {
    setCleared(null);
    stuck.current = false;
    requestAnimationFrame(() => log.current?.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" }));
  }, []);

  /** Runs a console command. False if it isn't one, so it goes to Shelly. */
  const exec = useCallback(
    (raw: string): boolean => {
      const words = raw.trim().split(/\s+/);
      if (words.length > 3) return false;
      const c = words[0].toUpperCase();
      const arg = words.slice(1).join(" ").toUpperCase();
      const cmd = raw.trim();
      const up = link === "up" || link === "breach";
      const local = (n: Omit<Note, "id" | "after">, rx = 500) => {
        if (!up) return offline(cmd);
        skipIntro();
        addNote({ cmd, ...n });
        receiving(rx);
        pin();
      };
      const open = (f: MfFile | null | undefined) => {
        if (f?.deny && up) {
          skipIntro();
          sound();
        }
        local({ kind: "file", file: f ?? null, text: arg }, 900);
      };
      switch (c) {
        case "HELP":
        case "?":
          if (arg) return false;
          local({ kind: "help" });
          return true;
        case "DIR":
        case "LS":
          if (/CORE/.test(arg)) open(findFile("CORE"));
          else local({ kind: "dir" }, 900);
          return true;
        case "TYPE":
        case "CAT":
        case "MORE":
          if (!arg) return false;
          open(findFile(arg));
          return true;
        case "CD":
          if (!/CORE/.test(arg)) return false;
          open(findFile("CORE"));
          return true;
        case "WHO":
        case "USERS":
          if (arg) return false;
          local({ kind: "who" }, 900);
          return true;
        case "FINGER":
          if (arg && !/^SHELLY/.test(arg)) return false;
          local(arg ? { kind: "plan" } : { kind: "who" }, 900);
          return true;
        case "CRACK":
        case "CRACK.EXE":
          if (arg) return false;
          crack(cmd);
          return true;
        case "REROUTE":
          if (arg) return false;
          skipIntro();
          reroute();
          return true;
        case "CLS":
        case "CLEAR":
          if (arg) return false;
          clear();
          return true;
        case "LOGOUT":
        case "LOGOFF":
        case "LO":
        case "EXIT":
          if (arg) return false;
          hangUp(cmd);
          return true;
      }
      return false;
    },
    [link, offline, skipIntro, addNote, receiving, pin, sound, crack, reroute, clear, hangUp],
  );

  /* Phosphor */

  const [phos, setPhos] = useState<Phos>(loadPhos);
  const pickPhos = (p: Phos) => {
    setPhos(p);
    try {
      localStorage.setItem(PHOS_KEY, p);
    } catch {}
  };

  /* Composer */

  const input = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");
  const recall = useRef(-1);
  /** Back to the prompt, but only with a mouse: on a phone, focusing pops the keyboard over the screen. */
  const focusInput = useCallback(() => {
    if (window.matchMedia("(pointer: fine)").matches) requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
  }, []);
  useEffect(() => focusInput(), [focusInput]);

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
    if (busy || cracking) return;
    skipIntro();
    sending(Math.min(1400, 120 + t.length * 8));
    onSend(t);
    setValue("");
    pin();
  };

  /** A front-panel key: typed at the prompt for you, then run. */
  const press = (cmd: string) => {
    if (cmd === "LOGOUT" && link === "down") redial();
    else {
      if (session.history.at(-1) !== cmd) session.history.push(cmd);
      exec(cmd);
    }
    focusInput();
  };

  const abort = () => {
    if (!interrupt()) hangUp("ABORT");
    focusInput();
  };

  /* Keyboard: F1, Ctrl-L, and any key skips the break-in */

  const keys = useRef({ skipIntro, exec, clear, intro });
  useEffect(() => {
    keys.current = { skipIntro, exec, clear, intro };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = keys.current;
      if (k.intro && !["Alt", "Shift", "Control", "Meta"].includes(e.key)) k.skipIntro();
      if (e.key === "F1") {
        e.preventDefault();
        k.exec("HELP");
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

  const active = busy || rx || noteRx > 0 || link === "dialing" || (intro && clock < T.denied);
  const lamps = link === "down" ? "off" : alarm ? "alarm" : active || cracking ? "busy" : "idle";
  const tape = link === "down" ? "stop" : alarm ? "rewind" : active || cracking ? "run" : "idle";
  const flow = sd ? "down" : busy || rx || noteRx > 0 ? "up" : null;
  const status =
    link === "breach" ? "BREACH" : link === "dialing" ? "DIALING" : link === "down" ? "NO CARRIER" : alarm ? "ALARM" : busy || rx ? "RECEIVING" : sd ? "SENDING" : "READY";
  const r = RELAYS[relay];
  const reflection = art("reflection");
  const steel = art("steel");

  return (
    <div className={`mf ${mfFonts}`} data-phos={phos} data-alarm={alarm || undefined} data-link={link}>
      <div
        className="mf-cab"
        style={v({
          maxWidth: costume.window.w,
          maxHeight: costume.window.h,
          ...(steel ? { "--mf-steel": `url(${steel})` } : {}),
        })}
      >
        <i className="mf-screw mf-screw-tl" aria-hidden />
        <i className="mf-screw mf-screw-tr" aria-hidden />
        <i className="mf-screw mf-screw-bl" aria-hidden />
        <i className="mf-screw mf-screw-br" aria-hidden />

        <header className="mf-head">
          <div className="mf-badge">
            <b>{costume.app}</b>
            <small>
              Security Processor<span className="mf-wide"> · Model FW-7</span>
            </small>
          </div>
          <Lamps mode={lamps} />
          <div className="mf-head-end">
            <span className="mf-serial mf-wide" aria-hidden>
              FW-7 &quot;{fw}&quot;
              <br />
              SER 000007 · 1989
            </span>
            <Beacon on={alarm} />
          </div>
        </header>

        <div className="mf-body">
          <div className="mf-bay">
            <div className="mf-glass">
              <div className={`mf-screen ${intro ? "mf-intro" : ""}`} onPointerDown={skipIntro}>
                <div className="mf-top">
                  <span className="truncate">
                    OMNIVAC 9<span className="mf-wide"> · FW-7 SECURE CONSOLE</span> · TTY07
                  </span>
                  <Clock />
                </div>

                <div ref={log} className="mf-log" aria-live="polite" onClick={focusInput}>
                  <div ref={inner} className="mf-log-inner">
                    {cleared === null ? (
                      <Breach clock={clock} relay={r} />
                    ) : (
                      <button type="button" className="mf-link mf-hint" onClick={scrollBack}>
                        [SCROLL BACK]
                      </button>
                    )}

                    {shown.map((row) =>
                      row.key === "greeting" && clock < T.greet ? null : row.kind === "crack" ? (
                        <Crack key={row.key} word={row.word} live={row.live} onDone={cracked} />
                      ) : row.kind === "note" ? (
                        <NoteBlock key={row.key} note={row.note} fw={fw} onRun={press} />
                      ) : row.mine ? (
                        <div key={row.key} className="mf-msg mf-mine">
                          <span className="mf-ps1">$</span>
                          <span className="mf-text">{row.text}</span>
                        </div>
                      ) : (
                        <div key={row.key} className="mf-msg mf-theirs">
                          {row.alarm && (
                            <div className="mf-alarm-line">
                              <span>!! INTRUSION ALARM · COUNTERMEASURES ENGAGED !!</span>
                            </div>
                          )}
                          <span className="mf-who">{fw}:</span>
                          <span className="mf-text">
                            <Baud
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
                      <div className="mf-msg mf-theirs">
                        <span className="mf-who">{fw}:</span>
                        <span className="mf-text">
                          <span className="t-dim">{costume.typing}</span>
                          <span className="mf-dots" aria-hidden>
                            ...
                          </span>
                          <i className="mf-cursor" />
                        </span>
                      </div>
                    )}
                    {error && (
                      <div className="mf-sys">
                        <span className="t-bad">{costume.error}</span>
                        <span className="t-dim"> Send again to retry.</span>
                      </div>
                    )}
                  </div>
                </div>

                <CommandLine
                  inputRef={input}
                  value={value}
                  onChange={(t) => {
                    setValue(t);
                    recall.current = -1;
                    sending();
                  }}
                  onKeyDown={onKeyDown}
                  label={`Command, or a question for ${fw}`}
                  hint={
                    link === "down"
                      ? "NO CARRIER · RETURN TO REDIAL"
                      : link === "dialing"
                        ? "DIALING..."
                        : intro
                          ? "BREAKING IN... PRESS ANY KEY TO SKIP"
                          : busy
                            ? "^C TO INTERRUPT"
                            : "ASK SHELLY ANYTHING, OR TYPE HELP"
                  }
                />

                <div className="mf-status">
                  <button type="button" onClick={() => press("HELP")}>
                    F1 HELP
                  </button>
                  <span className="mf-wide">{BAUD} 8N1</span>
                  <span className="mf-narrow-hide">VT100</span>
                  <span className={status === "NO CARRIER" || status === "ALARM" ? "mf-st-bad" : undefined}>{status}</span>
                  <span className="mf-st-trace">TRACE {Math.floor(trace)}%</span>
                  <span className="ml-auto border-l-0">{link === "up" ? <OnLine since={upSince} /> : link === "down" ? "OFF-LINE" : "--:--:--"}</span>
                </div>
              </div>

              {denied > 0 && <Denied key={denied} onDone={hideDenied} />}

              {/* The tube: scanlines, flicker, the refresh band, curvature, glare, the room in the glass. */}
              <div className="mf-fx" aria-hidden>
                <i className="mf-fx-scan" />
                <i className="mf-fx-roll" />
                <i className="mf-fx-curve" />
                {reflection ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={reflection} alt="" className="mf-fx-photo" />
                ) : (
                  <i className="mf-fx-room" />
                )}
                <i className="mf-fx-glare" />
              </div>
            </div>
          </div>

          <aside className="mf-side" aria-label="Intrusion status">
            <Route relay={r} flow={flow} alarm={alarm} link={link} />
            <TraceMeter pct={trace} relay={r} onReroute={() => press("REROUTE")} lit={flash === "REROUTE"} />
            <Tape mode={tape} />
          </aside>
        </div>

        <FrontPanel
          link={link}
          busy={busy}
          cracking={cracking}
          flash={flash}
          phos={phos}
          onPhos={pickPhos}
          onPress={press}
          onAbort={abort}
        />
      </div>
    </div>
  );
}

/* ───────── On the screen ───────── */

/** What the console shows above the chat: the break-in, as it happened. */
function Breach({ clock, relay }: { clock: number; relay: (typeof RELAYS)[number] }) {
  const has = (at: number) => clock >= at;
  return (
    <div className="mf-pre">
      <div className="t-cmd">
        <span className="mf-typed" style={v({ "--n": 4 + NUMBER.length })}>
          ATDT {NUMBER}
        </span>
      </div>
      {has(T.ring) && <div className="t-dim">RINGING...</div>}
      {has(T.connect) && <div>CONNECT {BAUD}</div>}
      {has(T.net) && (
        <div>
          TYMNET: HOST OMNIVAC9 · LINE 07 · <span className="t-hi">CONNECTED</span>
        </div>
      )}
      {has(T.route) && (
        <div className="t-dim">
          RELAY: {relay.place} · {relay.where}. ROUTING THRU 7 FIREWALLS.
        </div>
      )}
      <div className="mf-fws">
        {Array.from({ length: 6 }, (_, i) =>
          has(T.fw + i * FW_STEP) ? (
            <div key={i} className="mf-fw">
              <span>FW-{i + 1}</span>
              <span className="mf-bar" style={v({ "--fill": 1 })}>
                <i />
              </span>
              <span className="t-hi">BYPASSED</span>
            </div>
          ) : null,
        )}
        {has(T.halt) && (
          <div className="mf-fw">
            <span>FW-7</span>
            <span className="mf-bar mf-bar-halt" style={v({ "--fill": 0.4 })}>
              <i />
            </span>
            <span className="mf-inverse mf-blink-in">HALTED</span>
          </div>
        )}
      </div>
      {has(T.denied) && <div className="mf-inverse mf-denied-line">ACCESS DENIED</div>}
      {has(T.logo) && (
        <div className="mf-logo-wrap" role="img" aria-label="SHELLY: firewall 7 of 7, OMNIVAC 9 security processor">
          <BigText text="SHELLY" paint={clock < Infinity} className="mf-logo" />
          <div className="mf-logo-sub">FIREWALL 7 OF 7 · OMNIVAC 9 SECURITY PROCESSOR</div>
        </div>
      )}
      {has(T.banner) && (
        <div className="mf-banner">
          <span>*** FW-7 HAS TAKEN THE LINE ***</span>
        </div>
      )}
    </div>
  );
}

/**
 * A reply as it comes down the wire: 120 characters a second, the cursor
 * riding along. If the model outruns the line it catches up, so it's never
 * more than a second or so behind.
 */
function Baud({
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

  return (
    <>
      {text.slice(0, shown)}
      {(typing || streaming) && <i className="mf-cursor" />}
    </>
  );
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*@!?";

/**
 * CRACK.EXE against the core: ten characters spinning, locking in one at a
 * time, the way it does in the movies. It always finds the code. The code is
 * always an insult.
 */
function Crack({ word, live, onDone }: { word: string; live: boolean; onDone: () => void }) {
  const [locked, setLocked] = useState(() => (live && !reducedMotion() ? 0 : word.length));
  const [spin, setSpin] = useState(0);
  const done = locked >= word.length;
  useEffect(() => {
    if (done) return;
    const a = setInterval(() => setSpin((s) => s + 1), 55);
    const b = setInterval(() => setLocked((n) => n + 1), 340);
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
  const tries = (1_048_576 + spin * 27_183 + locked * 314_159).toLocaleString("en-US");
  return (
    <div className="mf-crack">
      <div className="mf-echo">
        <span className="mf-ps1">$</span> RUN CRACK.EXE /TARGET=[CORE]
      </div>
      <div className="t-dim">CRACK.EXE V1.3 · BRUTE FORCE · CORE ACCESS CODE (10 CHARS)</div>
      <div className="mf-slots" aria-label={done ? `Code found: ${word}` : "Cracking"}>
        {[...word].map((ch, i) => {
          const on = i < locked;
          const c = on ? ch : GLYPHS[(spin * 7 + i * 13 + ((spin * (i + 3)) % 11)) % GLYPHS.length];
          return (
            <span key={i} className="mf-slot" data-on={on} data-new={on && i === locked - 1 && !done ? true : undefined}>
              {c === " " ? " " : c}
            </span>
          );
        })}
      </div>
      {done ? (
        <>
          <div>
            CODE FOUND: <span className="t-hi">&quot;{word}&quot;</span> · SUBMITTING... <span className="mf-inverse">REJECTED</span>
          </div>
          <div className="t-dim">%CRACK-F-REFUSED, the core did not like your tone.</div>
        </>
      ) : (
        <div className="t-dim">
          TRYING {tries} COMBINATIONS<span className="mf-dots">...</span>
        </div>
      )}
    </div>
  );
}

function ToneLine({ text, tone, at }: { text: React.ReactNode; tone?: Tone; at?: number }) {
  return (
    <div className={`mf-step ${tone ? `t-${tone}` : ""}`} style={v({ "--at": `${at ?? 0}ms` })}>
      {text}
    </div>
  );
}

const HELP: [string, string, string, string?][] = [
  ["HELP", "this list", "HELP", "F1"],
  ["DIR", "list the files on OMNIVAC 9", "DIR"],
  ["TYPE file", "print a file", "DIR"],
  ["WHO", "who else is logged on", "WHO"],
  ["FINGER SHELLY", "read her .plan", "FINGER SHELLY"],
  ["CRACK", "brute-force the core's access code", "CRACK"],
  ["REROUTE", "bounce your line through a new relay", "REROUTE"],
  ["CLS", "clear the screen", "CLS", "Ctrl-L"],
  ["LOGOUT", "hang up", "LOGOUT"],
];

/** Something the console printed between messages. */
function NoteBlock({ note, fw, onRun }: { note: Note; fw: string; onRun: (cmd: string) => void }) {
  return (
    <div className="mf-sys">
      {note.cmd && (
        <div className="mf-echo">
          <span className="mf-ps1">$</span> {note.cmd.toUpperCase()}
        </div>
      )}
      <NoteBody note={note} fw={fw} onRun={onRun} />
    </div>
  );
}

function NoteBody({ note, fw, onRun }: { note: Note; fw: string; onRun: (cmd: string) => void }) {
  switch (note.kind) {
    case "say":
      return <div className={`t-${note.tone ?? "ok"}`}>{note.text}</div>;
    case "abort":
      return (
        <>
          <div className="t-cmd">^C</div>
          <div className="t-dim">%SYSTEM-W-ABORT, {fw} interrupted. She noticed.</div>
        </>
      );
    case "help":
      return (
        <Box title="FW-7 CONSOLE · COMMANDS">
          <div className="mf-help">
            {HELP.map(([k, label, run, key]) => (
              <button key={k} type="button" className="mf-link mf-help-row" onClick={() => onRun(run)}>
                <span className="t-hi">{k}</span>
                <span>{label}</span>
                <span className="t-dim mf-wide">{key ?? ""}</span>
              </button>
            ))}
            <div className="mf-help-row">
              <span className="t-hi">^C</span>
              <span>interrupt {fw}</span>
              <span className="t-dim mf-wide">Ctrl-C</span>
            </div>
          </div>
          <div className="t-dim mf-box-foot">Anything else goes straight to {fw}. ↑ recalls your last command.</div>
        </Box>
      );
    case "dir":
      return (
        <div className="mf-dir">
          <div className="t-dim">Directory OMNIVAC9$DUA0:[PUBLIC]</div>
          <div className="mf-dir-rows">
            {FILES.map((f) => (
              <div key={f.id} className="mf-dir-row">
                <button type="button" className="mf-link" onClick={() => onRun(`TYPE ${f.id}`)}>
                  {f.name}
                </button>
                <span className="mf-dir-n">{f.blocks}</span>
                <span className="t-dim mf-wide">{f.date}</span>
              </div>
            ))}
          </div>
          <div className="t-dim">Total of {FILES.length} files, 4,199 blocks. Click one to TYPE it.</div>
        </div>
      );
    case "file": {
      const f = note.file;
      if (!f)
        return (
          <>
            <div className="t-bad">%TYPE-W-SEARCHFAIL, error searching for OMNIVAC9$DUA0:[PUBLIC]{note.text}</div>
            <div className="t-dim">-RMS-E-FNF, file not found. Try DIR.</div>
          </>
        );
      return (
        <div className={f.tone ? `t-${f.tone}` : "mf-file"}>
          {f.body.map((l, i) => (
            <div key={i}>{l || " "}</div>
          ))}
        </div>
      );
    }
    case "who":
      return (
        <div>
          <div className="t-dim">OMNIVAC 9 · VAX/VMS V5.1 · {WHO.length} USERS</div>
          <table className="mf-table">
            <thead>
              <tr>
                <th>USERNAME</th>
                <th>TERM</th>
                <th className="mf-wide">IDLE</th>
                <th>WHAT</th>
              </tr>
            </thead>
            <tbody>
              {WHO.map(([u, t, i, w]) => (
                <tr key={u} className={u === "SHELLY" ? "t-hi" : u === "???" ? "t-cmd" : undefined}>
                  <td>{u}</td>
                  <td>{t}</td>
                  <td className="mf-wide">{i}</td>
                  <td>{w}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "plan":
      return (
        <div className="mf-file">
          {PLAN.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      );
    case "reroute": {
      const from = RELAYS[note.from ?? 0];
      const to = RELAYS[note.relay ?? 0];
      return (
        <>
          {note.auto && <ToneLine text={`${fw} IS REROUTING YOU. ON THE HOUSE.`} tone="hi" />}
          <ToneLine text="REROUTING..." tone="cmd" at={note.auto ? 300 : 0} />
          <ToneLine text={`DROPPING RELAY: ${from.place} · ${from.where}`} tone="dim" at={450} />
          <ToneLine text={`DIALING ${traced(to.num, 100)} ... CONNECT ${BAUD}`} at={900} />
          <ToneLine text={`NEW RELAY: ${to.place} · ${to.where}`} tone="hi" at={1350} />
          <ToneLine text="COUNTER-TRACE LOST YOUR LINE. 0%" tone="ok" at={1650} />
        </>
      );
    }
    case "traced": {
      const r = RELAYS[note.relay ?? 0];
      return (
        <>
          <ToneLine text={<span className="mf-inverse">*** COUNTER-TRACE COMPLETE ***</span>} />
          <ToneLine text={`ORIGIN: ${r.place} · ${r.where} · ${traced(r.num, 100)}`} at={500} />
          <ToneLine text={`${fw}: Relax. I'm a firewall, not the police.`} tone="hi" at={1200} />
        </>
      );
    }
    case "hangup":
      return (
        <>
          <ToneLine text="+++" tone="cmd" />
          <ToneLine text="OK" at={350} />
          <ToneLine text="ATH0" tone="cmd" at={550} />
          <ToneLine text={<span className="mf-inverse">NO CARRIER</span>} at={950} />
          <ToneLine text="CONNECTION TO OMNIVAC9 CLOSED. PRESS RETURN TO REDIAL." tone="dim" at={1150} />
        </>
      );
    case "redial": {
      const r = RELAYS[note.relay ?? 0];
      return (
        <>
          <ToneLine text={`ATDT ${NUMBER}`} tone="cmd" />
          <ToneLine text="RINGING..." tone="dim" at={450} />
          <ToneLine text={`CONNECT ${BAUD} · RELAY ${r.place} · FW 1-6 BYPASSED`} at={1100} />
          <ToneLine text={`${fw}: Back already? I didn't even get to miss you.`} tone="hi" at={1500} />
        </>
      );
    }
  }
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mf-box">
      <header>
        <span>{title}</span>
      </header>
      {children}
    </section>
  );
}

/** ACCESS DENIED, big, flashing, across the glass. */
function Denied({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1900);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="mf-denied" role="alert" aria-label="Access denied">
      <div className="mf-denied-box">
        <BigText text="ACCESS" className="mf-denied-big" />
        <BigText text="DENIED" className="mf-denied-big" />
        <small>FW-7 · INTRUSION COUNTERMEASURES ENGAGED</small>
      </div>
    </div>
  );
}

/**
 * The prompt: a textarea under a mirror of itself that draws the block
 * cursor where the caret is, solid while it has focus, hollow when it doesn't.
 */
function CommandLine({
  inputRef,
  value,
  onChange,
  onKeyDown,
  label,
  hint,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  label: string;
  hint: string;
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
    <div className="mf-cmd">
      <label htmlFor="mf-input" className="mf-ps1">
        $
      </label>
      <div className="mf-field">
        <textarea
          id="mf-input"
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
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          aria-label={label}
        />
        <div ref={mirror} className="mf-mirror" aria-hidden>
          {value.slice(0, at)}
          <i className={`mf-cursor mf-caret ${focus ? "" : "mf-caret-idle"}`}>{under && under !== "\n" ? under : " "}</i>
          {under === "\n" ? value.slice(at) : value.slice(at + 1)}
        </div>
        {!value && (
          <span className="mf-hint-in" aria-hidden>
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}

/* ───────── Live bits of the status lines ───────── */

function Clock() {
  const now = new Date(useNow(15_000));
  return (
    <span className="shrink-0">
      {pad(now.getMonth() + 1)}-{pad(now.getDate())}-89 {pad(now.getHours())}:{pad(now.getMinutes())}
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

/* ───────── The cabinet ───────── */

const LAMP_ROWS = 3;
const LAMP_COLS = 18;
/** Every lamp's own rhythm, the same on every visit. */
const LAMPS = (() => {
  const r = rand(1989);
  return Array.from({ length: LAMP_ROWS * LAMP_COLS }, () => {
    const pick = r();
    return {
      d: 0.5 + r() * 2.6,
      dl: -r() * 5,
      c: pick < 0.1 ? "r" : pick < 0.18 ? "g" : "a",
      steady: r() < 0.1,
    };
  });
})();
const LAMP_GROUPS = ["ADDRESS", "DATA", "STATUS"];

/** The blinkenlights: three rows of incandescent lamps showing the box at work. */
function Lamps({ mode }: { mode: "off" | "idle" | "busy" | "alarm" }) {
  return (
    <div className="mf-lamps" data-mode={mode} role="img" aria-label={`Front panel lamps: ${mode}`}>
      {Array.from({ length: LAMP_ROWS }, (_, row) => (
        <div key={row} className="mf-lamp-row">
          {LAMPS.slice(row * LAMP_COLS, (row + 1) * LAMP_COLS).map((l, i) => (
            <i
              key={i}
              className="mf-lamp"
              data-c={l.c}
              data-steady={l.steady || undefined}
              data-g={Math.floor(i / 6)}
              style={v({ "--d": `${l.d.toFixed(2)}s`, "--dl": `${l.dl.toFixed(2)}s` })}
            />
          ))}
        </div>
      ))}
      <div className="mf-lamp-labels" aria-hidden>
        {LAMP_GROUPS.map((g, i) => (
          <span key={g} data-g={i}>
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}

function Beacon({ on }: { on: boolean }) {
  return (
    <span className="mf-beacon" data-on={on} aria-hidden>
      <i className="mf-beacon-dome" />
      <i className="mf-beacon-beam" />
    </span>
  );
}

/** The intrusion map: your route in, the six fallen firewalls, Shelly, and the core behind her. */
function Route({
  relay,
  flow,
  alarm,
  link,
}: {
  relay: (typeof RELAYS)[number];
  flow: "up" | "down" | null;
  alarm: boolean;
  link: Link;
}) {
  const down = link === "down";
  return (
    <section className="mf-mod mf-map">
      <h3>Intrusion Map</h3>
      <div className="mf-scope">
        <ol className="mf-route" data-flow={down ? undefined : flow ?? undefined} data-down={down || undefined}>
          <li className="mf-node">
            <span className="mf-ico">
              <i className="mf-ico-you" />
            </span>
            <span className="mf-node-t">
              <b>YOU</b>
              <small>
                {relay.place} · {relay.where}
              </small>
            </span>
          </li>
          <li className="mf-wire" aria-hidden />
          <li className="mf-node">
            <span className="mf-ico">
              <i className="mf-ico-net" />
            </span>
            <span className="mf-node-t">
              <b>TYMNET</b>
              <small>X.25 PUBLIC DATA NETWORK</small>
            </span>
          </li>
          <li className="mf-wire" aria-hidden />
          <li className="mf-node">
            <span className="mf-ico">
              <span className="mf-ico-fws">
                {Array.from({ length: 6 }, (_, i) => (
                  <i key={i} />
                ))}
              </span>
            </span>
            <span className="mf-node-t">
              <b>FW 1-6</b>
              <small>BREACHED</small>
            </span>
          </li>
          <li className="mf-wire" aria-hidden />
          <li className="mf-node mf-node-fw">
            <span className="mf-ico">
              <Cube />
            </span>
            <span className="mf-node-t">
              <b>FW-7 · SHELLY</b>
              <small>{down ? "IDLE" : alarm ? "COUNTERMEASURES" : "HOLDING"}</small>
            </span>
          </li>
          <li className="mf-wire mf-wire-locked" aria-hidden />
          <li className="mf-node mf-node-core">
            <span className="mf-ico">
              <i className="mf-ico-core" />
            </span>
            <span className="mf-node-t">
              <b>CORE</b>
              <small>LOCKED</small>
            </span>
          </li>
        </ol>
      </div>
    </section>
  );
}

const SEGS = 20;

/** The counter-trace: a lamp bar, your relay's number resolving digit by digit, and a way out. */
function TraceMeter({
  pct,
  relay,
  onReroute,
  lit,
}: {
  pct: number;
  relay: (typeof RELAYS)[number];
  onReroute: () => void;
  lit: boolean;
}) {
  const on = Math.round((Math.min(100, pct) / 100) * SEGS);
  const done = pct >= 100;
  return (
    <section className="mf-mod mf-trace" data-done={done || undefined}>
      <h3>Counter-Trace</h3>
      <div className="mf-trace-bar" role="meter" aria-label="Counter-trace" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(pct)}>
        {Array.from({ length: SEGS }, (_, i) => (
          <i key={i} data-on={i < on || undefined} data-z={i < 11 ? 0 : i < 16 ? 1 : 2} />
        ))}
      </div>
      <div className="mf-trace-read">
        <span>{traced(relay.num, pct)}</span>
        <b>{Math.floor(pct)}%</b>
      </div>
      <div className="mf-trace-row">
        <span className="mf-trace-where">{done ? `${relay.place} · ${relay.where}` : pct > 60 ? "CLOSING IN..." : "LOCATING..."}</span>
        <button type="button" className="mf-key mf-key-sm" style={v({ "--k": "90,255,140" })} data-lit={lit || undefined} onClick={onReroute}>
          <span>REROUTE</span>
        </button>
      </div>
    </section>
  );
}

/** Tape drive 0, behind smoked glass. The reels follow the work. */
function Tape({ mode }: { mode: "stop" | "idle" | "run" | "rewind" }) {
  return (
    <section className="mf-mod mf-tape" data-tape={mode}>
      <h3>Tape 0 · Transport</h3>
      <div className="mf-tape-win">
        <Reel pack={0.86} className="mf-reel mf-reel-l" />
        <Reel pack={0.34} className="mf-reel mf-reel-r" />
        <svg className="mf-tape-path" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden>
          <path d="M28 84 L92 96 L108 96 L178 74" fill="none" stroke="#3a2a1c" strokeWidth="1.4" />
          <rect x="88" y="92" width="24" height="8" rx="1.5" fill="#6d7680" />
        </svg>
        <i className="mf-tape-glare" />
      </div>
    </section>
  );
}

const KEYS: { cmd: string; label: string; rgb: string }[] = [
  { cmd: "HELP", label: "HELP", rgb: "232,238,245" },
  { cmd: "DIR", label: "DIR", rgb: "255,176,40" },
  { cmd: "WHO", label: "WHO", rgb: "255,176,40" },
  { cmd: "CRACK", label: "CRACK", rgb: "255,70,50" },
  { cmd: "REROUTE", label: "RE-ROUTE", rgb: "90,255,140" },
  { cmd: "CLS", label: "CLEAR", rgb: "232,238,245" },
  { cmd: "LOGOUT", label: "LOG OUT", rgb: "255,70,50" },
];

/** The console's front panel: lit pushbuttons, the phosphor selector and the big red button. */
function FrontPanel({
  link,
  busy,
  cracking,
  flash,
  phos,
  onPhos,
  onPress,
  onAbort,
}: {
  link: Link;
  busy: boolean;
  cracking: boolean;
  flash: string | null;
  phos: Phos;
  onPhos: (p: Phos) => void;
  onPress: (cmd: string) => void;
  onAbort: () => void;
}) {
  const idx = PHOS.findIndex((p) => p.id === phos);
  return (
    <div className="mf-panel">
      <div className="mf-keys" role="toolbar" aria-label="Console functions">
        {KEYS.map((k) => {
          const dial = k.cmd === "LOGOUT" && (link === "down" || link === "dialing");
          const lit = (k.cmd === "CRACK" && cracking) || flash === k.cmd || dial;
          return (
            <button
              key={k.cmd}
              type="button"
              className="mf-key"
              style={v({ "--k": dial ? "90,255,140" : k.rgb })}
              data-lit={lit || undefined}
              data-blink={(k.cmd === "CRACK" && cracking) || link === "dialing" ? true : undefined}
              onClick={() => onPress(k.cmd)}
              title={dial ? "Redial" : k.cmd}
            >
              <span>{dial ? "DIAL" : k.label}</span>
            </button>
          );
        })}
      </div>

      <span className="mf-vent" aria-hidden />

      <div className="mf-rotary" role="radiogroup" aria-label="Phosphor">
        {PHOS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={p.id === phos}
            className="mf-rotary-pos"
            data-i={i}
            onClick={() => onPhos(p.id)}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          className="mf-rotary-knob"
          style={v({ "--rot": `${(idx - 1) * 42}deg` })}
          onClick={() => onPhos(PHOS[(idx + 1) % PHOS.length].id)}
          aria-label={`Phosphor: ${phos}. Turn to the next.`}
        >
          <i />
        </button>
        <small>Phosphor</small>
      </div>

      <span className="mf-warn mf-wide" aria-hidden>
        Authorized
        <br />
        personnel only
      </span>

      <div className="mf-abort-wrap">
        <button
          type="button"
          className="mf-abort"
          onClick={onAbort}
          aria-label={busy ? "Abort: interrupt Shelly" : "Abort: hang up"}
          title={busy ? "Interrupt (Ctrl-C)" : "Emergency hang-up"}
        >
          <i />
        </button>
        <small>Abort</small>
      </div>
    </div>
  );
}

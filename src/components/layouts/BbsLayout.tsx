"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { art, Floppy, KnobMark, PixelArt, PowerMark, SPLASH, splashGrid } from "@/components/bbs/art";
import "@/components/bbs/bbs.css";
import { useNow } from "./hooks";
import type { ChatLine, LayoutProps } from "./types";

/* ───────── The line ───────── */

const PHONE = "1-555-0193";
const BAUD = 2400;
/** 2400 baud is 240 characters a second: fast to read along, slow enough to see. */
const CPS = BAUD / 10;
const CONNECT = `CONNECT ${BAUD}/ARQ/V42BIS`;

/**
 * The first visit dials in, paints the ANSI splash and logs in, once. After
 * that the screen opens connected. Module state, so it survives switching
 * threads (each thread remounts the layout).
 */
const session = { dialed: false, start: 0, monitorOn: true };

/** When each piece of the first-visit connection appears, in ms. */
const SPLASH_ROWS = SPLASH.h / 2;
const T = {
  ok: 280,
  atdt: 520,
  ring: 1250,
  connect: 1900,
  paint: 2080,
  paintRow: 105,
  info: 2080 + SPLASH_ROWS * 105 + 120,
  login: 2080 + SPLASH_ROWS * 105 + 280,
  loginStep: 170,
  banner: 2080 + SPLASH_ROWS * 105 + 1000,
  greet: 2080 + SPLASH_ROWS * 105 + 1200,
};
/** Every moment something new arrives during the dial-in. */
const BEATS = [
  T.ok, T.atdt, T.ring, T.connect,
  ...Array.from({ length: SPLASH_ROWS }, (_, i) => T.paint + i * T.paintRow),
  T.info,
  ...Array.from({ length: 4 }, (_, i) => T.login + i * T.loginStep),
  T.banner, T.greet,
];

/* ───────── What the BBS has in it ───────── */

interface DialEntry {
  id: string;
  name: string;
  number: string;
  baud: string;
  last: string;
  /** What the modem says, in order, with a ms delay before each. */
  script: { at: number; text: string; tone?: Tone }[];
  connects?: boolean;
}

type Tone = "cmd" | "ok" | "warn" | "bad" | "dim" | "hi";

const DIRECTORY: DialEntry[] = [
  {
    id: "midnight",
    name: "MIDNIGHT BBS",
    number: PHONE,
    baud: "2400 N81",
    last: "Today",
    connects: true,
    script: [
      { at: 0, text: `ATDT ${PHONE}`, tone: "cmd" },
      { at: 650, text: "RINGING" },
      { at: 1500, text: CONNECT, tone: "ok" },
      { at: 1750, text: "Welcome back! The SysOp is still here. Type away.", tone: "hi" },
    ],
  },
  {
    id: "bitbucket",
    name: "THE BIT BUCKET",
    number: "1-555-0142",
    baud: "2400 N81",
    last: "10-31-93",
    script: [
      { at: 0, text: "ATDT 1-555-0142", tone: "cmd" },
      { at: 900, text: "BUSY", tone: "warn" },
      { at: 1150, text: "It's always busy. Try again around 3am.", tone: "dim" },
    ],
  },
  {
    id: "keep",
    name: "DRAGON'S KEEP",
    number: "1-555-0177",
    baud: "14400 N81",
    last: "10-12-93",
    script: [
      { at: 0, text: "ATDT 1-555-0177", tone: "cmd" },
      { at: 650, text: "RINGING" },
      { at: 1450, text: "RINGING" },
      { at: 2250, text: "RINGING" },
      { at: 3000, text: "NO ANSWER", tone: "warn" },
      { at: 3250, text: "The SysOp unplugs it when he goes to bed.", tone: "dim" },
    ],
  },
  {
    id: "library",
    name: "COUNTY LIBRARY CATALOG",
    number: "1-555-0110",
    baud: "1200 E71",
    last: "09-02-93",
    script: [
      { at: 0, text: "ATDT 1-555-0110", tone: "cmd" },
      { at: 650, text: "RINGING" },
      { at: 1400, text: "CONNECT 1200", tone: "ok" },
      { at: 1700, text: "~}{#%^&|@*!~ +++ ]][}{~#  &%@ ~~" },
      { at: 2050, text: "NO CARRIER", tone: "bad" },
      { at: 2300, text: "Line noise. Someone picked up the phone.", tone: "dim" },
    ],
  },
  {
    id: "party",
    name: "PARTY LINE",
    number: "1-900-555-0123",
    baud: "VOICE",
    last: "Never",
    script: [
      { at: 0, text: "ATDT 1-900-555-0123", tone: "cmd" },
      { at: 700, text: "ERROR", tone: "bad" },
      { at: 950, text: "900 numbers are blocked on this line. (Thanks, Dad.)", tone: "dim" },
    ],
  },
  {
    id: "dad",
    name: "DAD'S WORK - DO NOT DIAL",
    number: "1-555-0100",
    baud: "VOICE",
    last: "Never",
    script: [
      { at: 0, text: "ATDT 1-555-0100", tone: "cmd" },
      { at: 650, text: "RINGING" },
      { at: 1300, text: "VOICE", tone: "warn" },
      { at: 1600, text: '"Hello? ...Hello? Is this the modem again?"', tone: "hi" },
      { at: 2100, text: "NO CARRIER", tone: "bad" },
    ],
  },
];

const FILES = [
  { name: "ANSIPK93.ZIP", size: "412K", date: "10-29-93", desc: "Best ANSI art of '93. 40 screens!" },
  { name: "MODEMFAQ.TXT", size: "38K", date: "09-14-93", desc: "Why does my modem scream? Read this." },
  { name: "DRAGONTP.ZIP", size: "12K", date: "11-02-93", desc: "How to beat the basement dragon." },
  { name: "STARFLD.ZIP", size: "330K", date: "08-02-93", desc: "Starfield screen saver. Warp speed!" },
  { name: "DALEMIX.MOD", size: "1.2M", date: "11-01-93", desc: "Dale's tracker tune. 4 channels of pure fire." },
  { name: "BBSLIST.TXT", size: "9K", date: "11-05-93", desc: "Every BBS in the 555 area code." },
];

const DOORS = [
  { name: "LEGEND OF THE BASEMENT DRAGON", players: 41, says: "Node 2 is already in this door. One dragon at a time. Try again later." },
  { name: "STARPORT TRADER '93", players: 17, says: "You have used all 5 of your turns for today. Come back tomorrow!" },
  { name: "GLOBAL WAR", players: 8, says: "Writing DOOR.SYS... ERROR: out of memory. Try loading HIMEM.SYS?" },
  { name: "MIDNIGHT BLACKJACK", players: 3, says: "Dealer shows 21. You lost 500 gold. The house always wins. The house is Dale's basement." },
];

const BULLETINS = [
  "SAVING UP FOR A 14.4K MODEM. Donations welcome. (Mom says no second phone line.)",
  "NO WAREZ. I mean it. -Dale",
  "BBS is down Sundays 6-8pm. Mom calls Aunt Linda.",
  "NEW: 40 ANSI screens in File Area 3.",
  "FidoNet mail goes out at 4am. Be patient.",
];

/** The BBS's main menu, as hotkeys under the chat. */
const COMMANDS = [
  ["F", "iles", "files"],
  ["D", "oors", "doors"],
  ["W", "ho's on", "who"],
  ["B", "ulletins", "bulletins"],
  ["P", "age SysOp", "page"],
  ["G", "oodbye", "bye"],
] as const;

/* ───────── What the history shows ───────── */

type NoteKind = "files" | "doors" | "who" | "bulletins" | "page" | "hangup" | "dial" | "say" | "time";

interface Note {
  id: number;
  /** Shown after this line (null: right after the greeting). */
  after: string | null;
  kind: NoteKind;
  text?: string;
  tone?: Tone;
  dial?: DialEntry;
}

type Row =
  | { kind: "msg"; key: string; mine: boolean; text: string; live: boolean }
  | { kind: "note"; key: string; note: Note };

function toRows(greeting: string, lines: ChatLine[], notes: Note[], fresh: (l: ChatLine) => boolean, intro: boolean): Row[] {
  const rows: Row[] = [{ kind: "msg", key: "greeting", mine: false, text: greeting, live: intro }];
  const notesAfter = (id: string | null) => {
    for (const n of notes) if (n.after === id) rows.push({ kind: "note", key: `n${n.id}`, note: n });
  };
  notesAfter(null);
  for (const l of lines) {
    rows.push({ kind: "msg", key: l.id, mine: l.role === "user", text: l.text, live: l.role === "assistant" && fresh(l) });
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

/* ───────── Monitor knobs ───────── */

const KNOB_KEY = "gpty.bbs.knobs.v2";
const KNOB_DEFAULT = { bright: 0.75, contrast: 0.6 };

function loadKnobs() {
  try {
    const v = JSON.parse(localStorage.getItem(KNOB_KEY) ?? "null");
    if (v && typeof v.bright === "number" && typeof v.contrast === "number") return v as typeof KNOB_DEFAULT;
  } catch {}
  return KNOB_DEFAULT;
}

/* ───────── The rig ───────── */

type Link = "dialing" | "up" | "down";

/**
 * Midnight BBS, 1993, remastered: a beige 14" CRT running a terminal program,
 * dialed into Dale's one-line BBS through the 2400 baud modem on the desk.
 * The modem's lights are live, replies arrive at 2400 baud, and the monitor's
 * buttons and knobs all work.
 */
export function BbsLayout({ costume, lines, busy, waiting, error, onSend, onStop }: LayoutProps) {
  const sysop = costume.assistant;
  const me = costume.user;

  /* Connection */

  // New chats on the first visit dial in; everything else opens connected.
  // `clock` is how far into the dial-in we are (ms); Infinity once it's done.
  const [clock, setClock] = useState(() => (!session.dialed && lines.length === 0 && !reducedMotion() ? 0 : Infinity));
  const intro = clock < Infinity;
  // The greeting types itself in at the end of the dial-in, unless the dial-in was skipped.
  const [introAtMount] = useState(intro);
  const [skipped, setSkipped] = useState(false);
  const [link, setLink] = useState<Link>(() => (intro ? "dialing" : "up"));
  const [upSince, setUpSince] = useState(() => (intro ? 0 : Date.now()));
  useState(() => {
    if (!session.start) session.start = Date.now();
  });
  useEffect(() => {
    session.dialed = true;
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

  const introTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    if (!intro) return;
    introTimers.current = [
      ...BEATS.map((t) => later(t, () => setClock((c) => (c < Infinity ? Math.max(c, t) : c)))),
      later(T.connect, () => {
        setLink("up");
        setUpSince(Date.now());
      }),
      later(T.greet, () => setClock(Infinity)),
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
    setUpSince((s) => s || Date.now());
  }, [intro]);

  /* History */

  // Replies already on screen when the thread opened stay put; new ones type in at 2400 baud.
  const [seen] = useState(() => new Set(lines.map((l) => l.id)));
  const [notes, setNotes] = useState<Note[]>([]);
  const [cleared, setCleared] = useState<number | null>(null);
  const rows = useMemo(
    () => toRows(costume.greeting, lines, notes, (l) => !seen.has(l.id), introAtMount),
    [costume.greeting, lines, notes, seen, introAtMount],
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

  /* Modem lights */

  const [rx, setRx] = useState(false);
  const [sd, setSd] = useState(false);
  const sdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sending = useCallback((ms = 160) => {
    setSd(true);
    if (sdTimer.current) clearTimeout(sdTimer.current);
    sdTimer.current = setTimeout(() => setSd(false), ms);
  }, []);
  useEffect(() => () => {
    if (sdTimer.current) clearTimeout(sdTimer.current);
  }, []);
  const [noteRx, setNoteRx] = useState(0);
  const receiving = useCallback(
    (ms: number) => {
      setNoteRx((n) => n + 1);
      later(ms, () => setNoteRx((n) => n - 1));
    },
    [later],
  );

  const up = link === "up" && !error;
  const painting = intro && link === "up";
  const leds = {
    HS: "off",
    AA: "off",
    CD: up ? "on" : "off",
    OH: link !== "down" ? "on" : "off",
    RD: up && (busy || rx || painting || noteRx > 0) ? "flicker" : "off",
    SD: link !== "down" && sd ? "flicker" : "off",
    TR: "on",
    MR: "on",
  } as const;

  /* Commands */

  const hangUp = useCallback(() => {
    if (link === "down") {
      addNote({ kind: "say", text: "You're not on-line. Press ENTER to redial, or Alt-D for the dialing directory.", tone: "dim" });
      return;
    }
    if (busy) onStop();
    skipIntro();
    addNote({ kind: "hangup" });
    sending(500);
    later(900, () => setLink("down"));
  }, [link, busy, onStop, skipIntro, addNote, sending, later]);

  const dial = useCallback(
    (entry: DialEntry) => {
      if (link === "dialing") return;
      if (link === "up") {
        addNote({
          kind: "say",
          text: entry.id === "midnight" ? "Already on-line with MIDNIGHT BBS." : "You're on-line with MIDNIGHT BBS. Hang up first (Alt-H).",
          tone: "dim",
        });
        return;
      }
      addNote({ kind: "dial", dial: entry });
      setLink("dialing");
      sending(400);
      const end = entry.script.at(-1)!.at;
      later(entry.connects ? entry.script[2].at : end, () => {
        setLink(entry.connects ? "up" : "down");
        if (entry.connects) setUpSince(Date.now());
      });
      pin();
    },
    [link, addNote, sending, later, pin],
  );
  const redial = useCallback(() => dial(DIRECTORY[0]), [dial]);

  const offline = useCallback(() => {
    addNote({ kind: "say", text: "NO CARRIER", tone: "bad" });
  }, [addNote]);

  const run = useCallback(
    (kind: "files" | "doors" | "who" | "bulletins" | "page") => {
      if (link !== "up") return offline();
      skipIntro();
      addNote({ kind });
      receiving(kind === "page" ? 2600 : 700);
      pin();
    },
    [link, offline, skipIntro, addNote, receiving, pin],
  );

  const [dialog, setDialog] = useState<"help" | "dir" | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const closeDialog = useCallback(() => {
    setDialog(null);
    requestAnimationFrame(() => input.current?.focus());
  }, []);

  const clear = useCallback(() => {
    setCleared(rows.length);
    setDialog(null);
  }, [rows.length]);
  const scrollBack = useCallback(() => {
    setCleared(null);
    setDialog(null);
    stuck.current = false;
    requestAnimationFrame(() => log.current?.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" }));
  }, []);

  /* Monitor */

  const [on, setOn] = useState(session.monitorOn);
  const [powerAnim, setPowerAnim] = useState<"on" | "off" | null>(null);
  const togglePower = () => {
    const next = !on;
    session.monitorOn = next;
    setOn(next);
    setPowerAnim(reducedMotion() ? null : next ? "on" : "off");
    if (next) requestAnimationFrame(() => input.current?.focus());
  };

  const glass = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const lastDegauss = useRef(0);
  const degauss = () => {
    if (!on || Date.now() - lastDegauss.current < 2600 || reducedMotion()) return;
    lastDegauss.current = Date.now();
    for (const [el, cls] of [
      [glass.current, "bbs-degauss"],
      [rig.current, "bbs-thunk"],
    ] as const) {
      if (!el) continue;
      el.classList.remove(cls);
      void el.offsetWidth; // restart the animation
      el.classList.add(cls);
    }
  };

  const [knobs, setKnobs] = useState(loadKnobs);
  const turn = (k: keyof typeof KNOB_DEFAULT, v: number) => {
    setKnobs((cur) => {
      const next = { ...cur, [k]: Math.min(1, Math.max(0, v)) };
      try {
        localStorage.setItem(KNOB_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  /* Keyboard: Alt shortcuts, Esc, and any key skips the dial-in */

  const keys = useRef({ hangUp, clear, scrollBack, skipIntro, closeDialog, dialog, intro, on });
  useEffect(() => {
    keys.current = { hangUp, clear, scrollBack, skipIntro, closeDialog, dialog, intro, on };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = keys.current;
      if (k.intro && !["Alt", "Shift", "Control", "Meta"].includes(e.key)) k.skipIntro();
      if (e.key === "Escape" && k.dialog) {
        e.preventDefault();
        k.closeDialog();
        return;
      }
      if (!e.altKey || e.ctrlKey || e.metaKey || !k.on) return;
      const act: Record<string, () => void> = {
        KeyZ: () => setDialog((d) => (d === "help" ? null : "help")),
        KeyD: () => setDialog((d) => (d === "dir" ? null : "dir")),
        KeyH: () => {
          setDialog(null);
          k.hangUp();
        },
        KeyC: k.clear,
        KeyB: k.scrollBack,
      };
      const fn = act[e.code];
      if (!fn) return;
      e.preventDefault();
      fn();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Composer */

  const [value, setValue] = useState("");
  useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [value]);

  const send = () => {
    if (link === "down") return redial();
    if (link === "dialing" && !intro) return;
    const t = value.trim();
    if (!t || busy) return;
    skipIntro();
    sending(Math.min(1400, 120 + t.length * 8));
    onSend(t);
    setValue("");
    pin();
  };

  /* Time limit */

  const onHour = useCallback(() => {
    addNote({ kind: "time" });
  }, [addNote]);

  const status =
    link === "dialing" ? "DIALING" : link === "down" ? "OFF-LINE" : busy || rx || painting ? "RECEIVING" : sd ? "SENDING" : "READY";
  const nameCols = Math.max(sysop.length, me.length) + 3;
  const reflection = art("reflection");
  const plastic = art("plastic");

  return (
    <div className="bbs">
      <div
        ref={rig}
        className="bbs-rig"
        style={
          {
            maxWidth: costume.window.w,
            maxHeight: costume.window.h,
            // The knobs never dim the text: brightness sets how much the phosphor glows,
            // contrast how strong the scanlines are.
            "--bbs-glow": 0.7 + knobs.bright * 0.9,
            "--bbs-scan": 0.02 + knobs.contrast * 0.1,
            ...(plastic ? { "--bbs-plastic": `url(${plastic})` } : {}),
          } as React.CSSProperties
        }
      >
        <div className="bbs-monitor">
          <div className="bbs-bevel">
            <div className="bbs-recess">
              <div
                ref={glass}
                className={`bbs-glass ${powerAnim ? `bbs-power-${powerAnim}` : ""}`}
                data-power={on ? "on" : "off"}
                onAnimationEnd={(e) => {
                  if (e.animationName === "bbs-degauss") glass.current?.classList.remove("bbs-degauss");
                  if (e.animationName === "bbs-dot" || e.animationName === "bbs-on") setPowerAnim(null);
                }}
              >
                <div
                  className={`bbs-screen ${intro ? "bbs-intro" : ""}`}
                  style={{ "--name": `${nameCols}ch` } as React.CSSProperties}
                  onPointerDown={skipIntro}
                  inert={!on}
                >
                  <div className="bbs-top">
                    <span className="truncate">
                      <b>{costume.app}</b>
                      <span className="max-sm:hidden"> · Node 1 · SysOp Chat</span>
                    </span>
                    <span className="flex shrink-0 gap-[2ch]">
                      <TimeLeft onHour={onHour} />
                      <Clock />
                    </span>
                  </div>

                  <div ref={log} className="bbs-log" aria-live="polite">
                    <div ref={inner} className="bbs-log-inner">
                      {cleared === null ? (
                        <Preamble clock={clock} me={me} sysop={sysop} />
                      ) : (
                        <button type="button" className="bbs-hint" onClick={scrollBack}>
                          [Alt-B] Scroll back
                        </button>
                      )}

                      {shown.map((r) =>
                        r.key === "greeting" && clock < T.greet ? null : r.kind === "msg" ? (
                          <div key={r.key} className={`bbs-msg ${r.mine ? "bbs-mine" : "bbs-theirs"}`}>
                            <span className="bbs-who">
                              {r.mine ? me : sysop}
                              <span className="bbs-arrow"> »</span>
                            </span>
                            <span className="bbs-text">
                              {r.mine ? (
                                r.text
                              ) : (
                                <Baud
                                  text={r.text}
                                  live={r.live}
                                  skip={r.key === "greeting" && skipped}
                                  streaming={busy && r.key === lines.at(-1)?.id}
                                  onActive={setRx}
                                />
                              )}
                            </span>
                          </div>
                        ) : (
                          <NoteBlock key={r.key} note={r.note} sysop={sysop} me={me} later={later} onRx={receiving} />
                        ),
                      )}

                      {waiting && (
                        <div className="bbs-msg bbs-theirs">
                          <span className="bbs-who">
                            {sysop}
                            <span className="bbs-arrow"> »</span>
                          </span>
                          <span className="bbs-text">
                            <i className="bbs-cursor" />
                          </span>
                        </div>
                      )}
                      {error && (
                        <div className="bbs-sys">
                          <span className="t-bad">{costume.error}</span>
                          <span className="t-dim"> · The line dropped mid-reply. Send again to retry.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <nav className="bbs-keys" aria-label="BBS commands">
                    {COMMANDS.map(([k, rest, id]) => (
                      <button key={k} type="button" className="bbs-key" onClick={() => (id === "bye" ? hangUp() : run(id))}>
                        <span className="bbs-key-k">[{k}]</span>
                        {rest}
                      </button>
                    ))}
                  </nav>

                  <div className="bbs-chatbar" aria-hidden>
                    <span>
                      CHAT · {sysop} &lt;&gt; {me}
                    </span>
                  </div>

                  <div className="bbs-input">
                    <label htmlFor="bbs-input" className="bbs-who bbs-prompt">
                      {me}
                      <span className="bbs-arrow"> »</span>
                    </label>
                    {link === "down" && !value && (
                      <span className="bbs-offline" aria-hidden>
                        NO CARRIER · ENTER to redial · Alt-D directory
                      </span>
                    )}
                    {intro && !value && (
                      <span className="bbs-offline t-dim" aria-hidden>
                        Connecting... press any key to skip
                      </span>
                    )}
                    <textarea
                      id="bbs-input"
                      ref={input}
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        sending();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      rows={1}
                      autoFocus
                      spellCheck={false}
                      autoComplete="off"
                      aria-label={`Chat with ${sysop}`}
                      className="bbs-field"
                      disabled={!on}
                    />
                  </div>

                  <div className="bbs-status">
                    <button type="button" onClick={() => setDialog("help")}>
                      <span className="bbs-wide">ALT-Z FOR </span>HELP
                    </button>
                    <span className="max-sm:hidden">ANSI-BBS</span>
                    <span>{BAUD} N81</span>
                    <span className="max-md:hidden">FDX</span>
                    <span className={status === "OFF-LINE" ? "bbs-st-bad" : undefined}>{status}</span>
                    <span className="ml-auto border-l-0">
                      {link === "up" ? <OnLine since={upSince} /> : "OFF-LINE"}
                    </span>
                  </div>

                  {dialog === "help" && (
                    <Help
                      onClose={closeDialog}
                      onPick={(k) => {
                        if (k === "dir") setDialog("dir");
                        else if (k === "hang") {
                          setDialog(null);
                          hangUp();
                        } else if (k === "clear") clear();
                        else if (k === "back") scrollBack();
                        else closeDialog();
                      }}
                    />
                  )}
                  {dialog === "dir" && (
                    <Directory
                      link={link}
                      onClose={closeDialog}
                      onDial={(e) => {
                        closeDialog();
                        dial(e);
                      }}
                    />
                  )}
                </div>

                {/* The tube: scanlines, phosphor mask, refresh roll, curvature, glare, the room in the glass. */}
                <div className="bbs-fx" aria-hidden>
                  <i className="bbs-fx-mask" />
                  <i className="bbs-fx-scan" />
                  <i className="bbs-fx-roll" />
                  <i className="bbs-fx-curve" />
                  {/* On the glass itself, so above the tube's dark edges. */}
                  {reflection ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={reflection} alt="" className="bbs-fx-photo" />
                  ) : (
                    <i className="bbs-fx-window" />
                  )}
                  <i className="bbs-fx-glare" />
                </div>
              </div>
            </div>
          </div>

          <div className="bbs-chin">
            <StickyNote user={me} />
            <div className="bbs-badge">
              <b>GPTY</b>
              <span>14&quot; Color VGA</span>
            </div>
            <span className="bbs-mpr max-lg:hidden">MPR II · Low Radiation</span>
            <div className="bbs-controls">
              <Knob kind="contrast" label="Contrast" value={knobs.contrast} onTurn={(v) => turn("contrast", v)} />
              <Knob kind="bright" label="Brightness" value={knobs.bright} onTurn={(v) => turn("bright", v)} />
              <span className="bbs-ctl">
                <button type="button" className="bbs-push bbs-push-wide" onClick={degauss} disabled={!on} aria-label="Degauss" />
                <small>Degauss</small>
              </span>
              <span className="bbs-ctl">
                <button
                  type="button"
                  className="bbs-push"
                  onClick={togglePower}
                  aria-pressed={on}
                  aria-label={on ? "Turn the monitor off" : "Turn the monitor on"}
                >
                  <PowerMark />
                </button>
                <small>Power</small>
              </span>
              <i className="bbs-power-led" data-on={on} aria-hidden />
            </div>
          </div>
        </div>

        <div className="bbs-desk">
          <button type="button" className="bbs-floppy" onClick={() => on && setDialog("dir")} title="Dialing directory (Alt-D)">
            <Floppy label="BBS LIST" />
          </button>
          <div className="bbs-stand" aria-hidden>
            <i className="bbs-neck" />
            <i className="bbs-base" />
          </div>
          <Modem leds={leds} />
        </div>
      </div>
    </div>
  );
}

/* ───────── On the screen ───────── */

/** What a terminal shows above the chat: the dial-in, the splash, the login. */
function Preamble({ clock, me, sysop }: { clock: number; me: string; sysop: string }) {
  const g = splashGrid();
  // During the dial-in each piece arrives at its moment, so the terminal scrolls as it draws.
  const has = (at: number) => clock >= at;
  const painted = clock === Infinity ? SPLASH_ROWS : BEATS.filter((t) => t >= T.paint && t < T.info && t <= clock).length;
  const info = [
    ["Node 1 of 1", "Est. 1991", "FidoNet 1:340/93"],
    [`SysOp: ${sysop}`, "2,048 files", "24 hrs*"],
  ];
  const login: [string, string][] = [
    ["What is your name? ", me],
    ["Password: ", "*********"],
    [`Welcome back, ${me}! You are caller `, "#1,337"],
    ["Last caller: NIGHT_OWL · Calls today: 12 · ", "Time left: 60 min"],
  ];
  return (
    <div className="bbs-pre">
      <div className="t-cmd">
        <span className="bbs-typed" style={{ "--n": 3 } as React.CSSProperties}>ATZ</span>
      </div>
      {has(T.ok) && <div>OK</div>}
      {has(T.atdt) && (
        <div className="t-cmd">
          <span className="bbs-typed" style={{ "--n": 15 } as React.CSSProperties}>
            ATDT {PHONE}
          </span>
        </div>
      )}
      {has(T.ring) && <div>RINGING</div>}
      {has(T.connect) && <div className="t-ok">{CONNECT}</div>}

      {painted > 0 && (
        <div
          className="bbs-splash"
          role="img"
          aria-label="Midnight BBS: a crescent moon over a sleeping town, with one basement window lit."
          style={{ aspectRatio: `${SPLASH.w} / ${painted * 2}` }}
        >
          <div className="bbs-splash-art" style={{ aspectRatio: `${SPLASH.w} / ${SPLASH.h}` }}>
            <PixelArt g={g} className="block h-full w-full" />
            {painted < SPLASH_ROWS || clock < T.info ? (
              <span
                key={painted}
                className="bbs-cover"
                style={{ top: `${((painted - 1) / SPLASH_ROWS) * 100}%`, height: `${100 / SPLASH_ROWS + 0.3}%` }}
              />
            ) : null}
          </div>
        </div>
      )}

      {has(T.info) && (
        <div className="bbs-info">
          {info.map((row, i) => (
            <div key={i}>
              {row.map((s, j) => (
                <span key={j}>
                  {j > 0 && <span className="t-dark"> · </span>}
                  {s}
                </span>
              ))}
            </div>
          ))}
          <div className="t-dark">*except when Mom needs the phone</div>
        </div>
      )}

      <div className="bbs-login">
        {login.map(([q, a], i) =>
          has(T.login + i * T.loginStep) ? (
            <div key={i}>
              <span className="t-gray">{q}</span>
              <span className="t-hi">{a}</span>
            </div>
          ) : null,
        )}
      </div>

      {has(T.banner) && (
        <div className="bbs-banner">
          <span>*** {sysop} (SysOp) has entered chat mode ***</span>
        </div>
      )}
    </div>
  );
}

/**
 * A reply as it comes down the wire: 240 characters a second, with the
 * cursor riding along. If the model outruns the modem it catches up, so it's
 * never more than a second or so behind.
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
  // A skipped dial-in shows the greeting whole.
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
      {(typing || streaming) && <i className="bbs-cursor" />}
    </>
  );
}

function ToneLine({ text, tone, at }: { text: string; tone?: Tone; at?: number }) {
  return (
    <div className={`bbs-step ${tone ? `t-${tone}` : ""}`} style={{ "--at": `${at ?? 0}ms` } as React.CSSProperties}>
      {text}
    </div>
  );
}

/** Something the BBS or the terminal printed between messages. */
function NoteBlock({
  note,
  sysop,
  me,
  later,
  onRx,
}: {
  note: Note;
  sysop: string;
  me: string;
  later: (ms: number, fn: () => void) => void;
  onRx: (ms: number) => void;
}) {
  switch (note.kind) {
    case "say":
      return <div className={`bbs-sys t-${note.tone ?? "gray"}`}>{note.text}</div>;
    case "hangup":
      return (
        <div className="bbs-sys">
          <ToneLine text="+++" tone="cmd" />
          <ToneLine text="OK" at={350} />
          <ToneLine text="ATH0" tone="cmd" at={550} />
          <ToneLine text="NO CARRIER" tone="bad" at={900} />
          <ToneLine text="Thanks for calling MIDNIGHT BBS! Press ENTER to redial." tone="dim" at={1100} />
        </div>
      );
    case "dial":
      return (
        <div className="bbs-sys">
          {note.dial!.script.map((s, i) => (
            <ToneLine key={i} text={s.text} tone={s.tone} at={s.at} />
          ))}
        </div>
      );
    case "page":
      return (
        <div className="bbs-sys">
          <ToneLine text="Paging the SysOp..." tone="hi" />
          <ToneLine text="*BEEP*" tone="warn" at={500} />
          <ToneLine text="*BEEP* *BEEP*" tone="warn" at={1100} />
          <ToneLine text="*BEEP* *BEEP* *BEEP*" tone="warn" at={1700} />
          <ToneLine text={`${sysop} is already in chat with you. Nice try.`} tone="dim" at={2400} />
        </div>
      );
    case "time":
      return (
        <div className="bbs-sys">
          <ToneLine text="*** TIME LIMIT REACHED ***" tone="bad" />
          <ToneLine text={`${sysop} added 60 minutes to your time bank. Don't tell anyone.`} tone="hi" at={600} />
        </div>
      );
    case "who":
      return (
        <Panel title="Who's On-Line" color="cyan">
          <table className="bbs-table">
            <thead>
              <tr>
                <th>Node</th>
                <th>User</th>
                <th className="max-sm:hidden">Baud</th>
                <th>Doing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td className="t-hi">{me}</td>
                <td className="max-sm:hidden">2400</td>
                <td>Chatting with the SysOp</td>
              </tr>
              <tr>
                <td>Con</td>
                <td className="t-warn">{sysop}</td>
                <td className="max-sm:hidden">Local</td>
                <td>Chatting with {me}. Eating cold pizza.</td>
              </tr>
              <tr className="t-dark">
                <td>2</td>
                <td>-</td>
                <td className="max-sm:hidden">-</td>
                <td>Coming soon (needs a second phone line)</td>
              </tr>
            </tbody>
          </table>
        </Panel>
      );
    case "bulletins":
      return (
        <Panel title="Bulletins" color="magenta">
          <ol className="bbs-list">
            {BULLETINS.map((b, i) => (
              <li key={i}>
                <span className="t-warn">{i + 1}</span>
                <span>{b}</span>
              </li>
            ))}
          </ol>
        </Panel>
      );
    case "files":
      return <FileArea later={later} onRx={onRx} />;
    case "doors":
      return <DoorMenu later={later} onRx={onRx} />;
  }
}

function Panel({ title, color, children, extra }: { title: string; color: "cyan" | "magenta" | "yellow" | "green"; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <section className={`bbs-panel bbs-panel-${color}`}>
      <header>
        <span className="bbs-panel-title">{title}</span>
        {extra && <span className="bbs-panel-extra">{extra}</span>}
      </header>
      {children}
    </section>
  );
}

function FileArea({ later, onRx }: { later: (ms: number, fn: () => void) => void; onRx: (ms: number) => void }) {
  const [got, setGot] = useState<{ name: string; phase: "zmodem" | "abort" } | null>(null);
  const pick = (name: string) => {
    if (got) return;
    setGot({ name, phase: "zmodem" });
    onRx(2600);
    later(2600, () => setGot({ name, phase: "abort" }));
  };
  return (
    <Panel title="File Area 3 · ANSI Art & Utilities" color="yellow" extra="Pick a file to download">
      <table className="bbs-table">
        <tbody>
          {FILES.map((f) => (
            <tr key={f.name}>
              <td>
                <button type="button" className="bbs-link" onClick={() => pick(f.name)} disabled={!!got}>
                  {f.name}
                </button>
              </td>
              <td className="t-gray text-right">{f.size}</td>
              <td className="t-dark max-md:hidden">{f.date}</td>
              <td className="max-sm:hidden">{f.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {got && (
        <div className="bbs-xfer">
          <div>
            <span className="t-hi">ZMODEM</span> download: <span className="t-warn">{got.name}</span>
          </div>
          <div className="bbs-bar" data-done={got.phase === "abort"}>
            <i />
          </div>
          {got.phase === "abort" && (
            <div className="t-bad">
              *** Transfer aborted. Your upload/download ratio is 0:1. Upload 1 file for every 3 you take. ***
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

function DoorMenu({ later, onRx }: { later: (ms: number, fn: () => void) => void; onRx: (ms: number) => void }) {
  const [door, setDoor] = useState<{ i: number; done: boolean } | null>(null);
  const open = (i: number) => {
    if (door && !door.done) return;
    setDoor({ i, done: false });
    onRx(1400);
    later(1400, () => setDoor({ i, done: true }));
  };
  return (
    <Panel title="Doors · On-line Games" color="green" extra="Pick a door">
      <ol className="bbs-list">
        {DOORS.map((d, i) => (
          <li key={d.name}>
            <span className="t-warn">{i + 1}</span>
            <button type="button" className="bbs-link" onClick={() => open(i)}>
              {d.name}
            </button>
            <span className="t-dark max-sm:hidden">({d.players} players)</span>
          </li>
        ))}
      </ol>
      {door && (
        <div className="bbs-xfer">
          <div className="t-gray">
            Loading <span className="t-hi">{DOORS[door.i].name}</span>
            {door.done ? "..." : <span className="bbs-dots">...</span>}
          </div>
          {door.done && <div className="t-warn">{DOORS[door.i].says}</div>}
        </div>
      )}
    </Panel>
  );
}

/* ───────── Dialogs ───────── */

function DosDialog({
  title,
  children,
  footer,
  onClose,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  footer: string;
  onClose: () => void;
  wide?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.querySelector<HTMLButtonElement>("[data-item]")?.focus();
  }, []);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = [...(box.current?.querySelectorAll<HTMLButtonElement>("[data-item]") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length];
    next?.focus();
    e.preventDefault();
  };
  return (
    <div
      className="bbs-dlg-wrap"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={box} className={`bbs-dlg ${wide ? "bbs-dlg-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} onKeyDown={onKeyDown}>
        <div className="bbs-dlg-title">
          <span>{title}</span>
        </div>
        {children}
        <div className="bbs-dlg-foot">{footer}</div>
      </div>
    </div>
  );
}

const HELP: { k: string; label: string; id: "dir" | "hang" | "clear" | "back" | "help" }[] = [
  { k: "Alt-D", label: "Dialing directory", id: "dir" },
  { k: "Alt-H", label: "Hang up", id: "hang" },
  { k: "Alt-C", label: "Clear screen", id: "clear" },
  { k: "Alt-B", label: "Scroll-back buffer", id: "back" },
  { k: "Alt-Z", label: "This help", id: "help" },
];

function Help({ onClose, onPick }: { onClose: () => void; onPick: (id: (typeof HELP)[number]["id"]) => void }) {
  return (
    <DosDialog title="Command Summary" footer="Esc: close · UNREGISTERED: day 212 of 30" onClose={onClose}>
      <div className="bbs-dlg-list">
        {HELP.map((h) => (
          <button key={h.k} type="button" data-item className="bbs-dlg-item" onClick={() => onPick(h.id)}>
            <span className="t-warn">{h.k}</span>
            <span>{h.label}</span>
          </button>
        ))}
      </div>
      <p className="bbs-dlg-note">GPTERM 3.12 · Shareware. If you use it, please register! ($39)</p>
    </DosDialog>
  );
}

function Directory({ link, onClose, onDial }: { link: Link; onClose: () => void; onDial: (e: DialEntry) => void }) {
  return (
    <DosDialog title="Dialing Directory" footer="Enter: dial · Esc: cancel" onClose={onClose} wide>
      <div className="bbs-dir-head" aria-hidden>
        <span>#</span>
        <span>Name</span>
        <span className="bbs-dir-num">Number</span>
        <span className="bbs-dir-more">Baud</span>
        <span className="bbs-dir-more">Last call</span>
      </div>
      <div className="bbs-dlg-list">
        {DIRECTORY.map((d, i) => (
          <button key={d.id} type="button" data-item className="bbs-dlg-item bbs-dir-row" onClick={() => onDial(d)}>
            <span className="t-warn">{i + 1}</span>
            <span className="truncate">
              {d.name}
              {d.id === "midnight" && link === "up" && <span className="t-ok"> *</span>}
            </span>
            <span className="bbs-dir-num">{d.number}</span>
            <span className="bbs-dir-more">{d.baud}</span>
            <span className="bbs-dir-more">{d.last}</span>
          </button>
        ))}
      </div>
    </DosDialog>
  );
}

/* ───────── Live bits of the status lines ───────── */

function Clock() {
  const now = new Date(useNow(15_000));
  const h = now.getHours() % 12 || 12;
  return (
    <span className="max-sm:hidden">
      {pad(now.getMonth() + 1)}-{pad(now.getDate())}-93 {h}:{pad(now.getMinutes())}
      {now.getHours() < 12 ? "a" : "p"}
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

/** Minutes left in today's hour. When it runs out, the SysOp tops it up. */
function TimeLeft({ onHour }: { onHour: () => void }) {
  const now = useNow(10_000);
  const start = session.start || now;
  const mins = Math.max(0, Math.floor((now - start) / 60_000));
  const hour = Math.floor(mins / 60);
  // The hour this screen opened in doesn't count; only ones that run out while you watch.
  const [opened] = useState(hour);
  const told = useRef(opened);
  useEffect(() => {
    if (hour > told.current) {
      told.current = hour;
      onHour();
    }
  }, [hour, onHour]);
  return (
    <span>
      Time left: <b>{60 - (mins % 60)}</b>
    </span>
  );
}

/* ───────── Props ───────── */

function StickyNote({ user }: { user: string }) {
  return (
    <div className="bbs-sticky" aria-hidden>
      <b>MIDNIGHT BBS</b>
      <span>555-0193</span>
      <span>user: {user}</span>
      <span>pw: swordfish</span>
      <em>no calls after 11!! -Mom</em>
    </div>
  );
}

const LEDS: [keyof LedState, string][] = [
  ["HS", "High Speed (off: you're at 2400)"],
  ["AA", "Auto Answer"],
  ["CD", "Carrier Detect"],
  ["OH", "Off Hook"],
  ["RD", "Receive Data"],
  ["SD", "Send Data"],
  ["TR", "Terminal Ready"],
  ["MR", "Modem Ready"],
];
type LedState = Record<"HS" | "AA" | "CD" | "OH" | "RD" | "SD" | "TR" | "MR", "on" | "off" | "flicker">;

/** The external modem. Its lights are the real state of the line. */
function Modem({ leds }: { leds: LedState }) {
  return (
    <div className="bbs-modem" role="img" aria-label={`Modem lights: ${LEDS.filter(([k]) => leds[k] !== "off").map(([k]) => k).join(", ") || "off"}`}>
      <div className="bbs-modem-top" />
      <div className="bbs-modem-face">
        <span className="bbs-modem-brand">
          DataHawk <b>2400</b>
        </span>
        <span className="bbs-modem-leds">
          {LEDS.map(([k, name]) => (
            <span key={k} className="bbs-modem-cell" title={name}>
              <i className="bbs-modem-led" data-state={leds[k]} />
              <small>{k}</small>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

/** A monitor knob: drag up or down, scroll, or use the arrow keys. Double-click resets. */
function Knob({ kind, label, value, onTurn }: { kind: "bright" | "contrast"; label: string; value: number; onTurn: (v: number) => void }) {
  const defaultValue = KNOB_DEFAULT[kind];
  const drag = useRef<{ id: number; y: number; v: number } | null>(null);
  return (
    <span className="bbs-ctl">
      <span
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        className="bbs-knob"
        style={{ "--rot": `${-135 + value * 270}deg` } as React.CSSProperties}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { id: e.pointerId, y: e.clientY, v: value };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d?.id === e.pointerId) onTurn(d.v + (d.y - e.clientY) / 140);
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onWheel={(e) => onTurn(value - e.deltaY / 900)}
        onDoubleClick={() => onTurn(defaultValue)}
        onKeyDown={(e) => {
          const step = { ArrowUp: 0.05, ArrowRight: 0.05, ArrowDown: -0.05, ArrowLeft: -0.05 }[e.key];
          if (step === undefined) return;
          e.preventDefault();
          onTurn(value + step);
        }}
      >
        <i />
      </span>
      <small>
        <KnobMark kind={kind} />
      </small>
    </span>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gpty, type Mood } from "@/components/Gpty";
import { ChannelMark, Glyph, InfoBubble, MircMark, ToolIcon, type ToolId, Trout } from "@/components/irc/art";
import { pixel } from "@/components/irc/font";
import "@/components/irc/irc.css";
import {
  CHAN,
  ChildBar,
  COMMANDS,
  type Ev,
  type Item,
  Lag,
  LogBackdrop,
  LogRow,
  MdiBackdrop,
  MenuList,
  NagDialog,
  type Note,
  OnlineTimer,
  OptionsDialog,
  Palette,
  type Prefs,
  type Row,
  type Tone,
  type Transfer,
  Tray,
  type Win,
  Y2K,
} from "@/components/irc/parts";
import {
  BOT,
  countdown,
  EIGHT_BALL,
  GUEST,
  JOIN_FAILS,
  MOTD,
  NETWORK,
  NICK,
  OUTBOX,
  PALETTE,
  PART_MSGS,
  pick,
  PORT,
  QUIT_MSGS,
  REGULARS,
  regular,
  SERVER,
  serverDate,
  SONGS,
  STARTERS,
  TOPICS,
  y2kLeft,
} from "@/components/irc/world";
import { getAgent } from "@/lib/agents";
import { useDesktopDrag, useStickyScroll } from "./hooks";
import type { ChatLine, LayoutProps } from "./types";

const PREFS_KEY = "gpty.irc.prefs";
const NAG_KEY = "gpty.irc.nagged";
const DEFAULT_PREFS: Prefs = { color: null, stamps: true, joins: true, nicks: true, toolbar: true, switchbar: true };

function loadPrefs(): Prefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") };
  } catch {
    return DEFAULT_PREFS;
  }
}

const SLAP = /\bslaps?\b[\s\S]*\btrout\b/i;
const NICK_OK = /^[A-Za-z[\]\\`_^{|}][A-Za-z0-9[\]\\`_^{|}-]{0,15}$/;
/** How long the connect sequence takes on your first visit. */
const STEP = 55;

/** Connected once per visit: switching agents or chats doesn't reconnect. */
let connectedAt = 0;
/** Only one netsplit per visit. */
let splitDone = false;

const SHAKE: Keyframe[] = [
  { transform: "translateX(0)" },
  { transform: "translateX(-6px)" },
  { transform: "translateX(5px)" },
  { transform: "translateX(-3px)" },
  { transform: "translateX(2px)" },
  { transform: "translateX(0)" },
];
/** A short jolt: a slap landing, a kick, a message that couldn't go out. */
function jolt(el: HTMLElement | null, ms = 380) {
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(SHAKE, { duration: ms, easing: "ease-out" });
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const mentions = (text: string, me: string) => new RegExp(`(^|[^\\w])${escapeRe(me)}($|[^\\w])`, "i").test(text);
/*
 * Time and chance, read only from event handlers and timers (never while
 * drawing), kept out here so the window's body stays pure.
 */
const now = () => Date.now();
const jitter = (min: number, max: number) => min + Math.random() * (max - min);
const rand = <T,>(list: readonly T[]) => list[Math.floor(jitter(0, list.length))];
/** Keys for balloons and trout throws, so the same one can play twice. */
let throws = 0;
const nextKey = () => ++throws;

/** The status window on connect: the handshake, the numbers and the MOTD. */
function connectRows(now: number, staged: boolean): Row[] {
  const evs: Ev[] = [
    { t: "line", tone: "info2", text: `* Connecting to ${SERVER} (${PORT})` },
    { t: "line", tone: "server", text: `-${SERVER}- *** Looking up your hostname...` },
    { t: "line", tone: "server", text: `-${SERVER}- *** Checking ident...` },
    { t: "line", tone: "server", text: `-${SERVER}- *** Found your hostname` },
    { t: "line", tone: "server", text: `-${SERVER}- *** No ident response; username prefixed with ~` },
    { t: "line", tone: "text", text: `Welcome to the ${NETWORK} IRC Network ${GUEST}!~${GUEST}@dialup-56k.gpty.lol` },
    { t: "line", tone: "text", text: `Your host is ${SERVER}, running version u2.10.07+gpty` },
    { t: "line", tone: "text", text: "This server was created Thu Sep 1 1994 at 03:12:44" },
    { t: "line", tone: "text", text: "There are 1,999 users and 404 invisible on 12 servers" },
    { t: "line", tone: "text", text: "42 :IRC Operators online" },
    { t: "line", tone: "text", text: "1,203 :channels formed" },
    { t: "line", tone: "text", text: `- ${SERVER} Message of the Day -` },
    { t: "pre", lines: MOTD.slice(0, 5), rainbow: true },
    { t: "pre", lines: MOTD.slice(5) },
    { t: "line", tone: "text", text: "End of /MOTD command." },
    { t: "line", tone: "notice", text: `-NickServ- ${GUEST} is not a registered nickname.` },
    { t: "line", tone: "mode", text: `* ${GUEST} sets mode: +i` },
  ];
  let acc = 120;
  return evs.map((ev, i) => {
    const stage = acc;
    acc += ev.t === "pre" ? STEP * 4 : STEP;
    return { ...ev, key: `c${i}`, at: now, boot: true, stage: staged ? stage : undefined };
  });
}
/** When the channel window opens on your first visit: once the MOTD has scrolled by. */
const CONNECT_MS = (connectRows(0, true).at(-1)?.stage ?? 0) + 450;

/**
 * Chat lines become channel lines. Your /me, /nick, /topic and /kick, and
 * Nick's actions, /topic, /kick and /op, each get their own kind of line;
 * notes slot in after the line they followed.
 */
function derive(o: { lines: ChatLine[]; notes: Note[]; busy: boolean; nick: string; topic: string; opening: Row[] }) {
  let me = GUEST;
  let topic = o.topic;
  let op = false;
  let lastNickAt = 0;
  const rows: Row[] = [...o.opening];
  const slaps: { key: string; mine: boolean }[] = [];
  const kicks: string[] = [];
  const hls: string[] = [];
  const add = (key: string, at: number, ev: Ev, stage?: number) => rows.push({ ...ev, key, at, stage });
  const notesAfter = (id: string | null) => {
    for (const n of o.notes) if (n.win === "chan" && n.after === id) add(`n${n.id}`, n.at, n.ev);
  };
  notesAfter(null);

  o.lines.forEach((l, i) => {
    if (l.role === "user") {
      const t = l.text.trim();
      let m: RegExpExecArray | null;
      if ((m = /^\/me\s+([\s\S]+)$/i.exec(t))) {
        add(l.id, l.at, { t: "act", who: me, text: m[1], mine: true });
        if (SLAP.test(m[1])) slaps.push({ key: l.id, mine: true });
      } else if ((m = /^\/nick\s+(\S+)/i.exec(t))) {
        add(l.id, l.at, { t: "line", tone: "nick", text: `* Your nick is now ${m[1]}` });
        me = m[1];
      } else if ((m = /^\/topic\s+([\s\S]+)$/i.exec(t))) {
        topic = m[1].trim();
        add(l.id, l.at, { t: "line", tone: "topic", text: `* ${me} changes topic to '${topic}'` });
      } else if ((m = /^\/kick\s+(\S+)\s*([\s\S]*)$/i.exec(t))) {
        add(l.id, l.at, { t: "line", tone: "kick", text: `* ${m[1]} was kicked by ${me} (${m[2].trim() || me})` });
        add(`${l.id}:re`, l.at, { t: "line", tone: "join", text: `* Joins: ${o.nick} (${NICK.host})` }, 1800);
      } else {
        add(l.id, l.at, { t: "msg", who: me, text: l.text, mine: true });
      }
    } else {
      const live = o.busy && i === o.lines.length - 1;
      const parts = l.text.split("\n");
      parts.forEach((raw, j) => {
        const s = raw.trim();
        const key = `${l.id}:${j}`;
        if (!s) return;
        // A command still streaming in stays hidden until its line is complete.
        if (live && j === parts.length - 1 && s.startsWith("/")) return;
        lastNickAt = l.at;
        let m: RegExpExecArray | null;
        if ((m = /^\/topic\s+([\s\S]+)$/i.exec(s))) {
          topic = m[1].trim();
          add(key, l.at, { t: "line", tone: "topic", text: `* ${o.nick} changes topic to '${topic}'` });
        } else if ((m = /^\/kick\b\s*([\s\S]*)$/i.exec(s))) {
          let why = m[1].trim();
          if (why.toLowerCase().startsWith(me.toLowerCase())) why = why.slice(me.length).trim();
          add(key, l.at, { t: "line", tone: "kick", text: `* You were kicked from ${CHAN} by ${o.nick} (${why || o.nick})` });
          add(`${key}:a`, l.at, { t: "line", tone: "info2", text: `* Attempting to rejoin ${CHAN}...` }, 1400);
          add(`${key}:b`, l.at, { t: "line", tone: "join", text: `* Rejoined channel ${CHAN}` }, 2200);
          kicks.push(key);
        } else if (/^\/op\b/i.test(s)) {
          op = true;
          add(key, l.at, { t: "line", tone: "mode", text: `* ${o.nick} sets mode: +o ${me}` });
        } else if (/^\/deop\b/i.test(s)) {
          op = false;
          add(key, l.at, { t: "line", tone: "mode", text: `* ${o.nick} sets mode: -o ${me}` });
        } else if ((m = /^(?:\/me\s+|\*\s+)([\s\S]+)$/i.exec(s))) {
          let a = m[1];
          if (a.toLowerCase().startsWith(`${o.nick.toLowerCase()} `)) a = a.slice(o.nick.length + 1);
          add(key, l.at, { t: "act", who: o.nick, text: a });
          if (SLAP.test(a)) slaps.push({ key, mine: false });
        } else {
          const hl = mentions(s, me);
          add(key, l.at, { t: "msg", who: o.nick, text: s, hl });
          if (hl) hls.push(key);
        }
      });
    }
    notesAfter(l.id);
  });
  return { rows, me, topic, op, slaps, kicks, hls, lastNickAt };
}

/* ───────── The window ───────── */

const MENU_NAMES = ["File", "View", "Favorites", "Tools", "Commands", "Window", "Help"] as const;
type MenuName = (typeof MENU_NAMES)[number];

const TOOLS: ({ id: ToolId; tip: string } | "|")[] = [
  { id: "connect", tip: "Connect" },
  { id: "options", tip: "Options (Alt+O)" },
  { id: "channels", tip: "Channels list" },
  "|",
  { id: "send", tip: "DCC Send" },
  { id: "chat", tip: "DCC Chat" },
  "|",
  { id: "notify", tip: "Notify list" },
  { id: "np", tip: "Now playing" },
  { id: "colors", tip: "Colors (Ctrl+K)" },
  "|",
  { id: "about", tip: "About mIRC" },
];

/** mIRC 6 on Windows 2000, remastered: the cascaded windows, the colors, and a channel that's alive. */
export function IrcLayout({ costume, lines, busy, waiting, error, onSend, onStop, activeId }: LayoutProps) {
  const agent = getAgent(costume.id);
  const nick = costume.assistant;
  const { ref: frame, handle } = useDesktopDrag<HTMLDivElement>();
  const input = useRef<HTMLInputElement>(null);
  const chanRef = useRef<HTMLElement>(null);

  const [fresh] = useState(() => !connectedAt);
  const [bootAt] = useState(() => connectedAt || Date.now());
  const [win, setWin] = useState<Win>(fresh ? "status" : "chan");
  const [max, setMax] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [mins, setMins] = useState<Record<Win, boolean>>({ status: false, chan: false });
  const [unread, setUnread] = useState<Record<Win, number>>({ status: 0, chan: 0 });
  const [notes, setNotes] = useState<Note[]>([]);
  const [present, setPresent] = useState<string[]>(() => crowd(activeId));
  const [aliased, setAliased] = useState<string[]>([]);
  const [net, setNet] = useState<"on" | "off" | "parted">("on");
  const [away, setAway] = useState<string | null>(null);
  const [kicked, setKicked] = useState(false);
  const [trout, setTrout] = useState<{ k: number; mine: boolean } | null>(null);
  const [balloon, setBalloon] = useState<{ k: number; title: string; text: string } | null>(null);
  const [dialog, setDialog] = useState<"nag" | "options" | null>(null);
  const [menu, setMenu] = useState<MenuName | null>(null);
  const [ctx, setCtx] = useState<{ nick: string; x: number; y: number } | null>(null);
  const [palette, setPalette] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [value, setValue] = useState("");
  const [txAt, setTxAt] = useState(0);
  const [rxAt, setRxAt] = useState(0);
  const [clearAt, setClearAt] = useState(0);
  const [mountAt] = useState(() => Date.now());
  const [topicAt] = useState(() => serverDate(Date.now() - 1000 * 60 * 60 * pick([7, 9, 13, 22, 31, 46], activeId)));

  const mood: Mood = error ? "error" : waiting ? "thinking" : busy ? "typing" : "watching";
  const defaultTopic = pick(TOPICS, activeId).replace("{y2k}", String(Math.floor(y2kLeft(bootAt) / 86_400_000)));
  const effMax = max || narrow;

  /* Lines */

  const openAt = lines[0]?.at || mountAt;
  const opening = useMemo<Row[]>(() => {
    const first = fresh ? CONNECT_MS + 200 : undefined;
    const evs: Ev[] = [
      { t: "line", tone: "join", text: `* Now talking in ${CHAN}` },
      { t: "line", tone: "topic", text: `* Topic is '${defaultTopic}'` },
      { t: "line", tone: "topic", text: `* Set by ${nick} on ${topicAt}` },
      { t: "line", tone: "notice", text: `-ChanServ- [${CHAN}] welcome, ${GUEST}! type /help for commands, !help for ${BOT}` },
      ...costume.greeting
        .replaceAll("{me}", GUEST)
        .replaceAll("{chan}", CHAN)
        .split("\n")
        .map((text): Ev => ({ t: "msg", who: nick, text })),
    ];
    return evs.map((ev, i) => ({ ...ev, key: `o${i}`, at: openAt, boot: true, stage: first === undefined ? undefined : first + i * 110 + (ev.t === "msg" ? 500 : 0) }));
  }, [costume.greeting, nick, defaultTopic, topicAt, fresh, openAt]);

  const d = useMemo(() => derive({ lines, notes, busy, nick, topic: defaultTopic, opening }), [lines, notes, busy, nick, defaultTopic, opening]);
  const me = d.me;
  const op = d.op;
  const topic = d.topic;

  /* The nick list */

  const nicklist = useMemo(() => {
    if (net !== "on") return [];
    const list: { nick: string; base: string; mode: string; you?: boolean; gpty?: boolean; away?: boolean }[] = [
      { nick, base: nick, mode: "@", gpty: true },
      ...present.map((n) => {
        const r = regular(n);
        const alias = aliased.includes(n) && r?.away;
        return { nick: alias || n, base: n, mode: r?.mode ?? "", away: !!alias };
      }),
      ...(kicked ? [] : [{ nick: me, base: me, mode: op ? "@" : "", you: true, away: !!away }]),
    ];
    const rank = (m: string) => (m === "@" ? 0 : m === "+" ? 1 : 2);
    return [...list].sort((a, b) => rank(a.mode) - rank(b.mode) || a.nick.toLowerCase().localeCompare(b.nick.toLowerCase()));
  }, [net, nick, present, aliased, kicked, me, op, away]);

  const statusRows = useMemo<Row[]>(
    () => [...connectRows(bootAt, fresh), ...notes.filter((n) => n.win === "status").map((n) => ({ ...n.ev, key: `n${n.id}`, at: n.at }))],
    [bootAt, fresh, notes],
  );

  const hidden = (r: Row) => (r.at < clearAt && clearAt > 0) || (!prefs.joins && r.t === "line" && (r.tone === "join" || r.tone === "part" || r.tone === "quit") && !r.boot && r.key.startsWith("n"));
  const chanRows = d.rows.filter((r) => !hidden(r));
  const [born] = useState(() => new Set([...d.rows, ...statusRows].map((r) => r.key)));

  const chanScroll = useStickyScroll<HTMLDivElement>(`${chanRows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}:${win}:${effMax}`);
  const statusScroll = useStickyScroll<HTMLDivElement>(`${statusRows.length}:${win}`);

  /* Notes */

  const latest = useRef({ lastLine: null as string | null, busy, win, present, aliased, net, me, onSend });
  useEffect(() => {
    latest.current = { lastLine: lines.at(-1)?.id ?? null, busy, win, present, aliased, net, me, onSend };
  });
  const seq = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const addNote = useCallback((ev: Ev, where: Win = "chan") => {
    const id = ++seq.current;
    setNotes((ns) => [...ns, { id, after: latest.current.lastLine, win: where, at: now(), ev }]);
    if (latest.current.win !== where) setUnread((u) => ({ ...u, [where]: Math.max(u[where], ev.t === "msg" ? 2 : 1) }));
    setRxAt(now());
    return id;
  }, []);
  const say = useCallback((tone: Tone, text: string, where: Win = "chan") => addNote({ t: "line", tone, text }, where), [addNote]);
  const tip = useCallback((title: string, text: string) => setBalloon({ k: nextKey(), title, text }), [setBalloon]);

  /* The connection */

  useEffect(() => {
    if (!fresh) return;
    connectedAt = bootAt;
    const t = setTimeout(() => {
      setWin("chan");
      tip(`Connected to ${NETWORK}`, `You're ${GUEST} on ${SERVER}. Type /help for commands.`);
    }, CONNECT_MS);
    let nag: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!localStorage.getItem(NAG_KEY)) nag = setTimeout(() => setDialog("nag"), 350);
    } catch {}
    return () => {
      clearTimeout(t);
      clearTimeout(nag);
    };
  }, [fresh, bootAt, tip]);

  /** Drop the line and dial back in. */
  const reconnect = useCallback(
    (why = "Leaving") => {
      if (latest.current.net !== "on") return;
      setNet("off");
      say("quit", `* Quit (${why})`);
      say("info2", "* Disconnected");
      say("info2", "* Disconnected", "status");
      later(() => say("info2", `* Connecting to ${SERVER} (${PORT})`, "status"), 700);
      later(() => say("server", `-${SERVER}- *** Found your hostname`, "status"), 1300);
      later(() => say("text", `Welcome to the ${NETWORK} IRC Network ${latest.current.me}`, "status"), 1800);
      later(() => {
        setNet("on");
        say("info2", `* Attempting to rejoin channel ${CHAN}`);
        say("join", `* Now talking in ${CHAN}`);
      }, 2400);
    },
    [later, say],
  );

  const partRejoin = useCallback(() => {
    if (latest.current.net !== "on") return;
    setNet("parted");
    say("part", `* You have left ${CHAN}`);
    later(() => {
      setNet("on");
      say("join", `* Now talking in ${CHAN}`);
    }, 1300);
  }, [later, say]);

  /* The channel is alive: people come and go, and once a visit the network splits. */

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      t = setTimeout(() => {
        const L = latest.current;
        if (!document.hidden && !L.busy && L.net === "on") ambient();
        tick();
      }, jitter(24_000, 60_000));
    };
    const ambient = () => {
      const L = latest.current;
      const movable = L.present.filter((n) => !regular(n)?.stays);
      const absent = REGULARS.filter((r) => !r.stays && !L.present.includes(r.nick));
      const r = jitter(0, 1);
      const name = (n: string) => (L.aliased.includes(n) ? (regular(n)?.away ?? n) : n);
      if (!splitDone && movable.length >= 7 && now() - connectedAt > 150_000 && r < 0.18) {
        splitDone = true;
        const gone = movable.filter((_, i) => i % 2 === 0).slice(0, 5);
        setPresent((p) => p.filter((n) => !gone.includes(n)));
        say("quit", `* Netsplit at ${SERVER} <-> hub.gpty.net. Quits: ${gone.map(name).join(", ")}`);
        tip("Netsplit!", `${gone.length} users fell off the net. They'll be back.`);
        later(() => {
          setPresent((p) => [...p, ...gone.filter((n) => !p.includes(n))]);
          say("join", `* Netsplit over, joins: ${gone.map(name).join(", ")}`);
        }, jitter(12_000, 18_000));
        return;
      }
      if (absent.length && (movable.length < 8 || r < 0.4)) {
        const who = rand(absent);
        setPresent((p) => [...p, who.nick]);
        say("join", `* Joins: ${who.nick} (${who.host})`);
        if (who.mode) later(() => say("mode", `* ChanServ sets mode: ${who.mode === "@" ? "+o" : "+v"} ${who.nick}`), 900);
        return;
      }
      if (!movable.length) return;
      const n = rand(movable);
      const reg = regular(n)!;
      if (r < 0.62) {
        setPresent((p) => p.filter((x) => x !== n));
        setAliased((a) => a.filter((x) => x !== n));
        say("part", `* Parts: ${name(n)} (${reg.host}) (${rand(PART_MSGS)})`);
      } else if (r < 0.82 || !reg.away) {
        setPresent((p) => p.filter((x) => x !== n));
        setAliased((a) => a.filter((x) => x !== n));
        say("quit", `* Quits: ${name(n)} (${reg.host}) (${rand(QUIT_MSGS)})`);
      } else {
        const on = L.aliased.includes(n);
        setAliased((a) => (on ? a.filter((x) => x !== n) : [...a, n]));
        say("nick", `* ${on ? reg.away : n} is now known as ${on ? n : reg.away}`);
      }
    };
    tick();
    return () => clearTimeout(t);
  }, [say, tip, later]);

  /* Slaps, kicks and mentions, as they happen (not the ones already in the history) */

  const fx = [...d.slaps.map((s) => `s${s.mine ? 1 : 0}${s.key}`), ...d.kicks.map((k) => `k${k}`), ...d.hls.map((k) => `h${k}`)].join(" ");
  const seenFx = useRef<Set<string> | null>(null);
  useEffect(() => {
    const keys = fx ? fx.split(" ") : [];
    if (!seenFx.current) {
      seenFx.current = new Set(keys);
      return;
    }
    const fresh = keys.filter((k) => !seenFx.current!.has(k));
    fresh.forEach((k) => seenFx.current!.add(k));
    if (fresh.length) later(() => fresh.forEach(play), 0);
    function play(k: string) {
      if (k[0] === "s") {
        setTrout({ k: nextKey(), mine: k[1] === "1" });
        later(() => jolt(chanRef.current), 640);
      } else if (k[0] === "k") {
        setKicked(true);
        jolt(chanRef.current, 460);
        later(() => setKicked(false), 2200);
        tip("Kicked!", `${nick} kicked you from ${CHAN}. Rejoining...`);
      } else if (latest.current.win !== "chan") {
        tip(`${nick} mentioned you`, `in ${CHAN}`);
      }
    }
  }, [fx, nick, later, tip]);

  // New lines from Nick light up the channel's switchbar button while you're in the status window.
  const lastReply = lines.findLast((l) => l.role === "assistant")?.id ?? null;
  const [readUpTo, setReadUpTo] = useState(lastReply);
  const badge = (w: Win) => (w === "chan" && win !== "chan" && lastReply !== readUpTo ? 2 : unread[w]);

  /* Windows */

  const show = (w: Win) => {
    if (w !== win) setReadUpTo(lastReply);
    setWin(w);
    setMins((m) => ({ ...m, [w]: false }));
    setUnread((u) => ({ ...u, [w]: 0 }));
    requestAnimationFrame(() => input.current?.focus());
  };

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 660));
    ro.observe(el);
    return () => ro.disconnect();
  }, [frame]);

  const savePrefs = (p: Partial<Prefs>) =>
    setPrefs((cur) => {
      const next = { ...cur, ...p };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

  /* Things you can do */

  const send = (text: string) => {
    onSend(text);
    setTxAt(now());
  };
  /** Sends to the channel unless Nick is still replying (there's only one line). */
  const sendNow = (text: string) => {
    if (busy || net !== "on") {
      jolt(input.current, 300);
      return false;
    }
    if (win !== "chan") show("chan");
    send(text);
    return true;
  };

  const whois = (target: string) => {
    if (target.toLowerCase() === nick.toLowerCase() || target.toLowerCase() === me.toLowerCase()) {
      addNote({ t: "whois", who: target.toLowerCase() === nick.toLowerCase() ? nick : me });
      return;
    }
    const r = regular(target);
    if (!r || !present.includes(r.nick)) return say("info", `* ${target} No such nick/channel`);
    addNote({
      t: "pre",
      lines: [
        `${target} is ${r.host} * ${r.real}`,
        `${target} on ${r.mode ?? ""}${CHAN}${r.nick === BOT ? " #y2k #help" : ""}`,
        `${target} using ${SERVER} ${NETWORK}, est. 1994`,
        `${target} has been idle ${1 + (target.length * 7) % 53}mins`,
        "End of /WHOIS list.",
      ],
    });
  };

  const ctcp = (target: string, kind: string) => {
    const k = kind.toUpperCase();
    const isNick = target.toLowerCase() === nick.toLowerCase();
    const r = regular(target);
    if (!isNick && (!r || !present.includes(r.nick))) return say("info", `* ${target} No such nick/channel`);
    say("ctcp", `-> [${target}] ${k}`);
    const reply =
      k === "PING"
        ? `${(isNick ? 1.34 : jitter(0.4, 4.2)).toFixed(2)}secs`
        : k === "VERSION"
          ? isNick
            ? NICK.version
            : r!.version
          : k === "TIME"
            ? serverDate(now())
            : null;
    later(() => (reply ? say("ctcp", `[${target} ${k} reply]: ${reply}`) : say("ctcp", `[${target}] doesn't answer ${k}`)), jitter(500, 1900));
  };

  const patchDcc = (id: number, state: Transfer["state"]) =>
    setNotes((ns) => ns.map((n) => (n.id === id && n.ev.t === "dcc" ? { ...n, ev: { ...n.ev, file: { ...n.ev.file, state } } } : n)));
  const dccTimers = useRef(new Map<number, ReturnType<typeof setTimeout>[]>());
  const fileSeq = useRef(0);
  const dccSend = (to = nick) => {
    const f = OUTBOX[fileSeq.current++ % OUTBOX.length];
    const id = ++seq.current;
    setNotes((ns) => [...ns, { id, after: latest.current.lastLine, win: "chan", at: now(), ev: { t: "dcc", id, file: { ...f, to, state: "waiting" } } }]);
    setTxAt(now());
    dccTimers.current.set(id, [
      setTimeout(() => patchDcc(id, "sending"), 1800),
      setTimeout(() => {
        patchDcc(id, "failed");
        tip("DCC Send failed", `${f.name} to ${to}: connection reset by peer.`);
      }, 1800 + 7200),
    ]);
  };
  const cancelDcc = (id: number) => {
    dccTimers.current.get(id)?.forEach(clearTimeout);
    patchDcc(id, "canceled");
  };
  useEffect(() => {
    const m = dccTimers.current;
    return () => m.forEach((list) => list.forEach(clearTimeout));
  }, []);

  const dccChat = (to = nick) => {
    say("ctcp", `* DCC Chat to ${to}: requesting...`);
    later(() => say("ctcp", `* DCC Chat session to ${to} failed (connection timed out. firewall?)`), 3200);
  };

  const notify = () => {
    const on = [nick, ...present.filter((n) => !regular(n)?.stays).slice(0, 2)];
    on.forEach((n) => say("info2", `* Notify: ${n} is on IRC`, "status"));
    say("info", "* Notify: your_crush_99 is not on IRC", "status");
    tip("Notify list", `${on.join(", ")} ${on.length > 1 ? "are" : "is"} on IRC. your_crush_99 is not :(`);
  };

  const np = () => {
    const s = rand(SONGS);
    return sendNow(`/me is listening to ${s.file} [${s.len}] (Winamp 2.5e)`);
  };

  const slap = (target = nick) => sendNow(`/me slaps ${target} around a bit with a large trout`);

  const tryJoin = (name: string) => {
    const ch = name.startsWith("#") ? name : `#${name}`;
    if (ch.toLowerCase() === CHAN) return say("info", `* You're already on ${CHAN}`);
    say("error", `* ${ch} ${pick(JOIN_FAILS, ch.toLowerCase())}`);
  };

  /** What gptybot answers to. Local, like a bot on the channel would be. */
  const bot = (text: string) => {
    const [cmd, ...rest] = text.slice(1).split(/\s+/);
    const arg = rest.join(" ").trim();
    const reply = (s: string) => later(() => addNote({ t: "msg", who: BOT, text: s }), jitter(450, 950));
    switch (cmd.toLowerCase()) {
      case "y2k":
        reply(`Y2K in ${countdown(y2kLeft(now()))}. stock up on canned beans and AA batteries.`);
        break;
      case "8ball":
        reply(arg ? `${me}: ${rand(EIGHT_BALL)}` : `${me}: ask me a question, genius.`);
        break;
      case "seen": {
        const who = arg.split(/\s/)[0];
        if (!who) reply("seen who?");
        else if (who.toLowerCase() === nick.toLowerCase()) reply(`${nick} is right here, silly. he never leaves.`);
        else if (who.toLowerCase() === me.toLowerCase()) reply(`${me}, looking for yourself? deep.`);
        else if (present.some((p) => p.toLowerCase() === who.toLowerCase())) reply(`${who} is on the channel right now.`);
        else if (regular(who)) reply(`${who} was last seen ${2 + (who.length % 9)} hours ago, quitting (${pick(QUIT_MSGS, who)}).`);
        else reply(`I don't remember seeing ${who}.`);
        break;
      }
      case "time":
        reply(`it is ${serverDate(now())}`);
        break;
      case "help":
        reply("i answer to: !y2k !8ball <question> !seen <nick> !time");
        break;
      default:
        return false;
    }
    addNote({ t: "msg", who: me, text, mine: true });
    setTxAt(now());
    return true;
  };

  /** Runs what you typed. Returns true if the input should clear. */
  const run = (raw: string): boolean => {
    const text = raw.trim();
    if (!text) return false;
    if (text.startsWith("!") && bot(text)) return true;
    if (!text.startsWith("/")) return sendNow(text);
    const [head, ...rest] = text.slice(1).split(/\s+/);
    const cmd = head.toLowerCase();
    const arg = rest.join(" ").trim();
    const first = rest[0] ?? "";
    switch (cmd) {
      case "me":
        if (arg) return sendNow(`/me ${arg}`);
        say("info", "* /me: insufficient parameters");
        return true;
      case "slap":
        return slap(first || nick);
      case "nick": {
        const taken = [nick, ...present, ...REGULARS.flatMap((r) => (r.away ? [r.away] : []))].some((n) => n.toLowerCase() === first.toLowerCase());
        if (!first) say("info", `* Your nick is ${me}`);
        else if (!NICK_OK.test(first)) say("error", `* ${first} Erroneous Nickname`);
        else if (taken) say("error", `* ${first} Nickname is already in use.`);
        else if (first !== me) return sendNow(`/nick ${first}`);
        return true;
      }
      case "np":
      case "winamp":
        return np();
      case "whois":
      case "wi":
        whois(first || nick);
        return true;
      case "list":
        addNote({ t: "list" });
        return true;
      case "join":
      case "j":
        if (!first) say("info", "* /join: insufficient parameters");
        else tryJoin(first);
        return true;
      case "part":
      case "leave":
      case "hop":
      case "cycle":
        partRejoin();
        return true;
      case "quit":
      case "exit":
      case "disconnect":
      case "server":
      case "connect":
      case "reconnect":
        reconnect(arg || "Leaving");
        return true;
      case "topic":
        if (arg && op) return sendNow(`/topic ${arg}`);
        if (!arg) say("topic", `* Topic is '${topic}'`);
        else say("error", `* ${CHAN} You're not channel operator`);
        return true;
      case "kick":
      case "k": {
        const why = rest.slice(1).join(" ");
        const target = present.find((p) => p.toLowerCase() === first.toLowerCase());
        if (!op) say("error", `* ${CHAN} You're not channel operator`);
        else if (!first) say("info", "* /kick: insufficient parameters");
        else if (first.toLowerCase() === nick.toLowerCase()) return sendNow(`/kick ${nick} ${why}`.trim());
        else if (!target) say("error", `* ${first} No such nick/channel`);
        else if (regular(target)?.stays) say("error", `* ${CHAN} ${target} is protected by ChanServ`);
        else {
          setPresent((p) => p.filter((x) => x !== target));
          say("kick", `* ${target} was kicked by ${me} (${why || me})`);
        }
        return true;
      }
      case "op":
      case "deop":
      case "voice":
      case "ban":
      case "mode":
        say("error", op ? `* ChanServ: you'll have to ask ${nick} about that` : `* ${CHAN} You're not channel operator`);
        return true;
      case "away":
        setAway(arg || "away");
        say("info", `* You have been marked as being away (${arg || "away"})`);
        return true;
      case "back":
        setAway(null);
        say("info", "* You are no longer marked as being away");
        return true;
      case "ping":
      case "version":
      case "time":
        ctcp(first || nick, cmd);
        return true;
      case "ctcp":
        if (!first || !rest[1]) say("info", "* /ctcp: insufficient parameters");
        else ctcp(first, rest[1]);
        return true;
      case "dcc":
        if (first.toLowerCase() === "send") dccSend(rest[1] || nick);
        else if (first.toLowerCase() === "chat") dccChat(rest[1] || nick);
        else say("info", "* /dcc: use /dcc send <nick> or /dcc chat <nick>");
        return true;
      case "clear":
      case "cls":
        setClearAt(now());
        return true;
      case "help":
        addNote({ t: "help" });
        return true;
      case "names":
        say("info", `* Names ${CHAN}: ${nicklist.map((n) => n.mode + n.nick).join(" ")}`);
        return true;
      case "motd":
        show("status");
        return true;
      case "msg":
      case "query":
      case "notice":
        say("info", `* ${first || nick} only talks in the channel ("keeps things public", he says)`);
        return true;
      case "nudge":
        say("info", "* /nudge: wrong decade. try /slap");
        return true;
      case "call":
        say("info", "* /call: this is IRC. we type here.");
        return true;
      default:
        say("error", `* /${head}: Unknown command`);
        return true;
    }
  };

  /* Input: Enter runs it, ↑/↓ recall, Tab completes nicks, Ctrl+K colors, Esc stops Nick */

  const history = useRef<string[]>([]);
  const hpos = useRef(-1);
  const tab = useRef<{ stem: string; start: number; i: number; len: number } | null>(null);

  const submit = () => {
    const text = value;
    if (!text.trim()) return;
    if (run(text)) {
      history.current = [text, ...history.current.filter((h) => h !== text)].slice(0, 30);
      hpos.current = -1;
      setValue("");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Tab") tab.current = null;
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const h = history.current;
      if (!h.length) return;
      e.preventDefault();
      hpos.current = Math.max(-1, Math.min(h.length - 1, hpos.current + (e.key === "ArrowUp" ? 1 : -1)));
      setValue(hpos.current < 0 ? "" : h[hpos.current]);
    } else if (e.key === "Tab") {
      const el = e.currentTarget;
      const caret = el.selectionStart ?? value.length;
      const at = value.slice(0, caret).search(/\S+$/);
      const t = tab.current ?? (at < 0 ? null : { stem: value.slice(at, caret), start: at, i: -1, len: caret - at });
      if (!t) return;
      const isCmd = t.stem.startsWith("/");
      const pool = isCmd
        ? COMMANDS.filter((c) => c.cmd.startsWith("/")).map((c) => c.cmd.split(" ")[0])
        : nicklist.map((n) => n.nick).filter((n) => n !== me);
      const hits = pool.filter((n) => n.toLowerCase().startsWith(t.stem.toLowerCase()));
      if (!hits.length) return;
      e.preventDefault();
      const i = (t.i + 1) % hits.length;
      const word = hits[i] + (isCmd || t.start > 0 ? " " : ": ");
      tab.current = { ...t, i, len: word.length };
      setValue(value.slice(0, t.start) + word + value.slice(t.start + t.len));
      const pos = t.start + word.length;
      requestAnimationFrame(() => el.setSelectionRange(pos, pos));
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setPalette((p) => !p);
    } else if (e.key === "Escape") {
      if (palette) setPalette(false);
      else if (busy) onStop();
    }
  };

  const insert = (text: string) => {
    setValue(text);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(text.length, text.length);
    });
  };

  /* Toolbar, menus */

  const tool = (id: ToolId) => {
    switch (id) {
      case "connect":
        return reconnect("Reconnecting");
      case "options":
        return setDialog("options");
      case "channels":
        return addNote({ t: "list" });
      case "send":
        return dccSend(nick);
      case "chat":
        return dccChat(nick);
      case "notify":
        return notify();
      case "np":
        return np();
      case "colors":
        return setPalette((p) => !p);
      case "about":
        return setDialog("nag");
    }
  };

  /**
   * Menu entries name what they do: a command line (anything you could type)
   * or a "ui:" action for the window itself. Carried out on click only.
   */
  const menus: Record<MenuName, Item[]> = {
    File: [
      { label: "Connect", act: "/reconnect Reconnecting", hint: "F2" },
      { label: "Disconnect", act: "/quit Leaving" },
      "-",
      { label: "Options...", act: "ui:options", hint: "Alt+O" },
    ],
    View: [
      { label: "Toolbar", checked: prefs.toolbar, act: "ui:toolbar" },
      { label: "Switchbar", checked: prefs.switchbar, act: "ui:switchbar" },
      { label: "Nick list", checked: prefs.nicks, act: "ui:nicks" },
      "-",
      { label: "Timestamps", checked: prefs.stamps, act: "ui:stamps" },
      { label: "Joins and parts", checked: prefs.joins, act: "ui:joins" },
    ],
    Favorites: [
      ...["#gpty", "#y2k", "#winamp", "#help", "#mp3"].map((c): Item => ({ label: c, act: `/join ${c}` })),
      "-",
      { label: "Organize Favorites...", disabled: true },
    ],
    Tools: [
      { label: "Channels List", act: "/list" },
      { label: "DCC Send...", act: `/dcc send ${nick}` },
      { label: "DCC Chat...", act: `/dcc chat ${nick}` },
      { label: "Notify List", act: "ui:notify" },
      "-",
      { label: "Colors...", act: "ui:colors", hint: "Ctrl+K" },
      { label: "Scripts Editor", disabled: true },
    ],
    Commands: [
      { label: `Whois ${nick}`, act: `/whois ${nick}` },
      { label: `Slap ${nick} with a trout`, act: `/slap ${nick}`, disabled: busy },
      { label: "Now playing", act: "/np", disabled: busy },
      { label: away ? "Back" : "Away", act: away ? "/back" : "/away brb" },
      "-",
      { label: "Clear window", act: "/clear" },
    ],
    Window: [
      { label: `1 Status: ${me} [+i] on ${SERVER}`, checked: win === "status", act: "ui:status" },
      { label: `2 ${CHAN}`, checked: win === "chan", act: "ui:chan" },
      "-",
      { label: "Cascade", act: "ui:cascade", disabled: narrow },
      { label: "Maximize", act: "ui:maximize" },
    ],
    Help: [
      { label: "Help Topics", act: "/help", hint: "F1" },
      { label: `${BOT} commands`, act: "!help" },
      "-",
      { label: "Register mIRC...", act: "ui:nag" },
      { label: "About mIRC", act: "ui:nag" },
    ],
  };

  const perform = (act: string) => {
    if (!act.startsWith("ui:")) {
      run(act);
      return;
    }
    const what = act.slice(3);
    switch (what) {
      case "options":
      case "nag":
        return setDialog(what);
      case "toolbar":
      case "switchbar":
      case "nicks":
      case "stamps":
      case "joins":
        return savePrefs({ [what]: !prefs[what] });
      case "notify":
        return notify();
      case "colors":
        return setPalette(true);
      case "status":
      case "chan":
        return show(what);
      case "cascade":
        return setMax(false);
      case "maximize":
        return setMax(true);
    }
  };

  // Close menus and popups on outside click or Escape.
  const anyPop = !!menu || !!ctx || palette;
  useEffect(() => {
    if (!anyPop) return;
    const down = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest(".irc-pop, .irc-menubar button, .irc-palette-btn")) {
        setMenu(null);
        setCtx(null);
        setPalette(false);
      }
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setCtx(null);
        setPalette(false);
      }
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [anyPop]);

  const pickItem = (it: Item) => {
    if (it === "-" || it.disabled) return;
    setMenu(null);
    setCtx(null);
    if (it.act) perform(it.act);
    requestAnimationFrame(() => {
      if (!document.querySelector(".irc-dialog")) input.current?.focus();
    });
  };

  const nickItems = (target: string): Item[] => {
    const self = target === me;
    return [
      { label: "Whois", act: `/whois ${target}` },
      { label: "Slap with a large trout", act: `/slap ${target}`, disabled: self || busy },
      "-",
      { label: "CTCP Ping", act: `/ping ${target}`, disabled: self },
      { label: "CTCP Version", act: `/version ${target}`, disabled: self },
      { label: "CTCP Time", act: `/time ${target}`, disabled: self },
      "-",
      { label: "DCC Send...", act: `/dcc send ${target}`, disabled: self },
      { label: "DCC Chat", act: `/dcc chat ${target}`, disabled: self },
      "-",
      { label: "Kick", act: `/kick ${target}`, disabled: !op || self },
      { label: "Ban", disabled: true },
    ];
  };

  const myColor = prefs.color === null ? undefined : PALETTE[prefs.color];
  const editbox = (
            <div className="irc-inputrow">
              <input
                ref={input}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  hpos.current = -1;
                }}
                onKeyDown={onKeyDown}
                aria-label={win === "chan" ? `Message ${CHAN}` : "Command"}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                className="irc-input irc-text"
                style={myColor ? { color: myColor } : undefined}
                placeholder={lines.length ? "" : "say hi, or try /help"}
              />
              <button
                type="button"
                className="irc-palette-btn"
                title="Colors (Ctrl+K)"
                aria-haspopup="dialog"
                aria-expanded={palette}
                onClick={() => setPalette((p) => !p)}
              >
                <span style={{ background: myColor ?? "#000" }} />
              </button>
              {palette && (
                <Palette
                  current={prefs.color}
                  onPick={(c) => {
                    savePrefs({ color: c });
                    setPalette(false);
                    input.current?.focus();
                  }}
                />
              )}
            </div>
  );
  const typing = waiting && net === "on";
  const chanTitle = `${CHAN} [+nt]: ${topic}`;
  const statusTitle = `Status: ${me} [+i] on ${SERVER} (${PORT})`;

  return (
    <div
      className={`${pixel.variable} irc flex h-full items-center justify-center`}
      onKeyDown={(e) => {
        if (e.altKey && e.code === "KeyO") {
          e.preventDefault();
          setDialog("options");
        }
      }}
    >
      <div ref={frame} className="irc-window" data-narrow={narrow ? "" : undefined} style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}>
        <header className="irc-titlebar" {...handle}>
          <MircMark className="h-4 w-4 shrink-0" />
          <span className="truncate">mIRC - [{win === "chan" ? chanTitle : statusTitle}]</span>
          <span className="irc-caps" aria-hidden>
            <span className="irc-cap"><Glyph kind="min" /></span>
            <span className="irc-cap"><Glyph kind="max" /></span>
            <span className="irc-cap irc-cap-x"><Glyph kind="close" /></span>
          </span>
        </header>

        <nav className="irc-menubar" aria-label="Menu">
          {MENU_NAMES.map((m) => (
            <div key={m} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={menu === m}
                data-open={menu === m ? "" : undefined}
                onClick={() => setMenu((cur) => (cur === m ? null : m))}
                onPointerEnter={() => menu && menu !== m && setMenu(m)}
              >
                {m}
              </button>
              {menu === m && <MenuList items={menus[m]} onPick={pickItem} className="irc-dropdown" />}
            </div>
          ))}
          {effMax && (
            <span className="irc-mdi-caps">
              <ChannelMark status={win === "status"} className="mr-auto h-3.5 w-3.5" />
              <button type="button" className="irc-cap" title="Minimize" onClick={() => setMins((s) => ({ ...s, [win]: true }))}>
                <Glyph kind="min" />
              </button>
              {!narrow && (
                <button type="button" className="irc-cap" title="Restore" onClick={() => setMax(false)}>
                  <Glyph kind="restore" />
                </button>
              )}
              <button type="button" className="irc-cap" title={win === "chan" ? "Part channel" : "Close"} onClick={() => (win === "chan" ? partRejoin() : show("chan"))}>
                <Glyph kind="close" />
              </button>
            </span>
          )}
        </nav>

        {prefs.toolbar && (
          <div className="irc-toolbar" role="toolbar" aria-label="Toolbar">
            {TOOLS.map((t, i) =>
              t === "|" ? (
                <span key={i} className="irc-sep" aria-hidden />
              ) : (
                <button
                  key={t.id}
                  type="button"
                  className="irc-tool"
                  data-id={t.id}
                  data-tip={t.tip}
                  aria-label={t.tip}
                  aria-pressed={t.id === "colors" ? palette : undefined}
                  disabled={(t.id === "np" && busy) || (t.id === "connect" && net !== "on")}
                  onClick={() => tool(t.id)}
                >
                  <ToolIcon id={t.id} />
                </button>
              ),
            )}
            <OnlineTimer since={bootAt} off={net === "off"} />
          </div>
        )}

        {prefs.switchbar && (
          <div className="irc-switchbar" role="tablist" aria-label="Windows">
            {(["status", "chan"] as Win[]).map((w) => (
              <button
                key={w}
                type="button"
                role="tab"
                aria-selected={win === w}
                className="irc-switch"
                data-unread={badge(w) || undefined}
                onClick={() => (win === w && !mins[w] ? setMins((s) => ({ ...s, [w]: true })) : show(w))}
              >
                <ChannelMark status={w === "status"} />
                <span className="truncate">{w === "status" ? SERVER : CHAN}</span>
              </button>
            ))}
          </div>
        )}

        <div className="irc-mdi" data-max={effMax ? "" : undefined}>
          <MdiBackdrop />

          {/* Status window */}
          <section
            className="irc-child"
            data-slot="a"
            data-active={win === "status" ? "" : undefined}
            data-min={mins.status ? "" : undefined}
            aria-label="Status window"
            onPointerDown={() => win !== "status" && show("status")}
          >
            {!effMax && (
              <ChildBar
                title={statusTitle}
                status
                active={win === "status"}
                onMin={() => setMins((s) => ({ ...s, status: true }))}
                onMax={() => setMax(true)}
                onClose={() => show("chan")}
              />
            )}
            <div className="irc-panes">
              <div ref={statusScroll} className="irc-log irc-text" aria-live="polite">
                {statusRows.map((r) => (
                  <LogRow key={r.key} row={r} born={born} fresh={fresh} stamps={false} nick={nick} me={me} myColor={myColor} />
                ))}
              </div>
            </div>
            {win === "status" ? editbox : <div className="irc-inputrow" aria-hidden><span className="irc-input irc-input-idle" /></div>}
          </section>

          {/* Channel window */}
          <section
            className="irc-child"
            data-slot="b"
            data-active={win === "chan" ? "" : undefined}
            data-min={mins.chan ? "" : undefined}
            ref={chanRef}
            aria-label={`${CHAN} channel`}
            onPointerDown={() => win !== "chan" && show("chan")}
          >
            {!effMax && (
              <ChildBar
                title={chanTitle}
                active={win === "chan"}
                onMin={() => setMins((s) => ({ ...s, chan: true }))}
                onMax={() => setMax(true)}
                onClose={partRejoin}
              />
            )}
            <div className="irc-topic" title={topic}>
              <b>{CHAN}</b>
              <span key={topic} className="irc-topic-text truncate">
                {topic}
              </span>
              <span className="irc-topic-count">{nicklist.length} users</span>
            </div>
            <div className="irc-panes">
              <div className="irc-logwrap" data-kicked={kicked ? "" : undefined}>
                <LogBackdrop />
                <div ref={chanScroll} className="irc-log irc-text" aria-live="polite">
                  {chanRows.map((r) => (
                    <LogRow
                      key={r.key}
                      row={r}
                      born={born}
                      fresh={fresh}
                      stamps={prefs.stamps}
                      nick={nick}
                      me={me}
                      myColor={myColor}
                      agent={agent}
                      mood={mood}
                      lastNickAt={d.lastNickAt}
                      onCancelDcc={cancelDcc}
                      onInsert={insert}
                      onJoin={tryJoin}
                    />
                  ))}
                  {error && (
                    <p className="irc-row" data-tone="error">
                      {costume.error}
                    </p>
                  )}
                </div>
                {typing && (
                  <div className="irc-typing irc-text" aria-hidden>
                    <span className="irc-pen" /> {costume.typing.replace(/\.+$/, "")}
                    <span className="irc-dots">
                      <i>.</i>
                      <i>.</i>
                      <i>.</i>
                    </span>
                  </div>
                )}
                {trout && (
                  <div key={trout.k} className="irc-trout" data-dir={trout.mine ? "out" : "in"} onAnimationEnd={(e) => e.target === e.currentTarget && setTrout(null)} aria-hidden>
                    <Trout />
                  </div>
                )}
              </div>
              {prefs.nicks && (
                <ul className="irc-nicks irc-text" aria-label="Nick list">
                  {nicklist.map((n) => (
                    <li key={n.base}>
                      <button
                        type="button"
                        data-sel={ctx?.nick === n.nick ? "" : undefined}
                        data-away={n.away ? "" : undefined}
                        data-you={n.you ? "" : undefined}
                        onClick={(e) => {
                          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          const host = (e.currentTarget.closest(".irc-window") as HTMLElement).getBoundingClientRect();
                          setCtx(ctx?.nick === n.nick ? null : { nick: n.nick, x: r.left - host.left - 150, y: Math.min(r.bottom - host.top, host.height - 300) });
                        }}
                        onDoubleClick={() => {
                          setCtx(null);
                          whois(n.nick);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          const host = (e.currentTarget.closest(".irc-window") as HTMLElement).getBoundingClientRect();
                          setCtx({ nick: n.nick, x: Math.min(e.clientX - host.left, host.width - 200), y: Math.min(e.clientY - host.top, host.height - 300) });
                        }}
                      >
                        <span className="irc-mode">{n.mode}</span>
                        <span className="truncate">{n.nick}</span>
                        {n.gpty && (
                          <span className="irc-nick-gpty">
                            <Gpty agent={agent} size={15} mood={mood} />
                          </span>
                        )}
                        {n.gpty && typing && <span className="irc-pen irc-pen-sm" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {win === "chan" ? editbox : <div className="irc-inputrow" aria-hidden><span className="irc-input irc-input-idle" /></div>}
          </section>

          {/* Minimized children sit along the bottom, like MDI icons. */}
          {(["status", "chan"] as Win[]).map(
            (w, i) =>
              mins[w] && (
                <button key={w} type="button" className="irc-minbar" style={{ left: 8 + i * 172 }} onClick={() => show(w)}>
                  <ChannelMark status={w === "status"} />
                  <span className="truncate">{w === "status" ? SERVER : CHAN}</span>
                  <span className="irc-cap" aria-hidden>
                    <Glyph kind="restore" />
                  </span>
                </button>
              ),
          )}

          {dialog === "nag" && (
            <NagDialog
              onClose={() => {
                setDialog(null);
                try {
                  localStorage.setItem(NAG_KEY, "1");
                } catch {}
                input.current?.focus();
              }}
            />
          )}
          {dialog === "options" && (
            <OptionsDialog
              me={me}
              prefs={prefs}
              busy={busy}
              onClose={() => {
                setDialog(null);
                input.current?.focus();
              }}
              onApply={(p, newNick) => {
                savePrefs(p);
                if (newNick && newNick !== me) run(`/nick ${newNick}`);
              }}
            />
          )}
        </div>

        <footer className="irc-statusbar">
          <span className="irc-panel irc-panel-grow truncate">
            {net === "off" ? `Connecting to ${SERVER}...` : `Connected to ${SERVER} (${PORT})`}
            {away && <span className="irc-away"> · Away: {away}</span>}
          </span>
          <Lag busy={busy} waiting={waiting} off={net !== "on"} />
          <span className="irc-panel irc-y2k" title="Time left until the year 2000">
            Y2K: <Y2K />
          </span>
          <Tray tx={txAt} rx={rxAt} streaming={busy && !waiting} off={net === "off"} />
          <span className="irc-grip" aria-hidden />
        </footer>

        {menu === null && ctx && (
          <MenuList
            items={nickItems(ctx.nick)}
            onPick={pickItem}
            className="irc-ctx"
            style={{ left: Math.max(4, ctx.x), top: ctx.y }}
            title={ctx.nick}
          />
        )}

        {balloon && (
          <div key={balloon.k} className="irc-balloon" role="status" onAnimationEnd={(e) => e.target === e.currentTarget && setBalloon(null)}>
            <div className="irc-balloon-head">
              <InfoBubble />
              <b className="truncate">{balloon.title}</b>
              <button type="button" aria-label="Close" onClick={() => setBalloon(null)}>
                <Glyph kind="close" />
              </button>
            </div>
            <p>{balloon.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** The crowd you walk into: mostly the same regulars, a little different each channel. */
function crowd(seed: string) {
  const extras = REGULARS.filter((r) => !STARTERS.includes(r.nick));
  return [...STARTERS.filter((n, i) => i < 2 || pick([1, 1, 1, 1, 0], seed + n)), pick(extras, seed).nick];
}


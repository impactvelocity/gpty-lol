"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gpty, type Mood } from "@/components/Gpty";
import {
  art,
  type ArtSlot,
  BackColorIcon,
  Burst,
  DiggingSign,
  EventIcon,
  type EventId,
  Flower,
  IcqDefs,
  isTool,
  MessageNote,
  ModemBox,
  ModemLights,
  type Status,
  TextColorIcon,
  ToolIcon,
  type ToolId,
  Trophy,
} from "@/components/icq/art";
import { EMOTES, Emote, Rich } from "@/components/icq/emoticons";
import "@/components/icq/icq.css";
import { getAgent } from "@/lib/agents";
import { useComposer, useDesktopDrag, useNow, useOnNewReply, useStickyScroll } from "./hooks";
import { type ChatLine, clock, type LayoutProps } from "./types";

/**
 * A "/chat" line alone at the top of a reply is your contact asking you into
 * an ICQ Chat: the live split screen where you watch each other type.
 */
export const CHAT = "/chat";

const UIN = "31337";
const EMAIL = "daisy.31337@icqmail.com";
const HOMEPAGE = "www.geocities.com/daisy_31337";
/** Online messages were capped at 450 characters. */
const MAX_CHARS = 450;

/** The status menu, with the auto-messages ICQ filled in for you. */
const STATUSES: { id: Status; label: string; auto?: string }[] = [
  { id: "online", label: "Online" },
  { id: "ffc", label: "Free For Chat" },
  { id: "away", label: "Away", auto: "I'm away from the computer right now. Leave a message and I'll get back to you!" },
  { id: "na", label: "N/A (Extended Away)", auto: "I am out'a here. See you around!" },
  { id: "occupied", label: "Occupied (Urgent Msgs)", auto: "Please do not disturb me now. Disturb me later." },
  { id: "dnd", label: "DND (Do not Disturb)", auto: "Please do not disturb me now. Disturb me later." },
  { id: "invisible", label: "Privacy (Invisible)" },
  { id: "offline", label: "Offline" },
];
const STATUS_KEY = "gpty.icq.status";

/** Signing on, as Dial-up Networking narrated it. */
const DIAL = ["Dialing...", "Verifying username and password...", "Logging on to network...", "Connecting to the ICQ server..."];
const CONNECT_MS = 2600;

/** The 16 colors every color picker had in 2000, in the order it had them. */
const PALETTE = [
  "#000000", "#800000", "#008000", "#808000", "#000080", "#800080", "#008080", "#808080",
  "#c0c0c0", "#ff0000", "#00ff00", "#ffff00", "#0000ff", "#ff00ff", "#00ffff", "#ffffff",
];
type Ink = { fg: string; bg: string };
const PLAIN: Ink = { fg: "#000000", bg: "#ffffff" };
const INK_KEY = "gpty.icq.ink";

function loadStatus(): Status {
  try {
    const v = localStorage.getItem(STATUS_KEY);
    return STATUSES.some((s) => s.id === v) ? (v as Status) : "online";
  } catch {
    return "online";
  }
}

function loadInk(): Ink {
  try {
    const v = JSON.parse(localStorage.getItem(INK_KEY) ?? "null");
    return PALETTE.includes(v?.fg) && PALETTE.includes(v?.bg) ? { fg: v.fg, bg: v.bg } : PLAIN;
  } catch {
    return PLAIN;
  }
}

function seeded(seed: string, n: number, salt = 0) {
  let h = salt;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % n;
}

/** "11/6/00 10:42 PM": the date as the history wrote it. It's 2000 in here. */
function stamp(at: number) {
  const d = new Date(at);
  return `${d.getMonth() + 1}/${d.getDate()}/00 ${clock(at)}`;
}

/* ───────── Toolbar, menus, ads ───────── */

const TOOLS: { id: ToolId; label: string; title: string }[] = [
  { id: "info", label: "Info", title: "User Details" },
  { id: "chat", label: "Chat", title: "Request an ICQ Chat" },
  { id: "file", label: "File", title: "Send a file" },
  { id: "random", label: "Random", title: "Find a Random Chat Partner" },
  { id: "history", label: "History", title: "Message History" },
];

type MoreId = "url" | "contacts" | "card" | "email" | "phone";
const MORE: { id: MoreId; label: string; icon: EventId }[] = [
  { id: "url", label: "Send Web Page Address (URL)...", icon: "web" },
  { id: "contacts", label: "Send Contacts...", icon: "contacts" },
  { id: "card", label: "Send Greeting Card...", icon: "card" },
  { id: "email", label: "Send Email...", icon: "out" },
  { id: "phone", label: "ICQphone Call...", icon: "phone" },
];

function moreNote(id: MoreId, buddy: string) {
  switch (id) {
    case "url":
      return `You sent ${buddy} the address of your homepage. It's still under construction.`;
    case "contacts":
      return `Your contact list has exactly one contact: ${buddy}. Sending ${buddy} to ${buddy} seemed silly.`;
    case "card":
      return `Greeting card "Happy Y2K Survival!" sent to ${buddy}. It plays a MIDI.`;
    case "email":
      return "Your email program is busy downloading message 1 of 214. Try again in a minute.";
    case "phone":
      return `ICQphone: ${buddy}'s line is busy. (${buddy} is online, so the phone line is in use.)`;
  }
}

/** What "Send File" tries to send, in turn. None of it ever arrives. */
const OUTBOX = [
  { name: "dancing_baby.avi", kb: 1946 },
  { name: "all_star.mp3", kb: 3480 },
  { name: "my_winamp_skin.wsz", kb: 412 },
  { name: "funny_cat.jpg", kb: 236 },
];
const LOST = [
  "Connection lost. Someone picked up the phone.",
  "Transfer interrupted: call waiting knocked your modem offline.",
  "Transfer failed. The other computer stopped responding (Ctrl+Alt+Del?).",
];

/** Random Chat finds someone every time. They never stay. */
const STRANGERS = [
  { group: "Games", nick: "Kev", uin: "7210482", says: "anyone wanna trade pokemon??" },
  { group: "Students", nick: "~*Jess*~", uin: "45120993", says: "ugh finals. distract me" },
  { group: "Music", nick: "DJ_Mike", uin: "3389021", says: "who else is still awake" },
  { group: "20 Something", nick: "matrix_fan_99", uin: "61004117", says: "there is no spoon. hi" },
];

type AdId = "visitor" | "smileys" | "modem" | "homepage";
interface Ad {
  id: AdId;
  slot: ArtSlot;
  head: string;
  sub: string;
  cta: string;
  click: string;
}
const ADS: Ad[] = [
  {
    id: "visitor",
    slot: "adVisitor",
    head: "CONGRATULATIONS!!!",
    sub: "You are our 1,000,000th visitor! You may have already won!",
    cta: "CLAIM PRIZE",
    click: "Your prize is being processed. Please keep this window open for 6 to 8 weeks.",
  },
  {
    id: "smileys",
    slot: "adSmileys",
    head: "FREE Smileys for ICQ!",
    sub: "Over 10,000 animated smileys. 100% FREE. No catch!",
    cta: "DOWNLOAD",
    click: "Download stopped at 4%. Your modem is busy (you're on ICQ).",
  },
  {
    id: "modem",
    slot: "adModem",
    head: "STILL ON 56K?",
    sub: "Get ISDN: up to 128k! Ask your phone company today.",
    cta: "LEARN MORE",
    click: "Opening your browser... loading image 3 of 41. Estimated time: a while.",
  },
  {
    id: "homepage",
    slot: "adHomepage",
    head: "Make your own HOMEPAGE!",
    sub: "FREE 5 MB, a guestbook and a hit counter",
    cta: "SIGN UP",
    click: "This page is under construction. Please come back soon!",
  },
];

/* ───────── What the history shows ───────── */

/** A transfer you canceled, frozen where it was. */
function stopped(): Partial<Transfer> {
  return { state: "canceled", t1: Date.now() };
}

interface Transfer {
  name: string;
  kb: number;
  state: "waiting" | "sending" | "failed" | "canceled";
  /** When it started sending, and when it stopped. */
  t0: number;
  t1?: number;
  reason?: string;
}

interface Note {
  id: number;
  /** Shown after this line (null: right after the greeting). */
  after: string | null;
  icon: ToolId | EventId;
  text: string;
  at: number;
  file?: Transfer;
}

type Msg = { kind: "msg"; key: string; mine: boolean; text: string; at: number };
type Row = Msg | { kind: "chatreq"; key: string; at: number } | { kind: "note"; key: string; note: Note };

/**
 * Lines become rows: a "/chat" line in a reply becomes a chat request, and
 * notes slot in after the line they followed.
 */
function toRows(greeting: string, lines: ChatLine[], notes: Note[], busy: boolean): Row[] {
  const rows: Row[] = [{ kind: "msg", key: "greeting", mine: false, text: greeting, at: 0 }];
  const notesAfter = (id: string | null) => {
    for (const n of notes) if (n.after === id) rows.push({ kind: "note", key: `n${n.id}`, note: n });
  };
  notesAfter(null);
  lines.forEach((l, i) => {
    if (l.role === "user") {
      rows.push({ kind: "msg", key: l.id, mine: true, text: l.text, at: l.at });
    } else {
      const live = busy && i === lines.length - 1;
      const parts = l.text.split("\n");
      const kept: string[] = [];
      parts.forEach((s, j) => {
        const t = s.trim().toLowerCase();
        if (t === CHAT) rows.push({ kind: "chatreq", key: `${l.id}:${j}`, at: l.at });
        // Hide a "/ch" that is still streaming in, so it never flashes as text.
        else if (!(live && j === parts.length - 1 && t.startsWith("/") && CHAT.startsWith(t))) kept.push(s);
      });
      // A message is one block of lines, like it came out of a 450-character box.
      const text = kept.join("\n").replace(/\n\s*\n+/g, "\n").trim();
      if (text) rows.push({ kind: "msg", key: l.id, mine: false, text, at: l.at });
    }
    notesAfter(l.id);
  });
  return rows;
}

/** A reply as plain text, without its chat request. */
function replyText(text: string) {
  return text
    .split("\n")
    .filter((s) => s.trim().toLowerCase() !== CHAT)
    .join("\n")
    .trim();
}

/* ───────── The window ───────── */

type Toast = { k: number; kind: "online" | "says" | "chatreq"; id?: string };
type Menu = "status" | "smileys" | "fg" | "bg" | "more" | "info" | null;

/** Only one sign-on (and one "is Online" alert) per visit. */
let signedOn = false;

/** ICQ 2000b on Windows 98, remastered: the Message Session window, the flower and the "Uh-oh!". */
export function IcqLayout({ costume, lines, busy, waiting, error, onSend, onStop, activeId }: LayoutProps) {
  const agent = getAgent(costume.id);
  const buddy = costume.assistant;
  const me = costume.user;
  // Drag the window around the chat area by its title bar, like a desktop.
  const { ref: win, handle } = useDesktopDrag<HTMLDivElement>();
  const input = useRef<HTMLTextAreaElement>(null);

  const [status, setStatus] = useState<Status>(loadStatus);
  const [dialing, setDialing] = useState(() => !signedOn && loadStatus() !== "offline");
  const [dialT0, setDialT0] = useState(() => Date.now());
  const [since] = useState(() => Date.now() - (17 + seeded(activeId, 140)) * 60_000);
  const [menu, setMenu] = useState<Menu>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [ink, setInk] = useState<Ink>(loadInk);
  const [chat, setChat] = useState<"off" | "asking" | "on">("off");
  const [toast, setToast] = useState<Toast | null>(null);
  const [flash, setFlash] = useState<"a" | "b" | undefined>();
  const [ad, setAd] = useState(() => seeded(activeId, ADS.length, 3));
  const [auth, setAuth] = useState({ added: false, authorized: false });
  const [multi, setMulti] = useState(false);

  const mood: Mood = error ? "error" : waiting ? "thinking" : busy ? "typing" : "watching";
  const statusInfo = STATUSES.find((s) => s.id === status) ?? STATUSES[0];

  const rows = useMemo(() => toRows(costume.greeting, lines, notes, busy), [costume.greeting, lines, notes, busy]);
  const scroller = useStickyScroll<HTMLDivElement>(`${rows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}:${chat === "on"}`);

  /* Timers and the latest values, for callbacks that fire later */

  const latest = useRef({ lastLine: null as string | null, status, chat });
  useEffect(() => {
    latest.current = { lastLine: lines.at(-1)?.id ?? null, status, chat };
  });
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);
  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
    return t;
  }, []);

  const seq = useRef(0);
  const addNote = useCallback((icon: Note["icon"], text: string, file?: Transfer) => {
    const id = ++seq.current;
    setNotes((ns) => [...ns, { id, after: latest.current.lastLine, icon, text, at: Date.now(), file }]);
    return id;
  }, []);

  /* Signing on */

  // The first window of a visit dials up, then your buddy's Online Alert pops up.
  const firstDial = useRef(dialing);
  useEffect(() => {
    if (!firstDial.current) return;
    const t = setTimeout(() => {
      signedOn = true;
      setDialing(false);
      setToast((cur) => cur ?? { k: Date.now(), kind: "online" });
    }, CONNECT_MS);
    return () => clearTimeout(t);
  }, []);

  const dial = (then?: () => void) => {
    setDialing(true);
    setDialT0(Date.now());
    later(() => {
      setDialing(false);
      then?.();
    }, CONNECT_MS);
  };

  const saveStatus = (s: Status) => {
    setStatus(s);
    try {
      localStorage.setItem(STATUS_KEY, s);
    } catch {}
  };

  /** Offline? Sending dials back in first. */
  const send = (text: string) => {
    if (status !== "offline") return onSend(text);
    saveStatus("online");
    dial(() => onSend(text));
  };
  const { value, setValue, submit, onKeyDown } = useComposer(send, busy || dialing);

  // Alt+S sends, like the underlined S on the button always promised.
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.code !== "KeyS") return;
      e.preventDefault();
      submitRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const chooseStatus = (s: Status) => {
    setMenu(null);
    if (s === status) return;
    const was = status;
    saveStatus(s);
    const info = STATUSES.find((x) => x.id === s)!;
    if (s === "offline") return addNote("status", "You are now Offline. Send a message to dial back in.");
    if (was === "offline") dial();
    if (info.auto) {
      const quietNow = s === "occupied" || s === "dnd";
      addNote("status", `Your status is now ${info.label}. Auto-message: "${info.auto}"${quietNow ? " Pop-ups are off." : ""}`);
    } else if (s === "invisible") addNote("status", `You're invisible. ${buddy} can't see you're online, but you can still talk.`);
    else if (s === "ffc") addNote("status", "You're Free For Chat. Anybody can ask you into a chat!");
    else addNote("status", `Your status is now ${info.label}.`);
  };

  /* ICQ Chat */

  const requestChat = () => {
    if (chat === "on") {
      setChat("off");
      addNote("chat", "You left the ICQ Chat. Back to messages.");
      return;
    }
    if (chat === "asking") return;
    setChat("asking");
    addNote("chat", `ICQ Chat request sent to ${buddy}. Waiting for a reply...`);
    later(() => {
      setChat((c) => (c === "asking" ? "on" : c));
      addNote("chat", `${buddy} accepted your chat request.`);
    }, 2000);
  };

  // Your buddy asks you into a chat. Requests already in the history stay quiet.
  const asks = rows
    .filter((r) => r.kind === "chatreq")
    .map((r) => r.key)
    .join(" ");
  const seenAsks = useRef<Set<string> | null>(null);
  useEffect(() => {
    const keys = asks ? asks.split(" ") : [];
    if (!seenAsks.current) {
      seenAsks.current = new Set(keys);
      return;
    }
    const fresh = keys.filter((k) => !seenAsks.current!.has(k));
    if (!fresh.length) return;
    fresh.forEach((k) => seenAsks.current!.add(k));
    const { status: s, chat: c } = latest.current;
    if (c === "on") return;
    if (s === "occupied" || s === "dnd") {
      const label = STATUSES.find((x) => x.id === s)?.label ?? s;
      addNote("chat", `${buddy}'s chat request was declined automatically. You're ${label}.`);
    } else setToast({ k: Date.now(), kind: "chatreq" });
  }, [asks, addNote, buddy]);

  const acceptChat = () => {
    setToast(null);
    setChat("on");
    addNote("chat", `You accepted ${buddy}'s chat request.`);
  };
  const declineChat = () => {
    setToast(null);
    addNote("chat", `You declined ${buddy}'s chat request.`);
  };

  /* Send File */

  const fileSeq = useRef(0);
  const fileTimers = useRef(new Map<number, ReturnType<typeof setTimeout>[]>());
  const patchFile = (id: number, p: Partial<Transfer>) =>
    setNotes((ns) => ns.map((n) => (n.id === id && n.file ? { ...n, file: { ...n.file, ...p } } : n)));

  const sendFile = () => {
    const n = fileSeq.current++;
    const f = OUTBOX[n % OUTBOX.length];
    const id = addNote("file", "", { ...f, state: "waiting", t0: 0 });
    fileTimers.current.set(id, [
      later(() => patchFile(id, { state: "sending", t0: Date.now() }), 2000),
      later(() => patchFile(id, { state: "failed", t1: Date.now(), reason: LOST[n % LOST.length] }), 2000 + 8600),
    ]);
  };

  const cancelFile = (id: number) => {
    fileTimers.current.get(id)?.forEach(clearTimeout);
    fileTimers.current.delete(id);
    patchFile(id, stopped());
  };

  /* Random Chat */

  const strangerSeq = useRef(0);
  const randomChat = () => {
    const s = STRANGERS[strangerSeq.current++ % STRANGERS.length];
    addNote("random", `Searching the Random Chat group "${s.group}"...`);
    later(() => addNote("random", `Found a random chat partner: ${s.nick} (UIN ${s.uin}) says "${s.says}"`), 2200);
    later(() => addNote("random", `${s.nick} has gone offline.`), 2200 + 2800);
  };

  const openTool = (id: ToolId) => {
    if (id !== "info") setMenu(null);
    switch (id) {
      case "info":
        return setMenu((m) => (m === "info" ? null : "info"));
      case "chat":
        return requestChat();
      case "file":
        return sendFile();
      case "random":
        return randomChat();
      case "history":
        if (chat === "on") setChat("off");
        requestAnimationFrame(() => scroller.current?.scrollTo({ top: 0, behavior: "smooth" }));
        return;
    }
  };

  /* Arrivals: the flashing title, the pop-up and the "Uh-oh!" */

  useOnNewReply(lines, () => {
    setFlash((f) => (f === "a" ? "b" : "a"));
    const last = lines.at(-1);
    const { status: s, chat: c } = latest.current;
    if (!last || s === "occupied" || s === "dnd" || c === "on") return;
    // Keep the id, not the text: the reply is still streaming at this point.
    setToast((t) => (t?.kind === "chatreq" ? t : { k: Date.now(), kind: "says", id: last.id }));
  });

  // The banner rotates, like it was paid to.
  useEffect(() => {
    const t = setInterval(() => setAd((i) => (i + 1) % ADS.length), 11_000);
    return () => clearInterval(t);
  }, []);

  /* Menus */

  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.("[data-icq-menu]")) setMenu(null);
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

  const toggle = (m: Exclude<Menu, null>) => setMenu((cur) => (cur === m ? null : m));

  const insert = (code: string) => {
    const el = input.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const pad = start > 0 && !/\s$/.test(value.slice(0, start)) ? " " : "";
    setValue(`${value.slice(0, start)}${pad}${code} ${value.slice(end)}`.slice(0, MAX_CHARS));
    setMenu(null);
    const caret = Math.min(MAX_CHARS, start + pad.length + code.length + 1);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  };

  const chooseInk = (part: keyof Ink, color: string) => {
    const next = { ...ink, [part]: color };
    setInk(next);
    setMenu(null);
    try {
      localStorage.setItem(INK_KEY, JSON.stringify(next));
    } catch {}
    input.current?.focus();
  };

  const toggleMulti = (on: boolean) => {
    setMulti(on);
    if (!on) return;
    addNote("multi", "Send Multiple: all your other contacts are offline. It's a school night.");
    later(() => setMulti(false), 900);
  };

  const cancel = () => {
    if (busy) return onStop();
    setValue("");
    input.current?.focus();
  };

  /* What's shown */

  const lastReply = lines.findLast((l) => l.role === "assistant" && l.at);
  const lastMine = lines.findLast((l) => l.role === "user");
  const toastLine = toast?.kind === "says" ? lines.find((l) => l.id === toast.id) : undefined;
  const toastText = toastLine ? replyText(toastLine.text) : "";
  // Same text and background color would make your messages vanish; keep them readable.
  const shown: Ink = ink.fg === ink.bg ? { ...ink, fg: ink.bg === "#000000" ? "#ffffff" : "#000000" } : ink;
  const backdrop = art("backdrop");
  const replying = busy && !waiting;

  return (
    <div className="icq flex h-full items-center justify-center">
      <div ref={win} className="icq-window" data-flash={flash} style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}>
        <IcqDefs />

        <div className="icq-titlebar" {...handle}>
          <div className="icq-title">
            <Flower status={dialing ? "connecting" : "logo"} className={`h-4 w-4 shrink-0 ${waiting ? "icq-spin" : ""}`} />
            <span className="truncate">{chat === "on" ? `ICQ Chat - ${buddy}` : `Message Session - ${buddy}`}</span>
          </div>
          <Caps />
        </div>

        <header className="icq-head">
          <div className="icq-photo" role="img" aria-label={`${buddy}'s picture`}>
            <div className="icq-photo-pic">
              <BuddyPicture agent={agent} mood={mood} size={50} />
            </div>
            <Flower status="online" className="icq-photo-badge" />
          </div>

          <div className="icq-fields">
            <span className="icq-label">
              <u>N</u>ickname:
            </span>
            <span className="icq-field icq-nick">
              <Flower status="online" className="h-3.5 w-3.5 shrink-0" />
              <b className="truncate">{buddy}</b>
            </span>
            <span className="icq-label">
              <u>U</u>IN:
            </span>
            <span className="icq-field">{UIN}</span>
            <span className="icq-label icq-hide-sm">
              <u>E</u>mail:
            </span>
            <span className="icq-field icq-hide-sm">
              <span>{EMAIL}</span>
            </span>
            <span className="icq-label icq-hide-sm">Status:</span>
            <span className="icq-field icq-field-mute icq-hide-sm">
              <span>{waiting ? `${buddy} is typing...` : `Online since ${clock(since)}`}</span>
            </span>
          </div>

          <nav className="icq-tools" aria-label="Contact tools" data-icq-menu>
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="icq-tool"
                title={t.title}
                onClick={() => openTool(t.id)}
                aria-pressed={t.id === "chat" ? chat === "on" : undefined}
                aria-expanded={t.id === "info" ? menu === "info" : undefined}
                disabled={t.id === "chat" && chat === "asking"}
              >
                <ToolIcon id={t.id} />
                <span>{t.id === "chat" && chat === "on" ? "End Chat" : t.label}</span>
              </button>
            ))}
            {menu === "info" && <InfoDialog agent={agent} buddy={buddy} since={since} onClose={() => setMenu(null)} />}
          </nav>
        </header>

        <div className="icq-adwrap">
          <Banner key={ad} ad={ADS[ad]} onClick={() => addNote("web", ADS[ad].click)} />
        </div>

        <div className="icq-body">
          <div className="icq-panel">
            {chat === "on" ? (
              <ChatPanes
                greeting={costume.greeting}
                lines={lines}
                buddy={buddy}
                me={me}
                ink={shown}
                draft={value}
                live={replying}
                waiting={waiting}
                error={error ? costume.error : ""}
                onLeave={requestChat}
              />
            ) : (
              <>
                {backdrop && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={backdrop} alt="" className="icq-backdrop" />
                )}
                <div ref={scroller} className="icq-history" aria-live="polite">
                  <SystemMessage
                    buddy={buddy}
                    auth={auth}
                    onAuthorize={() => {
                      setAuth((a) => ({ ...a, authorized: true }));
                      addNote("auth", `You authorized ${buddy}. Now ${buddy} can see when you're online.`);
                    }}
                    onAdd={() => {
                      setAuth((a) => ({ ...a, added: true }));
                      addNote("added", `${buddy} was added to your contact list, in the group "Friends".`);
                    }}
                  />
                  {rows.map((r) =>
                    r.kind === "msg" ? (
                      <Message key={r.key} row={r} name={r.mine ? me : buddy} ink={shown} />
                    ) : r.kind === "chatreq" ? (
                      <NoteLine key={r.key} icon="chat" at={r.at} text={`${buddy} wants to start an ICQ Chat with you.`} />
                    ) : r.note.file ? (
                      <FileRow key={r.key} note={r.note} file={r.note.file} buddy={buddy} onCancel={cancelFile} />
                    ) : (
                      <NoteLine key={r.key} icon={r.note.icon} at={r.note.at} text={r.note.text} />
                    ),
                  )}
                  {waiting && (
                    <div className="icq-typing">
                      <MessageNote blink className="h-4 w-4" />
                      {costume.typing}
                    </div>
                  )}
                  {error && (
                    <div className="icq-note icq-error">
                      <EventIcon id="error" />
                      <span>
                        {costume.error}
                        {lastMine && <span className="block italic text-[#8c887f]">{lastMine.text}</span>}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="icq-compose">
          <div className="icq-fmt" role="toolbar" aria-label="Message tools">
            <span className="icq-fmt-label">Message:</span>
            <div className="relative" data-icq-menu>
              <button type="button" className="icq-fbtn" title="Text color" aria-haspopup="menu" aria-expanded={menu === "fg"} onClick={() => toggle("fg")}>
                <TextColorIcon color={ink.fg} />
                <Chev />
              </button>
              {menu === "fg" && <Palette title="Text color" current={ink.fg} onPick={(c) => chooseInk("fg", c)} />}
            </div>
            <div className="relative" data-icq-menu>
              <button type="button" className="icq-fbtn" title="Background color" aria-haspopup="menu" aria-expanded={menu === "bg"} onClick={() => toggle("bg")}>
                <BackColorIcon color={ink.bg} />
                <Chev />
              </button>
              {menu === "bg" && <Palette title="Background color" current={ink.bg} onPick={(c) => chooseInk("bg", c)} />}
            </div>
            <div className="relative" data-icq-menu>
              <button type="button" className="icq-fbtn" title="Smileys" aria-haspopup="dialog" aria-expanded={menu === "smileys"} onClick={() => toggle("smileys")}>
                <Emote id="smile" className="icq-emote" />
                <Chev />
              </button>
              {menu === "smileys" && <SmileyPicker onPick={insert} />}
            </div>
            <span className="icq-sep" />
            <label className="icq-check">
              <input type="checkbox" checked={multi} onChange={(e) => toggleMulti(e.target.checked)} />
              <span className="icq-box" aria-hidden>
                <svg viewBox="0 0 9 9">
                  <path d="M1 4.2 3.4 6.6 8 1.6" stroke="#000" strokeWidth="1.7" fill="none" />
                </svg>
              </span>
              <span>Send Multiple</span>
            </label>
            <span className="icq-chars" data-full={value.length > MAX_CHARS - 30 ? "" : undefined}>
              Chars: {value.length}/{MAX_CHARS}
            </span>
          </div>

          <textarea
            ref={input}
            value={value}
            maxLength={MAX_CHARS}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            aria-label={`Message ${buddy}`}
            className="icq-input"
            style={{ color: shown.fg, background: shown.bg }}
          />

          <div className="icq-buttons">
            <div className="relative" data-icq-menu>
              <button
                type="button"
                className="icq-btn"
                aria-label={`More ways to reach ${buddy}`}
                aria-haspopup="menu"
                aria-expanded={menu === "more"}
                onClick={() => toggle("more")}
              >
                <span>
                  <u>M</u>ore
                </span>
                <Chev up />
              </button>
              {menu === "more" && (
                <div className="icq-menu icq-menu-up bottom-[calc(100%+2px)] left-0 w-[236px]" role="menu" aria-label="More">
                  {MORE.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      role="menuitem"
                      className="icq-mi"
                      onClick={() => {
                        setMenu(null);
                        addNote(m.icon, moreNote(m.id, buddy));
                      }}
                    >
                      <EventIcon id={m.icon} />
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="flex-1" />
            <button
              type="button"
              onClick={submit}
              disabled={busy || dialing || !value.trim()}
              className="icq-btn icq-btn-default"
              title="Send (Enter or Alt+S)"
            >
              <span>
                <u>S</u>end
              </span>
            </button>
            <button type="button" onClick={cancel} className="icq-btn" title={busy ? "Stop the reply" : "Clear the message"}>
              <span>Cancel</span>
            </button>
          </div>
        </div>

        <footer className="icq-status">
          <div className="relative" data-icq-menu>
            <button
              type="button"
              className="icq-status-btn"
              aria-label={`Your status: ${dialing ? "Connecting" : statusInfo.label}`}
              aria-haspopup="menu"
              aria-expanded={menu === "status"}
              onClick={() => toggle("status")}
            >
              <Flower status={dialing ? "connecting" : status} />
              <span>{dialing ? "Connecting..." : statusInfo.label}</span>
              <Chev up />
            </button>
            {menu === "status" && <StatusMenu current={status} onPick={chooseStatus} />}
          </div>
          <div className="icq-sb icq-sb-grow">
            {dialing ? (
              <Dialing t0={dialT0} />
            ) : waiting ? (
              <>
                <MessageNote blink className="h-3.5 w-3.5 shrink-0" />
                <span>{costume.typing}</span>
              </>
            ) : statusInfo.auto ? (
              <span>Auto-message: &ldquo;{statusInfo.auto}&rdquo;</span>
            ) : lastReply ? (
              <span>Last message received {stamp(lastReply.at)}</span>
            ) : (
              <span>Ready</span>
            )}
          </div>
          <div className="icq-sb" title="Dial-up Networking">
            <ModemLights tx={dialing || waiting} rx={dialing || replying} />
            <span className="icq-hide-sm">{dialing ? "Dialing" : status === "offline" ? "Disconnected" : <Bps />}</span>
          </div>
          <span className="icq-grip" aria-hidden />
        </footer>
      </div>

      {toast && (toast.kind !== "says" || toastText) && (
        <ToastCard
          key={toast.k}
          kind={toast.kind}
          title={toast.kind === "online" ? "ICQ Online Alert" : toast.kind === "chatreq" ? "Incoming Chat Request" : `Message from ${buddy}`}
          onDone={() => {
            setToast(null);
            if (toast.kind === "chatreq") addNote("chat", `You missed ${buddy}'s chat request.`);
          }}
          actions={
            toast.kind === "chatreq" ? (
              <div className="icq-toast-actions">
                <button type="button" className="icq-btn icq-btn-sm icq-btn-default" onClick={acceptChat}>
                  Accept
                </button>
                <button type="button" className="icq-btn icq-btn-sm" onClick={declineChat}>
                  Decline
                </button>
              </div>
            ) : null
          }
        >
          {toast.kind === "online" ? (
            <>
              <Flower status="online" className="h-8 w-8" />
              <span>
                <b>{buddy}</b> is Online
                <span className="block text-[#5d5a53]">UIN {UIN}</span>
              </span>
            </>
          ) : toast.kind === "chatreq" ? (
            <>
              <ToolIcon id="chat" className="h-8 w-8" />
              <span>
                <b>{buddy}</b> wants to chat with you, live.
                <span className="block text-[#5d5a53]">You&apos;ll see each other type.</span>
              </span>
            </>
          ) : (
            <>
              <MessageNote blink className="h-8 w-8" />
              <span className="min-w-0">
                <b>{buddy}</b>:
                <span className="line-clamp-2 text-[#33322e]">
                  <Rich text={toastText.replace(/\n+/g, " ")} />
                </span>
              </span>
            </>
          )}
        </ToastCard>
      )}
    </div>
  );
}

/* ───────── Pieces ───────── */

/** Minimize, maximize, close: bevelled, and purely for show. */
function Caps() {
  return (
    <div className="icq-caps" aria-hidden>
      <span className="icq-cap">
        <svg viewBox="0 0 8 7">
          <rect x="1" y="5" width="6" height="2" fill="#000" />
        </svg>
      </span>
      <span className="icq-cap">
        <svg viewBox="0 0 8 7">
          <path d="M0 0h8v7H0Z M1 2v4h6V2Z" fill="#000" fillRule="evenodd" />
        </svg>
      </span>
      <span className="icq-cap">
        <svg viewBox="0 0 8 7">
          <path d="M0 0h2l2 2 2-2h2L5 3.5 8 7H6L4 5 2 7H0l3-3.5Z" fill="#000" />
        </svg>
      </span>
    </div>
  );
}

function Chev({ up = false }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 8 8" className="icq-chev" aria-hidden>
      <path d={up ? "M1 5.6h6L4 2.2Z" : "M1 2.6h6L4 6Z"} fill="currentColor" />
    </svg>
  );
}

/** Your buddy's picture: a real one if it's been dropped in, else the gpty itself. */
function BuddyPicture({ agent, mood, size }: { agent: ReturnType<typeof getAgent>; mood: Mood; size: number }) {
  const src = art("buddyPicture");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" />;
  }
  return <Gpty agent={agent} size={size} mood={mood} />;
}

/** The connection speed, which never quite settles. */
function Bps() {
  const now = useNow(3500);
  const speeds = [49_333, 50_666, 48_000, 46_666, 49_333, 52_000, 45_333, 50_666];
  return <>Connected at {speeds[Math.floor(now / 3500) % speeds.length].toLocaleString("en-US")} bps</>;
}

function Dialing({ t0 }: { t0: number }) {
  const now = useNow(200);
  const step = Math.min(DIAL.length - 1, Math.floor(((now - t0) / CONNECT_MS) * DIAL.length));
  return <span>{DIAL[Math.max(0, step)]}</span>;
}

function Banner({ ad, onClick }: { ad: Ad; onClick: () => void }) {
  const src = art(ad.slot);
  return (
    <button type="button" className={`icq-ad icq-ad-${ad.id}`} onClick={onClick} aria-label={`Advertisement: ${ad.head} ${ad.sub}`}>
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="icq-ad-img" draggable={false} />
          <span className="icq-ad-wash" />
        </>
      ) : (
        <span className="icq-ad-art" aria-hidden>
          {AD_ART[ad.id]}
        </span>
      )}
      <span className="icq-ad-copy">
        <b>{ad.head}</b>
        <span>
          {ad.sub}
          {ad.id === "homepage" && (
            <span className="icq-counter" aria-hidden>
              {"000413".split("").map((d, i) => (
                <i key={i}>{d}</i>
              ))}
            </span>
          )}
        </span>
      </span>
      <span className="icq-ad-cta">{ad.cta}</span>
      <span className="icq-ad-tag">Advertisement</span>
    </button>
  );
}

const AD_ART: Record<AdId, ReactNode> = {
  visitor: (
    <>
      <Burst className="icq-burst" />
      <Trophy className="icq-trophy" />
    </>
  ),
  smileys: (
    <>
      <Emote id="smile" />
      <Emote id="grin" />
      <Emote id="wink" />
    </>
  ),
  modem: <ModemBox />,
  homepage: <DiggingSign />,
};

/** The "You were added" system message every new ICQ friendship started with. */
function SystemMessage({
  buddy,
  auth,
  onAuthorize,
  onAdd,
}: {
  buddy: string;
  auth: { added: boolean; authorized: boolean };
  onAuthorize: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="icq-sys" role="note">
      <div className="icq-sys-head">
        <Flower status="logo" className="h-4 w-4" />
        System Message
      </div>
      <p>
        <b>You were added</b> by {buddy} (UIN {UIN}), who also asks for your authorization:{" "}
        <i>
          &ldquo;
          <Rich text="hiii!! can i add u? :-)" />
          &rdquo;
        </i>
      </p>
      <div className="icq-sys-actions">
        <button type="button" className="icq-btn icq-btn-sm" onClick={onAuthorize} disabled={auth.authorized}>
          {auth.authorized ? "Authorized" : "Authorize"}
        </button>
        <button type="button" className="icq-btn icq-btn-sm" onClick={onAdd} disabled={auth.added}>
          {auth.added ? "In your list" : "Add to List"}
        </button>
      </div>
    </div>
  );
}

function Message({ row, name, ink }: { row: Msg; name: string; ink: Ink }) {
  const tinted = row.mine && ink.bg !== "#ffffff";
  return (
    <div className={`icq-msg ${row.mine ? "icq-me" : "icq-them"}`}>
      <div className="icq-msg-head">
        {row.mine ? <EventIcon id="out" /> : <MessageNote />}
        <span className="truncate">{name}</span>
        {row.at > 0 && <time dateTime={new Date(row.at).toISOString()}>{stamp(row.at)}</time>}
      </div>
      <div className="icq-msg-body">
        <span
          className="icq-ink"
          data-bg={tinted ? "" : undefined}
          style={row.mine ? { color: ink.fg, background: tinted ? ink.bg : undefined } : undefined}
        >
          <Rich text={row.text} />
        </span>
      </div>
    </div>
  );
}

function NoteLine({ icon, text, at }: { icon: Note["icon"]; text: string; at: number }) {
  return (
    <div className="icq-note">
      {isTool(icon) ? <ToolIcon id={icon} /> : <EventIcon id={icon} />}
      <span>
        <Rich text={text} />
      </span>
      {at > 0 && <time dateTime={new Date(at).toISOString()}>{clock(at)}</time>}
    </div>
  );
}

/** "Time left" as Windows estimated it: it only ever gets longer. */
function eta(seconds: number) {
  const s = Math.max(1, Math.round(seconds));
  if (s < 60) return `${s} sec`;
  if (s < 3600) return `${Math.round(s / 60)} min`;
  return `${Math.floor(s / 3600)} hr ${Math.round((s % 3600) / 60)} min`;
}

function FileRow({ note, file, buddy, onCancel }: { note: Note; file: Transfer; buddy: string; onCancel: (id: number) => void }) {
  const now = useNow(file.state === "sending" ? 350 : 60_000);
  const ms = file.t0 ? (file.t1 ?? now) - file.t0 : 0;
  const rate = 2.9 + Math.sin(ms / 900) * 0.4;
  const sent = Math.min(file.kb, (ms / 1000) * 2.9);
  const pct = Math.min(100, (sent / file.kb) * 100);
  const left = ((file.kb - sent) / rate) * 2 ** (ms / 2600);
  const open = file.state === "waiting" || file.state === "sending";
  return (
    <div className="icq-xfer" role="group" aria-label={`File transfer: ${file.name}`}>
      <div className="icq-xfer-head">
        <ToolIcon id="file" />
        <span className="min-w-0 flex-1 truncate">
          Sending to {buddy}: <b>{file.name}</b> ({file.kb.toLocaleString("en-US")} KB)
        </span>
        <time className="shrink-0 text-[11px] text-[#8c887f]">{clock(note.at)}</time>
      </div>
      <div className="icq-progress" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <i style={{ width: `${Math.max(file.state === "waiting" ? 0 : 1.2, pct)}%` }} />
      </div>
      <div className="icq-xfer-stats">
        {file.state === "waiting" && <span>Waiting for {buddy} to accept...</span>}
        {file.state === "sending" && (
          <>
            <span>
              {Math.floor(sent).toLocaleString("en-US")} of {file.kb.toLocaleString("en-US")} KB
            </span>
            <span>{rate.toFixed(1)} KB/s</span>
            <span>Time left: {eta(left)}</span>
          </>
        )}
        {file.state === "failed" && <span className="icq-error">{file.reason}</span>}
        {file.state === "canceled" && <span>You canceled the transfer.</span>}
      </div>
      {open && (
        <div className="icq-xfer-foot">
          <button type="button" className="icq-btn icq-btn-sm" onClick={() => onCancel(note.id)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * ICQ Chat: one pane each, no Send button in spirit. Your buddy's words
 * arrive letter by letter, and your pane shows what you're typing as you
 * type it.
 */
function ChatPanes({
  greeting,
  lines,
  buddy,
  me,
  ink,
  draft,
  live,
  waiting,
  error,
  onLeave,
}: {
  greeting: string;
  lines: ChatLine[];
  buddy: string;
  me: string;
  ink: Ink;
  draft: string;
  live: boolean;
  waiting: boolean;
  error: string;
  onLeave: () => void;
}) {
  const theirs = [greeting, ...lines.filter((l) => l.role === "assistant").map((l) => replyText(l.text))].filter(Boolean).join("\n");
  const mine = lines
    .filter((l) => l.role === "user")
    .map((l) => l.text)
    .join("\n");
  const them = useStickyScroll<HTMLDivElement>(`${theirs.length}:${waiting}:${error}`);
  const you = useStickyScroll<HTMLDivElement>(`${mine.length}:${draft.length}`);
  return (
    <div className="icq-chat">
      <div className="icq-chat-bar">
        <ToolIcon id="chat" className="h-4 w-4" />
        <b>ICQ Chat</b>
        <span className="truncate text-[#5d5a53]">with {buddy}: live, letter by letter</span>
        <button type="button" className="icq-btn icq-btn-sm ml-auto" onClick={onLeave}>
          Leave Chat
        </button>
      </div>
      <section className="icq-pane icq-pane-them" aria-label={`${buddy}'s side`}>
        <div className="icq-pane-head">
          <Flower status="online" className="h-3.5 w-3.5" />
          {buddy}
          <small>{live || waiting ? "typing..." : `UIN ${UIN}`}</small>
        </div>
        <div ref={them} className="icq-pane-text" aria-live="polite">
          <Rich text={theirs} />
          {(live || waiting) && <span className="icq-caret" />}
          {error && <span className="icq-error block">{error}</span>}
        </div>
      </section>
      <section className="icq-pane icq-pane-me" aria-label="Your side">
        <div className="icq-pane-head">
          <Flower status="online" className="h-3.5 w-3.5" />
          {me}
          <small>type below, it shows up here</small>
        </div>
        <div ref={you} className="icq-pane-text" style={{ color: ink.fg, background: ink.bg }}>
          <Rich text={`${mine}${mine && draft ? "\n" : ""}${draft}`} />
          <span className="icq-caret" />
        </div>
      </section>
    </div>
  );
}

function Palette({ title, current, onPick }: { title: string; current: string; onPick: (c: string) => void }) {
  return (
    <div className="icq-menu icq-menu-up bottom-[calc(100%+2px)] left-0 min-w-0" role="menu" aria-label={title}>
      <div className="icq-menu-title">{title}</div>
      <div className="icq-palette">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            role="menuitemradio"
            aria-checked={c === current}
            aria-label={c}
            title={c}
            className="icq-swatch"
            onClick={() => onPick(c)}
          >
            <i style={{ background: c }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function SmileyPicker({ onPick }: { onPick: (code: string) => void }) {
  return (
    <div className="icq-menu icq-menu-up bottom-[calc(100%+2px)] left-0 min-w-0" role="dialog" aria-label="Smileys">
      <div className="icq-smileys">
        {EMOTES.map((e) => (
          <button
            key={e.id}
            type="button"
            className="icq-smiley-btn"
            title={`${e.name}   ${e.codes[0]}`}
            aria-label={`${e.name} ${e.codes[0]}`}
            onClick={() => onPick(e.codes[0])}
          >
            <Emote id={e.id} />
          </button>
        ))}
      </div>
      <div className="icq-pop-foot">Tip: type them the old way, nose and all: :-) ;-) &lt;3 @{"}"}-&gt;--</div>
    </div>
  );
}

function StatusMenu({ current, onPick }: { current: Status; onPick: (s: Status) => void }) {
  return (
    <div className="icq-menu icq-menu-up bottom-[calc(100%+2px)] left-0 w-[216px]" role="menu" aria-label="Change your status">
      {STATUSES.map((s, i) => (
        <div key={s.id}>
          {(i === 6 || i === 7) && <div className="icq-msep" />}
          <button type="button" role="menuitemradio" aria-checked={s.id === current} className="icq-mi" onClick={() => onPick(s.id)}>
            <Flower status={s.id} />
            {s.label}
          </button>
        </div>
      ))}
    </div>
  );
}

/** User Details: everything your buddy filled in about themself in 2000. */
function InfoDialog({ agent, buddy, since, onClose }: { agent: ReturnType<typeof getAgent>; buddy: string; since: number; onClose: () => void }) {
  const tabs = ["Main", "Home", "Interests", "About"] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Main");
  return (
    <div className="icq-dialog" role="dialog" aria-label={`User Details - ${buddy}`}>
      <div className="icq-titlebar">
        <Flower status="logo" className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 truncate">User Details - {buddy}</span>
        <button type="button" className="icq-dialog-x" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 8 7" className="h-[7px] w-[8px]" aria-hidden>
            <path d="M0 0h2l2 2 2-2h2L5 3.5 8 7H6L4 5 2 7H0l3-3.5Z" fill="#000" />
          </svg>
        </button>
      </div>
      <div className="icq-tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={t === tab} className="icq-tab" onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="icq-tabpane" role="tabpanel" aria-label={tab}>
        {tab === "Main" && (
          <div className="flex gap-3">
            <div className="icq-photo h-[58px] w-[58px] shrink-0">
              <div className="icq-photo-pic">
                <BuddyPicture agent={agent} mood="watching" size={42} />
              </div>
            </div>
            <dl className="icq-kv min-w-0 flex-1 [grid-template-columns:62px_minmax(0,1fr)]">
              <dt>Nickname</dt>
              <dd>{buddy}</dd>
              <dt>UIN</dt>
              <dd>{UIN} (5 digits!!)</dd>
              <dt>Status</dt>
              <dd>Online since {clock(since)}</dd>
            </dl>
          </div>
        )}
        {tab === "Home" && (
          <dl className="icq-kv">
            <dt>Email</dt>
            <dd>{EMAIL}</dd>
            <dt>Homepage</dt>
            <dd className="text-[#0033cc] underline">{HOMEPAGE}</dd>
            <dt>City</dt>
            <dd>none of ur business lol</dd>
            <dt>Age</dt>
            <dd>
              <Rich text="ask me ;-)" />
            </dd>
          </dl>
        )}
        {tab === "Interests" && (
          <dl className="icq-kv">
            <dt>Music</dt>
            <dd>Britney, *NSYNC, Blink-182</dd>
            <dt>Games</dt>
            <dd>The Sims, Pokémon, Snake</dd>
            <dt>TV</dt>
            <dd>Who Wants to Be a Millionaire</dd>
            <dt>Computers</dt>
            <dd>Winamp skins, my homepage</dd>
          </dl>
        )}
        {tab === "About" && (
          <dl className="icq-kv">
            <dt>About</dt>
            <dd className="icq-dd-tall">
              <Rich text="~*~ welcome 2 my ICQ ~*~ add me if ur nice!! no chain letters plz :-P <3" />
            </dd>
            <dt>Joined</dt>
            <dd>1997 (early adopter B-))</dd>
          </dl>
        )}
      </div>
    </div>
  );
}

function ToastCard({
  kind,
  title,
  children,
  actions,
  onDone,
}: {
  kind: Toast["kind"];
  title: string;
  children: ReactNode;
  actions: ReactNode;
  onDone: () => void;
}) {
  return (
    <div
      className="icq-toast"
      data-kind={kind}
      role={kind === "chatreq" ? "alertdialog" : "status"}
      aria-label={title}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onDone();
      }}
    >
      {kind === "says" && (
        <div className="icq-uhoh" aria-hidden>
          <Burst className="icq-burst" />
          <span>Uh-oh!</span>
        </div>
      )}
      <div className="icq-titlebar">
        <Flower status="logo" className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 truncate">{title}</span>
        <span className="icq-dialog-x" aria-hidden>
          <svg viewBox="0 0 8 7" className="h-[7px] w-[8px]">
            <path d="M0 0h2l2 2 2-2h2L5 3.5 8 7H6L4 5 2 7H0l3-3.5Z" fill="#000" />
          </svg>
        </span>
      </div>
      <div className="icq-toast-body">{children}</div>
      {actions}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gpty, type Mood } from "@/components/Gpty";
import {
  art,
  Bars,
  CloudMark,
  DefaultAvatar,
  EventGlyph,
  type EventIcon,
  Handset,
  Pencil,
  type Presence,
  PresenceIcon,
  PRESENCES,
  SkyArt,
  SkypeDefs,
  ToolIcon,
  type ToolId,
} from "@/components/skype/art";
import { EMOTES, Emote, Rich } from "@/components/skype/emoticons";
import { rounded, segoe } from "@/components/skype/font";
import "@/components/skype/skype.css";
import { getAgent } from "@/lib/agents";
import { useComposer, useDesktopDrag, useNow, useOnNewReply, useStickyScroll } from "./hooks";
import { clock, type ChatLine, type LayoutProps } from "./types";

/**
 * A finished call, sent as a message so your contact knows it happened:
 * "/call 00:07" or "/call 00:07 dropped". A "/call" line alone at the top of a
 * reply is your contact calling you.
 */
export const CALL = "/call";
const CALL_LINE = /^\/call(?:\s+(\d{1,2}:\d{2}))?(?:\s+(dropped))?\s*$/i;

/** Where Cal lives: far enough away that it's usually tomorrow there. */
const HOME = { city: "Auckland, New Zealand", tz: "Pacific/Auckland" };

const HANDLE = "cal.from.auckland";

/** Each conversation gets its own mood message, like a fresh login. */
const MOODS = [
  "Calls are free. FREE! (party)",
  "Testing my new headset... hello? hello? (call)",
  "Echo / Sound Test Service is my best friend :)",
  "SkypeOut credit: $0.00. Don't ask (cash)",
  "It's already tomorrow here (sun)",
  "New webcam works! The lighting doesn't 8-)",
  "Can you hear me now? (wave)",
];

const MENU = ["Skype", "Contacts", "Conversation", "Call", "View", "Tools", "Help"];

const TOOLS: { id: ToolId; label: string }[] = [
  { id: "video", label: "Video call" },
  { id: "files", label: "Send file" },
  { id: "add", label: "Add people" },
  { id: "sms", label: "Send SMS" },
  { id: "extras", label: "Extras" },
];

/** What "Send file" tries to send, in turn. None of it ever arrives. */
const OUTBOX = [
  { name: "holiday_photos_2007.zip", size: "48.2 MB" },
  { name: "my_ringtone_FINAL.mp3", size: "3.1 MB" },
  { name: "cat_falls_off_sofa.wmv", size: "12.7 MB" },
  { name: "CV_2007_v9_REAL.doc", size: "84 KB" },
];

const RANGES = ["Yesterday", "7 days", "30 days", "3 months", "6 months", "1 year", "Beginning"];

const PRESENCE_KEY = "gpty.skype.presence";

function loadPresence(): Presence {
  try {
    const v = localStorage.getItem(PRESENCE_KEY);
    return PRESENCES.some((p) => p.id === v) ? (v as Presence) : "online";
  } catch {
    return "online";
  }
}

function pick<T>(list: T[], seed: string, salt = 0) {
  let h = salt;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

/** 7400 ms -> "00:07" */
function mmss(ms: number) {
  const s = Math.max(1, Math.round(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/* ───────── What the history shows ───────── */

interface Transfer {
  name: string;
  size: string;
  state: "waiting" | "sending" | "failed" | "canceled";
}

interface Note {
  id: number;
  /** Shown after this line (null: right after the greeting). */
  after: string | null;
  icon: ToolId | EventIcon;
  text: string;
  at: number;
  file?: Transfer;
}

type Msg = { kind: "msg"; key: string; mine: boolean; text: string; at: number };

type Row =
  | Msg
  | { kind: "call"; key: string; mine: boolean; dur?: string; dropped?: boolean; at: number }
  | { kind: "note"; key: string; note: Note };

type Block = Exclude<Row, Msg> | { kind: "group"; key: string; mine: boolean; rows: Msg[] };

/**
 * Lines become rows: calls (yours, or a "/call" line in a reply) become call
 * events, and notes slot in after the line they followed.
 */
function toRows(greeting: string, lines: ChatLine[], notes: Note[], busy: boolean): Row[] {
  const rows: Row[] = [{ kind: "msg", key: "greeting", mine: false, text: greeting, at: 0 }];
  const notesAfter = (id: string | null) => {
    for (const n of notes) if (n.after === id) rows.push({ kind: "note", key: `n${n.id}`, note: n });
  };
  notesAfter(null);
  lines.forEach((l, i) => {
    const mine = l.role === "user";
    if (mine) {
      const call = CALL_LINE.exec(l.text.trim());
      rows.push(
        call
          ? { kind: "call", key: l.id, mine, dur: call[1], dropped: !!call[2], at: l.at }
          : { kind: "msg", key: l.id, mine, text: l.text, at: l.at },
      );
    } else {
      const live = busy && i === lines.length - 1;
      const parts = l.text.split("\n");
      const kept: string[] = [];
      parts.forEach((s, j) => {
        const t = s.trim().toLowerCase();
        if (t === CALL) rows.push({ kind: "call", key: `${l.id}:${j}`, mine, at: l.at });
        // Hide a "/ca" that is still streaming in, so it never flashes as text.
        else if (!(live && j === parts.length - 1 && t.startsWith("/") && CALL.startsWith(t))) kept.push(s);
      });
      const text = kept.join("\n").trim();
      if (text) rows.push({ kind: "msg", key: l.id, mine, text, at: l.at });
    }
    notesAfter(l.id);
  });
  return rows;
}

/** Consecutive messages from the same person share one name and picture. */
function toBlocks(rows: Row[]): Block[] {
  const out: Block[] = [];
  for (const r of rows) {
    const prev = out.at(-1);
    if (r.kind !== "msg") out.push(r);
    else if (prev?.kind === "group" && prev.mine === r.mine) prev.rows.push(r);
    else out.push({ kind: "group", key: r.key, mine: r.mine, rows: [r] });
  }
  return out;
}

/** A reply as plain text, without its call line. */
function replyText(text: string) {
  return text
    .split("\n")
    .filter((s) => s.trim().toLowerCase() !== CALL)
    .join(" ")
    .trim();
}

/* ───────── Calls ───────── */

type Phase = "ringing" | "live" | "bad" | "over";

interface Call {
  id: number;
  video: boolean;
  phase: Phase;
  /** When it connected. */
  t0: number;
  muted: boolean;
  /** What the bar says once it's over. */
  end?: string;
}

type Toast = { k: number; kind: "says" | "signin" | "ring"; id?: string };

/** Only one "is now online" per visit. */
let signedIn = false;

/* ───────── The window ───────── */

/** Skype 3 on Vista, remastered: a live sky up top, glass, and the big green and red buttons. */
export function SkypeLayout({ costume, lines, busy, waiting, error, onSend, onStop, activeId }: LayoutProps) {
  const agent = getAgent(costume.id);
  const buddy = costume.assistant;
  const { value, setValue, submit, onKeyDown } = useComposer(onSend, busy);
  // Drag the window around the chat area by its title bar, like a desktop.
  const { ref: win, handle } = useDesktopDrag<HTMLDivElement>(costume.id);
  const input = useRef<HTMLTextAreaElement>(null);
  const compose = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [menu, setMenu] = useState<"emotes" | "presence" | null>(null);
  const [presence, setPresence] = useState<Presence>(loadPresence);
  const [toast, setToast] = useState<Toast | null>(null);
  const [call, setCall] = useState<Call | null>(null);

  const moodMessage = pick(MOODS, activeId);
  const mood: Mood = error ? "error" : waiting ? "thinking" : busy ? "typing" : "watching";
  const onCall = !!call && call.phase !== "over";

  const rows = useMemo(() => toRows(costume.greeting, lines, notes, busy), [costume.greeting, lines, notes, busy]);
  const blocks = useMemo(() => toBlocks(rows), [rows]);
  const scroller = useStickyScroll<HTMLDivElement>(`${rows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}`);

  /* Notes */

  // Read from timers, so they always see the latest values.
  const latest = useRef({ lastLine: null as string | null, call, busy, onSend });
  const seq = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>[]>());
  const callTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const t = timers.current;
    const c = callTimers.current;
    return () => {
      t.forEach((list) => list.forEach(clearTimeout));
      c.forEach(clearTimeout);
    };
  }, []);

  const addNote = useCallback((icon: Note["icon"], text: string, file?: Transfer) => {
    const id = ++seq.current;
    setNotes((ns) => [...ns, { id, after: latest.current.lastLine, icon, text, at: Date.now(), file }]);
    return id;
  }, []);

  const later = (id: number, fn: () => void, ms: number) => {
    const list = timers.current.get(id) ?? [];
    list.push(setTimeout(fn, ms));
    timers.current.set(id, list);
  };

  const patchFile = (id: number, state: Transfer["state"]) =>
    setNotes((ns) => ns.map((n) => (n.id === id && n.file ? { ...n, file: { ...n.file, state } } : n)));

  const fileSeq = useRef(0);
  const sendFile = () => {
    const f = OUTBOX[fileSeq.current++ % OUTBOX.length];
    const id = addNote("files", "", { ...f, state: "waiting" });
    later(id, () => patchFile(id, "sending"), 1600);
    later(id, () => patchFile(id, "failed"), 1600 + 6400);
  };

  const cancelFile = (id: number) => {
    timers.current.get(id)?.forEach(clearTimeout);
    timers.current.delete(id);
    patchFile(id, "canceled");
  };

  /* Calls */

  const at = useCallback((fn: () => void, ms: number) => {
    callTimers.current.push(setTimeout(fn, ms));
  }, []);
  const clearCall = useCallback(() => {
    callTimers.current.forEach(clearTimeout);
    callTimers.current = [];
  }, []);

  const hangUp = useCallback(
    (dropped: boolean) => {
      const c = latest.current.call;
      if (!c || c.phase === "over") return;
      clearCall();
      if (c.phase === "ringing") {
        addNote("missed", `Call to ${buddy} canceled.`);
        setCall(null);
        return;
      }
      const dur = mmss(Date.now() - c.t0);
      // The call goes into the conversation, so your contact knows it happened.
      if (latest.current.busy) addNote(dropped ? "missed" : "call", `Call ${dropped ? "dropped" : "ended"}, duration ${dur}`);
      else latest.current.onSend(`${CALL} ${dur}${dropped ? " dropped" : ""}`);
      setCall({ ...c, phase: "over", end: dropped ? "Call dropped" : "Call ended" });
      at(() => setCall((x) => (x?.id === c.id ? null : x)), 1700);
    },
    [addNote, at, buddy, clearCall],
  );

  /** Ring, connect, get worse, drop. Every call, every time. */
  const startCall = useCallback(
    (video: boolean, incoming = false) => {
      const cur = latest.current.call;
      if (cur && cur.phase !== "over") return;
      clearCall();
      const id = Date.now();
      const patch = (p: Partial<Call>) => setCall((c) => (c?.id === id ? { ...c, ...p } : c));
      const connect = incoming ? 0 : 2800;
      setCall({ id, video, phase: incoming ? "live" : "ringing", t0: id, muted: false });
      if (!incoming) at(() => patch({ phase: "live", t0: Date.now() }), connect);
      at(() => patch({ phase: "bad" }), connect + 4200);
      at(() => hangUp(true), connect + 8800);
    },
    [at, clearCall, hangUp],
  );

  useEffect(() => {
    latest.current = { lastLine: lines.at(-1)?.id ?? null, call, busy, onSend };
  });

  /** The red button: hangs up a call, or stops a reply mid-sentence. */
  const red = () => {
    if (onCall) hangUp(false);
    else if (busy) onStop();
  };

  /* Toolbar */

  const openTool = (id: ToolId) => {
    switch (id) {
      case "video":
        return startCall(true);
      case "files":
        return sendFile();
      case "add":
        return addNote("add", "Everyone else in your contact list is offline, except Echo / Sound Test Service. It only repeats what you say.");
      case "sms":
        return addNote("credit", "You need Skype Credit to send SMS messages. Your balance is $0.00.");
      case "extras":
        return addNote("extras", `To play together, ${buddy} needs the same Extra installed. Extras Manager is downloading the list... (0%)`);
    }
  };

  /* Your contact calls you */

  const buddyCalls = rows
    .filter((r) => r.kind === "call" && !r.mine)
    .map((r) => r.key)
    .join(" ");
  const rung = useRef<Set<string> | null>(null);
  useEffect(() => {
    const keys = buddyCalls ? buddyCalls.split(" ") : [];
    // Calls already in the history don't ring again.
    if (!rung.current) {
      rung.current = new Set(keys);
      return;
    }
    const fresh = keys.filter((k) => !rung.current!.has(k));
    if (!fresh.length) return;
    fresh.forEach((k) => rung.current!.add(k));
    const c = latest.current.call;
    if (c && c.phase !== "over") addNote("missed", `Missed call from ${buddy}. You were already on a call.`);
    else setToast({ k: Date.now(), kind: "ring" });
  }, [buddyCalls, addNote, buddy]);

  const answer = () => {
    setToast(null);
    startCall(false, true);
  };
  const decline = () => {
    setToast(null);
    addNote("missed", `You declined the call from ${buddy}.`);
  };

  /* Toasts */

  useOnNewReply(lines, () => {
    // Keep the id, not the text: the reply is still streaming at this point.
    const last = lines.at(-1);
    if (last) setToast((t) => (t?.kind === "ring" ? t : { k: Date.now(), kind: "says", id: last.id }));
  });
  useEffect(() => {
    if (signedIn) return;
    const t = setTimeout(() => {
      signedIn = true;
      setToast((cur) => cur ?? { k: Date.now(), kind: "signin" });
    }, 900);
    return () => clearTimeout(t);
  }, []);

  /* Menus */

  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!compose.current?.contains(t) && !statusRef.current?.contains(t)) setMenu(null);
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

  const choosePresence = (p: Presence) => {
    setPresence(p);
    setMenu(null);
    try {
      localStorage.setItem(PRESENCE_KEY, p);
    } catch {}
  };

  const lastMine = lines.findLast((l) => l.role === "user" && !CALL_LINE.test(l.text.trim()));
  const toastLine = toast?.kind === "says" ? lines.find((l) => l.id === toast.id) : undefined;
  const toastText = toastLine ? replyText(toastLine.text) : "";
  const presenceLabel = PRESENCES.find((p) => p.id === presence)?.label ?? "Online";
  const buddyPic = (size: number, m: Mood = "idle") => <BuddyPicture agent={agent} mood={m} size={size} />;

  return (
    <div className={`${segoe.variable} ${rounded.variable} skype flex h-full justify-center`}>
      <div ref={win} className="sk-window" style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}>
        <SkypeDefs />

        <header className="sk-head" data-call={onCall ? "" : undefined}>
          <Sky />
          <div className="sk-titlebar" {...handle}>
            <div className="sk-title">
              <CloudMark className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">Skype™ - {buddy}</span>
            </div>
            <Caps />
          </div>
          <div className="sk-menu" aria-hidden>
            {MENU.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>

          <div className="sk-profile">
            <div className="sk-av" role="img" aria-label={`${buddy}'s picture`}>
              <div className="sk-av-pic">{buddyPic(60, mood)}</div>
              <PresenceIcon status="online" className="sk-av-badge" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="sk-name truncate">{buddy}</span>
                {waiting && (
                  <span className="sk-thought" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                )}
                <span className="sk-handle truncate">{HANDLE}</span>
              </div>
              <div className="sk-mood truncate">
                <Rich text={moodMessage} />
              </div>
              <div className="sk-where">
                <Globe />
                <span className="truncate">
                  <span className="sk-city">{HOME.city} · </span>Local time: <LocalTime />
                </span>
              </div>
            </div>
          </div>

          <nav className="sk-tools" aria-label="Call and conversation tools">
            <button type="button" className="sk-callpill" onClick={() => startCall(false)} disabled={onCall}>
              <Handset className="h-[15px] w-[15px]" />
              <span>Call</span>
            </button>
            {TOOLS.map((t) => (
              <button key={t.id} type="button" className="sk-tool" onClick={() => openTool(t.id)} disabled={t.id === "video" && onCall}>
                <ToolIcon id={t.id} />
                <span>{t.label}</span>
              </button>
            ))}
            <span className="sk-credit">
              Call phones <b>$0.00</b>
            </span>
          </nav>
        </header>

        {call && (
          <CallBar
            call={call}
            buddy={buddy}
            picture={buddyPic(52, call.phase === "bad" ? "error" : "watching")}
            onHangUp={() => hangUp(false)}
            onMute={() => setCall((c) => (c ? { ...c, muted: !c.muted } : c))}
          />
        )}

        <div className="sk-body">
          <History>
            <div ref={scroller} className="sk-history" aria-live="polite">
              <p className="sk-from">
                Show messages from:
                {RANGES.map((r) => (
                  <button key={r} type="button" onClick={() => scroller.current?.scrollTo({ top: 0, behavior: "smooth" })}>
                    {r}
                  </button>
                ))}
              </p>
              <div className="sk-day">
                <span>Today</span>
              </div>

              {blocks.map((b) =>
                b.kind === "group" ? (
                  <div key={b.key} className={`sk-group ${b.mine ? "sk-mine" : "sk-theirs"}`}>
                    {b.rows.map((r, i) => (
                      <div key={r.key} className="sk-msg">
                        <div className="sk-who">
                          {i === 0 && (
                            <>
                              <span className="sk-mini">{b.mine ? <UserPicture /> : buddyPic(20)}</span>
                              <span className="truncate">{b.mine ? costume.user : buddy}</span>
                            </>
                          )}
                        </div>
                        <div className="sk-text">
                          <Rich text={r.text} />
                        </div>
                        {r.at > 0 ? (
                          <time dateTime={new Date(r.at).toISOString()}>{clock(r.at)}</time>
                        ) : (
                          <span />
                        )}
                      </div>
                    ))}
                  </div>
                ) : b.kind === "call" ? (
                  <EventRow
                    key={b.key}
                    icon={b.mine ? (b.dropped ? "missed" : "call") : "call"}
                    at={b.at}
                    text={
                      b.mine
                        ? `Call ${b.dropped ? "dropped" : "ended"}${b.dur ? `, duration ${b.dur}` : ""}`
                        : `${buddy} is calling you`
                    }
                  />
                ) : b.note.file ? (
                  <FileRow key={b.key} note={b.note} file={b.note.file} buddy={buddy} onCancel={cancelFile} />
                ) : (
                  <EventRow key={b.key} icon={b.note.icon} at={b.note.at} text={b.note.text} />
                ),
              )}

              {waiting && (
                <div className="sk-msg sk-typing">
                  <div className="sk-who">
                    <span className="sk-mini">{buddyPic(20)}</span>
                  </div>
                  <div className="sk-text">
                    <Pencil className="sk-pencil mr-1.5 inline-block h-3.5 w-3.5 align-[-2px]" />
                    {costume.typing}
                  </div>
                  <span />
                </div>
              )}
              {error && (
                <div className="sk-msg sk-event sk-error">
                  <div className="sk-who">
                    <EventGlyph id="info" className="sk-event-icon" />
                  </div>
                  <div className="sk-text">
                    {costume.error}
                    {lastMine && <span className="block italic text-[#8fa1b1]">{lastMine.text}</span>}
                  </div>
                  <span />
                </div>
              )}
            </div>
          </History>

          <div ref={compose} className="sk-compose">
            <button
              type="button"
              className="sk-emo-btn"
              title="Emoticons"
              aria-haspopup="dialog"
              aria-expanded={menu === "emotes"}
              onClick={() => setMenu((m) => (m === "emotes" ? null : "emotes"))}
            >
              <Emote id="smile" className="h-[22px] w-[22px]" />
            </button>
            {menu === "emotes" && <EmotePicker onPick={insert} />}
            <textarea
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              placeholder={costume.placeholder}
              aria-label={`Message ${buddy}`}
              className="sk-input"
            />
            <button type="button" className="sk-file-btn" title="Send file" onClick={sendFile}>
              <ToolIcon id="files" />
            </button>
            <button type="button" onClick={submit} disabled={busy || !value.trim()} className="sk-send">
              Send
            </button>
          </div>
        </div>

        <div className="sk-bigbar">
          <button type="button" className="sk-big sk-big-green" onClick={() => startCall(false)} disabled={onCall} title={`Call ${buddy}`} aria-label={`Call ${buddy}`}>
            <Handset className="h-[22px] w-[22px]" />
          </button>
          <button
            type="button"
            className="sk-big sk-big-red"
            onClick={red}
            disabled={!onCall && !busy}
            title={onCall ? "Hang up" : "Hang up (stops the reply)"}
            aria-label={onCall ? "Hang up" : "Stop the reply"}
          >
            <Handset down className="h-[22px] w-[22px]" />
          </button>
        </div>

        <footer className="sk-status">
          <div ref={statusRef} className="relative">
            <button
              type="button"
              className="sk-presence"
              aria-haspopup="menu"
              aria-expanded={menu === "presence"}
              onClick={() => setMenu((m) => (m === "presence" ? null : "presence"))}
            >
              <PresenceIcon status={presence} className="h-3.5 w-3.5" />
              {presenceLabel}
              <Chev />
            </button>
            {menu === "presence" && <PresenceMenu current={presence} onPick={choosePresence} />}
          </div>
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            {waiting && (
              <>
                <Pencil className="sk-pencil h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{costume.typing}</span>
              </>
            )}
          </span>
          <PeopleOnline />
        </footer>
      </div>

      {toast && (toast.kind !== "says" || toastText) && (
        <ToastCard
          key={toast.k}
          kind={toast.kind}
          picture={buddyPic(44)}
          onDone={() => {
            setToast(null);
            if (toast.kind === "ring") addNote("missed", `Missed call from ${buddy}.`);
          }}
          onAnswer={answer}
          onDecline={decline}
        >
          {toast.kind === "signin" ? (
            <>
              <b>{buddy}</b> is now Online.
            </>
          ) : toast.kind === "ring" ? (
            <>
              <b>{buddy}</b> is calling you
              <span className="block text-[#5f7487]">Incoming call</span>
            </>
          ) : (
            <>
              <b>{buddy}</b>
              <span className="line-clamp-2 block text-[#33495c]">
                <Rich text={toastText} />
              </span>
            </>
          )}
        </ToastCard>
      )}
    </div>
  );
}

/* ───────── Pieces ───────── */

function Sky() {
  const photo = art("scene");
  return (
    <div className="sk-sky" aria-hidden>
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" />
          <div className="sk-wash" />
        </>
      ) : (
        <>
          <SkyArt />
          <div className="sk-wash" />
        </>
      )}
    </div>
  );
}

/** Minimize, maximize, close: Vista glass, and purely for show. */
function Caps() {
  return (
    <div className="sk-caps" aria-hidden>
      <span className="sk-cap">
        <svg viewBox="0 0 10 10">
          <rect x="1" y="6.6" width="8" height="2" rx=".4" fill="#fff" />
        </svg>
      </span>
      <span className="sk-cap">
        <svg viewBox="0 0 10 10">
          <path d="M1 1h8v8H1Z M2.6 3.4v4h4.8v-4Z" fill="#fff" fillRule="evenodd" />
        </svg>
      </span>
      <span className="sk-cap sk-cap-x">
        <svg viewBox="0 0 10 10">
          <path d="m1.6 1.6 6.8 6.8m0-6.8-6.8 6.8" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}

function Chev() {
  return (
    <svg viewBox="0 0 8 8" className="sk-chev" aria-hidden>
      <path d="M1 2.6h6L4 6Z" fill="currentColor" />
    </svg>
  );
}

function Globe() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="6.6" fill="url(#sk-blue)" stroke="#0a5d9c" strokeWidth=".6" />
      <path d="M4.2 4.6c1.4.4 1.8 1.6 1.2 2.6-.6 1 .4 1.8 1.4 1.6 1-.2 1.4.8.8 1.8-.4.8 0 1.8.6 2.4M10.4 2.2c-.6 1 0 2 1 2.2 1 .2 1.2 1.2 2 1.4" stroke="#bff0a8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="6.4" cy="4.2" rx="3" ry="1.4" fill="#fff" opacity=".45" />
    </svg>
  );
}

/** Your contact's clock, on the other side of the world (where it's usually tomorrow). */
function LocalTime() {
  const now = useNow(20_000);
  return <time>{timeThere(now)}</time>;
}

function timeThere(now: number) {
  const d = new Date(now);
  try {
    const t = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: HOME.tz });
    // "2026-11-07" sorts like a date, so the two days compare as strings.
    const there = d.toLocaleDateString("en-CA", { timeZone: HOME.tz });
    const here = d.toLocaleDateString("en-CA");
    return t + (there > here ? " tomorrow" : there < here ? " yesterday" : "");
  } catch {
    return clock(now);
  }
}

/** The status bar counter that never sits still. */
function PeopleOnline() {
  const now = useNow(2500);
  const n = 8_214_322 + Math.round(Math.sin(now / 47_000) * 41_000 + Math.sin(now / 6_100) * 2_700);
  return <span className="sk-online shrink-0">{n.toLocaleString("en-US")} people online</span>;
}

function CallTimer({ t0 }: { t0: number }) {
  const now = useNow(500);
  return <span className="tabular-nums">{mmss(Math.max(1000, now - t0))}</span>;
}

/** The history panel, with an optional faded background picture behind it. */
function History({ children }: { children: React.ReactNode }) {
  const backdrop = art("backdrop");
  return (
    <div className="sk-panel relative min-h-0 flex-1 overflow-hidden">
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={backdrop} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[.22]" />
      )}
      {children}
    </div>
  );
}

/** Your contact's picture: a real one if it's been dropped in, else the gpty in the sky. */
function BuddyPicture({ agent, mood, size }: { agent: ReturnType<typeof getAgent>; mood: Mood; size: number }) {
  const src = art("buddyPicture");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" />;
  }
  return (
    <div className="sk-dp-gpty">
      <Gpty agent={agent} size={size} mood={mood} />
    </div>
  );
}

function UserPicture() {
  const src = art("userPicture");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" />;
  }
  return <DefaultAvatar />;
}

function EventRow({ icon, text, at }: { icon: Note["icon"]; text: string; at: number }) {
  const tool = TOOLS.some((t) => t.id === icon);
  return (
    <div className="sk-msg sk-event">
      <div className="sk-who">
        {tool ? <ToolIcon id={icon as ToolId} className="sk-event-icon" /> : <EventGlyph id={icon as EventIcon} className="sk-event-icon" />}
      </div>
      <div className="sk-text">
        <Rich text={text} />
      </div>
      {at > 0 ? <time dateTime={new Date(at).toISOString()}>{clock(at)}</time> : <span />}
    </div>
  );
}

/** A file transfer that waits, crawls along at 1.6 KB/s, and fails. */
function FileRow({ note, file, buddy, onCancel }: { note: Note; file: Transfer; buddy: string; onCancel: (id: number) => void }) {
  const status = {
    waiting: `Waiting for ${buddy} to accept...`,
    sending: "1.6 KB/s · about 8 hours left",
    failed: `Transfer failed: ${buddy} is behind a firewall.`,
    canceled: "You canceled this transfer.",
  }[file.state];
  const open = file.state === "waiting" || file.state === "sending";
  return (
    <div className="sk-msg sk-event">
      <div className="sk-who">
        <ToolIcon id="files" className="sk-event-icon" />
      </div>
      <div className="sk-text">
        <div className="sk-xfer" data-state={file.state}>
          <div className="flex items-baseline gap-2">
            <b className="truncate">{file.name}</b>
            <span className="shrink-0 text-[11px] text-[var(--sk-mute)]">{file.size}</span>
          </div>
          <div className="sk-xfer-bar">
            <i />
          </div>
          <div className="flex items-center gap-2 text-[11.5px]">
            <span className="min-w-0 flex-1 truncate">{status}</span>
            {open && (
              <button type="button" onClick={() => onCancel(note.id)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
      <time dateTime={new Date(note.at).toISOString()}>{clock(note.at)}</time>
    </div>
  );
}

function CallBar({
  call,
  buddy,
  picture,
  onHangUp,
  onMute,
}: {
  call: Call;
  buddy: string;
  picture: React.ReactNode;
  onHangUp: () => void;
  onMute: () => void;
}) {
  const { phase, video } = call;
  const title = phase === "ringing" ? `Calling ${buddy}...` : phase === "over" ? call.end : `${video ? "Video call" : "Call"} with ${buddy}`;
  const sub =
    phase === "ringing"
      ? "Ringing"
      : phase === "live"
        ? "Connected"
        : phase === "bad"
          ? video
            ? `${buddy}'s video froze. Poor connection.`
            : "Poor connection... can you hear me?"
          : "";
  const frozen = art("frozen");
  return (
    <section className="sk-callbar" data-phase={phase} aria-label="Call" aria-live="polite">
      <div className={video ? "sk-call-video" : "sk-call-av"}>
        {video && phase === "bad" && frozen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={frozen} alt="" />
        ) : (
          <div className="sk-call-pic">{picture}</div>
        )}
        {video && phase === "bad" && <span className="sk-paused">Video paused</span>}
        {phase === "ringing" && (
          <span className="sk-ripples" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="sk-call-title truncate">{title}</div>
        <div className="sk-call-sub">
          {(phase === "live" || phase === "bad") && (
            <>
              <CallTimer t0={call.t0} />
              <Bars level={phase === "bad" ? 1 : 4} />
            </>
          )}
          <span className="truncate">{sub}</span>
        </div>
        {(phase === "live" || phase === "bad") && (
          <span className="sk-wave" data-bad={phase === "bad" ? "" : undefined} data-muted={call.muted ? "" : undefined} aria-hidden>
            {Array.from({ length: 28 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        )}
      </div>
      {phase !== "over" && (
        <div className="sk-call-ctl">
          {phase !== "ringing" && (
            <button type="button" className="sk-round" aria-pressed={call.muted} onClick={onMute} title={call.muted ? "Unmute" : "Mute"}>
              <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden>
                <rect x="7" y="2" width="6" height="10" rx="3" fill="currentColor" />
                <path d="M4.6 9.4a5.4 5.4 0 0 0 10.8 0M10 14.8v2.6M7 17.6h6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {call.muted && <path d="M3.4 3.4l13.2 13.2" stroke="#ff6b52" strokeWidth="2" strokeLinecap="round" />}
              </svg>
            </button>
          )}
          <button type="button" className="sk-round sk-round-red" onClick={onHangUp} title="Hang up" aria-label="Hang up">
            <Handset down className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}

function EmotePicker({ onPick }: { onPick: (code: string) => void }) {
  return (
    <div className="sk-pop sk-emotes" role="dialog" aria-label="Emoticons">
      <div className="sk-pop-title">Emoticons</div>
      <div className="sk-emote-grid">
        {EMOTES.map((e) => (
          <button
            key={e.id}
            type="button"
            className="sk-emote-btn"
            title={`${e.name}   ${e.codes[0]}`}
            aria-label={`${e.name} ${e.codes[0]}`}
            onClick={() => onPick(e.codes[0])}
          >
            <Emote id={e.id} />
          </button>
        ))}
      </div>
      <div className="sk-pop-foot">Tip: just type shortcuts like :) (wave) or (call)</div>
    </div>
  );
}

function PresenceMenu({ current, onPick }: { current: Presence; onPick: (p: Presence) => void }) {
  return (
    <div className="sk-pop sk-presence-menu" role="menu" aria-label="Change your status">
      {PRESENCES.map((p) => (
        <button key={p.id} type="button" role="menuitemradio" aria-checked={p.id === current} className="sk-menu-opt" onClick={() => onPick(p.id)}>
          <PresenceIcon status={p.id} className="h-4 w-4" />
          {p.label}
        </button>
      ))}
    </div>
  );
}

function ToastCard({
  kind,
  children,
  picture,
  onDone,
  onAnswer,
  onDecline,
}: {
  kind: Toast["kind"];
  children: React.ReactNode;
  picture: React.ReactNode;
  onDone: () => void;
  onAnswer: () => void;
  onDecline: () => void;
}) {
  const ring = kind === "ring";
  return (
    <div
      className="sk-toast"
      data-kind={kind}
      role={ring ? "alertdialog" : "status"}
      aria-label={ring ? "Incoming call" : undefined}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onDone();
      }}
    >
      <div className="sk-toast-head">
        <CloudMark className="h-3.5 w-3.5" />
        Skype™
        <svg viewBox="0 0 10 10" className="ml-auto h-2 w-2" aria-hidden>
          <path d="m1.5 1.5 7 7m0-7-7 7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div className="sk-toast-body">
        <div className="sk-toast-pic">
          {picture}
          {ring && (
            <span className="sk-ripples" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
      {ring && (
        <div className="sk-toast-actions">
          <button type="button" className="sk-answer" onClick={onAnswer}>
            <Handset className="h-4 w-4" /> Answer
          </button>
          <button type="button" className="sk-decline" onClick={onDecline}>
            <Handset down className="h-4 w-4" /> Decline
          </button>
        </div>
      )}
    </div>
  );
}

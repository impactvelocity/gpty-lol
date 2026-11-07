"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gpty, type Mood } from "@/components/Gpty";
import {
  art,
  BarIcon,
  type BarId,
  Butterfly,
  DefaultPicture,
  MsnDefs,
  Pencil,
  SceneArt,
  StatusOrb,
  ToolIcon,
  type ToolId,
} from "@/components/msn/art";
import { EMOTES, Emote, Rich } from "@/components/msn/emoticons";
import { segoe } from "@/components/msn/font";
import "@/components/msn/msn.css";
import { getAgent } from "@/lib/agents";
import { useComposer, useDesktopDrag, useOnNewReply, useStickyScroll } from "./hooks";
import { clock, type ChatLine, type LayoutProps } from "./types";


export const NUDGE = "/nudge";

const EMAIL = "kayleigh.gpty@hotmail.com";

/** Each conversation gets its own personal message and song, like a fresh login. */
const PSMS = [
  "~*~ im not addicted 2 msn, i can stop whenever i want ~*~",
  "if ur reading this ur 2 close (H)",
  "brb mum needs the computer :@",
  "(L) lifes 2 short 2 b serious (L)",
  "studying... (not really) :P",
  "~*~ bored bored bored ~*~ talk 2 me!!",
];
const SONGS = [
  "The Killers - Mr. Brightside",
  "Gorillaz - Feel Good Inc.",
  "Green Day - Boulevard of Broken Dreams",
  "Kelly Clarkson - Since U Been Gone",
  "Fall Out Boy - Sugar, We're Goin Down",
  "Gwen Stefani - Hollaback Girl",
  "Coldplay - Speed of Sound",
  "Crazy Frog - Axel F",
];

const TOOLS: { id: ToolId; label: string }[] = [
  { id: "invite", label: "Invite" },
  { id: "files", label: "Send Files" },
  { id: "webcam", label: "Webcam" },
  { id: "audio", label: "Audio" },
  { id: "activities", label: "Activities" },
  { id: "games", label: "Games" },
];

/** Tools that send an invitation your buddy (always) turns down. */
const INVITES: Partial<Record<ToolId, { what: string; declined: string }>> = {
  files: {
    what: 'receive the file "homework_FINAL_final2.doc" (24 KB)',
    declined: 'has declined to receive "homework_FINAL_final2.doc".',
  },
  webcam: { what: "view your webcam", declined: "has declined your invitation to view your webcam." },
  audio: { what: "start an audio conversation", declined: "has declined your invitation to start an audio conversation." },
  games: { what: "play Minesweeper Flags", declined: "has declined your invitation to play Minesweeper Flags." },
};

/** Everything else just says something period-correct. */
function alertFor(id: ToolId | BarId | "search", buddy: string) {
  switch (id) {
    case "invite":
      return "You can't invite anyone else right now: all 12 of your other contacts appear offline.";
    case "activities":
      return "No activities are available right now. Please try again later.";
    case "winks":
      return `${buddy} is using a version of MSN Messenger that doesn't support winks.`;
    case "voice":
      return "Hold down the Voice Clip button (F2) while you talk to record a voice clip.";
    case "backgrounds":
      return `${buddy} is using a version of MSN Messenger that doesn't support backgrounds.`;
    case "search":
      return `MSN Search is busy right now. Try asking ${buddy} instead ;)`;
    default:
      return "This feature is not available right now.";
  }
}

/** The fonts people actually picked in 2005. Applied to your own messages. */
const FONTS = [
  { id: "segoe", name: "Segoe UI", style: { fontFamily: "var(--msn-font)", color: "#0f2350" } },
  { id: "tahoma", name: "Tahoma", style: { fontFamily: "Tahoma, Verdana, sans-serif", color: "#1f45b5" } },
  { id: "comic", name: "Comic Sans MS", style: { fontFamily: "var(--msn-buddy-font)", color: "#0a8a3a", fontSize: "13.5px" } },
  { id: "trebuchet", name: "Trebuchet MS", style: { fontFamily: "'Trebuchet MS', sans-serif", color: "#d0306f", fontWeight: 700 } },
  { id: "verdana", name: "Verdana", style: { fontFamily: "Verdana, sans-serif", color: "#e0600b", fontSize: "12px" } },
  { id: "georgia", name: "Georgia", style: { fontFamily: "Georgia, serif", color: "#5b2a86", fontStyle: "italic" } },
  { id: "courier", name: "Courier New", style: { fontFamily: "'Courier New', monospace", color: "#1d1d1d", fontWeight: 700 } },
] satisfies { id: string; name: string; style: React.CSSProperties }[];

const FONT_KEY = "gpty.msn.font";

function loadFont() {
  try {
    return FONTS.find((f) => f.id === localStorage.getItem(FONT_KEY)) ?? FONTS[0];
  } catch {
    return FONTS[0];
  }
}

function pick<T>(list: T[], seed: string, salt = 0) {
  let h = salt;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

/* ───────── What the history shows ───────── */

interface Note {
  id: number;
  /** Shown after this line (null: right after the greeting). */
  after: string | null;
  icon: ToolId | BarId;
  text: string;
  invite?: { what: string; open: boolean };
}

type Row =
  | { kind: "msg"; key: string; mine: boolean; text: string; at: number }
  | { kind: "nudge"; key: string; mine: boolean }
  | { kind: "note"; key: string; note: Note };

type Block = Exclude<Row, { kind: "msg" }> | { kind: "said"; key: string; mine: boolean; rows: Extract<Row, { kind: "msg" }>[] };

/**
 * Lines become rows: nudges (yours, or a "/nudge" line in a reply) become
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
      rows.push(l.text.trim() === NUDGE ? { kind: "nudge", key: l.id, mine } : { kind: "msg", key: l.id, mine, text: l.text, at: l.at });
    } else {
      const live = busy && i === lines.length - 1;
      const parts = l.text.split("\n");
      const kept: string[] = [];
      parts.forEach((s, j) => {
        const t = s.trim().toLowerCase();
        if (t === NUDGE) rows.push({ kind: "nudge", key: `${l.id}:${j}`, mine });
        // Hide a "/nud" that is still streaming in, so it never flashes as text.
        else if (!(live && j === parts.length - 1 && t.startsWith("/") && NUDGE.startsWith(t))) kept.push(s);
      });
      // One thought per line, like hitting enter a lot: no blank lines between.
      const text = kept.join("\n").replace(/\n\s*\n+/g, "\n").trim();
      if (text) rows.push({ kind: "msg", key: l.id, mine, text, at: l.at });
    }
    notesAfter(l.id);
  });
  return rows;
}

/** Consecutive messages from the same person share one "says:" header. */
function toBlocks(rows: Row[]): Block[] {
  const out: Block[] = [];
  for (const r of rows) {
    const prev = out.at(-1);
    if (r.kind !== "msg") out.push(r);
    else if (prev?.kind === "said" && prev.mine === r.mine) prev.rows.push(r);
    else out.push({ kind: "said", key: r.key, mine: r.mine, rows: [r] });
  }
  return out;
}

/** A reply as plain text, without its nudge line. */
function replyText(text: string) {
  return text
    .split("\n")
    .filter((s) => s.trim().toLowerCase() !== NUDGE)
    .join(" ")
    .trim();
}

/** Only one "has just signed in" per visit. */
let signedIn = false;

/* ───────── The window ───────── */

/** MSN Messenger 7.5, remastered: Aero glass, a scene up top, glossy everything. */
export function MsnLayout({ costume, lines, busy, waiting, error, onSend, activeId }: LayoutProps) {
  const agent = getAgent(costume.id);
  const buddy = costume.assistant;
  const { value, setValue, submit, onKeyDown } = useComposer(onSend, busy);
  // Drag the window around the chat area by its title bar, like a desktop.
  const { ref: win, handle } = useDesktopDrag<HTMLDivElement>(costume.id);
  const input = useRef<HTMLTextAreaElement>(null);
  const compose = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [menu, setMenu] = useState<"emotes" | "font" | null>(null);
  const [font, setFont] = useState(loadFont);
  const [toast, setToast] = useState<{ k: number; kind: "says" | "signin"; id?: string } | null>(null);

  const psm = pick(PSMS, activeId);
  const song = pick(SONGS, activeId, 7);
  const mood: Mood = error ? "error" : waiting ? "thinking" : busy ? "typing" : "watching";

  const rows = useMemo(() => toRows(costume.greeting, lines, notes, busy), [costume.greeting, lines, notes, busy]);
  const blocks = useMemo(() => toBlocks(rows), [rows]);
  const scroller = useStickyScroll<HTMLDivElement>(`${rows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}`);

  /* Notes and invitations */

  // Read from timers and key handlers, so they always see the latest values.
  const latest = useRef({ lastLine: null as string | null, notes });
  useEffect(() => {
    latest.current = { lastLine: lines.at(-1)?.id ?? null, notes };
  });
  const seq = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const addNote = useCallback((icon: Note["icon"], text: string, invite?: Note["invite"]) => {
    const id = ++seq.current;
    setNotes((ns) => [...ns, { id, after: latest.current.lastLine, icon, text, invite }]);
    return id;
  }, []);

  const close = (id: number) =>
    setNotes((ns) => ns.map((n) => (n.id === id && n.invite ? { ...n, invite: { ...n.invite, open: false } } : n)));

  const openTool = (id: ToolId) => {
    const inv = INVITES[id];
    if (!inv) return addNote(id, alertFor(id, buddy));
    const nid = addNote(id, `You have invited ${buddy} to ${inv.what}.`, { what: inv.what, open: true });
    timers.current.set(
      nid,
      setTimeout(() => {
        timers.current.delete(nid);
        close(nid);
        addNote(id, `${buddy} ${inv.declined}`);
      }, 2200 + (nid % 3) * 800),
    );
  };

  const cancel = useCallback(
    (id: number) => {
      const n = latest.current.notes.find((x) => x.id === id);
      if (!n?.invite?.open) return;
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
      close(id);
      addNote(n.icon, `You have canceled the invitation to ${n.invite.what}.`);
    },
    [addNote],
  );

  // Alt+Q cancels the newest pending invitation, as it always did.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.code !== "KeyQ") return;
      const open = latest.current.notes.findLast((n) => n.invite?.open);
      if (!open) return;
      e.preventDefault();
      cancel(open.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancel]);

  /* Nudges */

  const shake = useCallback(() => {
    const el = win.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.remove("nudge");
    void el.offsetWidth; // restart the animation
    el.classList.add("nudge");
  }, [win]);

  const lastNudge = useRef(0);
  const sendNudge = () => {
    if (busy) return;
    if (Date.now() - lastNudge.current < 10_000) {
      addNote("nudge", "You can't send nudges so often. Wait a moment, then try again.");
      return;
    }
    lastNudge.current = Date.now();
    shake();
    onSend(NUDGE);
  };

  // Your buddy can nudge you back. Nudges already in the history stay still.
  const buddyNudges = rows.filter((r) => r.kind === "nudge" && !r.mine).map((r) => r.key).join(" ");
  const shaken = useRef<Set<string> | null>(null);
  useEffect(() => {
    const keys = buddyNudges ? buddyNudges.split(" ") : [];
    if (!shaken.current) {
      shaken.current = new Set(keys);
      return;
    }
    const fresh = keys.filter((k) => !shaken.current!.has(k));
    if (!fresh.length) return;
    fresh.forEach((k) => shaken.current!.add(k));
    shake();
  }, [buddyNudges, shake]);

  /* Toasts */

  useOnNewReply(lines, () => {
    // Keep the id, not the text: the reply is still streaming at this point.
    const last = lines.at(-1);
    if (last) setToast({ k: Date.now(), kind: "says", id: last.id });
  });
  useEffect(() => {
    if (signedIn) return;
    const t = setTimeout(() => {
      signedIn = true;
      setToast({ k: Date.now(), kind: "signin" });
    }, 900);
    return () => clearTimeout(t);
  }, []);

  /* Composer menus */

  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      if (!compose.current?.contains(e.target as Node)) setMenu(null);
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

  const chooseFont = (id: string) => {
    const f = FONTS.find((x) => x.id === id) ?? FONTS[0];
    setFont(f);
    setMenu(null);
    try {
      localStorage.setItem(FONT_KEY, f.id);
    } catch {}
    input.current?.focus();
  };

  const lastReply = lines.findLast((l) => l.role === "assistant" && l.at);
  const lastMine = lines.findLast((l) => l.role === "user" && l.text !== NUDGE);
  const toastLine = toast?.kind === "says" ? lines.find((l) => l.id === toast.id) : undefined;
  const toastText = toastLine ? replyText(toastLine.text) : "";

  return (
    <div className={`${segoe.variable} msn flex h-full justify-center`}>
      <div ref={win} className="msn-window" style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}>
        <MsnDefs />

        <header className="msn-scene">
          <Scene />
          <div className="msn-titlebar" {...handle}>
            <div className="msn-title">
              <Butterfly className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{buddy} - Conversation</span>
            </div>
            <Caps />
          </div>

          <div className="msn-to">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <StatusOrb className="h-3.5 w-3.5 shrink-0" />
                <span className="msn-name truncate">{buddy}</span>
                <span className="msn-presence shrink-0">(Online)</span>
                <span className="msn-email truncate max-sm:hidden">&lt;{EMAIL}&gt;</span>
              </div>
              <div className="msn-psm mt-1 truncate pl-[22px]">
                <Rich text={psm} />
              </div>
              <div className="mt-1 pl-[22px]" title="What I'm listening to">
                <span className="msn-np">
                  <span className="msn-eq" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="truncate">{song}</span>
                </span>
              </div>
            </div>
          </div>

          <nav className="msn-tools" aria-label="Conversation tools">
            {TOOLS.map((t) => (
              <button key={t.id} type="button" className="msn-tool" onClick={() => openTool(t.id)}>
                <ToolIcon id={t.id} />
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </header>

        <div className="msn-body">
          <History>
            <div ref={scroller} className="msn-history h-full" aria-live="polite">
              <p className="msn-warn">Never give out your password or credit card number in an instant message conversation.</p>
              {blocks.map((b) =>
                b.kind === "said" ? (
                  <div key={b.key} className="msn-said">
                    <div className="msn-says">{b.mine ? costume.user : buddy} says:</div>
                    {b.rows.map((r) => (
                      <div
                        key={r.key}
                        className={`msn-row ${b.mine ? "msn-me-text" : "msn-buddy-text"}`}
                        style={b.mine ? font.style : undefined}
                      >
                        <Rich text={r.text} />
                        {r.at > 0 && <time dateTime={new Date(r.at).toISOString()}>{clock(r.at)}</time>}
                      </div>
                    ))}
                  </div>
                ) : b.kind === "nudge" ? (
                  <div key={b.key} className="msn-event">
                    <BarIcon id="nudge" />
                    {b.mine ? "You have just sent a nudge." : `${buddy} has just sent you a nudge.`}
                  </div>
                ) : (
                  <NoteLine key={b.key} note={b.note} onCancel={cancel} />
                ),
              )}
              {error && (
                <div className="msn-note msn-error">
                  <BarIcon id="info" />
                  <span>
                    {costume.error}
                    {lastMine && <span className="block italic text-[#8b95a9]">{replyText(lastMine.text)}</span>}
                  </span>
                </div>
              )}
            </div>
          </History>

          <Picture className="row-start-1 col-start-2" label={`${buddy}'s display picture`}>
            <BuddyPicture agent={agent} mood={mood} size={80} />
          </Picture>

          <div ref={compose} className="msn-panel msn-compose">
            <div className="msn-fmt" role="toolbar" aria-label="Message tools">
              <button
                type="button"
                className="msn-fbtn"
                title="Change font"
                aria-haspopup="menu"
                aria-expanded={menu === "font"}
                onClick={() => setMenu((m) => (m === "font" ? null : "font"))}
              >
                <BarIcon id="font" />
                <Chev />
              </button>
              <button
                type="button"
                className="msn-fbtn"
                title="Select an emoticon"
                aria-haspopup="dialog"
                aria-expanded={menu === "emotes"}
                onClick={() => setMenu((m) => (m === "emotes" ? null : "emotes"))}
              >
                <Emote id="smile" className="" />
                <Chev />
              </button>
              <button type="button" className="msn-fbtn" title="Send a wink" onClick={() => addNote("winks", alertFor("winks", buddy))}>
                <BarIcon id="winks" />
                <Chev />
              </button>
              <span className="msn-sep" />
              <button type="button" className="msn-fbtn" title="Send a nudge" onClick={sendNudge} disabled={busy}>
                <BarIcon id="nudge" />
                <span>Nudge</span>
              </button>
              <button type="button" className="msn-fbtn" title="Voice Clip" onClick={() => addNote("voice", alertFor("voice", buddy))}>
                <BarIcon id="voice" />
                <span className="msn-lbl">Voice Clip</span>
              </button>
              <span className="msn-sep" />
              <button
                type="button"
                className="msn-fbtn"
                title="Change background"
                onClick={() => addNote("backgrounds", alertFor("backgrounds", buddy))}
              >
                <BarIcon id="backgrounds" />
                <Chev />
              </button>
            </div>

            {menu === "emotes" && <EmotePicker onPick={insert} />}
            {menu === "font" && <FontPicker current={font.id} onPick={chooseFont} />}

            <div className="msn-input-row">
              <textarea
                ref={input}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                rows={3}
                aria-label={`Message ${buddy}`}
                className="msn-input"
                style={font.style}
              />
              <div className="msn-actions">
                <button type="button" onClick={submit} disabled={busy || !value.trim()} className="msn-btn msn-send">
                  Send
                </button>
                <button type="button" className="msn-btn msn-search" onClick={() => addNote("info", alertFor("search", buddy))}>
                  Search <Chev />
                </button>
              </div>
            </div>
          </div>

          <Picture className="row-start-2 col-start-2 self-end" label="Your display picture">
            <UserPicture />
          </Picture>
        </div>

        <footer className="msn-status">
          {waiting ? (
            <>
              <Pencil className="msn-pencil h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{costume.typing}</span>
            </>
          ) : lastReply ? (
            <span className="truncate">
              Last message received at {clock(lastReply.at)} on {new Date(lastReply.at).toLocaleDateString()}.
            </span>
          ) : null}
        </footer>
      </div>

      {toast && (toast.kind === "signin" || toastText || toastLine) && (
        <Toast key={toast.k} onDone={() => setToast(null)} picture={<BuddyPicture agent={agent} mood="watching" size={40} />}>
          {toast.kind === "signin" ? (
            <>
              <b className="text-[#1a3f9e]">{buddy}</b> has just signed in.
            </>
          ) : toastText ? (
            <>
              <b className="text-[#1a3f9e]">{buddy}</b> says:
              <span className="line-clamp-2 block text-[#333c55]">
                <Rich text={toastText} />
              </span>
            </>
          ) : (
            <>
              <b className="text-[#1a3f9e]">{buddy}</b> has just sent you a nudge.
            </>
          )}
        </Toast>
      )}
    </div>
  );
}

/* ───────── Pieces ───────── */

function Scene() {
  const photo = art("scene");
  return (
    <div className="msn-scene-art" aria-hidden>
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" />
          <div className="msn-wash" />
        </>
      ) : (
        <SceneArt />
      )}
    </div>
  );
}

/** Minimize, maximize, close: glass, and purely for show. */
function Caps() {
  return (
    <div className="msn-caps" aria-hidden>
      <span className="msn-cap">
        <svg viewBox="0 0 10 10">
          <rect x="1" y="6.6" width="8" height="2" rx=".4" fill="#fff" />
        </svg>
      </span>
      <span className="msn-cap">
        <svg viewBox="0 0 10 10">
          <path d="M1 1h8v8H1Z M2.6 3.4v4h4.8v-4Z" fill="#fff" fillRule="evenodd" />
        </svg>
      </span>
      <span className="msn-cap msn-cap-x">
        <svg viewBox="0 0 10 10">
          <path d="m1.6 1.6 6.8 6.8m0-6.8-6.8 6.8" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}

function Chev() {
  return (
    <svg viewBox="0 0 8 8" className="msn-chev" aria-hidden>
      <path d="M1 2.6h6L4 6Z" fill="currentColor" />
    </svg>
  );
}

/** The history panel, with an optional faded background picture behind it. */
function History({ children }: { children: React.ReactNode }) {
  const backdrop = art("backdrop");
  return (
    <div className="msn-panel relative col-start-1 row-start-1 min-h-0 overflow-hidden">
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={backdrop} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[.16]" />
      )}
      {children}
    </div>
  );
}

function Picture({ children, label, className = "" }: { children: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={`msn-dp ${className}`} role="img" aria-label={label}>
      <div className="msn-dp-frame">
        <div className="msn-dp-pic">{children}</div>
      </div>
      <span className="msn-dp-caret" aria-hidden>
        <Chev />
      </span>
    </div>
  );
}

/** Your buddy's picture: a real one if it's been dropped in, else the gpty itself. */
function BuddyPicture({ agent, mood, size }: { agent: ReturnType<typeof getAgent>; mood: Mood; size: number }) {
  const src = art("buddyPicture");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" />;
  }
  return (
    <div className="msn-dp-gpty">
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
  return <DefaultPicture />;
}

function NoteLine({ note, onCancel }: { note: Note; onCancel: (id: number) => void }) {
  const tool = TOOLS.some((t) => t.id === note.icon);
  return (
    <div className="msn-note">
      {tool ? <ToolIcon id={note.icon as ToolId} /> : <BarIcon id={note.icon as BarId} />}
      <span>
        <Rich text={note.text} />
        {note.invite && (
          <>
            {" "}
            Please wait for a response or{" "}
            {note.invite.open ? (
              <button type="button" onClick={() => onCancel(note.id)}>
                Cancel
              </button>
            ) : (
              "Cancel"
            )}{" "}
            (Alt+Q).
          </>
        )}
      </span>
    </div>
  );
}

function EmotePicker({ onPick }: { onPick: (code: string) => void }) {
  return (
    <div className="msn-pop left-[34px]" role="dialog" aria-label="Emoticons">
      <div className="msn-pop-title">Emoticons</div>
      <div className="msn-emote-grid">
        {EMOTES.map((e) => (
          <button
            key={e.id}
            type="button"
            className="msn-emote-btn"
            title={`${e.name}   ${e.codes[0]}`}
            aria-label={`${e.name} ${e.codes[0]}`}
            onClick={() => onPick(e.codes[0])}
          >
            <Emote id={e.id} />
          </button>
        ))}
      </div>
      <div className="msn-pop-foot">Tip: just type shortcuts like :) or (Y)</div>
    </div>
  );
}

function FontPicker({ current, onPick }: { current: string; onPick: (id: string) => void }) {
  return (
    <div className="msn-pop left-1 w-[236px]" role="menu" aria-label="Font">
      <div className="msn-pop-title">Your font</div>
      {FONTS.map((f) => (
        <button
          key={f.id}
          type="button"
          role="menuitemradio"
          aria-checked={f.id === current}
          className="msn-font-opt"
          style={f.style}
          onClick={() => onPick(f.id)}
        >
          {f.name}
          <small>{f.id === current ? "✓" : ""}</small>
        </button>
      ))}
      <div className="msn-pop-foot">This is how your messages look.</div>
    </div>
  );
}

function Toast({ children, picture, onDone }: { children: React.ReactNode; picture: React.ReactNode; onDone: () => void }) {
  return (
    <div
      className="msn-toast"
      role="status"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onDone();
      }}
    >
      <div className="msn-toast-head">
        <Butterfly className="h-3.5 w-3.5" />
        MSN Messenger
        <svg viewBox="0 0 10 10" className="ml-auto h-2 w-2" aria-hidden>
          <path d="m1.5 1.5 7 7m0-7-7 7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div className="msn-toast-body">
        <div className="msn-dp-frame">
          <div className="msn-dp-pic">{picture}</div>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

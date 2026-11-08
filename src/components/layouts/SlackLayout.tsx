"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Mood } from "@/components/Gpty";
import { Avatar, Custom, FileIcon, GIFS, GifStandIn, HashMark, Icon, TeamLogo, TrafficLights, type Who } from "@/components/slack/art";
import { emojiFor, Mrkdwn, PICKER, PICKER_CUSTOM, plain } from "@/components/slack/mrkdwn";
import "@/components/slack/slack.css";
import {
  COMMANDS,
  DMS,
  dmRoom,
  MENTIONS,
  MORE_CHANNELS,
  PEOPLE,
  type PersonId,
  QUOTES,
  type Room,
  ROOMS,
  roomById,
  type Scripted,
  TEAM,
  UPLOADS,
} from "@/components/slack/workspace";
import { useComposer, useDesktopDrag, useNow, useOnNewReply, useStickyScroll } from "./hooks";
import { clock, type ChatLine, type LayoutProps, type ThreadItem } from "./types";

/**
 * A GIF, as a line of its own: "/giphy cats". Yours, or one in a reply, which
 * is Channing posting one.
 */
export const GIPHY = "/giphy";
const GIPHY_LINE = /^\/giphy(?:\s+(.*))?$/i;
const ME_LINE = /^\/me\s+(.+)$/i;

const FIVE_MIN = 5 * 60_000;

/** Channels Channing made this week, for "+ 23 more…". */
const MORE = [
  "lunch-tuesdays", "lunch-wednesdays", "lunch-thursdays", "synergy-2", "synergy-3-final", "channing-test",
  "channing-test-2", "channel-ideas", "ideas-for-channels", "email-is-dead", "email-memorial", "standup-standup",
  "kombucha-ops", "q2-synergy-prep", "prep-for-q2-synergy-prep", "fun", "fun-mandatory", "wins", "small-wins",
  "tiny-wins", "flappy-bird-memorial", "2048-strats", "let-it-go",
];

/** Words Channing drops to fit a question into a 21-character channel name. */
const FILLER = new Set(
  "a an the is are am was were be do does did i you we my me your to of for in on at and or can could should would will what whats how why who when where which that this it its please tell about with just really so hey hi".split(" "),
);

/** "Is a hot dog a sandwich?" -> "hot-dog-sandwich": Slack's 21 characters, lowercase, hyphens. */
export function channelName(title: string) {
  let words = title.toLowerCase().replace(/['’]/g, "").split(/[^a-z0-9]+/).filter(Boolean);
  if (words.join("-").length > 21) {
    const kept = words.filter((w) => !FILLER.has(w));
    if (kept.length) words = kept;
  }
  let out = "";
  for (const w of words) {
    const next = out ? `${out}-${w}` : w;
    if (next.length > 21) break;
    out = next;
  }
  return out || (words[0] ?? "").slice(0, 21) || "untitled";
}

/* ───────── Small persisted preferences ───────── */

const KEYS = { notify: "gpty.slack.notify", banner: "gpty.slack.banner", away: "gpty.slack.away", starred: "gpty.slack.starred" };

function load(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function save(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

/** The loading screen plays once per visit, like opening the app in the morning. */
let loadedOnce = false;
/** When each scripted room was last read, so #random keeps climbing from there. */
const readAt = new Map<string, number>();
const opened = Date.now();
/** Topics set with /topic, per conversation, for this visit. */
const topics = new Map<string, string>();

function pick<T>(list: T[], seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

/* ───────── What the history shows ───────── */

interface Upload {
  name: string;
  size: string;
  state: "uploading" | "failed";
}

/** Something that happened here and was never sent: slackbot, uploads, topics. */
interface Note {
  id: number;
  /** Shown after this line (null: right after the greeting). */
  after: string | null;
  kind: "slackbot" | "upload" | "sys";
  text: string;
  at: number;
  file?: Upload;
}

type Msg = {
  kind: "msg";
  key: string;
  who: Who;
  text: string;
  at: number;
  gif?: string;
  action?: boolean;
  ephemeral?: boolean;
  file?: Upload | Scripted["file"];
  /** Stays apart from the message above it, even from the same person. */
  head?: boolean;
  /** A scripted message's own time ("9:14 AM", "Yesterday"). */
  stamp?: string;
};
type Row = Msg | { kind: "sys"; key: string; text: React.ReactNode; at: number } | { kind: "new"; key: string };

/**
 * Lines become rows: a "/giphy" line is a GIF, "/me" an action, and notes
 * slot in after the line they followed.
 */
function toRows({
  greeting,
  t0,
  lines,
  notes,
  busy,
  renamed,
  newFrom,
  draft,
}: {
  draft: string;
  greeting: string;
  t0: number;
  lines: ChatLine[];
  notes: Note[];
  busy: boolean;
  renamed: string | null;
  newFrom: string | null;
}): Row[] {
  const rows: Row[] = [
    { kind: "sys", key: "joined", text: <><b>channing</b> has joined the channel</>, at: t0 },
    { kind: "msg", key: "greeting", who: "channing", text: greeting, at: t0 },
  ];
  const notesAfter = (id: string | null) => {
    for (const n of notes) {
      if (n.after !== id) continue;
      if (n.kind === "sys") rows.push({ kind: "sys", key: `n${n.id}`, text: n.text, at: n.at });
      else
        rows.push({
          kind: "msg",
          key: `n${n.id}`,
          who: n.kind === "slackbot" ? "slackbot" : "you",
          text: n.text,
          at: n.at,
          ephemeral: n.kind === "slackbot",
          file: n.file,
        });
    }
  };
  notesAfter(null);
  let firstMine = true;
  lines.forEach((l, i) => {
    if (newFrom === l.id) rows.push({ kind: "new", key: "new" });
    if (l.role === "user") {
      const text = l.text.trim();
      const gif = GIPHY_LINE.exec(text);
      const me = ME_LINE.exec(text);
      rows.push(
        gif
          ? { kind: "msg", key: l.id, who: "you", text: `/giphy ${gif[1] ?? ""}`.trim(), at: l.at, gif: gif[1] ?? "" }
          : me
            ? { kind: "msg", key: l.id, who: "you", text: me[1], at: l.at, action: true }
            : { kind: "msg", key: l.id, who: "you", text: l.text, at: l.at },
      );
      if (firstMine && renamed) {
        rows.push({
          kind: "sys",
          key: "renamed",
          text: (
            <>
              <b>channing</b> renamed the channel from &ldquo;{draft}&rdquo; to &ldquo;{renamed}&rdquo;
            </>
          ),
          at: l.at,
        });
      }
      firstMine = false;
    } else {
      // A reply can carry a GIF or an action on a line of its own.
      const live = busy && i === lines.length - 1;
      const parts = l.text.split("\n");
      let kept: string[] = [];
      let n = 0;
      const flush = () => {
        const text = kept.join("\n").trim();
        if (text) rows.push({ kind: "msg", key: `${l.id}:${n++}`, who: "channing", text, at: l.at });
        kept = [];
      };
      parts.forEach((s, j) => {
        const t = s.trim();
        const gif = GIPHY_LINE.exec(t);
        const me = ME_LINE.exec(t);
        const streaming = live && j === parts.length - 1;
        if (gif && !streaming) {
          flush();
          rows.push({ kind: "msg", key: `${l.id}:${n++}`, who: "channing", text: t, at: l.at, gif: gif[1] ?? "" });
        } else if (me && !streaming) {
          flush();
          rows.push({ kind: "msg", key: `${l.id}:${n++}`, who: "channing", text: me[1], at: l.at, action: true });
        } else if (streaming && t.startsWith("/") && (GIPHY.startsWith(t.toLowerCase().split(" ")[0]) || "/me".startsWith(t.toLowerCase()))) {
          // A "/gi" still streaming in: wait for the rest so it never flashes as text.
        } else kept.push(s);
      });
      flush();
    }
    notesAfter(l.id);
  });
  return rows;
}

function scriptedRows(room: Room): Row[] {
  return room.messages.map((m, i) => {
    const gif = GIPHY_LINE.exec(m.text);
    const msg: Msg = {
      kind: "msg",
      key: `${room.id}:${i}`,
      who: m.who,
      text: m.text,
      at: -1,
      stamp: m.at,
      gif: gif ? (gif[1] ?? "") : undefined,
      file: m.file,
    };
    return msg;
  });
}

/* ───────── The window ───────── */

type Flex = "search" | "mentions" | "stars" | "team" | "channels" | null;
type Menu = "team" | "plus" | "emoji" | null;
type Starred = { key: string; who: Who; where: string; text: string; stamp: string };

/** Slack in early 2014, remastered: the aubergine sidebar, a channel for everything, and a workspace that never stops. */
export function SlackLayout({
  costume,
  lines,
  busy,
  waiting,
  error,
  onSend,
  threads,
  activeId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
}: LayoutProps) {
  const { ref: win, handle } = useDesktopDrag<HTMLDivElement>();
  const input = useRef<HTMLTextAreaElement>(null);
  const foot = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  const [peek, setPeek] = useState<string | null>(null);
  const [side, setSide] = useState(false);
  const [flex, setFlex] = useState<Flex>(null);
  const [menu, setMenu] = useState<Menu>(null);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [stars, setStars] = useState<Map<string, Starred>>(() => new Map());
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(() => !loadedOnce);
  const [quote, setQuote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [notify, setNotify] = useState(() => load(KEYS.notify) === "on");
  const [banner, setBanner] = useState<"ask" | "ok" | null>(() => (load(KEYS.notify) || load(KEYS.banner) ? null : "ask"));
  const [away, setAway] = useState(() => load(KEYS.away) === "1");
  const [starredRooms, setStarredRooms] = useState<string[]>(() => {
    try {
      return JSON.parse(load(KEYS.starred) ?? "[]");
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState<{ k: number; id: string } | null>(null);
  const [missed, setMissed] = useState(0);
  const [newFrom, setNewFrom] = useState<string | null>(null);
  const [topic, setTopic] = useState(() => topics.get(activeId) ?? "");
  const [t0] = useState(() => lines[0]?.at || Date.now());
  const [cmdAt, setCmdAt] = useState(0);

  useEffect(() => {
    loadedOnce = true;
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus({ preventScroll: true });
  }, []);

  const active = threads.find((t) => t.id === activeId);
  const channel = !active || active.draft || !active.title ? costume.newThread : channelName(active.title);
  const renamed = active && !active.draft && active.title ? channelName(active.title) : null;
  const room = roomById(peek);
  const mood: Mood = error ? "error" : waiting ? "thinking" : busy ? "typing" : "watching";

  /* Notes and stars */

  const latest = useRef({ lastLine: null as string | null, peek: null as string | null });
  useEffect(() => {
    latest.current = { lastLine: lines.at(-1)?.id ?? null, peek };
  });
  const seq = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const addNote = useCallback((kind: Note["kind"], text: string, file?: Upload) => {
    const id = ++seq.current;
    setNotes((ns) => [...ns, { id, after: latest.current.lastLine, kind, text, at: Date.now(), file }]);
    return id;
  }, []);
  const slackbot = useCallback((text: string) => addNote("slackbot", text), [addNote]);

  const toggleStar = (s: Starred) =>
    setStars((m) => {
      const next = new Map(m);
      if (next.has(s.key)) next.delete(s.key);
      else next.set(s.key, s);
      return next;
    });

  const starRoom = (id: string) => {
    setStarredRooms((list) => {
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      save(KEYS.starred, JSON.stringify(next));
      return next;
    });
  };

  /* Uploads that never fit */

  const upSeq = useRef(0);
  const upload = () => {
    setMenu(null);
    const f = UPLOADS[upSeq.current++ % UPLOADS.length];
    const id = addNote("upload", "", { ...f, state: "uploading" });
    timers.current.push(
      setTimeout(() => {
        setNotes((ns) => ns.map((n) => (n.id === id && n.file ? { ...n, file: { ...n.file, state: "failed" } } : n)));
        slackbot(`Upload failed: your team has used *5 GB of 5 GB* of file storage on the free plan. (Mostly @priya's .psd files.)`);
      }, 5200),
    );
  };

  /* Moving around */

  const go = (id: string | null) => {
    setPeek(id);
    setSide(false);
    setMenu(null);
    if (id === null && missed) setMissed(0);
    requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
  };
  // A room is read from the moment you open it until you leave; #random climbs again from there.
  useEffect(() => {
    if (!peek) return;
    readAt.set(peek, Date.now());
    return () => {
      readAt.set(peek, Date.now());
    };
  }, [peek]);

  const openThread = (id: string) => {
    if (id === activeId) return go(null);
    setSide(false);
    onSelectThread(id);
  };
  const goChannel = (name: string) => {
    const r = ROOMS.find((x) => x.kind !== "dm" && x.name === name);
    if (r) return go(r.id);
    const t = threads.find((x) => !x.draft && x.title && channelName(x.title) === name);
    if (t) openThread(t.id);
  };
  const toggleFlex = (f: Exclude<Flex, null>) => setFlex((cur) => (cur === f ? null : f));

  /* Replies: notifications, and the red line when you missed one */

  useOnNewReply(lines, () => {
    const last = lines.at(-1);
    if (!last) return;
    if (latest.current.peek) {
      setMissed((n) => n + 1);
      setNewFrom((cur) => cur ?? last.id);
    }
    if (notify) setToast({ k: Date.now(), id: last.id });
  });
  // Your next message clears the red line.
  const mineCount = lines.filter((l) => l.role === "user").length;
  const mineSeen = useRef(mineCount);
  useEffect(() => {
    if (mineCount !== mineSeen.current) {
      mineSeen.current = mineCount;
      setNewFrom(null);
    }
  }, [mineCount]);

  /** Your presence, from /away or the card at the foot of the sidebar. */
  const toggleAway = () => {
    const next = !away;
    setAway(next);
    save(KEYS.away, next ? "1" : null);
    if (!room) slackbot(next ? "You are now marked as *away*." : "You are now marked as *active*. Welcome back! :simple_smile:");
  };

  /* Sending, and the slash commands that never leave the window */

  const handleSend = (raw: string) => {
    const text = raw.trim();
    setMenu(null);
    // Scripted rooms have no composer; only the conversation with Channing is real.
    if (room) return;
    if (!text.startsWith("/")) return onSend(text);
    const cmd = text.split(/\s+/)[0].toLowerCase();
    const arg = text.slice(cmd.length).trim();
    switch (cmd) {
      case "/giphy":
        return arg ? onSend(`/giphy ${arg}`) : slackbot("Give me something to search for: `/giphy [text]`");
      case "/me":
        return arg ? onSend(`/me ${arg}`) : slackbot("Usage: `/me [your text]` (try `/me does a little dance`)");
      case "/shrug":
        return onSend(`${arg} ¯\\_(ツ)_/¯`.trim());
      case "/away":
        return toggleAway();
      case "/topic":
        if (!arg) return slackbot("Usage: `/topic [text]`");
        topics.set(activeId, arg);
        setTopic(arg);
        return addNote("sys", `set the channel topic: ${arg}`);
      case "/who":
        return slackbot(`Members of *#${channel}*: @channing, @${costume.user}. (Plus everyone in Channing's other 41 channels, in spirit.)`);
      case "/collapse":
        setCollapsed(true);
        return slackbot("Inline images and GIFs collapsed. `/expand` brings them back.");
      case "/expand":
        setCollapsed(false);
        return slackbot("Inline images and GIFs expanded.");
      case "/leave":
      case "/part":
        return slackbot(`You can't leave *#${channel}*. Channing made it just for you. :simple_smile:`);
      default:
        return slackbot(`\`${cmd}\` is not a valid command. In Slack, all messages that start with "/" are commands. To send one anyway, put a space in front of it.`);
    }
  };

  const { value, setValue, onKeyDown } = useComposer(handleSend, busy && !room);

  // Slash command menu: shown while typing the command itself.
  const cmdQuery = /^\/[a-z]*$/i.test(value) ? value.toLowerCase() : null;
  const cmdList = cmdQuery !== null && !room ? COMMANDS.filter((c) => c.cmd.startsWith(cmdQuery)) : [];
  const cmdSel = Math.min(cmdAt, Math.max(0, cmdList.length - 1));
  const complete = (cmd: string) => {
    setValue(`${cmd} `);
    setCmdAt(0);
    requestAnimationFrame(() => input.current?.focus());
  };
  const keyDown = (e: React.KeyboardEvent) => {
    if (cmdList.length) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setCmdAt((cmdSel + (e.key === "ArrowDown" ? 1 : cmdList.length - 1)) % cmdList.length);
        return;
      }
      const exact = cmdList.some((c) => c.cmd === value.toLowerCase());
      if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey && !exact)) {
        e.preventDefault();
        complete(cmdList[cmdSel].cmd);
        return;
      }
    }
    if (e.key === "Escape") setMenu(null);
    onKeyDown(e);
  };

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

  /* Menus close on outside clicks and Escape */

  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!foot.current?.contains(t) && !teamRef.current?.contains(t)) setMenu(null);
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

  const enableNotify = () => {
    setNotify(true);
    save(KEYS.notify, "on");
    setBanner("ok");
    timers.current.push(setTimeout(() => setBanner((b) => (b === "ok" ? null : b)), 4200));
  };
  const toggleNotify = () => {
    if (!notify) return enableNotify();
    setNotify(false);
    save(KEYS.notify, "off");
    setBanner(null);
    slackbot("Desktop notifications are *off*. You'll have to check Slack yourself. Constantly. Like everyone else.");
  };

  const teamItem = (what: string) => {
    setMenu(null);
    switch (what) {
      case "prefs":
        return slackbot("Preferences are on their way in a future update. For now, you prefer Slack. :simple_smile:");
      case "team":
        return setFlex("team");
      case "integrations":
        return slackbot("Your team is using *5 of 5* free integrations: heroku, github, jenkins, a Twitter bot nobody remembers setting up, and Channing's RSS feed of Channing's own channels.");
      case "customize":
        return slackbot("Custom emoji, loading messages and slackbot responses are all set up already. Channing did it on day one. Try `:synergy:` or `:rip-email:`");
      case "signout":
        setQuote((q) => QUOTES[(QUOTES.indexOf(q) + 1) % QUOTES.length]);
        setLoading(true);
        return;
    }
  };

  /* What's on screen */

  const rows = useMemo(
    () =>
      room ? scriptedRows(room) : toRows({ draft: costume.newThread, greeting: costume.greeting, t0, lines, notes, busy, renamed, newFrom }),
    [room, costume.newThread, costume.greeting, t0, lines, notes, busy, renamed, newFrom],
  );
  const scroller = useStickyScroll<HTMLDivElement>(`${peek}:${rows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}`);

  const where = room ? (room.kind === "dm" ? `@${room.name}` : `#${room.name}`) : `#${channel}`;
  const roomNames = useMemo(
    () =>
      new Set([
        ...ROOMS.filter((r) => r.kind !== "dm").map((r) => r.name),
        ...threads.filter((t) => !t.draft && t.title).map((t) => channelName(t.title)),
      ]),
    [threads],
  );
  const md = { me: costume.user, onChannel: goChannel, channels: roomNames };
  const toastLine = toast ? lines.find((l) => l.id === toast.id) : undefined;
  const typingWho: PersonId | null = room ? (room.typing ?? null) : waiting ? "channing" : null;

  return (
    <div className="slack flex h-full items-center justify-center">
      <div
        ref={win}
        className="sl-window"
        data-side={side ? "" : undefined}
        style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}
      >
        <button type="button" className="sl-scrim" aria-label="Close sidebar" onClick={() => setSide(false)} />

        <aside className="sl-side" aria-label="Channels and direct messages">
          <div ref={teamRef} className="sl-team" {...handle}>
            <TrafficLights />
            <div className="sl-team-row">
              <button
                type="button"
                className="sl-team-name"
                aria-haspopup="menu"
                aria-expanded={menu === "team"}
                onClick={() => setMenu((m) => (m === "team" ? null : "team"))}
              >
                <span className="truncate">{TEAM.name}</span>
                <Icon id="chev" />
              </button>
              <button
                type="button"
                className="sl-bell"
                data-on={notify ? "" : undefined}
                onClick={toggleNotify}
                title={notify ? "Desktop notifications are on" : "Turn on desktop notifications"}
                aria-pressed={notify}
              >
                <Icon id="bell" />
              </button>
            </div>
            {menu === "team" && <TeamMenu onPick={teamItem} />}
          </div>

          <Sidebar
            threads={threads}
            activeId={activeId}
            peek={peek}
            channel={channel}
            draft={costume.newThread}
            missed={missed}
            busy={busy}
            starred={starredRooms}
            onThread={openThread}
            onRoom={go}
            onNew={() => {
              setSide(false);
              onNewThread();
            }}
            onArchive={onDeleteThread}
            onMore={() => {
              setFlex("channels");
              setSide(false);
            }}
          />

          <button type="button" className="sl-me" onClick={toggleAway} title={away ? "Set yourself active" : "Set yourself away"}>
            <Avatar who="you" size={32} />
            <span className="min-w-0 flex-1">
              <b>{costume.user}</b>
              <span className="sl-me-status">
                <i className="sl-dot" data-away={away ? "" : undefined} />
                {away ? "away" : "active"}
              </span>
            </span>
            <span className="sl-gear">
              <Icon id="gear" className="h-4 w-4" />
            </span>
          </button>
        </aside>

        <main className="sl-main">
          <header className="sl-head" {...handle}>
            <button type="button" className="sl-head-burger" aria-label="Open channels" onClick={() => setSide(true)}>
              <Icon id="menu" />
            </button>
            <span className="sl-head-lights">
              <TrafficLights />
            </span>
            <div className="min-w-0">
              <div className="sl-chan">
                {room?.kind === "dm" ? (
                  <>
                    <i className="sl-dot" data-away={PEOPLE[room.name as PersonId].presence === "away" ? "" : undefined} style={{ color: "#9e9ea6" }} />
                    <span>@{room.name}</span>
                  </>
                ) : (
                  <>
                    {room?.kind === "group" && <Icon id="lock" className="h-4 w-4 flex-none opacity-50" />}
                    <span>
                      {room?.kind === "group" ? "" : "#"}
                      {room ? room.name : channel}
                    </span>
                  </>
                )}
                {room && room.kind !== "dm" && (
                  <button
                    type="button"
                    className="sl-chan-star"
                    aria-pressed={starredRooms.includes(room.id)}
                    title={starredRooms.includes(room.id) ? "Unstar this channel" : "Star this channel"}
                    onClick={() => starRoom(room.id)}
                  >
                    <Icon id={starredRooms.includes(room.id) ? "star-on" : "star"} />
                  </button>
                )}
                {!room && <span className="sl-live">chatting with Channing</span>}
              </div>
              <div className="sl-meta">
                {room?.kind === "dm" ? (
                  <span className="sl-topic">{PEOPLE[room.name as PersonId].title} · {PEOPLE[room.name as PersonId].presence}</span>
                ) : (
                  <>
                    <Icon id="user" />
                    <span>{room ? room.members : 2}</span>
                    <i />
                    <span className="sl-topic">
                      {room ? room.purpose : topic || (active?.title ? active.title : "Channing made this channel just for you.")}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="sl-head-tools">
              <form
                className="sl-search"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearched(query.trim());
                  setFlex("search");
                }}
              >
                <Icon id="search" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search messages" />
              </form>
              <button type="button" className="sl-tool" title="Recent Mentions" aria-pressed={flex === "mentions"} onClick={() => toggleFlex("mentions")}>
                <Icon id="at" />
                <b>{MENTIONS.length}</b>
              </button>
              <button type="button" className="sl-tool" title="Starred Items" aria-pressed={flex === "stars"} onClick={() => toggleFlex("stars")}>
                <Icon id="star" />
              </button>
              <button type="button" className="sl-tool" title="Team Directory" aria-pressed={flex === "team"} onClick={() => toggleFlex("team")}>
                <Icon id="people" />
              </button>
            </div>
          </header>

          {banner === "ask" && (
            <div className="sl-banner" role="status">
              <span>
                Slack needs your permission to{" "}
                <button type="button" onClick={enableNotify}>
                  enable desktop notifications
                </button>
                .
              </span>
              <button
                type="button"
                className="sl-banner-x"
                aria-label="Not now"
                onClick={() => {
                  setBanner(null);
                  save(KEYS.banner, "hidden");
                }}
              >
                <Icon id="close" />
              </button>
            </div>
          )}
          {banner === "ok" && (
            <div className="sl-banner" data-kind="ok" role="status">
              Desktop notifications are on. You&rsquo;ll hear about every single message. {emojiFor("tada")}
            </div>
          )}
          {error && !room && (
            <div className="sl-banner" data-kind="error" role="alert">
              {costume.error}
            </div>
          )}
          <div className="sl-body">
            <div ref={scroller} className="sl-scroll" aria-live="polite">
              {room ? (
                <RoomIntro room={room} />
              ) : (
                <div className="sl-intro">
                  <div className="sl-intro-title">#{channel}</div>
                  <p>
                    <b>channing</b> created this channel today. This is the very beginning of the <b>#{channel}</b> channel.
                  </p>
                  <div className="sl-intro-acts">
                    <button type="button" onClick={() => slackbot("Everyone at Paradigm Dynamics is already in 14 of Channing's channels. Maybe give them a day.")}>
                      <Icon id="plus" /> Invite others to this channel
                    </button>
                    <button type="button" onClick={upload}>
                      <Icon id="upload" /> Upload a file
                    </button>
                  </div>
                </div>
              )}
              <div className="sl-day">
                <span>Today</span>
              </div>

              {rows.map((r, i) => {
                if (r.kind === "new")
                  return (
                    <div key={r.key} className="sl-new">
                      <span>new messages</span>
                    </div>
                  );
                if (r.kind === "sys")
                  return (
                    <div key={r.key} className="sl-sys">
                      <span className="sl-gutter" />
                      <span>{typeof r.text === "string" ? <><b>{costume.user}</b> {r.text}</> : r.text}</span>
                    </div>
                  );
                const prev = rows[i - 1];
                const cont =
                  prev?.kind === "msg" &&
                  prev.who === r.who &&
                  !r.ephemeral &&
                  !prev.ephemeral &&
                  !r.head &&
                  (r.stamp ? prev.stamp === r.stamp : !prev.stamp && Math.abs(r.at - prev.at) < FIVE_MIN);
                const time = r.stamp ?? clock(r.at);
                const starKey = `${room?.id ?? activeId}:${r.key}`;
                return (
                  <Message
                    key={r.key}
                    msg={r}
                    cont={!!cont}
                    time={time}
                    starred={stars.has(starKey)}
                    onStar={() => toggleStar({ key: starKey, who: r.who, where, text: r.gif !== undefined ? `/giphy ${r.gif}` : r.text, stamp: time })}
                    collapsed={collapsed}
                    onCollapse={() => setCollapsed((c) => !c)}
                    md={md}
                    mood={r.who === "channing" && i === rows.length - 1 ? mood : undefined}
                  />
                );
              })}
            </div>

            {flex && (
              <FlexPane
                flex={flex}
                searched={searched}
                lines={lines}
                channel={channel}
                stars={[...stars.values()]}
                onClose={() => setFlex(null)}
                onRoom={(id) => go(id)}
                onThread={() => go(null)}
                onJoin={(name) => {
                  setFlex(null);
                  go(null);
                  slackbot(`You joined *#${name}*. You are its 2nd member. Channing is thrilled. :tada:`);
                }}
                md={md}
              />
            )}
          </div>

          <div ref={foot} className="sl-foot">
            {room ? (
              <DemoBar where={where} channel={channel} missed={missed} onChat={() => go(null)} />
            ) : (
              <>
            {cmdList.length > 0 && (
              <div className="sl-pop sl-cmds" role="listbox" aria-label="Slash commands">
                {cmdList.map((c, i) => (
                  <button
                    key={c.cmd}
                    type="button"
                    role="option"
                    aria-selected={i === cmdSel}
                    className="sl-cmd"
                    data-on={i === cmdSel ? "" : undefined}
                    onMouseEnter={() => setCmdAt(i)}
                    onClick={() => complete(c.cmd)}
                  >
                    <b>{c.cmd}</b>
                    <small>{c.args}</small>
                    <span>{c.does}</span>
                  </button>
                ))}
              </div>
            )}
            {menu === "plus" && (
              <div className="sl-pop sl-menu sl-plus-menu" role="menu">
                <button type="button" role="menuitem" onClick={upload}>
                  <Icon id="upload" /> Upload a file
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenu(null);
                    slackbot("Posts are great for long-form writing with formatting. Like an email. But please don't call it an email.");
                  }}
                >
                  <Icon id="post" /> Create a post
                </button>
                <button type="button" role="menuitem" onClick={() => insert("```\n\n```")}>
                  <Icon id="snippet" /> Create a snippet
                </button>
              </div>
            )}
            {menu === "emoji" && <EmojiMenu onPick={(c) => insert(`:${c}:`)} />}

            <div className="sl-box">
              <button
                type="button"
                className="sl-plus"
                aria-haspopup="menu"
                aria-expanded={menu === "plus"}
                title="Upload, post or snippet"
                onClick={() => setMenu((m) => (m === "plus" ? null : "plus"))}
              >
                <Icon id="plus" />
              </button>
              <textarea
                ref={input}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setCmdAt(0);
                }}
                onKeyDown={keyDown}
                rows={1}
                placeholder={`Ask channing anything in ${where}`}
                aria-label={`Message channing in ${where}`}
                className="sl-input"
              />
              <button
                type="button"
                className="sl-emo"
                title="Emoji"
                aria-haspopup="dialog"
                aria-expanded={menu === "emoji"}
                onClick={() => setMenu((m) => (m === "emoji" ? null : "emoji"))}
              >
                <Icon id="smile" />
              </button>
            </div>
              </>
            )}
            <div className="sl-hint">
              <span>
                {typingWho ? (
                  <>
                    <b>{typingWho}</b> is typing
                    <span className="sl-dots">
                      <i>.</i>
                      <i>.</i>
                      <i>.</i>
                    </span>
                  </>
                ) : null}
              </span>
              {!room && (
                <span>
                  <b>*bold*</b> <i>_italics_</i> <code>`code`</code> <code>```preformatted```</code> &gt;quote
                </span>
              )}
            </div>
          </div>
        </main>

        {loading && (
          <div
            className="sl-loading"
            onClick={() => setLoading(false)}
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget) setLoading(false);
            }}
            role="status"
            aria-label={`Loading ${TEAM.name}`}
          >
            <div>
              <HashMark className="sl-loading-mark" />
              <q>{quote.text}</q>
              <cite>{quote.by}</cite>
              <small>Loading {TEAM.name}</small>
            </div>
          </div>
        )}
      </div>

      {toast && toastLine && (
        <div key={toast.k} className="sl-note" role="status" onAnimationEnd={() => setToast(null)}>
          <span className="sl-note-app">
            <HashMark className="h-full w-full" />
          </span>
          <span className="min-w-0 flex-1">
            <b>channing</b>
            <span>
              in #{channel}: {plain(toastLine.text.replace(/^\/giphy.*$/im, "[GIF]")).slice(0, 140) || "…"}
            </span>
          </span>
          <small>now</small>
        </div>
      )}
    </div>
  );
}

/* ───────── Sidebar ───────── */

function Sidebar({
  threads,
  activeId,
  peek,
  channel,
  draft,
  missed,
  busy,
  starred,
  onThread,
  onRoom,
  onNew,
  onArchive,
  onMore,
}: {
  threads: ThreadItem[];
  activeId: string;
  peek: string | null;
  channel: string;
  draft: string;
  missed: number;
  busy: boolean;
  starred: string[];
  onThread: (id: string) => void;
  onRoom: (id: string | null) => void;
  onNew: () => void;
  onArchive: (id: string) => void;
  onMore: () => void;
}) {
  // #random never stops; read counts restart from when you looked.
  const now = useNow(2000);
  const unread = (r: Room) => {
    const since = readAt.get(r.id);
    const climb = r.climbs ? Math.floor((now - (since ?? opened)) / (r.climbs * 1000)) : 0;
    return (since ? 0 : r.unread) + climb;
  };

  type Item = { key: string; name: string; thread?: ThreadItem; room?: Room };
  const chats: Item[] = threads.map((t) => ({ key: t.id, name: t.id === activeId ? channel : t.draft || !t.title ? draft : channelName(t.title), thread: t }));
  const items: Item[] = ROOMS.filter((r) => r.kind === "channel").map((r) => ({ key: r.id, name: r.name, room: r }));
  const isStarred = (i: Item) => starred.includes(i.key);
  const sorted = (list: Item[]) => [...list].sort((a, b) => a.name.localeCompare(b.name));
  const starredItems = sorted([...items, ...ROOMS.filter((r) => r.kind === "group").map((r) => ({ key: r.id, name: r.name, room: r }))].filter(isStarred));
  const channels = sorted(items.filter((i) => !isStarred(i)));
  const groups = ROOMS.filter((r) => r.kind === "group" && !starred.includes(r.id));

  const row = (i: Item, group = false) => {
    if (i.thread) {
      const t = i.thread;
      const on = !peek && t.id === activeId;
      const badge = t.id === activeId && missed > 0 ? missed : 0;
      return (
        <li key={i.key} className="sl-row-wrap">
          <button
            type="button"
            className="sl-row"
            data-on={on ? "" : undefined}
            data-unread={badge ? "" : undefined}
            onClick={() => onThread(t.id)}
            title={t.title || "A brand-new channel"}
          >
            <span className="sl-row-pre">#</span>
            <span className="sl-row-name">{i.name}</span>
            {badge > 0 && <span className="sl-badge">{badge}</span>}
          </button>
          {!t.draft && !badge && (
            <button type="button" className="sl-row-x" onClick={() => onArchive(t.id)} aria-label={`Archive #${i.name}`} title="Archive channel">
              <Icon id="close" />
            </button>
          )}
        </li>
      );
    }
    const r = i.room!;
    const n = unread(r);
    return (
      <li key={i.key}>
        <button
          type="button"
          className="sl-row"
          data-on={peek === r.id ? "" : undefined}
          data-unread={n > 0 && peek !== r.id ? "" : undefined}
          onClick={() => onRoom(r.id)}
        >
          <span className="sl-row-pre">{group ? <Icon id="lock" /> : "#"}</span>
          <span className="sl-row-name">{r.name}</span>
          {n > 0 && peek !== r.id && (
            <span key={n} className="sl-badge" data-quiet={r.mention ? undefined : ""}>
              {n > 999 ? "999+" : n}
            </span>
          )}
        </button>
      </li>
    );
  };

  return (
    <nav className="sl-nav" aria-label="Channels">
      {starredItems.length > 0 && (
        <>
          <div className="sl-sect">Starred</div>
          <ul>{starredItems.map((i) => row(i, i.room?.kind === "group"))}</ul>
        </>
      )}
      <div className="sl-sect">
        Channels <small>({chats.length + items.length + MORE_CHANNELS})</small>
        <button type="button" className="sl-sect-btn" onClick={onNew} aria-label="New channel" title="Create a channel">
          <Icon id="plus" />
        </button>
      </div>
      {/* Your chats with Channing lead the list (the only real ones), then the workspace's, A to Z. */}
      <ul>
        {chats.map((i) => row(i))}
        {channels.map((i) => row(i))}
      </ul>
      <button type="button" className="sl-more" onClick={onMore}>
        + {MORE_CHANNELS} more…
      </button>

      <div className="sl-sect">Direct Messages</div>
      <ul>
        {DMS.map((p) => {
          const r = p === "channing" ? null : dmRoom(p);
          const person = PEOPLE[p];
          const id = r?.id ?? null;
          const n = r ? unread(r) : 0;
          return (
            <li key={p}>
              <button
                type="button"
                className="sl-row"
                data-on={id && peek === id ? "" : undefined}
                data-unread={n > 0 && peek !== id ? "" : undefined}
                onClick={() => onRoom(id)}
                title={id ? undefined : "Back to your chat with Channing"}
              >
                <span className="sl-row-pre !opacity-100">
                  {p === "slackbot" ? (
                    <span className="sl-heart">♥</span>
                  ) : (
                    <i
                      className="sl-dot inline-block"
                      data-away={person.presence === "away" ? "" : undefined}
                      data-pulse={p === "channing" && busy ? "" : undefined}
                    />
                  )}
                </span>
                <span className="sl-row-name">{p}</span>
                {n > 0 && peek !== id && <span className="sl-badge">{n}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {groups.length > 0 && (
        <>
          <div className="sl-sect">Private Groups</div>
          <ul>{groups.map((r) => row({ key: r.id, name: r.name, room: r }, true))}</ul>
        </>
      )}
    </nav>
  );
}

/* ───────── Pieces ───────── */

/**
 * Where the composer would be in every scripted room: the workspace is there
 * to look around, and Channing is the one listening. One click goes back.
 */
function DemoBar({ where, channel, missed, onChat }: { where: string; channel: string; missed: number; onChat: () => void }) {
  return (
    <div className="sl-demo">
      <Avatar who="channing" size={36} />
      <div className="min-w-0 flex-1">
        <b>
          {where} is just for looking around.
        </b>
        <span>
          To chat, talk to <b>channing</b> in <b>#{channel}</b>
          {missed > 0 && <em> · {missed} new {missed === 1 ? "reply" : "replies"}</em>}
        </span>
      </div>
      <button type="button" className="sl-btn" onClick={onChat}>
        Chat with Channing <Icon id="back" className="h-3.5 w-3.5 rotate-180" />
      </button>
    </div>
  );
}


function RoomIntro({ room }: { room: Room }) {
  if (room.kind === "dm") {
    const p = PEOPLE[room.name as PersonId];
    return (
      <div className="sl-intro">
        <div className="sl-intro-title">
          <Avatar who={p.id} size={44} />@{room.name}
        </div>
        <p>
          This is the very beginning of your direct message history with <b>@{room.name}</b>. {p.name}, {p.title}: <i>&ldquo;{p.says}&rdquo;</i>
        </p>
      </div>
    );
  }
  return (
    <div className="sl-intro">
      <div className="sl-intro-title">
        {room.kind === "group" && <Icon id="lock" className="h-6 w-6 opacity-50" />}
        {room.kind === "group" ? "" : "#"}
        {room.name}
      </div>
      <p>
        {room.kind === "group" ? "This is a private group." : <>This is the very beginning of the <b>#{room.name}</b> channel.</>} Purpose: {room.purpose}
      </p>
    </div>
  );
}

function Message({
  msg,
  cont,
  time,
  starred,
  onStar,
  collapsed,
  onCollapse,
  md,
  mood,
}: {
  msg: Msg;
  cont: boolean;
  time: string;
  starred: boolean;
  onStar: () => void;
  collapsed: boolean;
  onCollapse: () => void;
  md: { me: string; onChannel: (n: string) => void; channels: Set<string> };
  mood?: Mood;
}) {
  const person = msg.who === "you" ? null : PEOPLE[msg.who];
  const name = msg.who === "you" ? md.me : msg.who;
  const body = (
    <>
      {msg.gif !== undefined ? (
        <Gif term={msg.gif} collapsed={collapsed} onCollapse={onCollapse} />
      ) : msg.file ? (
        <FileCard file={msg.file} />
      ) : null}
      {msg.gif === undefined && msg.text && (
        <div className="sl-text">
          <Mrkdwn text={msg.text} {...md} />
        </div>
      )}
    </>
  );
  return (
    <div
      className="sl-msg"
      data-cont={cont ? "" : undefined}
      data-starred={starred ? "" : undefined}
      data-me-action={msg.action ? "" : undefined}
      data-ephemeral={msg.ephemeral ? "" : undefined}
    >
      <div className="sl-gutter">{cont ? <time>{time}</time> : <Avatar who={msg.who} size={36} mood={mood} />}</div>
      <div className="sl-msg-body">
        {!cont && (
          <div className="sl-msg-head">
            <b>{name}</b>
            {person?.bot && <span className="sl-tag">{msg.who === "slackbot" ? "bot" : "integration"}</span>}
            <time>{time}</time>
            {msg.ephemeral && <span className="sl-only">Only visible to you</span>}
          </div>
        )}
        {body}
      </div>
      {!msg.ephemeral && (
        <div className="sl-acts">
          <button type="button" aria-pressed={starred} onClick={onStar} title={starred ? "Unstar message" : "Star message"}>
            <Icon id={starred ? "star-on" : "star"} />
          </button>
        </div>
      )}
    </div>
  );
}

function Gif({ term, collapsed, onCollapse }: { term: string; collapsed: boolean; onCollapse: () => void }) {
  const src = GIFS.length ? pick(GIFS, term.toLowerCase()) : undefined;
  return (
    <div className="sl-gif" data-collapsed={collapsed ? "" : undefined}>
      <div className="sl-gif-cap">
        /giphy {term}
        <button type="button" onClick={onCollapse} aria-label={collapsed ? "Expand GIF" : "Collapse GIF"}>
          ({collapsed ? "▸" : "▾"})
        </button>
      </div>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`A GIF for “${term}”`} />
      ) : (
        <GifStandIn term={term} />
      )}
    </div>
  );
}

function FileCard({ file }: { file: Upload | NonNullable<Scripted["file"]> }) {
  const state = "state" in file ? file.state : null;
  return (
    <div className="sl-file" data-state={state ?? undefined}>
      <FileIcon name={file.name} />
      <div className="min-w-0 flex-1">
        <b>{file.name}</b>
        <span>
          {state === "uploading" ? `Uploading… ${file.size}` : state === "failed" ? "Upload failed: out of storage" : `${file.size} · Click to download`}
        </span>
        {state && (
          <div className="sl-bar">
            <i />
          </div>
        )}
      </div>
    </div>
  );
}

function TeamMenu({ onPick }: { onPick: (what: string) => void }) {
  const items: [string, string][] = [
    ["prefs", "Preferences"],
    ["team", "Team Directory"],
    ["integrations", "Configure Integrations"],
    ["customize", "Customize Slack"],
  ];
  return (
    <div className="sl-pop sl-menu sl-team-menu" role="menu">
      <div className="sl-menu-head flex items-center gap-3">
        <TeamLogo className="h-9 w-9 flex-none" />
        <span className="min-w-0">
          <b>{TEAM.name}</b>
          <span>{TEAM.domain}</span>
        </span>
      </div>
      {items.map(([id, label]) => (
        <button key={id} type="button" role="menuitem" onClick={() => onPick(id)}>
          {label}
        </button>
      ))}
      <hr />
      <button type="button" role="menuitem" onClick={() => onPick("signout")}>
        Sign out of {TEAM.name}
      </button>
    </div>
  );
}

function EmojiMenu({ onPick }: { onPick: (code: string) => void }) {
  return (
    <div className="sl-pop sl-emojis" role="dialog" aria-label="Emoji">
      <div className="sl-pop-title">Emoji</div>
      <div className="sl-emoji-grid">
        {PICKER.map((c) => (
          <button key={c} type="button" className="sl-emoji-btn" title={`:${c}:`} aria-label={`:${c}:`} onClick={() => onPick(c)}>
            {emojiFor(c)}
          </button>
        ))}
      </div>
      <div className="sl-pop-title !border-t !border-[#f0f0f0]">Custom ({TEAM.name})</div>
      <div className="sl-emoji-grid">
        {PICKER_CUSTOM.map((c) => (
          <button key={c} type="button" className="sl-emoji-btn" title={`:${c}:`} aria-label={`:${c}:`} onClick={() => onPick(c)}>
            <Custom id={c} />
          </button>
        ))}
      </div>
      <div className="sl-pop-foot">Tip: type shortcodes like :tada: or :simple_smile:</div>
    </div>
  );
}

/** The right-hand pane: search, mentions, stars, the team, and Channing's other channels. */
function FlexPane({
  flex,
  searched,
  lines,
  channel,
  stars,
  onClose,
  onRoom,
  onThread,
  onJoin,
  md,
}: {
  flex: Exclude<Flex, null>;
  searched: string;
  lines: ChatLine[];
  channel: string;
  stars: Starred[];
  onClose: () => void;
  onRoom: (id: string) => void;
  onThread: () => void;
  onJoin: (name: string) => void;
  md: { me: string; onChannel: (n: string) => void; channels: Set<string> };
}) {
  const title = { search: "Search Results", mentions: "Recent Mentions", stars: "Starred Items", team: "Team Directory", channels: "Browse Channels" }[flex];
  const hits = useMemo(() => {
    if (flex !== "search" || !searched) return [];
    const q = searched.toLowerCase();
    const mine = lines
      .filter((l) => l.text.toLowerCase().includes(q))
      .map((l) => ({ key: l.id, who: (l.role === "user" ? "you" : "channing") as Who, where: `#${channel}`, stamp: clock(l.at), text: l.text, room: null as string | null }));
    const rest = ROOMS.flatMap((r) =>
      r.messages
        .filter((m) => m.text.toLowerCase().includes(q) || m.file?.name.toLowerCase().includes(q))
        .map((m, i) => ({ key: `${r.id}:${i}`, who: m.who as Who, where: r.kind === "dm" ? `@${r.name}` : `#${r.name}`, stamp: m.at, text: m.text || m.file!.name, room: r.id })),
    );
    return [...mine, ...rest].slice(0, 30);
  }, [flex, searched, lines, channel]);

  return (
    <aside className="sl-flex" aria-label={title}>
      <div className="sl-flex-head">
        {title}
        <button type="button" onClick={onClose} aria-label="Close">
          <Icon id="close" />
        </button>
      </div>
      <div className="sl-flex-body">
        {flex === "search" &&
          (!searched ? (
            <div className="sl-flex-empty">
              <b>Search your team</b>
              Type something in the search box and press Enter.
            </div>
          ) : (
            <>
              <div className="px-4 pb-1 pt-2 text-[12.5px] text-[#9e9ea6]">
                {hits.length} result{hits.length === 1 ? "" : "s"} for <b className="text-[#3d3c40]">&ldquo;{searched}&rdquo;</b>
              </div>
              {hits.map((h) => (
                <button key={h.key} type="button" className="sl-hit" onClick={() => (h.room ? onRoom(h.room) : onThread())}>
                  <span className="sl-hit-where">
                    <b>{h.who === "you" ? md.me : h.who}</b> in {h.where} · {h.stamp}
                  </span>
                  <Highlight text={plain(h.text)} q={searched} />
                </button>
              ))}
              <div className="sl-flex-foot">
                Your team has more than <b>10,000 messages</b>. On the free plan, only the most recent 10,000 are searchable. (Channing&rsquo;s channels account for 6,200 of them.)
              </div>
            </>
          ))}

        {flex === "mentions" &&
          MENTIONS.map((m, i) => (
            <button key={i} type="button" className="sl-hit" onClick={() => onRoom(m.where.startsWith("@") ? `dm-${m.where.slice(1)}` : m.where.slice(1))}>
              <span className="sl-hit-where">
                <b>{m.who}</b> in {m.where} · {m.at}
              </span>
              <span className="sl-text block text-[14px]">
                <Mrkdwn text={m.text} me={md.me} />
              </span>
            </button>
          ))}

        {flex === "stars" &&
          (stars.length ? (
            stars.map((s) => (
              <div key={s.key} className="sl-hit">
                <span className="sl-hit-where">
                  <b>{s.who === "you" ? md.me : s.who}</b> in {s.where} · {s.stamp}
                </span>
                <span className="sl-text block text-[14px]">
                  <Mrkdwn text={s.text} me={md.me} />
                </span>
              </div>
            ))
          ) : (
            <div className="sl-flex-empty">
              <b>No starred items yet</b>
              Hover over any message and click the <Icon id="star" className="inline h-3.5 w-3.5 align-[-2px]" /> to save it here.
            </div>
          ))}

        {flex === "team" &&
          (Object.values(PEOPLE) as (typeof PEOPLE)[PersonId][])
            .filter((p) => !p.bot)
            .map((p) => (
              <button key={p.id} type="button" className="sl-person" onClick={() => (p.id === "channing" ? onThread() : onRoom(`dm-${p.id}`))}>
                <Avatar who={p.id} size={40} />
                <span className="min-w-0">
                  <b>
                    {p.id}
                    <i className="sl-dot" data-away={p.presence === "away" ? "" : undefined} />
                  </b>
                  <small>
                    {p.name} · {p.title}
                  </small>
                  <i>{p.says}</i>
                </span>
              </button>
            ))}

        {flex === "channels" && (
          <>
            <div className="px-4 pb-2 pt-2 text-[13px] leading-snug text-[#717274]">
              {MORE.length} more channels, all created by <b>channing</b> this week.
            </div>
            {MORE.map((name) => (
              <button key={name} type="button" className="sl-hit" onClick={() => onJoin(name)}>
                <span className="block font-bold text-[#3d3c40]">#{name}</span>
                <span className="text-[12.5px] text-[#9e9ea6]">Created by channing · 1 member · Click to join</span>
              </button>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  const from = Math.max(0, i - 40);
  const s = (from > 0 ? "…" : "") + text.slice(from, from + 160);
  const at = s.toLowerCase().indexOf(q.toLowerCase());
  if (at < 0) return <span className="block text-[14px] text-[#2c2d30]">{s}</span>;
  return (
    <span className="block text-[14px] text-[#2c2d30]">
      {s.slice(0, at)}
      <mark>{s.slice(at, at + q.length)}</mark>
      {s.slice(at + q.length)}
    </span>
  );
}

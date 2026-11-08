"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Gpty, type Mood } from "@/components/Gpty";
import {
  AppIcon,
  type AppId,
  art,
  type ArtSlot,
  DefaultPic,
  Favicon,
  FbDefs,
  Finger,
  Pencil,
  type PhotoId,
  PhotoScene,
  SearchGlass,
  Sheep,
  TubeIcon,
} from "@/components/facebook/art";
import { EMOTES, Emote, Rich } from "@/components/facebook/emoticons";
import "@/components/facebook/facebook.css";
import { type Agent, getAgent } from "@/lib/agents";
import { useComposer, useDesktopDrag, useOnNewReply, useStickyScroll } from "./hooks";
import { clock, type ChatLine, type LayoutProps } from "./types";

/**
 * Pokes, sheep and statuses travel as messages, so your friend knows they
 * happened: "/poke", "/sheep" and "/status <text>". The same lines at the top
 * of a reply are your friend poking you, throwing a sheep at you, or updating
 * their own status.
 */
export const POKE = "/poke";
export const SHEEP = "/sheep";
export const STATUS = "/status";
const COMMANDS = [POKE, SHEEP, STATUS];
const ACT_LINE = /^\/(poke|sheep)\s*$/i;
const STATUS_LINE = /^\/status\s+(\S.*)$/i;

/** Each conversation opens on a different status, like a fresh login. */
const STATUSES = [
  "is finally on Facebook Chat. is this thing on??",
  "is pretending to write a paper.",
  "is at Pinkberry. again.",
  "is NOT ok with the new Facebook layout.",
  "is in a SuperPoke war and losing badly.",
  "is going to see The Dark Knight for the third time.",
  "is wondering who keeps throwing sheep.",
];

const BOOKMARKS = ["Most Visited", "Facebook", "YouTube", "MySpace", "Digg", "Wikipedia", "Hotmail"];

const APPS: { id: AppId; label: string; count?: number }[] = [
  { id: "feed", label: "News Feed" },
  { id: "inbox", label: "Messages", count: 1 },
  { id: "events", label: "Events", count: 2 },
  { id: "photos", label: "Photos" },
  { id: "friends", label: "Friends" },
  { id: "groups", label: "Groups" },
  { id: "notes", label: "Notes" },
  { id: "video", label: "Video" },
  { id: "superpoke", label: "SuperPoke!" },
  { id: "scrabulous", label: "Scrabulous" },
  { id: "topfriends", label: "Top Friends" },
  { id: "zombies", label: "Zombies" },
  { id: "market", label: "Marketplace" },
];

function pick<T>(list: T[], seed: string, salt = 0) {
  let h = salt;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

/** "is eating cereal" from you reads "You are eating cereal". */
function statusOf(name: string, text: string, you: boolean) {
  const t = text.trim();
  return `${name} ${you ? t.replace(/^is\b/i, "are") : t}`;
}

/** A gpty with red-eye, as the flash caught it at the party. */
const redEye = (a: Agent): Agent => ({ ...a, look: { ...a.look, eyes: "#ff3324" } });

/* ───────── What the chat shows ───────── */

type Act = "poke" | "sheep";
type Msg = { kind: "msg"; key: string; mine: boolean; text: string; at: number };
type ActRow = { kind: "act"; key: string; mine: boolean; act: Act; at: number };
type StatusRow = { kind: "status"; key: string; mine: boolean; text: string; at: number };
type Row = Msg | ActRow | StatusRow;
type Block = ActRow | StatusRow | { kind: "group"; key: string; mine: boolean; rows: Msg[] };

/** Lines become rows: command lines become pokes, sheep and status updates. */
function toRows(greeting: string, lines: ChatLine[], busy: boolean): Row[] {
  const rows: Row[] = [{ kind: "msg", key: "greeting", mine: false, text: greeting, at: 0 }];
  lines.forEach((l, i) => {
    const mine = l.role === "user";
    const live = !mine && busy && i === lines.length - 1;
    const parts = l.text.split("\n");
    const kept: string[] = [];
    parts.forEach((s, j) => {
      const t = s.trim();
      const head = t.split(/\s/)[0].toLowerCase();
      const act = ACT_LINE.exec(t);
      const status = STATUS_LINE.exec(t);
      // A command still streaming in on the last line never flashes as text.
      if (live && j === parts.length - 1 && t.startsWith("/") && COMMANDS.some((c) => c.startsWith(head))) return;
      if (act) rows.push({ kind: "act", key: `${l.id}:${j}`, mine, act: act[1].toLowerCase() as Act, at: l.at });
      else if (status) rows.push({ kind: "status", key: `${l.id}:${j}`, mine, text: status[1], at: l.at });
      else kept.push(s);
    });
    const text = kept.join("\n").trim();
    if (text) rows.push({ kind: "msg", key: l.id, mine, text, at: l.at });
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

type Fx = { k: number; act: Act; mine: boolean };
type ChatState = "open" | "min" | "closed";
type Notice = { k: number; who: Agent | "mark"; text: string; icon: AppId };

/* ───────── The window ───────── */

/** Facebook in 2008, remastered: the News Feed in a browser, and chat docked along the bottom. */
export function FacebookLayout({ costume, lines, busy, waiting, error, onSend, onStop, activeId }: LayoutProps) {
  const agent = getAgent(costume.id);
  const buddy = costume.assistant;
  const first = buddy.split(" ")[0];
  const friends = useMemo(() => ["msn", "skype", "irc", "icq", "bbs"].map((id) => getAgent(id)), []);
  const [kayleigh, cal, nick, daisy, dale] = friends;

  const { value, setValue, submit, onKeyDown } = useComposer(onSend, busy);
  const { ref: win, handle } = useDesktopDrag<HTMLDivElement>();
  const page = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const chatBox = useRef<HTMLDivElement>(null);

  const [chat, setChat] = useState<ChatState>("open");
  const [unread, setUnread] = useState(0);
  const [menu, setMenu] = useState<"emotes" | "online" | "notes" | null>(null);
  const [fx, setFx] = useState<Fx | null>(null);
  const [jolt, setJolt] = useState(0);
  const [status, setStatus] = useState("");
  const [removedPoke, setRemovedPoke] = useState<string | null>(null);
  const [requested, setRequested] = useState<string[]>([]);
  const [notices, setNotices] = useState<Notice[]>(() => [
    { k: 3, who: kayleigh, text: `${kayleigh.name} wrote on your Wall.`, icon: "feed" },
    { k: 2, who: cal, text: `${cal.name} tagged you in a photo.`, icon: "photos" },
    { k: 1, who: nick, text: `${nick.name} invited you to play Scrabulous.`, icon: "scrabulous" },
  ]);
  const [seenNotices, setSeenNotices] = useState(0);

  const rows = useMemo(() => toRows(costume.greeting, lines, busy), [costume.greeting, lines, busy]);
  const blocks = useMemo(() => toBlocks(rows), [rows]);
  const scroller = useStickyScroll<HTMLDivElement>(`${rows.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}:${chat}`);

  const mood: Mood = jolt ? "error" : error ? "error" : waiting ? "thinking" : busy ? "typing" : "watching";
  const open = chat === "open";

  /* Statuses: Mark's latest, and the ones you posted */
  const markStatus = rows.findLast((r): r is StatusRow => r.kind === "status" && !r.mine);
  const markNow = markStatus?.text ?? pick(STATUSES, activeId);
  const stories = rows
    .filter((r): r is StatusRow => r.kind === "status")
    .toReversed();

  /* Pokes: Mark starts the conversation having poked you */
  const lastPoke = rows.findLast((r): r is ActRow => r.kind === "act" && r.act === "poke");
  const pokeKey = lastPoke?.key ?? "start";
  const pokedYou = !lastPoke || !lastPoke.mine;

  /* Pokes and sheep land with a little show; old ones in the history don't. */
  const acts = rows.filter((r): r is ActRow => r.kind === "act");
  const actKeys = acts.map((a) => a.key).join(" ");
  const latestActs = useRef(acts);
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    latestActs.current = acts;
  });
  useEffect(() => {
    const all = latestActs.current;
    if (!seen.current) {
      seen.current = new Set(all.map((a) => a.key));
      return;
    }
    const fresh = all.filter((a) => !seen.current!.has(a.key));
    if (!fresh.length) return;
    fresh.forEach((a) => seen.current!.add(a.key));
    const a = fresh.at(-1)!;
    setFx({ k: Date.now(), act: a.act, mine: a.mine });
    if (a.mine) {
      // Mark flinches.
      setJolt(Date.now());
      return;
    }
    setNotices((ns) => [
      { k: Date.now(), who: "mark", text: a.act === "poke" ? `${buddy} poked you.` : `${buddy} threw a sheep at you. SuperPoke!`, icon: a.act === "poke" ? "friends" : "superpoke" },
      ...ns,
    ]);
    if (a.act === "poke" && page.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      page.current.animate(
        [{ transform: "none" }, { transform: "translateX(-5px) rotate(-.25deg)", offset: 0.3 }, { transform: "translateX(3px)", offset: 0.6 }, { transform: "none" }],
        { duration: 420, delay: 380, easing: "ease-out" },
      );
    }
  }, [actKeys, buddy]);

  useEffect(() => {
    if (!jolt) return;
    const t = setTimeout(() => setJolt(0), 900);
    return () => clearTimeout(t);
  }, [jolt]);

  /* A reply while the chat is tucked away: the tab comes back and flashes. */
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  });
  useOnNewReply(lines, () => {
    if (openRef.current) return;
    setChat("min");
    setUnread((n) => n + 1);
  });

  /* Menus close on a click elsewhere or Escape */
  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!dock.current?.contains(t) && !chatBox.current?.contains(t)) setMenu(null);
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

  const openChat = () => {
    setChat("open");
    setUnread(0);
    setMenu(null);
    requestAnimationFrame(() => input.current?.focus());
  };

  const send = (text: string) => {
    if (busy) return;
    onSend(text);
    if (!open) openChat();
  };

  const shareStatus = () => {
    const t = status.trim();
    if (!t || busy) return;
    send(`${STATUS} ${t}`);
    setStatus("");
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

  const lastMine = lines.findLast((l) => l.role === "user" && !l.text.startsWith("/"));
  const newNotices = notices.length - seenNotices;
  const markPic = (size: number, m: Mood = "idle") => <MarkPicture agent={agent} mood={m} size={size} />;

  return (
    <div className="fb flex h-full items-center justify-center">
      <div ref={win} className="fb-window" style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}>
        <FbDefs />

        {/* ───── The browser ───── */}
        <div className="fb-browser" {...handle}>
          <div className="fb-tabsrow">
            <span className="fb-lights" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <div className="fb-tabs" aria-hidden>
              <span className="fb-btab fb-btab-on">
                <Favicon className="h-4 w-4 shrink-0" />
                <span className="truncate">{newNotices > 0 ? `(${newNotices}) ` : ""}Facebook | Home</span>
                <i className="fb-btab-x" />
              </span>
              <span className="fb-btab fb-btab-off">
                <TubeIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">YouTube - Charlie bit my finger - again !</span>
              </span>
              <span className="fb-btab-new">+</span>
            </div>
          </div>
          <div className="fb-toolbar" aria-hidden>
            <span className="fb-keyhole">
              <span className="fb-back">
                <svg viewBox="0 0 16 16">
                  <path d="M9.6 3.4 4.8 8l4.8 4.6M5.2 8h7" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="fb-fwd">
                <svg viewBox="0 0 16 16">
                  <path d="M6.4 3.8 10.6 8l-4.2 4.2" stroke="#4b5566" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
            <span className="fb-reload">
              <svg viewBox="0 0 16 16">
                <path d="M12.6 8a4.6 4.6 0 1 1-1.4-3.3M12.4 2.6v2.8H9.6" stroke="#4b5566" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="fb-url">
              <Favicon className="h-4 w-4 shrink-0" />
              <span className="truncate">
                <span className="fb-url-dim">http://www.</span>facebook.com<span className="fb-url-dim">/home.php#/inbox/?ref=chat</span>
              </span>
              <svg viewBox="0 0 16 16" className="ml-auto h-4 w-4 shrink-0">
                <path d="m8 1.8 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6Z" fill="#ffd34d" stroke="#c99a10" strokeWidth=".9" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="fb-gsearch">
              <span className="fb-g">G</span>
              <span className="truncate">Google</span>
              <SearchGlass className="ml-auto h-3 w-3 shrink-0 text-[#8a93a3]" />
            </div>
          </div>
          <div className="fb-bookmarks" aria-hidden>
            {BOOKMARKS.map((b, i) => (
              <span key={b} className="fb-bm">
                {i === 0 ? (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                    <path d="M3 2h10v12l-5-3.4L3 14Z" fill="#7d8aa3" />
                  </svg>
                ) : b === "Facebook" ? (
                  <Favicon className="h-3.5 w-3.5" />
                ) : b === "YouTube" ? (
                  <TubeIcon className="h-3.5 w-3.5" />
                ) : (
                  <span className="fb-bm-dot" />
                )}
                {b}
                {i === 0 && " ▾"}
              </span>
            ))}
          </div>
        </div>

        {/* ───── The page ───── */}
        <div ref={page} className="fb-page" data-chat={chat}>
          <header className="fb-bar">
            <div className="fb-bar-in">
              <span className="fb-logo">facebook</span>
              <nav className="fb-nav" aria-label="Facebook">
                <span>Home</span>
                <span>Profile</span>
                <span>Friends</span>
                <button type="button" onClick={openChat}>
                  Inbox <b className="fb-count">1</b>
                </button>
              </nav>
              <span className="fb-search" aria-hidden>
                <span>Search</span>
                <SearchGlass className="h-3 w-3" />
              </span>
              <span className="fb-bar-right" aria-hidden>
                <span>{costume.user}</span>
                <span>Settings</span>
                <span>Logout</span>
              </span>
            </div>
          </header>

          <div className="fb-scroll">
            <div className="fb-cols">
              {/* Left: you and your applications */}
              <aside className="fb-left" aria-label="Applications">
                <div className="fb-me">
                  <span className="fb-pic fb-pic-50">
                    <UserPicture />
                  </span>
                  <span className="min-w-0">
                    <b className="block truncate">{costume.user}</b>
                    <span className="fb-link-sm">Edit My Profile</span>
                  </span>
                </div>
                <ul className="fb-apps">
                  {APPS.map((a) => (
                    <li key={a.id} data-on={a.id === "feed" ? "" : undefined}>
                      <AppIcon id={a.id} />
                      <span className="truncate">{a.label}</span>
                      {a.count && <span className="fb-app-count">{a.count}</span>}
                    </li>
                  ))}
                  <li className="fb-apps-more">more ▾</li>
                </ul>
              </aside>

              {/* Middle: the News Feed */}
              <main className="fb-feed" aria-label="News Feed">
                <div className="fb-feed-head">
                  <h2>News Feed</h2>
                  <span className="fb-feed-filter" aria-hidden>
                    <b>Live Feed</b> · <span>Status Updates</span> · <span>Photos</span>
                  </span>
                </div>

                <form
                  className="fb-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    shareStatus();
                  }}
                >
                  <div className="fb-composer-tabs" aria-hidden>
                    <b>Update Status</b>
                    <span>Post Photos</span>
                    <span>Write Note</span>
                    <span>Share Link</span>
                  </div>
                  <div className="fb-composer-row">
                    <span className="fb-pic fb-pic-32">
                      <UserPicture />
                    </span>
                    <input
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      placeholder="What are you doing right now?"
                      aria-label="Update your status"
                      maxLength={160}
                    />
                    <button type="submit" className="fb-btn" disabled={busy || !status.trim()}>
                      Share
                    </button>
                  </div>
                </form>

                {removedPoke !== pokeKey && (
                  <div className="fb-notice" key={pokeKey} role="status">
                    <Finger className="fb-notice-finger" />
                    <span className="fb-pic fb-pic-32">{markPic(32)}</span>
                    <span className="min-w-0 flex-1">
                      {pokedYou ? (
                        <>
                          <button type="button" className="fb-name" onClick={openChat}>
                            {buddy}
                          </button>{" "}
                          has poked you.
                          <span className="fb-poke-acts">
                            <button type="button" className="fb-link" disabled={busy} onClick={() => send(POKE)}>
                              Poke back
                            </button>
                            <span aria-hidden> · </span>
                            <button type="button" className="fb-link" onClick={() => setRemovedPoke(pokeKey)}>
                              Remove poke
                            </button>
                          </span>
                        </>
                      ) : (
                        <>
                          You poked <b className="fb-name-plain">{buddy}</b>.
                          <span className="fb-poke-acts fb-muted">Waiting for a poke back…</span>
                        </>
                      )}
                    </span>
                  </div>
                )}

                {stories.map((s) => (
                  <Story
                    key={s.key}
                    pic={s.mine ? <UserPicture /> : markPic(50)}
                    icon="feed"
                    meta={s.at ? `at ${clock(s.at)}` : "just now"}
                    fresh
                  >
                    {s.mine ? (
                      <>
                        <b>{costume.user}</b> {statusOf("", s.text, true).trim()}
                      </>
                    ) : (
                      <>
                        <button type="button" className="fb-name" onClick={openChat}>
                          {buddy}
                        </button>{" "}
                        <Rich text={s.text} />
                      </>
                    )}
                  </Story>
                ))}
                {!markStatus && (
                  <Story pic={markPic(50)} icon="feed" meta="12 minutes ago · Comment">
                    <button type="button" className="fb-name" onClick={openChat}>
                      {buddy}
                    </button>{" "}
                    {markNow}
                  </Story>
                )}

                <Story pic={<FriendPicture agent={cal} />} icon="friends" meta="38 minutes ago">
                  <button type="button" className="fb-name" onClick={openChat}>
                    {buddy}
                  </button>{" "}
                  and <b className="fb-name-plain">{cal.name}</b> are now friends.
                  <span className="fb-pair">
                    <span className="fb-pic fb-pic-32">{markPic(32)}</span>
                    <span className="fb-pair-plus">+</span>
                    <span className="fb-pic fb-pic-32">
                      <FriendPicture agent={cal} />
                    </span>
                  </span>
                </Story>

                <Story pic={markPic(50)} icon="photos" meta="1:42pm · Comment">
                  <button type="button" className="fb-name" onClick={openChat}>
                    {buddy}
                  </button>{" "}
                  was tagged in 3 photos in the album <span className="fb-link">Spring Break 08!!!</span>
                  <span className="fb-album">
                    <Photo id="beach" slot="photo1" agent={agent} tag={buddy} tilt={-1.5} />
                    <Photo id="party" slot="photo2" agent={redEye(agent)} tag={buddy} tilt={1.2} />
                    <Photo id="roadtrip" slot="photo3" agent={agent} tag={buddy} tilt={-0.6} />
                  </span>
                </Story>

                <Story pic={<FriendPicture agent={kayleigh} />} icon="feed" meta="2:15pm · Wall-to-Wall">
                  <b className="fb-name-plain">{kayleigh.name}</b> wrote on {buddy}&apos;s Wall:
                  <span className="fb-quote">omg ur on facebook now?? myspace is SO over lol. top 8 is dead. long live the wall</span>
                </Story>

                <Story pic={markPic(50)} icon="superpoke" meta="Yesterday · SuperPoke!">
                  <button type="button" className="fb-name" onClick={openChat}>
                    {buddy}
                  </button>{" "}
                  threw a sheep at you.
                  <span className="fb-sheep-card">
                    <Sheep width={74} className="fb-sheep-still" />
                    <button type="button" className="fb-link" disabled={busy} onClick={() => send(SHEEP)}>
                      SuperPoke back!
                    </button>
                  </span>
                </Story>

                <Story pic={markPic(50)} icon="groups" meta="Yesterday">
                  <button type="button" className="fb-name" onClick={openChat}>
                    {buddy}
                  </button>{" "}
                  joined the group <span className="fb-link">If this group reaches 100,000 members I&apos;ll name my firstborn Scrabulous</span>
                </Story>

                <Story pic={<FriendPicture agent={dale} />} icon="friends" meta="Yesterday">
                  <b className="fb-name-plain">{dale.name}</b> joined Facebook. <span className="fb-muted">Dale is new to Facebook. Help Dale find friends.</span>
                </Story>

                <Story pic={markPic(50)} icon="feed" meta="Tuesday">
                  <button type="button" className="fb-name" onClick={openChat}>
                    {buddy}
                  </button>{" "}
                  changed their relationship status to <span className="fb-link">It&apos;s Complicated</span>.
                </Story>

                <Story pic={markPic(50)} icon="notes" meta="Tuesday">
                  <button type="button" className="fb-name" onClick={openChat}>
                    {buddy}
                  </button>{" "}
                  took the quiz <span className="fb-link">Which Grey&apos;s Anatomy character are you?</span> and got{" "}
                  <b>McDreamy</b>.
                </Story>

                <Story pic={<FriendPicture agent={nick} />} icon="events" meta="Monday">
                  <b className="fb-name-plain">{nick.name}</b>, <b className="fb-name-plain">{daisy.name}</b> and 3 others are attending{" "}
                  <span className="fb-link">The Dark Knight: midnight showing</span>.
                </Story>

                <p className="fb-feed-end">
                  <span className="fb-link">Older Posts</span>
                </p>
              </main>

              {/* Right: pokes, requests and the rest */}
              <aside className="fb-right" aria-label="Highlights">
                <section className="fb-box">
                  <h3>Requests</h3>
                  <ul className="fb-reqs" aria-hidden>
                    <li>
                      <AppIcon id="friends" /> 1 friend request
                    </li>
                    <li>
                      <AppIcon id="events" /> 2 event invitations
                    </li>
                    <li>
                      <AppIcon id="superpoke" /> 4 SuperPoke! requests
                    </li>
                    <li>
                      <AppIcon id="zombies" /> 12 Zombies requests
                    </li>
                  </ul>
                </section>

                <section className="fb-box">
                  <h3>Birthdays</h3>
                  <p className="fb-bday">
                    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
                      <rect x="2" y="7" width="12" height="7" rx="1" fill="#f59ac0" />
                      <path d="M2 9.4q1.5 1.2 3 0t3 0 3 0 3 0" stroke="#fff" fill="none" />
                      <path d="M8 3v4" stroke="#ccc" strokeWidth="1.4" />
                      <path d="M8 .8q1.4 1.4 0 2.6-1.4-1.2 0-2.6Z" fill="#ffb12a" />
                    </svg>
                    <span>
                      <b className="fb-name-plain">{kayleigh.name}</b> <span className="fb-muted">tomorrow</span>
                    </span>
                  </p>
                </section>

                <section className="fb-box">
                  <h3>People You May Know</h3>
                  {[daisy, dale].map((p) => {
                    const sent = requested.includes(p.id);
                    return (
                      <div key={p.id} className="fb-pymk">
                        <span className="fb-pic fb-pic-50">
                          <FriendPicture agent={p} />
                        </span>
                        <span className="min-w-0">
                          <b className="fb-name-plain block">{p.name}</b>
                          <span className="fb-muted block text-[11px]">{p.id === "icq" ? "UIN 31337" : "1 mutual friend"}</span>
                          {sent ? (
                            <span className="fb-muted block text-[11px]">Friend request sent</span>
                          ) : (
                            <button type="button" className="fb-add" onClick={() => setRequested((r) => [...r, p.id])}>
                              <AppIcon id="friends" className="h-3 w-3" /> Add as Friend
                            </button>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </section>

                <section className="fb-box fb-ad" aria-label="Sponsored">
                  <h3>Sponsored</h3>
                  <Sheep width={96} className="fb-ad-sheep" />
                  <b className="block">Sheep for sale. Barely thrown.</b>
                  <span className="fb-muted block">Fluffy, aerodynamic, emotionally resilient. Pick up on campus.</span>
                </section>
              </aside>
            </div>
          </div>

          {/* ───── Chat, docked along the bottom ───── */}
          <div ref={chatBox} className="fb-chat" data-open={open ? "" : undefined} aria-hidden={!open} inert={!open}>
            <header
              className="fb-chat-head"
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest("button")) setChat("min");
              }}
            >
              <span className="fb-dot" aria-hidden />
              <b className="truncate">{buddy}</b>
              <span className="fb-chat-acts">
                <button type="button" title={`Poke ${first}`} aria-label={`Poke ${first}`} disabled={busy} onClick={() => send(POKE)}>
                  <Finger className="h-[14px] w-[28px]" />
                </button>
                <button type="button" title={`Throw a sheep at ${first} (SuperPoke!)`} aria-label={`Throw a sheep at ${first}`} disabled={busy} onClick={() => send(SHEEP)}>
                  <Sheep width={24} />
                </button>
                <button type="button" title="Minimize" aria-label="Minimize chat" onClick={() => setChat("min")}>
                  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
                    <path d="M1.5 8h7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
                <button type="button" title="Close" aria-label="Close chat" onClick={() => setChat("closed")}>
                  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
                    <path d="m2 2 6 6m0-6-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </span>
            </header>

            <div className="fb-chat-card">
              <span className="fb-chat-av" data-jolt={jolt ? "" : undefined}>
                {markPic(46, mood)}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[14px]">{buddy}</b>
                <span className="fb-chat-status">
                  <Rich text={statusOf(first, markNow, false)} />
                </span>
              </span>
              {fx?.mine && fx.act === "poke" && (
                <span key={fx.k} className="fb-fx-mypoke" onAnimationEnd={() => setFx(null)} aria-hidden>
                  <Finger className="h-[44px] w-[88px]" />
                </span>
              )}
            </div>

            <ChatBackdrop>
              <div ref={scroller} className="fb-log" aria-live="polite">
                {blocks.map((b) =>
                  b.kind === "group" ? (
                    <div key={b.key} className={`fb-grp ${b.mine ? "fb-mine" : "fb-theirs"}`}>
                      <span className="fb-pic fb-pic-28">{b.mine ? <UserPicture /> : markPic(28)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="fb-grp-head">
                          <b>{b.mine ? costume.user : first}</b>
                          {b.rows[0].at > 0 && <time dateTime={new Date(b.rows[0].at).toISOString()}>{clock(b.rows[0].at)}</time>}
                        </div>
                        {b.rows.map((r) => (
                          <p key={r.key} className="fb-line">
                            <Rich text={r.text} />
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : b.kind === "act" ? (
                    <p key={b.key} className="fb-event">
                      {b.act === "poke" ? <Finger className="h-[10px] w-[20px] shrink-0" /> : <Sheep width={20} className="shrink-0" />}
                      <span>
                        {b.mine
                          ? b.act === "poke"
                            ? `You poked ${first}.`
                            : `You threw a sheep at ${first}.`
                          : b.act === "poke"
                            ? `${first} poked you!`
                            : `${first} threw a sheep at you!`}
                      </span>
                    </p>
                  ) : (
                    <p key={b.key} className="fb-event">
                      <AppIcon id="feed" className="fb-ico shrink-0" />
                      <span>
                        {b.mine ? "You updated your status: " : `${first} updated their status: `}
                        <i>
                          <Rich text={statusOf(b.mine ? costume.user : first, b.text, b.mine)} />
                        </i>
                      </span>
                    </p>
                  ),
                )}

                {waiting && (
                  <div className="fb-grp fb-theirs fb-typing">
                    <span className="fb-pic fb-pic-28">{markPic(28)}</span>
                    <span className="fb-dots" aria-label={costume.typing}>
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                )}
                {error && (
                  <p className="fb-error">
                    {costume.error}
                    {lastMine && <span className="block italic">“{lastMine.text}”</span>}
                  </p>
                )}
              </div>
            </ChatBackdrop>

            {busy && (
              <div className="fb-typingbar">
                <Pencil className="fb-pencil h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{costume.typing}</span>
                <button type="button" className="fb-link" onClick={onStop}>
                  Stop
                </button>
              </div>
            )}

            <div className="fb-compose">
              <textarea
                ref={input}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder={costume.placeholder}
                aria-label={`Message ${buddy}`}
                className="fb-input"
              />
              <div className="fb-compose-tools">
                <button
                  type="button"
                  className="fb-emo-btn"
                  title="Emoticons"
                  aria-haspopup="dialog"
                  aria-expanded={menu === "emotes"}
                  onClick={() => setMenu((m) => (m === "emotes" ? null : "emotes"))}
                >
                  <Emote id="smile" className="h-[18px] w-[18px]" />
                </button>
                <span className="fb-hint">Press Enter to send</span>
                <button type="button" onClick={submit} disabled={busy || !value.trim()} className="fb-btn">
                  Send
                </button>
              </div>
              {menu === "emotes" && <EmotePicker onPick={insert} />}
            </div>
          </div>

          {/* The bar along the bottom of every page */}
          <div ref={dock} className="fb-dock">
            <span className="fb-dock-apps" aria-hidden>
              <AppIcon id="apps" />
              <span className="fb-dock-label">Applications</span>
            </span>
            <span className="fb-dock-quick" aria-hidden>
              {(["photos", "groups", "events", "video"] as AppId[]).map((id) => (
                <AppIcon key={id} id={id} />
              ))}
            </span>
            <span className="fb-dock-gap" />
            <div className="relative">
              <button
                type="button"
                className="fb-dock-tab fb-online"
                aria-haspopup="menu"
                aria-expanded={menu === "online"}
                onClick={() => setMenu((m) => (m === "online" ? null : "online"))}
              >
                <span className="fb-dot" aria-hidden />
                <span className="truncate">
                  Online Friends <b>(1)</b>
                </span>
              </button>
              {menu === "online" && (
                <div className="fb-pop fb-online-pop" role="menu" aria-label="Online Friends">
                  <div className="fb-pop-title">Online Friends</div>
                  <button type="button" role="menuitem" className="fb-friend" onClick={openChat}>
                    <span className="fb-pic fb-pic-28">{markPic(28)}</span>
                    <span className="min-w-0 flex-1 truncate">{buddy}</span>
                    <span className="fb-dot" aria-hidden />
                  </button>
                  {[
                    { a: kayleigh, note: "Idle" },
                    { a: cal, note: "Idle · 4am in Auckland" },
                  ].map(({ a, note }) => (
                    <div key={a.id} className="fb-friend fb-friend-idle" title={`${a.name} is idle`}>
                      <span className="fb-pic fb-pic-28">
                        <FriendPicture agent={a} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {a.name} <span className="fb-muted text-[11px]">{note}</span>
                      </span>
                      <span className="fb-moon" aria-hidden />
                    </div>
                  ))}
                  <div className="fb-pop-foot">Go offline · Options</div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                className="fb-dock-tab fb-flag"
                title="Notifications"
                aria-label={`Notifications${newNotices > 0 ? `, ${newNotices} new` : ""}`}
                aria-haspopup="dialog"
                aria-expanded={menu === "notes"}
                onClick={() => {
                  setMenu((m) => (m === "notes" ? null : "notes"));
                  setSeenNotices(notices.length);
                }}
              >
                <AppIcon id="flag" />
                {newNotices > 0 && <b className="fb-badge">{newNotices}</b>}
              </button>
              {menu === "notes" && (
                <div className="fb-pop fb-notes-pop" role="dialog" aria-label="Notifications">
                  <div className="fb-pop-title">Notifications</div>
                  {notices.slice(0, 6).map((n) => (
                    <div key={n.k} className="fb-note">
                      <span className="fb-pic fb-pic-28">{n.who === "mark" ? markPic(28) : <FriendPicture agent={n.who} />}</span>
                      <span className="min-w-0 flex-1">{n.text}</span>
                      <AppIcon id={n.icon} className="fb-ico shrink-0" />
                    </div>
                  ))}
                  <div className="fb-pop-foot">See All Notifications</div>
                </div>
              )}
            </div>
            {chat !== "closed" && (
              <button
                type="button"
                className="fb-dock-tab fb-chat-tab"
                data-on={open ? "" : undefined}
                data-flash={unread > 0 ? "" : undefined}
                onClick={() => (open ? setChat("min") : openChat())}
                aria-expanded={open}
              >
                <span className="fb-dot" aria-hidden />
                <span className="truncate">{buddy}</span>
                {unread > 0 && <b className="fb-badge">{unread}</b>}
              </button>
            )}
          </div>

          {/* Pokes and sheep that land on you, or fly at Mark */}
          {fx && !(fx.mine && fx.act === "poke") && (
            <div key={fx.k} className="fb-fx" data-act={fx.act} data-mine={fx.mine ? "" : undefined} aria-hidden>
              {fx.act === "poke" ? (
                <span className="fb-fx-poke" onAnimationEnd={(e) => e.target === e.currentTarget && setFx(null)}>
                  <Finger className="fb-fx-finger" />
                  <span className="fb-fx-ripple" />
                </span>
              ) : (
                <span className="fb-fx-sheep" onAnimationEnd={(e) => e.target === e.currentTarget && setFx(null)}>
                  <Sheep width={150} />
                  <span className="fb-fx-baa">Baa!</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── Pieces ───────── */

function Story({ pic, icon, meta, fresh, children }: { pic: React.ReactNode; icon: AppId; meta: string; fresh?: boolean; children: React.ReactNode }) {
  return (
    <article className="fb-story" data-fresh={fresh ? "" : undefined}>
      <span className="fb-pic fb-pic-50">{pic}</span>
      <div className="min-w-0 flex-1">
        <div className="fb-story-text">{children}</div>
        <div className="fb-story-meta">
          <AppIcon id={icon} className="fb-ico-sm" />
          <span>{meta}</span>
        </div>
      </div>
    </article>
  );
}

/** Mark's profile picture: a real one if it's been dropped in, else the gpty in the flash. */
function MarkPicture({ agent, mood, size }: { agent: Agent; mood: Mood; size: number }) {
  const src = art("buddyPicture");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" />;
  }
  return (
    <span className="fb-dp-gpty">
      <Gpty agent={agent} size={Math.round(size * 0.82)} mood={mood} />
    </span>
  );
}

/** A friend's picture: the other gptys, each on their own color. */
function FriendPicture({ agent }: { agent: Agent }) {
  return (
    <span className="fb-dp-gpty fb-dp-friend" style={{ "--tint": agent.look.color } as React.CSSProperties}>
      <Gpty agent={agent} size={36} />
    </span>
  );
}

function UserPicture() {
  const src = art("userPicture");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" />;
  }
  return <DefaultPic />;
}

/** A photo from the album, with the tag box that shows on hover. */
function Photo({ id, slot, agent, tag, tilt }: { id: PhotoId; slot: ArtSlot; agent: Agent; tag: string; tilt: number }) {
  const src = art(slot);
  return (
    <span className="fb-photo" style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" />
      ) : (
        <>
          <PhotoScene id={id} />
          <span className="fb-photo-gpty" data-scene={id}>
            <Gpty agent={agent} size={46} />
          </span>
          <span className="fb-flash" />
        </>
      )}
      <span className="fb-tagbox" aria-hidden>
        <i />
        <span>{tag}</span>
      </span>
    </span>
  );
}

/** The chat history, with an optional faded picture behind it. */
function ChatBackdrop({ children }: { children: React.ReactNode }) {
  const src = art("backdrop");
  return (
    <div className="fb-log-wrap">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[.14]" />
      )}
      {children}
    </div>
  );
}

function EmotePicker({ onPick }: { onPick: (code: string) => void }) {
  return (
    <div className="fb-pop fb-emotes" role="dialog" aria-label="Emoticons">
      <div className="fb-emote-grid">
        {EMOTES.map((e) => (
          <button
            key={e.id}
            type="button"
            className="fb-emote-btn"
            title={`${e.name}   ${e.codes[0]}`}
            aria-label={`${e.name} ${e.codes[0]}`}
            onClick={() => onPick(e.codes[0])}
          >
            <Emote id={e.id} />
          </button>
        ))}
      </div>
      <div className="fb-pop-foot">Try (^^^) or {'<(")'}</div>
    </div>
  );
}

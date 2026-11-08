"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Gpty, type Mood } from "@/components/Gpty";
import {
  AdFallback,
  art,
  Envelope,
  Favicon,
  Glass,
  Globe,
  GoogleG,
  NavIcon,
  SiteIcon,
  Star,
  type Vote,
  VoteArrow,
} from "@/components/reddit/art";
import { Md, plain } from "@/components/reddit/markdown";
import "@/components/reddit/reddit.css";
import { type Cameo, CAMEOS, DEFAULT_SUB, HOT, MODS, SR_BAR, type Sub, SUBS, subNamed, THIS, THRESHOLD } from "@/components/reddit/world";
import { rounded } from "@/components/skype/font";
import { getAgent } from "@/lib/agents";
import { useComposer, useDesktopDrag, useNow, useOnNewReply } from "./hooks";
import type { ChatLine, LayoutProps, ThreadItem } from "./types";

/**
 * Votes travel with your next reply, so Arthur knows how his last comment
 * went down: "/upvote" or "/downvote" on a line of its own, first. A post to
 * a subreddit other than AskReddit starts with "/r/name" the same way.
 */
export const UPVOTE = "/upvote";
export const DOWNVOTE = "/downvote";
const VOTE_LINE = /^\/(upvote|downvote)\s*$/i;
const SUB_LINE = /^\/r\/([A-Za-z0-9_.]{2,21})\s*$/i;

/** Levels of nesting on screen before reddit says "continue this thread". */
const DEEP = 6;

const MENUS = ["File", "Edit", "View", "History", "Bookmarks", "Tools", "Help"];
const BOOKMARKS: { label: string; icon: "folder" | "dot" | "feed" | "reddit" | "xkcd" | "news" | "wiki" | "reader"; menu?: boolean }[] = [
  { label: "Most Visited", icon: "folder", menu: true },
  { label: "Getting Started", icon: "dot" },
  { label: "Latest Headlines", icon: "feed", menu: true },
  { label: "reddit", icon: "reddit" },
  { label: "xkcd", icon: "xkcd" },
  { label: "Hacker News", icon: "news" },
  { label: "Wikipedia", icon: "wiki" },
  { label: "Google Reader", icon: "reader" },
];

/* ───────── Kept for this visit ───────── */

/** Your votes in each thread. The latest one also rides along with your next reply. */
const VOTES = new Map<string, Record<string, Vote>>();
/** The welcome message is read once a visit. */
let welcomeRead = false;

/* ───────── Small helpers ───────── */

function hash(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** "8t3bq": what a post id looked like in June 2009. */
function postId(seed: string) {
  return (8 * 36 ** 4 + 29 * 36 ** 3 + (hash(seed) % (6 * 36 ** 3))).toString(36);
}

/** "c0a2kzq": a comment id from the same week. */
function commentId(seed: string) {
  return `c0a${(hash(seed) % 36 ** 4).toString(36).padStart(4, "0")}`;
}

/** "Is a hot dog a sandwich?" -> "is_a_hot_dog_a_sandwich", as reddit wrote it in URLs. */
function urlSlug(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 50)
      .replace(/_+$/g, "") || "untitled"
  );
}

function ago(at: number, now: number) {
  if (!at) return "a while ago";
  const s = Math.max(1, Math.round((now - at) / 1000));
  const unit = (n: number, u: string) => `${n} ${u}${n === 1 ? "" : "s"} ago`;
  if (s < 60) return unit(s, "second");
  const m = Math.floor(s / 60);
  if (m < 60) return unit(m, "minute");
  const h = Math.floor(m / 60);
  if (h < 24) return unit(h, "hour");
  const d = Math.floor(h / 24);
  if (d < 30) return unit(d, "day");
  const mo = Math.floor(d / 30);
  return mo < 12 ? unit(mo, "month") : unit(Math.floor(mo / 12), "year");
}

const points = (n: number) => `${n} point${Math.abs(n) === 1 ? "" : "s"}`;
const count = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

/** A saved thread's title, without the "/r/name" it was posted with. */
function titleOf(t: ThreadItem) {
  return t.title.replace(/^\/r\/\S+\s+/, "").trim() || "untitled";
}

/* ───────── What the thread shows ───────── */

interface Post {
  key: string;
  sub: string;
  title: string;
  body: string;
  at: number;
}

interface Comment {
  key: string;
  mine: boolean;
  text: string;
  at: number;
  /** The reply still streaming in. */
  live: boolean;
  /** Which of Arthur's comments this is (0 for the first), or -1 for yours. */
  nth: number;
}

/**
 * The first line you send is the post (its first line the title, the rest
 * the text); after that, each line is a reply to the one before it, so the
 * whole conversation is one long, ever-deeper comment chain.
 */
function parse(lines: ChatLine[], busy: boolean) {
  const first = lines.findIndex((l) => l.role === "user");
  if (first < 0) return { post: null, comments: [] as Comment[], sent: {} as Record<string, Vote> };

  let parts = lines[first].text.split("\n");
  let sub = DEFAULT_SUB.name;
  const named = SUB_LINE.exec(parts[0]?.trim() ?? "");
  if (named) {
    sub = subNamed(named[1])?.name ?? named[1];
    parts = parts.slice(1);
  }
  while (parts.length > 1 && !parts[0].trim()) parts = parts.slice(1);
  const post: Post = {
    key: lines[first].id,
    sub,
    title: parts[0]?.trim() || "(untitled)",
    body: parts.slice(1).join("\n").trim(),
    at: lines[first].at,
  };

  const comments: Comment[] = [];
  const sent: Record<string, Vote> = {};
  let nth = 0;
  for (let i = first + 1; i < lines.length; i++) {
    const l = lines[i];
    const mine = l.role === "user";
    let text = l.text;
    if (mine) {
      const rows = text.split("\n");
      const vote = VOTE_LINE.exec(rows[0]?.trim() ?? "");
      if (vote) {
        const prev = comments.findLast((c) => !c.mine);
        if (prev) sent[prev.key] = vote[1].toLowerCase() === "upvote" ? 1 : -1;
        text = rows.slice(1).join("\n");
      }
    }
    text = text.replace(/^\s*\n/, "").trimEnd();
    if (!text.trim()) continue;
    comments.push({ key: l.id, mine, text, at: l.at, live: !mine && busy && i === lines.length - 1, nth: mine ? -1 : nth++ });
  }
  return { post, comments, sent };
}

const EDITED = /^\s*(\*\*|\*|_)?edit\b/im;

/* ───────── The window ───────── */

/** reddit, June 2009, remastered: a thread in Firefox 3 on Ubuntu 9.04. */
export function RedditLayout({ costume, lines, busy, waiting, error, onSend, onStop, threads, activeId, onNewThread, onSelectThread, onDeleteThread }: LayoutProps) {
  const agent = getAgent(costume.id);
  const op = costume.user;
  const arthur = costume.assistant;
  const now = useNow(5000);
  const { ref: win, handle } = useDesktopDrag<HTMLDivElement>();
  const scroller = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const reply = useRef<HTMLTextAreaElement>(null);
  const titleBox = useRef<HTMLTextAreaElement>(null);
  const userbar = useRef<HTMLDivElement>(null);
  const follow = useRef(true);

  const { post, comments, sent } = useMemo(() => parse(lines, busy), [lines, busy]);
  const draft = !post;
  const seed = hash(activeId);

  /* ── Votes ── */
  const [votes, setVotes] = useState<Record<string, Vote>>(() => VOTES.get(activeId) ?? {});
  const voteOf = (key: string, mine = false): Vote => votes[key] ?? sent[key] ?? (mine ? 1 : 0);
  const cast = (key: string, v: Vote) =>
    setVotes((all) => {
      const next = { ...all, [key]: v };
      VOTES.set(activeId, next);
      return next;
    });

  /* ── The submit form (a new thread) ── */
  const [sub, setSub] = useState<Sub>(DEFAULT_SUB);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const submitPost = () => {
    const t = title.replace(/\s+/g, " ").trim();
    if (!t || busy) return;
    const b = body.trim();
    follow.current = true;
    onSend(`${sub.name === DEFAULT_SUB.name ? "" : `/r/${sub.name}\n`}${t}${b ? `\n\n${b}` : ""}`);
  };
  const ask = (text: string) => {
    setTitle(text);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
    requestAnimationFrame(() => {
      const el = titleBox.current;
      el?.focus({ preventScroll: true });
      el?.setSelectionRange(text.length, text.length);
    });
  };

  /* ── How deep the page goes: past DEEP levels, it continues on its own page ── */
  const deepest = comments.length - 1 + (waiting ? 1 : 0);
  const autoRoot = deepest > DEEP ? Math.floor((deepest - 1) / DEEP) * DEEP : 0;
  const [manualRoot, setRoot] = useState<number | null>(null);
  const root = manualRoot ?? autoRoot;
  const goRoot = (k: number | null) => {
    setRoot(k === autoRoot ? null : k);
    follow.current = false;
    requestAnimationFrame(() => {
      const area = scroller.current?.querySelector<HTMLElement>(".rd-commentarea");
      if (area && scroller.current) scroller.current.scrollTo({ top: Math.max(0, area.offsetTop - 12), behavior: "smooth" });
    });
  };

  /* ── Replying: always to the last comment in the chain ── */
  const lastArthur = comments.findLast((c) => !c.mine);
  const sendReply = (text: string) => {
    const v = lastArthur ? votes[lastArthur.key] : 0;
    const pre = lastArthur && v ? `${v === 1 ? UPVOTE : DOWNVOTE}\n` : "";
    follow.current = true;
    setRoot(null);
    onSend(pre + text);
  };
  const { value, setValue, submit, onKeyDown } = useComposer(sendReply, busy);
  const [help, setHelp] = useState(false);

  /* ── Collapsing, flashing, reporting ── */
  const [folded, setFolded] = useState<Record<string, boolean>>({});
  const [flash, setFlash] = useState<string | null>(null);
  const [more, setMore] = useState<"no" | "loading" | "yes">("no");
  const [saved, setSaved] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hotHidden, setHotHidden] = useState<string[]>([]);
  const [hotSaved, setHotSaved] = useState<string[]>([]);

  useEffect(() => {
    if (!flash) return;
    const el = scroller.current?.querySelector<HTMLElement>(`[data-key="${flash}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    const t = setTimeout(() => setFlash(null), 1600);
    return () => clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    if (more !== "loading") return;
    const t = setTimeout(() => setMore("yes"), 700);
    return () => clearTimeout(t);
  }, [more]);

  /* ── Mail: the welcome message, then a reply notice for each of Arthur's comments ── */
  const arthurs = comments.filter((c) => !c.mine);
  const [seenReplies, setSeenReplies] = useState(arthurs.length);
  const [welcome, setWelcome] = useState(welcomeRead);
  const [inbox, setInbox] = useState(false);
  const unread = Math.max(0, arthurs.length - seenReplies) + (welcome ? 0 : 1);
  const [ping, setPing] = useState(0);
  useOnNewReply(lines, () => setPing(Date.now()));
  const openInbox = () => {
    setInbox((o) => !o);
    setSeenReplies(arthurs.length);
    setWelcome(true);
    welcomeRead = true;
  };
  useEffect(() => {
    if (!inbox) return;
    const down = (e: PointerEvent) => {
      if (!userbar.current?.contains(e.target as Node)) setInbox(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setInbox(false);
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [inbox]);

  /* ── The sidebar's search, subscription and the status bar ── */
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [subbed, setSubbed] = useState(true);
  const [hover, setHover] = useState<string | null>(null);

  /* ── Scores: everything climbs while you read ── */
  const minutes = (at: number) => Math.min(240, Math.max(0, (now - (at || now - 240 * 60_000)) / 60_000));
  const grow = (at: number, rate: number) => Math.floor(rate * Math.sqrt(minutes(at)));
  const postScore = post
    ? 1 + grow(post.at, 5.5) + 3 * arthurs.length + Math.floor((seed % 7) * Math.min(1, minutes(post.at) / 10)) + (voteOf("post", true) - 1)
    : 1;
  const like = post ? (postScore <= 2 ? 100 : 70 + (seed % 25)) : 100;
  const downs = postScore <= 2 ? 0 : Math.round((postScore * (100 - like)) / (2 * like - 100));
  const scoreOf = (c: Comment) =>
    c.mine
      ? 1 + grow(c.at, 0.7) + (voteOf(c.key, true) - 1)
      : 1 + grow(c.at, 6.5 / (1 + c.nth * 0.45)) + ((hash(c.key) % 3) * Math.min(1, minutes(c.at) / 5) | 0) + voteOf(c.key);

  /* ── Other redditors ── */
  const cameos = CAMEOS.filter((c) => arthurs.length >= c.after && (!c.more || more === "yes"));
  const hasMore = arthurs.length >= 1 && more !== "yes";
  const cameoCount = (list: Cameo[]): number => list.reduce((n, c) => n + 1 + cameoCount(c.replies ?? []), 0);
  const showThis = arthurs.length >= THIS.after;
  const total = comments.length + (root === 0 ? cameoCount(cameos) + (showThis ? 1 : 0) : 0);

  /* ── Following the conversation down the page ── */
  const pin = useCallback(() => {
    const page = scroller.current;
    const a = anchor.current;
    if (!page || !a) return;
    const over = a.getBoundingClientRect().bottom - (page.getBoundingClientRect().bottom - 24);
    if (over > 0) page.scrollTop += over;
  }, []);
  const sig = `${lines.length}:${lines.at(-1)?.text.length ?? 0}:${waiting}:${busy}:${root}:${error}`;
  useLayoutEffect(() => {
    if (follow.current) pin();
  }, [sig, pin]);
  const onScroll = () => {
    const page = scroller.current;
    const a = anchor.current;
    if (!page || !a) return;
    follow.current = a.getBoundingClientRect().bottom <= page.getBoundingClientRect().bottom + 80;
  };

  /* ── Focus: the title on a new post, the reply box when Arthur finishes ── */
  useEffect(() => {
    if (draft && window.matchMedia("(pointer: fine)").matches) titleBox.current?.focus({ preventScroll: true });
    // Only when the page first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wasBusy = useRef(busy);
  useEffect(() => {
    if (wasBusy.current && !busy) {
      const active = document.activeElement;
      if (!active || active === document.body || (win.current?.contains(active) && active.tagName !== "INPUT")) {
        reply.current?.focus({ preventScroll: true });
      }
    }
    wasBusy.current = busy;
  }, [busy, win]);

  const mood: Mood = error ? "error" : waiting ? "thinking" : busy ? "typing" : "watching";
  const pid = postId(activeId);
  const slug = post ? urlSlug(post.title) : "";
  const subName = post?.sub ?? sub.name;
  const subInfo = subNamed(subName) ?? { name: subName, about: "", readers: 1_204, age: "3 months" };
  const permalink = root > 0 && comments[root] ? `/${commentId(comments[root].key)}` : "";
  const path = post ? `/r/${subName}/comments/${pid}/${slug}/${permalink}` : `/r/${sub.name}/submit`;
  const tabTitle = post ? `${subName}: ${post.title}` : `submit to ${sub.name === DEFAULT_SUB.name ? "reddit" : sub.name}`;
  const status = hover
    ? hover
    : waiting
      ? "Waiting for www.reddit.com…"
      : busy
        ? "Transferring data from www.reddit.com…"
        : error
          ? "The connection to www.reddit.com was interrupted."
          : "Done";
  const lastMine = comments.findLast((c) => c.mine)?.text ?? (comments.length === 0 && post ? post.title : "");

  /* Firefox shows where a link goes in the status bar. */
  const overLink = (e: React.PointerEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-url]");
    const url = el ? `http://www.reddit.com${el.dataset.url}` : null;
    setHover((h) => (h === url ? h : url));
  };
  const u = (who: string) => (who === "[deleted]" ? undefined : `/user/${who}/`);

  /* ───── The comment chain ───── */

  const ghost = (
    <div className="rd-comment rd-ghost" data-collapsed="">
      <p className="rd-tagline">
        <span className="rd-expand">[+]</span> <span className="rd-author">{arthur}</span>{" "}
        <em>
          is writing a reply<span className="rd-dots" aria-hidden><i>.</i><i>.</i><i>.</i></span>
        </em>
      </p>
      <span className="sr-only">{costume.typing}</span>
    </div>
  );

  const composer = (to: string) => (
    <form
      className="rd-usertext rd-reply"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={reply}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={4}
        aria-label={`Reply to ${to}`}
        placeholder={costume.placeholder}
      />
      <div className="rd-usertext-bottom">
        <span className="rd-usertext-buttons">
          <button type="submit" className="rd-btn" disabled={busy || !value.trim()}>
            save
          </button>
          {value && (
            <button type="button" className="rd-btn" onClick={() => setValue("")}>
              cancel
            </button>
          )}
          {lastArthur && voteOf(lastArthur.key) !== 0 && (
            <span className="rd-vote-note">
              {arthur} will see your {voteOf(lastArthur.key) === 1 ? "upvote" : "downvote"}
            </span>
          )}
        </span>
        <button type="button" className="rd-help-toggle" aria-expanded={help} onClick={() => setHelp((h) => !h)}>
          {help ? "hide help" : "formatting help"}
        </button>
      </div>
      {help && <FormattingHelp />}
    </form>
  );

  const errorBox = error && (
    <div className="rd-broke" role="alert">
      <span className="rd-broke-art">
        {art("broke") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art("broke")} alt="" />
        ) : (
          <Gpty agent={agent} size={58} mood="error" />
        )}
      </span>
      <span className="min-w-0">
        <b>you broke reddit.</b>
        <span className="block">{costume.error}</span>
        {lastMine && <span className="rd-broke-quote">your comment is safe: “{plain(lastMine).slice(0, 140)}”</span>}
      </span>
    </div>
  );

  /** The end of the chain: Arthur typing, the reply box, or an error. */
  const tail = (to: string) => (
    <>
      {waiting && ghost}
      {errorBox}
      {!busy && composer(to)}
      <div ref={anchor} className="rd-anchor" aria-hidden />
    </>
  );

  const chain = (k: number): React.ReactNode => {
    const c = comments[k];
    if (!c) return null;
    const last = k === comments.length - 1;
    const author = c.mine ? op : arthur;
    const key = c.key;
    const v = voteOf(key, c.mine);
    const kids = comments.length - 1 - k + (k === 0 && showThis && root === 0 ? 1 : 0);
    const deeper = k - root >= DEEP && !last;
    return (
      <CommentView
        key={key}
        id={key}
        author={author}
        url={u(author)}
        op={c.mine}
        score={scoreOf(c)}
        time={ago(c.at, now)}
        edited={!c.mine && !c.live && EDITED.test(c.text)}
        vote={v}
        onVote={(nv) => cast(key, nv)}
        label={c.mine ? "your comment" : `${arthur}'s comment`}
        collapsed={!!folded[key]}
        onToggle={() => setFolded((f) => ({ ...f, [key]: !f[key] }))}
        kids={kids}
        flash={flash === key}
        fresh={c.live}
        body={<MemoMd text={c.text} live={c.live} />}
        buttons={
          <>
            <li>
              <button type="button" data-url={`${path.replace(/[^/]*\/$/, "")}${commentId(key)}`} onClick={() => goRoot(k)}>
                permalink
              </button>
            </li>
            {k > 0 && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    const p = comments[k - 1].key;
                    if (k - 1 < root) setRoot(Math.max(0, k - 1 - (DEEP - 1)));
                    setFlash(p);
                  }}
                >
                  parent
                </button>
              </li>
            )}
            {last && !busy && (
              <li>
                <button type="button" onClick={() => reply.current?.focus()}>
                  reply
                </button>
              </li>
            )}
            {!c.mine && (
              <li>
                <Confirm label="report" done="reported" />
              </li>
            )}
          </>
        }
      >
        {last ? tail(author) : deeper ? <ContinueLink onClick={() => goRoot(k + 1)} /> : chain(k + 1)}
        {k === 0 && root === 0 && showThis && (
          <CameoView c={THIS} now={now} votes={votes} cast={cast} folded={folded} setFolded={setFolded} u={u} />
        )}
      </CommentView>
    );
  };

  /* ───── The page ───── */

  return (
    <div className={`${rounded.variable} rd flex h-full items-center justify-center`}>
      <div ref={win} className="rd-window" style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}>
        {/* ───── Ubuntu's Human title bar ───── */}
        <div className="rd-titlebar" {...handle}>
          <Globe className="rd-titlebar-ico" />
          <span className="rd-titlebar-text">{tabTitle} - Mozilla Firefox</span>
          <span className="rd-wm" aria-hidden>
            <i data-b="min" />
            <i data-b="max" />
            <i data-b="close" />
          </span>
        </div>

        {/* ───── Firefox 3 ───── */}
        <div className="rd-chrome">
          <div className="rd-menubar" aria-hidden>
            {MENUS.map((m) => (
              <span key={m}>
                <u>{m[0]}</u>
                {m.slice(1)}
              </span>
            ))}
          </div>
          <div className="rd-navbar">
            <span className="rd-navbtn rd-navbtn-big" aria-hidden data-off={draft ? "" : undefined}>
              <NavIcon id="back" off={draft} />
            </span>
            <span className="rd-navbtn" aria-hidden data-off="">
              <NavIcon id="forward" off />
            </span>
            <span className="rd-navbtn" aria-hidden>
              <NavIcon id="reload" />
            </span>
            <button type="button" className="rd-navbtn" disabled={!busy} onClick={onStop} title="Stop loading this page" aria-label="Stop the reply">
              <NavIcon id="stop" off={!busy} />
            </button>
            <button type="button" className="rd-navbtn" onClick={onNewThread} title="Submit a new post" aria-label="New post">
              <NavIcon id="home" />
            </button>
            <div className="rd-url">
              <span className="rd-identity">
                <Favicon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate">
                http://www.reddit.com<span className="rd-url-path">{path}</span>
              </span>
              <button type="button" className="rd-star" aria-label={saved ? "Saved" : "Save this post"} aria-pressed={saved} onClick={() => post && setSaved((s) => !s)}>
                <Star on={saved} />
              </button>
              <span className="rd-drop" aria-hidden>
                ▾
              </span>
            </div>
            <div className="rd-gsearch" aria-hidden>
              <GoogleG className="h-4 w-4 shrink-0" />
              <span className="truncate">Google</span>
              <Glass className="ml-auto h-3.5 w-3.5 shrink-0 text-[#8b8073]" />
            </div>
          </div>
          <div className="rd-bookmarks" aria-hidden>
            {BOOKMARKS.map((b) => (
              <span key={b.label} className="rd-bm">
                {b.icon === "reddit" ? <Favicon className="h-4 w-4" /> : <SiteIcon site={b.icon} />}
                {b.label}
                {b.menu && <span className="rd-bm-drop">▾</span>}
              </span>
            ))}
          </div>
          <div className="rd-tabstrip" aria-hidden>
            <span className="rd-tab rd-tab-on">
              {busy ? <span className="rd-throbber" /> : <Favicon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{tabTitle}</span>
              <i className="rd-tab-x" />
            </span>
            <span className="rd-tab">
              <SiteIcon site="wiki" className="h-4 w-4 shrink-0" />
              <span className="truncate">Large Hadron Collider - Wikipedia, the free encyclopedia</span>
              <i className="rd-tab-x" />
            </span>
            <span className="rd-tab rd-tab-3">
              <SiteIcon site="xkcd" className="h-4 w-4 shrink-0" />
              <span className="truncate">xkcd: Duty Calls</span>
              <i className="rd-tab-x" />
            </span>
            <span className="rd-tabs-all">▾</span>
          </div>
        </div>

        {/* ───── The page ───── */}
        <div ref={scroller} className="rd-page" onScroll={onScroll} onPointerOver={overLink} onPointerLeave={() => setHover(null)}>
          <div className="rd-srbar">
            <span className="rd-sr-my">
              my reddits <span aria-hidden>▾</span>
            </span>
            <span className="rd-sr-sep" aria-hidden>
              |
            </span>
            <span className="rd-sr-list">
              <span data-url="/">front</span>
              <span data-url="/r/all/">all</span>
              <span data-url="/r/random/">random</span>
            </span>
            <span className="rd-sr-sep" aria-hidden>
              |
            </span>
            <span className="rd-sr-list">
              {SR_BAR.map((s) => {
                const target = subNamed(s);
                const on = s.toLowerCase() === subName.toLowerCase();
                return draft && target ? (
                  <button key={s} type="button" data-on={on ? "" : undefined} data-url={`/r/${target.name}/`} onClick={() => setSub(target)} title={`Post to ${target.name}`}>
                    {s}
                  </button>
                ) : (
                  <span key={s} data-on={on ? "" : undefined} data-url={`/r/${s}/`}>
                    {s}
                  </span>
                );
              })}
            </span>
            <span className="rd-sr-more" aria-hidden>
              more »
            </span>
          </div>

          <header className="rd-header">
            <div className="rd-header-left">
              <button type="button" className="rd-logo" onClick={onNewThread} title="reddit.com: what's new online!" data-url="/">
                <span className="rd-logo-alien">
                  <Gpty agent={agent} size={44} mood={mood} />
                </span>
                <span className="rd-logo-word">reddit</span>
              </button>
              <span className="rd-pagename" data-url={`/r/${subName}/`}>
                {subName}
              </span>
              <ul className="rd-tabmenu">
                {(draft ? ["hot", "new", "controversial", "top", "saved"] : ["comments", "related"]).map((t, i) => (
                  <li key={t} data-on={i === 0 ? "" : undefined}>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div ref={userbar} className="rd-userbar">
              <span className="rd-user" data-url={`/user/${op}/`}>
                {op}
              </span>{" "}
              (<b className="rd-karma" title="link karma">{postScore.toLocaleString("en-US")}</b>)<span className="rd-bar-sep">|</span>
              <button
                type="button"
                className="rd-mail"
                data-unread={unread ? "" : undefined}
                aria-label={unread ? `Messages, ${unread} new` : "Messages"}
                aria-expanded={inbox}
                onClick={openInbox}
              >
                <Envelope key={unread ? ping : 0} unread={unread > 0} />
              </button>
              <span className="rd-bar-sep">|</span>
              <span className="rd-bar-link">preferences</span>
              <span className="rd-bar-sep">|</span>
              <span className="rd-bar-link">logout</span>
              {inbox && (
                <div className="rd-inbox" role="dialog" aria-label="Inbox">
                  <div className="rd-inbox-head">
                    <b>inbox</b>
                    <span>unread · messages · comment replies · sent</span>
                  </div>
                  <div className="rd-inbox-list">
                    {arthurs
                      .toReversed()
                      .slice(0, 6)
                      .map((c) => (
                        <div key={c.key} className="rd-msg">
                          <p className="rd-msg-subject">comment reply</p>
                          <p className="rd-tagline">
                            from <span className="rd-author">{arthur}</span> via /r/{subName} sent {ago(c.at, now)}
                          </p>
                          <p className="rd-msg-body">{plain(c.text).slice(0, 150) || "…"}</p>
                          <button
                            type="button"
                            className="rd-msg-link"
                            onClick={() => {
                              setInbox(false);
                              const k = comments.indexOf(c);
                              if (k < root || k > root + DEEP) setRoot(k === autoRoot ? null : Math.max(0, k - (k % DEEP)));
                              setFlash(c.key);
                            }}
                          >
                            context
                          </button>
                        </div>
                      ))}
                    <div className="rd-msg">
                      <p className="rd-msg-subject">welcome to reddit!</p>
                      <p className="rd-tagline">
                        from <span className="rd-author">{arthur}</span> sent 2 minutes ago
                      </p>
                      <div className="rd-msg-body">
                        <MemoMd text={costume.greeting} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="rd-body">
            {/* ───── The sidebar ───── */}
            <aside className="rd-side" aria-label="Sidebar">
              <form
                className="rd-searchbox"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearched(query.trim());
                }}
              >
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search reddit" aria-label="Search reddit" />
                <button type="submit" aria-label="Search">
                  <Glass className="h-3.5 w-3.5" />
                </button>
              </form>
              {searched && (
                <p className="rd-searchnote" role="status">
                  no results for <b>“{searched}”</b>. reddit search is temporarily broken (it has been since 2005). try <span className="rd-link-blue">google</span>: site:reddit.com {searched}
                </p>
              )}

              <button type="button" className="rd-submit-btn" onClick={onNewThread} data-url={`/r/${subName}/submit`}>
                <span className="rd-submit-ico" aria-hidden>
                  <VoteArrow dir="up" on />
                </span>
                Submit a new text post
              </button>

              {post && (
                <div className="rd-linkinfo">
                  <p className="rd-linkinfo-date">this post was submitted {ago(post.at, now)}</p>
                  <p className="rd-linkinfo-score">
                    <b>{points(postScore)}</b> ({like}% like it)
                  </p>
                  <p className="rd-muted">
                    {count(postScore + downs, "up vote")} {count(downs, "down vote")}
                  </p>
                </div>
              )}

              <section className="rd-sidebox">
                <div className="rd-sidebox-head">
                  <b data-url={`/r/${subInfo.name}/`}>{subInfo.name}</b>
                  <button type="button" className="rd-toggle" data-on={subbed ? "" : undefined} onClick={() => setSubbed((s) => !s)}>
                    {subbed ? "– frontpage" : "+ frontpage"}
                  </button>
                </div>
                <p className="rd-muted">{count(subInfo.readers + (subbed ? 1 : 0), "reader")}</p>
                {subInfo.about && <p className="rd-sidebox-about">{subInfo.about}</p>}
                <p className="rd-muted">a community for {subInfo.age}</p>
                <p className="rd-mods">
                  <span>moderators</span>
                  {MODS.map((m) => (
                    <span key={m} className="rd-author" data-url={`/user/${m}/`}>
                      {m}
                    </span>
                  ))}
                </p>
              </section>

              <section className="rd-sidebox rd-recent">
                <p className="rd-sidebox-title">recently viewed links</p>
                {threads.filter((t) => !t.draft).length === 0 ? (
                  <p className="rd-muted">nothing yet. ask something!</p>
                ) : (
                  <ul>
                    {threads
                      .filter((t) => !t.draft)
                      .slice(0, 8)
                      .map((t) => (
                        <li key={t.id} data-on={t.id === activeId ? "" : undefined}>
                          <button type="button" className="rd-recent-link" onClick={() => onSelectThread(t.id)} aria-current={t.id === activeId ? "page" : undefined}>
                            {titleOf(t)}
                          </button>
                          <span className="rd-muted">{ago(t.updatedAt, now)}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </section>

              <section className="rd-ad" aria-label="Advertisement">
                <span className="rd-ad-label">advertisement</span>
                <span className="rd-ad-box">
                  {art("ad") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={art("ad")} alt="" />
                  ) : (
                    <AdFallback />
                  )}
                </span>
                <span className="rd-ad-what">what&apos;s this?</span>
              </section>
            </aside>

            {/* ───── The content ───── */}
            <main className="rd-content" aria-label={draft ? "Submit" : "Comments"}>
              {draft ? (
                <>
                  {!welcome && (
                    <div className="rd-pm" role="status">
                      <Envelope unread className="h-[11px] w-[16px] shrink-0" />
                      <span className="min-w-0">
                        <b>{arthur}</b> sent you a message:
                        <span className="rd-pm-text">
                          <MemoMd text={costume.greeting} />
                        </span>
                      </span>
                    </div>
                  )}

                  <form
                    className="rd-submit"
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitPost();
                    }}
                  >
                    <h1 className="rd-submit-h">
                      submit to <span>{sub.name}</span>
                    </h1>
                    <ul className="rd-formtabs" aria-hidden>
                      <li>link</li>
                      <li data-on="">text</li>
                    </ul>
                    <div className="rd-roundfield">
                      <label htmlFor="rd-title" className="rd-roundfield-title">
                        <span className="rd-req">*</span>title
                      </label>
                      <textarea
                        id="rd-title"
                        ref={titleBox}
                        value={title}
                        maxLength={300}
                        rows={2}
                        onChange={(e) => setTitle(e.target.value.replace(/\n/g, " "))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                            e.preventDefault();
                            submitPost();
                          }
                        }}
                      />
                      <span className="rd-hint">ask your question here. {300 - title.length} characters left.</span>
                    </div>
                    <div className="rd-roundfield">
                      <label htmlFor="rd-text" className="rd-roundfield-title">
                        text <span className="rd-roundfield-opt">(optional)</span>
                      </label>
                      <textarea
                        id="rd-text"
                        value={body}
                        rows={3}
                        onChange={(e) => setBody(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            submitPost();
                          }
                        }}
                      />
                    </div>
                    <div className="rd-roundfield">
                      <span className="rd-roundfield-title">
                        <span className="rd-req">*</span>choose a subreddit
                      </span>
                      <span className="rd-sub-pick">
                        {SUBS.map((s) => (
                          <button key={s.name} type="button" aria-pressed={s.name === sub.name} onClick={() => setSub(s)}>
                            {s.name}
                          </button>
                        ))}
                      </span>
                      <span className="rd-hint">{sub.about}</span>
                    </div>
                    <div className="rd-submit-row">
                      <button type="submit" className="rd-btn rd-btn-big" disabled={busy || !title.trim()}>
                        submit
                      </button>
                      <span className="rd-hint">please be mindful of reddiquette.</span>
                    </div>
                  </form>

                  <div className="rd-panestack-title">
                    <span>{sub.name === DEFAULT_SUB.name ? "what's hot in AskReddit" : "meanwhile, in AskReddit"}</span>
                    <span className="rd-muted">click a title to ask it again (reposts are a reddit tradition)</span>
                  </div>
                  <div className="rd-sitetable">
                    {HOT.filter((h) => !hotHidden.includes(h.id)).map((h, i) => {
                      const v = voteOf(h.id);
                      return (
                        <div key={h.id} className="rd-link">
                          <span className="rd-rank">{i + 1}</span>
                          <Arrows vote={v} score={h.score + v} label={h.title} onVote={(nv) => cast(h.id, nv)} />
                          <div className="rd-entry">
                            <p className="rd-title">
                              <button type="button" className="rd-title-link" onClick={() => ask(h.title)}>
                                {h.title}
                              </button>{" "}
                              <span className="rd-domain">(self.AskReddit)</span>
                            </p>
                            <p className="rd-tagline">
                              submitted {count(h.age, "hour")} ago by{" "}
                              <span className="rd-author" data-url={`/user/${h.author}/`}>
                                {h.author}
                              </span>
                            </p>
                            <ul className="rd-buttons">
                              <li>
                                <button type="button" onClick={() => ask(h.title)}>
                                  {count(h.comments, "comment")}
                                </button>
                              </li>
                              <li>
                                <button type="button" onClick={() => setHotSaved((s) => (s.includes(h.id) ? s.filter((x) => x !== h.id) : [...s, h.id]))}>
                                  {hotSaved.includes(h.id) ? "unsave" : "save"}
                                </button>
                              </li>
                              <li>
                                <button type="button" onClick={() => setHotHidden((s) => [...s, h.id])}>
                                  hide
                                </button>
                              </li>
                              <li>
                                <Confirm label="report" done="reported" />
                              </li>
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* The post */}
                  <div className="rd-link rd-self" data-hidden={hidden ? "" : undefined}>
                    <Arrows vote={voteOf("post", true)} score={postScore} label="your post" onVote={(nv) => cast("post", nv)} />
                    <div className="rd-entry">
                      <p className="rd-title">
                        <span className="rd-title-link rd-title-visited">{post.title}</span>{" "}
                        <span className="rd-domain">
                          (<span data-url={`/r/${post.sub}/`}>self.{post.sub}</span>)
                        </span>
                      </p>
                      <p className="rd-tagline">
                        submitted {ago(post.at, now)} by{" "}
                        <span className="rd-author rd-op" data-url={`/user/${op}/`}>
                          {op}
                        </span>
                      </p>
                      {post.body && (
                        <div className="rd-selftext">
                          <MemoMd text={post.body} />
                        </div>
                      )}
                      <ul className="rd-buttons">
                        <li>
                          <b className="rd-comments-count">{count(total, "comment")}</b>
                        </li>
                        <li>
                          <button type="button" onClick={() => setSaved((s) => !s)}>
                            {saved ? "unsave" : "save"}
                          </button>
                        </li>
                        <li>
                          <button type="button" onClick={() => setHidden((h) => !h)}>
                            {hidden ? "unhide" : "hide"}
                          </button>
                        </li>
                        <li>
                          <Confirm label="delete" onYes={() => onDeleteThread(activeId)} />
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* The comments */}
                  <div className="rd-commentarea" aria-live="polite">
                    <div className="rd-panestack-title">
                      <span>{total === 0 ? "no comments (yet)" : `all ${count(total, "comment")}`}</span>
                      <span className="rd-menuarea">
                        sorted by: <b>hot</b>
                      </span>
                    </div>

                    {root > 0 && (
                      <div className="rd-infobar">
                        you are viewing a single comment&apos;s thread.{" "}
                        <button type="button" onClick={() => goRoot(0)}>
                          view the rest of the comments →
                        </button>
                      </div>
                    )}

                    <div className="rd-nested">
                      {comments.length === 0 ? (
                        <>
                          {total === 0 && !busy && !error && <p className="rd-empty">there doesn&apos;t seem to be anything here</p>}
                          {tail(op)}
                        </>
                      ) : (
                        chain(root)
                      )}

                      {root === 0 &&
                        cameos
                          .toSorted((a, b) => (b.score ?? 0) - (a.score ?? 0))
                          .map((c) => <CameoView key={c.id} c={c} now={now} votes={votes} cast={cast} folded={folded} setFolded={setFolded} u={u} />)}

                      {root === 0 && hasMore && (
                        <p className="rd-more">
                          {more === "loading" ? (
                            <span className="rd-loading">loading...</span>
                          ) : (
                            <button type="button" onClick={() => setMore("loading")}>
                              load more comments
                            </button>
                          )}{" "}
                          <span className="rd-muted">({count(cameoCount(CAMEOS.filter((c) => c.more)), "reply", "replies")})</span>
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </main>
          </div>

          <footer className="rd-footer">
            <div className="rd-footer-cols">
              {[
                ["about", "blog", "about reddit", "team", "source code", "advertise"],
                ["help", "FAQ", "reddiquette", "contact us"],
                ["tools", "mobile", "firefox extension", "buttons", "widget", "bookmarklets"],
              ].map(([head, ...items]) => (
                <dl key={head}>
                  <dt>{head}</dt>
                  {items.map((it) => (
                    <dd key={it}>{it}</dd>
                  ))}
                </dl>
              ))}
            </div>
            <p className="rd-legal">
              Use of this site constitutes acceptance of our User Agreement and Privacy Policy. © 2009 reddit inc. All rights reserved.
            </p>
          </footer>
        </div>

        {/* ───── Firefox's status bar ───── */}
        <div className="rd-statusbar" aria-hidden>
          <span className="min-w-0 flex-1 truncate">{status}</span>
          {busy && (
            <span className="rd-progress">
              <i />
            </span>
          )}
          <span className="rd-status-cell">{draft ? "reddit.com" : `${count(total, "comment")}`}</span>
        </div>
      </div>
    </div>
  );
}

/* ───────── Pieces ───────── */

/** A comment body, re-parsed only when its text changes. */
const MemoMd = memo(function MemoMd({ text, live = false }: { text: string; live?: boolean }) {
  return <Md text={text} className={live ? "rd-live" : ""} />;
});

function Arrows({ vote, score, label, onVote }: { vote: Vote; score?: number; label: string; onVote: (v: Vote) => void }) {
  return (
    <div className="rd-midcol" data-vote={vote}>
      <button type="button" className="rd-arrow" aria-label={`Upvote ${label}`} aria-pressed={vote === 1} onClick={() => onVote(vote === 1 ? 0 : 1)}>
        <VoteArrow dir="up" on={vote === 1} />
      </button>
      {score !== undefined && <span className="rd-midscore">{score.toLocaleString("en-US")}</span>}
      <button type="button" className="rd-arrow" aria-label={`Downvote ${label}`} aria-pressed={vote === -1} onClick={() => onVote(vote === -1 ? 0 : -1)}>
        <VoteArrow dir="down" on={vote === -1} />
      </button>
    </div>
  );
}

function CommentView({
  id,
  author,
  url,
  op = false,
  score,
  time,
  edited = false,
  vote,
  onVote,
  label,
  collapsed,
  onToggle,
  kids,
  below = false,
  flash = false,
  fresh = false,
  body,
  buttons,
  children,
}: {
  id: string;
  author: string;
  url?: string;
  op?: boolean;
  /** null: [deleted], which has no score. */
  score: number | null;
  time: string;
  edited?: boolean;
  vote: Vote;
  onVote: (v: Vote) => void;
  label: string;
  collapsed: boolean;
  onToggle: () => void;
  kids: number;
  /** Folded for scoring at or below the threshold. */
  below?: boolean;
  flash?: boolean;
  fresh?: boolean;
  body: React.ReactNode;
  buttons: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rd-comment" data-key={id} data-collapsed={collapsed ? "" : undefined} data-flash={flash ? "" : undefined} data-fresh={fresh ? "" : undefined}>
      {!collapsed && score !== null && <Arrows vote={vote} label={label} onVote={onVote} />}
      <div className="rd-c-entry" data-nomid={score === null ? "" : undefined}>
        <p className="rd-tagline">
          <button type="button" className="rd-expand" onClick={onToggle} aria-expanded={!collapsed} aria-label={collapsed ? `Show ${label}` : `Hide ${label}`}>
            [{collapsed ? "+" : "–"}]
          </button>{" "}
          <span className={`rd-author ${op ? "rd-op" : ""} ${score === null ? "rd-deleted" : ""}`} data-url={url}>
            {author}
          </span>
          {op && (
            <span className="rd-op-tag" title="submitter">
              [S]
            </span>
          )}{" "}
          {collapsed && below ? (
            <em className="rd-below">comment score below threshold</em>
          ) : (
            <>
              {score !== null && <span className="rd-score">{points(score)}</span>} <time>{time}</time>
              {edited && (
                <span className="rd-edited" title="last edited a minute later">
                  *
                </span>
              )}
            </>
          )}
          {collapsed && kids > 0 && <em className="rd-kids"> ({count(kids, "child", "children")})</em>}
        </p>
        {!collapsed && (
          <>
            {body}
            <ul className="rd-buttons rd-cbuttons">{buttons}</ul>
          </>
        )}
      </div>
      {!collapsed && children && <div className="rd-child">{children}</div>}
    </div>
  );
}

/** Another redditor's comment, and the replies under it. */
function CameoView({
  c,
  now,
  votes,
  cast,
  folded,
  setFolded,
  u,
}: {
  c: Cameo;
  now: number;
  votes: Record<string, Vote>;
  cast: (k: string, v: Vote) => void;
  folded: Record<string, boolean>;
  setFolded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  u: (who: string) => string | undefined;
}) {
  const v = votes[c.id] ?? 0;
  const below = c.score !== null && c.score <= THRESHOLD;
  const collapsed = folded[c.id] ?? below;
  const kids = (c.replies ?? []).reduce(function n(t: number, r: Cameo): number {
    return t + 1 + (r.replies ?? []).reduce(n, 0);
  }, 0);
  return (
    <CommentView
      id={c.id}
      author={c.author}
      url={u(c.author)}
      score={c.score === null ? null : c.score + v}
      time={ago(now - c.ago * 60_000, now)}
      vote={v}
      onVote={(nv) => cast(c.id, nv)}
      label={`${c.author}'s comment`}
      collapsed={collapsed}
      onToggle={() => setFolded((f) => ({ ...f, [c.id]: !collapsed }))}
      kids={kids}
      below={below}
      body={c.score === null ? <p className="rd-md rd-deleted-body">[deleted]</p> : <Md text={c.text} />}
      buttons={
        <>
          <li>
            <span className="rd-btn-dead">permalink</span>
          </li>
          {c.score !== null && (
            <li>
              <Confirm label="report" done="reported" />
            </li>
          )}
        </>
      }
    >
      {c.replies?.map((r) => <CameoView key={r.id} c={r} now={now} votes={votes} cast={cast} folded={folded} setFolded={setFolded} u={u} />)}
    </CommentView>
  );
}

/** reddit's inline "are you sure? yes / no". */
function Confirm({ label, done, onYes }: { label: string; done?: string; onYes?: () => void }) {
  const [state, setState] = useState<"idle" | "ask" | "done">("idle");
  if (state === "done") return <span className="rd-done">{done}</span>;
  if (state === "ask") {
    return (
      <span className="rd-confirm">
        <span className="rd-confirm-q">are you sure?</span>{" "}
        <button
          type="button"
          onClick={() => {
            onYes?.();
            setState(done ? "done" : "idle");
          }}
        >
          yes
        </button>{" "}
        /{" "}
        <button type="button" onClick={() => setState("idle")}>
          no
        </button>
      </span>
    );
  }
  return (
    <button type="button" onClick={() => setState("ask")}>
      {label}
    </button>
  );
}

function ContinueLink({ onClick }: { onClick: () => void }) {
  return (
    <p className="rd-continue">
      <button type="button" onClick={onClick}>
        continue this thread →
      </button>
    </p>
  );
}

/** The table that opens under "formatting help". */
function FormattingHelp() {
  const rows: [string, React.ReactNode][] = [
    ["*italics*", <em key="i">italics</em>],
    ["**bold**", <b key="b">bold</b>],
    ["[reddit!](http://reddit.com)", <span key="l" className="rd-link-blue">reddit!</span>],
    ["* item 1\n* item 2\n* item 3", (
      <ul key="u">
        <li>item 1</li>
        <li>item 2</li>
        <li>item 3</li>
      </ul>
    )],
    ["> quoted text", <blockquote key="q">quoted text</blockquote>],
    ["Lines starting with four spaces\nare treated like code:\n\n    if 1 * 2 < 3:\n        print \"hello, world!\"", (
      <span key="c">
        Lines starting with four spaces are treated like code:
        <pre>{"if 1 * 2 < 3:\n    print \"hello, world!\""}</pre>
      </span>
    )],
  ];
  return (
    <table className="rd-mdhelp">
      <thead>
        <tr>
          <th>you type:</th>
          <th>you see:</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([typed, seen]) => (
          <tr key={typed}>
            <td>
              <pre>{typed}</pre>
            </td>
            <td className="rd-md">{seen}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

"use client";

/**
 * The pieces of the mIRC window: the line types, how each line is drawn,
 * menus, the color palette, dialogs, and the status bar's live panels. The
 * window itself, and everything that happens in it, is
 * src/components/layouts/IrcLayout.tsx.
 */

import { useEffect, useRef, useState } from "react";
import { Gpty, type Mood } from "@/components/Gpty";
import { useNow } from "@/components/layouts/hooks";
import type { getAgent } from "@/lib/agents";
import { art, ChannelMark, Glyph, MircMark, Modem, ToolIcon, Warn } from "./art";
import { BOT, CHANNELS, countdown, hms, NETWORK, NICK, PALETTE, pick, PORT, SERVER, stamp, trialDays, y2kLeft } from "./world";

export const CHAN = "#gpty";
const URL = /(https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)/g;

/** Nicks get a stable color from the palette, like a good script would give them. */
export function nickColor(n: string, nick: string, mine: boolean) {
  if (n === nick) return "#2a45c4";
  if (mine) return "#000";
  if (n === BOT || n === "ChanServ") return PALETTE[14];
  return PALETTE[pick([2, 3, 5, 6, 7, 10, 12, 13], n.toLowerCase())];
}

/* ───────── What the windows show ───────── */

export type Tone = "text" | "join" | "part" | "quit" | "mode" | "topic" | "kick" | "nick" | "notice" | "ctcp" | "info" | "info2" | "server" | "error";

export interface Transfer {
  name: string;
  size: string;
  to: string;
  state: "waiting" | "sending" | "failed" | "canceled";
}

export type Ev =
  | { t: "msg"; who: string; text: string; mine?: boolean; hl?: boolean }
  | { t: "act"; who: string; text: string; mine?: boolean }
  | { t: "line"; tone: Tone; text: string }
  | { t: "pre"; lines: readonly string[]; rainbow?: boolean }
  | { t: "dcc"; id: number; file: Transfer }
  | { t: "whois"; who: string }
  | { t: "help" }
  | { t: "list" };

/** A line in a window. `stage` delays its entrance (ms); `boot` marks the connect and join lines. */
export type Row = Ev & { key: string; at: number; stage?: number; boot?: boolean };

export type Win = "status" | "chan";

export interface Note {
  id: number;
  /** Shown after this chat line (null: right after the join lines). */
  after: string | null;
  win: Win;
  at: number;
  ev: Ev;
}

/** A menu entry. `act` names what it does; the window carries it out (see `perform`). */
export type Item = { label: string; act?: string; hint?: string; checked?: boolean; disabled?: boolean } | "-";

export interface Prefs {
  /** Your text color, from the mIRC palette. */
  color: number | null;
  stamps: boolean;
  joins: boolean;
  nicks: boolean;
  toolbar: boolean;
  switchbar: boolean;
}


/* ───────── Pieces ───────── */

export const COMMANDS: { cmd: string; what: string }[] = [
  { cmd: "/me <action>", what: "do something (* guest waves)" },
  { cmd: "/slap <nick>", what: "the classic. with a large trout" },
  { cmd: "/nick <newnick>", what: "change your nick" },
  { cmd: "/np", what: "tell everyone what Winamp is playing" },
  { cmd: "/whois <nick>", what: "who is that?" },
  { cmd: "/list", what: "list the channels on the network" },
  { cmd: "/join <#channel>", what: "try another channel" },
  { cmd: "/topic <text>", what: "change the topic (ops only)" },
  { cmd: "/away <reason>", what: "mark yourself away (/back to return)" },
  { cmd: "/ping <nick>", what: "how laggy are they?" },
  { cmd: "/version <nick>", what: "what client are they on?" },
  { cmd: "/dcc send <nick>", what: "send a file. good luck" },
  { cmd: "/clear", what: "clear the window" },
  { cmd: "/quit <message>", what: "disconnect (and dial back in)" },
  { cmd: "!y2k !8ball !seen !time", what: `ask ${BOT}` },
];

export function ChildBar({
  title,
  status = false,
  active,
  onMin,
  onMax,
  onClose,
}: {
  title: string;
  status?: boolean;
  active: boolean;
  onMin: () => void;
  onMax: () => void;
  onClose: () => void;
}) {
  return (
    <div className="irc-childbar" data-active={active ? "" : undefined} onDoubleClick={onMax}>
      <ChannelMark status={status} />
      <span className="truncate">{title}</span>
      <span className="irc-caps">
        <button type="button" className="irc-cap" title="Minimize" onClick={onMin}>
          <Glyph kind="min" />
        </button>
        <button type="button" className="irc-cap" title="Maximize" onClick={onMax}>
          <Glyph kind="max" />
        </button>
        <button type="button" className="irc-cap" title={status ? "Close" : "Part channel"} onClick={onClose}>
          <Glyph kind="close" />
        </button>
      </span>
    </div>
  );
}

/** mIRC's background picture behind the windows, or a drawn night if there's none yet. */
export function MdiBackdrop() {
  const src = art("scene");
  return (
    <div className="irc-mdi-bg" aria-hidden>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" draggable={false} />
      ) : (
        <div className="irc-mdi-night">
          <i className="irc-mdi-hash">#</i>
        </div>
      )}
    </div>
  );
}

/** A faint picture behind the channel text, as mIRC let you set one. */
export function LogBackdrop() {
  const src = art("backdrop");
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="irc-log-bg" draggable={false} />;
}

/** Plain text with URLs underlined, as mIRC drew them. */
export function Text({ text }: { text: string }) {
  const parts = text.split(URL);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="irc-url">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}

export function LogRow({
  row: r,
  born,
  fresh,
  stamps,
  nick,
  me,
  myColor,
  agent,
  mood,
  lastNickAt = 0,
  onCancelDcc,
  onInsert,
  onJoin,
}: {
  row: Row;
  born: Set<string>;
  fresh: boolean;
  stamps: boolean;
  nick: string;
  me: string;
  myColor?: string;
  agent?: ReturnType<typeof getAgent>;
  mood?: Mood;
  lastNickAt?: number;
  onCancelDcc?: (id: number) => void;
  onInsert?: (text: string) => void;
  onJoin?: (ch: string) => void;
}) {
  const animate = !born.has(r.key) || (fresh && !!r.boot);
  const style = animate ? { animationDelay: `${r.stage ?? 0}ms` } : undefined;
  const ts = stamps && r.at > 0 ? <span className="irc-ts">{stamp(r.at)} </span> : stamps ? <span className="irc-ts irc-ts-blank">{stamp(0).replace(/\d/g, " ")} </span> : null;
  const common = { "data-in": animate ? "" : undefined, style };

  switch (r.t) {
    case "msg": {
      const mine = !!r.mine;
      const mode = r.who === nick || r.who === BOT ? "@" : "";
      return (
        <p className="irc-row" data-hl={r.hl ? "" : undefined} {...common}>
          {ts}
          <span className="irc-who">
            &lt;<span style={{ color: nickColor(r.who, nick, mine) }}>{mode}{r.who}</span>&gt;
          </span>{" "}
          <span style={mine && myColor ? { color: myColor } : undefined} data-light={mine && myColor && isLight(myColor) ? "" : undefined}>
            <Text text={r.text} />
          </span>
        </p>
      );
    }
    case "act":
      return (
        <p className="irc-row" data-tone="action" {...common}>
          {ts}* {r.who} <Text text={r.text} />
        </p>
      );
    case "line":
      return (
        <p className="irc-row" data-tone={r.tone} {...common}>
          {ts}
          <Text text={r.text} />
        </p>
      );
    case "pre":
      return (
        <pre className="irc-row irc-pre" {...common}>
          {r.rainbow ? <span className="irc-rainbow block">{r.lines.join("\n")}</span> : r.lines.join("\n")}
        </pre>
      );
    case "dcc":
      return <DccRow row={r} common={common} ts={ts} onCancel={onCancelDcc} />;
    case "whois":
      return r.who === nick && agent ? (
        <div className="irc-row" {...common}>
          <div className="irc-whois">
            <div className="irc-whois-pic">
              {art("nickPicture") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={art("nickPicture")} alt="" />
              ) : (
                <Gpty agent={agent} size={60} mood={mood} />
              )}
            </div>
            <pre>
              {[
                `${nick} is ${NICK.host} * ${NICK.real}`,
                `${nick} on ${NICK.channels}`,
                `${nick} using ${SERVER} ${NETWORK}, est. 1994`,
              ].join("\n")}
              {"\n"}
              <Idle who={nick} since={lastNickAt} />
              {`, signed on ${NICK.since}\n${nick}'s homepage: `}
              <span className="irc-url">{NICK.homepage}</span>
              {"\nEnd of /WHOIS list."}
            </pre>
          </div>
        </div>
      ) : (
        <pre className="irc-row irc-pre" data-tone="info" {...common}>
          {[`${me} is ~${me}@dialup-56k.gpty.lol * a guest`, `${me} on ${CHAN}`, `${me} using ${SERVER} ${NETWORK}, est. 1994`, "End of /WHOIS list."].join("\n")}
        </pre>
      );
    case "help":
      return (
        <div className="irc-row irc-block" {...common}>
          <div className="irc-block-title">mIRC commands (click one to use it)</div>
          {COMMANDS.map((c) => (
            <button key={c.cmd} type="button" onClick={() => onInsert?.(c.cmd.startsWith("!") ? "!y2k" : `${c.cmd.split(" ")[0]} `)}>
              <span className="irc-block-cmd">{c.cmd}</span>
              <span>{c.what}</span>
            </button>
          ))}
          <div className="irc-block-foot">Tab completes nicks · ↑ recalls · Ctrl+K colors · Esc interrupts {nick}</div>
        </div>
      );
    case "list":
      return (
        <div className="irc-row irc-block" {...common}>
          <div className="irc-block-title">Channels List: {CHANNELS.length} channels on {NETWORK}</div>
          {CHANNELS.map((c) => (
            <button key={c.name} type="button" onClick={() => onJoin?.(c.name)}>
              <span className="irc-block-cmd">{c.name}</span>
              <span className="irc-block-num">{c.users}</span>
              <span className="truncate">{c.topic}</span>
            </button>
          ))}
        </div>
      );
  }
}

const isLight = (hex: string) => ["#ffffff", "#ffff00", "#00fc00", "#00ffff", "#d2d2d2"].includes(hex);

/** A file that waits, crawls along at 2.1 KB/s, and fails. */
export function DccRow({
  row,
  common,
  ts,
  onCancel,
}: {
  row: Extract<Row, { t: "dcc" }>;
  common: Record<string, unknown>;
  ts: React.ReactNode;
  onCancel?: (id: number) => void;
}) {
  const f = row.file;
  const status = {
    waiting: `waiting for ${f.to} to accept...`,
    sending: "2.1 KB/s · 26 mins left",
    failed: `failed: connection reset by peer (${f.to} is behind a firewall)`,
    canceled: "you canceled this transfer",
  }[f.state];
  const open = f.state === "waiting" || f.state === "sending";
  return (
    <div className="irc-row" data-tone="ctcp" {...common}>
      {ts}* DCC Send of <b>{f.name}</b> ({f.size}) to {f.to}
      <div className="irc-dcc" data-state={f.state}>
        <div className="irc-dcc-bar">
          <i />
        </div>
        <span className="truncate">{status}</span>
        {open && (
          <button type="button" className="irc-btn irc-btn-sm" onClick={() => onCancel?.(row.id)}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export function MenuList({
  items,
  onPick,
  className = "",
  style,
  title,
}: {
  items: Item[];
  onPick: (it: Item) => void;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}) {
  return (
    <div className={`irc-pop irc-menu ${className}`} role="menu" style={style} aria-label={title}>
      {title && <div className="irc-menu-title">{title}</div>}
      {items.map((it, i) =>
        it === "-" ? (
          <span key={i} className="irc-menu-sep" role="separator" />
        ) : (
          <button
            key={it.label}
            type="button"
            role={it.checked === undefined ? "menuitem" : "menuitemcheckbox"}
            aria-checked={it.checked}
            disabled={it.disabled}
            onClick={() => onPick(it)}
          >
            <span className="irc-check">{it.checked ? "✓" : ""}</span>
            <span className="flex-1 truncate">{it.label}</span>
            {it.hint && <span className="irc-hint">{it.hint}</span>}
          </button>
        ),
      )}
    </div>
  );
}

export function Palette({ current, onPick }: { current: number | null; onPick: (c: number | null) => void }) {
  return (
    <div className="irc-pop irc-palette" role="dialog" aria-label="Text color">
      <div className="irc-palette-grid">
        {PALETTE.map((c, i) => (
          <button key={c} type="button" aria-label={`Color ${i}`} aria-pressed={current === i} style={{ background: c }} onClick={() => onPick(i)}>
            <span style={{ color: isLight(c) || i === 15 ? "#000" : "#fff" }}>{i}</span>
          </button>
        ))}
      </div>
      <button type="button" className="irc-btn irc-btn-sm w-full" onClick={() => onPick(null)}>
        Default
      </button>
    </div>
  );
}

/** The registration nag, which everyone clicked through for years. */
export function NagDialog({ onClose }: { onClose: () => void }) {
  const [asked, setAsked] = useState(false);
  const ok = useRef<HTMLButtonElement>(null);
  const [days] = useState(() => trialDays(Date.now()));
  useEffect(() => ok.current?.focus(), []);
  return (
    <div className="irc-dialog-wrap" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="irc-dialog irc-pop" role="dialog" aria-modal="true" aria-label="About mIRC">
        <div className="irc-childbar" data-active="">
          <MircMark className="h-3.5 w-3.5" />
          <span className="truncate">About mIRC</span>
          <span className="irc-caps">
            <button type="button" className="irc-cap" aria-label="Close" onClick={onClose}>
              <Glyph kind="close" />
            </button>
          </span>
        </div>
        <div className="irc-dialog-body">
          <Warn className="h-9 w-9 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold">mIRC is shareware.</p>
            {asked ? (
              <p>Thank you! Please mail a check and allow 6 to 8 weeks for your registration code to arrive.</p>
            ) : (
              <p>
                You are on day <b>{days.toLocaleString("en-US")}</b> of your 30-day evaluation period. If you like mIRC, please register it!
              </p>
            )}
            <p className="irc-dialog-fine">mIRC32 v5.61 · Y2K compliant · 1999</p>
          </div>
        </div>
        <div className="irc-dialog-btns">
          {!asked && (
            <button type="button" className="irc-btn" onClick={() => setAsked(true)}>
              Register
            </button>
          )}
          <button ref={ok} type="button" className="irc-btn irc-btn-default" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export function OptionsDialog({
  me,
  prefs,
  busy,
  onClose,
  onApply,
}: {
  me: string;
  prefs: Prefs;
  busy: boolean;
  onClose: () => void;
  onApply: (p: Partial<Prefs>, nick: string) => void;
}) {
  const [nickname, setNickname] = useState(me);
  const [p, setP] = useState(prefs);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => field.current?.select(), []);
  const ok = () => {
    onApply(p, nickname.trim());
    onClose();
  };
  const box = (k: keyof Prefs, label: string) => (
    <label className="irc-checkbox">
      <input type="checkbox" checked={!!p[k]} onChange={(e) => setP({ ...p, [k]: e.target.checked })} />
      {label}
    </label>
  );
  return (
    <div className="irc-dialog-wrap" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <form
        className="irc-dialog irc-pop"
        role="dialog"
        aria-modal="true"
        aria-label="mIRC Options"
        onSubmit={(e) => {
          e.preventDefault();
          ok();
        }}
      >
        <div className="irc-childbar" data-active="">
          <ToolIcon id="options" className="h-3.5 w-3.5" />
          <span className="truncate">mIRC Options</span>
          <span className="irc-caps">
            <button type="button" className="irc-cap" aria-label="Close" onClick={onClose}>
              <Glyph kind="close" />
            </button>
          </span>
        </div>
        <div className="irc-options">
          <fieldset>
            <legend>Connect</legend>
            <label className="irc-field">
              Nickname:
              <input ref={field} value={nickname} maxLength={16} onChange={(e) => setNickname(e.target.value.replace(/\s/g, ""))} disabled={busy} />
            </label>
            <span className="irc-dialog-fine">Server: {SERVER} ({PORT}) · {NETWORK}</span>
          </fieldset>
          <fieldset>
            <legend>Display</legend>
            {box("stamps", "Timestamp lines")}
            {box("joins", "Show joins, parts and quits")}
            {box("nicks", "Show nick list")}
            {box("toolbar", "Show toolbar")}
            {box("switchbar", "Show switchbar")}
          </fieldset>
          <fieldset>
            <legend>Your text color</legend>
            <div className="irc-palette-grid irc-palette-inline">
              {PALETTE.map((c, i) => (
                <button key={c} type="button" aria-label={`Color ${i}`} aria-pressed={p.color === i} style={{ background: c }} onClick={() => setP({ ...p, color: p.color === i ? null : i })} />
              ))}
            </div>
          </fieldset>
        </div>
        <div className="irc-dialog-btns">
          <button type="submit" className="irc-btn irc-btn-default">
            OK
          </button>
          <button type="button" className="irc-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export function OnlineTimer({ since, off }: { since: number; off: boolean }) {
  const now = useNow(1000);
  return (
    <span className="irc-online" title="Online timer">
      Online: {off ? "--:--:--" : hms(now - since)}
    </span>
  );
}

/** Lag that wanders, and spikes while Nick thinks. */
export function Lag({ busy, waiting, off }: { busy: boolean; waiting: boolean; off: boolean }) {
  const now = useNow(1500);
  const base = 0.32 + Math.abs(Math.sin(now / 9_000)) * 0.5 + Math.abs(Math.sin(now / 2_300)) * 0.2;
  const lag = waiting ? base + 1.6 : busy ? base + 0.4 : base;
  return (
    <span className="irc-panel irc-lag" data-bad={lag > 1.5 ? "" : undefined}>
      Lag: {off ? "--" : `${lag.toFixed(2)}s`}
    </span>
  );
}

export function Y2K() {
  const now = useNow(1000);
  const left = y2kLeft(now);
  return <span className="tabular-nums">{left ? countdown(left) : "we survived!"}</span>;
}

/** The system tray: the two-monitor modem icon and the clock. */
export function Tray({ tx, rx, streaming, off }: { tx: number; rx: number; streaming: boolean; off: boolean }) {
  const now = useNow(250);
  // Keepalive: the server PINGs, you PONG, every so often.
  const ping = Math.floor(now / 1000) % 17 === 0;
  const flicker = streaming && Math.floor(now / 250) % 3 !== 0;
  return (
    <span className="irc-panel irc-tray" title={off ? "Dialing..." : "Connected at 49,333 bps"}>
      <Modem tx={!off && (now - tx < 450 || ping)} rx={!off && (now - rx < 450 || flicker || (ping && Math.floor(now / 250) % 4 === 1))} />
      <time>{new Date(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
    </span>
  );
}

/** "has been idle 12secs", counting. */
function Idle({ who, since }: { who: string; since: number }) {
  const now = useNow(1000);
  const [opened] = useState(() => Date.now());
  const secs = Math.max(1, Math.round((now - (since || opened - 4000)) / 1000));
  return <>{`${who} has been idle ${secs}secs`}</>;
}

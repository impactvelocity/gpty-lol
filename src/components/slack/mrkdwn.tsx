"use client";

import { Fragment, type ReactNode } from "react";
import { Custom, type CustomEmoji } from "./art";

/**
 * Slack's own little markup, as it rendered in 2014: *bold*, _italics_,
 * ~strike~, `code`, ```preformatted```, >quotes, :emoji: shortcodes,
 * @mentions, #channels and bare links.
 */

/**
 * Shortcodes that existed in early 2014. Unicode 6 only: no :hotdog:, :taco:,
 * :burrito:, :robot_face: or :thinking_face: until 2015, so they stay as text.
 */
const EMOJI: Record<string, string> = {
  smile: "😄", smiley: "😃", grinning: "😀", blush: "😊", wink: "😉", heart_eyes: "😍", kissing_heart: "😘",
  joy: "😂", sweat_smile: "😅", laughing: "😆", satisfied: "😆", stuck_out_tongue: "😛",
  stuck_out_tongue_winking_eye: "😜", sunglasses: "😎", smirk: "😏", neutral_face: "😐", expressionless: "😑",
  unamused: "😒", sweat: "😓", pensive: "😔", confused: "😕", disappointed: "😞", worried: "😟", angry: "😠",
  rage: "😡", cry: "😢", sob: "😭", scream: "😱", fearful: "😨", grimacing: "😬", no_mouth: "😶", sleeping: "😴",
  sleepy: "😪", mask: "😷", innocent: "😇", smiling_imp: "😈", flushed: "😳", open_mouth: "😮", astonished: "😲",
  weary: "😩", tired_face: "😫", relieved: "😌", yum: "😋", triumph: "😤", dizzy_face: "😵",
  see_no_evil: "🙈", hear_no_evil: "🙉", speak_no_evil: "🙊",
  "+1": "👍", thumbsup: "👍", "-1": "👎", thumbsdown: "👎", ok_hand: "👌", clap: "👏", raised_hands: "🙌",
  pray: "🙏", wave: "👋", muscle: "💪", point_up: "☝️", point_down: "👇", point_left: "👈", point_right: "👉",
  v: "✌️", fist: "✊", punch: "👊", facepunch: "👊", eyes: "👀", bow: "🙇", dancer: "💃", runner: "🏃",
  tada: "🎉", confetti_ball: "🎊", balloon: "🎈", birthday: "🎂", gift: "🎁", rocket: "🚀", fire: "🔥",
  sparkles: "✨", star: "⭐", star2: "🌟", zap: "⚡", boom: "💥", collision: "💥", "100": "💯",
  heart: "❤️", broken_heart: "💔", purple_heart: "💜", blue_heart: "💙", green_heart: "💚", yellow_heart: "💛",
  white_check_mark: "✅", heavy_check_mark: "✔️", x: "❌", warning: "⚠️", question: "❓", exclamation: "❗",
  bulb: "💡", memo: "📝", pencil: "📝", email: "📧", "e-mail": "📧", envelope: "✉️", inbox_tray: "📥",
  outbox_tray: "📤", phone: "☎️", telephone: "☎️", iphone: "📱", computer: "💻", calendar: "📆", date: "📅",
  chart_with_upwards_trend: "📈", chart_with_downwards_trend: "📉", bar_chart: "📊", moneybag: "💰",
  dollar: "💵", money_with_wings: "💸", briefcase: "💼", office: "🏢", coffee: "☕", tea: "🍵", beer: "🍺",
  beers: "🍻", wine_glass: "🍷", cocktail: "🍸", pizza: "🍕", hamburger: "🍔", fries: "🍟", cake: "🍰",
  cookie: "🍪", doughnut: "🍩", fork_and_knife: "🍴", ramen: "🍜", sushi: "🍣", apple: "🍎", banana: "🍌",
  snowflake: "❄️", snowman: "⛄", sunny: "☀️", umbrella: "☔", cloud: "☁️", rainbow: "🌈", ocean: "🌊",
  cat: "🐱", dog: "🐶", monkey: "🐒", monkey_face: "🐵", penguin: "🐧", bird: "🐦", unicorn_face: "🦄",
  poop: "💩", hankey: "💩", shit: "💩", ghost: "👻", skull: "💀", alien: "👽", trophy: "🏆", soccer: "⚽",
  football: "🏈", basketball: "🏀", video_game: "🎮", musical_note: "🎵", notes: "🎶", headphones: "🎧",
  microphone: "🎤", movie_camera: "🎥", camera: "📷", tv: "📺", bell: "🔔", mega: "📣", loudspeaker: "📢",
  lock: "🔒", key: "🔑", hammer: "🔨", wrench: "🔧", gear: "⚙️", link: "🔗", paperclip: "📎", pushpin: "📌",
  clipboard: "📋", hourglass: "⌛", alarm_clock: "⏰", watch: "⌚", crescent_moon: "🌙", earth_americas: "🌎",
  sweat_drops: "💦", dash: "💨", zzz: "💤", speech_balloon: "💬", thought_balloon: "💭", ok: "🆗", new: "🆕",
  cool: "🆒", up: "🆙", sos: "🆘", crown: "👑", tophat: "🎩", ring: "💍", gem: "💎", moyai: "🗿",
  sun_with_face: "🌞", stars: "🌠", house: "🏠", car: "🚗", airplane: "✈️", ship: "🚢", rotating_light: "🚨",
  construction: "🚧", checkered_flag: "🏁", triangular_flag_on_post: "🚩", mailbox: "📫", package: "📦",
  bookmark: "🔖", books: "📚", newspaper: "📰", floppy_disk: "💾", cd: "💿", dvd: "📀", battery: "🔋",
  electric_plug: "🔌", mag: "🔍", wrench_and_hammer: "🛠", chocolate_bar: "🍫", candy: "🍬", lollipop: "🍭",
};

const CUSTOM = new Set<CustomEmoji>(["simple_smile", "synergy", "rip-email", "paradigm", "shipit-friday"]);

/** The emoji menu: the ones people actually used, then the team's own. */
export const PICKER: string[] = [
  "simple_smile", "smile", "joy", "wink", "sweat_smile", "sunglasses", "heart_eyes", "grimacing", "no_mouth",
  "expressionless", "unamused", "disappointed", "scream", "sob", "see_no_evil", "+1", "-1", "ok_hand", "clap",
  "raised_hands", "pray", "wave", "muscle", "eyes", "tada", "rocket", "fire", "sparkles", "zap", "100", "heart",
  "white_check_mark", "x", "warning", "bulb", "memo", "email", "chart_with_upwards_trend", "coffee", "beers",
  "pizza", "birthday", "trophy", "rotating_light", "construction", "floppy_disk", "poop", "ghost", "cat", "dog",
];
export const PICKER_CUSTOM: CustomEmoji[] = ["synergy", "rip-email", "paradigm", "shipit-friday"];

export function emojiFor(code: string): ReactNode | null {
  if (CUSTOM.has(code as CustomEmoji)) return <Custom id={code as CustomEmoji} />;
  const e = EMOJI[code];
  return e ? (
    <span className="sl-emoji sl-emoji-u" role="img" aria-label={`:${code}:`}>
      {e}
    </span>
  ) : null;
}

/* ───────── Rendering ───────── */

export interface MrkdwnProps {
  text: string;
  /** Your username, so mentions of you can glow. */
  me?: string;
  /** Clicking a #channel goes there, if it exists. */
  onChannel?: (name: string) => void;
  channels?: Set<string>;
}

/** The text a word can sit next to, for *bold* and friends to count as markup. */
const OPEN = String.raw`(?<=^|[\s(>"'\[])`;
const CLOSE = String.raw`(?=$|[\s.,!?;:)'"\]])`;
const INLINE = new RegExp(
  [
    "(`[^`\\n]+`)",
    `${OPEN}\\*(?=\\S)([^*\\n]*?\\S)\\*${CLOSE}`,
    `${OPEN}_(?=\\S)([^_\\n]*?\\S)_${CLOSE}`,
    `${OPEN}~(?=\\S)([^~\\n]*?\\S)~${CLOSE}`,
    "(:[a-z0-9_+\\-]+:)",
    "((?<![\\w/@])@(?:channel|everyone|group|here|[a-z][a-z0-9._-]*[a-z0-9]))",
    "((?<![\\w&/#])#[a-z0-9][a-z0-9_-]*[a-z0-9])",
    "(https?:\\/\\/[^\\s<>]+[^\\s<>.,!?;:)'\"])",
  ].join("|"),
  "gi",
);

function inline(text: string, p: MrkdwnProps, key = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const k = `${key}.${n++}`;
    const [all, code, bold, ital, strike, emoji, mention, channel, url] = m;
    if (code) out.push(<code key={k} className="sl-code">{code.slice(1, -1)}</code>);
    else if (bold) out.push(<b key={k}>{inline(bold, p, k)}</b>);
    else if (ital) out.push(<i key={k}>{inline(ital, p, k)}</i>);
    else if (strike) out.push(<s key={k}>{inline(strike, p, k)}</s>);
    else if (emoji) out.push(emojiFor(emoji.slice(1, -1).toLowerCase()) ? <Fragment key={k}>{emojiFor(emoji.slice(1, -1).toLowerCase())}</Fragment> : all);
    else if (mention) {
      const name = mention.slice(1).toLowerCase();
      const loud = ["channel", "everyone", "group", "here"].includes(name);
      const mine = !!p.me && name === p.me.toLowerCase();
      out.push(
        <span key={k} className="sl-mention" data-me={mine || loud ? "" : undefined}>
          {mention}
        </span>,
      );
    } else if (channel) {
      const name = channel.slice(1).toLowerCase();
      out.push(
        p.onChannel && p.channels?.has(name) ? (
          <button key={k} type="button" className="sl-chanlink" onClick={() => p.onChannel?.(name)}>
            {channel}
          </button>
        ) : (
          <span key={k} className="sl-chanlink">
            {channel}
          </span>
        ),
      );
    } else if (url) {
      out.push(
        <a key={k} href={url} target="_blank" rel="noreferrer noopener" className="sl-link">
          {url.replace(/^https?:\/\//, "")}
        </a>,
      );
    } else out.push(all);
    last = at + all.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Text with Slack's markup drawn the way Slack drew it. */
export function Mrkdwn(p: MrkdwnProps) {
  // ```preformatted``` blocks first; nothing inside them is markup.
  const parts = p.text.split(/```\n?/);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          return (
            <pre key={i} className="sl-pre">
              {part.replace(/\n$/, "")}
            </pre>
          );
        }
        // Lines starting with ">" become a quote; the rest is plain text.
        const blocks: { quote: boolean; lines: string[] }[] = [];
        for (const line of part.split("\n")) {
          const quote = /^>\s?/.test(line) || /^&gt;\s?/.test(line);
          const body = quote ? line.replace(/^(>|&gt;)\s?/, "") : line;
          const prev = blocks.at(-1);
          if (prev && prev.quote === quote) prev.lines.push(body);
          else blocks.push({ quote, lines: [body] });
        }
        return blocks.map((b, j) =>
          b.quote ? (
            <blockquote key={`${i}.${j}`} className="sl-quote">
              {inline(b.lines.join("\n"), p, `${i}.${j}`)}
            </blockquote>
          ) : (
            <Fragment key={`${i}.${j}`}>{inline(trimJoin(b.lines, i, j, blocks.length, parts.length), p, `${i}.${j}`)}</Fragment>
          ),
        );
      })}
    </>
  );
}

/** Plain lines between a quote or a code block lose the newline that touches it. */
function trimJoin(lines: string[], i: number, j: number, nBlocks: number, nParts: number) {
  let s = lines.join("\n");
  if (j > 0) s = s.replace(/^\n/, "");
  if (j < nBlocks - 1 || i < nParts - 1) s = s.replace(/\n$/, "");
  return s;
}

/** The text with markup stripped, for notifications and the sidebar. */
export function plain(text: string) {
  return text
    .replace(/```/g, "")
    .replace(/(^|\s)[*_~](\S[^*_~\n]*?\S|\S)[*_~](?=\s|$|[.,!?])/g, "$1$2")
    .replace(/:([a-z0-9_+\-]+):/gi, (all, c: string) => {
      const e = EMOJI[c.toLowerCase()];
      return e ?? (CUSTOM.has(c.toLowerCase() as CustomEmoji) ? "🙂" : all);
    })
    .replace(/`/g, "")
    .replace(/^>\s?/gm, "")
    .trim();
}

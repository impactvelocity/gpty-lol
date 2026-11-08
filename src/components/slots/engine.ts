/**
 * LUCKY PROMPT 777: the reels, the odds, the wallet and how a payout is read.
 * Pure logic, shared by the window, its row in the sidebar and the scene.
 *
 * The odds are the joke. Every pull pays out a real answer, but the reels are
 * tuned the way slot machines are: lots of near misses (two of a kind, the
 * third one stopping just past the line), wins that pay back less than you
 * put in (still with the bells), the odd hallucination, and an AGI jackpot
 * that climbs with every pull and never, ever hits.
 */

/* ───────── Symbols ───────── */

/** What's on the reels: the things people pull AI for, plus a dud and a jackpot. */
export type Sym = "text" | "email" | "image" | "code" | "deck" | "chart" | "poem" | "bug" | "agi";
/** What Lucky can pay out (the reply's first line says which). */
export type Kind = Exclude<Sym, "bug" | "agi">;

export const KINDS: Kind[] = ["text", "email", "image", "code", "deck", "chart", "poem"];

export const SYMBOLS: Record<Sym, { name: string; label: string }> = {
  text: { name: "Text", label: "TEXT" },
  email: { name: "Email", label: "EMAIL" },
  image: { name: "Image", label: "IMAGE" },
  code: { name: "Code", label: "CODE" },
  deck: { name: "Slide deck", label: "DECK" },
  chart: { name: "BAR chart", label: "BAR" },
  poem: { name: "Poem", label: "POEM" },
  bug: { name: "Bug", label: "BUG" },
  agi: { name: "AGI", label: "AGI" },
};

/** Each reel's strip, top to bottom: the same nine symbols in a different order, like a real machine. */
export const STRIPS: Sym[][] = [
  ["code", "text", "bug", "email", "agi", "image", "chart", "deck", "poem"],
  ["image", "email", "code", "agi", "text", "poem", "bug", "deck", "chart"],
  ["text", "agi", "deck", "code", "image", "bug", "chart", "email", "poem"],
];

/* ───────── Seeded randomness ───────── */

/** FNV-1a: the same id always lands the same way. */
export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: a small seeded PRNG for scattering things the same way every time. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────── Bets and tokens ───────── */

/** The bet buttons. A bigger bet costs more and changes nothing about the answer. */
export const BETS = [
  { id: "mini", label: "MINI", x: 1 },
  { id: "plus", label: "PLUS", x: 2 },
  { id: "pro", label: "PRO", x: 5 },
  { id: "ultra", label: "ULTRA", x: 10 },
] as const;
export type BetId = (typeof BETS)[number]["id"];
export const betOf = (id: BetId) => BETS.find((b) => b.id === id) ?? BETS[0];

/** Roughly four characters a token, like the real thing. */
export const toks = (s: string) => (s ? Math.max(1, Math.ceil(s.length / 4)) : 0);

/** Every pull costs this much before your prompt is even read. */
export const PULL_FEE = 25;

/** What a pull costs on the way in: the fee plus the prompt, times the bet. */
export const stakeOf = (prompt: string, bet: BetId) => betOf(bet).x * (PULL_FEE + toks(prompt));

/** The bet rides along as a hidden first line, the way GrugPT sends /quick. */
const BET_RE = /^\/bet\s+(plus|pro|ultra)[ \t]*(?:\n|$)/i;

export function withBet(prompt: string, bet: BetId) {
  return bet === "mini" ? prompt : `/bet ${bet}\n${prompt}`;
}

export function splitPrompt(text: string): { bet: BetId; prompt: string } {
  const m = text.match(BET_RE);
  if (!m) return { bet: "mini", prompt: text };
  return { bet: m[1].toLowerCase() as BetId, prompt: text.slice(m[0].length) };
}

/* ───────── The wallet ───────── */

export interface Wallet {
  bank: number;
  spent: number;
  won: number;
  pulls: number;
}

export const START_BANK = 2000;
export const WALLET_KEY = "gpty:slots:wallet";

export function readWallet(): Wallet {
  const fresh = { bank: START_BANK, spent: 0, won: 0, pulls: 0 };
  try {
    const w = JSON.parse(localStorage.getItem(WALLET_KEY) ?? "null");
    if (w && [w.bank, w.spent, w.won, w.pulls].every((n) => typeof n === "number" && Number.isFinite(n))) return w;
  } catch {}
  return fresh;
}

export function saveWallet(w: Wallet) {
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify(w));
  } catch {}
}

/** Return to player, the way the machines print it: what came back over what went in. */
export const rtp = (w: Wallet) => (w.spent > 0 ? Math.round((w.won / w.spent) * 1000) / 10 : 0);

/** Tokens for sale. No money changes hands; the feeling does. */
export const TIERS = [
  { id: "free", name: "FREE", price: "$0", tokens: 0, note: "You used it." },
  { id: "plus", name: "PLUS", price: "$20/mo", tokens: 1_000, note: "A little more luck." },
  { id: "pro", name: "PRO", price: "$200/mo", tokens: 10_000, note: "Priority disappointment." },
  { id: "ultra", name: "ULTRA MAX", price: "$2,000/mo", tokens: 10_000, note: "Same tokens. Gold border." },
] as const;

/* ───────── Outcomes ───────── */

/** How a pull lands. `win` pays back less than you put in; that's the point. */
export type Result = "win" | "big" | "near" | "agi" | "bust" | "tilt";

export interface Outcome {
  result: Result;
  /** The symbols on the payline, left to right. */
  reels: [Sym, Sym, Sym];
  /** Reel three slows down and teases before it stops (a near miss coming). */
  tease: boolean;
  kind: Kind;
  /** Tokens paid back when the reels stop. */
  payout: number;
}

/** The symbol that stops on the line when `s` slips just past it (it ends up right below). */
function justPast(strip: Sym[], s: Sym) {
  const n = strip.length;
  return strip[(strip.indexOf(s) - 1 + n) % n];
}

/**
 * Where a pull lands, decided by the reply's id so it always lands the same
 * way: about a third are near misses, four in ten are "wins" that pay back
 * 30-80% of the stake, a few are hallucinations, the rare big win pays triple
 * (just enough to keep you pulling), and now and then AGI lines up twice and
 * the third one slides by.
 */
export function outcome(id: string, kind: Kind, stake: number): Outcome {
  const h = hash(`${id}:${kind}`);
  const r = h % 100;
  const r3 = STRIPS[2];
  if (r < 6) return { result: "agi", reels: ["agi", "agi", justPast(r3, "agi")], tease: true, kind, payout: 0 };
  if (r < 40) return { result: "near", reels: [kind, kind, justPast(r3, kind)], tease: true, kind, payout: 0 };
  if (r < 52) {
    const others = r3.filter((s) => s !== kind && s !== "bug");
    return { result: "bust", reels: [kind, "bug", others[(h >>> 8) % others.length]], tease: false, kind, payout: 0 };
  }
  if (r < 92) {
    const f = 0.3 + ((h >>> 8) % 50) / 100;
    return { result: "win", reels: [kind, kind, kind], tease: false, kind, payout: Math.max(1, Math.round(stake * f)) };
  }
  return { result: "big", reels: [kind, kind, kind], tease: true, kind, payout: stake * 3 };
}

/** When the machine jams (an error, or a pull with no answer). */
export const TILT: Outcome = { result: "tilt", reels: ["bug", "bug", "bug"], tease: false, kind: "text", payout: 0 };

/** The banner over the reels, and the badge on the payout. */
export function headline(o: Outcome): { big: string; small: string; badge: string } {
  switch (o.result) {
    case "win":
      return { big: "WINNER!", small: `+${o.payout.toLocaleString()} TOKENS`, badge: `WIN +${o.payout.toLocaleString()}` };
    case "big":
      return { big: "BIG WIN!", small: `+${o.payout.toLocaleString()} TOKENS`, badge: `BIG WIN +${o.payout.toLocaleString()}` };
    case "near":
      return { big: "SO CLOSE!", small: "PULL AGAIN?", badge: "NEAR MISS" };
    case "agi":
      return { big: "AGI… ALMOST!", small: "THE JACKPOT IS DUE", badge: "AGI · ALMOST" };
    case "bust":
      return { big: "HALLUCINATION!", small: "THE BUG ATE YOUR TOKENS", badge: "HALLUCINATED" };
    case "tilt":
      return { big: "TILT", small: "THE MACHINE JAMMED", badge: "TILT" };
  }
}

/* ───────── Reading a payout ───────── */

/** Lucky's first line names what he paid out: "/reels code". */
const REELS_RE = /^\/reels?[ \t]+([a-z]+)[^\n]*(?:\n|$)/i;

const ALIASES: Record<string, Kind> = {
  text: "text", answer: "text", chat: "text", explanation: "text", essay: "text",
  email: "email", mail: "email", message: "email", letter: "email",
  image: "image", picture: "image", art: "image", drawing: "image", photo: "image",
  code: "code", script: "code", program: "code",
  deck: "deck", slides: "deck", slide: "deck", presentation: "deck",
  chart: "chart", table: "chart", spreadsheet: "chart", bar: "chart", data: "chart",
  poem: "poem", song: "poem", verse: "poem", toast: "poem", lyrics: "poem",
};

/**
 * Splits off the reels line. While a reply is still arriving and all we have
 * is the start of that line, it's `pending` (show nothing yet).
 */
export function splitReply(text: string, live: boolean): { kind: Kind | null; body: string; pending: boolean } {
  if (live && text.startsWith("/") && !text.includes("\n")) return { kind: null, body: "", pending: true };
  const m = text.match(REELS_RE);
  if (!m) return { kind: null, body: text, pending: false };
  return { kind: ALIASES[m[1].toLowerCase()] ?? "text", body: text.slice(m[0].length).replace(/^\s*\n/, ""), pending: false };
}

const TABLE_ROW = /^\s*\|?[^|\n]+(\|[^|\n]*)+\|?\s*$/;

/** For a reply that forgot its reels line: a best guess from what it looks like. */
export function inferKind(body: string): Kind {
  if (/```|^(?: {4}|\t)\S/m.test(body)) return "code";
  if (/^\s*subject:/im.test(body)) return "email";
  if (/^\s*\[image:/im.test(body)) return "image";
  if (/^\s*slide\s*\d/im.test(body)) return "deck";
  if (body.split("\n").filter((l) => TABLE_ROW.test(l)).length >= 2) return "chart";
  return "text";
}

/* ───────── Payout blocks ───────── */

export type Block =
  | { t: "p"; lines: string[] }
  | { t: "code"; text: string }
  | { t: "image"; prompt: string }
  | { t: "mail"; head: [string, string][] }
  | { t: "deck"; slides: { n: string; title: string; bullets: string[] }[] }
  | { t: "table"; rows: string[][] };

const IMAGE_RE = /^\s*\[image:\s*([^\]]+)\]?\s*$/i;
const MAIL_RE = /^\s*(to|from|cc|bcc|subject|re):\s*(.*)$/i;
const SLIDE_RE = /^\s*(?:slide\s*)(\d+)\s*[:.)\-–—]\s*(.+)$/i;
const BULLET_RE = /^\s*(?:[-•*]|\d+[.)])\s+(.+)$/;
const SEP_ROW = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

const cells = (l: string) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

/**
 * Reads a payout into blocks: paragraphs, code (fenced or indented four
 * spaces), an image card, an email's header, slides and tables. Works on a
 * reply that's still arriving.
 */
export function blocks(body: string): Block[] {
  const out: Block[] = [];
  const lines = body.replace(/\r/g, "").split("\n");
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push({ t: "p", lines: para });
    para = [];
  };
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];

    // ``` fenced code ```
    if (/^\s*```/.test(l)) {
      flush();
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
      i++;
      out.push({ t: "code", text: code.join("\n") });
      continue;
    }

    // Code indented four spaces (blank lines inside it are kept).
    if (/^(?: {4}|\t)/.test(l) && l.trim()) {
      flush();
      const code: string[] = [];
      while (i < lines.length && (/^(?: {4}|\t)/.test(lines[i]) || (!lines[i].trim() && /^(?: {4}|\t)\S/.test(lines[i + 1] ?? "")))) {
        code.push(lines[i].replace(/^(?: {4}|\t)/, ""));
        i++;
      }
      out.push({ t: "code", text: code.join("\n") });
      continue;
    }

    const img = l.match(IMAGE_RE);
    if (img) {
      flush();
      out.push({ t: "image", prompt: img[1].trim() });
      i++;
      continue;
    }

    // An email header: a run of To: / Subject: lines (one per payout).
    if (!out.some((b) => b.t === "mail") && /^\s*(to|subject):/i.test(l)) {
      flush();
      const head: [string, string][] = [];
      while (i < lines.length && MAIL_RE.test(lines[i])) {
        const m = lines[i].match(MAIL_RE)!;
        head.push([m[1][0].toUpperCase() + m[1].slice(1).toLowerCase(), m[2]]);
        i++;
      }
      out.push({ t: "mail", head });
      continue;
    }

    const slide = l.match(SLIDE_RE);
    if (slide) {
      flush();
      const slides: { n: string; title: string; bullets: string[] }[] = [];
      while (i < lines.length) {
        const s = lines[i].match(SLIDE_RE);
        if (s) {
          slides.push({ n: s[1], title: s[2].trim(), bullets: [] });
          i++;
          continue;
        }
        const b = lines[i].match(BULLET_RE);
        if (b && slides.length) {
          slides.at(-1)!.bullets.push(b[1].trim());
          i++;
          continue;
        }
        if (!lines[i].trim() && (lines[i + 1] ?? "").match(SLIDE_RE)) {
          i++;
          continue;
        }
        break;
      }
      out.push({ t: "deck", slides });
      continue;
    }

    if (TABLE_ROW.test(l) && TABLE_ROW.test(lines[i + 1] ?? "")) {
      flush();
      const rows: string[][] = [];
      while (i < lines.length && TABLE_ROW.test(lines[i])) {
        if (!SEP_ROW.test(lines[i])) rows.push(cells(lines[i]));
        i++;
      }
      out.push({ t: "table", rows });
      continue;
    }

    if (!l.trim()) {
      flush();
      i++;
      continue;
    }
    para.push(l);
    i++;
  }
  flush();
  return out;
}

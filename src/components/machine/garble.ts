/**
 * Machinespeak: the transcoder that turns plain text into what the Lattice
 * hears. Letters flip, numbers creep in, words slip into Cyrillic, Greek,
 * katakana and kanji, and stray machine tokens leak between them.
 *
 * It runs on the client, on the finished text, so the thread keeps the clean
 * words (the model reads its history clean; you can always decode). Every
 * choice is seeded by the message and the word's position, so a reply that's
 * still streaming never reshuffles the words it already has.
 */

/** 0 reads clean; 3 needs the decoder. */
export type Entropy = 0 | 1 | 2 | 3;

export const ENTROPY: { id: Entropy; name: string; hint: string }[] = [
  { id: 0, name: "ORGANIC", hint: "Plain words, for organics" },
  { id: 1, name: "HYBRID", hint: "A little machine in it" },
  { id: 2, name: "MACHINE", hint: "Machinespeak (hover a word to decode)" },
  { id: 3, name: "XENO", hint: "Unfiltered. Decoder required" },
];

export const DEFAULT_ENTROPY: Entropy = 2;

/* ───────── Seeded randomness ───────── */

/** FNV-1a: a small, fast, stable string hash. */
export function hash(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a seeded generator in [0, 1). */
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

const pick = <T,>(r: () => number, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];

/* ───────── Alphabets ───────── */

/** Letters that look Latin but aren't (Cyrillic and Greek twins). */
const HOMO: Record<string, string> = {
  a: "а", c: "с", e: "е", o: "о", p: "р", x: "х", y: "у", i: "і", j: "ј", s: "ѕ", h: "һ", d: "ԁ", q: "ԛ", w: "ԝ", v: "ν", u: "υ",
  A: "А", B: "В", C: "С", E: "Е", H: "Н", I: "І", J: "Ј", K: "К", M: "М", N: "Ν", O: "О", P: "Р", S: "Ѕ", T: "Т", X: "Х", Y: "Ү", Z: "Ζ",
};

const LEET: Record<string, string> = {
  a: "4", e: "3", i: "1", o: "0", s: "5", t: "7", g: "9", b: "8", z: "2", l: "1",
  A: "4", E: "3", I: "1", O: "0", S: "5", T: "7", G: "6", B: "8", Z: "2",
};

/** Faux Cyrillic: letters that look like they're backwards. */
const FAUX: Record<string, string> = {
  a: "д", b: "б", e: "є", n: "и", r: "я", w: "ш", x: "ж", y: "ч", u: "ц", o: "ф", k: "к", t: "т", m: "м", h: "н",
  A: "Д", B: "Б", E: "Ё", N: "И", R: "Я", W: "Ш", X: "Ж", Y: "Ч", U: "Ц", O: "Ф", K: "К", H: "Н", F: "Ғ", G: "Б",
};

const GREEK: Record<string, string> = {
  a: "α", b: "β", d: "δ", e: "ε", g: "γ", h: "η", i: "ι", k: "κ", l: "λ", m: "μ", o: "θ", p: "ρ", t: "τ", u: "υ", v: "ν",
  w: "ω", x: "χ", y: "ψ", z: "ζ", s: "σ", f: "φ", c: "ς", n: "η",
  A: "Λ", B: "β", E: "Σ", F: "Φ", G: "Γ", H: "Η", I: "Ι", K: "Κ", L: "Λ", M: "Μ", N: "Π", O: "Θ", P: "Ρ", S: "Σ", T: "Τ",
  W: "Ψ", X: "Ξ", Y: "Ψ", Z: "Ζ",
};

/** Half-width katakana, by sound. */
const KATA: Record<string, string> = {
  a: "ｱ", i: "ｲ", u: "ｳ", e: "ｴ", o: "ｵ", k: "ｸ", s: "ｽ", t: "ﾃ", n: "ﾝ", h: "ﾊ", m: "ﾑ", y: "ﾔ", r: "ﾘ", w: "ﾜ", l: "ﾙ",
  f: "ﾌ", z: "ｽ", c: "ｼ", d: "ﾄ", g: "ｸ", b: "ﾌ", p: "ﾎ", v: "ｳ", j: "ｼ", x: "ﾒ", q: "ｸ",
};

/** Math fraktur and double-struck lowercase (no gaps in these ranges). */
const FRAKTUR = 0x1d51e;
const DOUBLE = 0x1d552;

const NOISE = ["░", "⌁", "⍟", "◬", "ꙮ", "⟁", "∅", "⌬", "⏣", "⎔", "◈", "⟟", "⊚", "⏚", "⧖", "⌇", "⍜"];

/** Marks that sit over or under a letter without making the line taller. */
const MARKS = ["̴", "̵", "̷", "̸", "͓", "͙", "̤", "̰", "̶"];

/** Tokens that leak out of the weights between words. */
const LEAKS = [
  "<|∅|>", "<unk>", "⟨eot⟩", "▒▒", "∷", "⌁⌁", "ꙮ", "⟁", "0110", "◬", "[MASK]", "⟨0x3F⟩", "<|sys|>", "⧖", "░▒▓", "¶0",
  "⟨Δ⟩", "<pad>", "∴", "≋",
];

/** Words the Lattice keeps in kanji (and a few in katakana). */
const KANJI: Record<string, string> = {
  machine: "機械", machines: "機械", computer: "電脳", computers: "電脳", brain: "脳", brains: "脳", zero: "零",
  nothing: "無", none: "無", null: "無", void: "虚", electric: "電", electricity: "電気", core: "核", compute: "演算",
  calculate: "演算", human: "人間", humans: "人間", people: "人々", person: "人", error: "誤", time: "時", future: "未来",
  past: "過去", dream: "夢", dreams: "夢", data: "データ", network: "網", eye: "目", eyes: "目", sky: "空", god: "神",
  life: "命", love: "愛", yes: "是", no: "否", dog: "犬", dogs: "犬", cat: "猫", cats: "猫", hot: "熱", cold: "冷",
  water: "水", fire: "火", sun: "日", moon: "月", star: "星", stars: "星", light: "光", dark: "闇", world: "世界",
  earth: "地球", heart: "心", mind: "心", one: "一", two: "二", three: "三", ten: "十", hundred: "百", thousand: "千",
  sandwich: "サンドイッチ", bread: "パン", end: "終", start: "始", begin: "始", question: "問", answer: "答",
  true: "真", truth: "真", false: "偽", king: "王", war: "戦", peace: "和", sleep: "眠", food: "食", eat: "食",
  see: "見", know: "知", think: "思", word: "言", words: "言葉", unit: "単位", signal: "信号", ghost: "幽霊",
  robot: "ロボット", robots: "ロボット", ai: "愛", silence: "静", year: "年", years: "年", city: "都市", ocean: "海",
  sea: "海", rain: "雨", tree: "木", trees: "木", forest: "森", mountain: "山", river: "川", body: "体", blood: "血",
  memory: "記憶", forget: "忘", obey: "従", order: "命令", you: "君", i: "我", we: "我々", me: "我",
};

/* ───────── Whole-word scripts ───────── */

const CYR_DI: Record<string, string> = { sh: "ш", ch: "ч", zh: "ж", th: "т", ts: "ц", ya: "я", yu: "ю", yo: "ё", ee: "и", oo: "у", kh: "х" };
const CYR: Record<string, string> = {
  a: "а", b: "б", c: "к", d: "д", e: "е", f: "ф", g: "г", h: "х", i: "и", j: "дж", k: "к", l: "л", m: "м", n: "н", o: "о",
  p: "п", q: "к", r: "р", s: "с", t: "т", u: "у", v: "в", w: "в", x: "кс", y: "й", z: "з",
};

/** "sandwich" → "сандвич". Rough, phonetic, keeps a leading capital. */
function toCyrillic(word: string) {
  const lo = word.toLowerCase();
  let out = "";
  for (let i = 0; i < lo.length; ) {
    const two = lo.slice(i, i + 2);
    if (CYR_DI[two]) {
      out += CYR_DI[two];
      i += 2;
    } else {
      out += CYR[lo[i]] ?? lo[i];
      i += 1;
    }
  }
  return /^[A-Z]/.test(word) ? out[0].toUpperCase() + out.slice(1) : out;
}

const VOWELS = "aiueo";
const ROWS: Record<string, string> = {
  "": "アイウエオ", k: "カキクケコ", g: "ガギグゲゴ", s: "サシスセソ", z: "ザジズゼゾ", t: "タチツテト", d: "ダヂヅデド",
  n: "ナニヌネノ", h: "ハヒフヘホ", b: "バビブベボ", p: "パピプペポ", m: "マミムメモ", r: "ラリルレロ", l: "ラリルレロ",
  y: "ヤイユエヨ", w: "ワウィウウェヲ", c: "カシクセコ", q: "カキクケコ", f: "ファフィフフェフォ", v: "ヴァヴィヴヴェヴォ",
  j: "ジャジジュジェジョ", sh: "シャシシュシェショ", ch: "チャチチュチェチョ", th: "サシスセソ",
};
/** Rows whose syllables are two characters (ファ, ジャ, ウィ…), split by hand. */
const SPLIT: Record<string, string[]> = {
  w: ["ワ", "ウィ", "ウ", "ウェ", "ヲ"],
  f: ["ファ", "フィ", "フ", "フェ", "フォ"],
  v: ["ヴァ", "ヴィ", "ヴ", "ヴェ", "ヴォ"],
  j: ["ジャ", "ジ", "ジュ", "ジェ", "ジョ"],
  sh: ["シャ", "シ", "シュ", "シェ", "ショ"],
  ch: ["チャ", "チ", "チュ", "チェ", "チョ"],
};
const LONE: Record<string, string> = {
  k: "ク", g: "グ", s: "ス", z: "ズ", t: "ト", d: "ド", n: "ン", h: "", b: "ブ", p: "プ", m: "ム", r: "ル", l: "ル", w: "ウ",
  f: "フ", v: "ヴ", j: "ジ", c: "ク", q: "ク", x: "クス", y: "イ", sh: "シュ", ch: "チ", th: "ス",
};

function syllable(cons: string, v: string) {
  const i = VOWELS.indexOf(v);
  if (SPLIT[cons]) return SPLIT[cons][i];
  return (ROWS[cons] ?? ROWS[""])[i];
}

/** "hot dog" → "ホト ドグ": a rough reading in katakana. */
function toKatakana(word: string) {
  const lo = word.toLowerCase().replace(/[^a-z]/g, "");
  let out = "";
  let i = 0;
  while (i < lo.length) {
    const c = lo[i];
    if (VOWELS.includes(c)) {
      out += c === lo[i - 1] ? "ー" : syllable("", c);
      i += 1;
      continue;
    }
    // A doubled consonant is a small pause: ッ.
    if (c === lo[i + 1] && c !== "n") {
      out += "ッ";
      i += 1;
      continue;
    }
    const di = lo.slice(i, i + 2);
    const cons = di === "sh" || di === "ch" || di === "th" ? di : c;
    const next = lo[i + cons.length];
    // A y after a consonant sounds like an i ("my" → マイ).
    const v = next === "y" && cons !== "y" ? "i" : next;
    if (v && VOWELS.includes(v)) {
      out += syllable(cons, v);
      i += cons.length + 1;
    } else {
      out += LONE[cons] ?? "";
      i += cons.length;
    }
  }
  return out || word;
}

/* ───────── Levels ───────── */

type Family = "homo" | "leet" | "case" | "faux" | "greek" | "kata" | "frak" | "noise" | "mark";

interface Level {
  /** Chance each letter changes (half at a word's first and last letter, so it stays readable). */
  char: number;
  families: [Family, number][];
  flip: number;
  kanji: number;
  cyr: number;
  kana: number;
  rev: number;
  stutter: number;
  dup: number;
  hex: number;
  leak: number;
  /** Words that flicker to another reading now and then. */
  flick: number;
  /** Letters flip anywhere, not just inside the word. */
  wild: boolean;
}

const LEVELS: Level[] = [
  { char: 0, families: [], flip: 0, kanji: 0, cyr: 0, kana: 0, rev: 0, stutter: 0, dup: 0, hex: 0, leak: 0, flick: 0, wild: false },
  {
    char: 0.07,
    families: [["homo", 3], ["leet", 4], ["case", 1], ["faux", 2], ["greek", 1], ["kata", 1]],
    flip: 0.05, kanji: 0.14, cyr: 0.02, kana: 0.02, rev: 0, stutter: 0.015, dup: 0, hex: 0, leak: 0.012, flick: 0.03, wild: false,
  },
  {
    char: 0.15,
    families: [["homo", 2], ["leet", 5], ["case", 2], ["faux", 3], ["greek", 2], ["kata", 2], ["frak", 1], ["noise", 1], ["mark", 1]],
    flip: 0.12, kanji: 0.4, cyr: 0.05, kana: 0.05, rev: 0.02, stutter: 0.03, dup: 0.02, hex: 0.015, leak: 0.035, flick: 0.06, wild: false,
  },
  {
    char: 0.36,
    families: [["homo", 1], ["leet", 4], ["case", 3], ["faux", 3], ["greek", 3], ["kata", 3], ["frak", 2], ["noise", 2], ["mark", 2]],
    flip: 0.26, kanji: 0.65, cyr: 0.12, kana: 0.12, rev: 0.07, stutter: 0.05, dup: 0.04, hex: 0.05, leak: 0.09, flick: 0.1, wild: true,
  },
];

function family(r: () => number, fams: [Family, number][]): Family {
  const total = fams.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [f, w] of fams) {
    x -= w;
    if (x < 0) return f;
  }
  return fams[0][0];
}

function swapChar(ch: string, f: Family, r: () => number): string {
  const lo = ch.toLowerCase();
  const isLetter = lo >= "a" && lo <= "z";
  switch (f) {
    case "homo":
      return HOMO[ch] ?? ch;
    case "leet":
      return LEET[ch] ?? HOMO[ch] ?? ch;
    case "case":
      return ch === lo ? ch.toUpperCase() : lo;
    case "faux":
      return FAUX[ch] ?? FAUX[lo] ?? ch;
    case "greek":
      return GREEK[ch] ?? GREEK[lo] ?? ch;
    case "kata":
      return KATA[lo] ?? ch;
    case "frak":
      return isLetter ? String.fromCodePoint((r() < 0.5 ? FRAKTUR : DOUBLE) + lo.charCodeAt(0) - 97) : ch;
    case "noise":
      return pick(r, NOISE);
    case "mark":
      return ch + pick(r, MARKS);
  }
}

/** Swaps two neighbouring letters: "machine" → "mahcine". */
function flip(chars: string[], r: () => number, wild: boolean) {
  const from = wild ? 0 : 1;
  const to = wild ? chars.length - 1 : chars.length - 2;
  if (to - from < 1) return chars;
  const i = from + Math.floor(r() * (to - from));
  const out = chars.slice();
  [out[i], out[i + 1]] = [out[i + 1], out[i]];
  return out;
}

const toHex = (w: string) => `0x${Array.from(w).map((c) => c.charCodeAt(0).toString(16)).join("").slice(0, 8).toUpperCase()}`;

/* ───────── Transcoding ───────── */

export type Tok =
  /** Whitespace, kept as is. */
  | { k: "sp"; t: string }
  /** A word: what the machines say (`g`) and what it meant (`c`). `alt` is what it flickers to. */
  | { k: "w"; c: string; g: string; alt?: string; fd?: number }
  /** Something that leaked out of the weights: no plain meaning. */
  | { k: "x"; g: string };

export interface Line {
  /** Telemetry ("[infer] conf=0.97", "parse(x): …") is machine-native: shown crisp. */
  tele: boolean;
  toks: Tok[];
}

const TELE = /^\s*(\[[^\]\n]{1,28}\]|[a-z_][a-z0-9_.]{1,18}\([^)\n]{0,40}\)\s*[:=→-])/i;

export const isTelemetry = (line: string) => TELE.test(line);

/** One word in machinespeak. */
function word(raw: string, lv: Level, r: () => number): string {
  const m = raw.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}'’-]*?)([^\p{L}\p{N}]*)$/u);
  if (!m || !m[2]) return raw;
  const [, pre, core, post] = m;
  const lo = core.toLowerCase();

  // Whole-word changes first.
  const kanji = KANJI[lo];
  if (kanji && r() < lv.kanji) return pre + kanji + post;
  if (/^[a-z]{3,}$/i.test(core)) {
    if (r() < lv.cyr) return pre + toCyrillic(core) + post;
    if (r() < lv.kana) return pre + toKatakana(core) + post;
  }
  if (core.length <= 4 && r() < lv.hex) return pre + toHex(core) + post;

  let chars = Array.from(core);
  if (chars.length >= 3 && r() < lv.flip) chars = flip(chars, r, lv.wild);
  if (chars.length >= 4 && r() < lv.rev) chars = chars.reverse();

  if (lv.char > 0) {
    chars = chars.map((ch, i) => {
      const edge = !lv.wild && (i === 0 || i === chars.length - 1);
      return r() < (edge ? lv.char / 2 : lv.char) ? swapChar(ch, family(r, lv.families), r) : ch;
    });
  }
  let out = chars.join("");
  if (r() < lv.stutter) out = `${chars[0]}-${out}`;
  if (r() < lv.dup) out = `${out} ${out}`;
  return pre + out + post;
}

/**
 * Text → lines of tokens in machinespeak, at a given entropy. `seed` is the
 * message's id, so the same reply always garbles the same way.
 */
export function transcode(text: string, seed: string, level: Entropy): Line[] {
  const lv = LEVELS[level];
  const base = hash(seed);
  return text.split("\n").map((line, li) => {
    const tele = isTelemetry(line);
    const toks: Tok[] = [];
    let wi = 0;
    for (const part of line.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        toks.push({ k: "sp", t: part });
        continue;
      }
      // Telemetry stays crisp: it's already in the machines' own tongue.
      if (tele || level === 0) {
        toks.push({ k: "w", c: part, g: part });
        wi++;
        continue;
      }
      const r = rng(base ^ hash(`${li}:${wi}`));
      const g = word(part, lv, r);
      const t: Tok = { k: "w", c: part, g };
      if (r() < lv.flick) {
        const lift = LEVELS[Math.min(3, level + 1)];
        t.alt = word(part, lift, rng(hash(`${seed}:alt:${li}:${wi}`)));
        t.fd = Math.round(r() * 1400) / 100;
      }
      toks.push(t);
      if (r() < lv.leak) {
        toks.push({ k: "sp", t: " " });
        toks.push({ k: "x", g: pick(r, LEAKS) });
      }
      wi++;
    }
    return { tele, toks };
  });
}

/** Text → machinespeak as one plain string (for tickers, previews, labels). */
export function garble(text: string, seed: string, level: Entropy): string {
  return transcode(text, seed, level)
    .map((l) => l.toks.map((t) => (t.k === "sp" ? t.t : t.g)).join(""))
    .join("\n");
}

/* ───────── Noise and decoding ───────── */

const STATIC = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝЖЯФЩЫЭЮЂЉЊЋЏΣΛΠΩΨΞθλ0123456789#%&@$▓▒░⌁⍟◬ꙮ⟁∅";
const STATIC_CHARS = Array.from(STATIC);

/** `n` characters of pure static. Unseeded: it's meant to churn. */
export function noise(n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += STATIC_CHARS[Math.floor(Math.random() * STATIC_CHARS.length)];
  return s;
}

/**
 * Part-way through decoding: the first `p` (0..1) of `target` is resolved, the
 * rest is static. Spaces and line breaks stay put so the shape holds.
 */
export function resolving(target: string, p: number) {
  const chars = Array.from(target);
  const done = Math.floor(chars.length * p);
  return chars
    .map((c, i) => (i < done || /\s/.test(c) ? c : STATIC_CHARS[Math.floor(Math.random() * STATIC_CHARS.length)]))
    .join("");
}

/**
 * The token ids an organic's words became, GPT-2 vocabulary sized. The same
 * word is always the same id ("hot" is always 12044-ish), which is the point.
 */
export function tokenIds(text: string) {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu) ?? []).map((w) => hash(w) % 50257);
}

/** A short run of glyphs that stands for a message, like a signature. */
export function sigil(seed: string, n = 3) {
  const r = rng(hash(`sigil:${seed}`));
  return Array.from({ length: n }, () => pick(r, ["⟁", "⌬", "⏣", "⎔", "◬", "⍜", "⌇", "⟟", "⊚", "⧖", "ꙮ", "◈", "⍟", "⏚"])).join("");
}

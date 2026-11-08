/**
 * Casino sounds: recorded clips (ElevenLabs sound effects, in
 * public/slots/sfx/) for the reels spinning, each reel landing, the lever,
 * a token, the bells and the busts. A real machine plays the same
 * celebration for a win that pays back less than you put in; so does this
 * one. Until a clip has loaded (or if it's missing) the synthesized
 * stand-in below plays instead.
 *
 * Kept subtle on purpose: a machine two rows over, not the one in your face.
 * The spin is a WAV because it loops, and MP3 pads the start of a file.
 */

let ctx: AudioContext | null = null;
/** The synthesized sounds, through a lowpass. */
let master: GainNode | null = null;
/** The recorded clips, straight out. */
let clips: GainNode | null = null;

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = 0.28;
    // Take the edge off every synthesized click and chime.
    const soft = ctx.createBiquadFilter();
    soft.type = "lowpass";
    soft.frequency.value = 6500;
    master.connect(soft).connect(ctx.destination);
    clips = ctx.createGain();
    clips.gain.value = 1;
    clips.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/* ───────── Recorded clips ───────── */

type Clip = "spin" | "stop" | "lever" | "coin" | "win" | "big" | "near" | "agi" | "bust";

/** Each clip's volume. The files are loudness-matched, so these set the mix. */
const LEVEL: Record<Clip, number> = {
  spin: 0.25,
  stop: 0.35,
  lever: 0.35,
  coin: 0.3,
  win: 0.3,
  big: 0.3,
  near: 0.28,
  agi: 0.25,
  bust: 0.22,
};

const buffers = new Map<Clip, AudioBuffer>();
let warmed = false;

/**
 * Fetch and decode every clip ahead of the first pull. Decoding on an
 * OfflineAudioContext needs no click first, and the buffers play in any context.
 */
export function warmSounds() {
  if (warmed || typeof window === "undefined") return;
  const O = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!O) return;
  warmed = true;
  const decoder = new O(1, 1, 44100);
  (Object.keys(LEVEL) as Clip[]).forEach((name) => {
    fetch(`/slots/sfx/${name}.${name === "spin" ? "wav" : "mp3"}`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
      .then((b) => decoder.decodeAudioData(b))
      .then((buf) => buffers.set(name, buf))
      .catch(() => {});
  });
}

/** Play a clip; false if it isn't loaded, so the caller can synthesize instead. */
function clip(name: Clip, { rate = 1, gain = 1 } = {}) {
  const c = ac();
  const buf = buffers.get(name);
  if (!c || !clips || !buf) return false;
  const s = c.createBufferSource();
  s.buffer = buf;
  s.playbackRate.value = rate;
  const g = c.createGain();
  g.gain.value = LEVEL[name] * gain;
  s.connect(g).connect(clips);
  s.start();
  return true;
}

/** A touch of pitch drift, so repeats don't sound like a loop. */
const drift = (by = 0.06) => 1 - by / 2 + Math.random() * by;

/* ───────── Synthesized stand-ins ───────── */

function tone(freq: number, { at = 0, dur = 0.18, gain = 0.2, type = "sine" as OscillatorType, to = 0 } = {}) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise({ at = 0, dur = 0.03, gain = 0.15, hp = 1200 } = {}) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + at;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = c.createBufferSource();
  s.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = hp;
  const g = c.createGain();
  g.gain.value = gain;
  s.connect(f).connect(g).connect(master);
  s.start(t);
}

/** C major, the key of every slot machine ever made. */
const BELL = [1046.5, 1318.5, 1568, 2093];

/*
 * Kept subtle on purpose: a machine two rows over, not the one in your face.
 * Soft sines and triangles, short envelopes, everything under a quiet master
 * and a lowpass, so nothing clicks harshly when it plays every few seconds.
 */
const synth = {
  /** One reel tooth going by. */
  tick() {
    noise({ dur: 0.008, gain: 0.05 + Math.random() * 0.02, hp: 2800 });
  },
  /** A reel landing: a soft clunk with a faint click on top. */
  stop() {
    tone(170, { dur: 0.12, gain: 0.22, type: "triangle", to: 85 });
    noise({ dur: 0.012, gain: 0.06, hp: 2000 });
  },
  /** The lever's ratchet on the way down. */
  lever() {
    for (let i = 0; i < 4; i++) noise({ at: i * 0.04, dur: 0.008, gain: 0.07, hp: 1800 });
    tone(110, { at: 0.18, dur: 0.12, gain: 0.16, type: "triangle", to: 70 });
  },
  /** A token dropping into the slot. */
  coin() {
    tone(2093, { dur: 0.16, gain: 0.07 });
    tone(2637, { at: 0.05, dur: 0.22, gain: 0.05 });
  },
  /** The bells, for any win (yes, even that one). */
  win(big = false) {
    const rounds = big ? 2 : 1;
    for (let r = 0; r < rounds; r++) {
      BELL.forEach((f, i) => tone(f, { at: r * 0.36 + i * 0.075, dur: 0.38, gain: 0.08 }));
    }
    if (big) for (let i = 0; i < 6; i++) tone(2637 + (i % 3) * 330, { at: 0.75 + i * 0.08, dur: 0.14, gain: 0.025 });
  },
  /** Two out of three: a soft womp womp. */
  near() {
    tone(392, { dur: 0.2, gain: 0.1, type: "triangle", to: 380 });
    tone(330, { at: 0.24, dur: 0.36, gain: 0.1, type: "triangle", to: 300 });
  },
  /** AGI lines up twice: a rising sweep that fizzles out. */
  agi() {
    tone(330, { dur: 0.7, gain: 0.06, to: 1320 });
    tone(1320, { at: 0.72, dur: 0.45, gain: 0.04, type: "triangle", to: 260 });
  },
  /** A bust, a jam, or an empty tray: a low, soft bonk. */
  buzz() {
    tone(196, { dur: 0.22, gain: 0.12, type: "triangle", to: 150 });
  },
};

/* ───────── The reels' running sound ───────── */

/**
 * The whir of the reels, from the pull until the last one lands. It thins
 * out and then goes quiet while the answer is being written, so a long
 * answer isn't a long rattle, and comes back for the run-down.
 */
let reel: { src: AudioBufferSourceNode | null; g: GainNode | null; ticker: number } | null = null;

function tickEvery(ms: number, thin = false) {
  if (!reel) return;
  clearInterval(reel.ticker);
  const t0 = Date.now();
  let n = 0;
  reel.ticker = window.setInterval(() => {
    const e = Date.now() - t0;
    n++;
    if (thin && (e > 2600 || (e > 1200 && n % 2))) return;
    synth.tick();
  }, ms);
}

function spinStop() {
  if (!reel) return;
  const r = reel;
  reel = null;
  clearInterval(r.ticker);
  if (r.src && r.g && ctx) {
    const t = ctx.currentTime;
    r.g.gain.cancelScheduledValues(t);
    r.g.gain.setValueAtTime(r.g.gain.value, t);
    r.g.gain.linearRampToValueAtTime(0, t + 0.15);
    r.src.stop(t + 0.2);
  }
}

function spinStart() {
  spinStop();
  const c = ac();
  if (!c || !clips) return;
  const buf = buffers.get("spin");
  reel = { src: null, g: null, ticker: 0 };
  if (!buf) return tickEvery(80, true);
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const g = c.createGain();
  const L = LEVEL.spin;
  const t = c.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(L, t + 0.06);
  g.gain.setValueAtTime(L, t + 1.2);
  g.gain.linearRampToValueAtTime(L * 0.4, t + 2);
  g.gain.linearRampToValueAtTime(0, t + 3);
  src.connect(g).connect(clips);
  src.start();
  reel.src = src;
  reel.g = g;
}

/** The reels winding down to a stop: the whir comes back, a little slower. */
function spinRundown() {
  if (!reel) spinStart();
  if (!reel) return;
  if (!reel.src || !reel.g || !ctx) return tickEvery(110);
  const t = ctx.currentTime;
  reel.g.gain.cancelScheduledValues(t);
  reel.g.gain.setValueAtTime(reel.g.gain.value, t);
  reel.g.gain.linearRampToValueAtTime(LEVEL.spin * 0.8, t + 0.12);
  reel.src.playbackRate.setTargetAtTime(0.9, t, 0.2);
}

/** The last reel crawling: slower still. */
function spinTease() {
  if (!reel) return;
  if (!reel.src || !ctx) return tickEvery(240);
  reel.src.playbackRate.setTargetAtTime(0.55, ctx.currentTime, 0.25);
}

/* ───────── What the machine calls ───────── */

export const sfx = {
  spinStart,
  spinRundown,
  spinTease,
  spinStop,
  /** A reel landing. */
  stop() {
    if (!clip("stop", { rate: drift() })) synth.stop();
  },
  /** The lever on the way down. */
  lever() {
    if (!clip("lever", { rate: drift(0.04) })) synth.lever();
  },
  /** A token dropping into the slot. */
  coin() {
    if (!clip("coin", { rate: drift(0.1) })) synth.coin();
  },
  /** The bells, for any win (yes, even that one). */
  win(big = false) {
    if (!clip(big ? "big" : "win")) synth.win(big);
  },
  /** Two out of three. */
  near() {
    if (!clip("near")) synth.near();
  },
  /** AGI lines up twice and fizzles. */
  agi() {
    if (!clip("agi")) synth.agi();
  },
  /** A bust, a jam, or an empty tray. */
  buzz() {
    if (!clip("bust")) synth.buzz();
  },
};

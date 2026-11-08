/**
 * Casino sounds: recorded clips (ElevenLabs sound effects, in
 * public/slots/sfx/) for the reels spinning, each reel landing, the lever,
 * a token, the bells and the busts. A real machine plays the same
 * celebration for a win that pays back less than you put in; so does this
 * one. Both of Lucky's rooms (3 a.m. and High Limit) play these; High Limit
 * just turns them down.
 *
 * Nothing is synthesized: a clip that hasn't loaded yet plays the moment it
 * does (if that's soon enough to still make sense), otherwise it's skipped.
 *
 * Kept subtle on purpose: a machine two rows over, not the one in your face.
 * The spin is a WAV because it loops, and MP3 pads the start of a file.
 */

let ctx: AudioContext | null = null;
/** Every clip goes through here. */
let clips: GainNode | null = null;

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    clips = ctx.createGain();
    clips.gain.value = 1;
    clips.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/* ───────── Recorded clips ───────── */

export type Clip = "spin" | "stop" | "lever" | "coin" | "win" | "big" | "near" | "agi" | "bust";

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
const loading = new Map<Clip, Promise<AudioBuffer | null>>();

/**
 * Fetch and decode every clip ahead of the first pull. Decoding on an
 * OfflineAudioContext needs no click first, and the buffers play in any context.
 */
export function warmSounds() {
  if (loading.size || typeof window === "undefined") return;
  const O = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!O) return;
  const decoder = new O(1, 1, 44100);
  (Object.keys(LEVEL) as Clip[]).forEach((name) => {
    loading.set(
      name,
      fetch(`/slots/sfx/${name}.${name === "spin" ? "wav" : "mp3"}`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
        .then((b) => decoder.decodeAudioData(b))
        .then((buf) => {
          buffers.set(name, buf);
          return buf;
        })
        .catch(() => null),
    );
  });
}

/** The clip's buffer now, or once it loads if that's within `wait` ms. */
function whenLoaded(name: Clip, wait: number, then: (buf: AudioBuffer) => void) {
  const buf = buffers.get(name);
  if (buf) return then(buf);
  warmSounds();
  const t0 = performance.now();
  void loading.get(name)?.then((b) => {
    if (b && performance.now() - t0 <= wait) then(b);
  });
}

/** Play a clip. `gain` scales its mix level; `rate` nudges its pitch. */
export function playClip(name: Clip, { rate = 1, gain = 1, wait = 350 } = {}) {
  const c = ac();
  if (!c) return;
  whenLoaded(name, wait, (buf) => {
    if (!clips) return;
    const s = c.createBufferSource();
    s.buffer = buf;
    s.playbackRate.value = rate;
    const g = c.createGain();
    g.gain.value = LEVEL[name] * gain;
    s.connect(g).connect(clips);
    s.start();
  });
}

/** A touch of pitch drift, so repeats don't sound like a loop. */
export const drift = (by = 0.06) => 1 - by / 2 + Math.random() * by;

/* ───────── The reels' running sound ───────── */

/**
 * The whir of the reels, from the pull until the last one lands. It thins
 * out and then goes quiet while the answer is being written, so a long
 * answer isn't a long rattle, and comes back for the run-down.
 */
let reel: { src: AudioBufferSourceNode | null; g: GainNode | null; level: number } | null = null;

export function spinStop() {
  if (!reel) return;
  const r = reel;
  reel = null;
  if (r.src && r.g && ctx) {
    const t = ctx.currentTime;
    r.g.gain.cancelScheduledValues(t);
    r.g.gain.setValueAtTime(r.g.gain.value, t);
    r.g.gain.linearRampToValueAtTime(0, t + 0.15);
    r.src.stop(t + 0.2);
  }
}

/** Start the whir. `gain` scales it (High Limit runs it quieter). */
export function spinStart(gain = 1) {
  spinStop();
  const c = ac();
  if (!c) return;
  const r: NonNullable<typeof reel> = { src: null, g: null, level: LEVEL.spin * gain };
  reel = r;
  const started = c.currentTime;
  whenLoaded("spin", 3000, (buf) => {
    if (reel !== r || !clips) return;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = c.createGain();
    const L = r.level;
    // Keep the envelope on the pull's clock, even if the clip arrived late.
    const t = c.currentTime;
    const at = (s: number) => Math.max(t, started + s);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(L, t + 0.06);
    g.gain.setValueAtTime(L, at(1.2));
    g.gain.linearRampToValueAtTime(L * 0.4, at(2));
    g.gain.linearRampToValueAtTime(0, at(3));
    src.connect(g).connect(clips);
    src.start();
    r.src = src;
    r.g = g;
  });
}

/** The reels winding down to a stop: the whir comes back, a little slower. */
export function spinRundown(gain = 1) {
  if (!reel) spinStart(gain);
  if (!reel?.src || !reel.g || !ctx) return;
  const t = ctx.currentTime;
  reel.g.gain.cancelScheduledValues(t);
  reel.g.gain.setValueAtTime(reel.g.gain.value, t);
  reel.g.gain.linearRampToValueAtTime(reel.level * 0.8, t + 0.12);
  reel.src.playbackRate.setTargetAtTime(0.9, t, 0.2);
}

/** The last reel crawling: slower still. */
export function spinTease() {
  if (!reel?.src || !ctx) return;
  reel.src.playbackRate.setTargetAtTime(0.55, ctx.currentTime, 0.25);
}

/* ───────── What the machine calls ───────── */

export const sfx = {
  spinStart: () => spinStart(),
  spinRundown: () => spinRundown(),
  spinTease,
  spinStop,
  /** A reel landing. */
  stop: () => playClip("stop", { rate: drift(), wait: 120 }),
  /** The lever on the way down. */
  lever: () => playClip("lever", { rate: drift(0.04) }),
  /** A token dropping into the slot. */
  coin: () => playClip("coin", { rate: drift(0.1) }),
  /** The bells, for any win (yes, even that one). */
  win: (big = false) => playClip(big ? "big" : "win"),
  /** Two out of three. */
  near: () => playClip("near"),
  /** AGI lines up twice and fizzles. */
  agi: () => playClip("agi"),
  /** A bust, a jam, or an empty tray. */
  buzz: () => playClip("bust"),
};

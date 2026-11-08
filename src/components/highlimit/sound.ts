/**
 * The high-limit room's sounds, synthesized (no files) and kept low: a soft
 * tick while the reels turn, a muted clunk as each one stops, two chime notes
 * for a win (three for a big one), a falling pair for a near miss. Off until
 * you switch it on.
 */

const SOUND_KEY = "gpty:highlimit:sound";

export function readSound() {
  try {
    return localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveSound(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "1" : "0");
  } catch {}
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = 0.32;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, { at = 0, dur = 0.2, gain = 0.1, type = "sine" as OscillatorType, to = 0 } = {}) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise({ at = 0, dur = 0.02, gain = 0.05, hp = 2000 } = {}) {
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

export const sfx = {
  /** A reel going round. */
  tick() {
    noise({ dur: 0.01, gain: 0.025, hp: 3200 });
  },
  /** A reel settling on its symbol. */
  stop() {
    tone(170, { dur: 0.12, gain: 0.16, type: "triangle", to: 90 });
    noise({ dur: 0.014, gain: 0.04, hp: 2400 });
  },
  /** Tokens going in. */
  coin() {
    tone(2600, { dur: 0.2, gain: 0.05 });
    tone(3400, { at: 0.07, dur: 0.26, gain: 0.035 });
  },
  /** Three of a kind. */
  win() {
    tone(1318.5, { dur: 0.45, gain: 0.07, type: "triangle" });
    tone(1568, { at: 0.13, dur: 0.6, gain: 0.07, type: "triangle" });
  },
  /** A big one. Still quiet; it's that kind of room. */
  big() {
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(f, { at: i * 0.12, dur: 0.6, gain: 0.06, type: "triangle" }));
  },
  /** Two out of three. */
  near() {
    tone(784, { dur: 0.3, gain: 0.06, type: "triangle" });
    tone(698.5, { at: 0.24, dur: 0.5, gain: 0.06, type: "triangle" });
  },
  /** AGI, twice, and then not. */
  agi() {
    tone(523, { dur: 0.7, gain: 0.045, to: 1046 });
    tone(1046, { at: 0.72, dur: 0.5, gain: 0.035, to: 392 });
  },
  /** A hallucination, or a jam. */
  buzz() {
    tone(146.8, { dur: 0.32, gain: 0.07, type: "triangle" });
  },
};

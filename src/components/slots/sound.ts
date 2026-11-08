/**
 * Casino sounds, synthesized (no files): reel ticks, the clunk of each reel
 * stopping, the lever's ratchet, a coin's clink, and the bells. A real
 * machine plays the same celebration for a win that pays back less than you
 * put in; so does this one. Off until you switch it on.
 */

const SOUND_KEY = "gpty:slots:sound";

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
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

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

export const sfx = {
  /** One reel tooth going by. */
  tick() {
    noise({ dur: 0.012, gain: 0.05, hp: 2600 });
  },
  /** A reel landing: a low clunk with a click on top. */
  stop() {
    tone(150, { dur: 0.14, gain: 0.28, type: "triangle", to: 70 });
    noise({ dur: 0.02, gain: 0.12, hp: 1800 });
  },
  /** The lever's ratchet on the way down. */
  lever() {
    for (let i = 0; i < 6; i++) noise({ at: i * 0.035, dur: 0.012, gain: 0.09, hp: 1500 });
    tone(90, { at: 0.22, dur: 0.16, gain: 0.2, type: "triangle", to: 55 });
  },
  /** A token dropping into the slot. */
  coin() {
    tone(2350, { dur: 0.22, gain: 0.1 });
    tone(3150, { at: 0.06, dur: 0.3, gain: 0.08 });
    tone(2790, { at: 0.12, dur: 0.18, gain: 0.05 });
  },
  /** The bells, for any win (yes, even that one). */
  win(big = false) {
    const rounds = big ? 4 : 2;
    for (let r = 0; r < rounds; r++) {
      BELL.forEach((f, i) => tone(f, { at: r * 0.32 + i * 0.07, dur: 0.24, gain: 0.12, type: "triangle" }));
    }
    for (let i = 0; i < (big ? 14 : 6); i++) tone(2400 + (i % 3) * 420, { at: 0.2 + i * 0.09, dur: 0.12, gain: 0.04 });
  },
  /** Two out of three: womp womp. */
  near() {
    tone(392, { dur: 0.28, gain: 0.16, type: "triangle", to: 370 });
    tone(330, { at: 0.32, dur: 0.5, gain: 0.16, type: "triangle", to: 290 });
  },
  /** AGI lines up twice: a rising sweep that fizzles out. */
  agi() {
    tone(220, { dur: 0.9, gain: 0.12, type: "sawtooth", to: 1760 });
    tone(1760, { at: 0.95, dur: 0.6, gain: 0.08, type: "square", to: 180 });
  },
  /** A hallucination, or a jam. */
  buzz() {
    tone(110, { dur: 0.42, gain: 0.14, type: "sawtooth" });
    tone(116, { dur: 0.42, gain: 0.1, type: "sawtooth" });
  },
};

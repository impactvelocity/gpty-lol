"use client";

/**
 * Era sound cues, synthesized with Web Audio so there are no audio files to
 * license or download. Each one is a short, quiet nod to the original
 * rather than a copy of it.
 */

const SOUND_KEY = "gpty.sound";

let ctx: AudioContext | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function soundEnabled() {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {}
}

type Wave = OscillatorType;

/** One enveloped note, optionally gliding to `to` Hz. */
function tone(
  a: AudioContext,
  at: number,
  { freq, to, dur, type = "sine", gain = 0.12 }: { freq: number; to?: number; dur: number; type?: Wave; gain?: number },
) {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (to) o.frequency.exponentialRampToValueAtTime(to, at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(a.destination);
  o.start(at);
  o.stop(at + dur + 0.02);
}

function noise(a: AudioContext, at: number, dur: number, gain = 0.05, band = 1800) {
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = band;
  f.Q.value = 0.8;
  const g = a.createGain();
  g.gain.setValueAtTime(gain, at);
  g.gain.setValueAtTime(gain, at + dur - 0.03);
  g.gain.linearRampToValueAtTime(0.0001, at + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(at);
}

/** A dull knock on wood or stone: a fast low pitch-drop. */
function knock(a: AudioContext, t: number, freq = 150, gain = 0.3) {
  tone(a, t, { freq, to: freq * 0.55, dur: 0.09, type: "triangle", gain });
  noise(a, t, 0.04, gain * 0.18, 900);
}

/** A small cluster of sleigh bells. */
function bells(a: AudioContext, t: number, n: number) {
  for (let i = 0; i < n; i++) {
    const at = t + i * 0.09 + Math.random() * 0.02;
    tone(a, at, { freq: 2200 + Math.random() * 1400, dur: 0.14, gain: 0.05 });
    tone(a, at, { freq: 4200 + Math.random() * 1600, dur: 0.08, gain: 0.02 });
  }
}

const CUES: Record<string, (a: AudioContext, t: number) => void> = {
  // One rap on the table.
  seance: (a, t) => knock(a, t, 120, 0.32),
  // Two stone clacks.
  caveman: (a, t) => {
    knock(a, t, 420, 0.22);
    knock(a, t + 0.13, 330, 0.22);
  },
  // Two clipped data blips.
  machine: (a, t) => {
    tone(a, t, { freq: 1180, dur: 0.05, type: "square", gain: 0.05 });
    tone(a, t + 0.08, { freq: 1570, dur: 0.06, type: "square", gain: 0.05 });
  },
  // A short jingle.
  elf: (a, t) => bells(a, t, 4),
  // PC speaker beep.
  bbs: (a, t) => tone(a, t, { freq: 880, dur: 0.09, type: "square", gain: 0.05 }),
  // A falling two-note "uh-oh".
  icq: (a, t) => {
    tone(a, t, { freq: 620, to: 560, dur: 0.16, type: "triangle", gain: 0.16 });
    tone(a, t + 0.2, { freq: 470, to: 380, dur: 0.24, type: "triangle", gain: 0.16 });
  },
  // A bright rising chime.
  msn: (a, t) => {
    tone(a, t, { freq: 988, dur: 0.18, gain: 0.1 });
    tone(a, t + 0.11, { freq: 1319, dur: 0.32, gain: 0.1 });
  },
  // A bubbly upward blip.
  skype: (a, t) => {
    tone(a, t, { freq: 520, to: 1040, dur: 0.12, gain: 0.12 });
    tone(a, t + 0.13, { freq: 780, to: 1560, dur: 0.14, gain: 0.08 });
  },
  // Two soft woody knocks.
  slack: (a, t) => {
    tone(a, t, { freq: 740, to: 520, dur: 0.07, type: "triangle", gain: 0.18 });
    tone(a, t + 0.1, { freq: 980, to: 700, dur: 0.08, type: "triangle", gain: 0.14 });
  },
  // A small pop.
  messenger: (a, t) => tone(a, t, { freq: 1200, to: 600, dur: 0.09, gain: 0.14 }),
};

/** Plays the "new message" cue for a costume, if it has one and sound is on. */
export function playReply(costumeId: string) {
  const cue = CUES[costumeId];
  if (!cue || !soundEnabled()) return;
  const a = audio();
  if (a) cue(a, a.currentTime + 0.01);
}

/** Entrance stingers, played when you switch into a costume. */
const ENTRANCES: Record<string, (a: AudioContext, t: number) => void> = {
  // Three slow raps: the spirit acknowledges the circle.
  seance: (a, t) => [0, 0.5, 1.0].forEach((d) => knock(a, t + d, 115, 0.34)),
  // Knapping: a quick flurry of stone on stone.
  caveman: (a, t) =>
    [0, 0.11, 0.2, 0.34, 0.42].forEach((d, i) => knock(a, t + d, 460 - i * 40, 0.16)),
  // A rising data burst.
  machine: (a, t) => {
    for (let i = 0; i < 9; i++)
      tone(a, t + i * 0.035, { freq: 500 + i * 190, dur: 0.03, type: "square", gain: 0.035 });
  },
  // A proper shake of the sleigh bells.
  elf: (a, t) => bells(a, t, 9),
};

/** Plays a costume's entrance stinger (the BBS gets the modem instead). */
export function playEnter(costumeId: string) {
  if (!soundEnabled()) return;
  if (costumeId === "bbs") return playModem();
  const cue = ENTRANCES[costumeId];
  if (!cue) return;
  const a = audio();
  if (a) cue(a, a.currentTime + 0.02);
}

/** MSN nudge: a quick rattle. */
export function playNudge() {
  if (!soundEnabled()) return;
  const a = audio();
  if (!a) return;
  const t = a.currentTime + 0.01;
  for (let i = 0; i < 7; i++) tone(a, t + i * 0.055, { freq: i % 2 ? 140 : 180, dur: 0.05, type: "square", gain: 0.05 });
}

/** A short, quiet dial-up handshake for walking into the BBS. */
export function playModem() {
  if (!soundEnabled()) return;
  const a = audio();
  if (!a) return;
  let t = a.currentTime + 0.02;
  // Dial: a few DTMF digits.
  const DTMF: [number, number][] = [[697, 1209], [770, 1336], [852, 1477], [697, 1336], [941, 1336]];
  for (const [lo, hi] of DTMF) {
    tone(a, t, { freq: lo, dur: 0.07, gain: 0.04 });
    tone(a, t, { freq: hi, dur: 0.07, gain: 0.04 });
    t += 0.1;
  }
  t += 0.15;
  // Answer tone, then the screech.
  tone(a, t, { freq: 2100, dur: 0.35, gain: 0.03 });
  t += 0.4;
  tone(a, t, { freq: 980, to: 1650, dur: 0.18, type: "sawtooth", gain: 0.02 });
  tone(a, t + 0.2, { freq: 1200, to: 2400, dur: 0.12, type: "square", gain: 0.015 });
  noise(a, t + 0.3, 0.45, 0.035, 1800);
  noise(a, t + 0.3, 0.45, 0.02, 3200);
}

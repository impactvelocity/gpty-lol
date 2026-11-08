/**
 * The high-limit room's sounds: the same ElevenLabs clips as Lucky's
 * 3 a.m. floor (public/slots/sfx/), played lower. The reels whir while they
 * turn, each one clunks as it stops, the bells ring for a win (the big
 * celebration for a big one), and a near miss gets its womp. Off until you
 * switch it on.
 */

import { drift, playClip, spinRundown, spinStart, spinStop, spinTease, warmSounds } from "@/components/slots/sound";

export { warmSounds };

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

/** Still quiet; it's that kind of room. */
const ROOM = 0.7;

export const sfx = {
  /** The reels start turning. */
  spinStart: () => spinStart(ROOM),
  /** The reels winding down. */
  spinRundown: () => spinRundown(ROOM),
  /** The last reel crawling. */
  spinTease,
  /** All three reels have landed. */
  spinStop,
  /** A reel settling on its symbol. */
  stop: () => playClip("stop", { rate: drift(), gain: ROOM, wait: 120 }),
  /** Tokens going in. */
  coin: () => playClip("coin", { rate: drift(0.1), gain: ROOM }),
  /** Three of a kind. */
  win: () => playClip("win", { gain: ROOM }),
  /** A big one. */
  big: () => playClip("big", { gain: ROOM }),
  /** Two out of three. */
  near: () => playClip("near", { gain: ROOM }),
  /** AGI, twice, and then not. */
  agi: () => playClip("agi", { gain: ROOM }),
  /** A hallucination, or a jam. */
  buzz: () => playClip("bust", { gain: ROOM }),
};

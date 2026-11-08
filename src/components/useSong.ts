"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How loud a song plays: full volume (the device's own volume still applies). */
const VOLUME = 1;
/** Seconds to fade a song in or out. */
const FADE = 0.25;
const PAUSED_KEY = "gpty:muted";

/** Whether songs are paused, remembered across visits. */
export function usePaused() {
  const [paused, setPaused] = useState(() => {
    try {
      return localStorage.getItem(PAUSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const toggle = useCallback(() => {
    setPaused((p) => {
      try {
        localStorage.setItem(PAUSED_KEY, p ? "0" : "1");
      } catch {}
      return !p;
    });
  }, []);
  return [paused, toggle] as const;
}

/** One context for every song, made on first use. */
let shared: AudioContext | null | undefined;
function audioContext() {
  if (shared === undefined) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    shared = Ctx ? new Ctx() : null;
  }
  return shared;
}

/** `waiting`: the browser is holding sound until the visitor clicks or types. */
export type SongState = "playing" | "paused" | "waiting";

export interface Song {
  state: SongState;
  /** Seconds into the song, and its length (0 until it's known). */
  time: number;
  duration: number;
  /** Live frequency and waveform data for the visualizer; null without Web Audio. */
  analyser: AnalyserNode | null;
  seek: (seconds: number) => void;
}

interface Track {
  audio: HTMLAudioElement;
  gain: GainNode | null;
  analyser: AnalyserNode | null;
}

/** Fades on the audio thread, so they finish even in a background tab. */
function fadeTo(t: Track, to: number) {
  if (!t.gain) {
    t.audio.volume = to;
    return;
  }
  const g = t.gain.gain;
  const now = t.gain.context.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(to, now + FADE);
}

/**
 * Loops `src` unless paused. Switching songs fades the old one out and the new
 * one in; pausing keeps the place. A hidden tab pauses too.
 */
export function useSong(src: string | undefined, paused: boolean): Song | null {
  const [track, setTrack] = useState<Track | null>(null);
  const [state, setState] = useState<SongState>("waiting");
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // One audio element per song, through a gain (for fades) and an analyser (for the visualizer).
  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    const ctx = audioContext();
    let gain: GainNode | null = null;
    let analyser: AnalyserNode | null = null;
    if (ctx) {
      gain = ctx.createGain();
      gain.gain.value = 0;
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;
      ctx.createMediaElementSource(audio).connect(gain).connect(analyser).connect(ctx.destination);
    } else {
      audio.volume = 0;
    }
    const t: Track = { audio, gain, analyser };
    audioRef.current = audio;
    const onTime = () => setTime(audio.currentTime);
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the element is made here, outside React
    setTrack(t);
    setTime(0);
    setDuration(0);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      setTrack((cur) => (cur === t ? null : cur));
      fadeTo(t, 0);
      setTimeout(() => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        gain?.disconnect();
        analyser?.disconnect();
      }, FADE * 1000 + 50);
    };
  }, [src]);

  // Play or pause it. Until the first click or key press the browser says no, so wait for one.
  useEffect(() => {
    if (!track) return;
    const { audio } = track;
    if (paused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the element's state
      setState("paused");
      fadeTo(track, 0);
      const id = setTimeout(() => audio.pause(), FADE * 1000);
      return () => clearTimeout(id);
    }
    let live = true;
    const events = ["pointerdown", "keydown"] as const;
    const stopListening = () => events.forEach((e) => window.removeEventListener(e, start));
    async function start() {
      if (!live || document.hidden) return;
      // Both start inside the click that allows sound. A browser can let the
      // element play while still holding the audio graph, which would be silent.
      const ctx = track!.gain?.context as AudioContext | undefined;
      const resumed = ctx?.resume().catch(() => {});
      try {
        await audio.play();
        if (ctx && ctx.state !== "running") await Promise.race([resumed, new Promise((r) => setTimeout(r, 250))]);
      } catch {}
      if (!live) return;
      if (audio.paused || (ctx && ctx.state !== "running")) {
        audio.pause();
        setState("waiting");
        return;
      }
      stopListening();
      setState("playing");
      fadeTo(track!, VOLUME);
    }
    const onVisibility = () => (document.hidden ? audio.pause() : void start());
    events.forEach((e) => window.addEventListener(e, start));
    document.addEventListener("visibilitychange", onVisibility);
    void start();
    return () => {
      live = false;
      stopListening();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [track, paused]);

  const seek = useCallback((s: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = s;
    setTime(s);
  }, []);

  if (!src || !track) return null;
  return { state, time, duration, analyser: track.analyser, seek };
}

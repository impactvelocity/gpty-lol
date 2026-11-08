"use client";

import { type KeyboardEvent, type PointerEvent, useEffect, useRef } from "react";
import type { Agent } from "@/lib/agents";
import { elfFonts } from "./elf/font";
import { fyFonts } from "./fury/font";
import { hlFonts } from "./highlimit/font";
import { segoe } from "./msn/font";
import { rounded } from "./skype/font";
import { slFonts } from "./slots/font";
import { mfFonts } from "./terminal/font";
import type { Song } from "./useSong";
import "./songplayer.css";

/**
 * The agent's song, as a bar across the top of its window: play/pause, the
 * (made-up) song title, how far in it is, and a visualizer on the right. It wears the
 * chrome of the agent's own app (see songplayer.css), and the visualizer is
 * what was on screen in that era.
 */
export function SongPlayer({ agent, song, onToggle }: { agent: Agent; song: Song; onToggle: () => void }) {
  const { state, time, duration } = song;
  const playing = state === "playing";
  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;
  const { skin, look, fonts = "" } = SKINS[agent.id] ?? { skin: "glass", look: "bars" };
  const title = agent.song?.title ?? `${agent.name}'s theme`;

  const seekTo = (e: PointerEvent<HTMLDivElement>) => {
    if (!duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    song.seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration);
  };
  const seekKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" ? 5 : e.key === "ArrowLeft" ? -5 : 0;
    if (!step || !duration) return;
    e.preventDefault();
    song.seek(Math.max(0, Math.min(duration - 0.1, time + step)));
  };

  return (
    <div className={`tune ${fonts}`} data-skin={skin} data-playing={playing || undefined}>
      <button
        type="button"
        // Before the first click the browser holds sound; that click (anywhere) starts it, so don't also pause.
        onClick={state === "waiting" ? undefined : onToggle}
        aria-label={playing ? `Pause “${title}”` : `Play “${title}”`}
        title={playing ? "Pause song" : "Play song"}
        className="tune-play"
      >
        <svg viewBox="0 0 12 12" aria-hidden>
          {playing ? <path d="M2.5 1.5h2.4v9H2.5zM7.1 1.5h2.4v9H7.1z" /> : <path d="M3 1.2v9.6L10.6 6z" />}
        </svg>
      </button>
      <span className="tune-title">
        <b>{title}</b>
      </span>
      {state === "waiting" ? (
        <span className="tune-wait">click anywhere to play</span>
      ) : (
        <span className="tune-seek">
          <span className="tune-time">{clock(time)}</span>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${clock(time)} of ${clock(duration)}`}
            onPointerDown={seekTo}
            onKeyDown={seekKey}
            className="tune-track"
          >
            <span className="tune-bar">
              <span className="tune-fill" style={{ width: `${pct}%` }} />
            </span>
          </div>
          <span className="tune-time">{clock(duration)}</span>
        </span>
      )}
      <span className="tune-viz">
        <Visualizer analyser={song.analyser} playing={playing} look={look} />
      </span>
    </div>
  );
}

function clock(s: number) {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

/* ─────────────────────────── Visualizers ─────────────────────────── */

type Look = "winamp" | "wmp" | "aero" | "flat" | "karma" | "hash" | "fire" | "spirit" | "scope" | "sunset" | "lights" | "hair" | "led" | "bars";

/**
 * Each agent's app chrome, and its era as a visualizer, plus any typefaces
 * its own window loads (those only exist where they're applied). Others get
 * frosted glass and plain bars.
 */
const SKINS: Record<string, { skin: string; look: Look; fonts?: string }> = {
  icq: { skin: "icq", look: "winamp" }, // 2000: Windows 98 bevels; Winamp's green-to-red spectrum on black
  msn: { skin: "msn", look: "wmp", fonts: segoe.variable }, // 2005: Messenger's glossy blue glass; Windows Media Player's reflected bars
  skype: { skin: "skype", look: "aero", fonts: `${segoe.variable} ${rounded.variable}` }, // 2007: Skype's sky and green call button; a glowing Aero waveform
  facebook: { skin: "facebook", look: "flat" }, // 2008: the blue top bar; flat, square bars
  caveman: { skin: "cave", look: "fire" }, // 10,000 BC: a slab of warm rock; the campfire, leaping to the drums
  slack: { skin: "slack", look: "hash" }, // 2014: the aubergine sidebar; flat bars in the logo's four colors
  reddit: { skin: "reddit", look: "karma" }, // 2009: orangered on smoked glass; upvotes up, downvotes down
  seance: { skin: "seance", look: "spirit" }, // 1888: no frame, just a faint presence that breathes; a ghostly wisp
  terminal: { skin: "terminal", look: "scope", fonts: mfFonts }, // 1989: the steel cabinet and its amber CRT; the green oscilloscope
  fury: { skin: "fury", look: "sunset", fonts: fyFonts }, // 1985: chrome and neon off a VHS cover; bars rising from the Grid's horizon
  elf: { skin: "elf", look: "lights", fonts: elfFonts }, // the North Pole: her window's pine leather and cream stitch; bars in the string lights' colours
  machine: { skin: "machine", look: "hair" }, // 2199: white on the Lattice's black; hairlines, the loudest one cyan
  slots: { skin: "slots", look: "led", fonts: slFonts }, // 3 a.m.: dark velvet with a gold edge; the LED meter
  highlimit: { skin: "highlimit", look: "bars", fonts: hlFonts }, // the high-limit room: green felt and a brass hairline; plain brass bars
};

const W = 64;
const H = 20;

type Bytes = Uint8Array<ArrayBuffer>;
/** `level` is the waveform's recent loudest swing, so quiet songs still fill the box. */
type Frame = { g: CanvasRenderingContext2D; freq: Bytes; wave: Bytes; peaks: Float32Array; level: number; ink: string };

/** `n` levels (0–1) from the spectrum, log-spaced so the bass doesn't fill every bar. */
function bands(freq: Bytes, n: number) {
  const lo = 1;
  const hi = Math.min(freq.length - 1, 72);
  return Array.from({ length: n }, (_, i) => {
    const a = Math.floor(lo * (hi / lo) ** (i / n));
    const b = Math.max(a + 1, Math.floor(lo * (hi / lo) ** ((i + 1) / n)));
    let sum = 0;
    for (let k = a; k < b; k++) sum += freq[k];
    return Math.min(1, (sum / (b - a) / 255) * (1 + (i / n) * 0.7));
  });
}

const DRAW: Record<Look, (f: Frame) => void> = {
  winamp({ g, freq, peaks }) {
    g.fillStyle = "#000";
    g.fillRect(0, 0, W, H);
    const n = 14;
    const rows = 5;
    const bw = (W - 2) / n;
    bands(freq, n).forEach((v, i) => {
      const lit = Math.round(v * rows);
      const x = 1 + i * bw;
      for (let r = 0; r < lit; r++) {
        g.fillStyle = r < 2 ? "#3cff2a" : r < 4 ? "#f2e310" : "#ff3a1c";
        g.fillRect(x, H - 2 - (r + 1) * 3 + 1, bw - 1, 2);
      }
      peaks[i] = Math.max(lit, peaks[i] - 0.06);
      const p = Math.floor(peaks[i]);
      if (p > 0) {
        g.fillStyle = "#c9cfc9";
        g.fillRect(x, H - 2 - p * 3, bw - 1, 1);
      }
    });
  },
  wmp({ g, freq }) {
    const n = 12;
    const base = H * 0.74;
    const bw = W / n;
    const grad = g.createLinearGradient(0, 0, 0, base);
    grad.addColorStop(0, "#7fd2ff");
    grad.addColorStop(1, "#1a62d0");
    bands(freq, n).forEach((v, i) => {
      const h = Math.max(1.5, v * base);
      const x = i * bw + 1;
      g.fillStyle = grad;
      g.beginPath();
      g.roundRect(x, base - h, bw - 2, h, [2, 2, 0, 0]);
      g.fill();
      g.globalAlpha = 0.25;
      g.fillRect(x, base + 1, bw - 2, Math.min(H - base - 1, h * 0.35));
      g.globalAlpha = 1;
    });
  },
  aero({ g, wave, level }) {
    g.lineWidth = 1.6;
    g.lineJoin = "round";
    g.strokeStyle = "#0a8ed8";
    g.shadowColor = "#6fd6ff";
    g.shadowBlur = 6;
    g.beginPath();
    const step = wave.length / W;
    for (let x = 0; x <= W; x++) {
      const s = (wave[Math.min(wave.length - 1, Math.floor(x * step))] - 128) / level;
      // Taper the ends so the line floats rather than hitting the edges.
      const taper = Math.sin((x / W) * Math.PI);
      const y = H / 2 + Math.max(-1, Math.min(1, s * 0.9)) * (H / 2 - 2) * taper;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.shadowBlur = 0;
  },
  flat({ g, freq }) {
    const n = 10;
    const bw = W / n;
    bands(freq, n).forEach((v, i) => {
      const h = Math.max(2, v * (H - 2));
      g.fillStyle = "#8b9dc3";
      g.fillRect(i * bw + 1, H - h, bw - 2, h);
      g.fillStyle = "#fff";
      g.fillRect(i * bw + 1, H - h, bw - 2, Math.min(2, h));
    });
  },
  karma({ g, freq }) {
    const n = 10;
    const bw = W / n;
    const mid = H * 0.62;
    bands(freq, n).forEach((v, i) => {
      const x = i * bw + 1;
      const up = Math.max(1, v * (mid - 1));
      g.fillStyle = "#ff4500";
      g.fillRect(x, mid - up, bw - 2, up);
      // Every bar gets its share of downvotes too.
      g.fillStyle = "#9494ff";
      g.fillRect(x, mid + 1, bw - 2, Math.max(1, v * (H - mid - 1) * 0.8));
    });
  },
  hash({ g, freq }) {
    const colors = ["#6ecadc", "#e9a820", "#e01563", "#3eb991"];
    const n = 12;
    const bw = W / n;
    bands(freq, n).forEach((v, i) => {
      const h = Math.max(2, v * (H - 1));
      g.fillStyle = colors[i % 4];
      g.beginPath();
      g.roundRect(i * bw + 1, H - h, bw - 2, h, 1.5);
      g.fill();
    });
  },
  fire({ g, freq }) {
    const n = 9;
    const bw = W / n;
    const grad = g.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0, "#c2321c");
    grad.addColorStop(0.45, "#ef7d3f");
    grad.addColorStop(1, "#ffd98a");
    g.fillStyle = grad;
    bands(freq, n).forEach((v, i) => {
      // A tongue of flame: wide at the embers, pointed and leaning a little at the top.
      const h = Math.max(3, v * (H - 1));
      const x = i * bw;
      const lean = (i % 2 ? 1 : -1) * bw * 0.18;
      g.beginPath();
      g.moveTo(x + 0.5, H);
      g.quadraticCurveTo(x + 0.5, H - h * 0.55, x + bw / 2 + lean, H - h);
      g.quadraticCurveTo(x + bw - 0.5, H - h * 0.55, x + bw - 0.5, H);
      g.closePath();
      g.fill();
    });
  },
  spirit({ g, wave, level }) {
    // A wisp: the waveform's loudness as a soft ribbon, pale as smoke.
    const mid = H / 2;
    const step = wave.length / W;
    const reach: number[] = [];
    for (let x = 0; x <= W; x++) {
      let peak = 0;
      for (let k = 0; k < 4; k++) peak = Math.max(peak, Math.abs(wave[Math.min(wave.length - 1, Math.floor(x * step) + k)] - 128) / level);
      reach.push(0.6 + Math.min(1, peak) * (mid - 1.5) * Math.sin((x / W) * Math.PI));
    }
    g.shadowColor = "rgba(236, 227, 207, 0.8)";
    g.shadowBlur = 8;
    g.fillStyle = "rgba(236, 227, 207, 0.6)";
    g.beginPath();
    reach.forEach((r, x) => (x ? g.lineTo(x, mid - r) : g.moveTo(x, mid - r)));
    for (let x = W; x >= 0; x--) g.lineTo(x, mid + reach[x]);
    g.closePath();
    g.fill();
    g.shadowBlur = 0;
  },
  scope({ g, wave, level }) {
    g.fillStyle = "#020805";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(141, 255, 176, 0.13)";
    for (let x = 8; x < W; x += 8) g.fillRect(x, 0, 1, H);
    for (let y = 5; y < H; y += 5) g.fillRect(0, y, W, 1);
    g.strokeStyle = "#8dffb0";
    g.lineWidth = 1.3;
    g.shadowColor = "#8dffb0";
    g.shadowBlur = 4;
    g.beginPath();
    const step = wave.length / W;
    for (let x = 0; x <= W; x++) {
      const s = (wave[Math.min(wave.length - 1, Math.floor(x * step))] - 128) / level;
      const y = H / 2 + Math.max(-1, Math.min(1, s * 0.9)) * (H / 2 - 1.5);
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.shadowBlur = 0;
  },
  sunset({ g, freq }) {
    // Bars rising from a glowing horizon, sun-colored, with their reflection on the Grid below.
    const n = 12;
    const bw = W / n;
    const hz = H * 0.66;
    const sun = g.createLinearGradient(0, 0, 0, hz);
    sun.addColorStop(0, "#fff36b");
    sun.addColorStop(0.5, "#ff9a3c");
    sun.addColorStop(1, "#ff2e88");
    g.fillStyle = "#12042a";
    g.fillRect(0, hz, W, H - hz);
    g.fillStyle = "rgba(255, 60, 200, 0.35)";
    for (let x = 3; x < W; x += 6) g.fillRect(x, hz, 1, H - hz);
    bands(freq, n).forEach((v, i) => {
      const h = Math.max(1, v * (hz - 1));
      const x = i * bw + 1;
      g.fillStyle = sun;
      g.fillRect(x, hz - h, bw - 2, h);
      g.globalAlpha = 0.35;
      g.fillStyle = "#2ef2ff";
      g.fillRect(x, hz + 1, bw - 2, Math.min(H - hz - 1, h * 0.3));
      g.globalAlpha = 1;
    });
    g.fillStyle = "#ffd1ef";
    g.shadowColor = "#ff5ac8";
    g.shadowBlur = 4;
    g.fillRect(0, hz, W, 1);
    g.shadowBlur = 0;
  },
  lights({ g, freq }) {
    // Bars in the colours of the string lights over Carol's window, each glowing its own colour.
    const colors = ["#e4574b", "#e9b24c", "#8fb07c", "#f3b7ad", "#5aaea2"];
    const n = 10;
    const bw = W / n;
    bands(freq, n).forEach((v, i) => {
      const h = Math.max(2, v * (H - 2));
      const w = bw - 3;
      const c = colors[i % colors.length];
      g.fillStyle = c;
      g.shadowColor = c;
      g.shadowBlur = 4;
      g.beginPath();
      g.roundRect(i * bw + 1.5, H - h, w, h, [w / 2, w / 2, 1, 1]);
      g.fill();
    });
    g.shadowBlur = 0;
  },
  hair({ g, freq, ink }) {
    // Hairlines, like a spectrum read off an instrument; the loudest band is the sampled one, in cyan.
    const n = 16;
    const bw = W / n;
    const levels = bands(freq, n);
    const top = levels.indexOf(Math.max(...levels));
    levels.forEach((v, i) => {
      const h = Math.max(1, v * (H - 2));
      g.globalAlpha = 0.35 + v * 0.65;
      g.fillStyle = i === top && v > 0.05 ? "#5fdcec" : ink;
      g.fillRect(Math.round(i * bw + bw / 2 - 0.5), Math.round((H - h) / 2), 1, h);
    });
    g.globalAlpha = 1;
  },
  led({ g, freq }) {
    g.fillStyle = "#0a0204";
    g.fillRect(0, 0, W, H);
    const n = 11;
    const rows = 6;
    const bw = (W - 2) / n;
    bands(freq, n).forEach((v, i) => {
      const lit = Math.round(v * rows);
      for (let r = 0; r < rows; r++) {
        const on = r < lit;
        const color = r < 4 ? "#ff4231" : "#ffc533";
        g.globalAlpha = on ? 1 : 0.13;
        g.shadowColor = color;
        g.shadowBlur = on ? 4 : 0;
        g.fillStyle = color;
        g.fillRect(1 + i * bw, H - 2 - (r + 1) * 3 + 1, bw - 1, 2);
      }
    });
    g.globalAlpha = 1;
    g.shadowBlur = 0;
  },
  bars({ g, freq, ink }) {
    const n = 10;
    const bw = W / n;
    g.fillStyle = ink;
    bands(freq, n).forEach((v, i) => {
      const h = Math.max(2, v * H);
      g.beginPath();
      g.roundRect(i * bw + 1.5, (H - h) / 2, bw - 3, h, 1.5);
      g.fill();
    });
  },
};

function Visualizer({ analyser, playing, look }: { analyser: AnalyserNode | null; playing: boolean; look: Look }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const f: Frame = {
      g,
      freq: new Uint8Array(analyser?.frequencyBinCount ?? 128),
      wave: new Uint8Array(analyser?.fftSize ?? 256),
      peaks: new Float32Array(16),
      level: 12,
      ink: getComputedStyle(canvas).color,
    };
    const still = !playing || !analyser || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const frame = () => {
      if (still) {
        f.freq.fill(0);
        f.wave.fill(128);
      } else {
        analyser!.getByteFrequencyData(f.freq);
        analyser!.getByteTimeDomainData(f.wave);
        let swing = 0;
        for (const b of f.wave) swing = Math.max(swing, Math.abs(b - 128));
        f.level = Math.max(swing, f.level * 0.985, 12);
      }
      g.clearRect(0, 0, W, H);
      DRAW[look](f);
      if (!still) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [analyser, playing, look]);
  return <canvas ref={ref} aria-hidden style={{ width: W, height: H, display: "block" }} />;
}

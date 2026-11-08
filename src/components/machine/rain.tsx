"use client";

import { useEffect, useRef } from "react";
import { mxFonts } from "./font";

/**
 * The Lattice's rain: a faint field of characters over the whole backdrop,
 * with brighter columns falling through it, Matrix style. Move the pointer
 * and the characters light up behind it, leaving a trail that fades away.
 * The characters are machinespeak's: letters and digits, with Cyrillic,
 * Greek, katakana, kanji and runes mixed in.
 *
 * Drawn on one canvas at 30 frames a second, and only while Cora's scene is
 * the one showing (the site keeps every scene mounted). With reduced motion
 * it's a still field: no rain, no trail.
 */

const PLAIN = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+*=<>#$%&?:");
const ALIEN = Array.from("ЖЯФЩЫЭЮБДЛПИЙΣΛΠΩΨΞθλμｱｳｴｵｶｷｸｺｻｼｽﾀﾂﾃﾅﾈﾊﾋﾌﾐﾑﾒﾓﾔﾗﾘﾜﾝ機械零電網⟁⌬◬⍜ᚠᚢᚦᚱᛉ");
const glyph = () => {
  const set = Math.random() < 0.55 ? PLAIN : ALIEN;
  return set[Math.floor(Math.random() * set.length)];
};

/** One character per cell, this many px square. */
const CELL = 24;
const FONT_PX = 13;
const FPS = 30;
/** Brightness is drawn in this many steps (on a square-root scale, so the dim field keeps its texture). */
const STEPS = 18;
/** How often an idle column starts a new fall, per second: about one in four is falling at once. */
const SPAWN = 0.06;
/** How bright the field, the falls, their leading characters and the pointer's trail get (0–1). */
const FIELD = [0.015, 0.05] as const;
const FALL = 0.42;
const HEAD = 0.62;
const TRAIL = 0.6;
/** A lit cell keeps this share of its glow after a second (it's half gone in about 0.4s). */
const FADE = 0.18;
const INK = "242, 244, 245";

type Drop = { y: number; v: number; len: number };

export function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const scene = canvas.closest<HTMLElement>(".scene");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const family = getComputedStyle(canvas).getPropertyValue("--font-mx-mono").trim() || "ui-monospace, monospace";

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let chars: string[] = [];
    let base = new Float32Array(0);
    let glow = new Float32Array(0);
    let trail = new Float32Array(0);
    let drops: (Drop | null)[] = [];
    const buckets: number[][] = Array.from({ length: STEPS }, () => []);
    const heads: number[] = [];

    const spawn = (anywhere = false): Drop => ({
      y: anywhere ? Math.random() * (rows + 20) : -Math.random() * 8,
      v: 4 + Math.random() * 8,
      len: 10 + Math.floor(Math.random() * 20),
    });

    const setup = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      const n = cols * rows;
      chars = Array.from({ length: n }, glyph);
      base = Float32Array.from({ length: n }, () => FIELD[0] + Math.random() * (FIELD[1] - FIELD[0]));
      glow = new Float32Array(n);
      trail = new Float32Array(n);
      drops = Array.from({ length: cols }, () => (!still && Math.random() < 0.25 ? spawn(true) : null));
    };

    const step = (dt: number) => {
      drops.forEach((d, c) => {
        if (!d) {
          if (Math.random() < SPAWN * dt) drops[c] = spawn();
          return;
        }
        const from = Math.floor(d.y);
        d.y += d.v * dt;
        const to = Math.floor(d.y);
        // The head writes a fresh character into each cell it reaches.
        for (let r = Math.max(0, from + 1); r <= to && r < rows; r++) chars[r * cols + c] = glyph();
        if (to - d.len > rows) drops[c] = null;
      });
      // The field never quite holds still.
      for (let k = Math.ceil(chars.length * 0.003); k > 0; k--) chars[Math.floor(Math.random() * chars.length)] = glyph();
      const keep = FADE ** dt;
      for (let i = 0; i < glow.length; i++) if (glow[i] > 0.005) glow[i] *= keep;
    };

    const draw = () => {
      g.clearRect(0, 0, w, h);
      trail.fill(0);
      heads.length = 0;
      drops.forEach((d, c) => {
        if (!d) return;
        const top = Math.floor(d.y);
        for (let k = 0; k < d.len; k++) {
          const r = top - k;
          if (r < 0 || r >= rows) continue;
          const i = r * cols + c;
          // Brightest near the head, fading out into the field. 1 marks the head itself.
          trail[i] = k === 0 ? 1 : FALL * (1 - k / d.len) ** 0.9;
          if (k === 0) heads.push(i);
        }
      });
      for (const b of buckets) b.length = 0;
      for (let i = 0; i < chars.length; i++) {
        if (trail[i] === 1) continue;
        const a = Math.max(base[i], trail[i], glow[i]);
        buckets[Math.min(STEPS - 1, Math.floor(Math.sqrt(a) * STEPS))].push(i);
      }
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `${FONT_PX}px ${family}`;
      buckets.forEach((b, s) => {
        if (!b.length) return;
        g.fillStyle = `rgba(${INK}, ${(((s + 0.5) / STEPS) ** 2).toFixed(3)})`;
        for (const i of b) g.fillText(chars[i], (i % cols) * CELL + CELL / 2, Math.floor(i / cols) * CELL + CELL / 2);
      });
      // The leading character of each fall, a little brighter and heavier.
      g.font = `500 ${FONT_PX}px ${family}`;
      g.fillStyle = `rgba(${INK}, ${HEAD})`;
      for (const i of heads) g.fillText(chars[i], (i % cols) * CELL + CELL / 2, Math.floor(i / cols) * CELL + CELL / 2);
    };

    /* Characters light up along the pointer's path, brightest under it. */
    let last: { x: number; y: number; t: number } | null = null;
    const light = (x: number, y: number) => {
      const c0 = Math.floor(x / CELL);
      const r0 = Math.floor(y / CELL);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const c = c0 + dc;
          const r = r0 + dr;
          if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
          const i = r * cols + c;
          const v = TRAIL * (dr === 0 && dc === 0 ? 1 : dr && dc ? 0.3 : 0.5);
          if (glow[i] < 0.2) chars[i] = glyph();
          if (v > glow[i]) glow[i] = v;
        }
      }
    };
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const p = { x: e.clientX - r.left, y: e.clientY - r.top, t: e.timeStamp };
      // A pause (or the pointer coming back in somewhere else) starts a new stroke instead of joining the dots.
      const from = last && p.t - last.t < 150 ? last : p;
      const steps = Math.max(1, Math.ceil(Math.hypot(p.x - from.x, p.y - from.y) / (CELL / 2)));
      for (let s = 1; s <= steps; s++) light(from.x + ((p.x - from.x) * s) / steps, from.y + ((p.y - from.y) * s) / steps);
      last = p;
    };

    let raf = 0;
    let then = 0;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (t - then < 1000 / FPS - 2) return;
      const dt = Math.min(0.1, (t - then) / 1000);
      then = t;
      step(dt);
      draw();
    };
    const run = () => {
      if (raf || still) return;
      then = performance.now();
      raf = requestAnimationFrame(frame);
      window.addEventListener("pointermove", move, { passive: true });
    };
    const halt = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = null;
      window.removeEventListener("pointermove", move);
    };
    const sync = () => (scene?.dataset.on === "false" ? halt() : run());

    setup();
    draw();
    // Canvas text doesn't wait for web fonts: load the face, then draw again.
    Promise.all([document.fonts.load(`${FONT_PX}px ${family}`), document.fonts.load(`500 ${FONT_PX}px ${family}`)])
      .then(draw)
      .catch(() => {});
    const ro = new ResizeObserver(() => {
      setup();
      draw();
    });
    ro.observe(canvas);
    const mo = scene ? new MutationObserver(sync) : null;
    if (scene) mo!.observe(scene, { attributes: true, attributeFilter: ["data-on"] });
    sync();

    return () => {
      halt();
      ro.disconnect();
      mo?.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={`mx-rain ${mxFonts}`} aria-hidden />;
}

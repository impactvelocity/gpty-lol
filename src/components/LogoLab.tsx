"use client";

import { useState } from "react";
import { AGENTS } from "@/lib/agents";
import { Logo } from "./AgentSidebar";
import { SCENES, toneOf } from "./Scenes";

/**
 * Candidate wordmarks, by set (public/logo-lab/<set>/<id>.webp). The id is the
 * agent whose world the logo was drawn for; "normal" is the plain one.
 */
const SETS: Record<string, string[]> = {
  // A full outlined set: one per agent world, plus the plain one.
  outlined: ["normal", "icq", "msn", "skype", "facebook", "reddit", "slack", "caveman", "seance", "terminal", "fury", "bbs", "irc", "elf", "machine", "slots", "highlimit"],
  "readable-v2": ["icq", "msn", "seance"],
  // What the live logos were before the outlined set (ICQ, MSN and Mortimer: before readable-v2).
  previous: ["normal", "icq", "msn", "skype", "facebook", "reddit", "slack", "caveman", "seance", "terminal", "elf", "machine", "slots"],
  character: ["caveman", "seance", "reddit", "fury", "elf", "slots"],
  theme: ["normal", "icq", "msn", "skype", "facebook", "reddit", "slack"],
};

type Candidate = { key: string; label: string; src?: string };

/** "current" renders the live <Logo>; the rest are lab files. */
const CURRENT: Candidate = { key: "current", label: "current" };
const ALL: Candidate[] = Object.entries(SETS).flatMap(([set, ids]) =>
  ids.map((id) => ({ key: `${set}/${id}`, label: `${set} · ${id}`, src: `/logo-lab/${set}/${id}.webp` })),
);
const forAgent = (id: string) => ALL.filter((c) => c.key.endsWith(`/${id}`));

/** Every world the logo has to sit on: the agents, plus the Meet page. */
const WORLDS = [...AGENTS.map((a) => ({ id: a.id, name: `${a.name} · ${a.costume.short ?? a.costume.name}` })), { id: "meet", name: "Meet the Gptys" }];

/**
 * The top-left corner of the app as it really looks: the scene drawn at a
 * desktop size behind a 300px sidebar strip, the left shade over it, and the
 * logo where the sidebar puts it (24px in, 24px down, in a 32px row).
 */
function Tile({ world, candidate, height }: { world: string; candidate: Candidate; height: number }) {
  const scene = SCENES[world];
  return (
    <figure className="flex flex-col gap-1.5">
      <div
        data-tone={toneOf(world)}
        className="shell relative isolate h-[80px] w-[300px] overflow-hidden rounded-xl ring-1 ring-white/10"
      >
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-[900px] w-[1440px]">
          <div className="scene" data-on="true" style={{ background: scene.bg }}>
            {scene.draw()}
          </div>
          <div className="wp-side" />
        </div>
        <div className="relative z-10 flex h-8 items-center pl-6" style={{ marginTop: 24 }}>
          {candidate.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.src}
              alt=""
              draggable={false}
              style={{ height }}
              className="block w-auto select-none"
            />
          ) : (
            <Logo id={world === "meet" ? undefined : world} />
          )}
        </div>
      </div>
      <figcaption className="text-[11px] text-white/55">{candidate.label}</figcaption>
    </figure>
  );
}

export function LogoLab() {
  const [mode, setMode] = useState<"agent" | "everywhere">("agent");
  const [pick, setPick] = useState(ALL[0].key);
  const [height, setHeight] = useState(26);
  const [zoom, setZoom] = useState(1);
  const [onlyAlts, setOnlyAlts] = useState(true);

  const picked = ALL.find((c) => c.key === pick) ?? ALL[0];
  const worlds = mode === "agent" && onlyAlts ? WORLDS.filter((w) => forAgent(w.id).length > 0 || w.id === "meet") : WORLDS;

  return (
    <div className="min-h-dvh bg-[#121214] font-[family-name:var(--font-geist-sans)] text-white">
      <header className="sticky top-0 z-50 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-white/10 bg-[#121214]/90 px-6 py-4 backdrop-blur">
        <h1 className="text-[17px] font-semibold tracking-wide">Logo lab</h1>

        <div className="flex rounded-lg bg-white/5 p-0.5 text-[13px]">
          {(["agent", "everywhere"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 ${mode === m ? "bg-white/15" : "text-white/60 hover:text-white"}`}
            >
              {m === "agent" ? "Per agent" : "One logo everywhere"}
            </button>
          ))}
        </div>

        {mode === "everywhere" ? (
          <label className="flex items-center gap-2 text-[13px] text-white/70">
            Logo
            <select
              value={pick}
              onChange={(e) => setPick(e.target.value)}
              className="rounded-md bg-white/10 px-2 py-1 text-white"
            >
              {ALL.map((c) => (
                <option key={c.key} value={c.key} className="bg-[#1c1c22]">
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="flex items-center gap-2 text-[13px] text-white/70">
            <input type="checkbox" checked={onlyAlts} onChange={(e) => setOnlyAlts(e.target.checked)} />
            Only agents with alternatives
          </label>
        )}

        <label className="flex items-center gap-2 text-[13px] text-white/70">
          Candidate height
          <input type="range" min={18} max={40} value={height} onChange={(e) => setHeight(+e.target.value)} />
          <span className="w-9 tabular-nums">{height}px</span>
        </label>

        <div className="flex rounded-lg bg-white/5 p-0.5 text-[13px]">
          {[1, 2].map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`rounded-md px-3 py-1 ${zoom === z ? "bg-white/15" : "text-white/60 hover:text-white"}`}
            >
              {z}×
            </button>
          ))}
        </div>
        <span className="text-[12px] text-white/40">The current logo always renders at its real size (24–26px).</span>
      </header>

      <main className="space-y-8 px-6 py-6" style={{ zoom }}>
        {worlds.map((w) => (
          <section key={w.id}>
            <h2 className="mb-2 text-[13px] font-medium text-white/80">{w.name}</h2>
            <div className="flex flex-wrap gap-4">
              {mode === "agent" ? (
                <>
                  <Tile world={w.id} candidate={CURRENT} height={height} />
                  {(w.id === "meet" ? ALL.filter((c) => c.key.endsWith("/normal")) : forAgent(w.id)).map((c) => (
                    <Tile key={c.key} world={w.id} candidate={c} height={height} />
                  ))}
                </>
              ) : (
                <>
                  <Tile world={w.id} candidate={CURRENT} height={height} />
                  <Tile world={w.id} candidate={picked} height={height} />
                </>
              )}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

"use client";

import { type Agent, agentEra } from "@/lib/agents";
import { systemPromptFor } from "@/lib/personas";
import { Modal } from "./Modal";

/** An agent's profile card: who they are, when they live, what they sound like. */
export function AboutModal({
  open,
  onClose,
  agent,
}: {
  open: boolean;
  onClose: () => void;
  agent: Agent;
}) {
  const c = agent.costume;
  return (
    <Modal open={open} onClose={onClose} label={`About ${agent.name}`} className="w-[min(640px,94vw)]">
      <div
        className="relative h-28"
        style={{
          background: `radial-gradient(90% 120% at 30% 0%, color-mix(in srgb, ${c.accent} 40%, #1c1c20), #121216 80%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#121216] to-transparent" />
        <div className="absolute bottom-3 left-6 flex items-end gap-3">
          <span className="text-5xl drop-shadow-lg">{c.avatar}</span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{agent.name}</h2>
            <p className="text-sm text-zinc-300">{agentEra(agent)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md bg-black/40 px-2 py-1 text-sm text-zinc-200 hover:bg-black/60"
        >
          Esc
        </button>
      </div>

      <div className="max-h-[calc(88vh-7rem)] space-y-6 overflow-y-auto px-6 pb-6 pt-4">
        <p className="text-base text-zinc-200">{agent.bio}</p>
        <section>
          <h3 className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
            Knows the world up to
          </h3>
          <p className="text-zinc-300">
            {agent.knows
              ? `${agent.knows}. Anything after that hasn't happened yet, as far as ${agent.name} is concerned.`
              : c.year === "2199"
                ? "2199. Your century is ancient history."
                : "Now."}
          </p>
        </section>
        <section>
          <h3 className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">The look</h3>
          <p className="mb-2 text-zinc-300">{c.about.inspiration}</p>
          <ul className="space-y-1.5 text-sm text-zinc-400">
            {c.about.flourishes.map((f) => (
              <li key={f} className="flex gap-2">
                <span style={{ color: c.accent }}>✦</span>
                {f}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">The voice</h3>
          <p className="mb-2 text-zinc-300">{c.about.voice}</p>
          <details className="group rounded-lg bg-black/40 ring-1 ring-white/10">
            <summary className="cursor-pointer select-none px-3 py-2 text-sm text-zinc-300 hover:text-white">
              Show the system prompt
            </summary>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap px-3 pb-3 font-mono text-xs leading-relaxed text-zinc-400">
              {systemPromptFor(agent.id)}
            </pre>
          </details>
        </section>
      </div>
    </Modal>
  );
}

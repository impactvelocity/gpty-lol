"use client";

import { useState } from "react";
import type { Costume } from "@/lib/costumes";
import { systemPromptFor } from "@/lib/personas";
import { Modal } from "./Modal";
import { HACKATHON_URL } from "./SiteHeader";

export function AboutModal({
  open,
  onClose,
  costume,
  userId,
  threadCount,
}: {
  open: boolean;
  onClose: () => void;
  costume: Costume;
  userId: string;
  threadCount: number;
}) {
  const [tab, setTab] = useState<"costume" | "app">("costume");
  const tabBtn = (id: typeof tab, label: string) => (
    <button
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={`rounded-full px-3 py-1 text-sm transition ${
        tab === id ? "bg-white text-black" : "text-zinc-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Modal open={open} onClose={onClose} label="About" className="w-[min(720px,94vw)]">
      <div
        className="relative h-28"
        style={{
          background: `radial-gradient(90% 120% at 30% 0%, color-mix(in srgb, ${costume.accent} 40%, #1c1c20), #121216 80%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#121216] to-transparent" />
        <div className="absolute bottom-3 left-6 flex items-end gap-3">
          <span className="text-5xl drop-shadow-lg">{costume.avatar}</span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{costume.name}</h2>
            <p className="text-sm text-zinc-300">
              {costume.year} · {costume.tagline}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md bg-black/40 px-2 py-1 text-sm text-zinc-200 hover:bg-black/60"
        >
          Esc
        </button>
      </div>

      <div className="max-h-[calc(88vh-7rem)] overflow-y-auto px-6 pb-6 pt-3">
        <div className="mb-5 flex gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10 w-fit">
          {tabBtn("costume", "This costume")}
          {tabBtn("app", "About gpty.lol")}
        </div>

        {tab === "costume" ? (
          <div className="space-y-6">
            <section>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-widest text-orange-300">
                The look
              </h3>
              <p className="mb-2 text-zinc-300">{costume.about.inspiration}</p>
              <ul className="space-y-1.5 text-sm text-zinc-400">
                {costume.about.flourishes.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-orange-300">✦</span>
                    {f}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-widest text-orange-300">
                The voice
              </h3>
              <p className="mb-2 text-zinc-300">{costume.about.voice}</p>
              <p className="mb-2 text-sm text-zinc-400">
                Changing costume swaps the system prompt on the server. The conversation
                stays the same, so earlier replies keep their old voice and new replies
                use this one.
              </p>
              <details className="group rounded-lg bg-black/40 ring-1 ring-white/10">
                <summary className="cursor-pointer select-none px-3 py-2 text-sm text-zinc-300 hover:text-white">
                  Show the system prompt
                </summary>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap px-3 pb-3 font-mono text-xs leading-relaxed text-zinc-400">
                  {systemPromptFor(costume.id)}
                </pre>
              </details>
            </section>
          </div>
        ) : (
          <div className="space-y-5 text-sm text-zinc-300">
            <p className="text-base">
              <b className="text-white">gpty.lol</b> is a simple AI chat that changes costumes:
              thirteen of them, from a cave wall to a séance board to MSN Messenger to the bare
              machine. Each one restyles the whole app, down to the window chrome and wallpaper,
              and swaps the assistant&apos;s personality to match.
            </p>
            <ul className="space-y-1.5 text-zinc-400">
              <li>
                <span className="text-orange-300">✦</span> Cycle costumes with the ‹ › buttons,
                the <kbd className="rounded bg-white/10 px-1">[</kbd>{" "}
                <kbd className="rounded bg-white/10 px-1">]</kbd> keys, or open the picker with{" "}
                <kbd className="rounded bg-white/10 px-1">⌘K</kbd>.
              </li>
              <li>
                <span className="text-orange-300">✦</span> <b className="text-zinc-200">Share</b>{" "}
                copies a link like <code className="rounded bg-white/10 px-1 text-xs">gpty.lol/msn</code>{" "}
                that opens straight into that costume, with its own preview card.
              </li>
              <li>
                <span className="text-orange-300">✦</span> Trick or treat: chatting in a costume
                drops its candy in the 🎃 bag up top. Fill the bag by trying all of them.
              </li>
              <li>
                <span className="text-orange-300">✦</span> Threads are saved in this browser
                (localStorage) under an anonymous id:{" "}
                <code className="rounded bg-white/10 px-1 text-xs">{userId}</code>. You have{" "}
                {threadCount} saved {threadCount === 1 ? "thread" : "threads"}.
              </li>
              <li>
                <span className="text-orange-300">✦</span> Built with Next.js, the Vercel AI SDK,
                AI Elements and Tailwind, with Kiro.
              </li>
            </ul>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={HACKATHON_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-orange-400 px-4 py-2 font-medium text-black hover:bg-orange-300"
              >
                🎃 Kiroween hackathon ↗
              </a>
              <span className="rounded-full px-4 py-2 text-zinc-400 ring-1 ring-white/10">
                Made by Dylan
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

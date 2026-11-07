"use client";

import { ArrowRight, Clock3, MessagesSquare, Monitor } from "lucide-react";
import type { CSSProperties } from "react";
import { AGENTS, type Agent, agentEra, getAgent } from "@/lib/agents";
import { Gpty } from "./Gpty";

const REPO = "https://github.com/impactvelocity/gpty-lol";

/** One question, asked across the eras. Written in each gpty's voice. */
const SAME_QUESTION = "what's an iPhone?";
const ANSWERS: { id: string; text: string }[] = [
  { id: "caveman", text: "EYE-FONE? HRMM. CRAIG HAVE EYE. CRAIG HAVE NO FONE.\nIS SHINY ROCK THAT TALK? CRAIG WANT." },
  { id: "seance", text: "THE BOARD SPELLS: U-N-K-N-O-W-N.\nIs it a species of telephone, like Mr. Bell's contraption? Remarkable." },
  { id: "msn", text: "iphone?? lol whats that\nlike an ipod u can call ppl on?? that would be so sick omg :D" },
  { id: "skype", text: "Oh! Apple only just announced it. No buttons at all… not sure that'll catch on. Can you hear me okay?" },
  { id: "machine", text: "[recall] artifact class: early handheld slab.\nthis unit finds them adorable. conf=0.99" },
];

const STEPS = [
  {
    icon: Monitor,
    title: "Each one lives in an app",
    body: "MSN Messenger, Skype, mIRC, a midnight BBS, a séance board, a cave wall. Open a gpty and the chat window becomes its app.",
  },
  {
    icon: MessagesSquare,
    title: "They talk like their era",
    body: "Slang, in-jokes, the gadgets on their desk. Kayleigh types in lowercase with :P. Mortimer spells it out on the board.",
  },
  {
    icon: Clock3,
    title: "They only know their world",
    body: "Their memory stops at their year. Ask Kayleigh about the iPhone and you'll get a guess. Craig hasn't heard of the wheel.",
  },
];

function knows(a: Agent) {
  if (a.knows) return `Knows up to ${a.knows}`;
  if (a.costume.year === "2199") return "Writes from 2199";
  if (a.costume.year === "Now") return "Knows today";
  return "Lives at the North Pole";
}

/** What gptys are: a short, site-like page that opens beside the sidebar. */
export function MeetPage({ onOpenAgent }: { onOpenAgent: (id: string) => void }) {
  const first = getAgent("msn");
  return (
    <div className="no-scrollbar h-full overflow-y-auto rounded-[28px] bg-white/80 text-[#15131f] shadow-[0_30px_80px_-30px_rgba(60,40,110,.35)] ring-1 ring-black/5 backdrop-blur-2xl">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-14 pt-16 text-center md:px-12 md:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(167,139,250,.22),transparent_70%)]" />
        <p className="relative mb-4 inline-flex items-center gap-2 rounded-full bg-[#f3effc] px-3 py-1 text-[13px] font-medium text-[#6a52b8] ring-1 ring-[#e4dcf8]">
          12 gptys · 10,000 BC to 2199
        </p>
        <h1 className="relative mx-auto max-w-[760px] text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] md:text-[64px]">
          Meet the gptys
        </h1>
        <p className="relative mx-auto mt-5 max-w-[560px] text-[17px] leading-relaxed text-[#5b5870] md:text-[19px]">
          Little chatbots who each live inside a chat app from another time. They talk like
          their era, think like their era and only know what their era knew.
        </p>

        <div className="relative mx-auto mt-10 flex max-w-[940px] flex-wrap items-end justify-center gap-x-3 gap-y-4 md:gap-x-4">
          {AGENTS.map((a, i) => (
            <button
              key={a.id}
              onClick={() => onOpenAgent(a.id)}
              title={`${a.name} · ${agentEra(a)}`}
              className="sc-bob rounded-full transition-transform hover:-translate-y-1"
              style={{ "--d": `${4.5 + (i % 4) * 0.7}s`, "--dl": `${-i * 0.45}s` } as CSSProperties}
            >
              <Gpty agent={a} size={56} mood="watching" />
            </button>
          ))}
        </div>

        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onOpenAgent(first.id)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#15131f] px-5 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(21,19,31,.6)] transition-transform hover:-translate-y-0.5"
          >
            Say hi to {first.name} <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href="#roster"
            className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-semibold text-[#15131f] ring-1 ring-black/10 transition-colors hover:bg-black/[.03]"
          >
            See all twelve
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-16 md:px-12">
        <div className="mx-auto grid max-w-[980px] gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-3xl bg-[#f7f5fb] p-6 ring-1 ring-black/[.04]">
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#6a52b8] shadow-[0_2px_8px_rgba(60,40,110,.08)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#5b5870]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* One question across the eras */}
      <section className="px-6 pb-16 md:px-12">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[30px] font-bold tracking-[-0.03em] md:text-[36px]">
            Same question, five eras
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-center text-[16px] text-[#5b5870]">
            Everyone gets asked{" "}
            <span className="rounded-md bg-[#f3effc] px-1.5 py-0.5 font-medium text-[#6a52b8]">{SAME_QUESTION}</span>
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ANSWERS.map(({ id, text }) => {
              const a = getAgent(id);
              return (
                <button
                  key={id}
                  onClick={() => onOpenAgent(id)}
                  className="group flex flex-col rounded-3xl bg-white p-5 text-left ring-1 ring-black/[.06] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(60,40,110,.35)]"
                >
                  <span className="flex items-center gap-3">
                    <Gpty agent={a} size={34} />
                    <span className="leading-tight">
                      <span className="block text-[15px] font-semibold">{a.name}</span>
                      <span className="block text-[12.5px] text-[#8a879c]">{agentEra(a)}</span>
                    </span>
                  </span>
                  <span className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-[#2c2a3a]">{text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roster */}
      <section id="roster" className="scroll-mt-6 px-6 pb-16 md:px-12">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[30px] font-bold tracking-[-0.03em] md:text-[36px]">The whole family</h2>
          <p className="mx-auto mt-3 max-w-[520px] text-center text-[16px] text-[#5b5870]">
            Pick one to start a chat. Every chat is saved as a thread with that gpty.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => onOpenAgent(a.id)}
                className="group flex flex-col rounded-3xl bg-white p-5 text-left ring-1 ring-black/[.06] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(60,40,110,.35)]"
              >
                <span className="flex items-center justify-between">
                  <Gpty agent={a} size={44} />
                  <span
                    className="rounded-full px-2.5 py-1 text-[12px] font-medium"
                    style={{ color: `color-mix(in oklab, ${a.look.color}, black 30%)`, background: `color-mix(in srgb, ${a.look.color} 14%, white)` }}
                  >
                    {knows(a)}
                  </span>
                </span>
                <span className="mt-4 text-[18px] font-semibold tracking-[-0.01em]">{a.name}</span>
                <span className="text-[13px] text-[#8a879c]">{agentEra(a)}</span>
                <span className="mt-2 text-[14.5px] leading-relaxed text-[#5b5870]">{a.bio}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-[#15131f] opacity-60 transition-opacity group-hover:opacity-100">
                  Chat with {a.name} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[.06] px-6 py-6 text-[13px] text-[#8a879c] md:px-12">
        <span>gpty.lol · made by Dylan</span>
        <a href={REPO} target="_blank" rel="noreferrer" className="font-medium text-[#15131f] hover:underline">
          View on GitHub
        </a>
      </footer>
    </div>
  );
}

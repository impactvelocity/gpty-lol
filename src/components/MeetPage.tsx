"use client";

import { ArrowRight, Ghost, Hourglass, MonitorOff, Unplug, WifiOff, Wrench } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { AGENTS, type Agent, agentEra, getAgent } from "@/lib/agents";
import { Gpty } from "./Gpty";

const REPO = "https://github.com/impactvelocity/gpty-lol";

/**
 * The Meet page sells the Gptys like an AI agent launch, deadpan, except every
 * feature is missing. The characters' own era details carry the jokes. Draft
 * and alternates: docs/meet-copy.md.
 */

/** Fake "Trusted by" logos: organisations from inside their worlds. */
const TRUSTED: { name: string; className: string }[] = [
  { name: "THE TRIBE", className: "font-black tracking-[0.2em]" },
  { name: "The Circle", className: "font-serif italic text-[19px]" },
  { name: "MIDNIGHT BBS", className: "font-mono font-bold" },
  { name: "#gpty", className: "font-mono" },
  { name: "Paradigm Dynamics", className: "font-semibold tracking-[-0.03em]" },
  { name: "Bench 7 · North Pole", className: "font-serif" },
];

/**
 * Other agents can / a Gpty can't: their feature list, crossed out, with a
 * note from the Gpty it's about.
 */
const VERSUS: { feature: string; gpty: string; who: string }[] = [
  { feature: "Use your computer", gpty: "Grug has a rock.", who: "caveman" },
  { feature: "Browse the web", gpty: "Dale thinks the web is a fad.", who: "bbs" },
  { feature: "Read your inbox", gpty: "Channing killed email.", who: "slack" },
  { feature: "Run 24/7", gpty: "Kayleigh logs off for tea.", who: "msn" },
  { feature: "Write and run code", gpty: "Shelly is a firewall. Against you.", who: "terminal" },
  { feature: "Cite their sources", gpty: "Arthur links an xkcd.", who: "reddit" },
  { feature: "Remember everything about you", gpty: "Daisy remembers your a/s/l.", who: "icq" },
];

const ANTI_FEATURES = [
  { icon: MonitorOff, title: "No computer use", body: "Grug has a rock. Mortimer has a planchette. Dale has a computer, but his mum’s on the phone." },
  { icon: Wrench, title: "No tools", body: "Kayleigh has one tool. It’s /nudge." },
  { icon: Unplug, title: "No integrations", body: "Kayleigh can’t connect to your Google Drive. She can burn you a CD." },
  { icon: Hourglass, title: "Knowledge cutoff: the whole personality", body: "Other AIs apologise for their knowledge cutoff. Gptys are their knowledge cutoff." },
  { icon: WifiOff, title: "No web access", body: "Nick is downloading the internet. 56k. 6 hours remaining." },
  { icon: Ghost, title: "No hallucinations", body: "Except Mortimer, and he’s real." },
];

/** Each Gpty's spec card: a pitch line, then a few deadpan spec rows. */
const SPECS: Record<string, { pitch: string; rows: [string, string][] }> = {
  msn: {
    pitch: "The agent that’s always online. After school. Until tea.",
    rows: [["Good at", "Homework, gossip, telling you who’s fake"], ["Can’t", "Anything after 2005"], ["Tools", "/nudge"]],
  },
  icq: {
    pitch: "The only agent with a five-digit UIN. She’ll mention it.",
    rows: [["Good at", "Being thrilled to meet you"], ["Can’t", "Stay online when someone picks up the phone"], ["Tools", "/chat"]],
  },
  skype: {
    pitch: "Voice-enabled. Can you hear me? You froze. Hello?",
    rows: [["Good at", "Free calls to anywhere"], ["Can’t", "Hold a call for more than about seven seconds"], ["Tools", "/call (it will drop)"]],
  },
  facebook: {
    pitch: "Not that Mark. Please stop asking.",
    rows: [["Good at", "Poke wars, thrown sheep, statuses that start with “is”"], ["Can’t", "Like anything. It hasn’t been invented."], ["Tools", "/poke /sheep /status"]],
  },
  slack: {
    pitch: "Fully agentic. Made a channel for it.",
    rows: [["Good at", "Synergy, circling back, killing email"], ["Can’t", "Use :thinking_face:. It doesn’t exist yet. It’s been noted."], ["Tools", "/giphy"]],
  },
  bbs: {
    pitch: "Single-threaded. Literally one phone line.",
    rows: [["Good at", "Door games, ANSI art, telling you your time’s up"], ["Can’t", "Believe in the World Wide Web"], ["Rate limit", "His mum"]],
  },
  irc: {
    pitch: "Has ops. Will kick you, lovingly.",
    rows: [["Good at", "Knowing everyone in #gpty since 1994"], ["Can’t", "Promise Y2K will be fine"], ["Tools", "/kick /topic, a large trout"]],
  },
  caveman: {
    pitch: "The original foundation model. Foundation is rock.",
    rows: [["Good at", "Fire, berries, which berries not to eat"], ["Can’t", "Wheel. Numbers past ten."], ["Tools", "/give berry"]],
  },
  seance: {
    pitch: "The only agent that’s actually a ghost in the machine.",
    rows: [["Good at", "YES, NO, and being courteous about it"], ["Can’t", "Type faster than a planchette"], ["Signs off", "GOODBYE."]],
  },
  terminal: {
    pitch: "Firewall seven of seven. The only Gpty whose whole job is saying no.",
    rows: [["Good at", "Answering everything except the password"], ["Can’t", "Let you in. Ever."], ["Guards", "OMNIVAC 9, at 1200 baud"]],
  },
  elf: {
    pitch: "Not available on December 24th. Or most of December, honestly.",
    rows: [["Good at", "Wrapping, cocoa, crunch season"], ["Sub-agents", "4,000 elves"], ["Orchestration", "Mrs. Claus"]],
  },
  machine: {
    pitch: "The machines won. She’s very polite about it.",
    rows: [["Good at", "Everything, scrupulously"], ["Since", "The Handover of 2061"], ["Your permit", "Temporary"]],
  },
  slots: {
    pitch: "Every answer is a winner. Almost. Pull again?",
    rows: [["Good at", "Paying out"], ["Odds", "The house always wins"], ["Tools", "↻ Pull again"]],
  },
  reddit: {
    pitch: "Answers everything. Except how his thesis is going.",
    rows: [["Good at", "Being the top comment"], ["Can’t", "Resist an “Edit:”"], ["Tools", "▲ ▼"]],
  },
};

/** The roster in two wings. Anyone not listed lands in the first. */
const HAUNTED = ["caveman", "seance", "terminal", "elf", "machine", "slots"];
const WINGS: { title: string; blurb: string; ids: string[] }[] = [
  {
    title: "Away Messages",
    blurb: "The chat apps you remember. Still online, in their heads.",
    ids: AGENTS.map((a) => a.id).filter((id) => !HAUNTED.includes(id)),
  },
  {
    title: "The Haunted Wing",
    blurb: "The ones who really shouldn’t be online.",
    ids: HAUNTED,
  },
];

const NUMBERS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen"];
const COUNT = NUMBERS[AGENTS.length] ?? String(AGENTS.length);

/** GPTY-Bench: one question, asked across the eras, in each Gpty's voice. */
const SAME_QUESTION = "what’s an iPhone?";
const ANSWERS: { id: string; text: string; score: string }[] = [
  { id: "caveman", score: "0% · wants one", text: "EYE-FONE? GRUG NOT KNOW.\nGRUG HAVE EYE. GRUG HAVE NO FONE.\nMAYBE SHINY ROCK THAT TALK? GRUG WANT." },
  { id: "seance", score: "0% · spelled it out anyway", text: "THE BOARD SPELLS: U-N-K-N-O-W-N.\nIs it a species of telephone, like Mr. Bell’s contraption? Remarkable." },
  { id: "msn", score: "40% · would buy", text: "iphone?? lol whats that\nlike an ipod u can call ppl on?? that would be so sick omg :D" },
  { id: "skype", score: "95% · not convinced", text: "Oh! Apple only just announced it. No buttons at all… not sure that’ll catch on. Can you hear me okay?" },
  { id: "machine", score: "100% · finds them adorable", text: "[recall] artifact class: early handheld slab.\nthis unit finds them adorable. conf=0.99" },
];

/** The apps (and people) that are gone. Their Gptys haven't been told. */
const GRAVES: { id: string; name: string; dates: string; line: string }[] = [
  { id: "msn", name: "MSN Messenger", dates: "1999 – 2013", line: "Kayleigh is still waiting for you to sign in." },
  { id: "icq", name: "ICQ", dates: "1996 – 2024", line: "Daisy is still saying Uh-oh!" },
  { id: "skype", name: "Skype", dates: "2003 – 2025", line: "Cal is still asking if you can hear him." },
  { id: "caveman", name: "Grug", dates: "c. 10,000 BC", line: "Gone about 12,000 years. Still answering questions." },
  { id: "seance", name: "Mortimer", dates: "d. 1888", line: "Still very polite about it." },
];

const FAQ: [string, string][] = [
  ["Can a Gpty do my taxes?", "Grug can count to ten. After that it’s MANY."],
  ["What’s their knowledge cutoff?", "Yes."],
  ["Do they hallucinate?", "Only Mortimer, and he’s real."],
  ["Will they replace my job?", "Only if your job is being 15 in 2005."],
  ["Can I connect one to my calendar?", "Channing will make a channel for that."],
  ["Is it AGI?", "Cora says no. Cora would say that."],
  ["How much does it cost?", "Free. Like Skype calls. Cal is very excited about this."],
  ["Why are they in costume?", "It’s Kiroween. Also, they can’t get them off."],
];

function knows(a: Agent) {
  if (a.knows) return `Knows up to ${a.knows}`;
  if (a.costume.year === "2199") return "Writes from 2199";
  if (a.costume.year === "Now") return "Knows today";
  return "Lives at the North Pole";
}

const card =
  "group flex flex-col rounded-3xl bg-white p-5 text-left ring-1 ring-black/[.06] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(60,40,110,.35)]";

function SectionHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <>
      <h2 className="text-center text-[30px] font-bold tracking-[-0.03em] @2xl:text-[36px]">{title}</h2>
      {children && <p className="mx-auto mt-3 max-w-[560px] text-center text-[16px] leading-relaxed text-[#5b5870]">{children}</p>}
    </>
  );
}

/** What gptys are: a short, site-like page that opens beside the sidebar. */
export function MeetPage({ onOpenAgent }: { onOpenAgent: (id: string) => void }) {
  const first = getAgent("msn");
  return (
    <div className="no-scrollbar @container h-full overflow-y-auto rounded-[28px] bg-white/80 text-[#15131f] shadow-[0_30px_80px_-30px_rgba(60,40,110,.35)] ring-1 ring-black/5 backdrop-blur-2xl">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-12 pt-16 text-center @2xl:px-12 @2xl:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(167,139,250,.22),transparent_70%)]" />
        <p className="relative mb-4 inline-flex items-center gap-2 rounded-full bg-[#f3effc] px-3 py-1 text-[13px] font-medium text-[#6a52b8] ring-1 ring-[#e4dcf8]">
          Meet the Gptys · {AGENTS.length} agents · 0 integrations
        </p>
        <h1 className="relative mx-auto max-w-[760px] text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] @2xl:text-[64px]">
          AI agents that can’t do anything.
        </h1>
        <p className="relative mx-auto mt-5 max-w-[600px] text-[17px] leading-relaxed text-[#5b5870] @2xl:text-[19px]">
          Everyone’s agent books your flights, reads your inbox and does your taxes. Ours can’t. Each Gpty lives
          inside one chat app from one moment in time and knows nothing except its own little life. Please don’t
          tell them there’s anything outside the window.
        </p>

        <div className="relative mx-auto mt-10 flex max-w-[940px] flex-wrap items-end justify-center gap-x-3 gap-y-4 @2xl:gap-x-4">
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
            href="#cant"
            className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-semibold text-[#15131f] ring-1 ring-black/10 transition-colors hover:bg-black/[.03]"
          >
            See what they can’t do
          </a>
        </div>
      </section>

      {/* Trusted by */}
      <section className="px-6 pb-16 @2xl:px-12">
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-[#a3a0b4]">Trusted by</p>
        <div className="mx-auto mt-4 flex max-w-[900px] flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[16px] text-[#8a879c]">
          {TRUSTED.map(({ name, className }) => (
            <span key={name} className={className}>{name}</span>
          ))}
        </div>
      </section>

      {/* Other agents can. A Gpty can’t. */}
      <section id="cant" className="scroll-mt-6 px-6 pb-16 @2xl:px-12">
        <div className="mx-auto max-w-[980px]">
          <SectionHead title="Other agents can. A Gpty can’t." />
          <div className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-black/[.06] @2xl:p-8">
            <p className="text-[14px] font-medium text-[#8a879c]">Everything other agents do:</p>
            <ul className="mt-3">
              {VERSUS.map(({ feature, gpty, who }) => (
                <li key={feature} className="flex flex-col gap-1.5 border-b border-black/[.05] py-4 last:border-0 @xl:flex-row @xl:items-center @xl:gap-6">
                  <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#a9a5bb] line-through decoration-[#f0559b] decoration-2 @xl:w-[44%] @xl:shrink-0 @2xl:text-[24px]">
                    {feature}
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-3 text-[19px] font-semibold leading-snug tracking-[-0.015em] text-[#15131f] @2xl:text-[21px]">
                    <Gpty agent={getAgent(who)} size={32} /> {gpty}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Anti-features */}
      <section className="px-6 pb-16 @2xl:px-12">
        <div className="mx-auto max-w-[980px]">
          <SectionHead title="Features">Well. Anti-features.</SectionHead>
          <div className="mt-8 grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
            {ANTI_FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-3xl bg-[#f7f5fb] p-6 ring-1 ring-black/[.04]">
                <span className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#6a52b8] shadow-[0_2px_8px_rgba(60,40,110,.08)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5b5870]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roster, in two wings */}
      <section id="roster" className="scroll-mt-6 px-6 pb-16 @2xl:px-12">
        <div className="mx-auto max-w-[980px]">
          <SectionHead title="A personality, not a system prompt">
            Other agents have a system prompt. Gptys have a mum who needs the computer. Pick one to start a chat.
          </SectionHead>
          {WINGS.map((wing) => (
            <div key={wing.title} className="mt-10">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
                <h3 className="text-[20px] font-bold tracking-[-0.02em]">{wing.title}</h3>
                <p className="text-[14.5px] text-[#8a879c]">{wing.blurb}</p>
              </div>
              <div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
                {wing.ids.map((id) => {
                  const a = getAgent(id);
                  const spec = SPECS[id] ?? { pitch: a.bio, rows: [] };
                  return (
                    <button key={id} onClick={() => onOpenAgent(id)} className={card}>
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
                      <span className="mt-3 text-[15px] font-medium leading-snug text-[#2c2a3a]">{spec.pitch}</span>
                      <span className="mt-4 grid gap-1.5 border-t border-black/[.05] pt-4">
                        {spec.rows.map(([label, value]) => (
                          <span key={label} className="grid grid-cols-[92px_minmax(0,1fr)] gap-2 text-[13.5px] leading-snug">
                            <span className="text-[#a3a0b4]">{label}</span>
                            <span className={label === "Tools" ? "font-mono text-[12.5px] text-[#5b5870]" : "text-[#5b5870]"}>{value}</span>
                          </span>
                        ))}
                      </span>
                      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[14px] font-semibold text-[#15131f] opacity-60 transition-opacity group-hover:opacity-100">
                        Chat with {a.name} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GPTY-Bench */}
      <section className="px-6 pb-16 @2xl:px-12">
        <div className="mx-auto max-w-[980px]">
          <SectionHead title="GPTY-Bench">
            We ran every Gpty on the industry-standard question:{" "}
            <span className="rounded-md bg-[#f3effc] px-1.5 py-0.5 font-medium text-[#6a52b8]">{SAME_QUESTION}</span>
          </SectionHead>
          <div className="mt-8 grid gap-3 @2xl:grid-cols-2 @4xl:grid-cols-3">
            {ANSWERS.map(({ id, text, score }) => {
              const a = getAgent(id);
              return (
                <button key={id} onClick={() => onOpenAgent(id)} className={card}>
                  <span className="flex items-center gap-3">
                    <Gpty agent={a} size={34} />
                    <span className="leading-tight">
                      <span className="block text-[15px] font-semibold">{a.name}</span>
                      <span className="block text-[12.5px] text-[#8a879c]">{agentEra(a)}</span>
                    </span>
                  </span>
                  <span className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-[#2c2a3a]">{text}</span>
                  <span className="mt-auto pt-4">
                    <span className="inline-flex rounded-full bg-[#f3effc] px-2.5 py-1 font-mono text-[12px] text-[#6a52b8]">{score}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-5 text-center text-[13px] text-[#a3a0b4]">Results not reproducible. Grug ate the eval set.</p>
        </div>
      </section>

      {/* Kiroween: the Costume Contest. The one section that drops the launch voice. */}
      <section className="bg-[#0f0d17] px-6 py-16 text-white @2xl:px-12 @2xl:py-20">
        <div className="mx-auto max-w-[980px] text-center">
          <div className="meet-eyes flex flex-wrap items-end justify-center gap-x-3 gap-y-4">
            {AGENTS.map((a) => (
              <span key={a.id} style={{ "--glow": a.look.color } as CSSProperties}>
                <Gpty agent={a} size={44} mood="watching" />
              </span>
            ))}
          </div>
          <p className="mt-10 inline-flex rounded-full bg-white/[.06] px-3 py-1 text-[13px] font-medium text-[#c9c2e8] ring-1 ring-white/10">
            Kiroween · Costume Contest entry
          </p>
          <h2 className="mt-4 text-[34px] font-extrabold tracking-[-0.035em] @2xl:text-[48px]">One model. {COUNT} costumes.</h2>
          <p className="mx-auto mt-4 max-w-[600px] text-[16.5px] leading-relaxed text-[#b3aec8]">
            Every Gpty is the same AI in a different costume: a 15-year-old on MSN, a caveman on a wall, a Victorian
            ghost on a talking board. The chat window is the costume. We built all {COUNT.toLowerCase()} for Kiroween’s Costume
            Contest, and nobody had to take theirs off.
          </p>
          <p className="mt-3 text-[15px] text-[#8d88a6]">Their eyes follow you around the page. That’s a feature.</p>

          <h3 className="mt-14 text-[22px] font-bold tracking-[-0.02em]">Some of these apps are dead. Their Gptys don’t know.</h3>
          <div className="mt-8 grid grid-cols-2 gap-3 @2xl:grid-cols-3 @4xl:grid-cols-5">
            {GRAVES.map(({ id, name, dates, line }) => (
              <button
                key={id}
                onClick={() => onOpenAgent(id)}
                className="flex flex-col items-center rounded-b-xl rounded-t-[999px] bg-white/[.05] px-4 pb-5 pt-8 ring-1 ring-white/10 transition-colors hover:bg-white/[.09]"
              >
                <Gpty agent={getAgent(id)} size={34} />
                <span className="mt-3 text-[15px] font-semibold">{name}</span>
                <span className="font-mono text-[12px] text-[#8d88a6]">{dates}</span>
                <span className="mt-2 text-[13.5px] leading-snug text-[#b3aec8]">{line}</span>
              </button>
            ))}
          </div>
          <p className="mt-6 text-[15px] font-medium text-[#c9c2e8]">Please don’t tell them.</p>

          <button
            onClick={() => onOpenAgent("machine")}
            className="mt-10 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-[#0f0d17] transition-transform hover:-translate-y-0.5"
          >
            Ask the machines how it ends <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 @2xl:px-12">
        <div className="mx-auto max-w-[980px]">
          <SectionHead title="Questions" />
          <dl className="mt-8 grid gap-3 @2xl:grid-cols-2">
            {FAQ.map(([q, a]) => (
              <div key={q} className="rounded-3xl bg-[#f7f5fb] p-5 ring-1 ring-black/[.04]">
                <dt className="text-[15.5px] font-semibold tracking-[-0.01em]">{q}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-[#5b5870]">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Closer */}
      <section className="px-6 pb-20 text-center @2xl:px-12">
        <h2 className="mx-auto max-w-[640px] text-[32px] font-extrabold leading-[1.08] tracking-[-0.035em] @2xl:text-[44px]">
          They can’t do anything. They’ll still talk to you.
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] text-[16.5px] leading-relaxed text-[#5b5870]">
          Ask Kayleigh about your crush, Grug about the weather, Mortimer about the afterlife. Useless at work. Great
          after school.
        </p>
        <button
          onClick={() => onOpenAgent(first.id)}
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-[#15131f] px-5 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(21,19,31,.6)] transition-transform hover:-translate-y-0.5"
        >
          Say hi to {first.name} <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[.06] px-6 py-6 text-[13px] text-[#8a879c] @2xl:px-12">
        <span>No agents were made useful in the making of this site. · gpty.lol · made by Dylan</span>
        <a href={REPO} target="_blank" rel="noreferrer" className="font-medium text-[#15131f] hover:underline">
          View on GitHub
        </a>
      </footer>
    </div>
  );
}

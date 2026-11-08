"use client";

import { Play } from "lucide-react";
import { type CSSProperties, type ReactNode } from "react";
import { AGENTS, type Agent, agentEra } from "@/lib/agents";
import { HACKATHON, KIRO_GHOST_PATH } from "./AgentSidebar";
import { Gpty } from "./Gpty";
import { SongStage, ThemeStage, TimeStage } from "./meet/FeatureStages";
import { SiteFooter } from "./meet/SiteFooter";
import { mxFonts } from "./machine/font";
import { garble, XENO } from "./machine/garble";

/** The Gptys in the sidebar. Hidden ones keep their routes but stay off this page. */
const ROSTER: Agent[] = AGENTS.filter((a) => !a.hidden);

/**
 * The Meet page sells the Gptys like an AI agent launch, deadpan, except every
 * feature is missing. The characters' own era details carry the jokes. Draft
 * and alternates: docs/meet-copy.md.
 */

/**
 * The demo video. Set the YouTube id ("dQw4w9WgXcQ") when it's ready; left
 * empty, the frame shows a "coming soon" card instead.
 */
const DEMO_YOUTUBE_ID = "";

/**
 * Other agents can / a Gpty can't: their feature list, crossed out, with a
 * note from the Gpty it's about. One per Gpty, shown in roster order.
 */
const VERSUS: Record<string, { feature: string; gpty: string }> = {
  icq: { feature: "Remember everything about you", gpty: "Daisy remembers your asl" },
  msn: { feature: "Run 24/7", gpty: "Kayleigh: brb mum needs the computer" },
  skype: { feature: "Join your video calls", gpty: "Cal: Can you hear me? Is this on?" },
  facebook: { feature: "Browse the web", gpty: "Mark is on Facebook. That’s the web" },
  reddit: { feature: "Cite their sources", gpty: "Arthur links an xkcd" },
  slack: { feature: "Read your inbox", gpty: "Channing killed email" },
  caveman: { feature: "Use your computer", gpty: "Grug has a rock" },
  seance: { feature: "Never hallucinate", gpty: "Mortimer is the hallucination" },
  fury: { feature: "Write and run code", gpty: "Shelly is a firewall. Against you" },
  elf: { feature: "Ship on time", gpty: "Carol ships one night a year" },
  machine: { feature: "Take your instructions", gpty: "Cora gives them now. Politely" },
  slots: { feature: "Give a straight answer", gpty: "Lucky says pull again" },
};

/** What every Gpty comes with. */
const FEATURES = [
  {
    key: "time",
    title: "A personality trapped in time",
    body: "Each Gpty only knows its own moment. Other AIs apologise for their knowledge cutoff. Gptys are their knowledge cutoff.",
  },
  {
    key: "theme",
    title: "Its own theme and design",
    body: "Every Gpty lives in a chat app rebuilt just for it, from MSN nudges to a cave wall to a talking board.",
  },
  {
    key: "song",
    title: "A custom song to match the vibe",
    body: "Each one comes with an original theme song. Press play and the whole window sounds like its year.",
  },
] as const;

function SectionHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <>
      <h2 className="text-balance text-center text-[30px] font-bold tracking-[-0.03em] @2xl:text-[36px]">{title}</h2>
      {children && <p className="mx-auto mt-3 max-w-[560px] text-center text-[16px] leading-relaxed text-[#5b5870]">{children}</p>}
    </>
  );
}

const MAKER = {
  name: "Dylan Jones",
  site: "https://hidylanjones.com",
  avatar: "/dylan.webp",
  linkedin: "https://www.linkedin.com/in/hidylanjones",
};

const LINKEDIN_LOGO =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

/** Who made it: avatar, name (to the maker's site), and their LinkedIn. */
function BuiltBy() {
  return (
    <div className="relative mb-8 flex flex-wrap items-center justify-center gap-2 text-[14px] text-[#8a879c] @2xl:text-[15px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- a 5KB avatar; no need for the image optimiser */}
      <img src={MAKER.avatar} alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-white" />
      <span>
        Built by{" "}
        <a href={MAKER.site} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#15131f] underline-offset-4 hover:underline">
          {MAKER.name}
        </a>
      </span>
      <a
        href={MAKER.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${MAKER.name} on LinkedIn`}
        title={`${MAKER.name} on LinkedIn`}
        className="-m-1 grid h-7 w-7 place-items-center rounded-full text-[#5b5870] transition-colors hover:bg-black/[.05] hover:text-[#15131f]"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor">
          <path d={LINKEDIN_LOGO} />
        </svg>
      </a>
      <span aria-hidden className="mx-1 h-4 w-px bg-black/10" />
      <a
        href={HACKATHON}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-[#5b5870] underline-offset-4 transition-colors hover:text-[#15131f] hover:underline"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
          <path fillRule="evenodd" d={KIRO_GHOST_PATH} />
        </svg>
        Built for Kiroween
      </a>
    </div>
  );
}

/** What gptys are: a short, site-like page that opens beside the sidebar. */
export function MeetPage({ onOpenAgent }: { onOpenAgent: (id: string) => void }) {
  return (
    <div className="no-scrollbar @container h-full overflow-y-auto [&_button:not(:disabled)]:cursor-pointer rounded-[28px] bg-white/80 text-[#15131f] shadow-[0_30px_80px_-30px_rgba(60,40,110,.35)] ring-1 ring-black/5 backdrop-blur-2xl">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-12 pt-12 text-center @2xl:px-12 @2xl:pt-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(167,139,250,.22),transparent_70%)]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- the small wordmark, already sized for display */}
        <img src="/logos/gpty.svg" alt="gpty" width={83} height={36} className="relative mx-auto mb-5 h-9 w-auto @2xl:h-10" />
        <BuiltBy />
        <h1 className="relative mx-auto max-w-[780px] text-balance text-[46px] font-extrabold leading-[0.98] tracking-[-0.045em] @2xl:text-[68px] @4xl:text-[76px]">
          AI agents that can’t do anything
        </h1>
        <p className="relative mx-auto mt-6 max-w-[580px] text-balance text-[17px] leading-[1.55] tracking-[-0.005em] text-[#5b5870] @2xl:text-[20px]">
          Each Gpty lives inside one chat app from one moment in time&nbsp;— please don’t tell them there’s anything
          outside the window
        </p>

        <div className="relative mx-auto mt-10 flex max-w-sm flex-wrap items-end justify-center gap-x-2.5 gap-y-3 @2xl:max-w-md @2xl:gap-x-3">
          {ROSTER.map((a, i) => (
            <button
              key={a.id}
              onClick={() => onOpenAgent(a.id)}
              aria-label={`${a.name} · ${agentEra(a)}`}
              className="group/gpty sc-bob relative rounded-full transition-transform hover:z-10 hover:-translate-y-1 hover:[animation-play-state:paused] focus-visible:z-10"
              style={{ "--d": `${4.5 + (i % 4) * 0.7}s`, "--dl": `${-i * 0.45}s` } as CSSProperties}
            >
              <Gpty agent={a} size={56} mood="watching" />
              {/* Name and era, in a small dark tooltip above. */}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-xl bg-black/85 px-3.5 py-2 text-[14.5px] font-medium text-white opacity-0 backdrop-blur-md transition-[opacity,translate] duration-150 group-hover/gpty:translate-y-0 group-hover/gpty:opacity-100 group-focus-visible/gpty:translate-y-0 group-focus-visible/gpty:opacity-100"
              >
                <span className="font-semibold">{a.name}</span>
                <span className="text-white/60"> · {agentEra(a)}</span>
              </span>
            </button>
          ))}
        </div>

      </section>

      {/* Demo video */}
      <section id="demo" aria-label="Demo video" className="scroll-mt-6 px-6 pb-16 @2xl:px-12">
        <div className="mx-auto max-w-[980px] rounded-[28px] bg-[#f3effc] p-2 ring-1 ring-[#e4dcf8] @2xl:p-3">
          <div className="relative aspect-video overflow-hidden rounded-[20px] bg-[#0f0d17] shadow-[0_24px_48px_-24px_rgba(60,40,110,.5)]">
            {DEMO_YOUTUBE_ID ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${DEMO_YOUTUBE_ID}?rel=0`}
                title="gpty.lol demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="meet-eyes absolute inset-0 flex flex-col items-center justify-center gap-6 text-white">
                <div className="flex items-end gap-2">
                  {ROSTER.slice(0, 5).map((a) => (
                    <span key={a.id} style={{ "--glow": a.look.color } as CSSProperties}>
                      <Gpty agent={a} size={30} mood="watching" />
                    </span>
                  ))}
                </div>
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 @2xl:h-16 @2xl:w-16">
                  <Play className="ml-0.5 h-6 w-6 fill-current" />
                </span>
                <p className="text-[14px] text-white/55">Demo video coming soon</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Other agents can. A Gpty can’t. */}
      <section id="cant" className="scroll-mt-6 px-6 pb-16 @2xl:px-12">
        <div className="mx-auto max-w-[980px]">
          <SectionHead title={"Other agents have features — ours have excuses"} />
          <div className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-black/[.06] @2xl:p-8">
            <ul>
              {ROSTER.filter((a) => VERSUS[a.id]).map((a) => (
                <li key={a.id} className="flex flex-col items-start gap-1.5 border-b border-black/[.05] py-4 last:border-0 @xl:flex-row @xl:items-center @xl:gap-6">
                  <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#a9a5bb] line-through decoration-[#f0559b] decoration-2 @xl:w-[44%] @xl:shrink-0 @2xl:text-[24px]">
                    {VERSUS[a.id].feature}
                  </span>
                  <button
                    onClick={() => onOpenAgent(a.id)}
                    title={`Chat with ${a.name}`}
                    className="group flex min-w-0 flex-1 items-center gap-3 text-left text-[19px] font-semibold leading-snug tracking-[-0.015em] text-[#15131f] @2xl:text-[21px]"
                  >
                    <span className="shrink-0 transition-transform group-hover:-translate-y-0.5">
                      <Gpty agent={a} size={32} />
                    </span>
                    {a.id === "machine" ? (
                      // Cora speaks machine: her line comes out in alien glyphs, untranslated.
                      <span className={`${mxFonts} font-[family-name:var(--font-mx-mono)] text-[17px] font-medium tracking-normal underline-offset-4 group-hover:underline @2xl:text-[19px]`}>
                        <span aria-hidden>{garble(VERSUS[a.id].gpty, "meet:versus", XENO)}</span>
                        <span className="sr-only">{VERSUS[a.id].gpty}</span>
                      </span>
                    ) : (
                      <span className="underline-offset-4 group-hover:underline">{VERSUS[a.id].gpty}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features: what every Gpty comes with */}
      <section className="px-6 pb-16 @2xl:px-12">
        <div className="mx-auto max-w-[980px]">
          <SectionHead title="What every Gpty comes with" />
          <div className="mt-8 grid gap-4 @4xl:grid-cols-3">
            {FEATURES.map(({ key, title, body }) => (
              <div
                key={key}
                className="group/card flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-black/[.06] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(60,40,110,.4)]"
              >
                {key === "time" && <TimeStage />}
                {key === "theme" && <ThemeStage />}
                {key === "song" && <SongStage />}
                <div className="flex flex-1 flex-col p-5 @2xl:p-6">
                  <span className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6a52b8]">
                    {key === "time" ? "Personality" : key === "theme" ? "Design" : "Music"}
                  </span>
                  <h3 className="text-balance text-2xl font-medium leading-tight tracking-[-0.02em]">{title}</h3>
                  <p className="mt-2 text-lg leading-relaxed text-[#5b5870]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

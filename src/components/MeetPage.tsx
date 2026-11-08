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
  slack: { feature: "Read your inbox", gpty: "Channing made a channel for that" },
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
    eyebrow: "Personality",
    title: "A personality trapped in time",
    body: "Each Gpty lives in its year and won’t hear otherwise. Tell Daisy it’s not 2000 and she’ll say lol ok",
  },
  {
    key: "theme",
    eyebrow: "Design",
    title: "Its own world, logo and all",
    body: "Every Gpty lives in a chat app rebuilt just for it, from MSN nudges to a cave wall to a talking board",
  },
  {
    key: "song",
    eyebrow: "Music",
    title: "A custom song to match the vibe",
    body: "Every Gpty’s song sounds exactly like its year. Press play and it’s 2005 again. Or 1888. Or 10,000 BC",
  },
] as const;

/** Brand marks from Simple Icons (CC0), each drawn on a 24 × 24 grid. */
const CLAUDE_LOGO =
  "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z";
const SUNO_LOGO = "M16.5 0C20.642 0 24 5.373 24 12h-9c0 6.627-3.358 12-7.5 12C3.358 24 0 18.627 0 12h9c0-6.627 3.358-12 7.5-12Z";
const ELEVENLABS_LOGO = "M4.6035 0v24h4.9317V0zm9.8613 0v24h4.9317V0z";
const OPENAI_LOGO =
  "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z";

const mark = (d: string, color: string, rule?: "evenodd") => (
  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill={color}>
    <path d={d} fillRule={rule} />
  </svg>
);

/** What gpty.lol was made with, shown under the feature cards. */
const BUILT_WITH: { name: string; href: string; icon: ReactNode }[] = [
  { name: "Kiro IDE", href: "https://kiro.dev", icon: mark(KIRO_GHOST_PATH, "#7c3aed", "evenodd") },
  { name: "Claude Opus 5.5", href: "https://www.anthropic.com/claude/opus", icon: mark(CLAUDE_LOGO, "#D97757") },
  { name: "Suno", href: "https://suno.com", icon: mark(SUNO_LOGO, "#000000") },
  { name: "ElevenLabs", href: "https://elevenlabs.io", icon: mark(ELEVENLABS_LOGO, "#000000") },
  { name: "GPT Image", href: "https://openai.com/index/image-generation-api/", icon: mark(OPENAI_LOGO, "#000000") },
];

/** One feature card: its art on top, then the eyebrow, title and copy. */
function FeatureCard({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children: ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-black/[.06]">
      {children}
      <div className="flex flex-1 flex-col p-5 pt-2 @2xl:p-6 @2xl:pt-2">
        <span className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6a52b8]">{eyebrow}</span>
        <h3 className="text-balance text-2xl font-bold leading-tight tracking-[-0.02em]">{title}</h3>
        <p className="mt-2 text-base leading-relaxed text-[#5b5870]">{body}</p>
      </div>
    </div>
  );
}

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
    <div className="relative mb-8 flex flex-wrap items-center justify-center gap-2 text-[15px] text-[#4a475c] @2xl:text-[16px]">
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
        className="-m-1 grid h-7 w-7 place-items-center rounded-full text-[#3d3a4f] transition-colors hover:bg-black/[.05] hover:text-[#15131f]"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor">
          <path d={LINKEDIN_LOGO} />
        </svg>
      </a>
      <span aria-hidden className="mx-1 h-4 w-px bg-black/15" />
      <a
        href={HACKATHON}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-[#3d3a4f] underline-offset-4 transition-colors hover:text-[#15131f] hover:underline"
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
        <BuiltBy />
        <h1 className="relative mx-auto max-w-[780px] text-balance text-[46px] font-extrabold leading-[0.98] tracking-[-0.045em] @2xl:text-[68px] @4xl:text-[76px]">
          AI Agents that can’t do anything
        </h1>
        <p className="relative mx-auto mt-6 max-w-[640px] text-pretty text-[17px] leading-[1.55] tracking-[-0.005em] text-[#5b5870] @2xl:text-[20px]">
          They can’t book flights or read your inbox, but they’ll{" "}
          <br className="hidden @2xl:inline" />
          talk to you all night like it’s 2005
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
          <SectionHead title={"Other Agents have features\u00a0— ours have personality"} />
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
            {FEATURES.map(({ key, eyebrow, title, body }) => (
              <FeatureCard key={key} eyebrow={eyebrow} title={title} body={body}>
                {key === "time" && <TimeStage />}
                {key === "theme" && <ThemeStage />}
                {key === "song" && <SongStage />}
              </FeatureCard>
            ))}
          </div>

          {/* Built with */}
          <div className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Built with">
              {BUILT_WITH.map(({ name, href, icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-3.5 text-[14px] font-medium text-[#3d3a4f] ring-1 ring-black/[.08] transition-[transform,box-shadow,color] hover:-translate-y-0.5 hover:text-[#15131f] hover:shadow-[0_8px_18px_-10px_rgba(60,40,110,.4)]"
                >
                  {icon}
                  {name}
                </a>
              ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

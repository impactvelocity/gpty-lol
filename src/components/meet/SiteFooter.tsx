import Link from "next/link";
import { HACKATHON } from "@/components/AgentSidebar";
import { GITHUB_LOGO, LINKEDIN_LOGO, MAKER, REPO } from "@/lib/maker";
import { Graveyard, GROUND, Moon, NightSky } from "./graveyard";

/*
 * The Meet page's footer, the same night-sky graveyard as LotteryClock's: a headline under the
 * moon, the old chat apps' headstone with a Kiro ghost rising out of it, then the maker's links.
 */

const linkClass =
  "text-white/80 underline underline-offset-4 decoration-white/25 transition-colors hover:text-white hover:decoration-white";

const LINKS = [
  { id: "github", href: REPO, label: "Source on GitHub", d: GITHUB_LOGO },
  { id: "linkedin", href: MAKER.linkedin, label: `${MAKER.name} on LinkedIn`, d: LINKEDIN_LOGO },
];

export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-x-clip text-white" style={{ background: GROUND }}>
      <NightSky />
      <Moon />
      <div className="mx-auto max-w-6xl px-6 pb-14 pt-24 @xl:px-10 @xl:pb-24 @xl:pt-32">
        {/* The hackathon line: a headline in the night sky and a simple link to the entry */}
        <div className="text-center">
          <h2 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.3] tracking-tight @xl:text-5xl @xl:leading-[1.25]">
            Built for{" "}
            <a
              href={HACKATHON}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF9A4D] transition-colors hover:text-[#ffb27a]"
            >
              Kiroween
            </a>
            {" "}Costume Contest
          </h2>
          <p className="mx-auto mt-5 max-w-md text-balance text-xl font-medium text-white/75 @xl:text-2xl">No agents were made useful in the making of this site</p>
        </div>
      </div>

      <Graveyard />

      {/* The ground the graveyard stands on, over the sky */}
      <div className="px-6 pb-10 @xl:px-10" style={{ background: GROUND }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 @xl:flex-row @xl:items-center @xl:justify-between">
            {/* The wordmark, then who made it */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <Link href="/" aria-label="gpty.lol" className="inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element -- the small wordmark, flipped to read on the night ground */}
                <img src="/logos/normal.webp" alt="gpty" width={90} height={36} className="h-7 w-auto hue-rotate-180 invert" />
              </Link>
              <span aria-hidden className="hidden h-5 w-px bg-white/15 @xl:block" />
              <a
                href={MAKER.site}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a 5KB avatar; no need for the image optimiser */}
                <img src={MAKER.avatar} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover ring-1 ring-white/20" />
                <span>
                  Built by <span className="font-semibold text-white/90 group-hover:text-white">{MAKER.name}</span>
                </span>
              </a>
            </div>

            {/* What it's built with, then the source code and my own links */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <p className="text-sm text-white/60">
                Built with{" "}
                <a href="https://kiro.dev" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Kiro IDE
                </a>{" "}
                and{" "}
                <a href="https://www.anthropic.com/claude" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Claude
                </a>
              </p>
              <div className="flex gap-2">
                {LINKS.map((l) => (
                  <a
                    key={l.id}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={l.label}
                    title={l.label}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d={l.d} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

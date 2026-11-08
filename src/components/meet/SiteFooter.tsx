import Link from "next/link";
import { HACKATHON } from "@/components/AgentSidebar";
import { Graveyard, GROUND, Moon, NightSky } from "./graveyard";

/*
 * The Meet page's footer, the same night-sky graveyard as LotteryClock's: a headline under the
 * moon, the old chat apps' headstone with a Kiro ghost rising out of it, then the maker's links.
 */

const REPO = "https://github.com/impactvelocity/gpty-lol";

const MAKER = {
  name: "Dylan Jones",
  site: "https://hidylanjones.com",
  linkedin: "https://www.linkedin.com/in/hidylanjones",
};

const linkClass =
  "text-white/80 underline underline-offset-4 decoration-white/25 transition-colors hover:text-white hover:decoration-white";

const GITHUB =
  "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12";
const LINKEDIN =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

const LINKS = [
  { id: "github", href: REPO, label: "Source on GitHub", d: GITHUB },
  { id: "linkedin", href: MAKER.linkedin, label: `${MAKER.name} on LinkedIn`, d: LINKEDIN },
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
                <img src="/dylan.webp" alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover ring-1 ring-white/20" />
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

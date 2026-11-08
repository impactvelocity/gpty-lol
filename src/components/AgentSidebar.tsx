"use client";

import { ArrowUpRight } from "lucide-react";
import { AGENTS, type Agent, agentEra } from "@/lib/agents";
import { ACTIVE_ROWS } from "./activeRows";
import { Gpty, type Mood } from "./Gpty";

/** Each agent is a little gpty: its own shape and color, with eyes. */
export function AgentAvatar({ agent, size = 40, mood = "idle" }: { agent: Agent; size?: number; mood?: Mood }) {
  return <Gpty agent={agent} size={size} mood={mood} />;
}

const REPO = "https://github.com/impactvelocity/gpty-lol";

/** A Kiro-style ghost (24 × 24, evenodd): the eyes are cut out. */
export const KIRO_GHOST_PATH =
  "M13 3C17.5 3 20 6 20 10C20 13.5 19.5 16 20.5 18.5C21 19.8 19.8 20.6 18.6 20C17.5 19.5 16.5 19.4 15.6 20.3C13.8 22 11 22 9.3 20.4C7.6 21.6 4.6 21.8 3.6 20.6C5.5 19.4 6.2 17 6.3 14C6.4 11.5 6 9 6.6 7.4C7.6 4.6 10 3 13 3ZM9.9 10.6a1.25 1.75 0 1 0 2.5 0a1.25 1.75 0 1 0 -2.5 0ZM14.3 10.6a1.25 1.75 0 1 0 2.5 0a1.25 1.75 0 1 0 -2.5 0Z";
export const HACKATHON = "https://kiroween.devpost.com/";

/** A Kiro-style ghost in the current text color. */
function KiroGhost() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center">
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor" aria-hidden>
        <path fillRule="evenodd" d={KIRO_GHOST_PATH} />
      </svg>
    </span>
  );
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/**
 * The gpty wordmark, dressed for whichever agent is open: every agent has its
 * own in public/logos, and the Meet page (or an unknown id) wears normal.webp.
 * Each one carries its own outline, so it reads on any scene as it is.
 */
export function Logo({ id }: { id?: string }) {
  const src = `/logos/${id && AGENTS.some((a) => a.id === id) ? id : "normal"}.webp`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="gpty.lol" width={60} height={24} draggable={false} className="block h-6 w-auto select-none" />
  );
}

/**
 * The logo as the way home: a real link to /meet (so it opens in a new tab
 * with ⌘/Ctrl or the middle button), but a plain click switches in place.
 */
export function LogoLink({ id, onMeet }: { id?: string; onMeet: () => void }) {
  return (
    <a
      href="/meet"
      aria-label="gpty.lol: Meet the Gptys"
      title="Meet the Gptys"
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onMeet();
      }}
      className="-m-1 rounded-lg p-1 transition-transform duration-150 hover:scale-[1.04] active:scale-[0.97]"
    >
      <Logo id={id} />
    </a>
  );
}

/** Three of the family, huddled together: the icon for Meet the gptys. */
function Family() {
  const [a, b, c] = ["msn", "caveman", "skype"].map((id) => AGENTS.find((x) => x.id === id)!);
  return (
    <span className="relative block h-10 w-10 shrink-0">
      <span className="absolute left-0 top-[9px]"><Gpty agent={b} size={20} /></span>
      <span className="absolute right-0 top-[9px]"><Gpty agent={c} size={20} /></span>
      <span className="absolute left-1/2 top-[3px] -translate-x-1/2"><Gpty agent={a} size={24} /></span>
    </span>
  );
}

export function AgentSidebar({
  agentId,
  isDraft,
  meet,
  mood,
  onOpenAgent,
  onMeet,
}: {
  agentId: string;
  isDraft: boolean;
  /** The Meet the gptys page is open (no agent is). */
  meet: boolean;
  onMeet: () => void;
  /** What the open agent is doing; the others rest. */
  mood: Mood;
  onOpenAgent: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* The logo and GitHub, 24px down: level with the top of the chat window beside it. */}
      <div className="mb-3 mt-6 flex h-8 shrink-0 items-center justify-between pl-6 pr-3">
        <LogoLink id={meet ? undefined : agentId} onMeet={onMeet} />
        <div className="flex items-center gap-0.5 text-[var(--shell-text)]">
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            aria-label="gpty.lol on GitHub"
            title="GitHub"
            className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)]"
          >
            <GitHubMark className="h-[17px] w-[17px]" />
          </a>
        </div>
      </div>

      {/* What gptys are: opens a page beside the sidebar. */}
      <div className="mx-3 shrink-0">
        <button
          onClick={onMeet}
          aria-current={meet ? "page" : undefined}
          className={`group flex w-full items-center gap-3.5 rounded-2xl px-3 py-2 text-left ring-1 ring-[var(--shell-ring)] transition-[background-color,box-shadow] duration-200 ${
            meet
              ? "bg-[var(--shell-active)] shadow-[var(--shell-shadow)] backdrop-blur-md"
              : "shell-kiro backdrop-blur-sm"
          }`}
        >
          <Family />
          <span className="min-w-0 flex-1 truncate text-[15px] font-medium tracking-wide">Meet the Gptys</span>
        </button>
      </div>

      <nav className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-3" aria-label="Agents">
        <ul className="space-y-0.5">
          {/* Hidden agents stay out of the list unless one is open (e.g. via its URL). */}
          {AGENTS.filter((a) => !a.hidden || a.id === agentId).map((a) => {
            const open = !meet && a.id === agentId;
            // The open agent can dress its row as its own app.
            const Themed = open ? ACTIVE_ROWS[a.id] : undefined;
            if (Themed) {
              return (
                <li key={a.id}>
                  <Themed
                    agent={a}
                    mood={mood}
                    onClick={() => onOpenAgent(a.id)}
                    aria-current={isDraft ? "page" : undefined}
                    title={`New chat with ${a.name}`}
                  />
                </li>
              );
            }
            return (
              <li key={a.id}>
                <button
                  onClick={() => onOpenAgent(a.id)}
                  aria-current={open && isDraft ? "page" : undefined}
                  title={`New chat with ${a.name}`}
                  className={`group flex w-full items-center gap-3.5 rounded-2xl px-3 py-2 text-left transition-[background-color,box-shadow] duration-200 ${
                    open
                      ? "bg-[var(--shell-active)] shadow-[var(--shell-shadow)] ring-1 ring-[var(--shell-ring)] backdrop-blur-md"
                      : "hover:bg-[var(--shell-hover)] hover:backdrop-blur-sm"
                  }`}
                >
                  <AgentAvatar agent={a} mood={open ? mood : "idle"} />
                  <span className="shrink-0 text-[16px] font-medium tracking-wide">{a.name}</span>
                  {/* On hover: the app this gpty lives in. It truncates, never the name. */}
                  <span className="shell-badge ml-auto min-w-0 text-[12px] font-medium text-[var(--shell-soft)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="truncate">
                      {a.costume.short ? `${a.costume.short} · ${a.costume.year}` : agentEra(a)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Made for the Kiroween hackathon. */}
      <div className="mx-3 shrink-0 py-3">
        <a
          href={HACKATHON}
          target="_blank"
          rel="noreferrer"
          className="shell-kiro group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left backdrop-blur-sm"
        >
          <KiroGhost />
          <span className="min-w-0 flex-1 truncate text-[14px] font-medium tracking-wide">Built for Kiroween</span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--shell-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}

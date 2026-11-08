"use client";

import { Check, Ellipsis, Mail, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { AGENTS, type Agent, agentEra, getAgent } from "@/lib/agents";
import { GITHUB_LOGO, LINKEDIN_LOGO, MAKER, REPO, X_LOGO } from "@/lib/maker";
import { SHARE_TITLE } from "@/lib/site";
import { Family, HACKATHON, KIRO_GHOST_PATH } from "./AgentSidebar";
import { Gpty } from "./Gpty";

/**
 * A link that opens gpty.lol on one agent (gpty.lol/?agent=msn), or on the
 * Meet page when there's no agent. ChatApp reads ?agent= on load.
 */
export function shareLink(agentId?: string) {
  const url = new URL("/", window.location.origin);
  if (agentId) url.searchParams.set("agent", agentId);
  return url.toString();
}

function shareText(a?: Agent) {
  return a ? `Chat with ${a.name} on gpty.lol. ${a.bio}` : `${SHARE_TITLE}. Meet the Gptys on gpty.lol.`;
}

function Mark({ d, className = "h-4 w-4", evenOdd }: { d: string; className?: string; evenOdd?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d={d} fillRule={evenOdd ? "evenodd" : undefined} />
    </svg>
  );
}

/**
 * A sheet for sharing gpty.lol: pick a gpty (or all of them), copy its link,
 * or send it somewhere. Opens on whichever agent is open.
 */
/** Scenes that are night or near-black: the sheet goes dark to match them. */
const DARK_SCENES = new Set(["caveman", "seance", "bbs", "irc", "terminal", "fury", "elf", "machine", "slots", "highlimit"]);

export function ShareModal({ agentId, onClose }: { agentId?: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const copyRef = useRef<HTMLButtonElement>(null);
  const [picked, setPicked] = useState<string | undefined>(agentId);
  const [copied, setCopied] = useState(false);
  const [canShare] = useState(() => typeof navigator !== "undefined" && "share" in navigator);

  const agent = picked ? getAgent(picked) : undefined;
  const link = shareLink(agent?.id);
  const text = shareText(agent);
  // Hidden agents stay out of the picker, unless that's who you're sharing.
  const roster = AGENTS.filter((a) => !a.hidden || a.id === agentId);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    copyRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard API blocked (some embedded browsers): copy from the selected field,
      // and if even that fails, leave the link selected to copy by hand.
      const field = document.getElementById("gpty-share-link") as HTMLInputElement | null;
      field?.select();
      if (!document.execCommand("copy")) return;
    }
    setCopied(true);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: agent ? `${agent.name} · gpty.lol` : "gpty.lol", text, url: link });
    } catch {
      // Dismissed: nothing to do.
    }
  };

  const enc = encodeURIComponent;
  const targets: { label: string; href?: string; onClick?: () => void; icon: ReactNode }[] = [
    {
      label: "Post on X",
      href: `https://x.com/intent/post?text=${enc(text)}&url=${enc(link)}`,
      icon: <Mark d={X_LOGO} />,
    },
    {
      label: "Email",
      href: `mailto:?subject=${enc(agent ? `${agent.name} on gpty.lol` : "gpty.lol")}&body=${enc(`${text}\n\n${link}`)}`,
      icon: <Mail className="h-[18px] w-[18px]" strokeWidth={2.2} />,
    },
    ...(canShare ? [{ label: "More", onClick: nativeShare, icon: <Ellipsis className="h-5 w-5" strokeWidth={2.4} /> }] : []),
  ];

  const tile = "bg-[var(--sh-tile)] transition-colors hover:bg-[var(--sh-tile-hover)]";
  const accent = agent?.look.color ?? "#8a4fd8";

  return (
    <dialog
      ref={ref}
      // Dressed for the scene it opened over, not whichever gpty is picked inside.
      data-theme={agentId && DARK_SCENES.has(agentId) ? "dark" : "light"}
      aria-labelledby="gpty-share-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="share-sheet mb-0 mt-auto w-full max-w-full overflow-visible bg-transparent p-0 font-[family-name:var(--font-geist-sans)] text-[var(--sh-ink)] backdrop:bg-black/50 sm:m-auto sm:w-[min(560px,calc(100vw-48px))]"
    >
      <div className="no-scrollbar max-h-[92dvh] overflow-y-auto rounded-t-[32px] bg-[var(--sh-bg)] px-6 pb-6 pt-7 text-left shadow-[var(--sh-shadow)] sm:rounded-[32px] sm:px-8 sm:pb-7 sm:pt-8">
        {/* Who you're sharing */}
        <div className="flex items-start gap-4">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
            style={{ background: `color-mix(in srgb, ${accent} var(--sh-tint), var(--sh-bg))` }}
          >
            {agent ? <Gpty key={agent.id} agent={agent} size={42} mood="watching" /> : <Family />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="gpty-share-title" className="text-xl font-bold leading-tight tracking-[-0.02em] sm:text-2xl">
              {agent ? `Share ${agent.name}` : "Share gpty.lol"}
            </h2>
            <p className="mt-1 text-sm leading-snug text-[var(--sh-soft)] sm:text-[15px]">
              {agent ? (
                <>
                  The link opens a new chat with {agent.name}, in{" "}
                  <span className="whitespace-nowrap">{agentEra(agent)}</span>.
                </>
              ) : (
                "The link opens Meet the Gptys, with all of them."
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-[var(--sh-icon)] transition-colors hover:bg-[var(--sh-tile)]"
          >
            <X className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>

        {/* Pick a gpty */}
        <div role="radiogroup" aria-label="Who to share" className="mt-5 flex flex-wrap gap-1">
          <PickButton label="All the Gptys" on={!agent} onClick={() => setPicked(undefined)} accent="#8a4fd8">
            <span className="scale-[.8]">
              <Family />
            </span>
          </PickButton>
          {roster.map((a) => (
            <PickButton key={a.id} label={a.name} on={a.id === agent?.id} onClick={() => setPicked(a.id)} accent={a.look.color}>
              <Gpty agent={a} size={30} mood={a.id === agent?.id ? "watching" : "idle"} />
            </PickButton>
          ))}
        </div>

        {/* The link, with its copy button */}
        <div className="mt-5 flex items-center gap-2 rounded-full bg-[var(--sh-tile)] p-1.5 pl-5">
          <input
            id="gpty-share-link"
            readOnly
            value={link}
            aria-label="Share link"
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 truncate bg-transparent text-[15px] text-[var(--sh-ink)] outline-none"
          />
          <button
            ref={copyRef}
            type="button"
            onClick={copy}
            className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[var(--sh-btn)] px-6 text-sm font-bold text-[var(--sh-btn-ink)] transition-transform active:scale-[.97]"
          >
            {copied && <Check className="h-4 w-4" strokeWidth={3} />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>

        {/* Elsewhere */}
        <div className={`mt-3 grid gap-2 ${targets.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {targets.map((t) => {
            const cls = `flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm font-semibold ${tile}`;
            const inner = (
              <>
                {t.icon}
                {t.label}
              </>
            );
            return t.href ? (
              <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer" className={cls}>
                {inner}
              </a>
            ) : (
              <button key={t.label} type="button" onClick={t.onClick} className={cls}>
                {inner}
              </button>
            );
          })}
        </div>

        {/* Who made it, and what for */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-[var(--sh-line)] pt-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- a 5KB avatar; no need for the image optimiser */}
            <img src={MAKER.avatar} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[var(--sh-ink)]" />
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--sh-soft)]">Built by</div>
              <a
                href={MAKER.site}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold leading-tight underline-offset-4 hover:underline"
              >
                {MAKER.name}
              </a>
            </div>
            <div className="ml-1 flex items-center gap-1.5">
              <a
                href={MAKER.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${MAKER.name} on LinkedIn`}
                title={`${MAKER.name} on LinkedIn`}
                className={`grid h-9 w-9 place-items-center rounded-full ${tile}`}
              >
                <Mark d={LINKEDIN_LOGO} className="h-[15px] w-[15px]" />
              </a>
              <a
                href={REPO}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="gpty.lol on GitHub"
                title="Source on GitHub"
                className={`grid h-9 w-9 place-items-center rounded-full ${tile}`}
              >
                <Mark d={GITHUB_LOGO} className="h-4 w-4" />
              </a>
            </div>
          </div>

          <a href={HACKATHON} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2.5">
            <Mark d={KIRO_GHOST_PATH} className="h-7 w-7 shrink-0" evenOdd />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--sh-soft)]">Built for</div>
              <div className="text-base font-bold leading-tight underline-offset-4 group-hover:underline">Kiroween</div>
            </div>
          </a>
        </div>
      </div>
    </dialog>
  );
}

function PickButton({
  label,
  on,
  onClick,
  accent,
  children,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
  accent: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-11 w-11 cursor-pointer place-items-center rounded-xl transition-[background-color,box-shadow,transform] duration-150 active:scale-95 ${
        on ? "" : "hover:bg-[var(--sh-tile)]"
      }`}
      style={on ? { background: `color-mix(in srgb, ${accent} var(--sh-tint), var(--sh-bg))`, boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
    >
      {children}
    </button>
  );
}

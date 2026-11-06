"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Check, Dices, Share2 } from "lucide-react";
import { COSTUMES, SAMPLE_QUESTION, type Costume } from "@/lib/costumes";
import { LAYOUTS } from "./layouts";
import type { ChatLine, ThreadItem } from "./layouts/types";
import { Modal } from "./Modal";

/** Virtual screen each preview is rendered at before being scaled down to the card. */
const W = 980;
const H = 640;
const noop = () => {};

/**
 * The real layout, rendered with a canned exchange and shrunk to fit the card,
 * so the picker shows exactly what you'll get. Inert: no focus, no clicks.
 */
function Preview({ costume }: { costume: Costume }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [now] = useState(() => Date.now());

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lines: ChatLine[] = [
    { id: "q", role: "user", text: SAMPLE_QUESTION, at: now - 60_000 },
    { id: "a", role: "assistant", text: costume.sample, at: now - 45_000 },
  ];
  const threads: ThreadItem[] = [
    { id: "p", title: SAMPLE_QUESTION, preview: costume.sample, updatedAt: now },
  ];
  const Layout = LAYOUTS[costume.layout];

  return (
    <div ref={box} className="relative aspect-[980/640] overflow-hidden">
      {scale > 0 && (
        <div
          inert
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 origin-top-left p-5"
          style={{ width: W, height: H, transform: `scale(${scale})` }}
        >
          <Layout
            costume={costume}
            lines={lines}
            busy={false}
            waiting={false}
            error={false}
            onSend={noop}
            onStop={noop}
            threads={threads}
            activeId="p"
            onSelectThread={noop}
            onNewThread={noop}
            onDeleteThread={noop}
          />
        </div>
      )}
    </div>
  );
}

async function shareBag(total: number): Promise<"shared" | "copied" | "failed"> {
  const url = window.location.origin;
  const text = `I trick-or-treated all ${total} costumes on gpty.lol 🎃🍬`;
  if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
    try {
      await navigator.share({ title: "gpty.lol", text, url });
      return "shared";
    } catch {
      return "failed";
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}

export function Wardrobe({
  open,
  current,
  collected,
  onPick,
  onSurprise,
  onClose,
}: {
  open: boolean;
  current: string;
  collected: Set<string>;
  onPick: (c: Costume) => void;
  onSurprise: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const full = collected.size === COSTUMES.length;
  return (
    <Modal open={open} onClose={onClose} label="Costumes" className="w-[min(1120px,94vw)]">
      <div className="max-h-[88vh] overflow-y-auto p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Pick a costume</h2>
            <p className="text-sm text-zinc-400">
              Thirteen costumes, from 10,000 BC to 2199 — each changes how gpty looks{" "}
              <em>and</em> how it talks. Here&apos;s every one answering “{SAMPLE_QUESTION}”
            </p>
            <p className="mt-1 text-sm">
              {full ? (
                <span className="font-medium text-amber-300">
                  🎃 FULL BAG — you&apos;ve chatted in all {COSTUMES.length}!
                </span>
              ) : (
                <span className="text-zinc-500">
                  🍬 {collected.size}/{COSTUMES.length} collected — chat in a costume to earn its candy.
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {full && (
              <button
                onClick={async () => {
                  if ((await shareBag(COSTUMES.length)) !== "copied") return;
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="flex items-center gap-1.5 rounded-md bg-amber-300 px-2.5 py-1 text-sm font-medium text-black hover:bg-amber-200"
              >
                {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                {copied ? "Copied!" : "Share your bag"}
              </button>
            )}
            <button
              onClick={onSurprise}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              <Dices className="h-4 w-4" /> Surprise me
            </button>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              Esc
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COSTUMES.map((c, i) => {
            const on = c.id === current;
            return (
              // A div, not a button: the preview contains the layout's own buttons.
              // The real button below stretches over the whole card.
              <div
                key={c.id}
                className={`group relative overflow-hidden rounded-xl border transition hover:-translate-y-0.5 has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-white/70 ${
                  on ? "border-white/60 bg-white/10" : "border-white/10 bg-white/[.04] hover:border-white/30"
                }`}
              >
                <div
                  className="relative"
                  style={{
                    background: `radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, ${c.accent} 34%, #1c1c20), #141417 80%)`,
                  }}
                >
                  <Preview costume={c} />
                  <span className="absolute left-2 top-2 rounded bg-black/55 px-1.5 text-[11px] font-medium tabular-nums text-white/90">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {on && (
                    <span className="absolute right-2 top-2 rounded bg-white px-1.5 text-[11px] font-medium text-black">
                      Wearing
                    </span>
                  )}
                  {collected.has(c.id) && (
                    <span
                      className={`absolute top-2 rounded bg-black/55 px-1 text-[12px] ${on ? "right-[4.6rem]" : "right-2"}`}
                      title="Candy collected"
                    >
                      🍬
                    </span>
                  )}
                </div>
                <div className="flex gap-3 p-3">
                  <span className="text-2xl leading-none" aria-hidden>
                    {c.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <button
                        onClick={() => onPick(c)}
                        aria-pressed={on}
                        aria-label={`${c.name}, ${c.year}. ${c.tagline}`}
                        className="text-left font-medium outline-none after:absolute after:inset-0 after:content-['']"
                      >
                        {c.name}
                      </button>
                      <span className="text-xs text-zinc-500">{c.year}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-zinc-400">{c.tagline}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

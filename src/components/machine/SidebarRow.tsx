"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import { mxFonts } from "./font";
import { garble, noise, XENO } from "./garble";
import "./machine.css";

/** What she's doing, in machinespeak like everything else of hers. */
const SAYS = {
  idle: garble("listening. always.", "pick", XENO),
  thinking: garble("sampling", "pick:thinking", XENO),
  typing: garble("transmitting", "pick:typing", XENO),
  error: garble("signal lost", "pick:error", XENO),
};

/** A few characters of static that churn while Cora samples. */
function Static() {
  const [s, setS] = useState(() => noise(5));
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setS(noise(5)), 90);
    return () => clearInterval(t);
  }, []);
  return <span aria-hidden>{s}</span>;
}

/**
 * The open Cora in the sidebar: a black chip with a hairline edge and two
 * corner ticks, like registration marks, what she's doing in small mono
 * machinespeak underneath, and a dot that blinks cyan while she answers.
 * Open, her gpty goes white and glitches now and then (more while she's busy).
 */
export function MachineActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const busy = mood === "thinking" || mood === "typing";
  const white = useMemo(() => ({ ...agent, look: { ...agent.look, color: "#f2f4f5", eyes: "#000104" } }), [agent]);
  return (
    <button type="button" {...button} className={`${mxFonts} mx-pick group`} data-busy={busy || undefined}>
      <Gpty agent={white} size={40} mood={mood} className="mx-pick-gpty" />
      <span className="min-w-0 flex-1">
        <span className="mx-pick-name">
          {agent.name}
          {/* The machines' own count of the years. */}
          <small>0001</small>
        </span>
        <span className="mx-pick-sub" data-busy={busy || undefined} data-error={mood === "error" || undefined} aria-hidden>
          {mood === "thinking" ? (
            <>
              {SAYS.thinking} <Static />
            </>
          ) : mood === "typing" ? (
            SAYS.typing
          ) : mood === "error" ? (
            SAYS.error
          ) : (
            SAYS.idle
          )}
        </span>
      </span>
      <span className="mx-pick-dot" data-busy={busy || undefined} aria-hidden />
    </button>
  );
}

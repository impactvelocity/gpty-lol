"use client";

import { useEffect, useState } from "react";
import type { ActiveRowProps } from "@/components/activeRows";
import { Gpty } from "@/components/Gpty";
import { mxFonts } from "./font";
import { garble, noise } from "./garble";
import "./machine.css";

const IDLE = garble("listening. always.", "pick", 2);

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
 * The open Cora in the sidebar: a chamfered chip with the same turning
 * oil-slick edge as her window, her gpty in a dashed orbit, her name in the
 * machines' display face and a little signal on the right that races while
 * she answers.
 */
export function MachineActiveRow({ agent, mood, ...button }: ActiveRowProps) {
  const busy = mood === "thinking" || mood === "typing";
  return (
    <button type="button" {...button} className={`${mxFonts} mx-pick group`}>
      <span className="mx-pick-av">
        <Gpty agent={agent} size={32} mood={mood} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mx-pick-name">
          {agent.name.toLowerCase()}
          <small>{agent.costume.year}</small>
        </span>
        <span className="mx-pick-sub" data-busy={busy || undefined} data-error={mood === "error" || undefined}>
          {mood === "thinking" ? (
            <>
              sampling <Static />
            </>
          ) : mood === "typing" ? (
            "transmitting ▮▮▮"
          ) : mood === "error" ? (
            "link severed"
          ) : (
            IDLE
          )}
        </span>
      </span>
      <span className="mx-pick-wave" data-busy={busy || undefined} aria-hidden>
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}

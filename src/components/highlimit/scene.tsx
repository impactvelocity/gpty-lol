"use client";

import type { CSSProperties } from "react";
import { hlFonts } from "./font";
import "./highlimit.css";

/**
 * The site's backdrop for High Limit: the quiet room at the back of the
 * casino. Deep green walls with faint deco fans, one warm light pooled over
 * the machine, dark paneling under a brass rail. At the foot of the agent
 * list (where there's room), the brass plaque by the door.
 */
export function HighLimitScene() {
  return (
    <div className={`hl-sc ${hlFonts}`}>
      <div className="hl-sc-wall" />
      <div className="hl-sc-lamp sc-glow" style={{ "--d": "16s" } as CSSProperties} />
      <div className="hl-sc-panel" />
      <div className="hl-sc-vignette" />
      <div className="hl-sc-under sc-under">
        <div className="hl-plaque">
          <b>High Limit</b>
          <span>Minimum spin · 25 tokens</span>
        </div>
      </div>
    </div>
  );
}

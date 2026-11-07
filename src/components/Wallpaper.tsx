"use client";

import { SCENES } from "./Scenes";

/**
 * The site's background is the open agent's scene (see Scenes.tsx). All of
 * them are stacked and the current one fades in, so switching agents
 * crossfades the world along with the window. Scenes you can't see are paused.
 */
export function Wallpaper({ current }: { current: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[#121214]">
      {Object.entries(SCENES).map(([id, scene]) => {
        const on = id === current;
        return (
          <div key={id} className="scene" data-on={on} style={{ background: scene.bg, opacity: on ? 1 : 0 }}>
            {scene.draw()}
          </div>
        );
      })}
      {/* A soft shade on the left keeps the sidebar readable, with no panel edge. */}
      <div className="wp-side" />
    </div>
  );
}

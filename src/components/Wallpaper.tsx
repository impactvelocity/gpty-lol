"use client";

import { COSTUMES } from "@/lib/costumes";

/**
 * A desktop wallpaper per era, drawn in CSS (see `.wp-*` in globals.css).
 * All of them are stacked and the current one fades in, so switching
 * costume crossfades the desktop along with the window.
 */
export function Wallpaper({ current }: { current: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[#121214]">
      {COSTUMES.map((c) => (
        <div
          key={c.id}
          className={`wp wp-${c.id}`}
          style={{ opacity: c.id === current ? 1 : 0 }}
        />
      ))}
      {/* Darkens the top and bottom edges so the site header and strip stay readable. */}
      <div className="wp-scrim" />
    </div>
  );
}

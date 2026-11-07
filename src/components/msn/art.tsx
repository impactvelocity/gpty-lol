"use client";

/**
 * Hand-drawn art for the MSN costume: the butterfly, the glossy toolbar
 * icons, the default display picture and the header scene. Shared gradients
 * are defined once in <MsnDefs />, which the layout renders, so every icon
 * stays a handful of paths.
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot =
  | "scene" | "backdrop" | "buddyPicture" | "userPicture"
  | "invite" | "files" | "webcam" | "audio" | "activities" | "games";

/**
 * Generated pictures that replace the drawn fallbacks (prompts in
 * src/components/msn/ART.md). Remove a line to fall back to the drawing.
 * Icons are 128px and pictures 512px WebP; the wide ones stay 1536px.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  scene: "/msn/scene.webp",
  backdrop: "/msn/backdrop.webp",
  buddyPicture: "/msn/dp-buddy.webp",
  userPicture: "/msn/dp-you.webp",
  invite: "/msn/icon-invite.webp",
  files: "/msn/icon-files.webp",
  webcam: "/msn/icon-webcam.webp",
  audio: "/msn/icon-audio.webp",
  activities: "/msn/icon-activities.webp",
  games: "/msn/icon-games.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/* ───────── Shared gradients ───────── */

export function MsnDefs() {
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden focusable="false">
      <defs>
        {/* Emoticons */}
        <radialGradient id="msn-face" cx=".36" cy=".28" r=".8">
          <stop offset="0" stopColor="#fffbd4" />
          <stop offset=".36" stopColor="#ffe55e" />
          <stop offset=".78" stopColor="#ffc31d" />
          <stop offset="1" stopColor="#f29600" />
        </radialGradient>
        <radialGradient id="msn-face-red" cx=".36" cy=".28" r=".8">
          <stop offset="0" stopColor="#ffe3d6" />
          <stop offset=".4" stopColor="#ff8e6e" />
          <stop offset=".8" stopColor="#f0482a" />
          <stop offset="1" stopColor="#c42a12" />
        </radialGradient>
        <radialGradient id="msn-face-blush" cx=".36" cy=".28" r=".8">
          <stop offset="0" stopColor="#fff0e0" />
          <stop offset=".4" stopColor="#ffc38f" />
          <stop offset=".8" stopColor="#ff8a5c" />
          <stop offset="1" stopColor="#e65a32" />
        </radialGradient>
        <radialGradient id="msn-face-devil" cx=".36" cy=".28" r=".8">
          <stop offset="0" stopColor="#f6dcff" />
          <stop offset=".4" stopColor="#c27af0" />
          <stop offset=".8" stopColor="#8a34cc" />
          <stop offset="1" stopColor="#5d1694" />
        </radialGradient>
        <linearGradient id="msn-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="msn-heart" cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor="#ffc0c8" />
          <stop offset=".35" stopColor="#ff4560" />
          <stop offset=".85" stopColor="#d0102e" />
          <stop offset="1" stopColor="#9e0019" />
        </radialGradient>
        <radialGradient id="msn-bulb" cx=".42" cy=".36" r=".7">
          <stop offset="0" stopColor="#fffff0" />
          <stop offset=".45" stopColor="#fff38a" />
          <stop offset="1" stopColor="#ffc21a" />
        </radialGradient>
        <linearGradient id="msn-note" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8f6cff" />
          <stop offset="1" stopColor="#3a1fa6" />
        </linearGradient>

        {/* Icons */}
        <linearGradient id="msn-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fcbff" />
          <stop offset=".5" stopColor="#2f86f0" />
          <stop offset="1" stopColor="#0c4cbc" />
        </linearGradient>
        <linearGradient id="msn-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bdf58a" />
          <stop offset=".5" stopColor="#4fc22c" />
          <stop offset="1" stopColor="#23861a" />
        </linearGradient>
        <linearGradient id="msn-orange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset=".5" stopColor="#ff9c22" />
          <stop offset="1" stopColor="#e2600a" />
        </linearGradient>
        <linearGradient id="msn-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9d8e" />
          <stop offset=".5" stopColor="#ea3a2c" />
          <stop offset="1" stopColor="#a5160d" />
        </linearGradient>
        <linearGradient id="msn-folder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffeaa0" />
          <stop offset=".55" stopColor="#ffd055" />
          <stop offset="1" stopColor="#efa81c" />
        </linearGradient>
        <linearGradient id="msn-folder-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2c24a" />
          <stop offset="1" stopColor="#d48e0e" />
        </linearGradient>
        <linearGradient id="msn-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e2e9f3" />
        </linearGradient>
        <radialGradient id="msn-silver" cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#e6ebf2" />
          <stop offset=".85" stopColor="#a6b2c4" />
          <stop offset="1" stopColor="#7a879c" />
        </radialGradient>
        <linearGradient id="msn-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d2de" />
          <stop offset="1" stopColor="#6f7c92" />
        </linearGradient>
        <radialGradient id="msn-lens" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#8fd0ff" />
          <stop offset=".35" stopColor="#1f5fb8" />
          <stop offset=".75" stopColor="#0b1e44" />
          <stop offset="1" stopColor="#03070f" />
        </radialGradient>
        <linearGradient id="msn-die" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d3dbe7" />
        </linearGradient>
        <radialGradient id="msn-orb" cx=".38" cy=".3" r=".75">
          <stop offset="0" stopColor="#e4ffc9" />
          <stop offset=".45" stopColor="#6fdc3a" />
          <stop offset="1" stopColor="#259410" />
        </radialGradient>
        <linearGradient id="msn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4aa3ff" />
          <stop offset="1" stopColor="#bfe2ff" />
        </linearGradient>

        {/* Butterfly wings */}
        <linearGradient id="msn-wing-o" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffb347" />
          <stop offset=".6" stopColor="#ff7a1a" />
          <stop offset="1" stopColor="#e2470a" />
        </linearGradient>
        <linearGradient id="msn-wing-b" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#7cc4ff" />
          <stop offset=".6" stopColor="#2a86f5" />
          <stop offset="1" stopColor="#0b4fc4" />
        </linearGradient>
        <linearGradient id="msn-wing-g" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8ef6c" />
          <stop offset=".6" stopColor="#47bd2a" />
          <stop offset="1" stopColor="#1f8a14" />
        </linearGradient>
        <linearGradient id="msn-wing-y" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff07a" />
          <stop offset=".6" stopColor="#ffd21f" />
          <stop offset="1" stopColor="#f0a400" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ───────── Brand ───────── */

/** A four-color glossy butterfly. */
export function Butterfly({ className = "h-4 w-4", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden>
      <g stroke="rgba(10,30,70,.35)" strokeWidth=".6" strokeLinejoin="round">
        <path d="M15 15.4C12.6 9.6 7.8 4.6 4.3 5.6 1.4 6.5 2.2 11.6 6 14.2c2.4 1.6 5.6 2.2 9 2.1Z" fill="url(#msn-wing-o)" />
        <path d="M17 15.4c2.4-5.8 7.2-10.8 10.7-9.8 2.9.9 2.1 6-1.7 8.6-2.4 1.6-5.6 2.2-9 2.1Z" fill="url(#msn-wing-b)" />
        <path d="M15 17.4c-4.4-.4-8.6 1.6-9 5-.4 3.2 3 4.6 5.8 2.6 1.9-1.4 3-4.4 3.2-7.6Z" fill="url(#msn-wing-g)" />
        <path d="M17 17.4c4.4-.4 8.6 1.6 9 5 .4 3.2-3 4.6-5.8 2.6-1.9-1.4-3-4.4-3.2-7.6Z" fill="url(#msn-wing-y)" />
      </g>
      <g fill="#fff" opacity=".55">
        <ellipse cx="7.4" cy="8.6" rx="3" ry="1.4" transform="rotate(32 7.4 8.6)" />
        <ellipse cx="24.6" cy="8.6" rx="3" ry="1.4" transform="rotate(-32 24.6 8.6)" />
        <ellipse cx="9.2" cy="20.6" rx="2" ry=".9" transform="rotate(-20 9.2 20.6)" />
        <ellipse cx="22.8" cy="20.6" rx="2" ry=".9" transform="rotate(20 22.8 20.6)" />
      </g>
      <path d="M15.4 11.2C14.6 8 13.2 5.6 11.6 4.4M16.6 11.2c.8-3.2 2.2-5.6 3.8-6.8" stroke="#13254f" strokeWidth=".8" fill="none" strokeLinecap="round" />
      <ellipse cx="16" cy="16.6" rx="1.35" ry="6.2" fill="#13254f" />
      <ellipse cx="15.6" cy="14.2" rx=".4" ry="2.4" fill="#fff" opacity=".45" />
    </svg>
  );
}

/** A glossy presence orb, as next to a contact's name. */
export function StatusOrb({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden>
      <circle cx="7" cy="7" r="6" fill="url(#msn-orb)" stroke="#1f7d0d" strokeWidth=".7" />
      <ellipse cx="7" cy="4.4" rx="3.6" ry="2" fill="url(#msn-gloss)" opacity=".9" />
    </svg>
  );
}

/** The two-buddy icon, used in small places like the window title. */
export function Buddies({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="15" cy="6.6" r="3.8" fill="url(#msn-blue)" stroke="#123f8f" strokeWidth=".7" />
      <path d="M8.6 21.4c.3-6.6 2.8-9.6 6.4-9.6s6.1 3 6.4 9.6Z" fill="url(#msn-blue)" stroke="#123f8f" strokeWidth=".7" />
      <circle cx="8.6" cy="8.8" r="4.1" fill="url(#msn-green)" stroke="#1d6f12" strokeWidth=".7" />
      <path d="M1.8 22.8c.3-7 3-10.2 6.8-10.2s6.5 3.2 6.8 10.2Z" fill="url(#msn-green)" stroke="#1d6f12" strokeWidth=".7" />
      <ellipse cx="8.2" cy="7" rx="2.4" ry="1.3" fill="#fff" opacity=".6" />
      <ellipse cx="14.6" cy="4.9" rx="2.2" ry="1.2" fill="#fff" opacity=".55" />
    </svg>
  );
}

/* ───────── Conversation toolbar (24×24) ───────── */

export type ToolId = "invite" | "files" | "webcam" | "audio" | "activities" | "games";

const TOOL_ART: Record<ToolId, React.ReactNode> = {
  invite: (
    <>
      <circle cx="15" cy="6.4" r="3.7" fill="url(#msn-blue)" stroke="#123f8f" strokeWidth=".7" />
      <path d="M8.8 20.6c.3-6.4 2.7-9.3 6.2-9.3s5.9 2.9 6.2 9.3Z" fill="url(#msn-blue)" stroke="#123f8f" strokeWidth=".7" />
      <circle cx="8.6" cy="8.6" r="4" fill="url(#msn-green)" stroke="#1d6f12" strokeWidth=".7" />
      <path d="M2 22.4c.3-6.8 2.9-9.9 6.6-9.9s6.3 3.1 6.6 9.9Z" fill="url(#msn-green)" stroke="#1d6f12" strokeWidth=".7" />
      <ellipse cx="8.2" cy="6.9" rx="2.3" ry="1.2" fill="#fff" opacity=".6" />
      <ellipse cx="14.6" cy="4.8" rx="2.1" ry="1.1" fill="#fff" opacity=".55" />
      <circle cx="18.6" cy="18" r="4.6" fill="url(#msn-orange)" stroke="#b25000" strokeWidth=".7" />
      <path d="M18.6 15.6v4.8M16.2 18H21" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
      <ellipse cx="18.6" cy="15.6" rx="2.8" ry="1.3" fill="#fff" opacity=".45" />
    </>
  ),
  files: (
    <>
      <path d="M2.4 6.2c0-.9.7-1.6 1.6-1.6h4.8l1.9 2h9.3c.9 0 1.6.7 1.6 1.6v11c0 .9-.7 1.6-1.6 1.6H4c-.9 0-1.6-.7-1.6-1.6Z" fill="url(#msn-folder-back)" stroke="#b07208" strokeWidth=".6" />
      <rect x="5" y="4.6" width="12.6" height="11" rx=".6" fill="url(#msn-paper)" stroke="#a9b6c8" strokeWidth=".5" transform="rotate(-5 11 10)" />
      <path d="M7 8.2h7.6M7 10.4h6M7 12.6h7" stroke="#b9c6d8" strokeWidth=".7" transform="rotate(-5 11 10)" />
      <path d="M1.9 10.6c-.1-.8.5-1.4 1.3-1.4h17.6c.8 0 1.4.6 1.3 1.4l-1 9c-.1.9-.8 1.6-1.7 1.6H4.6c-.9 0-1.6-.7-1.7-1.6Z" fill="url(#msn-folder)" stroke="#c48a0c" strokeWidth=".6" />
      <path d="M3.4 11.2h17.2" stroke="#fff" strokeOpacity=".7" strokeWidth=".8" />
      <path d="M13.4 2.6h4.4V.9l3.9 3.3-3.9 3.3V5.8h-4.4Z" fill="url(#msn-green)" stroke="#1d6f12" strokeWidth=".6" strokeLinejoin="round" transform="translate(-.4 1.2)" />
    </>
  ),
  webcam: (
    <>
      <path d="M7.4 22h9.2c.7 0 1-.6.7-1.1l-1.8-3H8.5l-1.8 3c-.3.5 0 1.1.7 1.1Z" fill="url(#msn-steel)" stroke="#55627a" strokeWidth=".6" />
      <rect x="10.7" y="15.2" width="2.6" height="3.2" fill="#7d8aa0" />
      <circle cx="12" cy="9.6" r="7.6" fill="url(#msn-silver)" stroke="#68778f" strokeWidth=".7" />
      <circle cx="12" cy="10.2" r="4.1" fill="#26314a" />
      <circle cx="12" cy="10.2" r="3.1" fill="url(#msn-lens)" />
      <circle cx="10.9" cy="9.1" r=".95" fill="#fff" opacity=".9" />
      <ellipse cx="10.4" cy="4.6" rx="4" ry="1.9" fill="#fff" opacity=".85" />
      <circle cx="16.8" cy="6.2" r=".75" fill="#5ee03a" stroke="#2a8a14" strokeWidth=".3" />
    </>
  ),
  audio: (
    <>
      <path d="M4.4 13.4v-2.2a7.6 7.6 0 0 1 15.2 0v2.2" stroke="#3d4a63" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M5.2 10.4a6.9 6.9 0 0 1 13.6 0" stroke="#fff" strokeOpacity=".45" strokeWidth=".7" fill="none" />
      <rect x="2.2" y="11.4" width="5" height="7.6" rx="2.3" fill="url(#msn-blue)" stroke="#123f8f" strokeWidth=".7" />
      <rect x="16.8" y="11.4" width="5" height="7.6" rx="2.3" fill="url(#msn-blue)" stroke="#123f8f" strokeWidth=".7" />
      <ellipse cx="4.7" cy="13.2" rx="1.4" ry="1.1" fill="#fff" opacity=".6" />
      <ellipse cx="19.3" cy="13.2" rx="1.4" ry="1.1" fill="#fff" opacity=".6" />
      <path d="M4.8 18.8c.6 2.4 2.6 3.2 5.8 3.2" stroke="#3d4a63" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="11.6" cy="22" rx="1.7" ry="1.3" fill="#26314a" />
    </>
  ),
  activities: (
    <>
      <path
        d="M3.6 7.6h4.3a2.3 2.3 0 1 1 4.6 0h4.3v4.3a2.3 2.3 0 1 1 0 4.6v4.3h-4.3a2.3 2.3 0 1 0-4.6 0H3.6v-4.3a2.3 2.3 0 1 0 0-4.6Z"
        fill="url(#msn-orange)"
        stroke="#b25000"
        strokeWidth=".7"
        strokeLinejoin="round"
      />
      <path d="M4.6 8.6h3.4m4.6 0h3.4" stroke="#fff" strokeOpacity=".7" strokeWidth=".8" strokeLinecap="round" />
      <path d="m19.4 1.2 1.1 2.4 2.4 1.1-2.4 1.1-1.1 2.4-1.1-2.4L15.9 4.7l2.4-1.1Z" fill="url(#msn-blue)" stroke="#123f8f" strokeWidth=".5" strokeLinejoin="round" />
      <path d="m21.2 9.6.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5Z" fill="#4fc22c" />
    </>
  ),
  games: (
    <>
      <g transform="rotate(16 15.5 8.5)">
        <rect x="10" y="3" width="11" height="11" rx="2.4" fill="url(#msn-die)" stroke="#7d899f" strokeWidth=".7" />
        <circle cx="12.9" cy="5.9" r="1" fill="#1f5fd0" />
        <circle cx="15.5" cy="8.5" r="1" fill="#1f5fd0" />
        <circle cx="18.1" cy="11.1" r="1" fill="#1f5fd0" />
      </g>
      <rect x="2.6" y="9.6" width="11.8" height="11.8" rx="2.6" fill="url(#msn-red)" stroke="#8a1209" strokeWidth=".7" />
      <path d="M4 11.4c2-1 7-1 9 0" stroke="#fff" strokeOpacity=".55" strokeWidth="1" fill="none" strokeLinecap="round" />
      <g fill="#fff">
        <circle cx="5.6" cy="12.6" r="1.05" />
        <circle cx="11.4" cy="12.6" r="1.05" />
        <circle cx="8.5" cy="15.5" r="1.05" />
        <circle cx="5.6" cy="18.4" r="1.05" />
        <circle cx="11.4" cy="18.4" r="1.05" />
      </g>
    </>
  ),
};

export function ToolIcon({ id, className }: { id: ToolId; className?: string }) {
  const src = art(id);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={className} draggable={false} />;
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {TOOL_ART[id]}
    </svg>
  );
}

/* ───────── Composer bar (20×20) ───────── */

export type BarId = "font" | "winks" | "nudge" | "voice" | "backgrounds" | "info";

const BAR_ART: Record<BarId, React.ReactNode> = {
  font: (
    <>
      <text x="10" y="14.6" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="15" fill="#13306e">
        A
      </text>
      <rect x="3" y="16.4" width="4.6" height="2.4" fill="#e8402a" />
      <rect x="7.6" y="16.4" width="4.6" height="2.4" fill="#ffc21a" />
      <rect x="12.2" y="16.4" width="4.8" height="2.4" fill="#2f86f0" />
    </>
  ),
  winks: (
    <>
      <path d="m10 1.2 2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14l-5.1 2.9L6 11.2l-4.3-4 5.8-.7Z" fill="url(#msn-face)" stroke="#c27c00" strokeWidth=".7" strokeLinejoin="round" />
      <path d="M7.3 8.6q.9-.9 1.8 0" stroke="#4a2c05" strokeWidth=".9" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="8.5" r=".85" fill="#4a2c05" />
      <path d="M7.6 10.8q2.4 1.9 4.8 0" stroke="#4a2c05" strokeWidth=".9" fill="none" strokeLinecap="round" />
      <path d="m16.6 15.2.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5Z" fill="#2f86f0" />
    </>
  ),
  nudge: (
    <>
      <path d="M2.2 6.4q-1.3 3.6 0 7.2M17.8 6.4q1.3 3.6 0 7.2" stroke="#2f6fd6" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M.6 8q-.5 2 0 4M19.4 8q.5 2 0 4" stroke="#2f6fd6" strokeOpacity=".5" strokeWidth="1" fill="none" strokeLinecap="round" />
      <circle cx="10" cy="10" r="6.8" fill="url(#msn-face)" stroke="#c27c00" strokeWidth=".7" />
      <ellipse cx="10" cy="6.4" rx="4" ry="2" fill="url(#msn-gloss)" opacity=".8" />
      <ellipse cx="7.7" cy="9" rx=".9" ry="1.25" fill="#4a2c05" />
      <ellipse cx="12.3" cy="9" rx=".9" ry="1.25" fill="#4a2c05" />
      <ellipse cx="10" cy="12.7" rx="1.5" ry="1.7" fill="#6b1d00" />
    </>
  ),
  voice: (
    <>
      <rect x="7" y="1.6" width="6" height="10.4" rx="3" fill="url(#msn-steel)" stroke="#4d5a72" strokeWidth=".7" />
      <path d="M7.4 5h5.2M7.4 7h5.2M7.4 9h5.2" stroke="#4d5a72" strokeOpacity=".6" strokeWidth=".6" />
      <ellipse cx="9.2" cy="3.4" rx="1.2" ry=".8" fill="#fff" opacity=".8" />
      <path d="M4.8 9.4a5.2 5.2 0 0 0 10.4 0" stroke="#3d4a63" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M10 14.6v2.6M6.8 18.2h6.4" stroke="#3d4a63" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  backgrounds: (
    <>
      <rect x="1.6" y="3.2" width="16.8" height="13.6" rx="1.4" fill="#fff" stroke="#6f7f9c" strokeWidth=".8" />
      <rect x="3.2" y="4.8" width="13.6" height="10.4" fill="url(#msn-sky)" />
      <circle cx="13.6" cy="7.6" r="1.5" fill="#ffe14a" />
      <path d="M3.2 15.2V12q3.4-3 6.8-.6 3.4-2.2 6.8.4v3.4Z" fill="url(#msn-green)" />
    </>
  ),
  info: (
    <>
      <circle cx="10" cy="10" r="8.2" fill="url(#msn-blue)" stroke="#123f8f" strokeWidth=".7" />
      <ellipse cx="10" cy="5.6" rx="5" ry="2.6" fill="url(#msn-gloss)" opacity=".7" />
      <circle cx="10" cy="6.2" r="1.25" fill="#fff" />
      <path d="M10 9v5.4" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
    </>
  ),
};

export function BarIcon({ id, className }: { id: BarId; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      {BAR_ART[id]}
    </svg>
  );
}

/** The little pencil in the status bar while your buddy types. */
export function Pencil({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <g transform="rotate(45 8 8)">
        <rect x="6" y="-1" width="4" height="3" rx=".8" fill="#ff8fa3" stroke="#b6455c" strokeWidth=".5" />
        <rect x="6" y="1.8" width="4" height="1.2" fill="#c7cfdb" />
        <rect x="6" y="3" width="4" height="9" fill="#ffcf3a" stroke="#c48a0c" strokeWidth=".5" />
        <path d="M6 12h4l-2 4Z" fill="#f3d2a2" stroke="#b9895a" strokeWidth=".5" />
        <path d="M7.4 14.8h1.2L8 16Z" fill="#3a3a3a" />
      </g>
    </svg>
  );
}

/* ───────── Display pictures ───────── */

/** The default display picture everyone had before they picked one. */
export function DefaultPicture() {
  return (
    <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="msn-dp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7fbff" />
          <stop offset="1" stopColor="#cfe1fa" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" fill="url(#msn-dp-bg)" />
      <circle cx="78" cy="14" r="26" fill="#fff" opacity=".6" />
      <circle cx="60" cy="31" r="13" fill="url(#msn-blue)" stroke="#123f8f" strokeWidth="1.4" />
      <path d="M36 96c1-27 10.6-38 24-38s23 11 24 38Z" fill="url(#msn-blue)" stroke="#123f8f" strokeWidth="1.4" />
      <circle cx="37" cy="41" r="14.5" fill="url(#msn-green)" stroke="#1d6f12" strokeWidth="1.4" />
      <path d="M10 100c1-29 11.6-41 27-41s26 12 27 41Z" fill="url(#msn-green)" stroke="#1d6f12" strokeWidth="1.4" />
      <ellipse cx="35" cy="34.5" rx="8.4" ry="4.6" fill="#fff" opacity=".6" />
      <ellipse cx="58.6" cy="25.5" rx="7.4" ry="4" fill="#fff" opacity=".55" />
    </svg>
  );
}

/* ───────── Header scene ───────── */

/**
 * Drawn stand-in for the header scene: soft sky, light ribbons, bokeh and
 * three butterflies, kept to the right so the contact's name stays clear.
 */
export function SceneArt() {
  return (
    <>
      <svg viewBox="0 0 1000 150" preserveAspectRatio="xMaxYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="msn-ribbon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".55" stopColor="#fff" stopOpacity=".85" />
            <stop offset="1" stopColor="#fff" stopOpacity=".1" />
          </linearGradient>
          <radialGradient id="msn-bokeh">
            <stop offset="0" stopColor="#fff" stopOpacity=".95" />
            <stop offset=".6" stopColor="#fff" stopOpacity=".35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="msn-hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9be05a" />
            <stop offset="1" stopColor="#3f9a1c" />
          </linearGradient>
        </defs>
        <path d="M380 150c120-38 260-52 420-40s160 18 200 14v26Z" fill="url(#msn-hill)" opacity=".55" />
        <path d="M560 150c110-26 260-30 440-18v18Z" fill="url(#msn-hill)" opacity=".75" />
        <path d="M-40 128C180 70 400 150 620 96s300-70 420-40" stroke="url(#msn-ribbon)" strokeWidth="34" fill="none" opacity=".28" />
        <path d="M-40 140C220 92 470 160 720 112s240-48 320-34" stroke="url(#msn-ribbon)" strokeWidth="9" fill="none" opacity=".55" />
        <path d="M-40 118C200 66 430 140 660 86s260-54 380-30" stroke="url(#msn-ribbon)" strokeWidth="1.6" fill="none" opacity=".9" />
        <g>
          {[
            [930, 34, 26, 0.55],
            [872, 92, 14, 0.5],
            [980, 108, 18, 0.4],
            [808, 30, 9, 0.6],
            [760, 70, 16, 0.3],
            [700, 24, 6, 0.7],
            [954, 72, 6, 0.8],
          ].map(([cx, cy, r, o], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="url(#msn-bokeh)" opacity={o} />
          ))}
        </g>
      </svg>
      <Butterfly className="msn-flutter absolute right-[22px] top-[50px] h-7 w-7" style={{ "--r": "-12deg" } as React.CSSProperties} />
      <Butterfly className="msn-flutter absolute right-[78px] top-[30px] h-8 w-8 [animation-delay:-2.5s]" style={{ "--r": "14deg" } as React.CSSProperties} />
      <Butterfly className="msn-flutter absolute right-[124px] top-[64px] h-4 w-4 opacity-80 [animation-delay:-4.5s]" style={{ "--r": "8deg" } as React.CSSProperties} />
    </>
  );
}

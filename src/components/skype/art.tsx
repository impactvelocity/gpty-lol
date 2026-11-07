"use client";

/**
 * Hand-drawn art for the Skype costume: the cloud mark, presence icons, the
 * handset on the big call buttons, the toolbar icons, the default picture and
 * the sky in the header. Shared gradients are defined once in <SkypeDefs />,
 * which the layout renders, so each icon stays a handful of paths.
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot =
  | "scene" | "backdrop" | "wallpaper" | "buddyPicture" | "userPicture" | "frozen"
  | "video" | "files" | "add" | "sms" | "extras";

/**
 * Generated pictures that replace the drawn fallbacks (prompts and sizes in
 * src/components/skype/ART.md). Remove a line to fall back to the drawing.
 * Icons are 128px and pictures 512px WebP; the wide ones stay 1536px.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  scene: "/skype/scene.webp",
  backdrop: "/skype/backdrop.webp",
  wallpaper: "/skype/wallpaper.webp",
  buddyPicture: "/skype/dp-buddy.webp",
  userPicture: "/skype/dp-you.webp",
  frozen: "/skype/video-frozen.webp",
  video: "/skype/icon-video.webp",
  files: "/skype/icon-files.webp",
  add: "/skype/icon-add.webp",
  sms: "/skype/icon-sms.webp",
  extras: "/skype/icon-extras.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/* ───────── Shared gradients ───────── */

export function SkypeDefs() {
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden focusable="false">
      <defs>
        {/* Emoticons */}
        <radialGradient id="sk-face" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#fff6c2" />
          <stop offset=".38" stopColor="#ffdc3c" />
          <stop offset=".82" stopColor="#ffb30f" />
          <stop offset="1" stopColor="#f08c00" />
        </radialGradient>
        <radialGradient id="sk-face-red" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#ffd9cc" />
          <stop offset=".4" stopColor="#ff7a55" />
          <stop offset=".85" stopColor="#e8381c" />
          <stop offset="1" stopColor="#b8200a" />
        </radialGradient>
        <radialGradient id="sk-face-devil" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#ffd0d0" />
          <stop offset=".42" stopColor="#f2474a" />
          <stop offset=".85" stopColor="#c0141e" />
          <stop offset="1" stopColor="#8a0610" />
        </radialGradient>
        <radialGradient id="sk-face-green" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#f0ffd8" />
          <stop offset=".4" stopColor="#b8e86a" />
          <stop offset=".85" stopColor="#7cc22c" />
          <stop offset="1" stopColor="#4e9214" />
        </radialGradient>
        <linearGradient id="sk-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sk-heart" cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor="#ffc6d0" />
          <stop offset=".35" stopColor="#ff4f6e" />
          <stop offset=".85" stopColor="#d81440" />
          <stop offset="1" stopColor="#a00a2c" />
        </radialGradient>
        <radialGradient id="sk-sun" cx=".4" cy=".36" r=".7">
          <stop offset="0" stopColor="#fffbe0" />
          <stop offset=".45" stopColor="#ffe14a" />
          <stop offset="1" stopColor="#ffa800" />
        </radialGradient>
        <linearGradient id="sk-cake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe4ef" />
          <stop offset="1" stopColor="#f59ac0" />
        </linearGradient>
        <linearGradient id="sk-coin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6ffb8" />
          <stop offset=".5" stopColor="#6fcf3a" />
          <stop offset="1" stopColor="#2f8e14" />
        </linearGradient>

        {/* Icons and buttons */}
        <linearGradient id="sk-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fdcff" />
          <stop offset=".5" stopColor="#14b0f0" />
          <stop offset="1" stopColor="#0378c4" />
        </linearGradient>
        <linearGradient id="sk-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c6f59a" />
          <stop offset=".5" stopColor="#58c227" />
          <stop offset="1" stopColor="#2e8b10" />
        </linearGradient>
        <linearGradient id="sk-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb2a0" />
          <stop offset=".5" stopColor="#ec4a2c" />
          <stop offset="1" stopColor="#b2230b" />
        </linearGradient>
        <linearGradient id="sk-orange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe29a" />
          <stop offset=".5" stopColor="#ffa630" />
          <stop offset="1" stopColor="#e3680a" />
        </linearGradient>
        <linearGradient id="sk-yellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3a8" />
          <stop offset=".5" stopColor="#ffd21f" />
          <stop offset="1" stopColor="#eaa000" />
        </linearGradient>
        <linearGradient id="sk-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfeaf3" />
        </linearGradient>
        <radialGradient id="sk-pearl" cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".5" stopColor="#eef4fa" />
          <stop offset=".88" stopColor="#b3c4d6" />
          <stop offset="1" stopColor="#8698ad" />
        </radialGradient>
        <linearGradient id="sk-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d3dce6" />
          <stop offset="1" stopColor="#6e7f94" />
        </linearGradient>
        <radialGradient id="sk-lens" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#9fe2ff" />
          <stop offset=".35" stopColor="#1878c8" />
          <stop offset=".75" stopColor="#0a2244" />
          <stop offset="1" stopColor="#02060e" />
        </radialGradient>
        <linearGradient id="sk-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bdf0ff" />
          <stop offset="1" stopColor="#3aa8e4" />
        </linearGradient>
        <linearGradient id="sk-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".62" stopColor="#f3f9fe" />
          <stop offset="1" stopColor="#c6def2" />
        </linearGradient>

        {/* Presence */}
        <radialGradient id="sk-p-green" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#d8ffb0" />
          <stop offset=".45" stopColor="#6ad13a" />
          <stop offset="1" stopColor="#2c8c10" />
        </radialGradient>
        <radialGradient id="sk-p-yellow" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#fff4b8" />
          <stop offset=".45" stopColor="#ffcb2a" />
          <stop offset="1" stopColor="#df9300" />
        </radialGradient>
        <radialGradient id="sk-p-orange" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#ffe0b8" />
          <stop offset=".45" stopColor="#ff9a2e" />
          <stop offset="1" stopColor="#d4610a" />
        </radialGradient>
        <radialGradient id="sk-p-red" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#ffc9bd" />
          <stop offset=".45" stopColor="#f2502f" />
          <stop offset="1" stopColor="#b51f08" />
        </radialGradient>
        <radialGradient id="sk-p-gray" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#d4dde6" />
          <stop offset="1" stopColor="#97a6b6" />
        </radialGradient>
        <radialGradient id="sk-p-pink" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#ffe0f0" />
          <stop offset=".45" stopColor="#ff7ab8" />
          <stop offset="1" stopColor="#d02c7a" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ───────── Brand ───────── */

/**
 * A puffy blue cloud with a rounded S: the app's mark, drawn our own way.
 * Self-contained (no shared gradients), so it works anywhere.
 */
export function CloudMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="sk-mark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fd6ff" />
          <stop offset=".55" stopColor="#12aef0" />
          <stop offset="1" stopColor="#0482cf" />
        </linearGradient>
      </defs>
      <path
        d="M9.6 27.4c-4 0-6.6-2.7-6.6-6 0-2.5 1.5-4.6 3.8-5.5-.2-.6-.3-1.3-.3-2 0-4.3 3.4-7.6 7.7-7.6 2.8 0 5.2 1.4 6.6 3.6a6.4 6.4 0 0 1 8.2 6.2c0 .6-.1 1.2-.3 1.8 1.6 1 2.6 2.7 2.6 4.6 0 3-2.4 5-5.4 5Z"
        fill="url(#sk-mark)"
        stroke="#0a6bb0"
        strokeOpacity=".45"
        strokeWidth=".7"
      />
      <path d="M7 12.6c1.4-3.4 5.2-5.4 9-4.4" stroke="#fff" strokeOpacity=".7" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path
        d="M20.4 12.9c-.9-1.2-2.6-1.9-4.4-1.9-2.7 0-4.3 1.3-4.3 3 0 3.8 8.8 2.1 8.8 6.1 0 1.9-1.9 3.3-4.8 3.3-2.1 0-3.8-.8-4.8-2.2"
        stroke="#fff"
        strokeWidth="2.7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ───────── Presence ───────── */

export type Presence = "online" | "skypeme" | "away" | "na" | "dnd" | "invisible" | "offline";

export const PRESENCES: { id: Presence; label: string }[] = [
  { id: "online", label: "Online" },
  { id: "skypeme", label: "Skype Me" },
  { id: "away", label: "Away" },
  { id: "na", label: "Not Available" },
  { id: "dnd", label: "Do Not Disturb" },
  { id: "invisible", label: "Invisible" },
  { id: "offline", label: "Offline" },
];

const ORB: Record<Presence, string> = {
  online: "url(#sk-p-green)",
  skypeme: "url(#sk-p-pink)",
  away: "url(#sk-p-yellow)",
  na: "url(#sk-p-orange)",
  dnd: "url(#sk-p-red)",
  invisible: "#fff",
  offline: "url(#sk-p-gray)",
};

const MARK: Record<Presence, React.ReactNode> = {
  online: <path d="m4.4 8.3 2.3 2.3 4.9-4.9" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  skypeme: (
    <>
      <circle cx="6.1" cy="6.6" r=".9" fill="#fff" />
      <circle cx="9.9" cy="6.6" r=".9" fill="#fff" />
      <path d="M5 9.2q3 2.8 6 0" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  ),
  away: <path d="M8 4.2V8l2.6 1.6" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  na: <path d="M8 4.2V8l2.6 1.6" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  dnd: <path d="M4.6 8h6.8" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />,
  invisible: null,
  offline: <path d="m5.6 5.6 4.8 4.8m0-4.8-4.8 4.8" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />,
};

/** A glossy presence orb: the green tick, the yellow clock, the red minus. */
export function PresenceIcon({ status = "online", className = "h-3.5 w-3.5" }: { status?: Presence; className?: string }) {
  const hollow = status === "invisible";
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <circle cx="8" cy="8" r="7" fill={ORB[status]} stroke={hollow ? "#8fa3b6" : "rgba(10,50,30,.35)"} strokeWidth={hollow ? 1.6 : 0.7} />
      {!hollow && <ellipse cx="8" cy="4.6" rx="4.4" ry="2.2" fill="url(#sk-gloss)" opacity=".75" />}
      {MARK[status]}
    </svg>
  );
}

/* ───────── Calls ───────── */

/** The classic handset, for the big buttons. White, so it sits on any gloss. */
export function Handset({ className = "h-5 w-5", down = false }: { className?: string; down?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden style={down ? { transform: "rotate(135deg)" } : undefined}>
      <path
        d="M6.6 2.8c.8-.5 1.8-.3 2.3.5l1.9 3.1c.4.7.3 1.6-.3 2.2l-1.3 1.2c.9 2 2.6 3.9 4.6 4.9l1.3-1.3c.6-.6 1.5-.7 2.2-.3l3.1 1.9c.8.5 1 1.5.5 2.3l-1.1 1.8c-.8 1.3-2.4 1.9-3.9 1.5C9.7 19.4 4.6 14.3 3.4 8.1c-.3-1.5.3-3 1.6-3.9Z"
        fill="#fff"
      />
    </svg>
  );
}

/** Signal bars for call quality, 0 to 5 lit. */
export function Bars({ level, className = "h-3.5 w-5" }: { level: number; className?: string }) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={i * 4}
          y={11 - i * 2.4}
          width="3"
          height={3 + i * 2.4}
          rx=".8"
          fill={i < level ? (level <= 2 ? "#ffb02e" : "#7fe04a") : "rgba(255,255,255,.28)"}
        />
      ))}
    </svg>
  );
}

/* ───────── Conversation toolbar (24×24) ───────── */

export type ToolId = "video" | "files" | "add" | "sms" | "extras";

const TOOL_ART: Record<ToolId, React.ReactNode> = {
  video: (
    <>
      <path d="M7.6 22h8.8c.7 0 1-.6.7-1.1l-1.7-2.8H8.6l-1.7 2.8c-.3.5 0 1.1.7 1.1Z" fill="url(#sk-steel)" stroke="#55657a" strokeWidth=".6" />
      <rect x="10.8" y="15.6" width="2.4" height="3" fill="#7b8ba0" />
      <circle cx="12" cy="9.6" r="7.6" fill="url(#sk-pearl)" stroke="#6a7c93" strokeWidth=".7" />
      <circle cx="12" cy="10.1" r="4.2" fill="#1d2a40" />
      <circle cx="12" cy="10.1" r="3.2" fill="url(#sk-lens)" />
      <circle cx="10.9" cy="9" r=".95" fill="#fff" opacity=".9" />
      <ellipse cx="10.2" cy="4.4" rx="4" ry="1.8" fill="#fff" opacity=".85" />
      <circle cx="17" cy="6.4" r=".85" fill="#14b0f0" stroke="#0a6bb0" strokeWidth=".3" />
    </>
  ),
  files: (
    <>
      <path d="M5 2.6h9.2l4.8 4.8v14c0 .6-.5 1-1 1H5c-.6 0-1-.4-1-1V3.6c0-.6.4-1 1-1Z" fill="url(#sk-paper)" stroke="#8da2b8" strokeWidth=".7" />
      <path d="M14.2 2.6v3.8c0 .6.4 1 1 1H19" fill="#cfdeeb" stroke="#8da2b8" strokeWidth=".7" strokeLinejoin="round" />
      <path d="M7 11h7M7 13.4h5.4M7 15.8h6.2" stroke="#b6c8d9" strokeWidth=".9" strokeLinecap="round" />
      <circle cx="17.4" cy="17.6" r="5" fill="url(#sk-green)" stroke="#256f0c" strokeWidth=".7" />
      <path d="M17.4 20.2v-5m-2.2 2.2 2.2-2.3 2.2 2.3" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="17.4" cy="14.6" rx="3" ry="1.2" fill="#fff" opacity=".4" />
    </>
  ),
  add: (
    <>
      <circle cx="10" cy="7.4" r="4.4" fill="url(#sk-blue)" stroke="#0a5d9c" strokeWidth=".7" />
      <path d="M2.4 21.6c.3-6.8 3.3-10 7.6-10s7.3 3.2 7.6 10Z" fill="url(#sk-blue)" stroke="#0a5d9c" strokeWidth=".7" />
      <ellipse cx="9.4" cy="5.6" rx="2.6" ry="1.3" fill="#fff" opacity=".6" />
      <circle cx="18.2" cy="17.8" r="4.8" fill="url(#sk-green)" stroke="#256f0c" strokeWidth=".7" />
      <path d="M18.2 15.4v4.8m-2.4-2.4h4.8" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
      <ellipse cx="18.2" cy="15.2" rx="2.8" ry="1.2" fill="#fff" opacity=".4" />
    </>
  ),
  sms: (
    <>
      <rect x="3.4" y="3.2" width="10.4" height="18.6" rx="2.2" fill="url(#sk-steel)" stroke="#4f5f75" strokeWidth=".7" />
      <rect x="4.9" y="5.4" width="7.4" height="7" rx=".8" fill="url(#sk-screen)" />
      <g fill="#2d3a4e">
        <circle cx="6.4" cy="15" r=".75" />
        <circle cx="8.6" cy="15" r=".75" />
        <circle cx="10.8" cy="15" r=".75" />
        <circle cx="6.4" cy="17.2" r=".75" />
        <circle cx="8.6" cy="17.2" r=".75" />
        <circle cx="10.8" cy="17.2" r=".75" />
      </g>
      <path d="M13.4 2.4h7.2c1.1 0 2 .9 2 2v4.2c0 1.1-.9 2-2 2h-3.4l-2.6 2.4v-2.4h-1.2c-1.1 0-2-.9-2-2V4.4c0-1.1.9-2 2-2Z" fill="url(#sk-blue)" stroke="#0a5d9c" strokeWidth=".6" strokeLinejoin="round" />
      <g fill="#fff">
        <circle cx="14.8" cy="6.5" r=".8" />
        <circle cx="17" cy="6.5" r=".8" />
        <circle cx="19.2" cy="6.5" r=".8" />
      </g>
    </>
  ),
  extras: (
    <>
      <path
        d="M3.4 7.4h4.4a2.4 2.4 0 1 1 4.8 0H17v4.4a2.4 2.4 0 1 1 0 4.8v4.4h-4.4a2.4 2.4 0 1 0-4.8 0H3.4v-4.4a2.4 2.4 0 1 0 0-4.8Z"
        fill="url(#sk-blue)"
        stroke="#0a5d9c"
        strokeWidth=".7"
        strokeLinejoin="round"
      />
      <path d="M4.4 8.4h3.6m4.8 0h3.4" stroke="#fff" strokeOpacity=".7" strokeWidth=".8" strokeLinecap="round" />
      <path d="m19.6 1.4 1.1 2.4 2.4 1.1-2.4 1.1-1.1 2.4-1.1-2.4-2.4-1.1 2.4-1.1Z" fill="url(#sk-yellow)" stroke="#b47a00" strokeWidth=".5" strokeLinejoin="round" />
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

/* ───────── History events (20×20) ───────── */

export type EventIcon = "call" | "missed" | "info" | "credit" | "contacts";

const EVENT_ART: Record<EventIcon, React.ReactNode> = {
  call: (
    <>
      <circle cx="10" cy="10" r="8.6" fill="url(#sk-green)" stroke="#256f0c" strokeWidth=".7" />
      <ellipse cx="10" cy="5.4" rx="5.4" ry="2.6" fill="url(#sk-gloss)" opacity=".6" />
      <g transform="translate(4.2 4.2) scale(.48)">
        <path d="M6.6 2.8c.8-.5 1.8-.3 2.3.5l1.9 3.1c.4.7.3 1.6-.3 2.2l-1.3 1.2c.9 2 2.6 3.9 4.6 4.9l1.3-1.3c.6-.6 1.5-.7 2.2-.3l3.1 1.9c.8.5 1 1.5.5 2.3l-1.1 1.8c-.8 1.3-2.4 1.9-3.9 1.5C9.7 19.4 4.6 14.3 3.4 8.1c-.3-1.5.3-3 1.6-3.9Z" fill="#fff" />
      </g>
    </>
  ),
  missed: (
    <>
      <circle cx="10" cy="10" r="8.6" fill="url(#sk-red)" stroke="#8e1a06" strokeWidth=".7" />
      <ellipse cx="10" cy="5.4" rx="5.4" ry="2.6" fill="url(#sk-gloss)" opacity=".6" />
      <g transform="translate(4.2 4.6) scale(.48) rotate(135 12 12)">
        <path d="M6.6 2.8c.8-.5 1.8-.3 2.3.5l1.9 3.1c.4.7.3 1.6-.3 2.2l-1.3 1.2c.9 2 2.6 3.9 4.6 4.9l1.3-1.3c.6-.6 1.5-.7 2.2-.3l3.1 1.9c.8.5 1 1.5.5 2.3l-1.1 1.8c-.8 1.3-2.4 1.9-3.9 1.5C9.7 19.4 4.6 14.3 3.4 8.1c-.3-1.5.3-3 1.6-3.9Z" fill="#fff" />
      </g>
    </>
  ),
  info: (
    <>
      <circle cx="10" cy="10" r="8.4" fill="url(#sk-blue)" stroke="#0a5d9c" strokeWidth=".7" />
      <ellipse cx="10" cy="5.6" rx="5" ry="2.6" fill="url(#sk-gloss)" opacity=".7" />
      <circle cx="10" cy="6.2" r="1.25" fill="#fff" />
      <path d="M10 9v5.4" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
    </>
  ),
  credit: (
    <>
      <circle cx="10" cy="10" r="8.4" fill="url(#sk-coin)" stroke="#256f0c" strokeWidth=".7" />
      <circle cx="10" cy="10" r="6.2" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth=".8" />
      <path d="M12.3 7.3c-.5-.6-1.3-1-2.3-1-1.3 0-2.2.7-2.2 1.6 0 2.1 4.6 1.2 4.6 3.4 0 1-.9 1.8-2.4 1.8-1.1 0-2-.4-2.5-1.1M10 4.8v10.4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  contacts: (
    <>
      <rect x="3" y="2.4" width="14" height="15.2" rx="2" fill="url(#sk-paper)" stroke="#8da2b8" strokeWidth=".7" />
      <circle cx="10" cy="8" r="2.6" fill="url(#sk-blue)" />
      <path d="M5.6 15c.3-2.8 2-4.2 4.4-4.2s4.1 1.4 4.4 4.2Z" fill="url(#sk-blue)" />
    </>
  ),
};

export function EventGlyph({ id, className }: { id: EventIcon; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      {EVENT_ART[id]}
    </svg>
  );
}

/** The little pencil that writes while your contact types. */
export function Pencil({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <g transform="rotate(45 8 8)">
        <rect x="6" y="-1" width="4" height="3" rx=".8" fill="#ff9db0" stroke="#b6455c" strokeWidth=".5" />
        <rect x="6" y="1.8" width="4" height="1.2" fill="#c7cfdb" />
        <rect x="6" y="3" width="4" height="9" fill="#33b6f2" stroke="#0a6bb0" strokeWidth=".5" />
        <path d="M6 12h4l-2 4Z" fill="#f3d2a2" stroke="#b9895a" strokeWidth=".5" />
        <path d="M7.4 14.8h1.2L8 16Z" fill="#3a3a3a" />
      </g>
    </svg>
  );
}

/* ───────── Display pictures ───────── */

/** The grey-blue silhouette everyone had before uploading a picture. */
export function DefaultAvatar() {
  return (
    <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="sk-dp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4fbff" />
          <stop offset="1" stopColor="#c9e6f8" />
        </linearGradient>
        <linearGradient id="sk-dp-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcd3e6" />
          <stop offset="1" stopColor="#7f9db8" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" fill="url(#sk-dp-bg)" />
      <circle cx="74" cy="16" r="28" fill="#fff" opacity=".65" />
      <circle cx="48" cy="38" r="17" fill="url(#sk-dp-body)" />
      <path d="M14 100c1.6-27 14-41 34-41s32.4 14 34 41Z" fill="url(#sk-dp-body)" />
      <ellipse cx="44" cy="30" rx="9" ry="5" fill="#fff" opacity=".5" />
      <ellipse cx="40" cy="70" rx="14" ry="5" fill="#fff" opacity=".28" />
    </svg>
  );
}

/* ───────── Header sky ───────── */

/** Puffy, softly shaded clouds: a few circles over a flat base. */
const CLOUDS: { x: number; y: number; s: number; o: number; layer: "far" | "near" }[] = [
  { x: 960, y: 28, s: 1.25, o: 0.95, layer: "far" },
  { x: 780, y: 74, s: 0.8, o: 0.7, layer: "far" },
  { x: 610, y: 40, s: 0.6, o: 0.55, layer: "far" },
  { x: 430, y: 92, s: 0.5, o: 0.4, layer: "far" },
  { x: 880, y: 118, s: 1.4, o: 1, layer: "near" },
  { x: 660, y: 140, s: 1.1, o: 0.9, layer: "near" },
  { x: 1010, y: 150, s: 1.2, o: 1, layer: "near" },
];

function Puff({ x, y, s, o }: { x: number; y: number; s: number; o: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <g fill="url(#sk-cloud)">
        <circle cx="-34" cy="4" r="18" />
        <circle cx="-10" cy="-10" r="26" />
        <circle cx="20" cy="-4" r="22" />
        <circle cx="42" cy="8" r="14" />
        <rect x="-52" y="4" width="108" height="20" rx="10" />
      </g>
      <g fill="#fff" opacity=".85">
        <circle cx="-16" cy="-18" r="12" />
        <circle cx="14" cy="-12" r="9" />
      </g>
    </g>
  );
}

/**
 * Drawn stand-in for the header photo: a bright morning sky, a soft sun and
 * two layers of clouds drifting at different speeds, kept to the right so the
 * name stays clear.
 */
export function SkyArt() {
  return (
    <>
      <svg viewBox="0 0 1100 190" preserveAspectRatio="xMaxYMid slice" className="sk-sky-far absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="sk-sunglow">
            <stop offset="0" stopColor="#fff" stopOpacity=".95" />
            <stop offset=".35" stopColor="#fffbe6" stopOpacity=".6" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="1010" cy="10" r="140" fill="url(#sk-sunglow)" />
        {CLOUDS.filter((c) => c.layer === "far").map((c, i) => (
          <Puff key={i} {...c} />
        ))}
      </svg>
      <svg viewBox="0 0 1100 190" preserveAspectRatio="xMaxYMid slice" className="sk-sky-near absolute inset-0 h-full w-full" aria-hidden>
        {CLOUDS.filter((c) => c.layer === "near").map((c, i) => (
          <Puff key={i} {...c} />
        ))}
      </svg>
    </>
  );
}

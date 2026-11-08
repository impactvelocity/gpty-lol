"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Drawn art for the ICQ costume: the status flowers, the blinking message
 * note, the toolbar and event icons, the dial-up tray monitors and the bits
 * the banner ads are made of. Shared gradients live in <IcqDefs />, which the
 * window renders. Anything the sidebar row also draws (flowers, the note)
 * uses flat colors only, so it never depends on those defs.
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot =
  | "wallpaper" | "buddyPicture" | "backdrop"
  | "info" | "file" | "chat" | "random" | "history"
  | "adVisitor" | "adSmileys" | "adModem" | "adHomepage";

/**
 * Generated pictures that replace the drawn fallbacks (prompts in
 * src/components/icq/ART.md). Add a line once its file is in public/icq/.
 * Icons are 128px and pictures 512px WebP; wide ones stay 1536px.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/icq/wallpaper.webp",
  buddyPicture: "/icq/dp-buddy.webp",
  backdrop: "/icq/backdrop.webp",
  info: "/icq/icon-info.webp",
  file: "/icq/icon-file.webp",
  chat: "/icq/icon-chat.webp",
  random: "/icq/icon-random.webp",
  history: "/icq/icon-history.webp",
  adVisitor: "/icq/ad-visitor.webp",
  adSmileys: "/icq/ad-smileys.webp",
  adModem: "/icq/ad-modem.webp",
  adHomepage: "/icq/ad-homepage.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/* ───────── Shared gradients ───────── */

export function IcqDefs() {
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden focusable="false">
      <defs>
        {/* Smileys */}
        <radialGradient id="icq-face" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#fffbd0" />
          <stop offset=".4" stopColor="#ffe83a" />
          <stop offset=".85" stopColor="#ffc400" />
          <stop offset="1" stopColor="#e89a00" />
        </radialGradient>
        <radialGradient id="icq-face-red" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#ffe0d0" />
          <stop offset=".42" stopColor="#ff7a52" />
          <stop offset=".85" stopColor="#e2381c" />
          <stop offset="1" stopColor="#a8200c" />
        </radialGradient>
        <radialGradient id="icq-face-devil" cx=".38" cy=".3" r=".78">
          <stop offset="0" stopColor="#ffd6d6" />
          <stop offset=".42" stopColor="#ff5a5a" />
          <stop offset=".85" stopColor="#c8141c" />
          <stop offset="1" stopColor="#7e0a10" />
        </radialGradient>
        <linearGradient id="icq-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="icq-heart" cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor="#ffc2c8" />
          <stop offset=".35" stopColor="#ff4058" />
          <stop offset=".85" stopColor="#cc0d28" />
          <stop offset="1" stopColor="#8e0016" />
        </radialGradient>

        {/* Icons */}
        <linearGradient id="icq-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf4" />
          <stop offset="1" stopColor="#e6dcc0" />
        </linearGradient>
        <linearGradient id="icq-navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a6fd8" />
          <stop offset=".5" stopColor="#1d3f9e" />
          <stop offset="1" stopColor="#0c2160" />
        </linearGradient>
        <linearGradient id="icq-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f4f7" />
          <stop offset=".5" stopColor="#c3cad6" />
          <stop offset="1" stopColor="#8a95a8" />
        </linearGradient>
        <radialGradient id="icq-blue" cx=".36" cy=".3" r=".8">
          <stop offset="0" stopColor="#bfe3ff" />
          <stop offset=".45" stopColor="#3f8ff0" />
          <stop offset="1" stopColor="#0d3f9c" />
        </radialGradient>
        <linearGradient id="icq-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4f5a0" />
          <stop offset=".5" stopColor="#4cc043" />
          <stop offset="1" stopColor="#1f7d1a" />
        </linearGradient>
        <linearGradient id="icq-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e3e8ef" />
        </linearGradient>
        <linearGradient id="icq-die" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d6dbe4" />
        </linearGradient>
        <linearGradient id="icq-book" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d2463a" />
          <stop offset=".55" stopColor="#9e1d16" />
          <stop offset="1" stopColor="#6a0f0a" />
        </linearGradient>
        <linearGradient id="icq-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset=".45" stopColor="#ffcc2a" />
          <stop offset="1" stopColor="#c47a00" />
        </linearGradient>
        <linearGradient id="icq-beige" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f1e2" />
          <stop offset="1" stopColor="#cfc6ad" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ───────── The flower ───────── */

export type Status = "online" | "ffc" | "away" | "na" | "occupied" | "dnd" | "invisible" | "offline";

const GREEN = { fill: "#4cc043", edge: "#1b7316", hi: "#c8f7b8" };
const RED = { fill: "#ef3b2d", edge: "#951108", hi: "#ffc7bf" };
const INK = "#2a1800";

/**
 * The status flower, drawn the way the contact list showed it: green petals
 * when you're there, red when you're not, a little badge for everything in
 * between. "logo" has the one red petal; "connecting" lights the petals up
 * in turn, like signing on.
 */
export function Flower({
  status = "online",
  className = "h-4 w-4",
  style,
}: {
  status?: Status | "logo" | "connecting";
  className?: string;
  style?: CSSProperties;
}) {
  const red = status === "offline" || status === "occupied" || status === "dnd";
  const base = red ? RED : GREEN;
  const ghost = status === "invisible";
  const dialing = status === "connecting";
  return (
    <svg viewBox="0 0 32 32" className={`${className}${dialing ? " icq-dialing" : ""}`} style={style} aria-hidden>
      <g opacity={ghost ? 0.5 : 1}>
        {Array.from({ length: 8 }, (_, i) => {
          const p = status === "logo" && i === 7 ? RED : base;
          return (
            <g
              key={i}
              transform={`rotate(${i * 45} 16 16)`}
              className={dialing ? "icq-petal" : undefined}
              style={dialing ? ({ "--i": i } as CSSProperties) : undefined}
            >
              <ellipse cx="16" cy="7.3" rx="4.3" ry="6.3" fill={p.fill} stroke={p.edge} strokeWidth=".8" strokeDasharray={ghost ? "1.8 1.3" : undefined} />
              <ellipse cx="15" cy="5.4" rx="1.4" ry="2.7" fill={p.hi} opacity=".6" />
            </g>
          );
        })}
      </g>
      <circle cx="16" cy="16" r="4.8" fill="#ffd21f" stroke="#9a6f00" strokeWidth=".8" />
      <ellipse cx="14.8" cy="14.4" rx="2" ry="1.2" fill="#fff8c4" opacity=".85" />
      {status === "ffc" && (
        <g stroke={INK} strokeLinecap="round" fill="none">
          <path d="M14.4 15v.4M17.6 15v.4" strokeWidth="1.2" />
          <path d="M13.8 17q2.2 2 4.4 0" strokeWidth=".9" />
        </g>
      )}
      {status === "away" && (
        <g>
          <circle cx="24.6" cy="24.6" r="6.6" fill="#fffbe2" stroke="#7a6400" strokeWidth=".8" />
          <path d="M26.4 20.2a4.6 4.6 0 1 0 2.8 7.4 3.8 3.8 0 0 1-2.8-7.4Z" fill="#2f63c9" />
        </g>
      )}
      {status === "na" && (
        <g>
          <circle cx="24.6" cy="24.6" r="6.6" fill="#3a3f8f" stroke="#15183f" strokeWidth=".8" />
          <path d="M22.2 22.2h4.8l-4.8 4.8h4.8" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </g>
      )}
      {status === "occupied" && (
        <g>
          <circle cx="24.6" cy="24.6" r="6.6" fill="#ffd21f" stroke="#7a5400" strokeWidth=".8" />
          <path d="M24.6 21v4.2" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="24.6" cy="28" r="1" fill={INK} />
        </g>
      )}
      {status === "dnd" && (
        <g>
          <circle cx="24.6" cy="24.6" r="6.6" fill="#fff" stroke="#a8150b" strokeWidth="1" />
          <rect x="21" y="23.6" width="7.2" height="2" rx=".5" fill="#d81e14" />
        </g>
      )}
    </svg>
  );
}

/** The yellow note that blinked in the contact list when a message was waiting. Flat colors only. */
export function MessageNote({ className = "h-4 w-4", blink = false }: { className?: string; blink?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`${className}${blink ? " icq-blink" : ""}`} aria-hidden>
      <path d="M2.5 1.5h8l3 3v10h-11Z" fill="#ffe24a" stroke="#7d6000" strokeWidth=".8" strokeLinejoin="round" />
      <path d="M10.5 1.5v3h3" fill="#fff6b0" stroke="#7d6000" strokeWidth=".8" strokeLinejoin="round" />
      <path d="M4.6 7h6.8M4.6 9.2h6.8M4.6 11.4h4.4" stroke="#a87e00" strokeWidth=".9" strokeLinecap="round" />
      <path d="M3.4 2.6v10.8" stroke="#fff" strokeOpacity=".75" strokeWidth=".8" />
    </svg>
  );
}

/** Dial-up Networking's two little monitors in the tray: one lights up sending, one receiving. */
export function ModemLights({ tx = false, rx = false, className = "h-4 w-5" }: { tx?: boolean; rx?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 16" className={className} aria-hidden>
      <rect x="1" y="1" width="10" height="7.6" fill="#d9d5cc" stroke="#33322e" strokeWidth=".7" />
      <rect x="2.2" y="2.2" width="7.6" height="5.2" fill="#0d3b3b" className={tx ? "icq-led-on" : undefined} />
      <path d="M4.4 8.6h3.2V10H4.4Z" fill="#8c887f" />
      <rect x="8" y="6" width="10" height="7.6" fill="#d9d5cc" stroke="#33322e" strokeWidth=".7" />
      <rect x="9.2" y="7.2" width="7.6" height="5.2" fill="#0d3b3b" className={rx ? "icq-led-on" : undefined} style={{ animationDelay: "-.18s" }} />
      <path d="M11.4 13.6h3.2V15h-3.2Z" fill="#8c887f" />
    </svg>
  );
}

/* ───────── Toolbar (24×24) ───────── */

export type ToolId = "info" | "file" | "chat" | "random" | "history";

const TOOL_ART: Record<ToolId, ReactNode> = {
  info: (
    <>
      <rect x="2" y="4.6" width="20" height="15.4" rx="2" fill="url(#icq-card)" stroke="#6e5a34" strokeWidth=".7" />
      <path d="M4 4.6h16a2 2 0 0 1 2 2v1.6H2V6.6a2 2 0 0 1 2-2Z" fill="#2f63c9" />
      <rect x="4.4" y="10.2" width="6.2" height="7.4" fill="#d6ecff" stroke="#6b7f99" strokeWidth=".5" />
      <circle cx="7.5" cy="12.6" r="1.7" fill="#4cc043" stroke="#1b7316" strokeWidth=".4" />
      <path d="M4.9 17.6c.3-2 1.2-2.9 2.6-2.9s2.3.9 2.6 2.9Z" fill="#4cc043" stroke="#1b7316" strokeWidth=".4" />
      <path d="M12.6 11.2h6.4M12.6 13.5h5.2M12.6 15.8h4" stroke="#9a8a66" strokeWidth=".9" strokeLinecap="round" />
      <circle cx="19" cy="18.6" r="4.1" fill="url(#icq-blue)" stroke="#0e3d8c" strokeWidth=".6" />
      <circle cx="19" cy="16.9" r=".8" fill="#fff" />
      <path d="M19 18.4v2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  file: (
    <>
      <path d="M4.2 2.6h14.2l3 3v14.6a1.2 1.2 0 0 1-1.2 1.2H4.2A1.2 1.2 0 0 1 3 20.2V3.8a1.2 1.2 0 0 1 1.2-1.2Z" fill="url(#icq-navy)" stroke="#0a1a4a" strokeWidth=".7" />
      <rect x="7" y="2.6" width="9.6" height="6.4" fill="url(#icq-steel)" stroke="#4d5a72" strokeWidth=".5" />
      <rect x="13" y="3.6" width="2" height="4.4" fill="#3d4a63" />
      <rect x="5.4" y="12" width="13.2" height="8.6" rx=".6" fill="#fffef6" stroke="#b8b2a0" strokeWidth=".4" />
      <path d="M7.2 14.6h9.6M7.2 16.8h7" stroke="#e2231a" strokeWidth=".8" strokeLinecap="round" />
      <path d="M4.4 3.8h1.4v7H4.4Z" fill="#fff" opacity=".22" />
      <circle cx="19.2" cy="19.4" r="4.1" fill="url(#icq-green)" stroke="#1b6a14" strokeWidth=".6" />
      <path d="M17.2 19.4h3.8M19.4 17.6l1.8 1.8-1.8 1.8" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  chat: (
    <>
      <path
        d="M10 2.5h9a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-.4l.6 3-3.7-3H10a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z"
        fill="url(#icq-green)"
        stroke="#1b6a14"
        strokeWidth=".7"
        strokeLinejoin="round"
      />
      <path d="M10.4 6.4h8.2M10.4 8.9h5.6" stroke="#fff" strokeOpacity=".85" strokeWidth=".9" strokeLinecap="round" />
      <path
        d="M5 9h8.4a3 3 0 0 1 3 3v4.6a3 3 0 0 1-3 3H8.6L5 22.4l.5-2.8H5a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3Z"
        fill="url(#icq-paper)"
        stroke="#4f5f7c"
        strokeWidth=".7"
        strokeLinejoin="round"
      />
      <path d="M4.6 13.2h7.2M4.6 15.8h4.2" stroke="#4a5a78" strokeWidth=".9" strokeLinecap="round" />
      <rect x="9.6" y="14.4" width="1.1" height="2.8" fill="#e2231a" className="icq-caret-blink" />
    </>
  ),
  random: (
    <>
      <circle cx="10" cy="10" r="8" fill="url(#icq-blue)" stroke="#0e3d8c" strokeWidth=".7" />
      <path
        d="M5 5.6c1.6.4 2.2 1.8 1.4 3-.8 1.2.6 2.2 1.8 2 1.4-.2 1.6 1 .8 2.2-.4.8 0 2 .8 2.6M12.4 2.6c-.6 1.2.2 2.2 1.4 2.4 1.2.2 1.4 1.4 2.6 1.6"
        stroke="#7be04f"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="10" cy="10" rx="3.6" ry="8" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth=".6" />
      <ellipse cx="7.4" cy="5.2" rx="3.6" ry="1.7" fill="#fff" opacity=".5" />
      <g transform="rotate(12 17.5 17.5)">
        <rect x="12.4" y="12.4" width="10" height="10" rx="2.2" fill="url(#icq-die)" stroke="#5f6b80" strokeWidth=".7" />
        <circle cx="14.9" cy="14.9" r=".95" fill="#e2231a" />
        <circle cx="17.4" cy="17.4" r=".95" fill="#e2231a" />
        <circle cx="19.9" cy="19.9" r=".95" fill="#e2231a" />
      </g>
    </>
  ),
  history: (
    <>
      <path d="M5 3h12.6a1.4 1.4 0 0 1 1.4 1.4v15.2a1.4 1.4 0 0 1-1.4 1.4H5Z" fill="url(#icq-book)" stroke="#4e0a06" strokeWidth=".7" />
      <path d="M17.6 4.6v15" stroke="#f4ead2" strokeWidth="1.1" />
      <rect x="3" y="3" width="3.2" height="18" rx=".9" fill="#5a0c08" />
      <path d="M3.6 4.4v15.2" stroke="#fff" strokeOpacity=".22" strokeWidth=".7" />
      <g transform="translate(11.4 9.6) scale(.34)">
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx="0" cy="-9" rx="4.3" ry="6.3" fill="#ffd77a" transform={`rotate(${i * 45})`} />
        ))}
        <circle r="4.8" fill="#fff3c4" />
      </g>
      <circle cx="18.6" cy="17.8" r="4.6" fill="#fff" stroke="#33405a" strokeWidth=".8" />
      <path d="M18.6 15.4v2.6l1.8 1.1" stroke="#1b2a44" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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

export const isTool = (id: string): id is ToolId => id in TOOL_ART;

/* ───────── Events in the history (16×16) ───────── */

export type EventId = "out" | "added" | "auth" | "web" | "error" | "card" | "phone" | "contacts" | "multi" | "status";

const EVENT_ART: Record<Exclude<EventId, "status">, ReactNode> = {
  out: (
    <>
      <path d="M2.5 1.5h8l3 3v10h-11Z" fill="#fff" stroke="#55627a" strokeWidth=".8" strokeLinejoin="round" />
      <path d="M10.5 1.5v3h3" fill="#e6ebf2" stroke="#55627a" strokeWidth=".8" strokeLinejoin="round" />
      <path d="M4.6 9.4h6M9 7.2l2.3 2.2L9 11.6" stroke="#1f9a1a" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  added: (
    <>
      <circle cx="6" cy="4.8" r="2.8" fill="#4cc043" stroke="#1b7316" strokeWidth=".7" />
      <path d="M1.4 14.6c.2-3.4 1.9-5.4 4.6-5.4s4.4 2 4.6 5.4Z" fill="#4cc043" stroke="#1b7316" strokeWidth=".7" />
      <circle cx="12" cy="11.4" r="3.7" fill="#2f63c9" stroke="#12348a" strokeWidth=".6" />
      <path d="M12 9.5v3.8M10.1 11.4h3.8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  auth: (
    <>
      <circle cx="6" cy="4.8" r="2.8" fill="#4cc043" stroke="#1b7316" strokeWidth=".7" />
      <path d="M1.4 14.6c.2-3.4 1.9-5.4 4.6-5.4s4.4 2 4.6 5.4Z" fill="#4cc043" stroke="#1b7316" strokeWidth=".7" />
      <circle cx="12" cy="11.4" r="3.7" fill="#ffd21f" stroke="#7a5400" strokeWidth=".6" />
      <path d="m10.3 11.5 1.2 1.2 2.3-2.4" stroke="#2a1800" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  web: (
    <>
      <circle cx="8" cy="8" r="6.6" fill="url(#icq-blue)" stroke="#0e3d8c" strokeWidth=".6" />
      <path d="M4.4 5c1.2.3 1.6 1.4 1 2.3-.6.9.5 1.7 1.4 1.5 1-.2 1.2.8.6 1.7M10 2.2c-.5 1 .2 1.7 1.1 1.9.9.2 1.1 1 1.9 1.2" stroke="#7be04f" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <ellipse cx="6" cy="4.2" rx="2.8" ry="1.3" fill="#fff" opacity=".5" />
    </>
  ),
  error: (
    <>
      <circle cx="8" cy="8" r="6.8" fill="#d81e14" stroke="#6e0904" strokeWidth=".7" />
      <ellipse cx="8" cy="4.6" rx="4" ry="2" fill="#fff" opacity=".3" />
      <path d="m5.4 5.4 5.2 5.2m0-5.2-5.2 5.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  card: (
    <>
      <rect x="1.5" y="3.5" width="13" height="9.5" fill="#fff7e8" stroke="#8a6a3a" strokeWidth=".8" />
      <path d="m1.8 3.8 6.2 5 6.2-5" stroke="#8a6a3a" strokeWidth=".8" fill="none" strokeLinejoin="round" />
      <rect x="10.4" y="5.2" width="2.8" height="3" fill="#ff7a8a" stroke="#a3203c" strokeWidth=".4" />
    </>
  ),
  phone: (
    <>
      <path
        d="M3.2 2.6c.9-.6 2-.3 2.5.6l1.1 2c.4.8.2 1.7-.5 2.2l-.8.6c.6 1.5 1.8 2.8 3.3 3.5l.6-.8c.5-.7 1.5-.9 2.2-.5l2 1.1c.9.5 1.2 1.6.6 2.5l-.7 1c-.8 1.1-2.2 1.5-3.5 1-4.2-1.6-7.4-4.8-9-9-.5-1.3-.1-2.7 1-3.5Z"
        fill="#e2231a"
        stroke="#7a0a05"
        strokeWidth=".7"
      />
      <path d="M3.4 3.6c-.6.5-.8 1.2-.6 1.9" stroke="#fff" strokeOpacity=".6" strokeWidth=".8" fill="none" strokeLinecap="round" />
    </>
  ),
  contacts: (
    <>
      <circle cx="10.6" cy="4.4" r="2.4" fill="#2f63c9" stroke="#12348a" strokeWidth=".6" />
      <path d="M6.8 13c.2-3 1.6-4.6 3.8-4.6s3.6 1.6 3.8 4.6Z" fill="#2f63c9" stroke="#12348a" strokeWidth=".6" />
      <circle cx="5.6" cy="6" r="2.7" fill="#4cc043" stroke="#1b7316" strokeWidth=".6" />
      <path d="M1.2 15c.2-3.3 1.8-5.1 4.4-5.1S9.8 11.7 10 15Z" fill="#4cc043" stroke="#1b7316" strokeWidth=".6" />
    </>
  ),
  multi: (
    <>
      <circle cx="10.6" cy="4.4" r="2.4" fill="#2f63c9" stroke="#12348a" strokeWidth=".6" />
      <path d="M6.8 13c.2-3 1.6-4.6 3.8-4.6s3.6 1.6 3.8 4.6Z" fill="#2f63c9" stroke="#12348a" strokeWidth=".6" />
      <circle cx="5.6" cy="6" r="2.7" fill="#4cc043" stroke="#1b7316" strokeWidth=".6" />
      <path d="M1.2 15c.2-3.3 1.8-5.1 4.4-5.1S9.8 11.7 10 15Z" fill="#4cc043" stroke="#1b7316" strokeWidth=".6" />
    </>
  ),
};

export function EventIcon({ id, className = "h-4 w-4" }: { id: EventId; className?: string }) {
  if (id === "status") return <Flower status="logo" className={className} />;
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      {EVENT_ART[id]}
    </svg>
  );
}

/* ───────── Composer bar (16×16) ───────── */

/** "A" over the current text color, as in every rich-text toolbar. */
export function TextColorIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <text x="8" y="11" textAnchor="middle" fontFamily="'Times New Roman', Times, serif" fontWeight="700" fontSize="12.5" fill="#111">
        A
      </text>
      <rect x="1.5" y="12.4" width="13" height="3" fill={color} stroke="#333" strokeWidth=".6" />
    </svg>
  );
}

/** The paint bucket, pouring the current background color. */
export function BackColorIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path d="M2.4 6.8 7.2 2l4.8 4.8L7.2 11.6Z" fill="#fff" stroke="#222" strokeWidth=".9" strokeLinejoin="round" />
      <path d="M2.4 6.8h9.6" stroke="#222" strokeWidth=".7" />
      <path d="M12.6 7.6c.9 1.3 1.4 2.1 1.4 2.7a1.4 1.4 0 0 1-2.8 0c0-.6.5-1.4 1.4-2.7Z" fill={color} stroke="#222" strokeWidth=".6" />
      <rect x="1.5" y="12.4" width="13" height="3" fill={color} stroke="#333" strokeWidth=".6" />
    </svg>
  );
}

/* ───────── Bits for the banner ads ───────── */

/** A cheap starburst, the kind every 2000 banner had behind its best offer. */
export function Burst({ className, points = 14 }: { className?: string; points?: number }) {
  const d = Array.from({ length: points * 2 }, (_, i) => {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? 31 : 48;
    return `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <polygon points={d} fill="#ffe600" stroke="#e08a00" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Trophy({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M9 6.2H5.4c0 3.8 1.8 6.2 4.6 6.8M23 6.2h3.6c0 3.8-1.8 6.2-4.6 6.8" fill="none" stroke="#c48a0c" strokeWidth="1.8" />
      <path d="M9 4h14v6.5c0 4.4-3.1 8-7 8s-7-3.6-7-8Z" fill="url(#icq-gold)" stroke="#7a4e00" strokeWidth=".8" />
      <path d="M14.2 18.2h3.6v4.4h-3.6Z" fill="#d9a21a" stroke="#7a4e00" strokeWidth=".5" />
      <path d="M10.4 22.6h11.2l1.2 4.8H9.2Z" fill="url(#icq-gold)" stroke="#7a4e00" strokeWidth=".8" />
      <ellipse cx="12.6" cy="8" rx="1.5" ry="3" fill="#fff" opacity=".65" />
      <path d="m16 7 .9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3Z" fill="#fff6c8" />
    </svg>
  );
}

/** A beige external 56k modem, front lights blinking. */
export function ModemBox({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 26" className={className} aria-hidden>
      <path d="M4 9.5h44l3 9.5H1Z" fill="url(#icq-beige)" stroke="#5e5848" strokeWidth=".8" strokeLinejoin="round" />
      <path d="M7 11.4h38" stroke="#fff" strokeOpacity=".7" strokeWidth=".8" />
      <rect x="1" y="19" width="50" height="5" fill="#cbc2a8" stroke="#5e5848" strokeWidth=".8" />
      <rect x="35" y="20.2" width="12" height="2.6" fill="#3a3830" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={6 + i * 4.4} cy="21.5" r="1.15" fill="#3a2a2a" className="icq-modem-led" style={{ animationDelay: `${-(i * 0.37).toFixed(2)}s` }} />
      ))}
    </svg>
  );
}

/** "UNDER CONSTRUCTION": a little worker with a shovel on the yellow diamond. */
export function DiggingSign({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M16 1.5 30.5 16 16 30.5 1.5 16Z" fill="#ffd21f" stroke="#1a1a1a" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M16 4.4 27.6 16 16 27.6 4.4 16Z" fill="none" stroke="#1a1a1a" strokeWidth=".7" />
      <circle cx="14.2" cy="10.4" r="1.7" fill="#1a1a1a" />
      <path d="M14 12.4 12.6 17l2.6 1.6 1 4.2M12.6 17l-2 4.6M13.4 13.6l3.6 1.6 3.4-1.4" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m20.4 14 1.6 6.4" stroke="#1a1a1a" strokeWidth="1" />
      <path d="M20.6 20.2h3l-.6 2.2h-1.8Z" fill="#1a1a1a" />
      <path d="M18.4 23.4c1.6-.9 3.6-.9 5.4 0" stroke="#1a1a1a" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

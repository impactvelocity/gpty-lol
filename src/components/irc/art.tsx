"use client";

/**
 * Hand-drawn art for the mIRC costume: the toolbar icons, the title-bar mark,
 * the dial-up "two monitors" tray icon, caption-button glyphs and the large
 * trout. Flat fills only (no shared gradient defs), in the chunky
 * outline-and-highlight style of Windows 98/2000 icons, so every piece is
 * safe to render anywhere, including the sidebar.
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot =
  | "wallpaper" | "scene" | "backdrop" | "nickPicture" | "trout"
  | "connect" | "options" | "channels" | "send" | "chat" | "notify" | "np" | "colors" | "about";

/**
 * Generated pictures that replace the drawn fallbacks (prompts and sizes in
 * src/components/irc/ART.md). Uncomment a line once its file is in
 * public/irc/. Icons are 128px and pictures 512px WebP; wide ones 1536px.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/irc/wallpaper.webp",
  scene: "/irc/scene.webp",
  backdrop: "/irc/backdrop.webp",
  nickPicture: "/irc/dp-nick.webp",
  trout: "/irc/trout.webp",
  // connect: "/irc/icon-connect.webp",
  // options: "/irc/icon-options.webp",
  // channels: "/irc/icon-channels.webp",
  // send: "/irc/icon-send.webp",
  // chat: "/irc/icon-chat.webp",
  // notify: "/irc/icon-notify.webp",
  // np: "/irc/icon-np.webp",
  // colors: "/irc/icon-colors.webp",
  // about: "/irc/icon-about.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/* ───────── Toolbar icons ───────── */

export type ToolId = "connect" | "options" | "channels" | "send" | "chat" | "notify" | "np" | "colors" | "about";

const INK = { stroke: "#1b1b1b", strokeWidth: 0.9, strokeLinejoin: "round" as const };

const DRAWN: Record<ToolId, React.ReactNode> = {
  connect: (
    <>
      <path d="M12 1.2 3.6 11.2h5.1L6.9 18.8l9.4-10.6h-5.4z" fill="#ffd21f" {...INK} />
      <path d="M11.2 3.2 5.6 10h2.2" stroke="#fff6b0" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M10.4 11.4 8.8 16" stroke="#e08a00" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </>
  ),
  options: (
    <>
      <g transform="rotate(-40 10 10)">
        <rect x="8.8" y="7" width="2.6" height="12" rx=".7" fill="#c8732a" {...INK} />
        <rect x="9.3" y="8" width=".8" height="10" fill="#f0b070" />
        <rect x="3.8" y="2" width="12.4" height="5" rx=".8" fill="#b8c0cc" {...INK} />
        <rect x="4.6" y="2.7" width="10.8" height="1.3" fill="#fff" opacity=".8" />
      </g>
    </>
  ),
  channels: (
    <>
      <path d="M1.4 4.6h6.2l1.6 1.6h9.4v11.4H1.4z" fill="#e8b330" {...INK} />
      <path d="M1.4 8h17.2v9.6H1.4z" fill="#ffd85e" {...INK} />
      <path d="M2.4 9h15.2" stroke="#fff3c0" strokeWidth="1" />
      <path d="M8.7 10.2 8.1 16.2M11.9 10.2l-.6 6M6.6 12.2h6.8M6.2 14.4h6.8" stroke="#123c8c" strokeWidth="1.25" strokeLinecap="round" />
    </>
  ),
  send: (
    <>
      <path d="M3.4 1.4h7.8l3.6 3.6v12.6H3.4z" fill="#fff" {...INK} />
      <path d="M11.2 1.4V5h3.6" fill="#d8d8d8" {...INK} />
      <path d="M5.4 7.2h6.4M5.4 9.4h5M5.4 11.6h3.6" stroke="#8a9bb0" strokeWidth="1" />
      <circle cx="14.4" cy="14.4" r="4.6" fill="#2fa33a" stroke="#0b3f10" strokeWidth=".9" />
      <path d="M14.4 16.9v-5M12.2 13.9l2.2-2.2 2.2 2.2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  chat: (
    <>
      <path d="M2.4 2.4h9.6a1.6 1.6 0 0 1 1.6 1.6v5a1.6 1.6 0 0 1-1.6 1.6H7.2L4 13.2v-2.6H2.4A1.6 1.6 0 0 1 .8 9V4a1.6 1.6 0 0 1 1.6-1.6z" fill="#fff" {...INK} />
      <path d="M8 7.6h9.6a1.6 1.6 0 0 1 1.6 1.6v5a1.6 1.6 0 0 1-1.6 1.6H16v2.6l-3.2-2.6H8a1.6 1.6 0 0 1-1.6-1.6v-5A1.6 1.6 0 0 1 8 7.6z" fill="#ffe066" {...INK} />
      <path d="M9.6 11.6h.1M12.8 11.6h.1M16 11.6h.1" stroke="#7a5a00" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  notify: (
    <>
      <path d="M10 2.2c-3 0-5 2.4-5 5.3v3.9l-1.9 2.8h13.8L15 11.4V7.5c0-2.9-2-5.3-5-5.3z" fill="#ffd23f" {...INK} />
      <path d="M7.1 5c.6-1 1.6-1.6 2.6-1.7" stroke="#fff8c8" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <circle cx="10" cy="16.4" r="1.9" fill="#c98f00" {...INK} />
      <path d="M2.2 6.2a6 6 0 0 1 1.7-3M17.8 6.2a6 6 0 0 0-1.7-3" stroke="#1b1b1b" strokeWidth="1" fill="none" strokeLinecap="round" />
    </>
  ),
  np: (
    <>
      <circle cx="9" cy="10.4" r="7.6" fill="#dde4ec" {...INK} />
      <path d="M9 2.8a7.6 7.6 0 0 1 6.6 3.8L9 10.4z" fill="#a9dcff" />
      <path d="M2.4 14.2A7.6 7.6 0 0 0 5.2 17L9 10.4z" fill="#ffc6ec" />
      <path d="M15.6 6.6a7.6 7.6 0 0 1 .8 2.4L9 10.4z" fill="#d9ffb0" />
      <circle cx="9" cy="10.4" r="7.6" fill="none" {...INK} />
      <circle cx="9" cy="10.4" r="2.2" fill="#fff" {...INK} />
      <path d="M16.2 2.6v9.6" stroke="#1b1b1b" strokeWidth="1.5" />
      <path d="M16.2 2.6c1.6.6 2.8 1.8 2.9 3.4" stroke="#1b1b1b" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <ellipse cx="14.6" cy="12.6" rx="2.1" ry="1.6" fill="#1b1b1b" transform="rotate(-20 14.6 12.6)" />
    </>
  ),
  colors: (
    <>
      <path d="M10 1.8C5.2 1.8 1.6 5.2 1.6 9.5c0 4 3.1 7 6.7 7 1.4 0 1.9-.9 1.4-2-.5-1.1.2-2.2 1.6-2.2h2.1c2.8 0 5-2 5-4.7 0-3.6-3.6-5.8-8.4-5.8z" fill="#f2d39c" {...INK} />
      <circle cx="5.8" cy="9" r="1.6" fill="#ff2a2a" stroke="#1b1b1b" strokeWidth=".6" />
      <circle cx="8" cy="5.4" r="1.6" fill="#ffd200" stroke="#1b1b1b" strokeWidth=".6" />
      <circle cx="12.2" cy="5" r="1.6" fill="#22b14c" stroke="#1b1b1b" strokeWidth=".6" />
      <circle cx="15.2" cy="7.8" r="1.6" fill="#1e5cff" stroke="#1b1b1b" strokeWidth=".6" />
      <circle cx="7" cy="13" r="1.3" fill="#9c009c" stroke="#1b1b1b" strokeWidth=".6" />
    </>
  ),
  about: (
    <>
      <circle cx="10" cy="10" r="8.2" fill="#2a6fd6" stroke="#0b2f6e" strokeWidth=".9" />
      <ellipse cx="8.2" cy="5.6" rx="4.4" ry="2.2" fill="#fff" opacity=".3" />
      <path d="M7.4 7.6a2.6 2.6 0 1 1 3.8 2.3c-.8.4-1.2 1-1.2 1.9v.5" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" />
      <circle cx="10" cy="14.8" r="1.15" fill="#fff" />
    </>
  ),
};

export function ToolIcon({ id, className = "irc-tool-icon" }: { id: ToolId; className?: string }) {
  const src = art(id);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={className} draggable={false} />;
  }
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      {DRAWN[id]}
    </svg>
  );
}

/* ───────── Marks and glyphs ───────── */

/** The app icon: Nick's diamond with a hash on it. */
export function MircMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M8 .9 15.1 8 8 15.1.9 8Z" fill="#3f5fdb" stroke="#0a1f6e" strokeWidth=".8" strokeLinejoin="round" />
      <path d="M8 1.9 3.4 6.5h9.2Z" fill="#fff" opacity=".28" />
      <path d="M6.9 4.8 6.2 11.2M9.8 4.8l-.7 6.4M4.9 6.9h6.4M4.6 9.1H11" stroke="#fff" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

/** A channel window's icon: a little sheet with a hash. */
export function ChannelMark({ className = "h-3.5 w-3.5", status = false }: { className?: string; status?: boolean }) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden>
      <rect x=".8" y="1.6" width="12.4" height="10.8" fill={status ? "#d4d0c8" : "#fff"} stroke="#000" strokeWidth=".8" />
      <rect x=".8" y="1.6" width="12.4" height="2.4" fill={status ? "#808080" : "#0a246a"} />
      {status ? (
        <path d="M3.4 6.4h7.2M3.4 8.4h5.2M3.4 10.4h6.2" stroke="#000" strokeWidth=".9" />
      ) : (
        <path d="M5.8 5.2 5.2 11.2M8.6 5.2 8 11.2M3.8 7h6.6M3.5 9.2h6.6" stroke="#009300" strokeWidth="1.05" strokeLinecap="round" />
      )}
    </svg>
  );
}

export type CapGlyph = "min" | "max" | "restore" | "close";

/** Pixel glyphs for the Windows 2000 caption buttons. */
export function Glyph({ kind }: { kind: CapGlyph }) {
  return (
    <svg viewBox="0 0 9 8" className="irc-glyph" aria-hidden shapeRendering="crispEdges">
      {kind === "min" && <rect x="1" y="6" width="6" height="2" fill="currentColor" />}
      {kind === "max" && <path d="M0 0h9v8H0Zm1 2v5h7V2Z" fill="currentColor" fillRule="evenodd" />}
      {kind === "restore" && (
        <path d="M2 0h7v6H7v2H0V2h2Zm1 1v1h4v3h1V1Zm-2 3v3h5V4Z" fill="currentColor" fillRule="evenodd" />
      )}
      {kind === "close" && (
        <path d="M0 0h2l2.5 2.5L7 0h2v1L5.5 4 9 7v1H7L4.5 5.5 2 8H0V7l3.5-3L0 1Z" fill="currentColor" />
      )}
    </svg>
  );
}

/**
 * The dial-up tray icon everyone stared at: two little monitors whose screens
 * light up when data goes out (front) and comes in (back).
 */
export function Modem({ tx, rx, className = "irc-modem" }: { tx: boolean; rx: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 16" className={className} aria-hidden shapeRendering="crispEdges">
      <rect x="7.5" y=".5" width="11" height="8.5" fill="#c0c0c0" stroke="#000" />
      <rect x="9" y="2" width="8" height="5.5" fill={rx ? "#3cffd8" : "#0a4848"} />
      <rect x="11" y="9" width="4" height="1.5" fill="#808080" />
      <rect x="1" y="5.5" width="11" height="8.5" fill="#dcd8d0" stroke="#000" />
      <rect x="2.5" y="7" width="8" height="5.5" fill={tx ? "#3cffd8" : "#0a4848"} />
      <rect x="4.5" y="14" width="4" height="1.5" fill="#808080" />
    </svg>
  );
}

/** The info icon on a balloon tip. */
export function InfoBubble({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <circle cx="8" cy="8" r="7" fill="#1f5fd6" stroke="#0a2a6e" strokeWidth=".8" />
      <circle cx="8" cy="4.6" r="1.15" fill="#fff" />
      <path d="M8 7.2v4.8" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

/** The warning triangle on the shareware nag and error dialogs. */
export function Warn({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M16 2.5 30 28H2Z" fill="#ffd21f" stroke="#1b1b1b" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M16 11v8" stroke="#1b1b1b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="23.4" r="1.8" fill="#1b1b1b" />
    </svg>
  );
}

/* ───────── The large trout ───────── */

/** A rainbow trout, nose to the right. Used when someone gets slapped. */
export function Trout({ className = "irc-trout-img" }: { className?: string }) {
  const src = art("trout");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={className} draggable={false} />;
  }
  return (
    <svg viewBox="0 0 170 72" className={className} aria-hidden>
      {/* tail */}
      <path d="M30 36 6 14c-3 7-4 15-3 22-1 7 0 15 3 22Z" fill="#7d8a3a" stroke="#2e3410" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 20c4 5 10 10 16 14M8 52c4-5 10-10 16-14" stroke="#4f5a1c" strokeWidth="1" fill="none" />
      {/* fins */}
      <path d="M78 14c6-7 18-9 28-6l-8 9Z" fill="#7d8a3a" stroke="#2e3410" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M70 58c4 6 12 9 20 9l-4-9ZM100 58c3 5 9 7 14 6l-3-7Z" fill="#e8b0a0" stroke="#5c2e22" strokeWidth="1.1" strokeLinejoin="round" />
      {/* body: olive back, silver belly */}
      <path d="M26 36c10-14 34-25 70-25 32 0 56 10 68 25-12 15-36 25-68 25-36 0-60-11-70-25Z" fill="#e9ece6" stroke="#2e3410" strokeWidth="1.5" />
      <path d="M26 36c10-14 34-25 70-25 32 0 56 10 68 25-9 1-22-1-36-3-30-4-62-4-102 3Z" fill="#8e9b45" />
      {/* the pink stripe */}
      <path d="M30 37c22-6 52-8 84-6 18 1 34 3 48 5-14 6-34 8-52 7-30-1-56-2-80-6Z" fill="#ff7fa0" opacity=".85" />
      <path d="M40 38c26-4 56-5 86-2" stroke="#ffd0dc" strokeWidth="1.4" fill="none" opacity=".9" strokeLinecap="round" />
      {/* spots */}
      {[
        [52, 24], [64, 20], [76, 27], [88, 18], [100, 25], [112, 19], [124, 26], [70, 31], [96, 31], [44, 30], [136, 22], [58, 45], [84, 48], [108, 46],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 ? 1.6 : 2.1} fill="#2b2a14" />
      ))}
      {/* gill, mouth, eye */}
      <path d="M136 22c-5 8-5 20 0 28" stroke="#5c3a22" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M163 37c-4 2-9 2-13 1" stroke="#2e3410" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="150" cy="30" r="5" fill="#fff" stroke="#2e3410" strokeWidth="1.2" />
      <circle cx="151.4" cy="30.4" r="2.6" fill="#111" />
      <circle cx="152.4" cy="29.2" r=".9" fill="#fff" />
      {/* a wet shine */}
      <path d="M70 16c18-3 40-2 58 3" stroke="#fff" strokeWidth="2.2" fill="none" opacity=".5" strokeLinecap="round" />
    </svg>
  );
}

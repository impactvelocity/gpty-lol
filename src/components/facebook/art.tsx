"use client";

import { useId } from "react";

/**
 * Hand-drawn art for the Facebook costume: the favicon, the default picture,
 * the little app icons, the poking finger, the sheep, and the photos in the
 * feed. Every piece that's used outside the window (the sheep in the scene
 * behind it) keeps its gradients to itself with useId, so it never depends on
 * defs that might be hidden. Only the emoticons share <FbDefs />.
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot =
  | "wallpaper" | "backdrop" | "buddyPicture" | "userPicture"
  | "photo1" | "photo2" | "photo3" | "sheep" | "finger";

/**
 * Generated pictures that replace the drawn fallbacks (prompts and sizes in
 * src/components/facebook/ART.md). Remove a line to fall back to the drawing.
 * Pictures are 512px WebP, the album photos 512×384, the sheep and the hand
 * cut-outs with alpha; the wide ones stay 1536px.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/facebook/wallpaper.webp",
  backdrop: "/facebook/backdrop.webp",
  buddyPicture: "/facebook/dp-buddy.webp",
  userPicture: "/facebook/dp-you.webp",
  photo1: "/facebook/photo-beach.webp",
  photo2: "/facebook/photo-party.webp",
  photo3: "/facebook/photo-roadtrip.webp",
  sheep: "/facebook/sheep.webp",
  finger: "/facebook/finger.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/* ───────── Shared gradients (emoticons only) ───────── */

export function FbDefs() {
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden focusable="false">
      <defs>
        <radialGradient id="fb-face" cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff7c4" />
          <stop offset=".45" stopColor="#ffd93a" />
          <stop offset="1" stopColor="#f2a90c" />
        </radialGradient>
        <radialGradient id="fb-face-red" cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffd6c8" />
          <stop offset=".45" stopColor="#f56b45" />
          <stop offset="1" stopColor="#c62d12" />
        </radialGradient>
        <linearGradient id="fb-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="fb-heart" cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor="#ffc2cd" />
          <stop offset=".4" stopColor="#f2435f" />
          <stop offset="1" stopColor="#b3122f" />
        </radialGradient>
        <linearGradient id="fb-shark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d6ee" />
          <stop offset="1" stopColor="#6f86b6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ───────── Marks ───────── */

/** The blue square with the lowercase f, as the tab and address bar show it. */
export function Favicon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect width="16" height="16" rx="3" fill="#3b5998" />
      <path d="M10.9 16V10h2l.3-2.3H10.9V6.3c0-.7.2-1.1 1.1-1.1h1.2V3.1c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.6h-2V10h2v6Z" fill="#fff" />
    </svg>
  );
}

/** A generic red video-site tab icon. */
export function TubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="1" y="3" width="14" height="10" rx="3" fill="#e62117" />
      <path d="M6.5 5.6v4.8L10.6 8Z" fill="#fff" />
    </svg>
  );
}

/* ───────── Pictures ───────── */

/** Everyone's picture before they uploaded one: the pale silhouette. */
export function DefaultPic() {
  const id = useId();
  return (
    <svg viewBox="0 0 50 50" className="block h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6ebf4" />
          <stop offset="1" stopColor="#c4cfe2" />
        </linearGradient>
      </defs>
      <rect width="50" height="50" fill={`url(#${id}bg)`} />
      <circle cx="25" cy="19" r="9" fill="#fff" />
      <path d="M7 50c0-11 8-17 18-17s18 6 18 17Z" fill="#fff" />
    </svg>
  );
}

/* ───────── Little app icons (16px) ───────── */

export type AppId =
  | "feed" | "inbox" | "events" | "photos" | "friends" | "groups" | "notes" | "video"
  | "superpoke" | "scrabulous" | "topfriends" | "zombies" | "market" | "chat" | "flag" | "apps";

export function AppIcon({ id, className = "fb-ico" }: { id: AppId; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      {ICONS[id]}
    </svg>
  );
}

const ICONS: Record<AppId, React.ReactNode> = {
  feed: (
    <>
      <rect x="2" y="1.5" width="12" height="13" rx="1.5" fill="#fff" stroke="#6d84b4" />
      <rect x="4" y="4" width="4" height="3" fill="#3b5998" />
      <path d="M9.5 4.5h3M9.5 6.5h3M4 9h8.5M4 11h8.5" stroke="#9aaacf" strokeLinecap="round" />
    </>
  ),
  inbox: (
    <>
      <rect x="1" y="3.5" width="14" height="9.5" rx="1.4" fill="#fff" stroke="#6d84b4" />
      <path d="m1.6 4.3 6.4 5 6.4-5" fill="none" stroke="#6d84b4" strokeLinejoin="round" />
    </>
  ),
  events: (
    <>
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" fill="#fff" stroke="#b9bfcc" />
      <path d="M1.5 4a1.5 1.5 0 0 1 1.5-1.5h10A1.5 1.5 0 0 1 14.5 4v2h-13Z" fill="#e14a37" />
      <text x="8" y="13" textAnchor="middle" fontSize="6.4" fontWeight="700" fill="#333" fontFamily="Arial, sans-serif">14</text>
    </>
  ),
  photos: (
    <>
      <rect x="3.5" y="1.5" width="11" height="9" rx="1" fill="#fff" stroke="#9aa6bd" transform="rotate(8 9 6)" />
      <rect x="1.5" y="4.5" width="11" height="9.5" rx="1" fill="#fff" stroke="#6d84b4" />
      <rect x="2.6" y="5.6" width="8.8" height="7.3" fill="#8ec5f2" />
      <path d="M2.6 12.9 5.8 9l2.2 2.4 1.4-1.4 2 2.9Z" fill="#5aa845" />
      <circle cx="9.4" cy="7.6" r="1" fill="#ffe36b" />
    </>
  ),
  friends: (
    <>
      <circle cx="10.6" cy="5" r="2.6" fill="#9aaacf" />
      <path d="M6.6 14c0-3 1.8-4.8 4-4.8s4 1.8 4 4.8Z" fill="#9aaacf" />
      <circle cx="5.6" cy="6" r="2.8" fill="#3b5998" />
      <path d="M1 15c0-3.3 2-5.2 4.6-5.2s4.6 1.9 4.6 5.2Z" fill="#3b5998" />
    </>
  ),
  groups: (
    <>
      <circle cx="3.6" cy="6" r="2" fill="#9aaacf" />
      <circle cx="12.4" cy="6" r="2" fill="#9aaacf" />
      <path d="M0.5 13c0-2.5 1.3-3.8 3.1-3.8s3.1 1.3 3.1 3.8ZM9.3 13c0-2.5 1.3-3.8 3.1-3.8s3.1 1.3 3.1 3.8Z" fill="#9aaacf" />
      <circle cx="8" cy="5.4" r="2.5" fill="#3b5998" />
      <path d="M4 14.5c0-3 1.8-4.6 4-4.6s4 1.6 4 4.6Z" fill="#3b5998" />
    </>
  ),
  notes: (
    <>
      <rect x="2.5" y="1.5" width="11" height="13" rx="1" fill="#fff8c9" stroke="#d6b64a" />
      <path d="M4.5 5h7M4.5 7.5h7M4.5 10h5" stroke="#c9a531" strokeLinecap="round" />
      <path d="M2.5 3.5h11" stroke="#e66" />
    </>
  ),
  video: (
    <>
      <rect x="1.5" y="3" width="13" height="10" rx="1.2" fill="#3a3f4b" />
      <path d="M1.5 5h13M1.5 11h13" stroke="#6d7487" />
      <path d="M3 3.6v.8M5.5 3.6v.8M8 3.6v.8M10.5 3.6v.8M13 3.6v.8M3 11.6v.8M5.5 11.6v.8M8 11.6v.8M10.5 11.6v.8M13 11.6v.8" stroke="#fff" />
      <path d="M6.6 6.4v3.2L9.4 8Z" fill="#fff" />
    </>
  ),
  superpoke: (
    <>
      <circle cx="5" cy="9" r="3" fill="#fff" stroke="#b8bfcc" strokeWidth=".8" />
      <circle cx="8.4" cy="7.4" r="3.4" fill="#fff" stroke="#b8bfcc" strokeWidth=".8" />
      <circle cx="10" cy="10.4" r="2.8" fill="#fff" stroke="#b8bfcc" strokeWidth=".8" />
      <path d="M5 11.6h6.4" stroke="#fff" strokeWidth="2.4" />
      <ellipse cx="12.8" cy="7.4" rx="2.3" ry="2.7" fill="#34323b" />
      <circle cx="12.3" cy="7" r=".6" fill="#fff" />
      <circle cx="13.8" cy="7" r=".6" fill="#fff" />
      <path d="M6 12.6v2M9.4 12.6v2" stroke="#34323b" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  scrabulous: (
    <>
      <rect x="2" y="2" width="12" height="12" rx="1.6" fill="#f3d9a1" stroke="#c9a565" />
      <text x="7.6" y="11.6" textAnchor="middle" fontSize="9" fontWeight="700" fill="#5a3b10" fontFamily="Georgia, serif">S</text>
      <text x="12" y="12.6" textAnchor="middle" fontSize="3.4" fill="#5a3b10" fontFamily="Arial, sans-serif">1</text>
    </>
  ),
  topfriends: <path d="m8 1.4 2 4.2 4.6.6-3.4 3.2.9 4.6L8 11.8 3.9 14l.9-4.6L1.4 6.2 6 5.6Z" fill="#ffc83a" stroke="#d99a0c" strokeLinejoin="round" />,
  zombies: (
    <>
      <circle cx="8" cy="8" r="6.5" fill="#8bc76a" stroke="#4f8a33" />
      <circle cx="5.6" cy="7" r="1.5" fill="#fff" />
      <circle cx="10.4" cy="7" r="1.5" fill="#fff" />
      <circle cx="5.8" cy="7.3" r=".6" fill="#222" />
      <circle cx="10.2" cy="7.3" r=".6" fill="#222" />
      <path d="M5 11h6M6.4 10.3v1.4M8 10.3v1.4M9.6 10.3v1.4" stroke="#2f5a1e" strokeWidth=".8" />
    </>
  ),
  market: (
    <>
      <path d="M2 8.4V2.6A.6.6 0 0 1 2.6 2h5.8l6.1 6.1a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4 0Z" fill="#ffa84a" stroke="#d3741a" strokeLinejoin="round" />
      <circle cx="5.2" cy="5.2" r="1.2" fill="#fff" />
    </>
  ),
  chat: (
    <>
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v6a1.5 1.5 0 0 1-1.5 1.5H7l-3 3v-3h-.5A1.5 1.5 0 0 1 2 9.5Z" fill="#fff" stroke="#6d84b4" strokeLinejoin="round" />
      <path d="M5 5.6h6M5 7.8h4" stroke="#9aaacf" strokeLinecap="round" />
    </>
  ),
  flag: (
    <>
      <path d="M3.6 1.8v12.6" stroke="#5a6273" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4.2 2.6c2.4-1.2 4 .8 6.4-.2 1-.4 1.8-.3 2.6.1v6.2c-.8-.4-1.6-.5-2.6-.1-2.4 1-4-1-6.4.2Z" fill="#e8ecf4" stroke="#6d84b4" strokeLinejoin="round" />
    </>
  ),
  apps: (
    <>
      <rect x="2" y="2" width="5" height="5" rx="1" fill="#3b5998" />
      <rect x="9" y="2" width="5" height="5" rx="1" fill="#6d84b4" />
      <rect x="2" y="9" width="5" height="5" rx="1" fill="#6d84b4" />
      <rect x="9" y="9" width="5" height="5" rx="1" fill="#3b5998" />
    </>
  ),
};

/** Mark is typing. */
export function Pencil({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="m3 11.4 7.6-7.6 1.8 1.8-7.6 7.6-2.4.6Z" fill="#ffcf4a" stroke="#a5780c" strokeWidth=".8" strokeLinejoin="round" />
      <path d="m10.6 3.8 1-1a1 1 0 0 1 1.4 0l.4.4a1 1 0 0 1 0 1.4l-1 1Z" fill="#ef8f9c" stroke="#a54c58" strokeWidth=".8" />
      <path d="m3 11.4-.6 2.4 2.4-.6Z" fill="#555" />
    </svg>
  );
}

export function SearchGlass({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <circle cx="6.6" cy="6.6" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m10 10 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ───────── Poke and SuperPoke ───────── */

/** A cartoon hand with its finger out, pointing right. The poke. */
export function Finger({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  const id = useId();
  const photo = art("finger");
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" className={className} style={style} draggable={false} />;
  }
  const skin = `url(#${id}skin)`;
  const ink = "#b5774f";
  return (
    <svg viewBox="0 0 140 70" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id={`${id}skin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3c8" />
          <stop offset=".55" stopColor="#f7c49d" />
          <stop offset="1" stopColor="#e5a57c" />
        </linearGradient>
        <linearGradient id={`${id}cuff`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b79bd" />
          <stop offset="1" stopColor="#2c4479" />
        </linearGradient>
      </defs>
      {/* Sleeve and cuff */}
      <path d="M0 16h26a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6H0Z" fill={`url(#${id}cuff)`} />
      <path d="M26 16h6v40h-6Z" fill="#fff" opacity=".9" />
      {/* Fist */}
      <path d="M32 24c0-6 5-10 12-10h22c6 0 10 4 10 9v24c0 7-6 12-14 12H44c-7 0-12-5-12-11Z" fill={skin} stroke={ink} strokeWidth="1.6" />
      {/* Index finger */}
      <rect x="62" y="15" width="74" height="17" rx="8.5" fill={skin} stroke={ink} strokeWidth="1.6" />
      <path d="M126 18.5c3.4.3 5.6 2.4 6 5.4" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
      <path d="M96 19v9" stroke={ink} strokeWidth="1.2" strokeLinecap="round" opacity=".55" />
      {/* Curled fingers */}
      <path d="M66 33h4c5 0 8 3 8 6.5S75 46 70 46h-4" fill={skin} stroke={ink} strokeWidth="1.6" />
      <path d="M64 46h4c4.6 0 7.4 2.8 7.4 6s-2.8 6-7.4 6h-4" fill={skin} stroke={ink} strokeWidth="1.6" />
      {/* Thumb across the front */}
      <path d="M40 33c6 6 16 7 26 3" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M44 22c6-3 14-3 18 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

/** A very fluffy sheep, ready to be thrown. Faces right. */
export function Sheep({ className = "", style, width }: { className?: string; style?: React.CSSProperties; width?: number }) {
  const id = useId();
  const photo = art("sheep");
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" className={className} style={{ width, ...style }} draggable={false} />;
  }
  const wool = `url(#${id}wool)`;
  const puffs: [number, number, number][] = [
    [26, 44, 14], [36, 31, 15], [52, 26, 16], [68, 30, 14], [76, 44, 13],
    [66, 55, 14], [48, 57, 15], [31, 55, 13], [50, 42, 18],
  ];
  return (
    <svg viewBox="0 0 112 84" width={width} className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id={`${id}wool`} cx=".4" cy=".3" r=".75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".7" stopColor="#f2f3f7" />
          <stop offset="1" stopColor="#d5dae6" />
        </radialGradient>
      </defs>
      {/* Legs */}
      {[34, 44, 58, 68].map((x, i) => (
        <rect key={i} x={x} y="60" width="6.5" height="18" rx="3.25" fill="#34313b" />
      ))}
      {/* Wool */}
      {puffs.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={wool} stroke="#c9cfdd" strokeWidth=".8" />
      ))}
      <circle cx="16" cy="44" r="5" fill={wool} stroke="#c9cfdd" strokeWidth=".8" />
      {/* Head */}
      <ellipse cx="88" cy="38" rx="6.5" ry="3.4" fill="#34313b" transform="rotate(-28 88 38)" />
      <ellipse cx="91" cy="44" rx="11" ry="13" fill="#3a3742" />
      <ellipse cx="102" cy="40" rx="6" ry="3" fill="#34313b" transform="rotate(24 102 40)" />
      <circle cx="87" cy="31" r="5" fill={wool} />
      <circle cx="94" cy="30" r="5.5" fill={wool} />
      {/* Eyes, slightly alarmed */}
      <ellipse cx="87" cy="42" rx="3.2" ry="3.6" fill="#fff" />
      <ellipse cx="95.5" cy="42" rx="3.2" ry="3.6" fill="#fff" />
      <circle cx="88" cy="42.6" r="1.6" fill="#1c1a20" />
      <circle cx="96.4" cy="42.6" r="1.6" fill="#1c1a20" />
      <ellipse cx="91.5" cy="51" rx="2.6" ry="1.6" fill="#5c5866" />
    </svg>
  );
}

/* ───────── Photos in the feed ───────── */

export type PhotoId = "beach" | "party" | "roadtrip";

/**
 * The drawn backgrounds for the "Spring Break 08!!!" album. The layout puts
 * the gpty on top, with the on-camera flash.
 */
export function PhotoScene({ id }: { id: PhotoId }) {
  const u = useId();
  const g = (s: string) => `${u}${s}`;
  if (id === "beach") {
    return (
      <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={g("sky")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff9a6a" />
            <stop offset=".55" stopColor="#ffc98a" />
            <stop offset="1" stopColor="#ffe6b8" />
          </linearGradient>
          <linearGradient id={g("sea")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3aa7c9" />
            <stop offset="1" stopColor="#1d6f9c" />
          </linearGradient>
        </defs>
        <rect width="120" height="90" fill={`url(#${g("sky")})`} />
        <circle cx="86" cy="44" r="13" fill="#fff3c2" opacity=".9" />
        <rect y="48" width="120" height="20" fill={`url(#${g("sea")})`} />
        <path d="M0 52h120M8 57h34M60 60h44" stroke="#bfeaff" strokeWidth=".8" opacity=".7" />
        <path d="M0 68c30-5 70-5 120 0v22H0Z" fill="#f3d39a" />
        <path d="M14 90c2-20 4-34 10-44" stroke="#5a3d22" strokeWidth="2.4" fill="none" />
        <path d="M24 46c-8-2-14 2-17 7M24 46c-2-7-9-10-15-8M24 46c5-6 12-6 16-2M24 46c7 0 11 5 12 10" stroke="#2f6b2a" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  if (id === "party") {
    return (
      <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id={g("room")} cx=".5" cy=".45" r=".8">
            <stop offset="0" stopColor="#4b2f6a" />
            <stop offset="1" stopColor="#140b22" />
          </radialGradient>
        </defs>
        <rect width="120" height="90" fill={`url(#${g("room")})`} />
        {[
          [14, 18, 7, "#ff5fa2"], [40, 10, 5, "#ffd34d"], [96, 16, 8, "#4dd2ff"], [108, 44, 6, "#ff5fa2"],
          [8, 50, 6, "#8cff6b"], [70, 8, 4, "#ffffff"], [30, 70, 5, "#4dd2ff"],
        ].map(([x, y, r, c], i) => (
          <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={c as string} opacity=".38" />
        ))}
        <path d="M0 6q30 12 60 4t60 4" stroke="#1d1430" strokeWidth=".8" fill="none" />
        {[8, 20, 32, 44, 56, 68, 80, 92, 104, 116].map((x, i) => (
          <circle key={i} cx={x} cy={7 + Math.sin(i * 1.1) * 3 + 2} r="1.5" fill={["#ffd34d", "#ff5fa2", "#4dd2ff"][i % 3]} />
        ))}
        {/* Cups on the table */}
        <path d="M84 70h12l-1.6 18h-8.8Z" fill="#d7262e" />
        <path d="M84 70h12v2.4H84Z" fill="#fff" />
        <path d="M99 73h10l-1.4 15h-7.2Z" fill="#d7262e" />
        <path d="M99 73h10v2H99Z" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={g("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fa8e8" />
          <stop offset="1" stopColor="#cfe8fb" />
        </linearGradient>
      </defs>
      <rect width="120" height="90" fill={`url(#${g("sky")})`} />
      <path d="M0 52 18 38l10 8 16-16 20 22h56v38H0Z" fill="#c9774a" />
      <path d="M40 52 54 40l12 12Z" fill="#a85a35" />
      <rect y="52" width="120" height="38" fill="#e2b77f" />
      <path d="M50 90 58 52h4l8 38Z" fill="#555a63" />
      <path d="M60 56v4M60 66v6M60 78v8" stroke="#ffd34d" strokeWidth="1.2" />
      {/* The car window frame */}
      <path d="M0 0h120v90H0Z M8 10q52-8 104 0l4 72q-56 6-112 0Z" fill="#2a2d33" fillRule="evenodd" opacity=".85" />
    </svg>
  );
}

/** The scene behind the window: a sky that's mostly sheep, over a green pasture. */
export function SheepSkyHill() {
  const u = useId();
  return (
    <svg viewBox="0 0 1600 300" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[24%] w-full" aria-hidden>
      <defs>
        <linearGradient id={`${u}far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fae55" />
          <stop offset="1" stopColor="#3f7d33" />
        </linearGradient>
        <linearGradient id={`${u}near`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5aa043" />
          <stop offset="1" stopColor="#2b6324" />
        </linearGradient>
      </defs>
      <path d="M0 150C260 70 520 110 820 130S1340 60 1600 90V300H0Z" fill={`url(#${u}far)`} opacity=".9" />
      <path d="M0 230C300 170 640 190 940 220S1420 180 1600 190V300H0Z" fill={`url(#${u}near)`} />
    </svg>
  );
}

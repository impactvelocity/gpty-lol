"use client";

import { useId } from "react";

/**
 * Hand-drawn art for the reddit costume: the alien favicon, the orangered and
 * periwinkle vote arrows, the mail envelope, Firefox 3's Tango-style toolbar
 * icons on Ubuntu's Human theme, the sidebar ad and the lanterns in the scene.
 * Anything with a gradient makes its own ids with useId, so the pieces work
 * anywhere (the sidebar row and the scene sit outside the window).
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot = "wallpaper" | "ad" | "broke";

/**
 * Generated pictures that replace the drawn fallbacks (prompts and sizes in
 * src/components/reddit/ART.md). Remove a line to fall back to the drawing.
 * The wallpaper is 1536×1024, the ad 600×500 and the error cut-out 512px
 * with alpha, all WebP.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/reddit/wallpaper.webp",
  ad: "/reddit/ad.webp",
  broke: "/reddit/broke.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/* ───────── Marks ───────── */

/** The gpty alien's outline (same as its shape in Gpty.tsx), for the favicon. */
const ALIEN =
  "M5.5 28.5a18.5 12.5 0 1 0 37 0a18.5 12.5 0 1 0 -37 0ZM25.9 17.4C26.7 13.6 29 10.9 32.2 9.4L31.2 7.6C27.4 9.4 24.6 12.6 23.6 17.2ZM30 6a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z";

/** The tab and address-bar icon: the alien's head, orangered, with white eyes. */
export function Favicon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="2 2 44 44" className={className} aria-hidden>
      <path d={ALIEN} fill="#ff4500" stroke="#c23400" strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="19" cy="27.5" rx="3.2" ry="4.2" fill="#fff" />
      <ellipse cx="29" cy="27.5" rx="3.2" ry="4.2" fill="#fff" />
    </svg>
  );
}

/** The old reddit arrow, a fat head on a short stalk, in a 15×14 box. */
const ARROW = "M7.5 .9 14.2 7.6H10.3V13.2H4.7V7.6H.8Z";

export type Vote = 1 | -1 | 0;

/**
 * An up or down arrow. Grey until you vote; up turns orangered, down turns
 * periwinkle, with a little bevel so they read as buttons.
 */
export function VoteArrow({ dir, on, className = "" }: { dir: "up" | "down"; on: boolean; className?: string }) {
  const id = useId();
  const up = dir === "up";
  return (
    <svg viewBox="0 0 15 14" className={`rd-arrow-svg ${className}`} style={up ? undefined : { rotate: "180deg" }} aria-hidden>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1={up ? 0 : 1} x2="0" y2={up ? 1 : 0}>
          {on && up && (
            <>
              <stop offset="0" stopColor="#ff9a6e" />
              <stop offset=".55" stopColor="#ff5a1a" />
              <stop offset="1" stopColor="#ff4500" />
            </>
          )}
          {on && !up && (
            <>
              <stop offset="0" stopColor="#c4c4ff" />
              <stop offset=".55" stopColor="#9d9dff" />
              <stop offset="1" stopColor="#8a8af5" />
            </>
          )}
          {!on && (
            <>
              <stop offset="0" stopColor="#d9d9d9" />
              <stop offset="1" stopColor="#c2c2c2" />
            </>
          )}
        </linearGradient>
      </defs>
      <path
        d={ARROW}
        fill={`url(#${id}g)`}
        stroke={on ? (up ? "#d13a00" : "#6f6fe0") : "#ababab"}
        strokeWidth=".9"
        strokeLinejoin="round"
      />
      <path d="M7.5 2.4 11.9 6.8" stroke="#fff" strokeOpacity={on ? 0.55 : 0.7} strokeWidth=".9" strokeLinecap="round" />
    </svg>
  );
}

/** The mail envelope in the header: grey, or orangered when there's something new. */
export function Envelope({ unread, className = "h-[11px] w-[16px]" }: { unread: boolean; className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 16 11" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={unread ? "#ff7a45" : "#f4f4f4"} />
          <stop offset="1" stopColor={unread ? "#ff4500" : "#d6d6d6"} />
        </linearGradient>
      </defs>
      <rect x=".6" y=".6" width="14.8" height="9.8" rx="1.3" fill={`url(#${id}m)`} stroke={unread ? "#c23400" : "#9a9a9a"} strokeWidth=".9" />
      <path d="m1.2 1.4 6.8 5.1 6.8-5.1" fill="none" stroke={unread ? "#fff" : "#9a9a9a"} strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────── Firefox 3 on Ubuntu 9.04 ───────── */

/** A plain blue browser globe for the window's title bar. */
export function Globe({ className = "h-4 w-4" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}s`} cx=".36" cy=".3" r=".8">
          <stop offset="0" stopColor="#bfe0ff" />
          <stop offset=".5" stopColor="#4f8fd6" />
          <stop offset="1" stopColor="#1d4f91" />
        </radialGradient>
      </defs>
      <circle cx="8" cy="8" r="7" fill={`url(#${id}s)`} stroke="#173f75" strokeWidth=".8" />
      <g fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth=".7">
        <ellipse cx="8" cy="8" rx="3" ry="7" />
        <path d="M1.4 5.6h13.2M1.4 10.4h13.2M8 1v14" />
      </g>
      <path d="M3.4 4.6C4.5 3 6.2 2.2 8 2.3" stroke="#fff" strokeOpacity=".8" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export type NavId = "back" | "forward" | "reload" | "stop" | "home";

/** The navigation toolbar's icons, in the Tango style Firefox wore on Linux. */
export function NavIcon({ id: which, off = false }: { id: NavId; off?: boolean }) {
  const id = useId();
  const blue = off ? ["#e2e2e2", "#b9b9b9", "#9a9a9a"] : ["#a9cdf2", "#4f86c6", "#204a87"];
  const grad = (
    <defs>
      <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={blue[0]} />
        <stop offset="1" stopColor={blue[1]} />
      </linearGradient>
      <radialGradient id={`${id}r`} cx=".4" cy=".3" r=".8">
        <stop offset="0" stopColor={off ? "#e6e6e6" : "#ff8a8a"} />
        <stop offset=".6" stopColor={off ? "#c4c4c4" : "#e01b1b"} />
        <stop offset="1" stopColor={off ? "#a8a8a8" : "#a40000"} />
      </radialGradient>
    </defs>
  );
  switch (which) {
    case "back":
    case "forward":
      return (
        <svg viewBox="0 0 24 24" className="rd-nav-ico" style={which === "forward" ? { scale: "-1 1" } : undefined} aria-hidden>
          {grad}
          <path d="M2.6 12 11 4.2v4.6h9.6v6.4H11v4.6Z" fill={`url(#${id}f)`} stroke={blue[2]} strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M4.6 12 10 7.1M11.6 9.6h8.2" stroke="#fff" strokeOpacity={off ? 0.5 : 0.6} strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case "reload":
      return (
        <svg viewBox="0 0 24 24" className="rd-nav-ico" aria-hidden>
          {grad}
          <path
            d="M19.2 9.4a7.8 7.8 0 1 0 .4 5.2l-3.2-.9a4.5 4.5 0 1 1-.4-3.1l-2.5 2.4h7.4V5.6Z"
            fill={`url(#${id}f)`}
            stroke={blue[2]}
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "stop":
      return (
        <svg viewBox="0 0 24 24" className="rd-nav-ico" aria-hidden>
          {grad}
          <path d="M8.3 2.6h7.4l5.7 5.7v7.4l-5.7 5.7H8.3l-5.7-5.7V8.3Z" fill={`url(#${id}r)`} stroke={off ? "#8f8f8f" : "#820000"} strokeWidth="1" strokeLinejoin="round" />
          <path d="m8.4 8.4 7.2 7.2m0-7.2-7.2 7.2" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case "home":
      return (
        <svg viewBox="0 0 24 24" className="rd-nav-ico" aria-hidden>
          {grad}
          <path d="M5 11.5V20.5h14v-9" fill="#f5f2ee" stroke="#8a7d70" strokeWidth="1" strokeLinejoin="round" />
          <path d="M2.6 12.4 12 3.6l9.4 8.8" fill="none" stroke="#a63b1a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="9.8" y="14" width="4.4" height="6.5" rx=".6" fill="#b6773f" stroke="#7a4b22" strokeWidth=".8" />
          <rect x="15.4" y="13.2" width="2.4" height="2.4" fill="#9fc4ea" stroke="#5c7fa6" strokeWidth=".6" />
        </svg>
      );
  }
}

/** The bookmark star at the end of the address bar. */
export function Star({ on = false, className = "h-4 w-4" }: { on?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path
        d="m8 1.6 1.95 4 4.4.6-3.2 3.1.8 4.4L8 11.6l-3.95 2.1.8-4.4-3.2-3.1 4.4-.6Z"
        fill={on ? "#fcd84d" : "#fff"}
        stroke={on ? "#c49a10" : "#8c8c8c"}
        strokeWidth=".9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Favicons for the bookmarks bar and the other tab. */
export function SiteIcon({ site, className = "h-4 w-4" }: { site: "wiki" | "xkcd" | "news" | "reader" | "dot" | "folder" | "feed"; className?: string }) {
  switch (site) {
    case "wiki":
      return (
        <svg viewBox="0 0 16 16" className={className} aria-hidden>
          <rect x=".5" y=".5" width="15" height="15" rx="2" fill="#fff" stroke="#b5b5b5" />
          <text x="8" y="12" textAnchor="middle" fontSize="10.5" fontFamily="Georgia, 'Times New Roman', serif" fill="#222">W</text>
        </svg>
      );
    case "xkcd":
      return (
        <svg viewBox="0 0 16 16" className={className} aria-hidden>
          <rect x=".5" y=".5" width="15" height="15" rx="2" fill="#fff" stroke="#9aa3b0" />
          <circle cx="8" cy="4.6" r="2" fill="none" stroke="#111" strokeWidth="1.1" />
          <path d="M8 6.6v4.6M8 8.4 5.4 10M8 8.4l2.6 1.6M8 11.2 6 14.4M8 11.2l2 3.2" stroke="#111" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "news":
      return (
        <svg viewBox="0 0 16 16" className={className} aria-hidden>
          <rect x=".5" y=".5" width="15" height="15" rx="2" fill="#ff6600" />
          <text x="8" y="12" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="Verdana, sans-serif" fill="#fff">Y</text>
        </svg>
      );
    case "reader":
      return (
        <svg viewBox="0 0 16 16" className={className} aria-hidden>
          <rect x=".5" y=".5" width="15" height="15" rx="2" fill="#4a7ed8" />
          <path d="M3.5 4.5h9M3.5 7.5h9M3.5 10.5h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "folder":
      return (
        <svg viewBox="0 0 16 16" className={className} aria-hidden>
          <path d="M1.5 4V13a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V5.5a1 1 0 0 0-1-1H7.6L6.2 3H2.5a1 1 0 0 0-1 1Z" fill="#d9a35c" stroke="#9c6a2a" strokeWidth=".8" />
          <path d="M1.5 6.4h13" stroke="#f4cf98" strokeWidth="1" />
        </svg>
      );
    case "feed":
      return (
        <svg viewBox="0 0 16 16" className={className} aria-hidden>
          <rect x="1" y="1" width="14" height="14" rx="3" fill="#f78422" stroke="#c1600c" strokeWidth=".8" />
          <circle cx="4.6" cy="11.4" r="1.4" fill="#fff" />
          <path d="M3.6 7.3a5.1 5.1 0 0 1 5.1 5.1M3.6 4a8.4 8.4 0 0 1 8.4 8.4" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" className={className} aria-hidden>
          <circle cx="8" cy="8" r="6.2" fill="#e9e5df" stroke="#a69b8d" />
          <path d="M3 8h10M8 2.4c-2.4 3.2-2.4 8 0 11.2M8 2.4c2.4 3.2 2.4 8 0 11.2" stroke="#a69b8d" strokeWidth=".8" fill="none" />
        </svg>
      );
  }
}

/** The search box's engine icon: a plain multicolored G. */
export function GoogleG({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x=".5" y=".5" width="15" height="15" rx="2.5" fill="#fff" stroke="#c9c2b8" />
      <text x="8" y="12.2" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Georgia, 'Times New Roman', serif" fill="#3369e8">
        G
      </text>
    </svg>
  );
}

/** A small magnifying glass. */
export function Glass({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <circle cx="6.6" cy="6.6" r="4.6" fill="#fff" fillOpacity=".7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m10.2 10.2 4.2 4.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* ───────── The sidebar ad ───────── */

/**
 * A 300×250 house ad, drawn: a heather-grey T-shirt that says "ask me about
 * my karma", with the orangered arrow for a logo.
 */
export function AdFallback() {
  const id = useId();
  return (
    <svg viewBox="0 0 300 250" className="block h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3f8fd" />
          <stop offset="1" stopColor="#d6e6f6" />
        </linearGradient>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d5d5d8" />
          <stop offset="1" stopColor="#a9a9ae" />
        </linearGradient>
        <radialGradient id={`${id}sh`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#36547a" stopOpacity=".28" />
          <stop offset="1" stopColor="#36547a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="250" fill={`url(#${id}bg)`} />
      <g fill="#cee3f8">
        <circle cx="34" cy="40" r="3" />
        <circle cx="262" cy="30" r="4" />
        <circle cx="270" cy="148" r="3" />
        <circle cx="24" cy="160" r="4" />
      </g>
      <ellipse cx="96" cy="214" rx="74" ry="9" fill={`url(#${id}sh)`} />
      {/* The shirt */}
      <path
        d="M60 52 82 40c6 9 22 12 28 0l22 12 22 26-16 14-10-10v110H60V82L50 92 34 78Z"
        transform="translate(-6 0)"
        fill={`url(#${id}t)`}
        stroke="#8c8c92"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M76 40c6 9 22 12 28 0" fill="none" stroke="#8c8c92" strokeWidth="1.4" />
      <path d="M90 96 98 88 106 96H102v10h-8V96Z" fill="#ff4500" stroke="#c23400" strokeWidth=".8" strokeLinejoin="round" />
      <text x="98" y="124" textAnchor="middle" fontFamily="Verdana, Arial, sans-serif" fontSize="9.5" fontWeight="700" fill="#333">ask me about</text>
      <text x="98" y="137" textAnchor="middle" fontFamily="Verdana, Arial, sans-serif" fontSize="9.5" fontWeight="700" fill="#333">my karma</text>
      {/* The pitch */}
      <text x="226" y="74" textAnchor="middle" fontFamily="Verdana, Arial, sans-serif" fontSize="17" fontWeight="700" fill="#336699">karma</text>
      <text x="226" y="94" textAnchor="middle" fontFamily="Verdana, Arial, sans-serif" fontSize="17" fontWeight="700" fill="#336699">you can</text>
      <text x="226" y="114" textAnchor="middle" fontFamily="Verdana, Arial, sans-serif" fontSize="17" fontWeight="700" fill="#336699">wear.</text>
      <text x="226" y="140" textAnchor="middle" fontFamily="Verdana, Arial, sans-serif" fontSize="9.5" fill="#555">100% cotton.</text>
      <text x="226" y="153" textAnchor="middle" fontFamily="Verdana, Arial, sans-serif" fontSize="9.5" fill="#555">0% karma whoring.</text>
      <rect x="182" y="170" width="88" height="24" rx="5" fill="#ff4500" />
      <rect x="182" y="170" width="88" height="12" rx="5" fill="#fff" fillOpacity=".18" />
      <text x="226" y="186" textAnchor="middle" fontFamily="Verdana, Arial, sans-serif" fontSize="10.5" fontWeight="700" fill="#fff">$14.99 »</text>
    </svg>
  );
}

/* ───────── The scene ───────── */

/**
 * An upvote arrow as a glowing paper lantern, for the sky behind the window.
 * Down arrows (`down`) are cool periwinkle and sink instead.
 */
export function Lantern({ size, down = false }: { size: number; down?: boolean }) {
  const id = useId();
  return (
    <svg viewBox="-4 -4 23 22" width={size} style={down ? { rotate: "180deg" } : undefined} aria-hidden>
      <defs>
        <radialGradient id={`${id}l`} cx=".5" cy=".62" r=".7">
          <stop offset="0" stopColor={down ? "#eef0ff" : "#fff3c8"} />
          <stop offset=".35" stopColor={down ? "#b4b4ff" : "#ffb15c"} />
          <stop offset="1" stopColor={down ? "#6f6fe6" : "#ff4500"} />
        </radialGradient>
        <radialGradient id={`${id}h`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={down ? "#a9a9ff" : "#ff8a3c"} stopOpacity=".55" />
          <stop offset="1" stopColor={down ? "#a9a9ff" : "#ff8a3c"} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="7.5" cy="7" r="11" fill={`url(#${id}h)`} />
      <path d={ARROW} fill={`url(#${id}l)`} stroke={down ? "#5a5ad0" : "#c23400"} strokeWidth=".5" strokeLinejoin="round" />
      <path d="M4.7 9.6h5.6M4.7 11.4h5.6" stroke={down ? "#5a5ad0" : "#c23400"} strokeOpacity=".35" strokeWidth=".35" />
    </svg>
  );
}

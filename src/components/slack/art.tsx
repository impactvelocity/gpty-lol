"use client";

import { useId } from "react";
import { Gpty, type Mood } from "@/components/Gpty";
import { getAgent } from "@/lib/agents";
import { PEOPLE, type PersonId } from "./workspace";

/**
 * Hand-drawn art for the Slack costume: our own hash mark, the glossy
 * Mavericks traffic lights, the avatars, the line icons, a few custom team
 * emoji and the GIF that plays when a picture isn't in yet. Everything is flat
 * fills (2014 was flat) with no shared SVG gradients, so a copy hidden with
 * display:none (the sidebar on phones) can't blank out the rest.
 */

/* ───────── Optional bitmap art ───────── */

export type ArtSlot =
  | "wallpaper" | "team" | "channing" | "you"
  | "marcus" | "linda" | "gary" | "brad" | "priya" | "devon" | "tiff"
  | "gif1" | "gif2" | "gif3" | "gif4";

/**
 * Generated pictures that replace the drawn fallbacks (prompts and sizes in
 * src/components/slack/ART.md). Remove a line to fall back to the drawing.
 * Avatars are 256px, GIF stills 640px and the team logo 512px WebP; the
 * wallpaper stays 1536px.
 */
const FILES: Partial<Record<ArtSlot, string>> = {
  wallpaper: "/slack/wallpaper.webp",
  team: "/slack/team.webp",
  channing: "/slack/dp-channing.webp",
  you: "/slack/dp-you.webp",
  marcus: "/slack/dp-marcus.webp",
  linda: "/slack/dp-linda.webp",
  gary: "/slack/dp-gary.webp",
  brad: "/slack/dp-brad.webp",
  priya: "/slack/dp-priya.webp",
  devon: "/slack/dp-devon.webp",
  tiff: "/slack/dp-tiff.webp",
  gif1: "/slack/gif-1.webp",
  gif2: "/slack/gif-2.webp",
  gif3: "/slack/gif-3.webp",
  gif4: "/slack/gif-4.webp",
};

/** The picture for a slot, or undefined to draw the fallback. */
export function art(slot: ArtSlot): string | undefined {
  return FILES[slot];
}

/** The GIFs that /giphy can land on, in a fixed order so a word always gets the same one. */
export const GIFS = (["gif1", "gif2", "gif3", "gif4"] as const).map((s) => art(s)).filter((s): s is string => !!s);

/* ───────── Brand ───────── */

/**
 * Four rounded strokes crossing in a hash, one per team color: our own take on
 * the 2014 mark. The overlaps are darker, like stacked translucent tape.
 */
export function HashMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <g strokeWidth="5" strokeLinecap="round" style={{ mixBlendMode: "multiply" }}>
        <path d="M11.4 4.4 8.6 27.6" stroke="#3eb991" />
        <path d="M23.4 4.4l-2.8 23.2" stroke="#e01563" />
        <path d="M4.4 11.4h23.2" stroke="#6ecadc" />
        <path d="M4.4 20.6h23.2" stroke="#e9a820" />
      </g>
    </svg>
  );
}

/** The team's own logo: a flat "P" with the long shadow every 2014 logo had. */
export function TeamLogo({ className = "h-9 w-9" }: { className?: string }) {
  return <Custom id="paradigm" className={className} />;
}

/* ───────── Window ───────── */

/** Close, minimize, zoom: the glossy Mavericks balls, a year before they went flat. */
export function TrafficLights() {
  return (
    <span className="sl-lights" aria-hidden>
      <i className="sl-light sl-light-close" />
      <i className="sl-light sl-light-min" />
      <i className="sl-light sl-light-zoom" />
    </span>
  );
}

/* ───────── Line icons (16×16, currentColor) ───────── */

export type IconId =
  | "search" | "at" | "star" | "star-on" | "people" | "bell" | "plus" | "smile" | "lock" | "chev"
  | "close" | "info" | "menu" | "user" | "upload" | "post" | "snippet" | "gear" | "hash" | "back" | "pin";

const ICON: Record<IconId, React.ReactNode> = {
  search: (
    <>
      <circle cx="7" cy="7" r="4.6" />
      <path d="m10.4 10.4 3.8 3.8" />
    </>
  ),
  at: <path d="M10.6 8a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0Zm0 0v1.1c0 1.2.8 2 1.8 2s1.8-1 1.8-3.1A6.2 6.2 0 1 0 11.6 13" />,
  star: <path d="m8 1.9 1.8 3.8 4.1.5-3 2.9.8 4.1L8 11.2l-3.7 2 .8-4.1-3-2.9 4.1-.5Z" strokeLinejoin="round" />,
  "star-on": <path d="m8 1.9 1.8 3.8 4.1.5-3 2.9.8 4.1L8 11.2l-3.7 2 .8-4.1-3-2.9 4.1-.5Z" fill="currentColor" strokeLinejoin="round" />,
  people: (
    <>
      <circle cx="6" cy="5.4" r="2.4" />
      <path d="M1.8 13.4c.3-2.6 1.9-4 4.2-4s3.9 1.4 4.2 4" />
      <path d="M10.6 3.2a2.4 2.4 0 0 1 0 4.4M12 9.6c1.3.5 2 1.8 2.2 3.8" />
    </>
  ),
  bell: <path d="M4 11.2V7.4a4 4 0 0 1 8 0v3.8l1.2 1.4H2.8ZM6.6 14a1.5 1.5 0 0 0 2.8 0" strokeLinejoin="round" />,
  plus: <path d="M8 3v10M3 8h10" />,
  smile: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M5.4 9.4a3 3 0 0 0 5.2 0" />
      <path d="M6 6.3v.4M10 6.3v.4" strokeWidth="1.8" />
    </>
  ),
  lock: (
    <>
      <rect x="3.6" y="7" width="8.8" height="6.6" rx="1.4" />
      <path d="M5.6 7V5.2a2.4 2.4 0 0 1 4.8 0V7" />
    </>
  ),
  chev: <path d="m4.4 6.4 3.6 3.4 3.6-3.4" strokeLinejoin="round" />,
  close: <path d="m4 4 8 8m0-8-8 8" />,
  info: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.4v4M8 4.9v.2" strokeWidth="1.7" />
    </>
  ),
  menu: <path d="M2.8 4.4h10.4M2.8 8h10.4M2.8 11.6h10.4" />,
  user: (
    <>
      <circle cx="8" cy="5.4" r="2.6" />
      <path d="M3 13.6c.4-3 2.4-4.4 5-4.4s4.6 1.4 5 4.4" />
    </>
  ),
  upload: (
    <>
      <path d="M8 10.6V3m-3 3 3-3 3 3" strokeLinejoin="round" />
      <path d="M3 10.6v2.2c0 .5.4.8.8.8h8.4c.5 0 .8-.3.8-.8v-2.2" />
    </>
  ),
  post: (
    <>
      <path d="M4 2.4h5.4L12.4 5.4v8a.8.8 0 0 1-.8.8H4a.8.8 0 0 1-.8-.8V3.2c0-.4.4-.8.8-.8Z" strokeLinejoin="round" />
      <path d="M5.6 8h4.8M5.6 10.6h3.2" />
    </>
  ),
  snippet: <path d="m5.4 4.6-3 3.4 3 3.4m5.2-6.8 3 3.4-3 3.4M9.2 3.4 6.8 12.6" strokeLinejoin="round" />,
  gear: (
    <>
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.8v1.6m0 9.2v1.6M1.8 8h1.6m9.2 0h1.6M3.6 3.6l1.2 1.2m6.4 6.4 1.2 1.2m0-8.8-1.2 1.2m-6.4 6.4-1.2 1.2" />
    </>
  ),
  hash: <path d="M6.4 2.6 5 13.4m6-10.8-1.4 10.8M2.8 6h10.6M2.6 10h10.6" />,
  back: <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinejoin="round" />,
  pin: <path d="M9.8 2.4 13.6 6.2l-1.6.6-2.6 2.6.2 2.6-1 1-2.2-2.2L3.4 13.8m2.6-6.2L3.8 5.4l1-1 2.6.2L10 2" strokeLinejoin="round" />,
};

export function Icon({ id, className = "h-4 w-4" }: { id: IconId; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      {ICON[id]}
    </svg>
  );
}

/* ───────── Avatars ───────── */

export type Who = PersonId | "you";

const BOT_GLYPH: Partial<Record<PersonId, React.ReactNode>> = {
  // A cloud with an arrow: things go up.
  heroku: (
    <>
      <path d="M11 25.4c-3 0-5.2-2.1-5.2-4.8 0-2.2 1.5-4.1 3.6-4.6.4-3.6 3.4-6.4 7-6.4 2.9 0 5.4 1.8 6.5 4.4h.2c3 0 5.4 2.4 5.4 5.4s-2.4 6-5.4 6Z" fill="#fff" opacity=".95" />
      <path d="M16.8 23v-7.4m-3 3 3-3 3 3" stroke="#6b5bb5" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // A branch: three commits, one merge.
  github: (
    <g stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round">
      <circle cx="12" cy="10" r="2.6" />
      <circle cx="12" cy="26" r="2.6" />
      <circle cx="22.6" cy="14" r="2.6" />
      <path d="M12 12.6v10.8M22.6 16.6c0 4.2-4 4.6-8.6 7.2" />
    </g>
  ),
  // A wrench and a very red tile: the build.
  jenkins: (
    <path d="M22.4 8.4a5.4 5.4 0 0 0-6.6 6.9l-7.2 7.2a2.1 2.1 0 0 0 3 3l7.2-7.2a5.4 5.4 0 0 0 6.9-6.6l-3.2 3.2-3-.8-.8-3Z" fill="#fff" />
  ),
};

/**
 * Someone's picture: the generated photo if it's in, else a flat tile. Channing
 * is their gpty; slackbot and the integrations get drawn faces and glyphs;
 * everyone else their initials, like the default avatars of the time.
 */
export function Avatar({ who, size = 36, mood }: { who: Who; size?: number; mood?: Mood }) {
  const src = art(who as ArtSlot);
  const style = { width: size, height: size };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="sl-av" style={style} draggable={false} />;
  }
  if (who === "channing") {
    return (
      <span className="sl-av sl-av-gpty" style={style}>
        <Gpty agent={getAgent("slack")} size={Math.round(size * 0.92)} mood={mood ?? "idle"} />
      </span>
    );
  }
  if (who === "you") {
    return (
      <span className="sl-av" style={{ ...style, background: "#e8912d" }}>
        <svg viewBox="0 0 36 36" className="h-full w-full" aria-hidden>
          <circle cx="18" cy="14.6" r="6.2" fill="#fff" opacity=".92" />
          <path d="M6.4 37c.8-8 5.4-12.2 11.6-12.2S28.8 29 29.6 37Z" fill="#fff" opacity=".92" />
        </svg>
      </span>
    );
  }
  const p = PEOPLE[who];
  if (who === "slackbot") {
    return (
      <span className="sl-av" style={{ ...style, background: p.color }}>
        <svg viewBox="0 0 36 36" className="h-full w-full" aria-hidden>
          {/* A heart with a face: helpful, persistent, a little too cheerful. */}
          <path d="M18 29.4S7.4 22.8 7.4 15.2c0-3.4 2.6-6 5.8-6 2.2 0 3.8 1.2 4.8 2.8 1-1.6 2.6-2.8 4.8-2.8 3.2 0 5.8 2.6 5.8 6 0 7.6-10.6 14.2-10.6 14.2Z" fill="#fff" />
          <circle cx="14.4" cy="16" r="1.6" fill="#4d394b" />
          <circle cx="21.6" cy="16" r="1.6" fill="#4d394b" />
          <path d="M14.8 20.2c1.8 1.6 4.6 1.6 6.4 0" stroke="#4d394b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="19.2" r="1.3" fill="#f2a7c4" />
          <circle cx="24" cy="19.2" r="1.3" fill="#f2a7c4" />
        </svg>
      </span>
    );
  }
  if (p.bot) {
    return (
      <span className="sl-av" style={{ ...style, background: p.color }}>
        <svg viewBox="0 0 36 36" className="h-full w-full" aria-hidden>
          {BOT_GLYPH[who]}
        </svg>
      </span>
    );
  }
  const initials = p.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2);
  return (
    <span className="sl-av sl-av-initials" style={{ ...style, background: p.color, fontSize: Math.round(size * 0.38) }}>
      {initials}
    </span>
  );
}

/* ───────── Files ───────── */

const EXT: Record<string, { color: string; label: string }> = {
  pptx: { color: "#d9582b", label: "PPT" },
  psd: { color: "#2a80b9", label: "PSD" },
  doc: { color: "#2b5797", label: "DOC" },
  xls: { color: "#1e7145", label: "XLS" },
  zip: { color: "#8a8a8a", label: "ZIP" },
  pdf: { color: "#c0392b", label: "PDF" },
};

export function FileIcon({ name, className = "h-10 w-8" }: { name: string; className?: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const t = EXT[ext] ?? EXT[ext.slice(0, 3)] ?? { color: "#8a8a8a", label: ext.slice(0, 3).toUpperCase() || "FILE" };
  return (
    <svg viewBox="0 0 32 40" className={className} aria-hidden>
      <path d="M3 1h18l8 8v28a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Z" fill="#fff" stroke="#d6d6d8" />
      <path d="M21 1v6a2 2 0 0 0 2 2h6" fill="#ececee" stroke="#d6d6d8" />
      <rect x="1" y="22" width="24" height="11" rx="1.5" fill={t.color} />
      <text x="13" y="30.4" textAnchor="middle" fontSize="8" fontWeight="900" fill="#fff" fontFamily="var(--font-lato), Lato, sans-serif">
        {t.label}
      </text>
    </svg>
  );
}

/* ───────── Custom team emoji ───────── */

export type CustomEmoji = "simple_smile" | "synergy" | "rip-email" | "paradigm" | "shipit-friday";

/** Drawn emoji the team uploaded (or, for :simple_smile:, the one only Slack had). */
export function Custom({ id, className = "sl-emoji" }: { id: CustomEmoji; className?: string }) {
  const clip = `sl-clip-${useId().replace(/:/g, "")}`;
  // The team's own logo, once its picture is in.
  const team = id === "paradigm" ? art("team") : undefined;
  if (team) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={team} alt=":paradigm:" className={`${className} rounded-[22%] object-cover`} draggable={false} />;
  }
  return (
    <svg viewBox="0 0 22 22" className={className} role="img" aria-label={`:${id}:`}>
      {id === "simple_smile" && (
        <>
          <circle cx="11" cy="11" r="10" fill="#ffcc4d" />
          <circle cx="7.6" cy="8.8" r="1.3" fill="#664500" />
          <circle cx="14.4" cy="8.8" r="1.3" fill="#664500" />
          <path d="M6.6 13.2c2.4 2.4 6.4 2.4 8.8 0" stroke="#664500" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {id === "synergy" && (
        <>
          <circle cx="8.2" cy="11.6" r="6.4" fill="#6ecadc" />
          <circle cx="13.8" cy="11.6" r="6.4" fill="#e01563" style={{ mixBlendMode: "multiply" }} />
          <path d="m17.6 1.6.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8Z" fill="#e9a820" className="sl-twinkle" />
        </>
      )}
      {id === "rip-email" && (
        <>
          <path d="M4.4 20.6V9.6a6.6 6.6 0 0 1 13.2 0v11Z" fill="#a7a9ad" />
          <path d="M4.4 20.6V9.6a6.6 6.6 0 0 1 13.2 0v11Z" fill="none" stroke="#7c7f84" strokeWidth=".8" />
          <rect x="6.8" y="8.6" width="8.4" height="5.8" rx=".8" fill="#fff" />
          <path d="m6.9 8.9 4.1 3.1 4.1-3.1" stroke="#7c7f84" strokeWidth=".9" fill="none" strokeLinejoin="round" />
          <text x="11" y="18.6" textAnchor="middle" fontSize="3.6" fontWeight="900" fill="#55585c" fontFamily="var(--font-lato), Lato, sans-serif">
            RIP
          </text>
          <path d="M1 20.8h20" stroke="#3eb991" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {id === "paradigm" && (
        <>
          {/* Its own clip id per copy, so a hidden copy never takes the others' shadow with it. */}
          <clipPath id={clip}>
            <rect x="1" y="1" width="20" height="20" rx="4.4" />
          </clipPath>
          <rect x="1" y="1" width="20" height="20" rx="4.4" fill="#2a80b9" />
          <path d="M7.2 16.6 14.8 6.6l30 30-7.6 10Z" fill="#1d6290" clipPath={`url(#${clip})`} />
          <path d="M7.2 5.4h4.8a4 4 0 0 1 0 8H9.7v3.2H7.2Zm2.5 2.3v3.4h2.1a1.7 1.7 0 0 0 0-3.4Z" fill="#fff" fillRule="evenodd" />
        </>
      )}
      {id === "shipit-friday" && (
        <>
          <path d="M2.4 13.6h17.2l-2.6 5.2a1.6 1.6 0 0 1-1.4.8H6.4a1.6 1.6 0 0 1-1.4-.8Z" fill="#c0392b" />
          <rect x="9" y="4" width="1.4" height="9.6" fill="#55585c" />
          <path d="M10.4 4.4 16.8 9H10.4Z" fill="#e9a820" />
          <path d="M1 20.6c1.6-1 3.4-1 5 0s3.4 1 5 0 3.4-1 5 0 3.4 1 5 0" stroke="#6ecadc" strokeWidth="1.3" fill="none" />
        </>
      )}
    </svg>
  );
}

/* ───────── The GIF, before the GIFs are in ───────── */

const GIF_FACES = ["🙌", "🎉", "😱", "🕺", "😎", "🐱", "🚀", "🙈", "💃", "👏"];

/**
 * A stand-in GIF: a little stage with a looping, bouncing subject, scanlines
 * and the dithered edge of a 256-color frame. Picked from the search term so
 * the same word always gets the same GIF.
 */
export function GifStandIn({ term }: { term: string }) {
  let h = 7;
  for (let i = 0; i < term.length; i++) h = (h * 31 + term.charCodeAt(i)) | 0;
  const face = GIF_FACES[Math.abs(h) % GIF_FACES.length];
  const hue = Math.abs(h) % 360;
  return (
    <div className="sl-gif-stand" style={{ "--h": hue } as React.CSSProperties}>
      <span className="sl-gif-sun" />
      <span className="sl-gif-floor" />
      <span className="sl-gif-actor">{face}</span>
      <span className="sl-gif-caption">{term.trim() ? term.trim().toUpperCase() : "GIF"}</span>
    </div>
  );
}

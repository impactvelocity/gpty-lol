"use client";

/**
 * The classic text emoticons, drawn as glossy 19px smileys. Typing a code
 * like :) or (Y) shows the picture, as it did in 2005. Gradients come from
 * <MsnDefs /> in art.tsx.
 */

export type EmoteId =
  | "smile" | "grin" | "wink" | "tongue" | "sad" | "cry" | "surprised" | "confused"
  | "neutral" | "embarrassed" | "angry" | "cool" | "angel" | "devil" | "nerd" | "sleepy"
  | "secret" | "yes" | "no" | "heart" | "broken" | "kiss" | "rose" | "star" | "note"
  | "coffee" | "idea";

/**
 * Picker order matches the old menu. Letter codes are uppercase-only where a
 * lowercase one would eat list markers like (a) or (c) in a real answer.
 */
export const EMOTES: { id: EmoteId; name: string; codes: string[] }[] = [
  { id: "smile", name: "Smile", codes: [":)", ":-)"] },
  { id: "grin", name: "Open-mouthed", codes: [":D", ":-D", ":d", ":-d"] },
  { id: "wink", name: "Wink", codes: [";)", ";-)"] },
  { id: "surprised", name: "Surprised", codes: [":O", ":-O", ":o", ":-o"] },
  { id: "tongue", name: "Tongue out", codes: [":P", ":-P", ":p", ":-p"] },
  { id: "cool", name: "Hot", codes: ["(H)", "8-)", "8)"] },
  { id: "angry", name: "Angry", codes: [":@", ":-@"] },
  { id: "embarrassed", name: "Embarrassed", codes: [":$", ":-$"] },
  { id: "confused", name: "Confused", codes: [":S", ":-S", ":s", ":-s"] },
  { id: "sad", name: "Sad", codes: [":(", ":-("] },
  { id: "cry", name: "Crying", codes: [":'("] },
  { id: "neutral", name: "Disappointed", codes: [":|", ":-|"] },
  { id: "devil", name: "Devil", codes: ["(6)"] },
  { id: "angel", name: "Angel", codes: ["(A)"] },
  { id: "nerd", name: "Nerd", codes: ["8-|", "8|"] },
  { id: "sleepy", name: "Sleepy", codes: ["|-)"] },
  { id: "secret", name: "Don't tell anyone", codes: [":-#"] },
  { id: "yes", name: "Thumbs up", codes: ["(Y)", "(y)"] },
  { id: "no", name: "Thumbs down", codes: ["(N)", "(n)"] },
  { id: "heart", name: "Red heart", codes: ["(L)", "(l)"] },
  { id: "broken", name: "Broken heart", codes: ["(U)", "(u)"] },
  { id: "kiss", name: "Red lips", codes: ["(K)", "(k)"] },
  { id: "rose", name: "Red rose", codes: ["(F)"] },
  { id: "star", name: "Star", codes: ["(*)"] },
  { id: "note", name: "Note", codes: ["(8)"] },
  { id: "coffee", name: "Coffee cup", codes: ["(C)"] },
  { id: "idea", name: "Light bulb", codes: ["(I)"] },
];

const BY_CODE = new Map(EMOTES.flatMap((e) => e.codes.map((c) => [c, e] as const)));
const CODES = new RegExp(
  `(${[...BY_CODE.keys()]
    .sort((a, b) => b.length - a.length)
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
  "g",
);

/** Text with its emoticon codes drawn as smileys. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(CODES);
  return (
    <>
      {parts.map((p, i) => {
        const e = i % 2 ? BY_CODE.get(p) : undefined;
        return e ? <Emote key={i} id={e.id} label={`${e.name} ${p}`} /> : p || null;
      })}
    </>
  );
}

export function Emote({ id, label, className = "msn-emote" }: { id: EmoteId; label?: string; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {label && <title>{label}</title>}
      {ART[id]}
    </svg>
  );
}

/* ───────── Drawing ───────── */

const INK = "#4a2c05";
const MOUTH = "#6b1d00";

function Face({ fill = "url(#msn-face)", stroke = "#bf7a00", cy = 10, r = 8.7 }: { fill?: string; stroke?: string; cy?: number; r?: number }) {
  return (
    <>
      <circle cx="10" cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth=".8" />
      <ellipse cx="10" cy={cy - r * 0.5} rx={r * 0.6} ry={r * 0.32} fill="url(#msn-gloss)" opacity=".8" />
    </>
  );
}

const Eyes = ({ y = 8.4, ry = 1.6 }: { y?: number; ry?: number }) => (
  <>
    <ellipse cx="7.1" cy={y} rx="1.05" ry={ry} fill={INK} />
    <ellipse cx="12.9" cy={y} rx="1.05" ry={ry} fill={INK} />
    <circle cx="7.4" cy={y - ry * 0.45} r=".3" fill="#fff" opacity=".8" />
    <circle cx="13.2" cy={y - ry * 0.45} r=".3" fill="#fff" opacity=".8" />
  </>
);

const line = { fill: "none", stroke: INK, strokeWidth: 1.25, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const Smile = ({ y = 11.4 }: { y?: number }) => <path d={`M5.9 ${y}q4.1 4.2 8.2 0`} {...line} />;

const HEART = "M10 17.6C4.2 13.4 1.8 10.6 1.8 7.4 1.8 4.9 3.8 3 6.1 3c1.6 0 3 .9 3.9 2.3C10.9 3.9 12.3 3 13.9 3c2.3 0 4.3 1.9 4.3 4.4 0 3.2-2.4 6-8.2 10.2Z";

const Thumb = () => (
  <>
    <rect x="1.8" y="9.2" width="3.8" height="9" rx="1" fill="url(#msn-blue)" stroke="#123f8f" strokeWidth=".6" />
    <path
      d="M5.6 9.6 8.5 3.7c.5-1.3 1.6-1.6 2.4-1 .8.5.9 1.4.6 2.3l-.9 3.3h5.1c1.3 0 2 .9 1.8 2l-.9 6.6c-.2 1.3-1 1.9-2.2 1.9H5.6Z"
      fill="url(#msn-face)"
      stroke="#bf7a00"
      strokeWidth=".7"
      strokeLinejoin="round"
    />
    <path d="M11.4 10.9h5.5M11.2 13.3h5.3M11 15.7h4.9" stroke="#c98a10" strokeWidth=".7" strokeLinecap="round" />
    <ellipse cx="9.4" cy="5.2" rx=".8" ry="1.8" transform="rotate(25 9.4 5.2)" fill="#fff" opacity=".6" />
  </>
);

const ART: Record<EmoteId, React.ReactNode> = {
  smile: (
    <>
      <Face />
      <Eyes />
      <Smile />
    </>
  ),
  grin: (
    <>
      <Face />
      <Eyes y={7.9} />
      <path d="M5.2 10.6h9.6q-.4 5.4-4.8 5.4t-4.8-5.4Z" fill={MOUTH} stroke={INK} strokeWidth=".5" strokeLinejoin="round" />
      <path d="M5.8 11.1h8.4l-.2 1.3H6Z" fill="#fff" />
      <ellipse cx="10" cy="14.7" rx="2.4" ry="1" fill="#ff7083" />
    </>
  ),
  wink: (
    <>
      <Face />
      <path d="M5.8 8.6q1.3-1.4 2.6 0" {...line} strokeWidth={1.1} />
      <ellipse cx="12.9" cy="8.4" rx="1.05" ry="1.6" fill={INK} />
      <Smile />
    </>
  ),
  tongue: (
    <>
      <Face />
      <Eyes />
      <path d="M6.2 11.7q3.8 1.5 7.6 0" {...line} />
      <path d="M8.6 12.1h3.3v1.9a1.65 1.65 0 0 1-3.3 0Z" fill="#ff5c76" stroke="#b8243c" strokeWidth=".55" />
      <path d="M10.25 12.4v1.6" stroke="#b8243c" strokeWidth=".45" />
    </>
  ),
  sad: (
    <>
      <Face />
      <Eyes />
      <path d="M6.1 14.4q3.9-3.6 7.8 0" {...line} />
    </>
  ),
  cry: (
    <>
      <Face />
      <Eyes />
      <path d="M6.4 14.6q3.6-3 7.2 0" {...line} />
      <path d="M6.6 10.4q-1.2 1.8-1.2 2.6a1.2 1.2 0 0 0 2.4 0q0-.8-1.2-2.6Z" fill="#6cc0ff" stroke="#2a7fd6" strokeWidth=".45" />
      <path d="M13.4 10.6q-.9 1.4-.9 2a.9.9 0 0 0 1.8 0q0-.6-.9-2Z" fill="#6cc0ff" stroke="#2a7fd6" strokeWidth=".4" />
    </>
  ),
  surprised: (
    <>
      <Face />
      <Eyes y={7.9} ry={1.85} />
      <ellipse cx="10" cy="13.3" rx="1.9" ry="2.4" fill={MOUTH} stroke={INK} strokeWidth=".5" />
    </>
  ),
  confused: (
    <>
      <Face />
      <Eyes />
      <path d="M5.8 13.1q1.05-1.4 2.1 0t2.1 0 2.1 0 2.1 0" {...line} strokeWidth={1.1} />
    </>
  ),
  neutral: (
    <>
      <Face />
      <Eyes />
      <path d="M6.6 12.9h6.8" {...line} />
    </>
  ),
  embarrassed: (
    <>
      <Face fill="url(#msn-face-blush)" stroke="#c4471f" />
      <path d="M5.8 8.2q1.3 1.2 2.6 0M11.6 8.2q1.3 1.2 2.6 0" {...line} strokeWidth={1.05} />
      <ellipse cx="5.2" cy="11.2" rx="1.8" ry="1.1" fill="#ff3d3d" opacity=".45" />
      <ellipse cx="14.8" cy="11.2" rx="1.8" ry="1.1" fill="#ff3d3d" opacity=".45" />
      <path d="M8 13.4q1-.9 2 0t2 0" {...line} strokeWidth={1} />
    </>
  ),
  angry: (
    <>
      <Face fill="url(#msn-face-red)" stroke="#9c2410" />
      <path d="M4.8 6.4 8.6 8M15.2 6.4 11.4 8" {...line} strokeWidth={1.2} />
      <ellipse cx="7.3" cy="9.4" rx="1" ry="1.2" fill={INK} />
      <ellipse cx="12.7" cy="9.4" rx="1" ry="1.2" fill={INK} />
      <path d="M6.6 14.4q3.4-2.6 6.8 0" {...line} />
    </>
  ),
  cool: (
    <>
      <Face />
      <path d="M3.4 7.4h13.2v.9q-.5 3.6-3.5 3.5-2.4-.1-2.7-2.6h-.8q-.3 2.5-2.7 2.6-3-.1-3.5-3.5Z" fill="#1b1d2b" />
      <path d="M4.8 8.4 6.6 8.4M11.6 8.4 13.4 8.4" stroke="#fff" strokeOpacity=".7" strokeWidth=".7" strokeLinecap="round" />
      <path d="M6.4 13q3.6 2.6 7.2 0" {...line} />
    </>
  ),
  angel: (
    <>
      <Face cy={11} r={8} />
      <ellipse cx="10" cy="2.3" rx="5" ry="1.45" fill="none" stroke="#ffd23a" strokeWidth="1.3" />
      <ellipse cx="10" cy="2.3" rx="5" ry="1.45" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth=".4" />
      <Eyes y={9.4} ry={1.45} />
      <Smile y={12.2} />
    </>
  ),
  devil: (
    <>
      <path d="M3.4 6.2 2.6 1.4l4.2 2.8ZM16.6 6.2l.8-4.8-4.2 2.8Z" fill="#6c1aa8" stroke="#3f0b66" strokeWidth=".5" strokeLinejoin="round" />
      <Face fill="url(#msn-face-devil)" stroke="#4a0f7a" />
      <path d="M5.2 6.8 8.4 8.2M14.8 6.8 11.6 8.2" {...line} stroke="#2a0545" strokeWidth={1.1} />
      <ellipse cx="7.3" cy="9.2" rx="1" ry="1.3" fill="#2a0545" />
      <ellipse cx="12.7" cy="9.2" rx="1" ry="1.3" fill="#2a0545" />
      <path d="M5.8 11.6q4.2 4 8.4 0" {...line} stroke="#2a0545" />
    </>
  ),
  nerd: (
    <>
      <Face />
      <circle cx="7" cy="8.5" r="2.5" fill="#fff" fillOpacity=".5" stroke="#3a2a10" strokeWidth=".9" />
      <circle cx="13" cy="8.5" r="2.5" fill="#fff" fillOpacity=".5" stroke="#3a2a10" strokeWidth=".9" />
      <path d="M9.5 8.3h1" stroke="#3a2a10" strokeWidth=".9" />
      <circle cx="7.2" cy="8.7" r=".9" fill={INK} />
      <circle cx="13.2" cy="8.7" r=".9" fill={INK} />
      <path d="M6.4 12.4q3.6 2.2 7.2 0" {...line} />
      <rect x="8.9" y="12.9" width="2.2" height="1.8" rx=".3" fill="#fff" stroke={INK} strokeWidth=".45" />
    </>
  ),
  sleepy: (
    <>
      <Face />
      <path d="M5.8 9h2.6M11.6 9h2.6" {...line} />
      <ellipse cx="10" cy="13.6" rx="1.2" ry="1.4" fill={MOUTH} />
      <path d="M13.8 1.4h3l-3 3h3" fill="none" stroke="#2a6fd6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  secret: (
    <>
      <Face />
      <Eyes />
      <path d="M5.6 12.8h8.8" {...line} strokeWidth={1.1} />
      <path d="M6.9 12v1.6M8.5 12v1.6M10.1 12v1.6M11.7 12v1.6M13.3 12v1.6" stroke={INK} strokeWidth=".7" />
      <rect x="14.2" y="12.2" width="1.6" height="2.6" rx=".4" fill="#c7cfdb" stroke="#4d5a72" strokeWidth=".4" />
    </>
  ),
  yes: <Thumb />,
  no: (
    <g transform="rotate(180 10 10)">
      <Thumb />
    </g>
  ),
  heart: (
    <>
      <path d={HEART} fill="url(#msn-heart)" stroke="#9c0018" strokeWidth=".8" />
      <ellipse cx="6.2" cy="6.4" rx="2.1" ry="1.3" transform="rotate(-32 6.2 6.4)" fill="#fff" opacity=".75" />
    </>
  ),
  broken: (
    <>
      <path
        d="M10 17.6C4.2 13.4 1.8 10.6 1.8 7.4 1.8 4.9 3.8 3 6.1 3c1.6 0 3 .9 3.9 2.3l-1.5 3 2 2.3-1.6 2.6 1.1 2.4Z"
        transform="translate(-.9 .3) rotate(-6 10 10)"
        fill="url(#msn-heart)"
        stroke="#9c0018"
        strokeWidth=".8"
        strokeLinejoin="round"
      />
      <path
        d="M10 5.3C10.9 3.9 12.3 3 13.9 3c2.3 0 4.3 1.9 4.3 4.4 0 3.2-2.4 6-8.2 10.2l-1.1-2.4 1.6-2.6-2-2.3Z"
        transform="translate(.9 .3) rotate(6 10 10)"
        fill="url(#msn-heart)"
        stroke="#9c0018"
        strokeWidth=".8"
        strokeLinejoin="round"
      />
      <ellipse cx="5.6" cy="6.6" rx="1.8" ry="1.1" transform="rotate(-40 5.6 6.6)" fill="#fff" opacity=".7" />
    </>
  ),
  kiss: (
    <>
      <path d="M1.8 10.2Q4.6 5.6 7.4 6.4 8.8 6.8 10 7.6q1.2-.8 2.6-1.2 2.8-.8 5.6 3.8-3.2 5-8.2 5t-8.2-5Z" fill="url(#msn-heart)" stroke="#9c0018" strokeWidth=".7" strokeLinejoin="round" />
      <path d="M2.8 10.2q3.6 1.2 7.2.4 3.6.8 7.2-.4" fill="none" stroke="#7a0012" strokeWidth=".8" strokeLinecap="round" />
      <ellipse cx="10.8" cy="12.6" rx="2.6" ry=".8" fill="#fff" opacity=".55" />
    </>
  ),
  rose: (
    <>
      <path d="M10 10.6v8" stroke="#2f8a1a" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 15.4q-3.2-.2-4.4-2.6 3.2-.2 4.4 2.6Z" fill="url(#msn-green)" stroke="#1d6f12" strokeWidth=".4" />
      <path d="M10 14q3.2-.6 3.8-3-3 .3-3.8 3Z" fill="url(#msn-green)" stroke="#1d6f12" strokeWidth=".4" />
      <path d="M5.2 5.6q0 5.6 4.8 5.6t4.8-5.6q-1.6 1.2-2.5.2Q11.4 2.2 10 1.8 8.6 2.2 7.7 5.8q-.9 1-2.5-.2Z" fill="url(#msn-heart)" stroke="#9c0018" strokeWidth=".7" strokeLinejoin="round" />
      <path d="M8.2 6.4q1.8-1.6 3.6 0M8.8 8.4q1.2.8 2.4 0" fill="none" stroke="#8a0016" strokeWidth=".7" strokeLinecap="round" />
    </>
  ),
  star: (
    <>
      <path d="M10 2l2.3 5.4 5.9.5-4.5 3.9 1.4 5.8-5.1-3.1-5.1 3.1 1.4-5.8-4.5-3.9 5.9-.5Z" fill="url(#msn-face)" stroke="#bf7a00" strokeWidth=".8" strokeLinejoin="round" />
      <path d="M8.4 7.6 10 4.2l1 2.4" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth=".9" strokeLinecap="round" />
    </>
  ),
  note: (
    <>
      <path d="M7.2 15.4V5.4l9.4-2.2v10" fill="none" stroke="url(#msn-note)" strokeWidth="1.5" />
      <path d="M7.2 5.4l9.4-2.2v2.6L7.2 8Z" fill="url(#msn-note)" />
      <ellipse cx="5.2" cy="15.6" rx="2.5" ry="1.8" transform="rotate(-22 5.2 15.6)" fill="url(#msn-note)" />
      <ellipse cx="14.6" cy="13.3" rx="2.5" ry="1.8" transform="rotate(-22 14.6 13.3)" fill="url(#msn-note)" />
      <ellipse cx="4.6" cy="15" rx=".9" ry=".5" transform="rotate(-22 4.6 15)" fill="#fff" opacity=".6" />
      <ellipse cx="14" cy="12.7" rx=".9" ry=".5" transform="rotate(-22 14 12.7)" fill="#fff" opacity=".6" />
    </>
  ),
  coffee: (
    <>
      <path d="M7.2 5.6q-.9-1.2 0-2.4t0-2.4M10.4 5.6q-.9-1.2 0-2.4t0-2.4" fill="none" stroke="#9aa6b8" strokeWidth=".8" strokeLinecap="round" />
      <ellipse cx="9.4" cy="17.6" rx="7.4" ry="1.6" fill="url(#msn-paper)" stroke="#8d99ad" strokeWidth=".5" />
      <path d="M14.4 9.4q3.2-.2 3.2 2.2t-3.4 2.4" fill="none" stroke="#8d99ad" strokeWidth="1.3" />
      <path d="M4 7.6h10.8v4.8q0 4.6-5.4 4.6T4 12.4Z" fill="url(#msn-paper)" stroke="#8d99ad" strokeWidth=".6" />
      <ellipse cx="9.4" cy="7.6" rx="5.4" ry="1.2" fill="#6b3a12" stroke="#8d99ad" strokeWidth=".5" />
      <path d="M5.4 9.4v3" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
    </>
  ),
  idea: (
    <>
      <circle cx="10" cy="8" r="6.2" fill="url(#msn-bulb)" stroke="#d59a00" strokeWidth=".7" />
      <path d="M8.2 11.4 9 8.6l1 1.4 1-1.4.8 2.8" fill="none" stroke="#e08a00" strokeWidth=".7" strokeLinejoin="round" />
      <ellipse cx="8" cy="5.4" rx="2" ry="1.2" transform="rotate(-30 8 5.4)" fill="#fff" opacity=".85" />
      <rect x="7.4" y="13.2" width="5.2" height="4" rx=".9" fill="url(#msn-steel)" stroke="#55627a" strokeWidth=".5" />
      <path d="M7.6 14.6h4.8M7.6 15.9h4.8" stroke="#55627a" strokeWidth=".5" />
      <path d="M8.8 17.2h2.4l-.4 1.2H9.2Z" fill="#3d4a63" />
    </>
  ),
};

"use client";

/**
 * ICQ-era smileys: round, yellow, a bold outline and one shine, a touch
 * flatter and more cartoon than MSN's glass ones. Typing a code like :-) or
 * @}->-- shows the picture. Gradients come from <IcqDefs /> in art.tsx.
 */

export type EmoteId =
  | "smile" | "grin" | "wink" | "tongue" | "cool" | "kiss" | "surprised" | "sad" | "cry"
  | "angry" | "embarrassed" | "undecided" | "sealed" | "sleepy" | "angel" | "devil"
  | "heart" | "rose" | "flower";

/** Picker order. Codes with a nose come first: that's how people typed them in 2000. */
export const EMOTES: { id: EmoteId; name: string; codes: string[] }[] = [
  { id: "smile", name: "Smile", codes: [":-)", ":)"] },
  { id: "grin", name: "Laughing", codes: [":-D", ":D"] },
  { id: "wink", name: "Wink", codes: [";-)", ";)"] },
  { id: "tongue", name: "Tongue", codes: [":-P", ":P", ":-p", ":p"] },
  { id: "cool", name: "Cool", codes: ["8-)", "B-)"] },
  { id: "kiss", name: "Kiss", codes: [":-*", ":*"] },
  { id: "surprised", name: "Surprised", codes: [":-O", ":O", ":-o", ":o"] },
  { id: "sad", name: "Frown", codes: [":-(", ":("] },
  { id: "cry", name: "Crying", codes: [":'(", ":'-("] },
  { id: "angry", name: "Yelling", codes: [">:o", ">:-o", ">:O", ":-@"] },
  { id: "embarrassed", name: "Embarrassed", codes: [":-[", ":["] },
  { id: "undecided", name: "Undecided", codes: [":-\\", ":-/"] },
  { id: "sealed", name: "Lips are sealed", codes: [":-X", ":-x"] },
  { id: "sleepy", name: "Sleepy", codes: ["|-)"] },
  { id: "angel", name: "Innocent", codes: ["O:-)", "0:-)"] },
  { id: "devil", name: "Devilish", codes: ["]:->", ">:-)"] },
  { id: "heart", name: "Heart", codes: ["<3"] },
  { id: "rose", name: "A rose", codes: ["@}->--", "@}-;--"] },
  { id: "flower", name: "Flower", codes: ["(flower)"] },
];

const BY_CODE = new Map(EMOTES.flatMap((e) => e.codes.map((c) => [c, e] as const)));
const CODES = new RegExp(
  `(${[...BY_CODE.keys()]
    .sort((a, b) => b.length - a.length)
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
  "g",
);

/** Text with its smiley codes drawn as smileys. */
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

export function Emote({ id, label, className = "icq-emote" }: { id: EmoteId; label?: string; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {label && <title>{label}</title>}
      {ART[id]}
    </svg>
  );
}

/* ───────── Drawing ───────── */

const INK = "#2a1800";

function Face({ fill = "url(#icq-face)" }: { fill?: string }) {
  return (
    <>
      <circle cx="10" cy="10.4" r="8.6" fill={fill} stroke="#4f3400" strokeWidth="1.05" />
      <ellipse cx="7.6" cy="5.4" rx="3.7" ry="1.9" fill="url(#icq-gloss)" opacity=".8" />
    </>
  );
}

const EYES = (
  <>
    <ellipse cx="7.3" cy="8.6" rx=".95" ry="1.4" fill={INK} />
    <ellipse cx="12.7" cy="8.6" rx=".95" ry="1.4" fill={INK} />
  </>
);

const line = { fill: "none", stroke: INK, strokeWidth: 1.15, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ART: Record<EmoteId, React.ReactNode> = {
  smile: (
    <>
      <Face />
      {EYES}
      <path d="M6 11.8q4 4 8 0" {...line} />
    </>
  ),
  grin: (
    <>
      <Face />
      {EYES}
      <path d="M5.6 11.2h8.8q-.4 4.8-4.4 4.8t-4.4-4.8Z" fill="#7a1f00" stroke={INK} strokeWidth=".9" strokeLinejoin="round" />
      <path d="M6.2 11.5h7.6q-.1 1-.4 1.6H6.6q-.3-.6-.4-1.6Z" fill="#fff" />
      <path d="M8 15.2q2 .9 4 0" stroke="#ff7a86" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </>
  ),
  wink: (
    <>
      <Face />
      <path d="M6 8.8q1.3-1.3 2.6 0" {...line} />
      <ellipse cx="12.7" cy="8.6" rx=".95" ry="1.4" fill={INK} />
      <path d="M6 12q4.2 3.6 8.2-.8" {...line} />
    </>
  ),
  tongue: (
    <>
      <Face />
      {EYES}
      <path d="M6.2 11.8q3.8 2.8 7.6 0" {...line} />
      <path d="M10.2 12.7h2.8v1.8a1.4 1.4 0 0 1-2.8 0Z" fill="#ff6b86" stroke="#a3203c" strokeWidth=".6" />
      <path d="M11.6 13v1.6" stroke="#c0304e" strokeWidth=".5" />
    </>
  ),
  cool: (
    <>
      <Face />
      <path d="M3.6 7.4h12.8v1.3l-1.3 2.4q-2 1.3-3.5-.3L10.7 9.4H9.3l-.9 1.4q-1.5 1.6-3.5.3L3.6 8.7Z" fill="#141414" />
      <path d="M5.4 8.4 7 10M12.2 8.4l1.6 1.6" stroke="#fff" strokeOpacity=".75" strokeWidth=".7" strokeLinecap="round" />
      <path d="M6.6 12.8q3.6 2.6 7-.4" {...line} />
    </>
  ),
  kiss: (
    <>
      <Face />
      <path d="M6 8.4q1.3 1.2 2.6 0M11.4 8.4q1.3 1.2 2.6 0" {...line} />
      <ellipse cx="11" cy="13.4" rx="1.6" ry="1.3" fill="#e2231a" stroke="#7a0a05" strokeWidth=".6" />
      <path d="M9.6 13.4h2.8" stroke="#7a0a05" strokeWidth=".5" />
      <path
        d="M16.4 3.4c.5-.9 2.1-.7 2 .5-.1 1-1.3 1.7-2 2.3-.7-.6-1.9-1.3-2-2.3-.1-1.2 1.5-1.4 2-.5Z"
        fill="url(#icq-heart)"
        stroke="#7a0012"
        strokeWidth=".4"
        className="icq-float"
      />
    </>
  ),
  surprised: (
    <>
      <Face />
      <ellipse cx="7.3" cy="8.2" rx="1.15" ry="1.7" fill={INK} />
      <ellipse cx="12.7" cy="8.2" rx="1.15" ry="1.7" fill={INK} />
      <ellipse cx="10" cy="13.8" rx="1.9" ry="2.4" fill="#7a1f00" stroke={INK} strokeWidth=".8" />
    </>
  ),
  sad: (
    <>
      <Face />
      <ellipse cx="7.3" cy="9" rx=".95" ry="1.3" fill={INK} />
      <ellipse cx="12.7" cy="9" rx=".95" ry="1.3" fill={INK} />
      <path d="M6.4 14.8q3.6-3.6 7.2 0" {...line} />
    </>
  ),
  cry: (
    <>
      <Face />
      <path d="M6 9.2q1.3-1 2.6 0M11.4 9.2q1.3-1 2.6 0" {...line} />
      <path d="M6.8 14.8q3.2-2.8 6.4 0" {...line} />
      <path d="M6.2 10.6q-1 1.9-1 2.7a1 1 0 0 0 2 0q0-.8-1-2.7Z" fill="#7cd0ff" stroke="#2a86c8" strokeWidth=".5" className="icq-tear" />
      <path d="M13.8 10.6q-1 1.9-1 2.7a1 1 0 0 0 2 0q0-.8-1-2.7Z" fill="#7cd0ff" stroke="#2a86c8" strokeWidth=".5" className="icq-tear" style={{ animationDelay: "-.8s" }} />
    </>
  ),
  angry: (
    <>
      <Face fill="url(#icq-face-red)" />
      <path d="M5.2 6.2l3.2 1.8M14.8 6.2l-3.2 1.8" {...line} strokeWidth={1.3} />
      <ellipse cx="7.4" cy="9.4" rx=".85" ry="1.1" fill={INK} />
      <ellipse cx="12.6" cy="9.4" rx=".85" ry="1.1" fill={INK} />
      <ellipse cx="10" cy="14" rx="2" ry="2.1" fill="#5a0f00" stroke={INK} strokeWidth=".8" />
    </>
  ),
  embarrassed: (
    <>
      <Face />
      <ellipse cx="6.8" cy="9.2" rx=".85" ry="1.2" fill={INK} />
      <ellipse cx="12.2" cy="9.2" rx=".85" ry="1.2" fill={INK} />
      <ellipse cx="5" cy="11.8" rx="1.9" ry="1.1" fill="#ff5f7a" opacity=".6" />
      <ellipse cx="15" cy="11.8" rx="1.9" ry="1.1" fill="#ff5f7a" opacity=".6" />
      <path d="M7.6 14.2q1.2-.9 2.4 0t2.4 0" {...line} strokeWidth={1} />
    </>
  ),
  undecided: (
    <>
      <Face />
      {EYES}
      <path d="M6.6 13.8 13.4 12" {...line} />
    </>
  ),
  sealed: (
    <>
      <Face />
      {EYES}
      <path d="M5.8 13h8.4" {...line} />
      <path d="M7 12.2v1.6M8.6 12.2v1.6M10.2 12.2v1.6M11.8 12.2v1.6" stroke={INK} strokeWidth=".7" />
      <rect x="13.4" y="11.9" width="1.8" height="2.6" rx=".4" fill="#a3acba" stroke={INK} strokeWidth=".5" />
    </>
  ),
  sleepy: (
    <>
      <Face />
      <path d="M6 9h2.6M11.4 9h2.6" {...line} />
      <ellipse cx="10" cy="14" rx="1.2" ry="1" fill="#7a1f00" />
      <path d="M14.4 2.2h2.8l-2.8 2.8h2.8" stroke="#2f63c9" strokeWidth=".9" fill="none" strokeLinejoin="round" strokeLinecap="round" className="icq-float" />
    </>
  ),
  angel: (
    <>
      <Face />
      {EYES}
      <path d="M6 11.8q4 4 8 0" {...line} />
      <ellipse cx="10" cy="1.9" rx="5" ry="1.4" fill="none" stroke="#9a7400" strokeWidth="1.9" />
      <ellipse cx="10" cy="1.9" rx="5" ry="1.4" fill="none" stroke="#ffe066" strokeWidth="1.1" />
    </>
  ),
  devil: (
    <>
      <path d="M4.4 4.8 3.6.8l3.6 2.6ZM15.6 4.8l.8-4-3.6 2.6Z" fill="#a8150b" stroke={INK} strokeWidth=".6" strokeLinejoin="round" />
      <Face fill="url(#icq-face-devil)" />
      <path d="M5.8 7.8l2.8.9M14.2 7.8l-2.8.9" {...line} />
      <ellipse cx="7.6" cy="9.6" rx=".85" ry="1" fill={INK} />
      <ellipse cx="12.4" cy="9.6" rx=".85" ry="1" fill={INK} />
      <path d="M5.8 11.8q4.2 4.4 8.4 0q-4.2 2-8.4 0Z" fill="#fff" stroke={INK} strokeWidth=".9" strokeLinejoin="round" />
    </>
  ),
  heart: (
    <>
      <path
        d="M10 17.6C4.2 13.6 1.8 10.6 1.8 7.4 1.8 4.8 3.8 2.8 6.2 2.8c1.6 0 3 .8 3.8 2.2.8-1.4 2.2-2.2 3.8-2.2 2.4 0 4.4 2 4.4 4.6 0 3.2-2.4 6.2-8.2 10.2Z"
        fill="url(#icq-heart)"
        stroke="#7a0012"
        strokeWidth=".8"
        strokeLinejoin="round"
      />
      <ellipse cx="6" cy="6.4" rx="2" ry="1.2" transform="rotate(-30 6 6.4)" fill="#fff" opacity=".7" />
    </>
  ),
  rose: (
    <>
      <path d="M3.4 18 10.4 9.6" stroke="#2f8a1a" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.4 14.6q-3.2-.6-3.6-3.2 3 .1 3.6 3.2Z" fill="url(#icq-green)" stroke="#1b6a14" strokeWidth=".4" />
      <path d="M7.8 13q2.8 1 4.6-.6-2.6-1.4-4.6.6Z" fill="url(#icq-green)" stroke="#1b6a14" strokeWidth=".4" />
      <path
        d="M8.2 6.6q-.3 4.6 4 4.8t4.8-4.4q-1.5 1-2.4.1-.7-3.6-2.2-4.2-1.5.2-2.2 3.8-.9.8-2-.1Z"
        fill="url(#icq-heart)"
        stroke="#7a0012"
        strokeWidth=".7"
        strokeLinejoin="round"
      />
      <path d="M10.6 7q1.8-1.4 3.4.2M11 9q1.2.8 2.4 0" fill="none" stroke="#7a0012" strokeWidth=".6" strokeLinecap="round" />
    </>
  ),
  flower: (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx="10" cy="4.6" rx="2.7" ry="4" fill="#4cc043" stroke="#1b7316" strokeWidth=".6" transform={`rotate(${i * 45} 10 10)`} />
      ))}
      <circle cx="10" cy="10" r="3" fill="#ffd21f" stroke="#9a6f00" strokeWidth=".6" />
      <ellipse cx="9.2" cy="9.1" rx="1.2" ry=".7" fill="#fff8c4" />
    </>
  ),
};

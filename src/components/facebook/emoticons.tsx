"use client";

/**
 * Facebook Chat's 2008 emoticons, redrawn: small round yellow faces with
 * crisp ink, plus the famous extras (the shark, the penguin and 42). Typing a
 * code like :) or <3 shows the picture. Gradients come from <FbDefs />.
 */

export type EmoteId =
  | "smile" | "frown" | "tongue" | "grin" | "wink" | "gasp" | "unsure" | "cry" | "grumpy"
  | "glasses" | "sunglasses" | "heart" | "kiki" | "angel" | "devil" | "squint" | "confused"
  | "curly" | "upset" | "kiss" | "shark" | "penguin" | "fortytwo";

export const EMOTES: { id: EmoteId; name: string; codes: string[] }[] = [
  { id: "smile", name: "smile", codes: [":)", ":-)", ":]"] },
  { id: "frown", name: "frown", codes: [":(", ":-(", ":["] },
  { id: "tongue", name: "tongue", codes: [":P", ":-P", ":p", ":-p"] },
  { id: "grin", name: "grin", codes: [":D", ":-D", "=D"] },
  { id: "wink", name: "wink", codes: [";)", ";-)"] },
  { id: "gasp", name: "gasp", codes: [":O", ":-O", ":o", ":-o"] },
  { id: "unsure", name: "unsure", codes: [":/", ":-/", ":\\", ":-\\"] },
  { id: "cry", name: "cry", codes: [":'(", ":'-("] },
  { id: "grumpy", name: "grumpy", codes: [">:(", ">:-("] },
  { id: "glasses", name: "glasses", codes: ["8-)", "B-)"] },
  { id: "sunglasses", name: "sunglasses", codes: ["8|", "8-|", "B|", "B-|"] },
  { id: "heart", name: "heart", codes: ["<3"] },
  { id: "kiki", name: "kiki", codes: ["^_^"] },
  { id: "angel", name: "angel", codes: ["O:)", "O:-)"] },
  { id: "devil", name: "devil", codes: ["3:)", "3:-)"] },
  { id: "squint", name: "squint", codes: ["-_-"] },
  { id: "confused", name: "confused", codes: ["o.O", "O.o"] },
  { id: "curly", name: "curly lips", codes: [":3"] },
  { id: "upset", name: "upset", codes: [">:O", ">:-O", ">:o"] },
  { id: "kiss", name: "kiss", codes: [":*", ":-*"] },
  { id: "shark", name: "shark", codes: ["(^^^)"] },
  { id: "penguin", name: "penguin", codes: ['<(")'] },
  { id: "fortytwo", name: "42", codes: [":42:"] },
];

const BY_CODE = new Map(EMOTES.flatMap((e) => e.codes.map((c) => [c, e] as const)));

/**
 * One pattern for every code, longest first. Codes that start or end with a
 * letter or digit must stand alone, ":3" never fires inside a ratio like
 * "1:3", and ":/" never fires inside "http://". (Plain "8)" and "B)" are left
 * out: they turn up at the end of numbered lists.)
 */
const CODES = new RegExp(
  `(${[...BY_CODE.keys()]
    .sort((a, b) => b.length - a.length)
    .map((c) => {
      let p = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (/^[A-Za-z0-9]/.test(c)) p = `(?<![A-Za-z0-9])${p}`;
      if (/[A-Za-z0-9]$/.test(c)) p = `${p}(?![A-Za-z0-9])`;
      if (c.startsWith(":")) p = `(?<![0-9])${p}`;
      if (c === ":/" || c === ":-/") p = `${p}(?!/)`;
      return p;
    })
    .join("|")})`,
  "g",
);

/** Text with its emoticon codes drawn as faces. */
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

export function Emote({ id, label, className = "fb-emote" }: { id: EmoteId; label?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      data-e={id}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {label && <title>{label}</title>}
      {ART[id]}
    </svg>
  );
}

/* ───────── Drawing ───────── */

const INK = "#4d2f00";
const line = { fill: "none", stroke: INK, strokeWidth: 1.25, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Face({ fill = "url(#fb-face)", stroke = "#c98a06" }: { fill?: string; stroke?: string }) {
  return (
    <>
      <circle cx="10" cy="10.4" r="8.4" fill={fill} stroke={stroke} strokeWidth=".8" />
      <ellipse cx="10" cy="5.6" rx="5" ry="2.4" fill="url(#fb-gloss)" opacity=".7" />
    </>
  );
}

const Dots = ({ y = 8.4 }: { y?: number }) => (
  <>
    <ellipse cx="7.2" cy={y} rx="1.05" ry="1.45" fill={INK} />
    <ellipse cx="12.8" cy={y} rx="1.05" ry="1.45" fill={INK} />
  </>
);

const Smile = ({ y = 12, w = 3.6, d = 2.6 }: { y?: number; w?: number; d?: number }) => (
  <path d={`M${10 - w} ${y}q${w} ${d} ${w * 2} 0`} {...line} />
);

const ART: Record<EmoteId, React.ReactNode> = {
  smile: (
    <>
      <Face />
      <Dots />
      <Smile />
    </>
  ),
  frown: (
    <>
      <Face />
      <Dots />
      <path d="M6.6 14.4q3.4-2.6 6.8 0" {...line} />
    </>
  ),
  tongue: (
    <>
      <Face />
      <Dots />
      <path d="M6 12.2h8" {...line} />
      <path d="M8.6 12.4h3.4v1.6a1.7 1.7 0 0 1-3.4 0Z" fill="#f2697a" stroke={INK} strokeWidth=".8" />
    </>
  ),
  grin: (
    <>
      <Face />
      <Dots y={8} />
      <path d="M5.6 11.2h8.8q-.6 4.2-4.4 4.2t-4.4-4.2Z" fill="#7a2410" stroke={INK} strokeWidth=".9" strokeLinejoin="round" />
      <path d="M6.2 11.3h7.6v1.2H6.2Z" fill="#fff" />
    </>
  ),
  wink: (
    <>
      <Face />
      <ellipse cx="7.2" cy="8.4" rx="1.05" ry="1.45" fill={INK} />
      <path d="M11.4 8.6q1.4-1.2 2.8 0" {...line} />
      <Smile />
    </>
  ),
  gasp: (
    <>
      <Face />
      <Dots y={7.8} />
      <ellipse cx="10" cy="13.2" rx="2.1" ry="2.5" fill="#7a2410" stroke={INK} strokeWidth=".9" />
    </>
  ),
  unsure: (
    <>
      <Face />
      <Dots />
      <path d="M6.6 13.6 13.4 11.8" {...line} />
    </>
  ),
  cry: (
    <>
      <Face />
      <Dots />
      <path d="M6.8 14.4q3.2-2.4 6.4 0" {...line} />
      <path d="M13.6 10.2q1.4 2 1.4 3a1.4 1.4 0 0 1-2.8 0q0-1 1.4-3Z" fill="#7cc6ff" stroke="#2f7fc4" strokeWidth=".5" />
    </>
  ),
  grumpy: (
    <>
      <Face fill="url(#fb-face-red)" stroke="#a52a10" />
      <path d="M5.4 6.4 8.4 7.8M14.6 6.4 11.6 7.8" {...line} />
      <Dots y={9.2} />
      <path d="M6.8 14.2q3.2-2 6.4 0" {...line} />
    </>
  ),
  glasses: (
    <>
      <Face />
      <circle cx="7" cy="8.6" r="2.4" fill="#fff" stroke={INK} strokeWidth="1" />
      <circle cx="13" cy="8.6" r="2.4" fill="#fff" stroke={INK} strokeWidth="1" />
      <path d="M9.4 8.4h1.2M2.4 8 4.6 8.4M17.6 8l-2.2.4" stroke={INK} strokeWidth="1" />
      <circle cx="7.2" cy="8.8" r=".9" fill={INK} />
      <circle cx="13.2" cy="8.8" r=".9" fill={INK} />
      <Smile y={12.8} w={3} d={2} />
    </>
  ),
  sunglasses: (
    <>
      <Face />
      <path d="M3.2 7.2h13.6l-.6 2.8a2 2 0 0 1-2 1.6h-1.6a2 2 0 0 1-2-1.6L10 8.8l-.6 1.2a2 2 0 0 1-2 1.6H5.8a2 2 0 0 1-2-1.6Z" fill="#1d2433" />
      <path d="M5 8.2h2.4M11.6 8.2H14" stroke="#7d8bb0" strokeWidth=".8" strokeLinecap="round" />
      <path d="M7 14.2h6" {...line} />
    </>
  ),
  heart: (
    <path
      d="M10 17.2 3.6 10.8A3.8 3.8 0 0 1 10 5.6a3.8 3.8 0 0 1 6.4 5.2Z"
      fill="url(#fb-heart)"
      stroke="#9c0f28"
      strokeWidth=".8"
      strokeLinejoin="round"
    />
  ),
  kiki: (
    <>
      <Face />
      <path d="M5.4 9.2 7.2 7.2l1.8 2M11 9.2l1.8-2 1.8 2" {...line} />
      <Smile y={12.2} />
    </>
  ),
  angel: (
    <>
      <ellipse cx="10" cy="2.6" rx="5" ry="1.4" fill="none" stroke="#f7c400" strokeWidth="1.2" />
      <Face />
      <Dots />
      <Smile />
    </>
  ),
  devil: (
    <>
      <path d="M3.6 6.6 3 1.6l4 3M16.4 6.6 17 1.6l-4 3" fill="#c62d12" stroke="#8a1a06" strokeWidth=".6" strokeLinejoin="round" />
      <Face fill="url(#fb-face-red)" stroke="#a52a10" />
      <path d="M5.6 7 8.2 8.2M14.4 7l-2.6 1.2" {...line} />
      <Dots y={9.4} />
      <path d="M6 12.4q4 3.4 8 0" {...line} />
    </>
  ),
  squint: (
    <>
      <Face />
      <path d="M5.4 8.6h3.4M11.2 8.6h3.4M7 13.4h6" {...line} />
    </>
  ),
  confused: (
    <>
      <Face />
      <circle cx="7" cy="8.4" r="1" fill={INK} />
      <circle cx="13" cy="8.2" r="2.4" fill="#fff" stroke={INK} strokeWidth="1" />
      <circle cx="13" cy="8.4" r="1" fill={INK} />
      <path d="M7.4 13.4q1.4-1 2.6 0t2.6 0" {...line} />
    </>
  ),
  curly: (
    <>
      <Face />
      <Dots />
      <path d="M6.4 12.2q1.8 2.2 3.6 0 1.8 2.2 3.6 0" {...line} />
    </>
  ),
  upset: (
    <>
      <Face fill="url(#fb-face-red)" stroke="#a52a10" />
      <path d="M5.2 6.2 8.4 7.6M14.8 6.2 11.6 7.6" {...line} />
      <Dots y={9.2} />
      <ellipse cx="10" cy="14" rx="2.4" ry="2" fill="#5a1004" stroke={INK} strokeWidth=".9" />
    </>
  ),
  kiss: (
    <>
      <Face />
      <path d="M5.6 8.6q1.6-1.4 3.2 0M11.2 8.6q1.6-1.4 3.2 0" {...line} />
      <path d="M8.4 12.4q1.6-1.4 1.6.2 0-1.6 1.6-.2-.4 1.8-1.6 2.4-1.2-.6-1.6-2.4Z" fill="#e83a57" stroke="#9c0f28" strokeWidth=".6" />
    </>
  ),
  shark: (
    <>
      <path d="M1 15.4q4.5-2 9 0t9 0V19H1Z" fill="#4e86d6" opacity=".55" />
      <path d="M4 15.6 11.2 3.4q.6 7.4 5 12Z" fill="url(#fb-shark)" stroke="#3f5584" strokeWidth=".8" strokeLinejoin="round" />
      <path d="M1 15.6q4.5-2 9 0t9 0" fill="none" stroke="#2f6fbf" strokeWidth="1" />
    </>
  ),
  penguin: (
    <>
      <ellipse cx="10" cy="11" rx="6" ry="7.6" fill="#22252e" />
      <ellipse cx="10" cy="12.2" rx="4.2" ry="5.6" fill="#fff" />
      <circle cx="8.2" cy="7.4" r="1" fill="#fff" />
      <circle cx="11.8" cy="7.4" r="1" fill="#fff" />
      <circle cx="8.3" cy="7.5" r=".5" fill="#22252e" />
      <circle cx="11.7" cy="7.5" r=".5" fill="#22252e" />
      <path d="M8.6 9h2.8L10 10.8Z" fill="#f5a623" />
      <path d="M6.6 18.4h2.4M11 18.4h2.4" stroke="#f5a623" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  fortytwo: (
    <>
      <rect x="1.4" y="3.4" width="17.2" height="13.2" rx="3" fill="#3b5998" stroke="#29447e" strokeWidth=".8" />
      <text x="10" y="13.6" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">42</text>
    </>
  ),
};

"use client";

/**
 * The 2007 emoticons: round, glossy faces with big white eyes, and every one
 * of them moves (the animations are the sk-* classes in skype.css). Typing a
 * code like :) or (wave) shows the picture. Gradients come from <SkypeDefs />.
 */

export type EmoteId =
  | "smile" | "laugh" | "wink" | "tongue" | "cool" | "surprised" | "sad" | "cry" | "sweat"
  | "speechless" | "kiss" | "blush" | "sleepy" | "inlove" | "evil" | "angry" | "party" | "nerd"
  | "think" | "wave" | "devil" | "angel" | "rofl" | "dance" | "headbang" | "bow" | "clap"
  | "yes" | "no" | "heart" | "broken" | "call" | "coffee" | "sun" | "rain" | "music" | "cake"
  | "star" | "cash";

/**
 * Picker order follows the old menu: faces, then gestures, then things.
 * Single-letter codes are uppercase only, so O(n) or a list item (y) in a real
 * answer doesn't turn into a thumb.
 */
export const EMOTES: { id: EmoteId; name: string; codes: string[] }[] = [
  { id: "smile", name: "Smile", codes: [":)", ":-)", ":=)"] },
  { id: "sad", name: "Sad", codes: [":(", ":-(", ":=(", "(sad)"] },
  { id: "laugh", name: "Laugh", codes: [":D", ":-D", ":=D", "(laugh)"] },
  { id: "cool", name: "Cool", codes: ["8-)", "8=)", "B-)", "(cool)"] },
  { id: "wink", name: "Wink", codes: [";)", ";-)", ";=)", "(wink)"] },
  { id: "surprised", name: "Surprised", codes: [":O", ":-O", ":=O", ":o", ":-o", "(surprised)"] },
  { id: "cry", name: "Crying", codes: [";(", ";-(", ";=(", "(cry)"] },
  { id: "sweat", name: "Sweating", codes: ["(sweat)", "(:|"] },
  { id: "speechless", name: "Speechless", codes: [":|", ":-|", ":=|", "(speechless)"] },
  { id: "kiss", name: "Kiss", codes: [":*", ":-*", ":=*", "(kiss)"] },
  { id: "tongue", name: "Tongue out", codes: [":P", ":-P", ":=P", ":p", ":-p", "(tongueout)"] },
  { id: "blush", name: "Blush", codes: [":$", ":-$", ":=$", "(blush)"] },
  { id: "think", name: "Thinking", codes: [":-?", ":=?", "(think)"] },
  { id: "sleepy", name: "Sleepy", codes: ["|-)", "I-)", "(snooze)", "(sleepy)"] },
  { id: "inlove", name: "In love", codes: ["(inlove)", "(love)"] },
  { id: "evil", name: "Evil grin", codes: ["]:)", ">:)", "(grin)", "(evil)"] },
  { id: "angry", name: "Angry", codes: [":@", ":-@", ":=@", "(angry)"] },
  { id: "party", name: "Party", codes: ["(party)"] },
  { id: "nerd", name: "Nerd", codes: ["8-|", "8=|", "(nerd)"] },
  { id: "devil", name: "Devil", codes: ["(devil)"] },
  { id: "angel", name: "Angel", codes: ["(angel)"] },
  { id: "wave", name: "Hi", codes: ["(wave)", "(hi)"] },
  { id: "rofl", name: "Rolling on the floor laughing", codes: ["(rofl)"] },
  { id: "dance", name: "Dance", codes: ["(dance)", "\\o/"] },
  { id: "headbang", name: "Headbang", codes: ["(headbang)", "(banghead)"] },
  { id: "bow", name: "Bow", codes: ["(bow)"] },
  { id: "clap", name: "Clapping", codes: ["(clap)"] },
  { id: "yes", name: "Yes", codes: ["(Y)", "(yes)", "(ok)"] },
  { id: "no", name: "No", codes: ["(N)", "(no)"] },
  { id: "heart", name: "Heart", codes: ["(H)", "(L)", "(heart)"] },
  { id: "broken", name: "Broken heart", codes: ["(U)", "(brokenheart)"] },
  { id: "call", name: "Call", codes: ["(call)", "(phone)", "(mp)"] },
  { id: "coffee", name: "Coffee", codes: ["(coffee)"] },
  { id: "sun", name: "Sun", codes: ["(sun)"] },
  { id: "rain", name: "Rain", codes: ["(rain)", "(london)"] },
  { id: "music", name: "Music", codes: ["(music)"] },
  { id: "cake", name: "Cake", codes: ["(cake)", "(^)"] },
  { id: "star", name: "Star", codes: ["(*)", "(star)"] },
  { id: "cash", name: "Cash", codes: ["(cash)", "($)", "(mo)"] },
];

const BY_CODE = new Map(EMOTES.flatMap((e) => e.codes.map((c) => [c, e] as const)));
const CODES = new RegExp(
  `(${[...BY_CODE.keys()]
    .sort((a, b) => b.length - a.length)
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
  "g",
);

/** Text with its emoticon codes drawn as animated smileys. */
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

export function Emote({ id, label, className = "sk-emote" }: { id: EmoteId; label?: string; className?: string }) {
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

const INK = "#5a2e00";
const PUPIL = "#231100";
const MOUTH = "#7a1f00";
const RIM = "#c47a00";

const line = { fill: "none", stroke: INK, strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Face({ fill = "url(#sk-face)", stroke = RIM }: { fill?: string; stroke?: string }) {
  return (
    <>
      <circle cx="10" cy="10.4" r="8.5" fill={fill} stroke={stroke} strokeWidth=".8" />
      <ellipse cx="10" cy="5.5" rx="5.3" ry="2.6" fill="url(#sk-gloss)" opacity=".75" />
    </>
  );
}

/** Big white eyes with pupils; dx/dy point the gaze. */
function Eyes({ dx = 0, dy = 0, y = 8.2, ry = 2.3, blink = true }: { dx?: number; dy?: number; y?: number; ry?: number; blink?: boolean }) {
  return (
    <g className={blink ? "sk-blink" : undefined}>
      <ellipse cx="7.3" cy={y} rx="1.8" ry={ry} fill="#fff" stroke={INK} strokeWidth=".55" />
      <ellipse cx="12.7" cy={y} rx="1.8" ry={ry} fill="#fff" stroke={INK} strokeWidth=".55" />
      <circle cx={7.5 + dx} cy={y + 0.3 + dy} r=".95" fill={PUPIL} />
      <circle cx={12.5 + dx} cy={y + 0.3 + dy} r=".95" fill={PUPIL} />
    </g>
  );
}

/** Happy closed eyes: ^ ^ */
const Squint = ({ y = 8.6 }: { y?: number }) => <path d={`M5.6 ${y}q1.7-2 3.4 0M11 ${y}q1.7-2 3.4 0`} {...line} />;

const Smile = ({ y = 12 }: { y?: number }) => <path d={`M6.2 ${y}q3.8 3.6 7.6 0`} {...line} />;

const OpenSmile = () => (
  <>
    <path d="M5.4 11.2h9.2q-.4 5.2-4.6 5.2t-4.6-5.2Z" fill={MOUTH} stroke={INK} strokeWidth=".5" strokeLinejoin="round" />
    <path d="M6 11.6h8l-.2 1.2H6.2Z" fill="#fff" />
    <ellipse cx="10" cy="15.1" rx="2.4" ry="1" fill="#ff7a8a" />
  </>
);

const HEART = "M10 17.6C4.2 13.4 1.8 10.6 1.8 7.4 1.8 4.9 3.8 3 6.1 3c1.6 0 3 .9 3.9 2.3C10.9 3.9 12.3 3 13.9 3c2.3 0 4.3 1.9 4.3 4.4 0 3.2-2.4 6-8.2 10.2Z";

/** A water drop. Animated drops get a wrapper, since a CSS animation would replace the path's own transform. */
const Drop = ({ x, y, s = 1, className, fill = "#6fd2ff" }: { x: number; y: number; s?: number; className?: string; fill?: string }) => (
  <g className={className}>
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 0C-.8 1.3-1.2 2.1-1.2 2.7a1.2 1.2 0 0 0 2.4 0C1.2 2.1.8 1.3 0 0Z"
      fill={fill}
      stroke="#2a8fc8"
      strokeWidth=".3"
    />
  </g>
);

const Thumb = () => (
  <>
    <rect x="1.8" y="9.2" width="3.8" height="9" rx="1" fill="url(#sk-blue)" stroke="#0a5d9c" strokeWidth=".6" />
    <path
      d="M5.6 9.6 8.5 3.7c.5-1.3 1.6-1.6 2.4-1 .8.5.9 1.4.6 2.3l-.9 3.3h5.1c1.3 0 2 .9 1.8 2l-.9 6.6c-.2 1.3-1 1.9-2.2 1.9H5.6Z"
      fill="url(#sk-face)"
      stroke={RIM}
      strokeWidth=".7"
      strokeLinejoin="round"
    />
    <path d="M11.4 10.9h5.5M11.2 13.3h5.3M11 15.7h4.9" stroke="#c98a10" strokeWidth=".7" strokeLinecap="round" />
    <ellipse cx="9.4" cy="5.2" rx=".8" ry="1.8" transform="rotate(25 9.4 5.2)" fill="#fff" opacity=".6" />
  </>
);

/** A face shrunk into the lower left, leaving room for a hand or a thought. */
const Small = ({ children }: { children: React.ReactNode }) => <g transform="translate(-1.4 1.4) scale(.88)">{children}</g>;

const ART: Record<EmoteId, React.ReactNode> = {
  smile: (
    <>
      <Face />
      <Eyes />
      <Smile />
    </>
  ),
  sad: (
    <>
      <Face />
      <path d="M5 5.4l3-.9M15 5.4l-3-.9" {...line} strokeWidth=".9" />
      <Eyes dy={0.7} />
      <path d="M6.6 15q3.4-3 6.8 0" {...line} />
    </>
  ),
  laugh: (
    <g className="sk-bounce">
      <Face />
      <Squint />
      <OpenSmile />
    </g>
  ),
  cool: (
    <>
      <Face />
      <path d="M3.4 7.2h13.2" stroke="#1b1b26" strokeWidth=".9" strokeLinecap="round" />
      <path d="M4.2 7h4.9l-.3 2.3q-.4 1.8-2.1 1.8T4.5 9.3Z M10.9 7h4.9l-.3 2.3q-.4 1.8-2.1 1.8t-2.2-1.8Z" fill="#1b1b26" />
      <path d="M5.2 7.8l1.4 0M11.9 7.8l1.4 0" stroke="#fff" strokeWidth=".7" strokeLinecap="round" opacity=".8" className="sk-glint" />
      <path d="M6.8 13q3.4 2.6 6.8-.8" {...line} />
    </>
  ),
  wink: (
    <>
      <Face />
      <g>
        <ellipse cx="7.3" cy="8.2" rx="1.8" ry="2.3" fill="#fff" stroke={INK} strokeWidth=".55" />
        <circle cx="7.5" cy="8.5" r=".95" fill={PUPIL} />
      </g>
      <path d="M11.1 8.6q1.6 1.2 3.2 0" {...line} />
      <Smile />
    </>
  ),
  surprised: (
    <>
      <Face />
      <path d="M5.2 4.4q2-1.2 3.6-.2M14.8 4.4q-2-1.2-3.6-.2" {...line} strokeWidth=".8" />
      <Eyes ry={2.7} y={8} />
      <ellipse cx="10" cy="14" rx="1.9" ry="2.3" fill={MOUTH} stroke={INK} strokeWidth=".5" />
    </>
  ),
  cry: (
    <>
      <Face />
      <path d="M5 5.4l3-.9M15 5.4l-3-.9" {...line} strokeWidth=".9" />
      <path d="M5.6 8.8q1.7-1.2 3.4 0M11 8.8q1.7-1.2 3.4 0" {...line} />
      <path d="M6.6 15.2q3.4-3.2 6.8 0Z" fill={MOUTH} stroke={INK} strokeWidth=".6" strokeLinejoin="round" />
      <Drop x={6.2} y={10} className="sk-tear" />
      <Drop x={13.8} y={10} className="sk-tear sk-late" />
    </>
  ),
  sweat: (
    <>
      <Face />
      <Eyes dx={0.6} dy={-0.2} />
      <path d="M6.4 13.4q1.2-1 2.4 0t2.4 0 2.4 0" {...line} />
      <Drop x={15.6} y={3.2} s={1.15} className="sk-drip" />
    </>
  ),
  speechless: (
    <>
      <Face />
      <Eyes />
      <path d="M7 13.2h6" {...line} />
    </>
  ),
  kiss: (
    <>
      <Face />
      <path d="M5.8 8.4q1.5 1.1 3 0M11.2 8.4q1.5 1.1 3 0" {...line} />
      <path d="M8.8 11.9q1.2-.9 2.4 0-1 .8 0 1.5-1.2 1.1-2.4 0 1-.7 0-1.5Z" fill="#e8213f" stroke="#9e0b22" strokeWidth=".4" />
      <g className="sk-float">
        <path d={HEART} transform="translate(14 1.2) scale(.27)" fill="url(#sk-heart)" />
      </g>
    </>
  ),
  tongue: (
    <>
      <Face />
      <Eyes />
      <path d="M6.2 12.4q3.8 2 7.6 0" {...line} />
      <path className="sk-lick" d="M9 13.1h3.2v1.9a1.6 1.6 0 0 1-3.2 0Z" fill="#ff6f86" stroke="#b82a44" strokeWidth=".4" />
    </>
  ),
  blush: (
    <>
      <Face />
      <Eyes dx={-0.4} dy={0.8} />
      <g className="sk-cheeks">
        <ellipse cx="4.9" cy="11.6" rx="1.9" ry="1.1" fill="#ff5d78" opacity=".5" />
        <ellipse cx="15.1" cy="11.6" rx="1.9" ry="1.1" fill="#ff5d78" opacity=".5" />
      </g>
      <path d="M7.8 13q2.2 1.4 4.4 0" {...line} />
    </>
  ),
  think: (
    <>
      <Small>
        <Face />
        <Eyes dx={0.5} dy={-0.9} />
        <path d="M8 13.6q2.2-.8 4.4.2" {...line} />
      </Small>
      <g className="sk-float">
        <circle cx="16.2" cy="5.2" r="1" fill="#fff" stroke="#8fb8d8" strokeWidth=".4" />
        <circle cx="18" cy="2.6" r="1.6" fill="#fff" stroke="#8fb8d8" strokeWidth=".4" />
      </g>
    </>
  ),
  sleepy: (
    <>
      <Face />
      <path d="M5.6 9.2q1.7.9 3.4 0M11 9.2q1.7.9 3.4 0" {...line} />
      <ellipse cx="10" cy="13.8" rx="1.2" ry="1" fill={MOUTH} />
      <text className="sk-zzz" x="14.6" y="5.4" fontSize="5" fontWeight="800" fill="#1d8fe0" fontFamily="Verdana, sans-serif">
        z
      </text>
      <text className="sk-zzz sk-late" x="16.6" y="3" fontSize="3.6" fontWeight="800" fill="#1d8fe0" fontFamily="Verdana, sans-serif">
        z
      </text>
    </>
  ),
  inlove: (
    <>
      <Face />
      <g className="sk-beat">
        <path d={HEART} transform="translate(4.6 5.4) scale(.29)" fill="url(#sk-heart)" stroke="#a00a2c" strokeWidth="1.4" />
        <path d={HEART} transform="translate(10 5.4) scale(.29)" fill="url(#sk-heart)" stroke="#a00a2c" strokeWidth="1.4" />
      </g>
      <Smile y={12.2} />
    </>
  ),
  evil: (
    <>
      <Face />
      <path d="M4.8 5.8l4.2 1.8M15.2 5.8 11 7.6" {...line} />
      <Eyes y={9} ry={1.7} dy={-0.3} blink={false} />
      <path d="M5.2 11.6q4.8 1.6 9.6 0-1.2 4.4-4.8 4.4t-4.8-4.4Z" fill={MOUTH} stroke={INK} strokeWidth=".5" strokeLinejoin="round" />
      <path d="M6 12.3q4 1.2 8 0l-.4 1q-3.6 1-7.2 0Z" fill="#fff" />
    </>
  ),
  angry: (
    <g className="sk-shake">
      <Face fill="url(#sk-face-red)" stroke="#9c1e08" />
      <path d="M4.6 5.4l4.4 2M15.4 5.4 11 7.4" {...line} strokeWidth="1.4" />
      <Eyes y={9} ry={1.7} blink={false} />
      <path d="M6.6 15q3.4-2.6 6.8 0" {...line} />
    </g>
  ),
  party: (
    <>
      <Face />
      <Squint />
      <OpenSmile />
      <g>
        <path d="M12 6.4 15.2.6l3.4 5.2Z" fill="url(#sk-blue)" stroke="#0a5d9c" strokeWidth=".5" strokeLinejoin="round" />
        <path d="M13.6 3.6l2.2 1.6M14.6 1.8l1.8 1.4" stroke="#fff" strokeWidth=".7" strokeLinecap="round" />
        <circle cx="15.2" cy=".9" r="1" fill="#ffd21f" />
      </g>
      <g className="sk-twinkle">
        <rect x="1.2" y="3" width="1.2" height="1.2" rx=".3" fill="#ec4a2c" transform="rotate(20 1.8 3.6)" />
        <rect x="3.4" y="1" width="1" height="1" rx=".3" fill="#58c227" />
      </g>
      <g className="sk-twinkle sk-late">
        <rect x="17.6" y="9" width="1.2" height="1.2" rx=".3" fill="#ffd21f" transform="rotate(-20 18.2 9.6)" />
      </g>
    </>
  ),
  nerd: (
    <>
      <Face />
      <g fill="none" stroke="#2b2b38" strokeWidth=".9">
        <circle cx="7.1" cy="8.4" r="2.6" fill="#fff" fillOpacity=".55" />
        <circle cx="12.9" cy="8.4" r="2.6" fill="#fff" fillOpacity=".55" />
        <path d="M9.7 8.2q.3-.6.6 0M4.5 7.8 2.4 7M15.5 7.8l2.1-.8" />
      </g>
      <g className="sk-blink">
        <circle cx="7.3" cy="8.6" r=".9" fill={PUPIL} />
        <circle cx="12.7" cy="8.6" r=".9" fill={PUPIL} />
      </g>
      <path d="M6.6 12.4q3.4 2.2 6.8 0" {...line} />
      <rect x="8.7" y="13" width="1.2" height="1.6" rx=".3" fill="#fff" stroke={INK} strokeWidth=".35" />
      <rect x="10.1" y="13" width="1.2" height="1.6" rx=".3" fill="#fff" stroke={INK} strokeWidth=".35" />
    </>
  ),
  devil: (
    <g className="sk-bob">
      <path d="M3.4 5.6q-.4-3.4 2-4.8-.4 2.4 1.2 3.6ZM16.6 5.6q.4-3.4-2-4.8.4 2.4-1.2 3.6Z" fill="#e8e0d8" stroke="#6b5a4a" strokeWidth=".5" />
      <Face fill="url(#sk-face-devil)" stroke="#7a0610" />
      <path d="M5 6.2l4 1.6M15 6.2 11 7.8" {...line} stroke="#3a0005" />
      <Eyes y={9.2} ry={1.6} blink={false} />
      <path d="M5.6 11.8q4.4 1.4 8.8 0-1.2 3.8-4.4 3.8t-4.4-3.8Z" fill="#3a0005" />
      <path d="M6.4 12.3l.8 1 .8-.9.8 1 .8-.9.8 1 .8-.9.8 1 .7-1" stroke="#fff" strokeWidth=".5" fill="none" />
    </g>
  ),
  angel: (
    <>
      <ellipse className="sk-halo" cx="10" cy="1.6" rx="4.8" ry="1.2" fill="none" stroke="#ffd21f" strokeWidth="1.1" />
      <Face />
      <Squint y={9} />
      <Smile y={12.4} />
      <g opacity=".6">
        <ellipse cx="5" cy="11.6" rx="1.4" ry=".8" fill="#ff8a9c" />
        <ellipse cx="15" cy="11.6" rx="1.4" ry=".8" fill="#ff8a9c" />
      </g>
    </>
  ),
  wave: (
    <>
      <Small>
        <Face />
        <Eyes dx={0.4} />
        <Smile />
      </Small>
      <g className="sk-wave" style={{ transformOrigin: "15.8px 12px" }}>
        <g fill="url(#sk-face)" stroke={RIM} strokeWidth=".5">
          <rect x="12.9" y="4.4" width="1.5" height="5" rx=".75" transform="rotate(-14 13.6 9.4)" />
          <rect x="14.5" y="2.8" width="1.5" height="6.2" rx=".75" transform="rotate(-4 15.2 9)" />
          <rect x="16.1" y="3" width="1.5" height="6" rx=".75" transform="rotate(5 16.8 9)" />
          <rect x="17.5" y="4.6" width="1.4" height="4.8" rx=".7" transform="rotate(16 18.2 9.4)" />
          <ellipse cx="12.6" cy="10.6" rx="1.7" ry=".9" transform="rotate(-40 12.6 10.6)" />
          <ellipse cx="15.8" cy="10" rx="3" ry="2.6" />
        </g>
      </g>
    </>
  ),
  rofl: (
    <g className="sk-roll">
      <Face />
      <Squint />
      <OpenSmile />
      <Drop x={4} y={9.4} s={0.9} />
      <Drop x={16} y={9.4} s={0.9} />
    </g>
  ),
  dance: (
    <g className="sk-sway">
      <Face />
      <Squint />
      <OpenSmile />
      <path d="M1.4 6.6q-.8 2 0 4M18.6 6.6q.8 2 0 4" stroke="#1d8fe0" strokeWidth=".9" fill="none" strokeLinecap="round" />
    </g>
  ),
  headbang: (
    <g className="sk-nod">
      <Face />
      <path d="M5.4 7.2 8.6 8.6 5.4 10M14.6 7.2 11.4 8.6l3.2 1.4" {...line} />
      <path d="M7 12.4h6q-.2 3.8-3 3.8t-3-3.8Z" fill={MOUTH} stroke={INK} strokeWidth=".5" strokeLinejoin="round" />
      <path d="M3.4 2.4q2.4 1.6 4.6.4M16.6 2.4q-2.4 1.6-4.6.4" stroke={INK} strokeWidth=".9" fill="none" strokeLinecap="round" />
    </g>
  ),
  bow: (
    <g className="sk-bowing">
      <Face />
      <path d="M5.6 9q1.7.9 3.4 0M11 9q1.7.9 3.4 0" {...line} />
      <path d="M8 13.2q2 1.2 4 0" {...line} />
    </g>
  ),
  clap: (
    <>
      <g transform="translate(1.2 -.6) scale(.88)">
        <Face />
        <Squint />
        <OpenSmile />
      </g>
      <g className="sk-clap-l">
        <ellipse cx="6" cy="17" rx="2.2" ry="1.7" fill="url(#sk-face)" stroke={RIM} strokeWidth=".5" />
      </g>
      <g className="sk-clap-r">
        <ellipse cx="14" cy="17" rx="2.2" ry="1.7" fill="url(#sk-face)" stroke={RIM} strokeWidth=".5" />
      </g>
    </>
  ),
  yes: (
    <g className="sk-pump">
      <Thumb />
    </g>
  ),
  no: (
    <g className="sk-pump-down">
      <g transform="rotate(180 10 10.6)">
        <Thumb />
      </g>
    </g>
  ),
  heart: (
    <g className="sk-beat">
      <path d={HEART} fill="url(#sk-heart)" stroke="#a00a2c" strokeWidth=".7" />
      <ellipse cx="6.2" cy="6.4" rx="2.2" ry="1.3" transform="rotate(-30 6.2 6.4)" fill="#fff" opacity=".6" />
    </g>
  ),
  broken: (
    <>
      <g className="sk-break-l">
        <path d="M10 5.3C9.1 3.9 7.7 3 6.1 3 3.8 3 1.8 4.9 1.8 7.4c0 3.2 2.4 6 8.2 10.2l-1-3.2 1.6-2.4-1.8-2.2 1.4-2.2Z" fill="url(#sk-heart)" stroke="#a00a2c" strokeWidth=".6" strokeLinejoin="round" />
        <ellipse cx="5.8" cy="6.6" rx="2" ry="1.2" transform="rotate(-30 5.8 6.6)" fill="#fff" opacity=".55" />
      </g>
      <g className="sk-break-r">
        <path d="M10.6 5.3C11.5 3.9 12.9 3 14.5 3c2.3 0 4.3 1.9 4.3 4.4 0 3.2-2.4 6-8.2 10.2l-1-3.2 1.6-2.4-1.8-2.2 1.4-2.2Z" fill="url(#sk-heart)" stroke="#a00a2c" strokeWidth=".6" strokeLinejoin="round" />
      </g>
    </>
  ),
  call: (
    <>
      <g className="sk-ring">
        <circle cx="10" cy="10.4" r="7.6" fill="url(#sk-green)" stroke="#256f0c" strokeWidth=".7" />
        <ellipse cx="10" cy="6.2" rx="4.8" ry="2.3" fill="url(#sk-gloss)" opacity=".6" />
        <g transform="translate(4.4 4.8) scale(.47)">
          <path d="M6.6 2.8c.8-.5 1.8-.3 2.3.5l1.9 3.1c.4.7.3 1.6-.3 2.2l-1.3 1.2c.9 2 2.6 3.9 4.6 4.9l1.3-1.3c.6-.6 1.5-.7 2.2-.3l3.1 1.9c.8.5 1 1.5.5 2.3l-1.1 1.8c-.8 1.3-2.4 1.9-3.9 1.5C9.7 19.4 4.6 14.3 3.4 8.1c-.3-1.5.3-3 1.6-3.9Z" fill="#fff" />
        </g>
      </g>
      <g className="sk-twinkle" stroke="#2e8b10" strokeWidth=".9" fill="none" strokeLinecap="round">
        <path d="M17.2 2.6q1.2 1.2 1.2 2.8M15.8 1.2q2.4.6 3.6 3" />
      </g>
    </>
  ),
  coffee: (
    <>
      <g className="sk-steam" stroke="#a9bccc" strokeWidth=".8" fill="none" strokeLinecap="round">
        <path d="M7.6 6.2q-1-1.2 0-2.4t0-2.4M10.8 6.2q-1-1.2 0-2.4t0-2.4" />
      </g>
      <ellipse cx="9.4" cy="17.8" rx="7" ry="1.4" fill="url(#sk-paper)" stroke="#8da2b8" strokeWidth=".5" />
      <path d="M15 9.6h1.2a2.4 2.4 0 0 1 0 4.8h-1.8" stroke="#8da2b8" strokeWidth="1.3" fill="none" />
      <path d="M3.6 8h11.6l-1 7.4c-.2 1.4-1.4 2.4-2.8 2.4H7.4c-1.4 0-2.6-1-2.8-2.4Z" fill="url(#sk-paper)" stroke="#8da2b8" strokeWidth=".6" />
      <ellipse cx="9.4" cy="8.2" rx="5.6" ry="1.1" fill="#7a4a24" />
      <path d="M5.2 9.6q.2 4 1 6.6" stroke="#fff" strokeWidth=".8" fill="none" opacity=".8" strokeLinecap="round" />
    </>
  ),
  sun: (
    <>
      <g className="sk-spin" stroke="#ffa800" strokeWidth="1.4" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path key={a} d="M10 1.4v2" transform={`rotate(${a} 10 10)`} />
        ))}
      </g>
      <circle cx="10" cy="10" r="5.4" fill="url(#sk-sun)" stroke="#e08a00" strokeWidth=".6" />
      <circle cx="8.3" cy="9.2" r=".6" fill={INK} />
      <circle cx="11.7" cy="9.2" r=".6" fill={INK} />
      <path d="M8 11.2q2 1.6 4 0" {...line} strokeWidth=".8" />
    </>
  ),
  rain: (
    <>
      <g fill="url(#sk-cloud)" stroke="#8fb0cc" strokeWidth=".5">
        <path d="M5 11.6c-1.9 0-3.2-1.3-3.2-3 0-1.6 1.2-2.8 2.8-3 .4-2.2 2.2-3.8 4.6-3.8 2.2 0 4 1.4 4.5 3.4 2-.1 3.9 1.3 3.9 3.4 0 1.7-1.4 3-3.2 3Z" />
      </g>
      <Drop x={6} y={12.6} s={1.1} className="sk-raindrop" />
      <Drop x={10} y={12.6} s={1.1} className="sk-raindrop sk-late" />
      <Drop x={14} y={12.6} s={1.1} className="sk-raindrop sk-later" />
    </>
  ),
  music: (
    <g className="sk-notes">
      <path d="M7.2 4.6 16.6 2.4v10.2" stroke="#1d3d6e" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M7.2 4.6v10.2" stroke="#1d3d6e" strokeWidth="1.3" />
      <path d="M7.2 4.6 16.6 2.4v2.6L7.2 7.2Z" fill="#1d3d6e" />
      <ellipse cx="5.4" cy="15.2" rx="2.4" ry="1.8" transform="rotate(-20 5.4 15.2)" fill="url(#sk-blue)" stroke="#0a3d6e" strokeWidth=".6" />
      <ellipse cx="14.8" cy="13" rx="2.4" ry="1.8" transform="rotate(-20 14.8 13)" fill="url(#sk-blue)" stroke="#0a3d6e" strokeWidth=".6" />
    </g>
  ),
  cake: (
    <>
      <path className="sk-flame" d="M10 1.2c-.9 1.2-1.3 2-1.3 2.7a1.3 1.3 0 0 0 2.6 0c0-.7-.4-1.5-1.3-2.7Z" fill="url(#sk-sun)" stroke="#e86a00" strokeWidth=".3" />
      <rect x="9.3" y="4.6" width="1.4" height="4" rx=".4" fill="#5ab8ff" stroke="#1d6fb0" strokeWidth=".3" />
      <rect x="2.6" y="8.4" width="14.8" height="9.2" rx="2" fill="url(#sk-cake)" stroke="#c05080" strokeWidth=".6" />
      <path d="M2.6 10.4q1.2 1.8 2.5 0t2.5 0 2.4 0 2.5 0 2.4 0 2.5 0v-1c0-.6-.5-1-1-1H3.6c-.6 0-1 .4-1 1Z" fill="#fff" />
      <path d="M2.8 14h14.4" stroke="#fff" strokeWidth=".8" opacity=".7" />
      <circle cx="6" cy="12.2" r=".6" fill="#ec4a2c" />
      <circle cx="10.6" cy="12.6" r=".6" fill="#58c227" />
      <circle cx="14.2" cy="12" r=".6" fill="#14b0f0" />
    </>
  ),
  star: (
    <g className="sk-twinkle-big">
      <path d="m10 1.4 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.8l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8Z" fill="url(#sk-yellow)" stroke="#b47a00" strokeWidth=".7" strokeLinejoin="round" />
      <path d="M7.6 7.6 10 3.6l1.2 2.6" stroke="#fff" strokeWidth=".9" fill="none" opacity=".7" strokeLinecap="round" />
    </g>
  ),
  cash: (
    <g className="sk-bob">
      <rect x="2" y="6.6" width="15" height="9" rx="1.2" fill="#3f9c25" transform="rotate(-8 9.5 11)" />
      <rect x="3" y="5.4" width="15" height="9" rx="1.2" fill="url(#sk-coin)" stroke="#256f0c" strokeWidth=".6" />
      <rect x="4.2" y="6.6" width="12.6" height="6.6" rx=".8" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth=".6" />
      <circle cx="10.5" cy="9.9" r="2.6" fill="#fff" fillOpacity=".25" />
      <path d="M11.7 8.5c-.3-.4-.8-.6-1.3-.6-.7 0-1.2.4-1.2.9 0 1.2 2.6.7 2.6 1.9 0 .6-.5 1-1.3 1-.6 0-1.1-.2-1.4-.6M10.4 7.2v5.4" stroke="#fff" strokeWidth=".8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
};

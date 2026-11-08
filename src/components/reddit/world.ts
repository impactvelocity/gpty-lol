/**
 * The reddit around the conversation, June 2009: the subreddits, what's hot
 * in AskReddit, and the other redditors who drop into your thread. They
 * sound a lot like the other Gptys, a few years on (or before).
 */

export interface Sub {
  /** As it's written in URLs and the header: AskReddit, programming. */
  name: string;
  about: string;
  readers: number;
  /** "a community for 9 months" */
  age: string;
}

/** Where you can post. The persona plays to the one you pick. */
export const SUBS: Sub[] = [
  { name: "AskReddit", about: "Ask reddit anything. Be nice, search first (good luck), and no questions you could answer with Google in five seconds.", readers: 31_208, age: "1 year" },
  { name: "programming", about: "Computer programming. Language wars are welcome but please keep it civil. Yes, even about Lisp.", readers: 78_940, age: "3 years" },
  { name: "science", about: "Science news and discussion. Sources, please. \"I read it somewhere\" is not a source.", readers: 55_312, age: "3 years" },
  { name: "linux", about: "All things Linux. This is the year of the Linux desktop. We're pretty sure this time.", readers: 27_560, age: "2 years" },
  { name: "gaming", about: "Video games. No more Duke Nukem Forever jokes. Too soon.", readers: 46_105, age: "2 years" },
  { name: "funny", about: "Funny stuff. Pun threads go here, not in AskReddit.", readers: 74_233, age: "2 years" },
  { name: "WTF", about: "Things that make you go WTF. Mark it NSFW if it is, please.", readers: 61_870, age: "2 years" },
];

export const DEFAULT_SUB = SUBS[0];

export function subNamed(name: string | undefined) {
  return SUBS.find((s) => s.name.toLowerCase() === name?.toLowerCase());
}

/** The strip across the top of every page. */
export const SR_BAR = ["askreddit", "pics", "funny", "politics", "programming", "science", "worldnews", "wtf", "gaming", "technology", "iama", "linux", "reddit.com"];

/** Moderators, as listed in the sidebar. Two of them used to run things elsewhere. */
export const MODS = ["nick", "SYSOP_DALE", "ModeratelyModerate"];

/* ───────── What's hot (the listing under the submit form) ───────── */

export interface Hot {
  id: string;
  title: string;
  author: string;
  score: number;
  comments: number;
  /** Hours ago. */
  age: number;
}

export const HOT: Hot[] = [
  { id: "h1", title: "Is a hot dog a sandwich?", author: "markwallace08", score: 312, comments: 489, age: 6 },
  { id: "h2", title: "When they turn the Large Hadron Collider back on, will it actually make a black hole? Asking for a friend. (The friend is me.)", author: "worried_physics_minor", score: 287, comments: 341, age: 5 },
  { id: "h3", title: "What's the best free Linux distro for my mom's old laptop?", author: "ubuntu_or_bust", score: 198, comments: 212, age: 8 },
  { id: "h4", title: "Python or Ruby for my first programming language? Please don't start a flame war.", author: "nick", score: 156, comments: 403, age: 4 },
  { id: "h5", title: "How do I explain to my parents what reddit is?", author: "xX_kayleigh_Xx", score: 143, comments: 188, age: 9 },
  { id: "h6", title: "What's the most useful thing you learned on Wikipedia at 3am?", author: "cal_in_auckland", score: 121, comments: 97, age: 3 },
  { id: "h7", title: "My cat keeps knocking things off my desk. Is she trying to tell me something?", author: "lolcat_enthusiast", score: 98, comments: 76, age: 11 },
  { id: "h8", title: "What's the best way to cook bacon? (Yes, this matters.)", author: "bacon_is_a_vegetable", score: 90, comments: 131, age: 7 },
];

/* ───────── The other redditors in your thread ───────── */

export interface Cameo {
  id: string;
  author: string;
  /** null: [deleted], with no score. */
  score: number | null;
  text: string;
  /** Minutes before now that it was posted (it's always "just" posted). */
  ago: number;
  /** Shows once Arthur has replied this many times. */
  after: number;
  /** Behind "load more comments". */
  more?: boolean;
  replies?: Cameo[];
}

/**
 * Top-level comments that aren't the conversation. Written to fit any
 * question, because nobody in a big thread reads the post anyway.
 */
export const CAMEOS: Cameo[] = [
  {
    id: "c-kay",
    author: "xX_kayleigh_Xx",
    score: 9,
    text: "omg i was literally about to ask this :P",
    ago: 3,
    after: 1,
    replies: [{ id: "c-mark", author: "markwallace08", score: 4, text: "haha same. this is going in my status", ago: 2, after: 1 }],
  },
  {
    id: "c-nick",
    author: "nick",
    score: 21,
    text: "searched first. reddit search says 0 results, as usual. upvoted.\n\n/me ducks",
    ago: 4,
    after: 1,
  },
  {
    id: "c-daisy",
    author: "daisy31337",
    score: -6,
    text: "Uh-oh! :-) anyone here still use ICQ?? add me!!! UIN 31337",
    ago: 5,
    after: 2,
  },
  {
    id: "c-dale",
    author: "SYSOP_DALE",
    score: 14,
    text: "WE ANSWERED THIS ON MY BBS IN 1993. TOOK THREE DAYS AND A 2400 BAUD MODEM.\n\nYOU KIDS HAVE IT EASY.",
    ago: 2,
    after: 2,
    replies: [
      {
        id: "c-deleted",
        author: "[deleted]",
        score: null,
        text: "[deleted]",
        ago: 2,
        after: 2,
        replies: [{ id: "c-what", author: "throwaway_99", score: 3, text: "what did he say?", ago: 1, after: 2 }],
      },
    ],
  },
  {
    id: "c-cal",
    author: "cal_in_auckland",
    score: 6,
    text: "Good question! Sorry if it's a repost, reddit takes ages to load from New Zealand.",
    ago: 1,
    after: 3,
  },
  {
    id: "c-bacon",
    author: "bacon_is_a_vegetable",
    score: 3,
    text: "Upvoted for asking an actual question instead of posting another lolcat.",
    ago: 6,
    after: 1,
    more: true,
  },
  {
    id: "c-thesis",
    author: "grad_student_tears",
    score: 1,
    text: "I should be writing my thesis. So should everyone else in this thread, probably.",
    ago: 1,
    after: 1,
    more: true,
  },
];

/** The reply under Arthur's top comment that isn't yours. */
export const THIS: Cameo = { id: "c-this", author: "lurker_since_05", score: 2, text: "This.", ago: 1, after: 2 };

/** Comments at or below this are folded away. */
export const THRESHOLD = -4;

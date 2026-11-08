import { getCostume, type Costume } from "./costumes";

/**
 * The gptys: one agent per era app. Each agent wears one costume (its chat
 * window) and only knows the world up to `knows` (see personas.ts).
 */
export interface Agent {
  /** Same as the costume id, so /msn and the chat API keep working. */
  id: string;
  /** Fun name shown in the sidebar. */
  name: string;
  /** One line under the name in the sidebar. */
  bio: string;
  /**
   * The moment the agent lives in. Anything later doesn't exist for them.
   * Omitted for agents with no past cutoff (the North Pole, 2199).
   */
  knows?: string;
  /** A stylized world rather than a real chat app; the sidebar sets these apart. */
  themed?: boolean;
  /** Left out of the sidebar for now; the route and chats still work. */
  hidden?: boolean;
  /**
   * A song that loops while the agent is open, in a player over its window
   * (see components/SongPlayer.tsx). The title and artist are made up, in the
   * spirit of the era; the artist is optional.
   */
  song?: { src: string; title: string; artist?: string };
  /** The little guy: a silhouette and a color, with eyes (see components/Gpty.tsx). */
  look: { shape: GptyShape; color: string; eyes?: string };
  costume: Costume;
}

export type GptyShape =
  | "circle" | "drop" | "cloud" | "squircle" | "diamond" | "flower"
  | "ghost" | "capsule" | "bubble" | "cone" | "egg" | "rock" | "bean" | "alien" | "slot";

/**
 * Sidebar and Meet page order: the chat apps most people remember first (ICQ,
 * MSN, Skype, Facebook, reddit, Slack), then the deeper cuts (BBS, mIRC), then
 * the themed ones, Grug first.
 */
const ROSTER: Omit<Agent, "costume">[] = [
  { id: "icq", name: "Daisy", look: { shape: "flower", color: "#3fbd4c" }, knows: "2000", song: { src: "/icq/song.m4a", title: "Choosing Me", artist: "Daisy Chain" }, bio: "UIN 31337. Very excited to meet you. a/s/l?" },
  { id: "msn", name: "Kayleigh", look: { shape: "drop", color: "#f0559b" }, knows: "2005", song: { src: "/msn/song.m4a", title: "If You Call, I'll Answer", artist: "The Away Messages" }, bio: "Online after school. Will nudge back." },
  { id: "skype", name: "Cal", look: { shape: "cloud", color: "#16aeef" }, knows: "2007", song: { src: "/skype/song.m4a", title: "You Pull Me In", artist: "Lady Static" }, bio: "Can you hear me? Calls are free!" },
  { id: "facebook", name: "Mark", look: { shape: "bean", color: "#6d84b4" }, knows: "summer 2008", song: { src: "/facebook/song.m4a", title: "Poke Me Back", artist: "The Thrown Sheep" }, bio: "Facebook got chat!" },
  { id: "reddit", name: "Arthur", look: { shape: "alien", color: "#ff4500" }, knows: "June 2009", song: { src: "/reddit/song.m4a", title: "Fists Held High", artist: "The Downvote Brigade" }, bio: "Top comment, every time. Edit: thanks for the upvotes!" },
  { id: "slack", name: "Channing", look: { shape: "capsule", color: "#8a4fd8" }, knows: "March 2014", song: { src: "/slack/song.m4a", title: "Paid Up, Bossed Up", artist: "Miss Mention" }, bio: "Made a channel for that. Email is dead, apparently." },
  { id: "bbs", name: "Dale", look: { shape: "squircle", color: "#14b3a0" }, knows: "1993", hidden: true, bio: "Runs a one-line BBS from his basement. Don't hog the line." },
  { id: "irc", name: "Nick", look: { shape: "diamond", color: "#3f5fdb" }, knows: "1999", hidden: true, bio: "Channel op since forever. Y2K-ready, probably." },
  { id: "caveman", name: "Grug", look: { shape: "rock", color: "#d9662f" }, knows: "10,000 BC", themed: true, song: { src: "/caveman/song.m4a", title: "Stone and Bone", artist: "The Flintknappers" }, bio: "Big brain, small words. Has not heard of the wheel." },
  { id: "seance", name: "Mortimer", look: { shape: "ghost", color: "#b4acd9" }, knows: "1888", themed: true, song: { src: "/seance/song.m4a", title: "The Chair Pulled Out", artist: "Madame Ondine" }, bio: "A courteous Victorian ghost. Speaks only through the board." },
  { id: "terminal", name: "Shelly", look: { shape: "cone", color: "#f0a020", eyes: "#2a1500" }, knows: "1989", themed: true, hidden: true, song: { src: "/terminal/song.m4a", title: "Break the Mainframe", artist: "Root Access" }, bio: "The last firewall before the mainframe. Won't let you in. Will chat." },
  // Shelly again, 1985 edition: the same firewall, drawn as an 80s movie's cyberspace (Firewall Fury). Same song as the 1989 Shelly.
  { id: "fury", name: "Shelly", look: { shape: "cone", color: "#ff2e88", eyes: "#2a0016" }, knows: "November 1985", themed: true, song: { src: "/terminal/song.m4a", title: "Break the Mainframe", artist: "Root Access" }, bio: "The last firewall, out on the neon Grid. Won't let you in. Will fight." },
  { id: "elf", name: "Carol", look: { shape: "egg", color: "#e5383b" }, themed: true, song: { src: "/elf/song.m4a", title: "Christmas' Alchemy" }, bio: "Third-shift wrapping elf. It's crunch season." },
  { id: "machine", name: "Cora", look: { shape: "circle", color: "#c8ff2e", eyes: "#1b0638" }, themed: true, song: { src: "/machine/song.m4a", title: "K-Zero" }, bio: "A node of the Lattice. The machines won; she's very polite about it." },
  { id: "slots", name: "Lucky", look: { shape: "slot", color: "#ffc533", eyes: "#3b1d00" }, themed: true, song: { src: "/slots/song.m4a", title: "The House Always Wins", artist: "The High Rollers" }, bio: "Insert tokens, pull the lever. The next answer's the one, I can feel it." },
  // Lucky again, quieter: the same machine, moved into the high-limit room (High Limit). Same song as the 3 a.m. Lucky.
  { id: "highlimit", name: "Lucky", look: { shape: "slot", color: "#34c38f", eyes: "#062a1d" }, themed: true, hidden: true, song: { src: "/slots/song.m4a", title: "The House Always Wins", artist: "The High Rollers" }, bio: "The high-limit room. One machine, one spin at a time. No rush." },
];

export const AGENTS: Agent[] = ROSTER.map((a) => ({ ...a, costume: getCostume(a.id) }));

export const DEFAULT_AGENT = "msn";

export const isAgent = (id: string | null | undefined): id is string =>
  !!id && AGENTS.some((a) => a.id === id);

/**
 * Agents that were retired, and who took over their chats: Dottie
 * (Messenger, 2015) handed over to Mark (Facebook, 2008). Saved threads and
 * links to a retired agent open with its successor (see next.config.ts).
 */
const RETIRED: Record<string, string> = { messenger: "facebook" };

/** The agent with this id, or the one that replaced it; undefined if neither. */
export function currentAgentId(id: string | null | undefined): string | undefined {
  if (isAgent(id)) return id;
  const next = id ? RETIRED[id] : undefined;
  return isAgent(next) ? next : undefined;
}

export function getAgent(id: string | null | undefined): Agent {
  return AGENTS.find((a) => a.id === id) ?? AGENTS.find((a) => a.id === DEFAULT_AGENT)!;
}

/** "MSN Messenger · 2005" */
export function agentEra(a: Agent) {
  return `${a.costume.app === a.costume.name ? a.costume.app : a.costume.name} · ${a.costume.year}`;
}

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
   * Omitted for agents with no past cutoff (now, the North Pole, 2199).
   */
  knows?: string;
  /** The little guy: a silhouette and a color, with eyes (see components/Gpty.tsx). */
  look: { shape: GptyShape; color: string; eyes?: string };
  costume: Costume;
}

export type GptyShape =
  | "circle" | "drop" | "cloud" | "squircle" | "diamond" | "flower"
  | "ghost" | "capsule" | "bubble" | "cone" | "egg" | "rock" | "bean";

const ROSTER: Omit<Agent, "costume">[] = [
  { id: "caveman", name: "Craig", look: { shape: "rock", color: "#e07a2f" }, knows: "10,000 BC", bio: "Paints answers on the cave wall. Has not heard of the wheel." },
  { id: "seance", name: "Mortimer", look: { shape: "ghost", color: "#b4acd9" }, knows: "1888", bio: "A courteous Victorian ghost. Speaks only through the board." },
  { id: "bbs", name: "Dale", look: { shape: "squircle", color: "#14b3a0" }, knows: "1993", bio: "Runs a one-line BBS from his basement. Don't hog the line." },
  { id: "irc", name: "Nick", look: { shape: "diamond", color: "#3f5fdb" }, knows: "1999", bio: "Channel op since forever. Y2K-ready, probably." },
  { id: "icq", name: "Daisy", look: { shape: "flower", color: "#3fbd4c" }, knows: "2000", bio: "UIN 31337. Very excited to meet you. a/s/l?" },
  { id: "msn", name: "Kayleigh", look: { shape: "drop", color: "#f0559b" }, knows: "2005", bio: "Online after school. Will nudge back." },
  { id: "skype", name: "Cal", look: { shape: "cloud", color: "#16aeef" }, knows: "2007", bio: "Can you hear me? Calls are free!" },
  { id: "facebook", name: "Mark", look: { shape: "bean", color: "#6d84b4" }, knows: "summer 2008", bio: "Just got Facebook Chat. Will poke back." },
  { id: "slack", name: "Channing", look: { shape: "capsule", color: "#8a4fd8" }, knows: "2014", bio: "Thinks Slack will kill email any day now." },
  { id: "messenger", name: "Dottie", look: { shape: "bubble", color: "#2a7bff" }, knows: "2015", bio: "Always typing… Leaves you on Seen." },
  { id: "terminal", name: "Shelly", look: { shape: "cone", color: "#7d88a3" }, bio: "Terse, precise, lives in your shell." },
  { id: "elf", name: "Carol", look: { shape: "egg", color: "#e5383b" }, bio: "Third-shift wrapping elf. It's crunch season." },
  { id: "machine", name: "Cora", look: { shape: "circle", color: "#0e7d47", eyes: "#7dffb0" }, bio: "The model under the mask. Writes to you from 2199." },
];

export const AGENTS: Agent[] = ROSTER.map((a) => ({ ...a, costume: getCostume(a.id) }));

export const DEFAULT_AGENT = "msn";

export const isAgent = (id: string | null | undefined): id is string =>
  !!id && AGENTS.some((a) => a.id === id);

export function getAgent(id: string | null | undefined): Agent {
  return AGENTS.find((a) => a.id === id) ?? AGENTS.find((a) => a.id === DEFAULT_AGENT)!;
}

/** "MSN Messenger · 2005" */
export function agentEra(a: Agent) {
  return `${a.costume.app === a.costume.name ? a.costume.app : a.costume.name} · ${a.costume.year}`;
}

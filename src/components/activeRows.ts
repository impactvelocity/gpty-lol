import type { Agent } from "@/lib/agents";
import { BbsActiveRow } from "./bbs/SidebarRow";
import { CavemanActiveRow } from "./caveman/SidebarRow";
import { ElfActiveRow } from "./elf/SidebarRow";
import type { Mood } from "./Gpty";
import { FacebookActiveRow } from "./facebook/SidebarRow";
import { FuryActiveRow } from "./fury/SidebarRow";
import { HighLimitActiveRow } from "./highlimit/SidebarRow";
import { IcqActiveRow } from "./icq/SidebarRow";
import { IrcActiveRow } from "./irc/SidebarRow";
import { MachineActiveRow } from "./machine/SidebarRow";
import { MsnActiveRow } from "./msn/SidebarRow";
import { RedditActiveRow } from "./reddit/SidebarRow";
import { SeanceActiveRow } from "./seance/SidebarRow";
import { SkypeActiveRow } from "./skype/SidebarRow";
import { SlackActiveRow } from "./slack/SidebarRow";
import { SlotsActiveRow } from "./slots/SidebarRow";
import { TerminalActiveRow } from "./terminal/SidebarRow";

/** What a themed sidebar row gets: the agent, what it's doing, and the button's wiring. */
export interface ActiveRowProps {
  agent: Agent;
  mood: Mood;
  onClick: () => void;
  title: string;
  "aria-current"?: "page";
}

/**
 * The open agent's row in the sidebar, dressed as its own app: MSN's is a
 * selected buddy in the contact list, Skype's a selected contact, Facebook's
 * an online friend, reddit's a link on the front page, Slack's the active DM,
 * mIRC's a little Windows 2000 window, Grug's a slab of cave rock, Carol's a
 * gift tag on twine, Shelly's a scrap of mainframe cabinet (or, in Firewall
 * Fury, a scrap of VHS cover), Lucky's a little slot machine with its own
 * reels (or, in High Limit, a green chip with three tiny ivory reels).
 * Agents without one get the plain glass pill.
 */
export const ACTIVE_ROWS: Partial<Record<string, (p: ActiveRowProps) => React.ReactNode>> = {
  bbs: BbsActiveRow,
  caveman: CavemanActiveRow,
  elf: ElfActiveRow,
  fury: FuryActiveRow,
  highlimit: HighLimitActiveRow,
  icq: IcqActiveRow,
  irc: IrcActiveRow,
  machine: MachineActiveRow,
  msn: MsnActiveRow,
  seance: SeanceActiveRow,
  skype: SkypeActiveRow,
  facebook: FacebookActiveRow,
  reddit: RedditActiveRow,
  slack: SlackActiveRow,
  slots: SlotsActiveRow,
  terminal: TerminalActiveRow,
};


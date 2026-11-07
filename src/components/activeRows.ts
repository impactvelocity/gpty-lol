import type { Agent } from "@/lib/agents";
import type { Mood } from "./Gpty";
import { FacebookActiveRow, FacebookHoverBadge } from "./facebook/SidebarRow";
import { MsnActiveRow, MsnHoverBadge } from "./msn/SidebarRow";
import { SkypeActiveRow, SkypeHoverBadge } from "./skype/SidebarRow";

/** What a themed sidebar row gets: the agent, what it's doing, and the button's wiring. */
export interface ActiveRowProps {
  agent: Agent;
  mood: Mood;
  onClick: () => void;
  title: string;
  "aria-current"?: "page";
}

export interface HoverBadgeProps {
  agent: Agent;
}

/**
 * The open agent's row in the sidebar, dressed as its own app: MSN's is a
 * selected buddy in the contact list, Skype's a selected contact, Facebook's
 * an online friend. Agents
 * without one get the plain glass pill.
 */
export const ACTIVE_ROWS: Partial<Record<string, (p: ActiveRowProps) => React.ReactNode>> = {
  msn: MsnActiveRow,
  skype: SkypeActiveRow,
  facebook: FacebookActiveRow,
};

/**
 * What a row shows on hover, in the app's own style. Agents without one show
 * their app and year as plain text ("Cave Wall · 10,000 BC").
 */
export const HOVER_BADGES: Partial<Record<string, (p: HoverBadgeProps) => React.ReactNode>> = {
  msn: MsnHoverBadge,
  skype: SkypeHoverBadge,
  facebook: FacebookHoverBadge,
};

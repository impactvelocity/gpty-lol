import type { Costume } from "@/lib/costumes";
import { BbsLayout } from "./BbsLayout";
import { CavemanLayout } from "./CavemanLayout";
import { ElfLayout } from "./ElfLayout";
import { FacebookLayout } from "./FacebookLayout";
import { CleanLayout } from "./CleanLayout";
import { IcqLayout } from "./IcqLayout";
import { IrcLayout } from "./IrcLayout";
import { MachineLayout } from "./MachineLayout";
import { MsnLayout } from "./MsnLayout";
import { RedditLayout } from "./RedditLayout";
import { SeanceLayout } from "./SeanceLayout";
import { SkypeLayout } from "./SkypeLayout";
import { SlackLayout } from "./SlackLayout";
import { SlotsLayout } from "./SlotsLayout";
import { TerminalLayout } from "./TerminalLayout";
import type { LayoutProps } from "./types";

export const LAYOUTS: Record<Costume["layout"], (p: LayoutProps) => React.ReactNode> = {
  clean: CleanLayout,
  caveman: CavemanLayout,
  seance: SeanceLayout,
  bbs: BbsLayout,
  irc: IrcLayout,
  icq: IcqLayout,
  msn: MsnLayout,
  skype: SkypeLayout,
  facebook: FacebookLayout,
  reddit: RedditLayout,
  slack: SlackLayout,
  terminal: TerminalLayout,
  elf: ElfLayout,
  machine: MachineLayout,
  slots: SlotsLayout,
};

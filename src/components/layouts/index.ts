import type { Costume } from "@/lib/costumes";
import { BbsLayout } from "./BbsLayout";
import { CavemanLayout } from "./CavemanLayout";
import { ElfLayout } from "./ElfLayout";
import { CleanLayout } from "./CleanLayout";
import { IcqLayout } from "./IcqLayout";
import { IrcLayout } from "./IrcLayout";
import { MachineLayout } from "./MachineLayout";
import { MessengerLayout } from "./MessengerLayout";
import { MsnLayout } from "./MsnLayout";
import { SeanceLayout } from "./SeanceLayout";
import { SkypeLayout } from "./SkypeLayout";
import { SlackLayout } from "./SlackLayout";
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
  slack: SlackLayout,
  messenger: MessengerLayout,
  terminal: TerminalLayout,
  elf: ElfLayout,
  machine: MachineLayout,
};

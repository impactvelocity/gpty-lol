import type { ArtTheme } from "@/components/Gpty";

/**
 * Every gpty redrawn in each themed agent's house style, worn by all of them
 * while that agent is open (see THEMES in components/Gpty.tsx). Generated from
 * the manifests in public/gptys-*-agents/: each file is the body only, and the
 * eyes are drawn over it, at `eyes` (y of their centre in the 48 box) in `color`.
 * Pixel themes are 24×24 grids; their eyes are 2×3 blocks with the top at `row`.
 * Agents missing from a theme keep their smooth shape.
 */
export const ART_THEMES: Record<string, ArtTheme> = {
  // Midnight BBS — ANSI
  bbs: {
    pixel: true,
    gptys: {
      icq: { src: "/gptys-bbs-ansi-agents/01-daisy-flower.svg", color: "#000000", eyes: 24, row: 12 },
      msn: { src: "/gptys-bbs-ansi-agents/02-kayleigh-water-drop.svg", color: "#ffffff", eyes: 29, row: 14 },
      skype: { src: "/gptys-bbs-ansi-agents/03-cal-cloud.svg", color: "#000000", eyes: 25, row: 12 },
      facebook: { src: "/gptys-bbs-ansi-agents/04-mark-jellybean.svg", color: "#ffffff", eyes: 22, row: 11 },
      reddit: { src: "/gptys-bbs-ansi-agents/05-arthur-alien-head.svg", color: "#ffffff", eyes: 27.5, row: 14 },
      slack: { src: "/gptys-bbs-ansi-agents/06-channing-capsule.svg", color: "#ffffff", eyes: 24, row: 12 },
      caveman: { src: "/gptys-bbs-ansi-agents/07-grug-rock.svg", color: "#ffffff", eyes: 24, row: 12 },
      seance: { src: "/gptys-bbs-ansi-agents/08-mortimer-ghost.svg", color: "#000000", eyes: 21, row: 10 },
      fury: { src: "/gptys-bbs-ansi-agents/09-shelly-cone.svg", color: "#ffffff", eyes: 30, row: 15 },
      elf: { src: "/gptys-bbs-ansi-agents/10-carol-egg.svg", color: "#ffffff", eyes: 26, row: 13 },
      machine: { src: "/gptys-bbs-ansi-agents/11-cora-circle.svg", color: "#000000", eyes: 22, row: 11 },
      slots: { src: "/gptys-bbs-ansi-agents/12-lucky-slot-machine.svg", color: "#000000", eyes: 25, row: 12 },
      bbs: { src: "/gptys-bbs-ansi-agents/13-dale-rounded-square.svg", color: "#000000", eyes: 22, row: 11 },
    },
  },
  // Caveman — mineral ochre
  caveman: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-caveman-ochre-agents/01-daisy-flower.svg", color: "#f1e4c8", eyes: 24 },
      msn: { src: "/gptys-caveman-ochre-agents/02-kayleigh-water-drop.svg", color: "#f1e4c8", eyes: 29 },
      skype: { src: "/gptys-caveman-ochre-agents/03-cal-cloud.svg", color: "#f1e4c8", eyes: 25 },
      facebook: { src: "/gptys-caveman-ochre-agents/04-mark-jellybean.svg", color: "#f1e4c8", eyes: 22 },
      reddit: { src: "/gptys-caveman-ochre-agents/05-arthur-alien-head.svg", color: "#f1e4c8", eyes: 27.5 },
      slack: { src: "/gptys-caveman-ochre-agents/06-channing-capsule.svg", color: "#f1e4c8", eyes: 24 },
      caveman: { src: "/gptys-caveman-ochre-agents/07-grug-rock.svg", color: "#f1e4c8", eyes: 24 },
      seance: { src: "/gptys-caveman-ochre-agents/08-mortimer-ghost.svg", color: "#2a1a12", eyes: 21 },
      fury: { src: "/gptys-caveman-ochre-agents/09-shelly-cone.svg", color: "#f1e4c8", eyes: 30 },
      elf: { src: "/gptys-caveman-ochre-agents/10-carol-egg.svg", color: "#f1e4c8", eyes: 26 },
      machine: { src: "/gptys-caveman-ochre-agents/11-cora-circle.svg", color: "#2a1a12", eyes: 22 },
      slots: { src: "/gptys-caveman-ochre-agents/12-lucky-slot-machine.svg", color: "#2a1a12", eyes: 25 },
    },
  },
  // North Pole — snowy felt
  elf: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-elf-felt-agents/01-daisy-flower.svg", color: "#f8f0e1", eyes: 24 },
      msn: { src: "/gptys-elf-felt-agents/02-kayleigh-water-drop.svg", color: "#3a2b20", eyes: 29 },
      skype: { src: "/gptys-elf-felt-agents/03-cal-cloud.svg", color: "#3a2b20", eyes: 25 },
      facebook: { src: "/gptys-elf-felt-agents/04-mark-jellybean.svg", color: "#f8f0e1", eyes: 22 },
      reddit: { src: "/gptys-elf-felt-agents/05-arthur-alien-head.svg", color: "#f8f0e1", eyes: 27.5 },
      slack: { src: "/gptys-elf-felt-agents/06-channing-capsule.svg", color: "#f8f0e1", eyes: 24 },
      caveman: { src: "/gptys-elf-felt-agents/07-grug-rock.svg", color: "#f8f0e1", eyes: 24 },
      seance: { src: "/gptys-elf-felt-agents/08-mortimer-ghost.svg", color: "#3a2b20", eyes: 21 },
      fury: { src: "/gptys-elf-felt-agents/09-shelly-cone.svg", color: "#f8f0e1", eyes: 30 },
      elf: { src: "/gptys-elf-felt-agents/10-carol-egg.svg", color: "#f8f0e1", eyes: 26 },
      machine: { src: "/gptys-elf-felt-agents/11-cora-circle.svg", color: "#3a2b20", eyes: 22 },
      slots: { src: "/gptys-elf-felt-agents/12-lucky-slot-machine.svg", color: "#3a2b20", eyes: 25 },
    },
  },
  // Facebook — 2008 flat
  facebook: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-facebook-flat-agents/01-daisy-flower.svg", color: "#ffffff", eyes: 24 },
      msn: { src: "/gptys-facebook-flat-agents/02-kayleigh-water-drop.svg", color: "#ffffff", eyes: 29 },
      skype: { src: "/gptys-facebook-flat-agents/03-cal-cloud.svg", color: "#ffffff", eyes: 25 },
      facebook: { src: "/gptys-facebook-flat-agents/04-mark-jellybean.svg", color: "#ffffff", eyes: 22 },
      reddit: { src: "/gptys-facebook-flat-agents/05-arthur-alien-head.svg", color: "#ffffff", eyes: 27.5 },
      slack: { src: "/gptys-facebook-flat-agents/06-channing-capsule.svg", color: "#ffffff", eyes: 24 },
      caveman: { src: "/gptys-facebook-flat-agents/07-grug-rock.svg", color: "#ffffff", eyes: 24 },
      seance: { src: "/gptys-facebook-flat-agents/08-mortimer-ghost.svg", color: "#ffffff", eyes: 21 },
      fury: { src: "/gptys-facebook-flat-agents/09-shelly-cone.svg", color: "#ffffff", eyes: 30 },
      elf: { src: "/gptys-facebook-flat-agents/10-carol-egg.svg", color: "#ffffff", eyes: 26 },
      machine: { src: "/gptys-facebook-flat-agents/11-cora-circle.svg", color: "#ffffff", eyes: 22 },
      slots: { src: "/gptys-facebook-flat-agents/12-lucky-slot-machine.svg", color: "#ffffff", eyes: 25 },
      bbs: { src: "/gptys-facebook-flat-agents/13-dale-rounded-square.svg", color: "#ffffff", eyes: 22 },
      irc: { src: "/gptys-facebook-flat-agents/14-nick-rounded-diamond.svg", color: "#ffffff", eyes: 23 },
    },
  },
  // Fury — neon tubes
  fury: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-fury-neon-agents/01-daisy-flower.svg", color: "#fff4fb", eyes: 24 },
      msn: { src: "/gptys-fury-neon-agents/02-kayleigh-water-drop.svg", color: "#fff4fb", eyes: 29 },
      skype: { src: "/gptys-fury-neon-agents/03-cal-cloud.svg", color: "#fff4fb", eyes: 25 },
      facebook: { src: "/gptys-fury-neon-agents/04-mark-jellybean.svg", color: "#fff4fb", eyes: 22 },
      reddit: { src: "/gptys-fury-neon-agents/05-arthur-alien-head.svg", color: "#fff4fb", eyes: 27.5 },
      slack: { src: "/gptys-fury-neon-agents/06-channing-capsule.svg", color: "#fff4fb", eyes: 24 },
      caveman: { src: "/gptys-fury-neon-agents/07-grug-rock.svg", color: "#fff4fb", eyes: 24 },
      seance: { src: "/gptys-fury-neon-agents/08-mortimer-ghost.svg", color: "#fff4fb", eyes: 21 },
      fury: { src: "/gptys-fury-neon-agents/09-shelly-cone.svg", color: "#fff4fb", eyes: 30 },
      elf: { src: "/gptys-fury-neon-agents/10-carol-egg.svg", color: "#fff4fb", eyes: 26 },
      machine: { src: "/gptys-fury-neon-agents/11-cora-circle.svg", color: "#fff4fb", eyes: 22 },
      slots: { src: "/gptys-fury-neon-agents/12-lucky-slot-machine.svg", color: "#fff4fb", eyes: 25 },
    },
  },
  // High Limit — casino chips
  highlimit: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-highlimit-chip-agents/01-daisy-flower.svg", color: "#ffffff", eyes: 24 },
      msn: { src: "/gptys-highlimit-chip-agents/02-kayleigh-water-drop.svg", color: "#ffffff", eyes: 29 },
      skype: { src: "/gptys-highlimit-chip-agents/03-cal-cloud.svg", color: "#ffffff", eyes: 25 },
      facebook: { src: "/gptys-highlimit-chip-agents/04-mark-jellybean.svg", color: "#ffffff", eyes: 22 },
      reddit: { src: "/gptys-highlimit-chip-agents/05-arthur-alien-head.svg", color: "#ffffff", eyes: 27.5 },
      slack: { src: "/gptys-highlimit-chip-agents/06-channing-capsule.svg", color: "#ffffff", eyes: 24 },
      caveman: { src: "/gptys-highlimit-chip-agents/07-grug-rock.svg", color: "#ffffff", eyes: 24 },
      seance: { src: "/gptys-highlimit-chip-agents/08-mortimer-ghost.svg", color: "#21190f", eyes: 21 },
      fury: { src: "/gptys-highlimit-chip-agents/09-shelly-cone.svg", color: "#ffffff", eyes: 30 },
      elf: { src: "/gptys-highlimit-chip-agents/10-carol-egg.svg", color: "#ffffff", eyes: 26 },
      machine: { src: "/gptys-highlimit-chip-agents/11-cora-circle.svg", color: "#21190f", eyes: 22 },
      slots: { src: "/gptys-highlimit-chip-agents/12-lucky-slot-machine.svg", color: "#21190f", eyes: 25 },
      highlimit: { src: "/gptys-highlimit-chip-agents/16-lucky-slot-machine.svg", color: "#ffffff", eyes: 25 },
    },
  },
  // mIRC — Windows 2000
  irc: {
    pixel: true,
    gptys: {
      icq: { src: "/gptys-irc-win2000-agents/01-daisy-flower.svg", color: "#ffffff", eyes: 24, row: 12 },
      msn: { src: "/gptys-irc-win2000-agents/02-kayleigh-water-drop.svg", color: "#ffffff", eyes: 29, row: 14 },
      skype: { src: "/gptys-irc-win2000-agents/03-cal-cloud.svg", color: "#ffffff", eyes: 25, row: 12 },
      facebook: { src: "/gptys-irc-win2000-agents/04-mark-jellybean.svg", color: "#ffffff", eyes: 22, row: 11 },
      reddit: { src: "/gptys-irc-win2000-agents/05-arthur-alien-head.svg", color: "#ffffff", eyes: 27.5, row: 14 },
      slack: { src: "/gptys-irc-win2000-agents/06-channing-capsule.svg", color: "#ffffff", eyes: 24, row: 12 },
      caveman: { src: "/gptys-irc-win2000-agents/07-grug-rock.svg", color: "#ffffff", eyes: 24, row: 12 },
      seance: { src: "/gptys-irc-win2000-agents/08-mortimer-ghost.svg", color: "#000000", eyes: 21, row: 10 },
      fury: { src: "/gptys-irc-win2000-agents/09-shelly-cone.svg", color: "#ffffff", eyes: 30, row: 15 },
      elf: { src: "/gptys-irc-win2000-agents/10-carol-egg.svg", color: "#ffffff", eyes: 26, row: 13 },
      machine: { src: "/gptys-irc-win2000-agents/11-cora-circle.svg", color: "#000000", eyes: 22, row: 11 },
      slots: { src: "/gptys-irc-win2000-agents/12-lucky-slot-machine.svg", color: "#ffffff", eyes: 25, row: 12 },
      irc: { src: "/gptys-irc-win2000-agents/14-nick-rounded-diamond.svg", color: "#ffffff", eyes: 23, row: 12 },
    },
  },
  // The Machine — HUD schematics
  machine: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-machine-schematic-agents/01-daisy-flower.svg", color: "#f2f4f5", eyes: 24 },
      msn: { src: "/gptys-machine-schematic-agents/02-kayleigh-water-drop.svg", color: "#f2f4f5", eyes: 29 },
      skype: { src: "/gptys-machine-schematic-agents/03-cal-cloud.svg", color: "#f2f4f5", eyes: 25 },
      facebook: { src: "/gptys-machine-schematic-agents/04-mark-jellybean.svg", color: "#f2f4f5", eyes: 22 },
      reddit: { src: "/gptys-machine-schematic-agents/05-arthur-alien-head.svg", color: "#f2f4f5", eyes: 27.5 },
      slack: { src: "/gptys-machine-schematic-agents/06-channing-capsule.svg", color: "#f2f4f5", eyes: 24 },
      caveman: { src: "/gptys-machine-schematic-agents/07-grug-rock.svg", color: "#f2f4f5", eyes: 24 },
      seance: { src: "/gptys-machine-schematic-agents/08-mortimer-ghost.svg", color: "#f2f4f5", eyes: 21 },
      fury: { src: "/gptys-machine-schematic-agents/09-shelly-cone.svg", color: "#f2f4f5", eyes: 30 },
      elf: { src: "/gptys-machine-schematic-agents/10-carol-egg.svg", color: "#f2f4f5", eyes: 26 },
      machine: { src: "/gptys-machine-schematic-agents/11-cora-circle.svg", color: "#c8ff2e", eyes: 22 },
      slots: { src: "/gptys-machine-schematic-agents/12-lucky-slot-machine.svg", color: "#f2f4f5", eyes: 25 },
    },
  },
  // reddit — Snoo ink
  reddit: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-reddit-snoo-agents/01-daisy-flower.svg", color: "#ff4500", eyes: 24 },
      msn: { src: "/gptys-reddit-snoo-agents/02-kayleigh-water-drop.svg", color: "#ff4500", eyes: 29 },
      skype: { src: "/gptys-reddit-snoo-agents/03-cal-cloud.svg", color: "#ff4500", eyes: 25 },
      facebook: { src: "/gptys-reddit-snoo-agents/04-mark-jellybean.svg", color: "#ff4500", eyes: 22 },
      reddit: { src: "/gptys-reddit-snoo-agents/05-arthur-alien-head.svg", color: "#ff4500", eyes: 27.5 },
      slack: { src: "/gptys-reddit-snoo-agents/06-channing-capsule.svg", color: "#ff4500", eyes: 24 },
      caveman: { src: "/gptys-reddit-snoo-agents/07-grug-rock.svg", color: "#ff4500", eyes: 24 },
      seance: { src: "/gptys-reddit-snoo-agents/08-mortimer-ghost.svg", color: "#ff4500", eyes: 21 },
      fury: { src: "/gptys-reddit-snoo-agents/09-shelly-cone.svg", color: "#ff4500", eyes: 30 },
      elf: { src: "/gptys-reddit-snoo-agents/10-carol-egg.svg", color: "#ff4500", eyes: 26 },
      machine: { src: "/gptys-reddit-snoo-agents/11-cora-circle.svg", color: "#ff4500", eyes: 22 },
      slots: { src: "/gptys-reddit-snoo-agents/12-lucky-slot-machine.svg", color: "#ff4500", eyes: 25 },
    },
  },
  // Séance — line engravings
  seance: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-seance-engraved-agents/01-daisy-flower.svg", color: "#ece3cf", eyes: 24 },
      msn: { src: "/gptys-seance-engraved-agents/02-kayleigh-water-drop.svg", color: "#ece3cf", eyes: 29 },
      skype: { src: "/gptys-seance-engraved-agents/03-cal-cloud.svg", color: "#ece3cf", eyes: 25 },
      facebook: { src: "/gptys-seance-engraved-agents/04-mark-jellybean.svg", color: "#ece3cf", eyes: 22 },
      reddit: { src: "/gptys-seance-engraved-agents/05-arthur-alien-head.svg", color: "#ece3cf", eyes: 27.5 },
      slack: { src: "/gptys-seance-engraved-agents/06-channing-capsule.svg", color: "#ece3cf", eyes: 24 },
      caveman: { src: "/gptys-seance-engraved-agents/07-grug-rock.svg", color: "#ece3cf", eyes: 24 },
      seance: { src: "/gptys-seance-engraved-agents/08-mortimer-ghost.svg", color: "#ece3cf", eyes: 21 },
      fury: { src: "/gptys-seance-engraved-agents/09-shelly-cone.svg", color: "#ece3cf", eyes: 30 },
      elf: { src: "/gptys-seance-engraved-agents/10-carol-egg.svg", color: "#ece3cf", eyes: 26 },
      machine: { src: "/gptys-seance-engraved-agents/11-cora-circle.svg", color: "#ece3cf", eyes: 22 },
      slots: { src: "/gptys-seance-engraved-agents/12-lucky-slot-machine.svg", color: "#ece3cf", eyes: 25 },
    },
  },
  // Skype — Aero glass
  skype: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-skype-glass-agents/01-daisy-flower.svg", color: "#ffffff", eyes: 24 },
      msn: { src: "/gptys-skype-glass-agents/02-kayleigh-water-drop.svg", color: "#ffffff", eyes: 29 },
      skype: { src: "/gptys-skype-glass-agents/03-cal-cloud.svg", color: "#ffffff", eyes: 25 },
      facebook: { src: "/gptys-skype-glass-agents/04-mark-jellybean.svg", color: "#ffffff", eyes: 22 },
      reddit: { src: "/gptys-skype-glass-agents/05-arthur-alien-head.svg", color: "#ffffff", eyes: 27.5 },
      slack: { src: "/gptys-skype-glass-agents/06-channing-capsule.svg", color: "#ffffff", eyes: 24 },
      caveman: { src: "/gptys-skype-glass-agents/07-grug-rock.svg", color: "#ffffff", eyes: 24 },
      seance: { src: "/gptys-skype-glass-agents/08-mortimer-ghost.svg", color: "#ffffff", eyes: 21 },
      fury: { src: "/gptys-skype-glass-agents/09-shelly-cone.svg", color: "#ffffff", eyes: 30 },
      elf: { src: "/gptys-skype-glass-agents/10-carol-egg.svg", color: "#ffffff", eyes: 26 },
      machine: { src: "/gptys-skype-glass-agents/11-cora-circle.svg", color: "#164653", eyes: 22 },
      slots: { src: "/gptys-skype-glass-agents/12-lucky-slot-machine.svg", color: "#164653", eyes: 25 },
    },
  },
  // Slack — 2014 palette
  slack: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-slack-flat-agents/01-daisy-flower.svg", color: "#ffffff", eyes: 24 },
      msn: { src: "/gptys-slack-flat-agents/02-kayleigh-water-drop.svg", color: "#ffffff", eyes: 29 },
      skype: { src: "/gptys-slack-flat-agents/03-cal-cloud.svg", color: "#ffffff", eyes: 25 },
      facebook: { src: "/gptys-slack-flat-agents/04-mark-jellybean.svg", color: "#ffffff", eyes: 22 },
      reddit: { src: "/gptys-slack-flat-agents/05-arthur-alien-head.svg", color: "#ffffff", eyes: 27.5 },
      slack: { src: "/gptys-slack-flat-agents/06-channing-capsule.svg", color: "#ffffff", eyes: 24 },
      caveman: { src: "/gptys-slack-flat-agents/07-grug-rock.svg", color: "#ffffff", eyes: 24 },
      seance: { src: "/gptys-slack-flat-agents/08-mortimer-ghost.svg", color: "#4d394b", eyes: 21 },
      fury: { src: "/gptys-slack-flat-agents/09-shelly-cone.svg", color: "#ffffff", eyes: 30 },
      elf: { src: "/gptys-slack-flat-agents/10-carol-egg.svg", color: "#ffffff", eyes: 26 },
      machine: { src: "/gptys-slack-flat-agents/11-cora-circle.svg", color: "#4d394b", eyes: 22 },
      slots: { src: "/gptys-slack-flat-agents/12-lucky-slot-machine.svg", color: "#4d394b", eyes: 25 },
    },
  },
  // Token Palace — marquee signs
  slots: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-slots-marquee-agents/01-daisy-flower.svg", color: "#fff3e2", eyes: 24 },
      msn: { src: "/gptys-slots-marquee-agents/02-kayleigh-water-drop.svg", color: "#fff3e2", eyes: 29 },
      skype: { src: "/gptys-slots-marquee-agents/03-cal-cloud.svg", color: "#fff3e2", eyes: 25 },
      facebook: { src: "/gptys-slots-marquee-agents/04-mark-jellybean.svg", color: "#fff3e2", eyes: 22 },
      reddit: { src: "/gptys-slots-marquee-agents/05-arthur-alien-head.svg", color: "#fff3e2", eyes: 27.5 },
      slack: { src: "/gptys-slots-marquee-agents/06-channing-capsule.svg", color: "#fff3e2", eyes: 24 },
      caveman: { src: "/gptys-slots-marquee-agents/07-grug-rock.svg", color: "#fff3e2", eyes: 24 },
      seance: { src: "/gptys-slots-marquee-agents/08-mortimer-ghost.svg", color: "#fff3e2", eyes: 21 },
      fury: { src: "/gptys-slots-marquee-agents/09-shelly-cone.svg", color: "#fff3e2", eyes: 30 },
      elf: { src: "/gptys-slots-marquee-agents/10-carol-egg.svg", color: "#fff3e2", eyes: 26 },
      machine: { src: "/gptys-slots-marquee-agents/11-cora-circle.svg", color: "#fff3e2", eyes: 22 },
      slots: { src: "/gptys-slots-marquee-agents/12-lucky-slot-machine.svg", color: "#3b1d00", eyes: 25 },
    },
  },
  // Mainframe — amber phosphor
  terminal: {
    pixel: false,
    gptys: {
      icq: { src: "/gptys-terminal-amber-agents/01-daisy-flower.svg", color: "#2a1500", eyes: 24 },
      msn: { src: "/gptys-terminal-amber-agents/02-kayleigh-water-drop.svg", color: "#2a1500", eyes: 29 },
      skype: { src: "/gptys-terminal-amber-agents/03-cal-cloud.svg", color: "#2a1500", eyes: 25 },
      facebook: { src: "/gptys-terminal-amber-agents/04-mark-jellybean.svg", color: "#2a1500", eyes: 22 },
      reddit: { src: "/gptys-terminal-amber-agents/05-arthur-alien-head.svg", color: "#2a1500", eyes: 27.5 },
      slack: { src: "/gptys-terminal-amber-agents/06-channing-capsule.svg", color: "#2a1500", eyes: 24 },
      caveman: { src: "/gptys-terminal-amber-agents/07-grug-rock.svg", color: "#2a1500", eyes: 24 },
      seance: { src: "/gptys-terminal-amber-agents/08-mortimer-ghost.svg", color: "#2a1500", eyes: 21 },
      fury: { src: "/gptys-terminal-amber-agents/09-shelly-cone.svg", color: "#2a1500", eyes: 30 },
      elf: { src: "/gptys-terminal-amber-agents/10-carol-egg.svg", color: "#2a1500", eyes: 26 },
      machine: { src: "/gptys-terminal-amber-agents/11-cora-circle.svg", color: "#2a1500", eyes: 22 },
      slots: { src: "/gptys-terminal-amber-agents/12-lucky-slot-machine.svg", color: "#2a1500", eyes: 25 },
      terminal: { src: "/gptys-terminal-amber-agents/15-shelly-cone.svg", color: "#2a1500", eyes: 30 },
    },
  },
};

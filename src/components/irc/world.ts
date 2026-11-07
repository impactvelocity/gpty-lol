/**
 * GptyNet, 1999: the server, the regulars in #gpty, their hosts and quit
 * messages, the channel list, the MOTD and gptybot's answers. Pure data and
 * small helpers; the mIRC window (layouts/IrcLayout.tsx) brings it to life.
 */

export const SERVER = "irc.gpty.lol";
export const NETWORK = "GptyNet";
export const PORT = 6667;
/** Your nick until you /nick. */
export const GUEST = "guest";
export const BOT = "gptybot";

/** The mIRC palette (Ctrl+K), colors 0 to 15. */
export const PALETTE = [
  "#ffffff", "#000000", "#00007f", "#009300", "#ff0000", "#7f0000", "#9c009c", "#fc7f00",
  "#ffff00", "#00fc00", "#009393", "#00ffff", "#0000fc", "#ff00ff", "#7f7f7f", "#d2d2d2",
];

/** Someone else in #gpty. `mode` is @ (op) or + (voice). */
export interface Regular {
  nick: string;
  mode?: "@" | "+";
  host: string;
  real: string;
  /** What their client answers to CTCP VERSION. */
  version: string;
  /** Services and bots never leave. */
  stays?: boolean;
  /** Their nick while away (`sk8rboi|afk`). */
  away?: string;
}

export const REGULARS: Regular[] = [
  { nick: "ChanServ", mode: "@", host: "services@services.gpty.net", real: "Channel Services", version: "GptyServ 4.2", stays: true },
  { nick: BOT, mode: "@", host: "~eggdrop@shell.gpty.net", real: "eggdrop v1.3.28 (Y2K patched)", version: "eggdrop v1.3.28", stays: true },
  { nick: "DJ_Winamp", mode: "+", host: "~dj@dialup-209-31.mindspring.com", real: "it really whips", version: "mIRC32 v5.61 + Winamp np script", away: "DJ_Winamp|ripping" },
  { nick: "CyberGrrl", mode: "+", host: "~grrl@ppp-98-12.earthlink.net", real: "girls rule the net", version: "PIRCH98 v1.0" },
  { nick: "Neo_1999", host: "~neo@cable-24-7-1.home.com", real: "there is no spoon", version: "BitchX-75p3+ // it's 1999. do you know where your bits are?" },
  { nick: "sk8rboi", host: "~sk8@aol-tnt-12.proxy.aol.com", real: "skate or die", version: "AOL 4.0 + mIRC32 v5.51", away: "sk8rboi|afk" },
  { nick: "xXLeEtHaXoRXx", host: "~1337@cs-dorm-4.state.edu", real: "i r 1337", version: "mIRC32 v5.61 + h4x0r script v6.66 (ph34r)" },
  { nick: "Mr_Y2K", host: "~bunker@rural-ppp-3.prodigy.net", real: "the end is nigh (jan 1)", version: "mIRC32 v5.61 (Y2K COMPLIANT!!!)", away: "Mr_Y2K|canning" },
  { nick: "^Lurker^", host: "~lurk@nowhere.isp.net", real: "...", version: "mIRC32 v5.02" },
  { nick: "slackware_steve", host: "~steve@linuxbox.isp.net", real: "linux 2.2.13 ftw", version: "BitchX-1.0c16 on Linux 2.2.13 (i686)" },
  { nick: "BuffyFan97", host: "~sunnydale@webtv.net", real: "grr. argh.", version: "WebTV IRC 2.5" },
  { nick: "dialup_dan", host: "~dan@56k-dialup-77.netzero.net", real: "mom needs the phone at 8", version: "mIRC32 v5.61", away: "dialup_dan|dinner" },
  { nick: "tamagotchi_t", host: "~tama@ppp-4.compuserve.com", real: "feed me", version: "Microsoft Comic Chat 2.5" },
  { nick: "pokefan151", host: "~ash@dial-up-12.juno.com", real: "gotta catch em all", version: "mIRC32 v5.6" },
];

export const regular = (nick: string) =>
  REGULARS.find((r) => r.nick.toLowerCase() === nick.toLowerCase() || r.away?.toLowerCase() === nick.toLowerCase());

/** Who's in the channel when you join (the rest drift in later). */
export const STARTERS = ["ChanServ", BOT, "DJ_Winamp", "CyberGrrl", "Neo_1999", "sk8rboi", "xXLeEtHaXoRXx", "Mr_Y2K", "^Lurker^", "slackware_steve", "BuffyFan97"];

/** Nick's own details, for /whois and CTCP. */
export const NICK = {
  host: "~nick@cable-modem-24-1-99.home.com",
  real: "nick (been here since '94)",
  channels: "@#gpty @#y2k #winamp #slackware #help",
  since: "Thu Sep 1 03:12:44 1994",
  version: "mIRC32 v5.61 + nickscript 3.1 (Y2K ready, probably)",
  homepage: "http://www.geocities.com/SiliconValley/Lakes/1999/",
};

/** Each channel gets its own topic, like walking into a different night. `{y2k}` becomes the days left. */
export const TOPICS = [
  "welcome to #gpty | ask anything | no flooding | y2k in {y2k} days and counting",
  "#gpty | be excellent to each other | mp3s via DCC only, don't ask in channel",
  "#gpty: where the cool kids /join | no caps, no flooding, no warez",
  "welcome! | nick knows everything (allegedly) | ascii art in moderation pls",
  "#gpty | y2k bunker sign-ups with Mr_Y2K | be nice to newbies",
  "#gpty | it's not lag, it's your modem | don't ask to ask, just ask",
];

export const PART_MSGS = ["brb", "dinner", "mom needs the phone", "Leaving", "bed. school tmrw", "rebooting, win98 crashed again"];
export const QUIT_MSGS = [
  "Ping timeout",
  "Connection reset by peer",
  "Read error: Connection reset by peer",
  "Quit: mom picked up the phone",
  "Quit: Leaving",
  "Quit: BSOD",
  "Quit: going to check the Y2K bunker",
  "Excess Flood",
];

/** For /np: what Winamp is playing. */
export const SONGS = [
  { file: "Eiffel_65_-_Blue_(Da_Ba_Dee).mp3", len: "3:40" },
  { file: "Lou_Bega_-_Mambo_No_5.mp3", len: "3:39" },
  { file: "Smash_Mouth_-_All_Star.mp3", len: "3:20" },
  { file: "Santana_ft_Rob_Thomas_-_Smooth.mp3", len: "4:55" },
  { file: "TLC_-_No_Scrubs.mp3", len: "3:34" },
  { file: "Blink-182_-_All_the_Small_Things.mp3", len: "2:52" },
  { file: "Fatboy_Slim_-_Praise_You.mp3", len: "5:23" },
  { file: "Len_-_Steal_My_Sunshine.mp3", len: "4:25" },
  { file: "Moby_-_Porcelain.mp3", len: "4:01" },
  { file: "Sugar_Ray_-_Every_Morning.mp3", len: "3:40" },
];

/** What "DCC Send" tries to send, in turn. None of it ever arrives. */
export const OUTBOX = [
  { name: "Eiffel_65_-_Blue_(Da_Ba_Dee).mp3", size: "3.4 MB" },
  { name: "dancing_baby.avi", size: "1.1 MB" },
  { name: "y2k_survival_guide.txt", size: "48 KB" },
  { name: "my_homepage_backup.zip", size: "812 KB" },
  { name: "hamster_dance.wav", size: "620 KB" },
];

/** /list. Most are invite-only, full or banned when you try. */
export const CHANNELS: { name: string; users: number; topic: string }[] = [
  { name: "#mp3", users: 412, topic: "++ mp3s ++ dcc only ++ read the rules or get kicked" },
  { name: "#teens", users: 388, topic: "13-19 only. asl?" },
  { name: "#hottub", users: 240, topic: "relax ;)" },
  { name: "#y2k", users: 199, topic: "it's coming. are you ready? | canned goods thread" },
  { name: "#linux", users: 176, topic: "rtfm. no really. | kernel 2.2.13 is out" },
  { name: "#help", users: 141, topic: "don't ask to ask, just ask" },
  { name: "#pokemon", users: 133, topic: "gotta catch em all | trades over the link cable" },
  { name: "#quake", users: 96, topic: "q3test is out | clan matches tonight" },
  { name: "#matrix", users: 88, topic: "there is no spoon" },
  { name: "#winamp", users: 54, topic: "skins, plugins, and that llama" },
  { name: "#beanies", users: 23, topic: "beanie baby trading | no fakes, no tag damage" },
  { name: "#gpty", users: 14, topic: "you are here" },
];

/** Why /join doesn't work, by mode. */
export const JOIN_FAILS = [
  "Cannot join channel (+i: invite only)",
  "Cannot join channel (+k: needs a key)",
  "Cannot join channel (+l: channel is full)",
  "Cannot join channel (+b: you are banned)",
];

export const EIGHT_BALL = [
  "It is certain.", "Without a doubt.", "You may rely on it.", "Yes, definitely.", "Most likely.",
  "Outlook good.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.", "Better not tell you now.",
  "Cannot predict now (Y2K).", "Don't count on it.", "My reply is no.", "My sources say no.", "Very doubtful.",
];

/** The Message of the Day, ASCII art and all. */
export const MOTD = [
  "  ____   ____    _____  __   __  _   _   _____   _____",
  " / ___| |  _ \\  |_   _| \\ \\ / / | \\ | | | ____| |_   _|",
  "| |  _  | |_) |   | |    \\ V /  |  \\| | |  _|     | |",
  "| |_| | |  __/    | |     | |   | |\\  | | |___    | |",
  " \\____| |_|       |_|     |_|   |_| \\_| |_____|   |_|",
  "",
  "- welcome to GptyNet, est. 1994",
  "- this server: irc.gpty.lol (pentium ii 400mhz, 128mb ram)",
  "- rules: no flooding, no clones, no warez. be excellent.",
  "- our servers are Y2K compliant. probably.",
  "- homepage: http://www.geocities.com/SiliconValley/Lakes/1999/",
  "- type /help in a channel if you're new. we were all newbies once.",
];

/* ───────── Helpers ───────── */

/** A stable pick from a list, so each channel keeps its own topic and crowd. */
export function pick<T>(list: readonly T[], seed: string, salt = 0) {
  let h = salt * 2654435761;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** [21:07] */
export function stamp(at: number) {
  const d = new Date(at || Date.now());
  return `[${pad2(d.getHours())}:${pad2(d.getMinutes())}]`;
}

/** Today, but in 1999: same month, day and time. */
export function in1999(now: number) {
  const d = new Date(now);
  d.setFullYear(1999);
  return d;
}

/** "Sat Nov 6 21:07:44 1999", like a server would say it. */
export function serverDate(now: number) {
  const d = in1999(now);
  const [wd, mon, day] = d.toDateString().split(" ");
  return `${wd} ${mon} ${Number(day)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} 1999`;
}

/** Time left until midnight on Jan 1, 2000 (in-world, that's always the coming New Year). */
export function y2kLeft(now: number) {
  const d = new Date(now);
  if (d.getMonth() === 0 && d.getDate() === 1) return 0;
  return new Date(d.getFullYear() + 1, 0, 1).getTime() - now;
}

/** "55d 02:11:09" */
export function countdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86400);
  return `${days}d ${pad2(Math.floor((s % 86400) / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

/** 4210 -> "01:10:10" */
export function hms(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

/** Days you've been "evaluating" mIRC: since its first release, in 1999. */
export function trialDays(now: number) {
  return Math.floor((in1999(now).getTime() - new Date(1995, 1, 28).getTime()) / 86_400_000);
}

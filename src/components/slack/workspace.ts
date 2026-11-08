/**
 * The workspace around your conversation: Paradigm Dynamics, a mid-size
 * company that "switched off email" in March 2014 and moved everyone onto
 * Slack. Your chats with Channing are channels Channing made for you; every
 * other channel, DM and group here is scripted, to look around in (they have
 * no composer, just a way back to Channing).
 */

export const TEAM = {
  name: "Paradigm Dynamics",
  domain: "paradigmdynamics.slack.com",
};

/** Where the day stands, for scripted timestamps: "9:14 AM". */
export type Stamp = string;

export type PersonId =
  | "slackbot" | "channing" | "marcus" | "linda" | "gary" | "brad" | "priya" | "devon" | "tiff"
  | "heroku" | "github" | "jenkins";

export interface Person {
  id: PersonId;
  /** Real name, for the team directory. */
  name: string;
  title: string;
  /** One line under their name in the directory. */
  says: string;
  presence: "active" | "away";
  /** Tile color for the drawn avatar. */
  color: string;
  bot?: boolean;
}

export const PEOPLE: Record<PersonId, Person> = {
  slackbot: { id: "slackbot", name: "slackbot", title: "Bot", says: "I try to be helpful. Mostly I just remind people.", presence: "active", color: "#9b5c95", bot: true },
  channing: { id: "channing", name: "Channing Rhodes", title: "Associate, Internal Comms & Synergy", says: "Self-appointed Slack admin. Made 41 channels this week.", presence: "active", color: "#8a4fd8" },
  marcus: { id: "marcus", name: "Marcus Hale", title: "CEO", says: "Let's make 2014 the year we shift the paradigm.", presence: "away", color: "#2a80b9" },
  linda: { id: "linda", name: "Linda Okafor", title: "General Counsel", says: "Everything you post here is discoverable.", presence: "active", color: "#3b6e5a" },
  gary: { id: "gary", name: "Gary Pruitt", title: "IT (all of it)", says: "Please stop installing things.", presence: "active", color: "#7a7f86" },
  brad: { id: "brad", name: "Brad Kowalski", title: "VP Sales", says: "Crushing it. Will email you the details.", presence: "away", color: "#d9822b" },
  priya: { id: "priya", name: "Priya Raman", title: "Design Lead", says: "It's flat. It has a long shadow. It's very 2014.", presence: "active", color: "#e0457b" },
  devon: { id: "devon", name: "Devon Marsh", title: "Engineering", says: "Ships on Fridays. Sorry.", presence: "active", color: "#3eb991" },
  tiff: { id: "tiff", name: "Tiffany Chu", title: "People & Culture", says: "Lunch orders close at 11:45. I mean it.", presence: "away", color: "#e9a820" },
  heroku: { id: "heroku", name: "heroku", title: "Integration", says: "Deploys things.", presence: "active", color: "#6b5bb5", bot: true },
  github: { id: "github", name: "github", title: "Integration", says: "Pushes things.", presence: "active", color: "#333840", bot: true },
  jenkins: { id: "jenkins", name: "jenkins", title: "Integration", says: "Breaks things.", presence: "active", color: "#c0392b", bot: true },
};

/** The people in Direct Messages, in the sidebar's order. */
export const DMS: PersonId[] = ["slackbot", "channing", "brad", "devon", "gary", "linda", "marcus", "priya", "tiff"];

/** A scripted message in a channel you peek at. */
export interface Scripted {
  who: PersonId;
  at: Stamp;
  text: string;
  file?: { name: string; size: string; kind: "pptx" | "psd" | "doc" | "xls" };
}

export interface Room {
  id: string;
  kind: "channel" | "group" | "dm";
  /** Channel or group name, or the person for a DM. */
  name: string;
  purpose: string;
  members: number;
  /** Unread count when the window opens. */
  unread: number;
  /** Mentions you: a red badge. */
  mention?: boolean;
  /** Keeps getting busier while you watch (one more every n seconds). */
  climbs?: number;
  /** Someone in here is always typing. */
  typing?: PersonId;
  messages: Scripted[];
}

export const ROOMS: Room[] = [
  {
    id: "general",
    kind: "channel",
    name: "general",
    purpose: "Company-wide announcements. Please keep it on-topic (Brad).",
    members: 47,
    unread: 4,
    mention: true,
    messages: [
      { who: "marcus", at: "8:02 AM", text: "Team: one month *email-free* today! :tada:\nAll internal communication happens here now. Let's make 2014 the year we shift the paradigm. :paradigm:" },
      { who: "brad", at: "8:05 AM", text: "love it. sent you an email with my thoughts" },
      { who: "linda", at: "8:11 AM", text: "Friendly reminder that everything posted in Slack is discoverable. Everything. :grimacing:" },
      { who: "channing", at: "8:30 AM", text: "@channel I made 14 new channels this morning! Please join all of them :raised_hands: :raised_hands:" },
      { who: "marcus", at: "8:31 AM", text: "Who just used @channel" },
      { who: "channing", at: "8:31 AM", text: ":no_mouth:" },
      { who: "tiff", at: "9:40 AM", text: "Reminder: the kombucha tap is for *everyone*. @you that includes you, have some!" },
    ],
  },
  {
    id: "random",
    kind: "channel",
    name: "random",
    purpose: "Non-work banter and water cooler conversation.",
    members: 47,
    unread: 312,
    climbs: 6,
    messages: [
      { who: "tiff", at: "10:12 AM", text: "who microwaved fish. it's Tuesday. WHY" },
      { who: "devon", at: "10:14 AM", text: "got the 2048 tile. I will not be taking questions at this time" },
      { who: "brad", at: "10:15 AM", text: "flappy bird is gone forever and my high score was 112. brad out" },
      { who: "priya", at: "10:21 AM", text: "is anyone else singing Let It Go in the design pod or is it just me :snowflake:" },
      { who: "gary", at: "10:22 AM", text: "it's not just you. it is never just you" },
      { who: "devon", at: "10:30 AM", text: "Ellen's selfie is now the most retweeted thing ever and somehow it also took down the guest wifi" },
      { who: "channing", at: "10:31 AM", text: "/giphy happy" },
      { who: "brad", at: "10:33 AM", text: "can someone email me the link to this channel" },
    ],
  },
  {
    id: "standup",
    kind: "channel",
    name: "standup",
    purpose: "Daily standup at 9:15 sharp. Sitting is allowed. Barely.",
    members: 12,
    unread: 0,
    messages: [
      { who: "devon", at: "9:15 AM", text: "Yesterday: fixed the build\nToday: the build\nBlockers: the build" },
      { who: "priya", at: "9:16 AM", text: "Yesterday: logo v46\nToday: logo v47\nBlockers: needs to \"pop\"" },
      { who: "brad", at: "9:16 AM", text: "Yesterday: crushed it\nToday: crushing it\nBlockers: none. crushing it" },
      { who: "channing", at: "9:17 AM", text: "Yesterday: made channels :white_check_mark:\nToday: more channels\nBlockers: Brad keeps emailing me" },
      { who: "gary", at: "9:21 AM", text: "Today: Windows XP. Tomorrow: Windows XP. Blockers: Windows XP" },
    ],
  },
  {
    id: "q1-synergy",
    kind: "channel",
    name: "q1-synergy",
    purpose: "Aligning on Q1 synergies before the offsite.",
    members: 9,
    unread: 2,
    messages: [
      { who: "marcus", at: "11:02 AM", text: "Let's circle back on the synergy deck before the offsite." },
      { who: "brad", at: "11:03 AM", text: "Can we take this offline?" },
      { who: "linda", at: "11:03 AM", text: "We are offline. We're in Slack." },
      { who: "marcus", at: "11:04 AM", text: "Then let's take it online." },
      { who: "priya", at: "11:20 AM", text: "", file: { name: "Synergy_Deck_FINAL_v3_USE_THIS_ONE.pptx", size: "48 MB", kind: "pptx" } },
      { who: "channing", at: "11:21 AM", text: ":chart_with_upwards_trend: :rocket: :100: :synergy:" },
    ],
  },
  {
    id: "deploys",
    kind: "channel",
    name: "deploys",
    purpose: "Robots talking to robots. Humans: read only.",
    members: 6,
    unread: 9,
    climbs: 23,
    messages: [
      { who: "github", at: "4:51 PM", text: "[paradigm-web] 3 new commits pushed to `master` by devon\n`a1f3c9e` fix the fix\n`77b02d1` actually fix the fix\n`e0c41aa` Revert \"actually fix the fix\"" },
      { who: "jenkins", at: "4:53 PM", text: "paradigm-web #1337 *FAILURE* after 2 min 13 sec" },
      { who: "devon", at: "4:53 PM", text: "it's fine" },
      { who: "heroku", at: "4:58 PM", text: "devon deployed paradigm-web *v214* to production (Friday, 4:58 PM)" },
      { who: "devon", at: "4:59 PM", text: "ok have a good weekend everyone" },
    ],
  },
  {
    id: "design",
    kind: "channel",
    name: "design",
    purpose: "Pixels, opinions, and opinions about pixels.",
    members: 8,
    unread: 1,
    messages: [
      { who: "priya", at: "2:04 PM", text: "", file: { name: "logo_v47_FINAL_final_REAL.psd", size: "212 MB", kind: "psd" } },
      { who: "marcus", at: "2:10 PM", text: "Love it. Can it pop more?" },
      { who: "priya", at: "2:11 PM", text: ":expressionless:" },
      { who: "marcus", at: "2:12 PM", text: "Also can we make it flat? Everyone's going flat now. Like iOS 7" },
      { who: "priya", at: "2:12 PM", text: "it is flat. it has a long shadow. it is extremely 2014" },
    ],
  },
  {
    id: "it-helpdesk",
    kind: "channel",
    name: "it-helpdesk",
    purpose: "Have you tried turning it off and on again?",
    members: 47,
    unread: 1,
    typing: "gary",
    messages: [
      { who: "gary", at: "9:00 AM", text: "Reminder: Windows XP support ends *April 8*. Please upgrade. I am begging. I am not well." },
      { who: "brad", at: "9:44 AM", text: "my computer is making a noise" },
      { who: "gary", at: "9:44 AM", text: "what kind of noise" },
      { who: "brad", at: "9:51 AM", text: "a bad one" },
      { who: "tiff", at: "10:02 AM", text: "is the wifi password still paradigm2014! with the exclamation mark" },
      { who: "gary", at: "10:02 AM", text: "please stop posting the wifi password in channels" },
    ],
  },
  {
    id: "lunch",
    kind: "channel",
    name: "lunch",
    purpose: "Orders close at 11:45. Tiff means it.",
    members: 41,
    unread: 0,
    messages: [
      { who: "tiff", at: "11:02 AM", text: "Burrito run at 12:30! Reply with your order :fork_and_knife:" },
      { who: "devon", at: "11:04 AM", text: "the usual" },
      { who: "brad", at: "11:05 AM", text: "what is the usual" },
      { who: "devon", at: "11:05 AM", text: "nobody knows anymore" },
      { who: "channing", at: "11:09 AM", text: "Made #lunch-tuesdays #lunch-wednesdays and #lunch-thursdays for this! :thumbsup:" },
      { who: "tiff", at: "11:09 AM", text: "please no" },
    ],
  },
  {
    id: "leadership-offsite",
    kind: "group",
    name: "leadership-offsite",
    purpose: "Napa. Do not mention Napa.",
    members: 4,
    unread: 0,
    messages: [
      { who: "marcus", at: "Yesterday", text: "Reminder: we do not mention Napa in public channels." },
      { who: "brad", at: "Yesterday", text: "napa :wine_glass:" },
      { who: "marcus", at: "Yesterday", text: "Brad" },
      { who: "channing", at: "Yesterday", text: "hi! I invited myself :simple_smile:" },
    ],
  },
  {
    id: "linda-bday",
    kind: "group",
    name: "linda-bday",
    purpose: "Shhh.",
    members: 23,
    unread: 3,
    messages: [
      { who: "tiff", at: "1:12 PM", text: "Cake is in the fridge behind the kombucha. DO NOT tell Linda :birthday:" },
      { who: "channing", at: "1:14 PM", text: "added everyone to make sure nobody misses it!! :tada:" },
      { who: "linda", at: "1:15 PM", text: "Thank you, everyone. I will act surprised." },
      { who: "tiff", at: "1:15 PM", text: "CHANNING" },
    ],
  },
  // Direct messages (channing's is your conversation, so it isn't here).
  {
    id: "dm-slackbot",
    kind: "dm",
    name: "slackbot",
    purpose: "",
    members: 2,
    unread: 1,
    messages: [
      { who: "slackbot", at: "8:00 AM", text: "Hello! I'm slackbot. I'll help you get set up on Slack. I'm only a bot, but I'm a very determined bot." },
      { who: "slackbot", at: "8:00 AM", text: "First things first: what should your teammates call you?" },
      { who: "slackbot", at: "8:01 AM", text: "Just checking in! You still haven't told me your name. Take your time. I'll be here. I'm always here." },
    ],
  },
  {
    id: "dm-brad",
    kind: "dm",
    name: "brad",
    purpose: "",
    members: 2,
    unread: 2,
    messages: [
      { who: "brad", at: "9:03 AM", text: "hey quick q" },
      { who: "brad", at: "9:03 AM", text: "can you send me what you said in slack as an email? easier for me" },
    ],
  },
  {
    id: "dm-devon",
    kind: "dm",
    name: "devon",
    purpose: "",
    members: 2,
    unread: 0,
    messages: [
      { who: "devon", at: "Yesterday", text: "if prod goes down, I'm in a meeting" },
      { who: "devon", at: "Yesterday", text: "if prod stays up, I fixed it" },
    ],
  },
  {
    id: "dm-gary",
    kind: "dm",
    name: "gary",
    purpose: "",
    members: 2,
    unread: 0,
    typing: "gary",
    messages: [
      { who: "gary", at: "8:45 AM", text: "Did you install something called \"Slack\" on your work laptop" },
      { who: "gary", at: "8:46 AM", text: "Never mind. Marcus says everyone has to. I'll add it to the list." },
    ],
  },
  {
    id: "dm-linda",
    kind: "dm",
    name: "linda",
    purpose: "",
    members: 2,
    unread: 0,
    messages: [
      { who: "linda", at: "Yesterday", text: "Please don't post contracts in #random." },
      { who: "linda", at: "Yesterday", text: "Or #lunch. Or anywhere. Contracts go in email. Which we no longer have. I'm working on it." },
    ],
  },
  {
    id: "dm-marcus",
    kind: "dm",
    name: "marcus",
    purpose: "",
    members: 2,
    unread: 0,
    messages: [{ who: "marcus", at: "Monday", text: "Do you have 5 minutes? (It's not bad.)" }],
  },
  {
    id: "dm-priya",
    kind: "dm",
    name: "priya",
    purpose: "",
    members: 2,
    unread: 0,
    messages: [
      { who: "priya", at: "2:15 PM", text: "if Marcus asks, v47 is the final one" },
      { who: "priya", at: "2:15 PM", text: "it is not the final one" },
    ],
  },
  {
    id: "dm-tiff",
    kind: "dm",
    name: "tiff",
    purpose: "",
    members: 2,
    unread: 0,
    messages: [{ who: "tiff", at: "11:46 AM", text: "you missed the lunch order. again. :disappointed:" }],
  },
];

export const roomById = (id: string | null) => ROOMS.find((r) => r.id === id);
export const dmRoom = (p: PersonId) => ROOMS.find((r) => r.kind === "dm" && r.name === p);

/** The sidebar says there are more channels than you can see. Always. */
export const MORE_CHANNELS = 23;

/** The loading screen's quote of the day, team-made like the real ones were. */
export const QUOTES: { text: string; by: string }[] = [
  { text: "Reply-all is a choice.", by: "Linda, Legal" },
  { text: "Every channel is a fresh start.", by: "Channing" },
  { text: "Have you tried turning it off and on again?", by: "Gary, IT" },
  { text: "Synergy is just two people in a channel.", by: "Marcus, CEO" },
  { text: "Inbox zero. Forever zero.", by: "Channing" },
  { text: "Crushing it.", by: "Brad, Sales" },
  { text: "It's flat. It has a long shadow.", by: "Priya, Design" },
  { text: "Orders close at 11:45.", by: "Tiff, People & Culture" },
];

/** Slash commands as they were in early 2014 (no /remind yet). */
export const COMMANDS: { cmd: string; args: string; does: string }[] = [
  { cmd: "/giphy", args: "[text]", does: "Post a random GIF to the channel" },
  { cmd: "/me", args: "[your text]", does: "Display action text" },
  { cmd: "/shrug", args: "[your message]", does: "Appends ¯\\_(ツ)_/¯ to your message" },
  { cmd: "/away", args: "", does: "Toggle your \"away\" status" },
  { cmd: "/topic", args: "[text]", does: "Set the channel topic" },
  { cmd: "/who", args: "", does: "List users in the current channel" },
  { cmd: "/collapse", args: "", does: "Collapse all inline images and video" },
  { cmd: "/expand", args: "", does: "Expand all inline images and video" },
  { cmd: "/leave", args: "", does: "Leave a channel" },
];

/** What "Upload a file" tries to upload, in turn. None of it fits. */
export const UPLOADS = [
  { name: "Q1_Synergy_Deck_FINAL_v4.pptx", size: "48.2 MB" },
  { name: "team_offsite_photos_NAPA.zip", size: "1.9 GB" },
  { name: "expense_report_feb_REAL.xls", size: "212 KB" },
  { name: "org_chart_v12_do_not_share.pdf", size: "3.4 MB" },
];

/** People who mention you, for the Recent Mentions pane. */
export const MENTIONS: { who: PersonId; where: string; at: Stamp; text: string }[] = [
  { who: "tiff", where: "#general", at: "9:40 AM", text: "Reminder: the kombucha tap is for *everyone*. @you that includes you, have some!" },
  { who: "brad", where: "@brad", at: "9:03 AM", text: "can you send me what you said in slack as an email? easier for me" },
  { who: "channing", where: "#general", at: "8:30 AM", text: "@channel I made 14 new channels this morning! Please join all of them :raised_hands:" },
];

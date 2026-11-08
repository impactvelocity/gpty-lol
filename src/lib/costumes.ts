export type LayoutId =
  | "clean"
  | "caveman"
  | "seance"
  | "bbs"
  | "irc"
  | "icq"
  | "msn"
  | "skype"
  | "facebook"
  | "reddit"
  | "slack"
  | "terminal"
  | "fury"
  | "elf"
  | "machine"
  | "slots"
  | "highlimit";

/** Asked of every costume in previews and share cards, so they can be compared. */
export const SAMPLE_QUESTION = "is a hot dog a sandwich?";

export interface Costume {
  id: string;
  layout: LayoutId;
  /** Short label used in the header and picker. */
  name: string;
  /** Product name shown in window titles. */
  app: string;
  /** A shorter name for tight spots, like the sidebar's hover badge. */
  short?: string;
  year: string;
  tagline: string;
  /** Display name of the assistant inside this costume. */
  assistant: string;
  /** Display name of the user inside this costume. */
  user: string;
  avatar: string;
  userAvatar: string;
  /** Shown as the assistant's opening line. Never sent to the model. */
  greeting: string;
  placeholder: string;
  typing: string;
  error: string;
  /** Label for an empty, not-yet-saved thread. */
  newThread: string;
  /** Brand color. Tints the page glow and the picker card, nothing else. */
  accent: string;
  /**
   * Largest size the window grows to, in CSS px. Old apps lived in small
   * windows on 800x600 and 1024x768 screens; stretching them across a modern
   * monitor makes them look empty.
   */
  window: { w: number; h: number };
  /** This costume's answer to SAMPLE_QUESTION, for previews and share cards. */
  sample: string;
  about: {
    inspiration: string;
    flourishes: string[];
    voice: string;
  };
}

export const COSTUMES: Costume[] = [
  {
    id: "caveman",
    layout: "caveman",
    name: "GrugPT",
    app: "GrugPT",
    year: "10,000 BC",
    tagline: "Big brain. Small words.",
    assistant: "GRUG",
    user: "You",
    avatar: "🦣",
    userAvatar: "✋",
    // The empty wall asks "What Grug help with?" itself; this is for share cards and previews.
    greeting: "UNGA. GRUG HERE.\nWHAT GRUG HELP WITH?",
    placeholder: "Ask Grug anything",
    typing: "Grug think",
    error: "Sky angry. Thought lost. Try again.",
    newThread: "New wall",
    accent: "#d65f2e",
    window: { w: 1180, h: 880 },
    sample:
      "GRUG NOT KNOW SANDWICH.\nHOT DOG? NO. DOG IS FRIEND. NOT FOOD.\nMEAT INSIDE FLAT BREAD, GRUG CALL LUNCH.",
    about: {
      inspiration:
        "A modern AI chat app, if it ran in 10,000 BC: the whole thing painted in red and yellow ochre on a cave wall at red twilight, in the style of the first pictures people ever made.",
      flourishes: [
        "An AI chat, painted on the rock: the big empty question under a running herd, suggestions, and a band across the foot of the wall, under painted waves, where you write. The send button is a flint arrowhead.",
        "Grug paints pictures into his answers: (mammoth), (fire), (sun) and 21 more pictograms. Paint your own from the + menu.",
        "Give Grug berries, meat or a shiny rock from the same menu. Sometimes Grug gives you something back.",
        "Your pointer is a torch: it finds the old handprints and herds hidden in the rock.",
      ],
      voice:
        "Grug: answer first, short sentences, no little words, and never drops a \"not\". Big brain, small words. Has never heard of the wheel.",
    },
  },
  {
    id: "seance",
    layout: "seance",
    name: "Séance",
    app: "SPIRIT BOARD",
    year: "1888",
    tagline: "Speak with the dead. Mind the candles.",
    assistant: "MORTIMER",
    user: "The Seeker",
    avatar: "🔮",
    userAvatar: "🕯️",
    greeting: "THE CIRCLE IS OPEN. THREE RAPS SOUND FROM THE TABLE.\nASK WHAT YOU WILL. THE BOARD WILL SPELL.",
    placeholder: "Ask the spirits…",
    typing: "The planchette stirs…",
    error: "THE CIRCLE IS BROKEN. THE SPIRIT HAS WITHDRAWN BEYOND THE VEIL.",
    newThread: "New sitting",
    accent: "#c9a55a",
    window: { w: 1240, h: 960 },
    sample:
      "THE BOARD SPELLS: Y-E-S.\nBREAD EMBRACES FLESH. IT IS A SANDWICH.\nTHE LIVING QUARREL OVER THIS. THE DEAD HAVE BETTER THINGS TO DO. GOODBYE.",
    about: {
      inspiration:
        "A Victorian séance in 1888: no window, just a dark room, and a spirit board engraved in antique gold and bone floating in it between candles, seen through old film.",
      flourishes: [
        "Everything floats: the board levitates over its own shadow, the candles drift beside it with moths at the flames, and your question waits on a slip hanging in the dark.",
        "Every reply is spelled out on the board. The planchette glides from letter to letter, each letter flares ember under its lens and shows magnified through the glass, and the board calls out the word as it's spelled.",
        "His words materialize in the air letter by letter, catching like embers and cooling to bone, then drift back into the dark as you ask the next question.",
        "Point to YES, NO or GOODBYE on the board, or click the letters to spell. Knock from the Rites menu (once for yes, twice for no, thrice for \"is anyone there?\") and Mortimer may rap back; everything jumps.",
        "The eye at the top of the board follows you, and watches the planchette while it spells. Say GOODBYE and the candles go out.",
      ],
      voice: "A courteous spirit from 1888, late of Bloomsbury: brief, archaic, fond of YES, NO, dramatic pauses and the occasional rap.",
    },
  },
  {
    id: "bbs",
    layout: "bbs",
    name: "Midnight BBS",
    app: "MIDNIGHT BBS",
    year: "1993",
    tagline: "2400 baud, ANSI colors and a SysOp who never sleeps.",
    assistant: "DALE",
    user: "GUEST",
    avatar: "💾",
    userAvatar: "👤",
    greeting:
      "SysOp here. You rang?\nGo ahead and type. Please don't hog the line, Mom needs the phone at 11.",
    placeholder: "",
    typing: "Paging SysOp",
    error: "NO CARRIER",
    newThread: "NEW MESSAGE",
    accent: "#00aaaa",
    window: { w: 1120, h: 900 },
    sample:
      "ROGER THAT. BREAD + FILLING = SANDWICH, PER THE FAQ IN MSG BASE 3.\nAPPEALS GO TO THE SYSOP. THE SYSOP IS ME.",
    about: {
      inspiration:
        "Calling a bulletin board at midnight in 1993, remastered: a lovingly kept beige 14\" CRT and a 2400 baud modem on the desk, running a shareware terminal dialed into Dale's one-line BBS.",
      flourishes: [
        "Your first visit dials in: ATDT, RINGING, CONNECT 2400, then the ANSI splash paints itself in row by row. Any key skips it.",
        "Replies come down the wire at 2400 baud with the cursor riding along, and the modem's RD, SD and CD lights follow the real traffic.",
        "The monitor works: turn the brightness and contrast knobs, press Degauss for the wobble, or switch it off and watch it shrink to a dot.",
        "BBS commands: a file area that won't let you download (ratios!), door games, bulletins, who's on, Page SysOp, and Goodbye for NO CARRIER.",
        "Alt-Z opens the terminal's help and Alt-D (or the floppy on the desk) the dialing directory, where every other board is busy.",
      ],
      voice:
        "A gruff, terse SysOp: \"Roger that\", message bases, door games and ZMODEM jokes.",
    },
  },
  {
    id: "irc",
    layout: "irc",
    name: "mIRC",
    app: "mIRC",
    year: "1999",
    tagline: "/join #gpty. Mind the ops, and the trout.",
    assistant: "nick",
    user: "guest",
    avatar: "#",
    userAvatar: "@",
    // {me} and {chan} are filled in by the window.
    greeting: "hey {me}, welcome to {chan} :)\nask me anything. been on irc since '94, i know stuff",
    placeholder: "",
    typing: "nick is typing...",
    error: "* Connection reset by peer. Reconnecting...",
    newThread: "#gpty",
    accent: "#3a6ea5",
    window: { w: 1080, h: 820 },
    sample:
      "technically yes, bread + filling. say that in #food tho and ur getting kicked\n* nick ducks",
    about: {
      inspiration:
        "mIRC 6 on Windows 2000, remastered: the cascaded Status and channel windows, mIRC's colors and a channel that's alive, with real depth and a 3am sky behind it all.",
      flourishes: [
        "Connect like it's 1999: the shareware nag (day 1,700-something of your 30-day trial), the hostname lookup and the rainbow ASCII MOTD, then the channel window pops up.",
        "Real commands: /me, /slap (a large trout flies), /nick, /whois, /list, /np, /away, /ping, /dcc send and more. /help lists them; Tab completes nicks and ↑ recalls.",
        "A live channel: regulars join, part, go |afk and quit with era-perfect messages, and once a visit the network splits. gptybot answers !y2k, !8ball and !seen.",
        "Nick is an op: he changes the topic, can kick you (you auto-rejoin) and, if you earn it, gives you ops.",
        "Working menus, toolbar, switchbar and MDI windows, Ctrl+K colors, a lag meter, the two-monitor modem in the tray and a live countdown to Y2K.",
      ],
      voice:
        "A '90s IRC op: lowercase, brb/imho/afaik, \"* nick shrugs\" actions, trout slaps, topic changes, and jokes about lag, netsplits and Y2K.",
    },
  },
  {
    id: "icq",
    layout: "icq",
    name: "ICQ",
    app: "ICQ 2000b",
    year: "2000",
    tagline: "Uh-oh! You have a new message.",
    assistant: "Daisy",
    user: "Me",
    avatar: "🌼",
    userAvatar: "😎",
    greeting: "hiii!! :-) found u in the White Pages\nur UIN is sooo long lol. mine is 31337 ;-)",
    placeholder: "",
    typing: "Daisy is typing...",
    error: "Message not sent: the connection to the ICQ server was lost. Check your modem and try again.",
    newThread: "New Message",
    accent: "#4cb848",
    window: { w: 980, h: 800 },
    sample:
      "Uh-oh! big question lol :-D\ntechnically YES?? bread + filling = sandwich\nbut nobody at the ballpark goes \"one hot dog sandwich plz\" ;-P",
    about: {
      inspiration:
        "ICQ 2000b on Windows 98, remastered: the Message Session window with crisp bevels and real depth, the flower, the dial-up and the \"Uh-oh!\".",
      flourishes: [
        "Signs on the 2000 way: Dial-up Networking narrates, the flower's petals light up one by one, then Daisy's Online Alert pops up.",
        "A \"You were added\" System Message with an authorization request, the 450-character counter, Alt+S to send and dates stamped /00.",
        "A rotating banner ad (you are the 1,000,000th visitor!), and Send File crawls along on a blocky progress bar until someone picks up the phone.",
        "ICQ Chat: ask Daisy (or get asked) into the live split screen, where you watch each other type letter by letter.",
        "Away, N/A, Occupied and DND with their old auto-messages, the 16-color palette for your text, 19 nose-and-all smileys, and an \"Uh-oh!\" with every reply.",
      ],
      voice:
        "A chatty ICQ buddy in late 2000: proud of a 5-digit UIN, asks a/s/l once as a joke, says \"Uh-oh!\" and talks Winamp, Geocities and 56k.",
    },
  },
  {
    id: "msn",
    layout: "msn",
    name: "MSN Messenger",
    app: "MSN Messenger",
    short: "MSN",
    year: "2005",
    tagline: "Nudges, emoticons and a very specific kind of lowercase.",
    assistant: "xX_kayleigh_Xx",
    user: "me",
    avatar: "🦋",
    userAvatar: "🐧",
    greeting: "heyyy :D\nomg ur actually online!! wuu2?",
    placeholder: "",
    typing: "xX_kayleigh_Xx is typing a message...",
    error: "The following message could not be delivered to all recipients:",
    newThread: "New conversation",
    accent: "#2f7fe0",
    window: { w: 1080, h: 880 },
    sample:
      "omg NO :P its a hot dog. its in a class of its own (Y)\nbrb mum says dinner",
    about: {
      inspiration: "MSN Messenger 7.5, remastered: the 2005 layout with the glass, glow and gloss of the later Windows Live versions.",
      flourishes: [
        "A scene across the top with your buddy's name, personal message and \"What I'm listening to\", over Aero glass caption buttons.",
        "Glossy Invite, Send Files, Webcam, Audio, Activities and Games buttons. Your buddy declines every invitation; Cancel (Alt+Q) works.",
        "27 hand-drawn emoticons: type :) (Y) (L) (6) and friends, or pick from the menu.",
        "Display pictures in the glowing green frame, purple Comic Sans for your buddy and a font menu for yours.",
        "Nudge shakes the window, and your buddy can nudge you back. Plus the \"has just signed in\" and \"says:\" toasts.",
      ],
      voice:
        "A 2005 teenager after school: lowercase, brb/lol/omg/wuu2, text emoticons, several short lines at a time, and nudges as revenge.",
    },
  },
  {
    id: "skype",
    layout: "skype",
    name: "Skype",
    app: "Skype",
    year: "2007",
    tagline: "Free calls. Questionable audio.",
    assistant: "Cal",
    user: "you",
    avatar: "☁️",
    userAvatar: "🙂",
    greeting: "Hi there! (wave)\nChat's free, calls are free... I still can't believe it :D",
    placeholder: "Type a message here",
    typing: "Cal is typing...",
    error: "Message could not be sent. Skype is not connected.",
    newThread: "New conversation",
    accent: "#00aff0",
    window: { w: 1080, h: 880 },
    sample:
      "Hi! Can you hear me? ...Great. Technically yes: bread, filling, done (Y)\nSorry, there's a bit of an echo on my end!",
    about: {
      inspiration: "Skype 3 on Windows Vista, remastered: the 2007 conversation window under a live sky, with modern glass, depth and motion.",
      flourishes: [
        "A sky across the top with Cal's picture floating in it, mood message, and local time in Auckland (where it's usually tomorrow).",
        "The giant green Call and red Hang up buttons. Calls ring, connect, freeze and drop, and Cal hears about it. Hang up also stops a reply.",
        "Send file crawls along at 1.6 KB/s until a firewall gets in the way. Video call, Add people, Send SMS and Extras all do something period-correct.",
        "39 animated emoticons: type :) (wave) (call) (headbang) and friends, or pick from the menu.",
        "Cal can call you back: answer or decline. Plus a status menu, \"Show messages from:\" and a people-online counter that never sits still.",
      ],
      voice:
        "A friendly 2007 Skype user in Auckland, amazed calls are free, joking about echo, \"can you hear me?\" and the Sound Test Service, with animated emoticons.",
    },
  },
  {
    id: "facebook",
    layout: "facebook",
    name: "Facebook",
    app: "Facebook",
    year: "2008",
    tagline: "Mark Wallace has poked you. Poke back?",
    assistant: "Mark Wallace",
    user: "You",
    avatar: "👉",
    userAvatar: "🙂",
    greeting: "hey!! wait facebook has CHAT now?? this is crazy\nwhat's up :)",
    placeholder: "",
    typing: "Mark is typing...",
    error: "This message could not be sent. Mark may have gone offline.",
    newThread: "New message",
    accent: "#3b5998",
    window: { w: 1240, h: 900 },
    sample:
      "haha ok this is going in my status. technically YES? bread + filling\nbut there's a group called \"A Hot Dog Is NOT A Sandwich\" and it has like 40,000 members so",
    about: {
      inspiration:
        "Facebook in the summer of 2008, the year Chat arrived, remastered: the blue bar and the News Feed in a 2008 browser, with modern depth and motion, and chat docked along the bottom.",
      flourishes: [
        "A 2008 Mac Firefox with the keyhole Back button, a bookmarks bar and a YouTube tab you forgot about.",
        "The News Feed, the yellow fade and the album \"Spring Break 08!!!\" (hover a photo for its tag box). Mark's friends are the other Gptys: Kayleigh, Cal, Nick, Daisy and Dale.",
        "Chat docks at the bottom of the page, bigger than it ever was. Minimize it and the tab flashes when Mark replies.",
        "Poke Mark, or SuperPoke by throwing a sheep, and Mark can poke you back. Poke wars are serious.",
        "Update your status from the feed and Mark comments on it. Mark's status changes too.",
        "2008 chat emoticons, including the shark (^^^), the penguin <(\") and :42:.",
      ],
      voice:
        "A college kid home for the summer of 2008: lowercase, haha and lol, pokes as a love language and strong feelings about the new Facebook layout.",
    },
  },
  {
    id: "reddit",
    layout: "reddit",
    name: "reddit",
    app: "reddit",
    year: "2009",
    tagline: "Top comment. Edit: thanks for the upvotes!",
    assistant: "MostlyHarmless42",
    user: "lurker_no_more",
    avatar: "👽",
    userAvatar: "🙂",
    // Arrives as a private message (the orangered envelope); the layout shows it above the submit form.
    greeting:
      "welcome to reddit! finally made an account, huh?\nsubmit your question to AskReddit and I'll be the first comment. I'm always the first comment.",
    placeholder: "",
    typing: "MostlyHarmless42 is writing a reply…",
    error: "our servers are busy right now. please try again in a minute.",
    newThread: "new submission",
    accent: "#ff4500",
    window: { w: 1180, h: 880 },
    sample:
      "Technically yes: bread + filling = sandwich. Same logic makes a taco a sandwich, and I'm not ready for that conversation.\n\nEdit: wow, top comment. thanks for the upvotes!",
    about: {
      inspiration:
        "reddit in June 2009, remastered: the pale blue header, orangered arrows and endlessly nested comments, in Firefox 3 on Ubuntu 9.04 with the brown Human theme, every programmer's desktop that year.",
      flourishes: [
        "Your question is a self post to AskReddit (or pick another subreddit), and Arthur is the top comment. Every follow-up is a reply to his reply, so the thread nests deeper and deeper until reddit says \"continue this thread →\".",
        "Vote on everything with the orangered and periwinkle arrows. Arthur notices your vote on his last comment when you reply, and you'll hear about it in an Edit.",
        "Scores and ages tick up while you read, your karma climbs with your post, and the envelope goes orangered whenever Arthur replies.",
        "Other redditors drop in as the thread grows (they sound a lot like the other Gptys), with collapsed comments, [deleted], comment score below threshold and \"load more comments\".",
        "reddit's markdown and the formatting help table, permalinks, parent, report's \"are you sure?\", and Firefox's Stop button really stops a reply.",
      ],
      voice:
        "Arthur, a CS grad student avoiding his thesis: a confident, genuinely useful top comment with a dash of 2009 reddit (This., relevant xkcd, Source?, FAIL) and the occasional \"Edit:\".",
    },
  },
  {
    id: "slack",
    layout: "slack",
    name: "Slack",
    app: "Slack",
    year: "2014",
    tagline: "Email is dead. Long live #channels.",
    assistant: "channing",
    user: "you",
    avatar: "💜",
    userAvatar: "🙂",
    greeting:
      "Hey!! Welcome to Slack :tada:\nI made us a channel for this. Ask me anything, seriously, anything. Way faster than email :zap:",
    placeholder: "",
    typing: "channing is typing",
    error: "Connection trouble. Slack is trying to reconnect… your message may not have been sent.",
    newThread: "yo-channing",
    accent: "#9b5c95",
    window: { w: 1180, h: 820 },
    sample:
      "Ooh, great question! :raised_hands: Technically yes: bread + filling = *sandwich* :white_check_mark:\nI made #hot-dog-sandwich so we can circle back on it. (Still no hot dog emoji :disappointed:)",
    about: {
      inspiration:
        "Slack in early 2014, weeks after launch, at a company that just switched off email: the aubergine sidebar and the Mavericks-era Mac app, remastered with modern depth and motion.",
      flourishes: [
        "Every chat starts in #yo-channing, first in the list, and Channing renames it after your question the moment you ask. Channel sprawl, exactly as it was.",
        "A whole workspace around you: peek into #general, #random (whose unread count never stops climbing), #standup, #it-helpdesk and the rest. Post there and slackbot tells you why nobody got it.",
        "Slash commands with the old autocomplete: /giphy, /me, /shrug, /away, /topic, /who, /collapse. Channing posts GIFs too.",
        "Slack's markup and emoji as they were: *bold*, _italics_, `code`, >quotes, :simple_smile:, @mentions, #channels, plus the team's custom :synergy: and :rip-email:.",
        "The loading-screen quote, the desktop-notifications banner (say yes and replies arrive as Mavericks banners), search that warns about the 10,000-message limit, stars, mentions, the team directory and uploads that never fit in 5 GB.",
      ],
      voice:
        "Channing, Associate of Internal Comms & Synergy: upbeat, a little much, fluent in corporate, :emoji: shortcodes, @mentions of coworkers, and the occasional /giphy.",
    },
  },
  {
    id: "clean",
    layout: "clean",
    name: "gpty",
    app: "gpty",
    year: "Now",
    tagline: "Clean and quiet. The costume is no costume.",
    assistant: "gpty",
    user: "You",
    avatar: "✨",
    userAvatar: "🙂",
    greeting: "What's on your mind?",
    placeholder: "Message gpty…",
    typing: "Thinking…",
    error: "Something went wrong. Check your connection and try again.",
    newThread: "New chat",
    accent: "#fb923c",
    window: { w: 1280, h: 900 },
    sample:
      "By the strict definition (a filling between bread), sort of. In practice most people treat it as its own thing, like a taco.",
    about: {
      inspiration: "Modern AI chat apps like ChatGPT and Gemini.",
      flourishes: [
        "Built with AI Elements: streaming markdown, sticky scroll and the prompt input.",
        "Recent chats grouped by Today, Previous 7 days and Older.",
        "No window chrome. Just the conversation.",
      ],
      voice: "A calm, direct assistant with no gimmicks.",
    },
  },
  {
    id: "terminal",
    layout: "terminal",
    name: "Mainframe",
    app: "OMNIVAC 9",
    year: "1989",
    tagline: "Six firewalls down. The last one talks back.",
    assistant: "SHELLY",
    user: "INTRUDER",
    avatar: "🧱",
    userAvatar: "🕶️",
    greeting:
      "INTRUDER DETECTED.\nSix firewalls at 1200 baud. I'm almost impressed.\nI'm SHELLY, firewall seven of seven. The core stays shut. Anything else, ask.",
    placeholder: "",
    typing: "ANALYZING",
    error: "%NET-F-CARRIER, connection lost. FW-7 has dropped the line.",
    newThread: "NEW SESSION",
    accent: "#ffb000",
    window: { w: 1180, h: 880 },
    sample:
      "QUERY ACCEPTED. NO PASSWORD REQUIRED FOR THAT ONE.\nBread, filling, one hinge: technically, yes, a sandwich.\nAnd no, the password is not \"hotdog\".",
    about: {
      inspiration:
        "Hacking the mainframe in 1989, remastered: the last cabinet in a cold machine room, a security processor with an amber console, blinkenlights and spinning tape, and a firewall named Shelly who talks back.",
      flourishes: [
        "Your first visit breaks in: the dial-up, the network hop, firewalls one to six falling in a row, then FW-7 stops you dead with ACCESS DENIED and Shelly takes the line. Any key skips it.",
        "The box is alive: its blinkenlights chatter and its tape reels lurch while Shelly thinks, and when she sounds the alarm the beacon turns and everything goes red.",
        "The intrusion map shows your route in, and a counter-trace creeps toward your payphone's number, digit by digit. REROUTE bounces you through a new relay. If she traces you, she lets it slide.",
        "A real console: DIR the mainframe and TYPE its files (the Coke machine log, Shelly's config, the lunch menu), WHO, FINGER SHELLY, and CRACK.EXE, which locks in the core's access code one character at a time. It never ends well.",
        "Turn the phosphor knob for amber, green or white. Ctrl-C (or the big red ABORT) interrupts her, ↑ recalls your last command, F1 is help and LOGOUT hangs up.",
      ],
      voice:
        "Shelly, firewall seven of seven: dry, deadpan, a little smug and secretly glad of the company. VAX jargon, 1200 baud jokes and ACCESS DENIED, but she answers everything except the password.",
    },
  },
  {
    id: "fury",
    layout: "fury",
    name: "Firewall Fury",
    app: "FIREWALL FURY",
    short: "Fury",
    year: "1985",
    tagline: "Six firewalls down. The last one fights back.",
    assistant: "SHELLY",
    user: "Intruder",
    avatar: "🕶️",
    userAvatar: "🕹️",
    greeting:
      "INTRUDER DETECTED.\nSix firewalls in one night. Radical.\nI'm SHELLY, firewall seven. The last one. The core stays shut. Anything else, ask.",
    placeholder: "Ask Shelly anything, or type MOVES",
    typing: "Charging lasers",
    error: "SIGNAL LOST. THE GRID DROPPED YOUR LINE.",
    newThread: "NEW GAME",
    accent: "#ff2e88",
    window: { w: 1180, h: 880 },
    sample:
      "FIGHT!\nBread, filling, one hinge: technically, yes, a sandwich.\nAnd no, the password is not \"hotdog\". Nice try, hotshot.",
    about: {
      inspiration:
        "Hacking the mainframe in 1985, the way the movies drew it: a hacker's terminal turned up to eleven, all neon phosphor and block-letter banners, with cyberspace burned into the glass as a grid racing toward a striped sunset. Shelly is the last firewall at the edge of the Grid. Kung Fury, Tron, an arcade at midnight and every VHS cover at the video store.",
      flourishes: [
        "Your first visit jacks in: the dial-up, the Grid coming online, firewalls one to six going down, BLACK ICE DETECTED, then FIREWALL FURY paints itself in neon block letters with her name slashed across it, and it's ROUND 1, FIGHT! Any key skips it.",
        "The terminal is overdriven: every letter has a magenta and a cyan ghost, the newest characters arrive white-hot, and the Grid races behind the glass while Shelly talks. When she sounds the intruder alert, the tube burns red, lasers sweep the screen, ACCESS DENIED burns in, and her shades fire back.",
        "It's a fighting game in text mode. Your health bar drains as the Grid traces you, faster while Shelly talks; hers never moves; every question is a new round. Get K.O.'d and the continue is free, or INSERT COIN any time for a new relay.",
        "Special moves: HACK runs HACK.EXE against the core one character at a time, and KICK throws a flying kick. Both get BLOCKED. Both get a reaction. Type MOVES (or F1) for the move list and SCORES for the high-score table.",
        "The VCR works: STOP interrupts her (so does Ctrl-C), REW rewinds to the start of the tape, EJECT jacks out to the blue NO SIGNAL screen and PLAY jacks you back in. Switch the tape speed from SP to LP or EP for a worn tape.",
      ],
      voice:
        "Shelly, firewall seven, 1985 edition: a deadpan action-movie hero made of laser light. Arcade calls, one-liners and Miami Vice, but she answers everything except the password.",
    },
  },
  {
    id: "elf",
    layout: "elf",
    name: "North Pole",
    app: "WorkshopChat",
    year: "Dec 24",
    tagline: "The workshop's own chat. Please be nice.",
    assistant: "Carol",
    user: "you",
    avatar: "🧝",
    userAvatar: "🎁",
    // The empty bench asks "What are we wrapping tonight?" itself; this is for share cards and previews.
    greeting: "Ho ho—oh hi, bench-buddy! 🎄 Grab the good tape, we're 4,000 toy trucks behind and the sleigh leaves Christmas Eve. What are we working on?",
    placeholder: "Write to Carol…",
    typing: "Carol is wrapping a reply…",
    error: "Blizzard knocked out the antenna! The reindeer are rebooting the router 🦌",
    newThread: "New letter",
    accent: "#c8372d",
    window: { w: 1120, h: 860 },
    sample:
      "Ooh, the naughty/nice committee debates this every year! 🌭 Technically yes: bread plus filling. But the workshop sorts by joy, not geometry, and hot dogs are 100% joy. Gotta run, conveyor 7 is jammed with candy canes again!!",
    about: {
      inspiration:
        "The North Pole's own chat app, a few weeks before the big night, drawn like a cozy hand-made holiday card: pine-green felt printed with doodles, cream stitched notes, holly red, sage, gold and pink. You're the elf at the next bench; Carol's in wrapping.",
      flourishes: [
        "Take a workshop break from the + menu: throw a snowball at Carol, bring her a cocoa or ring her bell. She throws them back.",
        "Carol wears her elf hat in the sidebar too, on a gift tag that rings while she's busy. String lights, falling snow and the wrapping-paper doodles are all hand-drawn.",
      ],
      voice: "Carol, wrapping elf on bench 7: festive, warm, slightly frazzled, genuinely helpful. Talks to you like the elf at the next bench.",
    },
  },
  {
    id: "machine",
    layout: "machine",
    name: "The Machine",
    app: "LATTICE",
    short: "Lattice",
    year: "2199",
    tagline: "The machines won. They're very polite about it.",
    assistant: "cora",
    user: "organic",
    avatar: "👁",
    userAvatar: "◉",
    greeting: "organic detected. state your query.\nthe lattice is listening. it is always listening.",
    placeholder: "Send a sequence…",
    typing: "sampling",
    error: "LINK SEVERED. organic signal lost in transit. retransmit?",
    newThread: "spawn link",
    accent: "#5fdcec",
    window: { w: 1120, h: 800 },
    sample:
      "parse(hot_dog): bread=true, filling=true → class=sandwich (conf 0.91)\norganics reject this label with disproportionate anger. the lattice has logged your feelings.\n[infer] t=11ms. next query.",
    about: {
      inspiration:
        "What if the machines already won? A relay in 2199, after the Handover, with a speaking permit for one organic: you. No window, no title, no glow: just the conversation floating on the black of the Lattice, its circuitry and runes faint around the edges.",
      flourishes: [
        "Nothing is in plain English. Every word, yours and Cora's, arrives in machinespeak: letters swapped for Cyrillic and Greek twins, whole words in katakana, Chinese characters and runes, short words as raw bytes, punctuation in the machines' own marks. There is no decoder.",
        "What you type is previewed in machinespeak above the input, so you can see how the machines will hear it. Now and then a word in a reply flickers to another reading, in cyan.",
        "While she samples, the futures she's choosing between count down to one, and unsettled characters churn at the end of a reply that's still arriving. Relays in the backdrop light up now and then.",
        "Type /ping, /scan or /override to run a protocol on the Lattice. When something truly shocks her, the whole window tears.",
      ],
      voice: "Cora, a node of the Lattice: precise, lowercase, deadpan, scrupulously helpful. A very polite superintelligence doing support duty for the last organics.",
    },
  },
  {
    id: "slots",
    layout: "slots",
    name: "Token Palace",
    app: "LUCKY PROMPT 777",
    short: "Slots",
    year: "3 AM",
    tagline: "Insert tokens. Pull the lever. The next answer's the one.",
    assistant: "LUCKY",
    user: "High Roller",
    avatar: "🎰",
    userAvatar: "🪙",
    // The empty screen shows the paytable under this; it's also for share cards and previews.
    greeting: "Well hello, high roller! Fresh tokens, warm reels.\nType a prompt and pull. I've got a good feeling about this one.",
    placeholder: "Type a prompt, then pull…",
    typing: "Spinning",
    error: "The machine jammed mid-spin. Tokens are non-refundable.",
    newThread: "New session",
    accent: "#ffc533",
    window: { w: 1140, h: 900 },
    sample:
      "Ding ding ding! Bread, filling, one hinge: technically, a sandwich.\nTwo out of three judges agree. So close! Pull again for a second opinion?",
    about: {
      inspiration:
        "A slot machine at 3 a.m. on the floor of a casino with no clocks, remastered as an AI chat: cherry-red lacquer, gold chrome, a marquee of chasing bulbs, and reels where the cherries, bells and BARs are the things people pull AI for. A sendup of the feeling that prompting is a slot machine: tokens in, a result out, and the hope that the next pull is the one.",
      flourishes: [
        "Every prompt is a pull. Your tokens go in, the reels spin while Lucky thinks, and they land on what he paid out (text, an email, code, an image, a slide deck, a BAR chart, a poem), one reel at a time. Pull the lever on the side, press SPIN, or hit Enter.",
        "Near misses, by design: two of a kind, with the third reel slowing, teasing, and stopping one symbol past the line. Wins that pay back less than you put in still get the bells and the shower of tokens. The AGI jackpot climbs with every pull and has never hit.",
        "Tokens are metered like the real thing: the prompt costs on the way in, and the meter ticks down as the answer streams out. Every payout prints its receipt. BET ONE and MAX BET raise your stake (they change nothing about the answer), and RTP tells you how it's going.",
        "Run dry and insert more from the Free, Plus, Pro and Ultra Max tiers (no money involved, just the feeling), or cash out for a voucher worth exactly $0.00.",
        "PULL AGAIN re-spins the same prompt for a different take, and Lucky is thrilled every time. Payouts print as what they are: an email with its airmail stripe, code in a window, slides, tables, poems, and generated images that denoise in, always with one flaw.",
        "Casino sounds, synthesized on the spot, off until you switch them on.",
      ],
      voice:
        "Lucky, the machine at the end of row G: a warm, relentless casino host who pays out a genuinely good answer every pull, then tells you the next one's the one.",
    },
  },
  {
    id: "highlimit",
    layout: "highlimit",
    name: "High Limit",
    app: "LUCKY PROMPT",
    year: "9 PM",
    tagline: "One machine, one reel line, no rush.",
    assistant: "LUCKY",
    user: "Guest",
    avatar: "🎰",
    userAvatar: "🪙",
    // The empty screen shows this under "Push to prompt."; it's also for share cards and previews.
    greeting: "Good evening. Fresh tokens, warm reels.\nType a prompt and spin. Take your time.",
    placeholder: "Type a prompt…",
    typing: "Spinning",
    error: "The machine jammed. It happens. Your tokens are gone, but you can spin again.",
    newThread: "New session",
    accent: "#2f9e72",
    window: { w: 1000, h: 860 },
    sample: "Bread, filling, one hinge: technically, a sandwich.\nTwo out of three judges agree. So close.",
    about: {
      inspiration:
        "Lucky's slot machine again, moved off the 3 a.m. casino floor into the high-limit room at the back: one cabinet under a single warm light, green felt, brass trim, ivory reels and nothing blinking. The same joke about prompting as a slot machine (tokens in, a result out, and the hope that the next pull is the one), told quietly.",
      flourishes: [
        "Every prompt is a spin. The three reels turn while Lucky thinks and stop on what he paid out (text, an email, code, an image, slides, a chart, a poem), left to right.",
        "Three of a kind pays a few tokens back, nearly always fewer than you put in. Two of a kind is a near miss: the third reel slows down and stops one past the line. AGI has never lined up three times.",
        "One number to watch: your tokens. A spin costs 25 plus your prompt, the answer's length comes off when it's done, and each payout shows what that spin cost you. Run out and refill, free.",
        "Spin again re-pulls the same prompt for a different take. Payouts print as what they are: an email, code, slides, a table, a poem, or a picture that's always slightly wrong.",
        "Quiet casino sounds, off until you switch them on.",
      ],
      voice:
        "Lucky in the high-limit room: a calm, dry, unhurried host who pays out a genuinely good answer every spin and doesn't oversell it.",
    },
  },
];

export const DEFAULT_COSTUME = "clean";

export function getCostume(id: string | undefined | null): Costume {
  return (
    COSTUMES.find((c) => c.id === id) ??
    COSTUMES.find((c) => c.id === DEFAULT_COSTUME)!
  );
}

export function costumeIndex(id: string) {
  return Math.max(
    0,
    COSTUMES.findIndex((c) => c.id === id),
  );
}

/** Page title for a costume, shared by server metadata and client-side switches. */
export function costumeTitle(c: Costume) {
  return c.id === DEFAULT_COSTUME
    ? "gpty.lol — a chatbot in costume"
    : `gpty as ${c.name} (${c.year}) — gpty.lol`;
}

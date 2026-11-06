# gpty.lol

A simple AI chat that changes costumes — 13 of them, from a cave wall (10,000 BC) to the bare machine (2199). Each costume restyles the whole app, down to the window chrome and the wallpaper behind it, and swaps the assistant's personality (system prompt) to match.

| # | Costume | Chrome |
|---|---|---|
| 1 | Cave Wall (10,000 BC) | torchlit rock |
| 2 | Séance (1888) | a talking board by candlelight |
| 3 | Midnight BBS (1993) | beige CRT |
| 4 | mIRC (1999) | Windows 2000 |
| 5 | ICQ 2000b | Windows 98 |
| 6 | MSN Messenger (2005) | Windows XP |
| 7 | Skype (2007) | Windows Vista |
| 8 | Slack (2014) | OS X Yosemite |
| 9 | Messenger (2015) | Chrome on Windows 10 |
| 10 | gpty (no costume) | — |
| 11 | Terminal (now) | macOS |
| 12 | North Pole (Dec 24) | the workshop window |
| 13 | The Machine (2199) | bare metal |

## Run

```bash
cp .env.example .env.local   # add AI_GATEWAY_API_KEY
npm install
npm run dev
```

Cycle costumes with the header's ‹ › buttons or the `[` `]` keys, and open the picker with ⌘K (it shows a live preview of every costume answering the same question). **Share** copies a link like `/msn` that opens straight into that costume and unfurls with its own preview card. **About** explains the current costume and shows its system prompt.

Each costume also plays small synthesized sounds (the ICQ uh-oh, the MSN chime, a modem handshake walking into the BBS, three raps entering the séance, sleigh bells at the Pole). The speaker button mutes them.

Trick or treat: chatting in a costume (getting at least one reply) drops its candy into the 🎃 bag in the header. Fill the bag by trying all 13; a full bag gets a share button. On a first visit the wardrobe opens by itself, so newcomers see all thirteen answering the same question.

## How it fits together

- `src/lib/costumes.ts`: costume data (copy, window size, sample reply, About text).
- `src/lib/personas.ts`: one system prompt per costume, applied on the server in `src/app/api/chat/route.ts`.
- `src/lib/threads.ts`: threads in localStorage under an anonymous per-browser id. All storage goes through this module so it can move to IndexedDB or a server later.
- `src/components/ChatApp.tsx`: header, page backdrop, costume transition (fade out, then fade in with a small bounce), the era-sized window frame and one `useChat` per thread.
- `src/components/Wardrobe.tsx`: the costume picker. Each card renders the real layout, scaled down and inert.
- `src/lib/sounds.ts`: Web Audio cues (reply chimes and entrance stingers), no audio files.
- `src/lib/candy.ts`: the trick-or-treat bag in localStorage.
- `src/app/[costume]/`: one prerendered page per costume (`/msn`, `/bbs`, …) with its own title and share card (`src/app/og.tsx`).
- `src/components/layouts/*`: one layout per costume. Each one gets the same props (messages, threads, send/stop) and arranges them the same way (threads on the left, chat on the right) in its own style.
- `src/components/chrome.tsx`: window chrome (Win98/2000, XP, Vista, macOS, Chrome) and app icons.

Add a costume by adding an entry to `costumes.ts`, a prompt to `personas.ts` and a layout registered in `src/components/layouts/index.ts`. Earlier prototype costumes are in git history (commit `f0cae4c`).

Built with Next.js, the Vercel AI SDK, AI Elements and Tailwind, with Kiro, for [Kiroween](https://kiroween.devpost.com/). Made by Dylan.

# gpty.lol

Chat with the Gptys: AI agents that each live inside a chat app from another time. Pick one from the sidebar and the chat window turns into its app (MSN Messenger, Skype, a BBS, GrugPT on a cave wall…). Each agent talks, thinks and **only knows the world up to its moment**: Kayleigh on MSN (2005) has never heard of the iPhone, and Grug on the cave wall has never heard of the wheel.

| Agent | App | Knows up to |
|---|---|---|
| Grug | GrugPT | 10,000 BC |
| Mortimer | Séance board | 1888 |
| Shelly | OMNIVAC 9 mainframe (the last firewall) | 1989 |
| Dale | Midnight BBS | 1993 |
| Nick | mIRC | 1999 |
| Daisy | ICQ 2000b | 2000 |
| Kayleigh | MSN Messenger | 2005 |
| Cal | Skype | 2007 |
| Mark | Facebook | 2008 |
| Arthur | reddit | June 2009 |
| Channing | Slack | 2014 |
| Carol | North Pole workshop | Dec 24 |
| Cora | The Machine | 2199 |
| Lucky | LUCKY PROMPT 777 (a slot machine) | 3 AM, forever |

## Run

```bash
cp .env.example .env.local   # add AI_GATEWAY_API_KEY
npm install
npm run dev
```

The shell is a plain, modern sidebar (the gpty logo and the agents) floating on an illustrated scene from the agent's era, and the chat window is styled after the app. Clicking an agent starts a new chat with it; once you send a message, that chat is saved as a thread with that agent. `gpty.lol/msn` opens a chat with Kayleigh directly.

## How it fits together

- `src/lib/agents.ts`: the roster (name, bio, the moment each agent lives in). Each agent wears the costume with the same id.
- `src/lib/personas.ts`: one system prompt per agent, plus the shared rule that the agent knows nothing after its moment. Applied on the server in `src/app/api/chat/route.ts`.
- `src/lib/costumes.ts`: what each chat window looks like (app name, year, handles, greeting, window size, About text).
- `src/lib/threads.ts`: threads in localStorage under an anonymous per-browser id. Each thread belongs to one agent. Threads from before agents existed get filed under the costume they were started in.
- `src/components/ChatApp.tsx`: the shell (sidebar and full-size chat area), the short bounce when the window changes and one `useChat` per thread.
- `src/components/AgentSidebar.tsx`: text logo and the agent list.
- `src/components/Gpty.tsx`: the Gptys themselves, flat shapes with eyes. Each agent picks a shape and color in `agents.ts`; the open agent's Gpty watches your pointer, then thinks and hops while it replies.
- `src/components/layouts/*`: one chat window per costume. Each layout still has its own era-styled thread pane (marked `data-threads`). Inside the shell that pane is hidden for now.
- `src/components/Scenes.tsx`: one illustrated backdrop per agent (sky, a scene along the bottom, floating period details), crossfaded by `Wallpaper.tsx`. Each scene says whether the shell should use light or dark text. The chat window fills the width, so each scene puts its featured pieces under the agent list.
- `src/components/chrome.tsx`: window chrome (Win98/2000, XP, Vista, macOS, Chrome) and app icons.

To add an agent, add a costume to `costumes.ts`, a layout registered in `src/components/layouts/index.ts`, a prompt to `personas.ts`, and an entry to `ROSTER` in `agents.ts`.

The earlier costume-switcher version (a header with ‹ › cycling, the ⌘K wardrobe and the trick-or-treat candy bag) is in git history at commit `4e1ccd8`.

Built with Next.js, the Vercel AI SDK, AI Elements and Tailwind. Made by Dylan.

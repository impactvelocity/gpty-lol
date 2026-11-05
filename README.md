# gpty.lol

A simple AI chat that changes costumes. Each costume swaps the UI and the assistant's personality.

Costumes: Plain Clothes (ChatGPT-style), MSN '03, Midnight BBS, ICQ '99, Skype '04, Messenger, haunted editions of each (Ghostenger, Crypt BBS, ICQ: Uh-Oh Boo, Skype from Beyond, Boo-ssenger) and a Séance (Ouija board).

## Run

```bash
cp .env.example .env.local   # add AI_GATEWAY_API_KEY
npm install
npm run dev
```

Open http://localhost:3000. Press Ctrl/Cmd+K or use the costume button to change. `?costume=bbs-haunted` deep-links a costume.

## Add a costume

1. Add an entry to `src/lib/costumes.ts` (pick an existing `layout`, set palette and copy).
2. Add its persona prompt to `src/lib/personas.ts` (keyed by costume id).

A new look needs a layout in `src/components/layouts/` registered in `ChatApp.tsx`.

## Stack

Next.js (App Router), AI SDK (`useChat`, `streamText`) via Vercel AI Gateway, AI Elements for the clean costume, Tailwind. Personas live server-side; the client only sends a costume id. Set `AI_MODEL` to change the model.

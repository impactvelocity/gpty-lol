"use client";

import dynamic from "next/dynamic";

// Threads and the chosen costume live in localStorage, so the app renders on
// the client only. This avoids hydration mismatches and a flash of the
// default costume. Nothing shows while it loads; the body's dark background
// fills the gap.
const ChatApp = dynamic(() => import("@/components/ChatApp").then((m) => m.ChatApp), {
  ssr: false,
  loading: () => null,
});

export function ClientApp({ costume }: { costume?: string }) {
  return <ChatApp costume={costume} />;
}

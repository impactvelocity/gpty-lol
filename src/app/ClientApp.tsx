"use client";

import dynamic from "next/dynamic";

export function Splash() {
  return (
    <div className="grid h-dvh place-items-center bg-[#121214] font-sans text-sm text-white/60">
      <span className="animate-pulse">🎭 gpty.lol</span>
    </div>
  );
}

// Threads and the chosen costume live in localStorage, so the app renders on
// the client only. This avoids hydration mismatches and a flash of the
// default costume.
const ChatApp = dynamic(() => import("@/components/ChatApp").then((m) => m.ChatApp), {
  ssr: false,
  loading: Splash,
});

export function ClientApp({ costume }: { costume?: string }) {
  return <ChatApp costume={costume} />;
}

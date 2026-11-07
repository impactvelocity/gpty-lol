"use client";

import { useChat } from "@ai-sdk/react";
import { Menu } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { type Agent, agentEra, getAgent, isAgent } from "@/lib/agents";
import { messageText, previewOf, useThreads } from "@/lib/threads";
import type { ChatMessage } from "@/lib/types";
import { AboutModal } from "./AboutModal";
import { AgentSidebar, Logo } from "./AgentSidebar";
import { MeetPage } from "./MeetPage";
import { toneOf } from "./Scenes";
import { Wallpaper } from "./Wallpaper";
import type { Mood } from "./Gpty";
import { LAYOUTS } from "./layouts";
import { NUDGE } from "./layouts/MsnLayout";
import type { ChatLine, ThreadItem } from "./layouts/types";

/** The new window settles in with a small, quick bounce. */
const SETTLE: Keyframe[] = [
  { opacity: 0.4, transform: "translateY(8px)" },
  { opacity: 1, transform: "translateY(-2px)", offset: 0.6 },
  { opacity: 1, transform: "none" },
];

/** An agent in the URL (/msn) opens a new chat with that agent. */
function agentFromUrl(fromRoute?: string) {
  // Read the address bar rather than trusting the route alone: switching
  // agents rewrites the path without a navigation, so it's the newer value.
  const fromPath = window.location.pathname.split("/")[1];
  if (isAgent(fromPath)) return fromPath;
  return isAgent(fromRoute) ? fromRoute : undefined;
}

/** /meet opens the Meet the gptys page. */
const MEET = "meet";

/** Keep the address bar shareable: gpty.lol/<agent> or gpty.lol/meet. */
function rememberPath(id: string) {
  const url = new URL(window.location.href);
  url.pathname = `/${id}`;
  url.searchParams.delete("costume");
  window.history.replaceState(null, "", url);
}

export function ChatApp({ costume: fromRoute }: { costume?: string }) {
  const [fromUrl] = useState(() => agentFromUrl(fromRoute));
  const store = useThreads(fromUrl);
  const agent = getAgent(store.agentId);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mood, setMood] = useState<Mood>("watching");
  const [drawer, setDrawer] = useState(false);
  const [meet, setMeet] = useState(
    () => window.location.pathname.split("/")[1] === MEET || (fromRoute === MEET && !fromUrl),
  );
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = meet ? "Meet the gptys — gpty.lol" : `${agent.name} · ${agentEra(agent)} — gpty.lol`;
    rememberPath(meet ? MEET : agent.id);
  }, [agent, meet]);

  /** Swap what the window shows, then settle it in with a short bounce. */
  const transition = useCallback((change: () => void) => {
    setDrawer(false);
    flushSync(change);
    const el = stageRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.getAnimations().forEach((a) => a.cancel());
    el.animate(SETTLE, { duration: 280, easing: "cubic-bezier(.3,.7,.4,1)" });
  }, []);

  const { openAgent, select, deleteThread } = store;
  const onOpenAgent = useCallback(
    (id: string) =>
      transition(() => {
        setMeet(false);
        openAgent(id);
      }),
    [transition, openAgent],
  );
  const onSelectThread = useCallback(
    (id: string) =>
      transition(() => {
        setMeet(false);
        select(id);
      }),
    [transition, select],
  );
  const onMeet = useCallback(() => transition(() => setMeet(true)), [transition]);

  const items: ThreadItem[] = useMemo(
    () => [
      ...(store.isDraft ? [{ id: store.activeId, title: "", preview: "", updatedAt: 0, draft: true }] : []),
      ...store.threads
        .filter((t) => t.agentId === store.agentId)
        .map((t) => ({ id: t.id, title: t.title || "Untitled", preview: previewOf(t), updatedAt: t.updatedAt })),
    ],
    [store.isDraft, store.activeId, store.threads, store.agentId],
  );

  const initial = useMemo(
    () => store.threads.find((t) => t.id === store.activeId)?.messages ?? [],
    // Only read when the active thread changes; later saves must not reset the chat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.activeId],
  );

  const sidebar = (
    <AgentSidebar
      agentId={store.agentId}
      isDraft={store.isDraft}
      meet={meet}
      mood={mood}
      onOpenAgent={onOpenAgent}
      onMeet={onMeet}
      onAbout={() => {
        setDrawer(false);
        setAboutOpen(true);
      }}
    />
  );

  return (
    <div
      data-tone={toneOf(meet ? MEET : agent.id)}
      className="shell relative isolate flex h-dvh overflow-hidden font-[family-name:var(--font-geist-sans)] text-[var(--shell-text)] antialiased"
    >
      <Wallpaper current={meet ? MEET : agent.id} />
      <aside className="hidden w-[300px] shrink-0 md:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <aside className="drawer-in absolute inset-y-0 left-0 w-[284px] max-w-[85vw] bg-[var(--shell-drawer)] shadow-2xl backdrop-blur-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* Phones have no room for the sidebar: a menu button opens it as a drawer. */}
        <header className="flex h-12 shrink-0 items-center gap-1 px-2 md:hidden">
          <button
            onClick={() => setDrawer(true)}
            aria-label="Open agents"
            className="grid h-9 w-9 place-items-center rounded-lg text-[var(--shell-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
        </header>
        <div ref={stageRef} className="min-h-0 flex-1 px-2 pb-2 md:py-6 md:pl-2 md:pr-6">
          {meet && <MeetPage onOpenAgent={onOpenAgent} />}
          {/* The chat stays mounted under the page, so a reply in progress isn't lost. */}
          <div className={meet ? "hidden" : "h-full"}>
            <ChatView
              key={store.activeId}
              threadId={store.activeId}
              initial={initial}
              agent={agent}
              onSave={store.saveMessages}
              threads={items}
              onSelectThread={onSelectThread}
              onNewThread={() => onOpenAgent(agent.id)}
              onDeleteThread={deleteThread}
              onMood={setMood}
            />
          </div>
        </div>
      </main>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} agent={agent} />
    </div>
  );
}

function signature(ms: ChatMessage[]) {
  const last = ms.at(-1);
  return `${ms.length}:${last?.id ?? ""}:${last ? messageText(last).length : 0}`;
}

function ChatView({
  threadId,
  initial,
  agent,
  onSave,
  threads,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onMood,
}: {
  threadId: string;
  initial: ChatMessage[];
  agent: Agent;
  onSave: (id: string, agentId: string, messages: ChatMessage[]) => void;
  threads: ThreadItem[];
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
  onMood: (mood: Mood) => void;
}) {
  const { messages, sendMessage, status, stop, error } = useChat<ChatMessage>({
    id: threadId,
    messages: initial,
  });
  const costume = agent.costume;
  const agentId = agent.id;

  // Persist whenever the transcript settles (after send, finish, stop or error).
  const savedSig = useRef(signature(initial));
  useEffect(() => {
    if (status === "streaming") return;
    const sig = signature(messages);
    if (sig === savedSig.current) return;
    savedSig.current = sig;
    onSave(threadId, agentId, messages);
  }, [messages, status, threadId, agentId, onSave]);

  const lines: ChatLine[] = useMemo(
    () =>
      messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          // MSN renders its own nudge line; elsewhere show it as an action.
          text:
            costume.layout !== "msn" && m.role === "user" && messageText(m) === NUDGE
              ? "*sent a nudge*"
              : messageText(m),
          at: m.metadata?.createdAt ?? 0,
        }))
        // Hide the empty assistant placeholder; `waiting` covers that moment.
        .filter((l) => l.text.length > 0),
    [messages, costume.layout],
  );

  const busy = status === "submitted" || status === "streaming";

  // The agent's orb in the sidebar mirrors the chat: thinking until the first
  // words arrive, typing while they stream, watching you the rest of the time.
  const failed = status === "error" || !!error;
  const replying = status === "streaming" && messages.at(-1)?.role === "assistant";
  useEffect(() => {
    onMood(failed ? "error" : status === "submitted" ? "thinking" : replying ? "typing" : status === "streaming" ? "thinking" : "watching");
  }, [failed, status, replying, onMood]);
  const waiting = status === "submitted" || (status === "streaming" && lines.at(-1)?.role !== "assistant");

  const onSend = useCallback(
    (text: string) => {
      sendMessage({ text, metadata: { createdAt: Date.now(), agent: agentId } }, { body: { agent: agentId } });
    },
    [sendMessage, agentId],
  );

  const Layout = LAYOUTS[costume.layout];
  return (
    <div className="h-full">
      <div className="agent-window h-full w-full">
        <Layout
          costume={costume}
          lines={lines}
          busy={busy}
          waiting={waiting}
          error={status === "error" || !!error}
          onSend={onSend}
          onStop={stop}
          threads={threads}
          activeId={threadId}
          onSelectThread={onSelectThread}
          onNewThread={onNewThread}
          onDeleteThread={onDeleteThread}
        />
      </div>
    </div>
  );
}

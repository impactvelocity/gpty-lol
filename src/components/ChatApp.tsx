"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  COSTUMES,
  DEFAULT_COSTUME,
  costumeIndex,
  costumeTitle,
  getCostume,
  type Costume,
} from "@/lib/costumes";
import { useCandy } from "@/lib/candy";
import { playEnter, playReply, setSoundEnabled, soundEnabled } from "@/lib/sounds";
import { messageText, previewOf, useThreads } from "@/lib/threads";
import type { ChatMessage } from "@/lib/types";
import { AboutModal } from "./AboutModal";
import { SiteHeader } from "./SiteHeader";
import { Wallpaper } from "./Wallpaper";
import { Wardrobe } from "./Wardrobe";
import { useOnNewReply } from "./layouts/hooks";
import { LAYOUTS } from "./layouts";
import { NUDGE } from "./layouts/MsnLayout";
import type { ChatLine, ThreadItem } from "./layouts/types";

const COSTUME_KEY = "gpty.costume";

/** Old window fades out quickly, new one fades in with a small overshoot. */
const OUT: Keyframe[] = [{ opacity: 0, transform: "translateY(6px) scale(0.985)" }];
const IN: Keyframe[] = [
  { opacity: 0, transform: "translateY(12px) scale(0.97)" },
  { opacity: 1, transform: "translateY(-3px) scale(1.006)", offset: 0.65 },
  { opacity: 1, transform: "none" },
];

const isCostume = (id: string | null | undefined): id is string =>
  !!id && COSTUMES.some((c) => c.id === id);

/** A costume in the URL (/msn or the older ?costume=msn) wins over the last one used. */
function initialCostume(fromRoute?: string) {
  // Read the address bar rather than trusting the route alone: switching
  // costume rewrites the path without a navigation, so it's the newer value.
  const fromPath = window.location.pathname.split("/")[1];
  if (isCostume(fromPath)) return fromPath;
  if (isCostume(fromRoute)) return fromRoute;
  const fromQuery = new URLSearchParams(window.location.search).get("costume");
  if (isCostume(fromQuery)) return fromQuery;
  const saved = localStorage.getItem(COSTUME_KEY);
  return isCostume(saved) ? saved : DEFAULT_COSTUME;
}

/** Keep the address bar shareable: gpty.lol/<costume>. */
function rememberCostume(id: string) {
  localStorage.setItem(COSTUME_KEY, id);
  const url = new URL(window.location.href);
  url.pathname = `/${id}`;
  url.searchParams.delete("costume");
  window.history.replaceState(null, "", url);
}

export function ChatApp({ costume: fromRoute }: { costume?: string }) {
  const store = useThreads();
  const candy = useCandy(store.threads);
  const [shownId, setShownId] = useState(() => initialCostume(fromRoute));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [sound, setSound] = useState(soundEnabled);
  const [candyToast, setCandyToast] = useState<{ k: number; name: string; n: number } | null>(null);
  const winRef = useRef<HTMLDivElement>(null);
  /** The costume we're heading to, so quick repeated clicks keep advancing. */
  const targetRef = useRef(shownId);
  const seq = useRef(0);
  const costume = getCostume(shownId);

  useEffect(() => {
    document.title = costumeTitle(costume);
  }, [costume]);

  // A brand-new visitor who didn't follow a costume link: open the wardrobe,
  // which shows every costume answering the same question. Esc closes it.
  const [firstVisit] = useState(() => {
    const q = new URLSearchParams(window.location.search).get("costume");
    const path = window.location.pathname.split("/")[1];
    return !localStorage.getItem(COSTUME_KEY) && !isCostume(path) && !isCostume(q) && !isCostume(fromRoute);
  });
  useEffect(() => {
    if (!firstVisit || store.threads.length > 0) return;
    const t = setTimeout(() => setPickerOpen(true), 700);
    return () => clearTimeout(t);
    // Once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalise the URL on first load (e.g. "/" or "?costume=" to "/clean").
  useEffect(() => {
    rememberCostume(targetRef.current);
  }, []);

  const go = useCallback((id: string) => {
    if (id === targetRef.current) return;
    targetRef.current = id;
    rememberCostume(id);
    // Every caller is a click or key press, so audio is allowed to start.
    playEnter(id);
    const token = ++seq.current;
    const el = winRef.current;
    const swap = () => flushSync(() => setShownId(id));
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      swap();
      return;
    }
    // Start from wherever a running animation left the window.
    const from = getComputedStyle(el).opacity;
    el.getAnimations().forEach((a) => a.cancel());
    const out = el.animate([{ opacity: from }, ...OUT], {
      duration: 170,
      easing: "ease-in",
      fill: "forwards",
    });
    out.finished.then(
      () => {
        if (token !== seq.current) return;
        swap();
        winRef.current?.animate(IN, { duration: 460, easing: "cubic-bezier(.22,.9,.3,1)" });
        out.cancel();
      },
      () => {}, // cancelled by a newer change
    );
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const i = costumeIndex(targetRef.current);
      go(COSTUMES[(i + dir + COSTUMES.length) % COSTUMES.length].id);
    },
    [go],
  );

  const surprise = useCallback(() => {
    const others = COSTUMES.filter((c) => c.id !== targetRef.current);
    go(others[Math.floor(Math.random() * others.length)].id);
  }, [go]);

  // ⌘K / Ctrl+K opens the picker; [ and ] cycle when you're not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPickerOpen((o) => !o);
        return;
      }
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "]") step(1);
      if (e.key === "[") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  /** On each fresh reply: play the costume's cue and maybe drop a candy in the bag. */
  const { collect } = candy;
  const onReply = useCallback(
    (id: string) => {
      playReply(id);
      const n = collect(id);
      if (n) setCandyToast({ k: Date.now(), name: getCostume(id).name, n });
    },
    [collect],
  );

  const items: ThreadItem[] = useMemo(
    () => [
      ...(store.isDraft
        ? [{ id: store.activeId, title: "", preview: "", updatedAt: 0, draft: true }]
        : []),
      ...store.threads.map((t) => ({
        id: t.id,
        title: t.title || "Untitled",
        preview: previewOf(t),
        updatedAt: t.updatedAt,
      })),
    ],
    [store.isDraft, store.activeId, store.threads],
  );

  const initial = useMemo(
    () => store.threads.find((t) => t.id === store.activeId)?.messages ?? [],
    // Only read when the active thread changes; later saves must not reset the chat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.activeId],
  );

  return (
    <div
      className="relative isolate flex h-dvh flex-col overflow-hidden px-3 pb-3 md:px-10 md:pb-6 xl:px-16"
    >
      <Wallpaper current={costume.id} />
      <div className="mx-auto w-full max-w-[1280px]">
        <SiteHeader
          costume={costume}
          candy={candy.got.size}
          candyTotal={candy.total}
          sound={sound}
          onToggleSound={() => {
            setSound((on) => {
              setSoundEnabled(!on);
              return !on;
            });
          }}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          onOpenPicker={() => setPickerOpen(true)}
          onOpenAbout={() => setAboutOpen(true)}
        />
      </div>

      <main className="mx-auto min-h-0 w-full max-w-[1280px] flex-1">
        <ChatView
          key={store.activeId}
          winRef={winRef}
          threadId={store.activeId}
          initial={initial}
          costume={costume}
          onSave={store.saveMessages}
          threads={items}
          onSelectThread={store.select}
          onNewThread={store.newThread}
          onDeleteThread={store.deleteThread}
          onReply={onReply}
        />
      </main>

      {candyToast && (
        <div
          key={candyToast.k}
          role="status"
          className="candy-toast pointer-events-none fixed left-1/2 top-14 z-50 -translate-x-1/2 rounded-full border border-white/15 bg-black/80 px-4 py-1.5 font-sans text-sm text-white shadow-xl backdrop-blur-md"
        >
          🍬 <b>{candyToast.name}</b> added to your bag ·{" "}
          {candyToast.n === candy.total ? (
            <b className="text-amber-300">FULL BAG! 🎃</b>
          ) : (
            <span className="text-white/70">
              {candyToast.n}/{candy.total}
            </span>
          )}
        </div>
      )}

      <Wardrobe
        open={pickerOpen}
        current={costume.id}
        collected={candy.got}
        onPick={(c) => {
          setPickerOpen(false);
          go(c.id);
        }}
        onSurprise={() => {
          setPickerOpen(false);
          surprise();
        }}
        onClose={() => setPickerOpen(false)}
      />
      <AboutModal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        costume={costume}
        userId={store.userId}
        threadCount={store.threads.length}
      />
    </div>
  );
}

function signature(ms: ChatMessage[]) {
  const last = ms.at(-1);
  return `${ms.length}:${last?.id ?? ""}:${last ? messageText(last).length : 0}`;
}

function ChatView({
  winRef,
  threadId,
  initial,
  costume,
  onSave,
  threads,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onReply,
}: {
  winRef: React.RefObject<HTMLDivElement | null>;
  threadId: string;
  initial: ChatMessage[];
  costume: Costume;
  onSave: (id: string, messages: ChatMessage[]) => void;
  threads: ThreadItem[];
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
  onReply: (costumeId: string) => void;
}) {
  const { messages, sendMessage, status, stop, error } = useChat<ChatMessage>({
    id: threadId,
    messages: initial,
  });

  // Persist whenever the transcript settles (after send, finish, stop or error).
  const savedSig = useRef(signature(initial));
  useEffect(() => {
    if (status === "streaming") return;
    const sig = signature(messages);
    if (sig === savedSig.current) return;
    savedSig.current = sig;
    onSave(threadId, messages);
  }, [messages, status, threadId, onSave]);

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
  const waiting =
    status === "submitted" || (status === "streaming" && lines.at(-1)?.role !== "assistant");

  const costumeId = costume.id;
  const onSend = useCallback(
    (text: string) => {
      sendMessage(
        { text, metadata: { createdAt: Date.now(), costume: costumeId } },
        { body: { costume: costumeId } },
      );
    },
    [sendMessage, costumeId],
  );

  useOnNewReply(lines, () => onReply(costumeId));

  const Layout = LAYOUTS[costume.layout];
  return (
    <div className="grid h-full grid-rows-[minmax(0,1fr)] place-items-center">
      <div
        ref={winRef}
        className="h-full w-full"
        style={{ maxWidth: costume.window.w, maxHeight: costume.window.h }}
      >
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

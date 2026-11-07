"use client";

import { ChevronDown, PanelLeft, SquarePen, Trash2 } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { relativeDay, type LayoutProps, type ThreadItem } from "./types";

const GROUPS = ["Today", "Yesterday", "Previous 7 days", "Older"];

/** The "no costume" costume: a modern AI chat, built on AI Elements. */
export function CleanLayout({
  costume,
  lines,
  busy,
  waiting,
  error,
  onSend,
  onStop,
  threads,
  activeId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
}: LayoutProps) {
  const saved = threads.filter((t) => !t.draft);
  const onDraft = threads.some((t) => t.draft && t.id === activeId);
  const grouped = GROUPS.map((g) => [g, saved.filter((t) => relativeDay(t.updatedAt) === g)] as const);

  return (
    <div className="flex h-full overflow-hidden rounded-2xl bg-white font-sans text-zinc-900 shadow-2xl shadow-black/15 ring-1 ring-black/5">
      <aside data-threads className="hidden w-[260px] shrink-0 flex-col bg-[#f9f9f8] md:flex">
        <div className="flex items-center justify-between px-3 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500" aria-hidden>
            <PanelLeft className="h-[18px] w-[18px]" />
          </span>
          <button
            onClick={onNewThread}
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-600 hover:bg-zinc-200/70"
            aria-label="New chat"
          >
            <SquarePen className="h-[18px] w-[18px]" />
          </button>
        </div>
        <button
          onClick={onNewThread}
          className={`mx-2 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-zinc-200/60 ${
            onDraft ? "bg-zinc-200/70" : ""
          }`}
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-orange-300 to-fuchsia-500 text-[11px]">
            ✨
          </span>
          gpty
        </button>
        <nav className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3" aria-label="Chats">
          {saved.length === 0 && (
            <p className="px-2.5 py-2 text-xs text-zinc-400">Your chats will show up here.</p>
          )}
          {grouped.map(([g, items]) =>
            items.length ? (
              <div key={g} className="mb-4">
                <div className="px-2.5 pb-1 text-xs font-medium text-zinc-400">{g}</div>
                {items.map((t) => (
                  <ThreadRow
                    key={t.id}
                    t={t}
                    active={t.id === activeId}
                    onSelect={onSelectThread}
                    onDelete={onDeleteThread}
                  />
                ))}
              </div>
            ) : null,
          )}
        </nav>
        <div className="flex items-center gap-2.5 border-t border-zinc-200/70 px-3 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-800 text-xs font-medium text-white">
            G
          </span>
          <div className="min-w-0 text-sm leading-tight">
            <div className="font-medium">Guest</div>
            <div className="text-xs text-zinc-400">Saved on this device</div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between px-4">
          <span className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[17px] font-medium text-zinc-700 hover:bg-zinc-100">
            gpty <span className="text-zinc-400">1.0</span>
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </span>
          <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500">
            Temporary costume: none
          </span>
        </header>

        <Conversation className="min-h-0">
          <ConversationContent className="mx-auto w-full max-w-3xl px-4 md:px-6">
            {lines.length === 0 ? (
              <div className="flex min-h-[45vh] flex-col items-center justify-center gap-2 text-center">
                <h1 className="text-[28px] font-medium tracking-tight">{costume.greeting}</h1>
                <p className="text-sm text-zinc-500">
                  Try a costume from the bar up top. I&apos;ll change my clothes and my voice.
                </p>
              </div>
            ) : (
              lines.map((l) => (
                <Message key={l.id} from={l.role}>
                  <MessageContent>
                    {l.role === "assistant" ? <MessageResponse>{l.text}</MessageResponse> : l.text}
                  </MessageContent>
                </Message>
              ))
            )}
            {waiting && (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="h-3 w-3 animate-pulse rounded-full bg-zinc-800" />
                {costume.typing}
              </div>
            )}
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {costume.error}
              </p>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="mx-auto w-full max-w-3xl px-4 pb-3 md:px-6">
          <PromptInput
            className="rounded-3xl shadow-sm"
            onSubmit={({ text }) => {
              if (busy) return onStop();
              if (text.trim()) onSend(text.trim());
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea placeholder={costume.placeholder} />
            </PromptInputBody>
            <PromptInputFooter>
              <span className="pl-1 text-xs text-zinc-400">Enter to send · Shift+Enter for a new line</span>
              <PromptInputSubmit className="rounded-full" status={busy ? "streaming" : undefined} />
            </PromptInputFooter>
          </PromptInput>
          <p className="pt-2 text-center text-[11px] text-zinc-400">
            gpty can make mistakes, especially in costume.
          </p>
        </div>
      </main>
    </div>
  );
}

function ThreadRow({
  t,
  active,
  onSelect,
  onDelete,
}: {
  t: ThreadItem;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`group flex items-center rounded-lg text-sm ${active ? "bg-zinc-200/70" : "hover:bg-zinc-200/50"}`}
    >
      <button onClick={() => onSelect(t.id)} className="min-w-0 flex-1 truncate px-2.5 py-2 text-left">
        {t.title}
      </button>
      <button
        onClick={() => onDelete(t.id)}
        className="mr-1 hidden rounded p-1 text-zinc-400 hover:text-red-500 group-hover:block focus-visible:block"
        aria-label={`Delete ${t.title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

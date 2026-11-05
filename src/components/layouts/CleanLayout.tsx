"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import type { LayoutProps } from "./types";

/** The "plain clothes" costume: ChatGPT/Gemini style, built on AI Elements. */
export function CleanLayout({
  costume,
  lines,
  busy,
  waiting,
  error,
  onSend,
  onStop,
  onOpenWardrobe,
}: LayoutProps) {
  const empty = lines.length === 0;
  return (
    <div className="flex h-dvh flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold tracking-tight">
          gpty<span className="text-orange-500">.lol</span>
        </span>
        <button
          onClick={onOpenWardrobe}
          className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          🎭 Change costume
        </button>
      </header>

      <Conversation className="min-h-0">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {empty ? (
            <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                {costume.greeting}
              </h1>
              <p className="text-sm text-zinc-500">
                Psst. This app changes costumes. Try the button up top.
              </p>
            </div>
          ) : (
            lines.map((l) => (
              <Message key={l.id} from={l.role}>
                <MessageContent>
                  {l.role === "assistant" ? (
                    <MessageResponse>{l.text}</MessageResponse>
                  ) : (
                    l.text
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {waiting && (
            <p className="animate-pulse text-sm text-zinc-500">
              {costume.typing}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-500">
              {costume.error}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="mx-auto w-full max-w-3xl px-4 pb-5">
        <PromptInput
          onSubmit={({ text }) => {
            if (busy) return onStop();
            if (text.trim()) onSend(text.trim());
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea placeholder={costume.placeholder} />
          </PromptInputBody>
          <PromptInputFooter>
            <span className="text-xs text-zinc-400">
              Enter to send · Shift+Enter for a new line
            </span>
            <PromptInputSubmit status={busy ? "streaming" : undefined} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

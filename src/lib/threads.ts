"use client";

import { useCallback, useState } from "react";
import { currentAgentId, DEFAULT_AGENT } from "./agents";
import type { ChatMessage } from "./types";

/**
 * Threads live in localStorage, owned by an anonymous id generated per browser.
 * Everything goes through this module so it can move to IndexedDB or a server
 * later without touching the UI.
 */

const THREADS_KEY = "gpty.threads.v1";
const ACTIVE_KEY = "gpty.activeThread.v1";
const AGENT_KEY = "gpty.activeAgent.v1";
const USER_KEY = "gpty.userId.v1";
/** Keep storage bounded; oldest threads are dropped first. */
const MAX_THREADS = 50;

export interface Thread {
  id: string;
  ownerId: string;
  /** The agent this thread is with. Every thread belongs to exactly one. */
  agentId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export function newId(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${rand}`;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled: keep working in memory.
  }
}

function getUserId() {
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    id = newId("u");
    write(USER_KEY, id);
  }
  return id;
}

/**
 * Threads saved before agents existed are filed under the costume they were
 * started in; threads with a retired agent go to the agent that replaced it.
 */
function agentOf(t: Thread) {
  const own = currentAgentId(t.agentId);
  if (own) return own;
  const meta = t.messages.find((m) => m.metadata?.agent || m.metadata?.costume)?.metadata;
  return currentAgentId(meta?.agent ?? meta?.costume) ?? DEFAULT_AGENT;
}

function loadThreads(): Thread[] {
  const list = read<Thread[]>(THREADS_KEY, []);
  return Array.isArray(list)
    ? list
        .filter((t) => t && typeof t.id === "string" && Array.isArray(t.messages))
        .map((t) => ({ ...t, agentId: agentOf(t) }))
    : [];
}

export function messageText(m: ChatMessage) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

function titleFrom(messages: ChatMessage[]) {
  const first = messages.find((m) => m.role === "user");
  const text = first ? messageText(first).replace(/\s+/g, " ").trim() : "";
  return text.length > 48 ? `${text.slice(0, 47)}…` : text;
}

export function previewOf(t: Thread) {
  const last = t.messages.at(-1);
  const text = last ? messageText(last).replace(/\s+/g, " ").trim() : "";
  return text.length > 80 ? `${text.slice(0, 79)}…` : text;
}

/**
 * One active agent and one active thread. Opening an agent starts a fresh,
 * unsaved draft with it; the draft becomes a thread once a message is saved.
 */
export function useThreads(initialAgent?: string) {
  // This hook only runs on the client (the app is loaded with ssr: false),
  // so reading localStorage in lazy initializers is safe.
  const [userId] = useState(getUserId);
  const [threads, setThreads] = useState<Thread[]>(loadThreads);
  const [active, setActive] = useState<{ agentId: string; threadId: string }>(() => {
    const saved = loadThreads().find((t) => t.id === localStorage.getItem(ACTIVE_KEY));
    // A link to an agent (/msn) opens a new chat with it, unless the thread
    // you were last in is already with that agent.
    if (initialAgent && saved?.agentId !== initialAgent)
      return { agentId: initialAgent, threadId: newId("t") };
    if (saved) return { agentId: saved.agentId, threadId: saved.id };
    const agent = localStorage.getItem(AGENT_KEY);
    return { agentId: currentAgentId(agent) ?? DEFAULT_AGENT, threadId: newId("t") };
  });

  const commit = useCallback((fn: (prev: Thread[]) => Thread[]) => {
    setThreads((prev) => {
      const next = fn(prev).slice(0, MAX_THREADS);
      write(THREADS_KEY, next);
      return next;
    });
  }, []);

  const show = useCallback((agentId: string, threadId: string) => {
    setActive({ agentId, threadId });
    write(AGENT_KEY, agentId);
    write(ACTIVE_KEY, threadId);
  }, []);

  /** Resume a saved thread (and switch to its agent). */
  const select = useCallback(
    (id: string) => {
      const t = threads.find((x) => x.id === id);
      if (t) show(t.agentId, t.id);
    },
    [threads, show],
  );

  const isDraft = !threads.some((t) => t.id === active.threadId);

  /** Start a new chat with an agent. Reuses the open draft if it's already with them. */
  const openAgent = useCallback(
    (agentId: string) => {
      if (isDraft && agentId === active.agentId) return;
      show(agentId, newId("t"));
    },
    [isDraft, active.agentId, show],
  );

  const saveMessages = useCallback(
    (id: string, agentId: string, messages: ChatMessage[]) => {
      if (!messages.length) return;
      commit((prev) => {
        const now = Date.now();
        const existing = prev.find((t) => t.id === id);
        const thread: Thread = existing
          ? {
              ...existing,
              messages,
              updatedAt: now,
              title: existing.title || titleFrom(messages),
            }
          : {
              id,
              ownerId: userId,
              agentId,
              title: titleFrom(messages),
              createdAt: now,
              updatedAt: now,
              messages,
            };
        return [thread, ...prev.filter((t) => t.id !== id)];
      });
    },
    [commit, userId],
  );

  const deleteThread = useCallback(
    (id: string) => {
      commit((prev) => prev.filter((t) => t.id !== id));
      if (id === active.threadId) show(active.agentId, newId("t"));
    },
    [active, commit, show],
  );

  return {
    userId,
    threads,
    agentId: active.agentId,
    activeId: active.threadId,
    isDraft,
    select,
    openAgent,
    saveMessages,
    deleteThread,
  };
}

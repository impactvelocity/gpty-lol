"use client";

import { useCallback, useState } from "react";
import type { ChatMessage } from "./types";

/**
 * Threads live in localStorage, owned by an anonymous id generated per browser.
 * Everything goes through this module so it can move to IndexedDB or a server
 * later without touching the UI.
 */

const THREADS_KEY = "gpty.threads.v1";
const ACTIVE_KEY = "gpty.activeThread.v1";
const USER_KEY = "gpty.userId.v1";
/** Keep storage bounded; oldest threads are dropped first. */
const MAX_THREADS = 50;

export interface Thread {
  id: string;
  ownerId: string;
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

function loadThreads(): Thread[] {
  const list = read<Thread[]>(THREADS_KEY, []);
  return Array.isArray(list)
    ? list.filter((t) => t && typeof t.id === "string" && Array.isArray(t.messages))
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

export function useThreads() {
  // This hook only runs on the client (the app is loaded with ssr: false),
  // so reading localStorage in lazy initializers is safe.
  const [userId] = useState(getUserId);
  const [threads, setThreads] = useState<Thread[]>(loadThreads);
  const [activeId, setActiveId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_KEY);
    return saved && loadThreads().some((t) => t.id === saved) ? saved : newId("t");
  });

  const commit = useCallback((fn: (prev: Thread[]) => Thread[]) => {
    setThreads((prev) => {
      const next = fn(prev).slice(0, MAX_THREADS);
      write(THREADS_KEY, next);
      return next;
    });
  }, []);

  const select = useCallback((id: string) => {
    setActiveId(id);
    write(ACTIVE_KEY, id);
  }, []);

  const saveMessages = useCallback(
    (id: string, messages: ChatMessage[]) => {
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
              title: titleFrom(messages),
              createdAt: now,
              updatedAt: now,
              messages,
            };
        return [thread, ...prev.filter((t) => t.id !== id)];
      });
      write(ACTIVE_KEY, id);
    },
    [commit, userId],
  );

  const isDraft = !threads.some((t) => t.id === activeId);

  const newThread = useCallback(() => {
    // An unsaved, empty thread is already open: reuse it.
    if (isDraft) return;
    select(newId("t"));
  }, [isDraft, select]);

  const deleteThread = useCallback(
    (id: string) => {
      commit((prev) => prev.filter((t) => t.id !== id));
      if (id === activeId) select(newId("t"));
    },
    [activeId, commit, select],
  );

  return {
    userId,
    threads,
    activeId,
    isDraft,
    select,
    saveMessages,
    newThread,
    deleteThread,
  };
}

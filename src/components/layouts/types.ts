import type { Costume } from "@/lib/costumes";

export interface ChatLine {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Wall-clock time the message was created (ms). 0 if unknown. */
  at: number;
}

export interface ThreadItem {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
  /** An empty thread that hasn't been saved yet. */
  draft?: boolean;
}

export interface LayoutProps {
  costume: Costume;
  lines: ChatLine[];
  /** true while the assistant is working (submitted or streaming). */
  busy: boolean;
  /** true after submit and before the first token arrives. */
  waiting: boolean;
  error: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  threads: ThreadItem[];
  activeId: string;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
}

export function clock(at: number, seconds = false) {
  return new Date(at || Date.now()).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
  });
}

/** "why is the sky blue?" -> "why-is-the-sky-blue" */
export function slug(title: string, fallback: string) {
  const s = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28)
    .replace(/-+$/g, "");
  return s || fallback;
}

export function relativeDay(at: number) {
  const d = new Date(at);
  const today = new Date();
  const days = Math.floor(
    (new Date(today.toDateString()).getTime() -
      new Date(d.toDateString()).getTime()) /
      86_400_000,
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "Previous 7 days";
  return "Older";
}

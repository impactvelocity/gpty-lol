import type { Costume } from "@/lib/costumes";

export interface ChatLine {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Wall-clock time the line first appeared on this client. */
  at: number;
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
  onOpenWardrobe: () => void;
}

export function clock(at: number) {
  return new Date(at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

import type { UIMessage } from "ai";

/** Chat message with a client-visible creation time (ms since epoch). */
export type ChatMessage = UIMessage<{ createdAt?: number }>;

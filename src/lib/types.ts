import type { UIMessage } from "ai";

/** Chat message metadata: creation time (ms since epoch) and the costume it was sent in. */
export type ChatMessage = UIMessage<{ createdAt?: number; costume?: string }>;

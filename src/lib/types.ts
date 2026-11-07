import type { UIMessage } from "ai";

/** Chat message metadata: creation time (ms since epoch) and the agent it was sent to. */
export type ChatMessage = UIMessage<{ createdAt?: number; agent?: string; /** Legacy (pre-agents). */ costume?: string }>;

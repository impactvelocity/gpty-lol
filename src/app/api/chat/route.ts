import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  type ToolSet,
  toUIMessageStream,
} from "ai";
import { systemPromptFor } from "@/lib/personas";
import type { ChatMessage } from "@/lib/types";

export const maxDuration = 60;

const MODEL = process.env.AI_MODEL ?? "anthropic/claude-sonnet-5.5";

export async function POST(req: Request) {
  const { messages, agent }: { messages: ChatMessage[]; agent?: string } = await req.json();

  const result = streamText({
    model: MODEL,
    // The persona lives on the server; the client only sends an agent id.
    system: systemPromptFor(typeof agent === "string" ? agent : ""),
    // Threads can grow long; only the recent history is sent to the model.
    messages: await convertToModelMessages(messages.slice(-40)),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream<ToolSet, ChatMessage>({
      stream: result.stream,
      messageMetadata: ({ part }) =>
        part.type === "start" ? { createdAt: Date.now() } : undefined,
    }),
  });
}

import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  type ToolSet,
  toUIMessageStream,
} from "ai";
import { maxOutputTokensFor, systemPromptFor } from "@/lib/personas";
import type { ChatMessage } from "@/lib/types";

export const maxDuration = 60;

const MODEL = process.env.AI_MODEL ?? "anthropic/claude-sonnet-5.5";

export async function POST(req: Request) {
  const { messages, costume }: { messages: ChatMessage[]; costume?: string } =
    await req.json();

  const costumeId = typeof costume === "string" ? costume : "clean";
  const result = streamText({
    model: MODEL,
    maxOutputTokens: maxOutputTokensFor(costumeId),
    // The persona lives on the server; the client only sends a costume id.
    system: systemPromptFor(costumeId),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream<ToolSet, ChatMessage>({
      stream: result.stream,
      messageMetadata: ({ part }) =>
        part.type === "start" ? { createdAt: Date.now() } : undefined,
    }),
  });
}

import { google } from "@ai-sdk/google";
import { UIMessage, convertToModelMessages, streamText } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-pro"),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

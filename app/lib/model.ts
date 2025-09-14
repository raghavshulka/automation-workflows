import { google } from "@ai-sdk/google";
import {
  UIMessage,
  convertToModelMessages,
  generateText,
  stepCountIs,
  streamText,
} from "ai";
import { tools } from "../api/tool/route";

type RequestContext = "telegram" | "web";

export async function handleAIRequest(
  messages: UIMessage[],
  RequestContext: any
) {
  if (RequestContext == "telegram") {
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system:
        "you support chat and tools call and rag chat and generate images",
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(5), // Use maxSteps instead of stopWhen for generateText
    });
    return result.text;
  } else {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system:
        "you support chat and tools call and rag chat and generate images",
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(5),
    });
    return result.toUIMessageStreamResponse();
  }
}

import { google } from "@ai-sdk/google";
import {
  type InferUITools,
  type ToolSet,
  stepCountIs,
  streamText,
  tool,
} from "ai";
import {  z } from "zod";

function calculateSum(a: number, b: number) {
  return a + b;
}

const tools = {
  sum: tool({
    description: "have to calculate sum of numbers ",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    execute: async ({ a, b }) => {
      const result = calculateSum(a, b);
      console.log(`Sum: ${a} + ${b} = ${result}`);
    },
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;

export async function POST(req: Request) {
  const messages: any = "what is 2+2";

  const result = streamText({
    model: google("gemini-2.5-pro"),
    prompt: messages,
    tools,
  });

  return result.toUIMessageStreamResponse();
}

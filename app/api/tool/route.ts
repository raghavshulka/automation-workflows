import { google } from "@ai-sdk/google";
import {
  type InferUITools,
  type ToolSet,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
} from "ai";
import { z } from "zod";

function calculateSum(a: number, b: number) {
  return a + b;
}
function calculatesub(a: number, b: number) {
  return a + -b;
}
function calculatediv(a: number, b: number) {
  return a / b;
}
function calculatemul(a: number, b: number) {
  return a * b;
}
function calculateexp(a: number, b: number) {
  return a ^ b;
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
      return result;
    },
  }),

  sub: tool({
    description: "have to calculate sum of numbers ",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    execute: async ({ a, b }) => {
      const result = calculatesub(a, b);
      return result;
    },
  }),

  mul: tool({
    description: "have to calculate sum of numbers ",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    execute: async ({ a, b }) => {
      const result = calculatemul(a, b);
      return result;
    },
  }),

  div: tool({
    description: "have to calculate sum of numbers ",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    execute: async ({ a, b }) => {
      const result = calculatediv(a, b);
      return result;
    },
  }),

  exp: tool({
    description: "have to calculate sum of numbers ",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    execute: async ({ a, b }) => {
      const result = calculateexp(a, b);
      return result;
    },
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    prompt: convertToModelMessages(messages),
    tools,
  });

  return result.toUIMessageStreamResponse();
}

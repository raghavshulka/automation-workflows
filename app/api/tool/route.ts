import { google } from "@ai-sdk/google";
import {
  type InferUITools,
  type ToolSet,
  UIMessage,
  convertToModelMessages,
  experimental_generateImage,
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

  generate_image: tool({
    description: "Generate an image",
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to generate the image from"),
    }),
    execute: async ({ prompt }) => {
      const { image } = await experimental_generateImage({
        model: google.imageModel("imagen-4.0-generate-001"),
        prompt,
      });
      return { image: image.base64, prompt };
    },
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: "you support chat and  tools call and rag chat and genrate images",
    prompt: convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}

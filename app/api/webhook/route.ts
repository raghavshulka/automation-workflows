import { handleAIRequest } from "@/app/lib/model";
import { UIMessage } from "ai";
import { AirVent } from "lucide-react";
import { NextRequest, NextResponse } from "next/server";
import { promise } from "zod";
import { da } from "zod/v4/locales";
interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

//webhook setup
export async function setupWebhook(webhookUrl: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  console.log(botToken);

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }

  const url = `https://api.telegram.org/bot${botToken}/setWebhook`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
      }),
    });

    const result = await response.json();
    console.log("Webhook setup result:", result);
    return result;
  } catch (error) {
    console.error("Error setting webhook:", error);
    throw error;
  }
}

// user recive
export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();
    if (update.message) {
      await handleMessage(update.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

async function handleMessage(message: TelegramMessage) {
  if (!message.text) return;
  const uiMessages: UIMessage[] = [
    {
      id: String(message.message_id),
      role: "user",
      parts: [
        {
          type: "text",
          text: message.text ?? "",
          state: "done",
        },
      ],
    },
  ];

  const aiResponse = await handleAIRequest(uiMessages,'telegram');

  await sendMessage(message.chat.id, aiResponse);
}

// Send message to Telegram
async function sendMessage(chatId: number, data: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  let text = "";
  if (typeof data === "string") {
    text = data;
  } else if (data?.message?.content) {
    // case: AI returns UIMessage
    text = data.message.content
      .map((c: any) => (c.type === "text" ? c.text : ""))
      .join(" ");
  } else {
    text = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API error:", errorData);
      return;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// test
export async function GET() {
  return NextResponse.json({
    message: "Telegram webhook is running",
    timestamp: new Date().toISOString(),
  });
}

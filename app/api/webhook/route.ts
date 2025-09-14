import { NextRequest, NextResponse } from "next/server";

// Types for Telegram webhook data
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

// Handle POST requests from Telegram
export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();
    console.log("Received update:", update);
    if (update.message) {
      await handleMessage(update.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// Handle GET requests (optional - for testing)
export async function GET() {
  return NextResponse.json({
    message: "Telegram webhook is running",
    timestamp: new Date().toISOString(),
  });
}
async function handleMessage(message: TelegramMessage) {
  const chatId = message.chat.id;
  const text = message.text;
  const user = message.from;

  console.log(`Message from ${user.first_name}: ${text}`);

  if (text === "/start") {
    await sendMessage(
      chatId,
      `Hello ${user.first_name}! Send me any message and I'll echo it back.`
    );
  } else if (text) {
    await sendMessage(chatId, `You said: ${text}`);
  }
}

// Send message to Telegram
async function sendMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API error:", errorData);
      return;
    }

    const result = await response.json();
    console.log("Message sent successfully");
    return result;
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Utility function to set up webhook (call this once)
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

import TelegramBot from "node-telegram-bot-api";
import { chatWithAgent } from "./agentRuntime.js";

interface AgentInfo {
  id: number;
  name: string;
  provider: string;
  skills: string[];
  system_prompt?: string;
}

const activeBots = new Map<number, TelegramBot>();

export function startTelegramBot(agent: AgentInfo, botToken: string): { success: boolean; error?: string } {
  if (activeBots.has(agent.id)) {
    stopTelegramBot(agent.id);
  }

  try {
    const bot = new TelegramBot(botToken, { polling: true });

    bot.on("message", async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (!text) return;

      if (text === "/start") {
        await bot.sendMessage(
          chatId,
          `👋 Hi! I'm *${agent.name}*, an AI agent powered by ${agent.provider} and hosted on ClawNest.\n\nSend me any message and I'll respond!`,
          { parse_mode: "Markdown" }
        );
        return;
      }

      try {
        await bot.sendChatAction(chatId, "typing");

        const response = await chatWithAgent(agent.id, agent, text);

        const MAX_LENGTH = 4000;
        if (response.length > MAX_LENGTH) {
          const parts = response.match(new RegExp(`.{1,${MAX_LENGTH}}`, "gs")) || [];
          for (const part of parts) {
            await bot.sendMessage(chatId, part);
          }
        } else {
          await bot.sendMessage(chatId, response);
        }
      } catch (error) {
        console.error(`Telegram bot error for agent ${agent.id}:`, error);
        await bot.sendMessage(chatId, "Sorry, I encountered an error processing your message. Please try again.");
      }
    });

    bot.on("polling_error", (error) => {
      console.error(`Telegram polling error for agent ${agent.id}:`, error.message);
    });

    activeBots.set(agent.id, bot);
    console.log(`Telegram bot started for agent ${agent.id} (${agent.name})`);
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to start Telegram bot for agent ${agent.id}:`, error);
    return { success: false, error: error.message };
  }
}

export function stopTelegramBot(agentId: number): boolean {
  const bot = activeBots.get(agentId);
  if (bot) {
    bot.stopPolling();
    activeBots.delete(agentId);
    console.log(`Telegram bot stopped for agent ${agentId}`);
    return true;
  }
  return false;
}

export function isTelegramBotActive(agentId: number): boolean {
  return activeBots.has(agentId);
}

export function getActiveBotCount(): number {
  return activeBots.size;
}

export function stopAllBots(): void {
  for (const [agentId] of activeBots) {
    stopTelegramBot(agentId);
  }
}

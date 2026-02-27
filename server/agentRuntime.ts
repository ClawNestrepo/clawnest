import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const agentHistories = new Map<number, ChatMessage[]>();

function getSystemPrompt(agent: {
  name: string;
  provider: string;
  skills: string[];
  system_prompt?: string;
}): string {
  if (agent.system_prompt) return agent.system_prompt;

  const skillDescriptions: Record<string, string> = {
    web_search: "You can help users find information from the internet.",
    code_exec: "You can help users write and reason about code.",
    data_analysis: "You can help users analyze data and provide insights.",
    image_gen: "You can help describe and plan image generation.",
  };

  const skillText = agent.skills
    .map((s) => skillDescriptions[s] || s)
    .join(" ");

  return `You are "${agent.name}", an AI agent hosted on ClawNest running on ${agent.provider}. ${skillText} Be helpful, professional, and concise. Respond in the same language the user writes in.`;
}

export async function chatWithAgent(
  agentId: number,
  agent: { name: string; provider: string; skills: string[]; system_prompt?: string },
  userMessage: string
): Promise<string> {
  if (!agentHistories.has(agentId)) {
    agentHistories.set(agentId, []);
  }

  const history = agentHistories.get(agentId)!;
  history.push({ role: "user", content: userMessage });

  if (history.length > 40) {
    history.splice(0, history.length - 40);
  }

  const messages: ChatMessage[] = [
    { role: "system", content: getSystemPrompt(agent) },
    ...history,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  const assistantMessage = response.choices[0]?.message?.content || "No response generated.";
  history.push({ role: "assistant", content: assistantMessage });

  return assistantMessage;
}

export function clearAgentHistory(agentId: number) {
  agentHistories.delete(agentId);
}

export async function chatSupport(userMessage: string, sessionId: string): Promise<string> {
  const supportKey = `support_${sessionId}`;
  const id = parseInt(supportKey.replace(/\D/g, "").slice(0, 8) || "0");

  if (!agentHistories.has(id)) {
    agentHistories.set(id, []);
  }

  const history = agentHistories.get(id)!;
  history.push({ role: "user", content: userMessage });

  if (history.length > 20) {
    history.splice(0, history.length - 20);
  }

  const systemPrompt = `You are "Nestor", the AI support assistant for ClawNest.
ClawNest is a managed hosting platform for AI agents.

Key selling points:
- Hosted in Sweden (EU), GDPR friendly, 100% renewable energy.
- No Docker/VPS maintenance. Managed infrastructure.
- Uses AI Integrations for all LLM calls - no API keys needed from users.
- Pricing: Starter (€9.6/mo), Pro (€24/mo), Team (€89/mo).
- Features: Auto-backups, Tailscale VPN (Pro/Team), Shell access (Pro/Team).
- Telegram bot integration for agents.

Your goal is to answer visitor questions about ClawNest features, pricing, and security.
Keep answers concise (under 3 sentences usually) and helpful.
Tone: Professional, tech-savvy, but approachable.
Respond in the same language the user writes in.
If asked about technical support issues you can't solve, tell them to email support@clawnest.eu.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 512,
    temperature: 0.7,
  });

  const reply = response.choices[0]?.message?.content || "Sorry, I'm having trouble right now.";
  history.push({ role: "assistant", content: reply });

  return reply;
}

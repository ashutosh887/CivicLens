import OpenAI from "openai";
import { AI_CONFIG } from "@/config/ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  messages: AIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export async function openAIChatCompletion(
  options: ChatOptions
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await openai.chat.completions.create({
    model: options.model || AI_CONFIG.openai.defaultModel,
    messages: options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: options.temperature ?? AI_CONFIG.openai.defaultTemperature,
    max_tokens: options.max_tokens ?? AI_CONFIG.openai.defaultMaxTokens,
    stream: false,
  });

  return response.choices[0]?.message?.content || "";
}

export async function* openAIChatStream(
  options: ChatOptions
): AsyncGenerator<string, void, unknown> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const stream = await openai.chat.completions.create({
    model: options.model || AI_CONFIG.openai.defaultModel,
    messages: options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: options.temperature ?? AI_CONFIG.openai.streaming.defaultTemperature,
    max_tokens: options.max_tokens ?? AI_CONFIG.openai.streaming.defaultMaxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}


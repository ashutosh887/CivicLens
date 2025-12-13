
import { openAIChatCompletion, openAIChatStream, AIMessage } from "./openai";
import {
  getChatMessages,
  CLASSIFICATION_PROMPT,
  EXTRACTION_PROMPT,
  DOCUMENT_PROMPT_TEMPLATES,
} from "./prompts";
import { AI_CONFIG } from "@/config/ai";

export async function getChatCompletion(
  userQuery: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> {
  const messages = getChatMessages(userQuery, conversationHistory);

  try {
    return await openAIChatCompletion({ messages });
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

export async function* getChatStream(
  userQuery: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): AsyncGenerator<string, void, unknown> {
  const messages = getChatMessages(userQuery, conversationHistory);

  try {
    yield* openAIChatStream({ messages });
  } catch (error) {
    console.error("OpenAI streaming error:", error);
    const response = await getChatCompletion(userQuery, conversationHistory);
    for (const char of response) {
      yield char;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}

export async function classifyQuery(query: string): Promise<string> {
  const prompt = CLASSIFICATION_PROMPT.replace("{query}", query);
  const messages: AIMessage[] = [
    { role: "system", content: "You are a query classification assistant. Respond with only the category name." },
    { role: "user", content: prompt },
  ];

  try {
    const response = await openAIChatCompletion({
      messages,
      temperature: AI_CONFIG.openai.classification.temperature,
      max_tokens: AI_CONFIG.openai.classification.maxTokens,
    });
    return response.trim().toLowerCase();
  } catch (error) {
    console.error("Classification failed:", error);
    return "general_info";
  }
}

export async function extractEntities(query: string): Promise<{
  entities: string[];
  intent: string;
  key_points: string[];
  suggested_actions: string[];
}> {
  const prompt = EXTRACTION_PROMPT.replace("{query}", query);
  const messages: AIMessage[] = [
    { role: "system", content: "You are an entity extraction assistant. Return only valid JSON." },
    { role: "user", content: prompt },
  ];

  try {
    const response = await openAIChatCompletion({
      messages,
      temperature: AI_CONFIG.openai.extraction.temperature,
      max_tokens: AI_CONFIG.openai.extraction.maxTokens,
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("No JSON found in response");
  } catch (error) {
    console.error("Extraction failed:", error);
    return {
      entities: [],
      intent: "general_info",
      key_points: [],
      suggested_actions: [],
    };
  }
}

export async function generateDocument(
  type: "rti" | "complaint" | "eligibility_summary",
  params: Record<string, string>
): Promise<string> {
  const template = DOCUMENT_PROMPT_TEMPLATES[type];
  let prompt = template;

  for (const [key, value] of Object.entries(params)) {
    prompt = prompt.replace(`{${key}}`, value);
  }

  const messages: AIMessage[] = [
    { role: "system", content: "You are a document drafting assistant. Create well-formatted, professional documents." },
    { role: "user", content: prompt },
  ];

  try {
    return await openAIChatCompletion({
      messages,
      temperature: AI_CONFIG.openai.document.temperature,
      max_tokens: AI_CONFIG.openai.document.maxTokens,
    });
  } catch (error) {
    console.error("Document generation failed:", error);
    throw error;
  }
}


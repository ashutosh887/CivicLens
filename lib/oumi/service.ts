/**
 * Oumi Service
 * 
 * Service for interacting with Oumi fine-tuned models.
 * Handles model queries, training status, and fallback to OpenAI.
 */

import { OUMI_CONFIG } from "@/config/oumi";
import { openAIChatCompletion } from "@/lib/ai/openai";
import type { AIMessage } from "@/lib/ai/openai";

export interface OumiQueryRequest {
  query: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  useFineTuned?: boolean; // Force use of fine-tuned model
}

export interface OumiQueryResponse {
  response: string;
  model: "oumi" | "openai";
  timestamp: Date;
}

/**
 * Query the Oumi fine-tuned model
 * Falls back to OpenAI if Oumi is not available
 */
export async function queryOumiModel(
  request: OumiQueryRequest
): Promise<OumiQueryResponse> {
  const { query, conversationHistory = [], useFineTuned = false } = request;

  // Check if we should use Oumi
  const shouldUseOumi = useFineTuned || OUMI_CONFIG.isModelAvailable();

  if (shouldUseOumi && OUMI_CONFIG.modelUrl) {
    try {
      const response = await queryOumiAPI(query, conversationHistory);
      return {
        response,
        model: "oumi",
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Oumi model query failed, falling back to OpenAI:", error);
      // Fall through to OpenAI fallback
    }
  }

  // Fallback to OpenAI
  const messages: AIMessage[] = [
    {
      role: "system",
      content: "You are a helpful assistant specialized in civic queries and government schemes across multiple countries (India, USA, UK, Canada, Australia). Provide accurate, detailed information about government programs, eligibility criteria, application processes, and required documents.",
    },
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    {
      role: "user",
      content: query,
    },
  ];

  const response = await openAIChatCompletion({ messages });

  return {
    response,
    model: "openai",
    timestamp: new Date(),
  };
}

/**
 * Query Oumi API endpoint
 */
async function queryOumiAPI(
  query: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  if (!OUMI_CONFIG.modelUrl) {
    throw new Error("Oumi model URL not configured");
  }

  const response = await fetch(`${OUMI_CONFIG.modelUrl}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(OUMI_CONFIG.apiKey && { Authorization: `Bearer ${OUMI_CONFIG.apiKey}` }),
    },
    body: JSON.stringify({
      messages: [
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: query,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Oumi API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response || data.message || data.text || "";
}

/**
 * Check if Oumi model is available
 */
export async function checkOumiModelStatus(): Promise<{
  available: boolean;
  modelUrl?: string;
  error?: string;
}> {
  if (!OUMI_CONFIG.isConfigured()) {
    return {
      available: false,
      error: "Oumi not configured. Set OUMI_MODEL_URL and OUMI_ENABLED=true",
    };
  }

  if (!OUMI_CONFIG.modelUrl) {
    return {
      available: false,
      error: "Oumi model URL not set",
    };
  }

  try {
    const response = await fetch(`${OUMI_CONFIG.modelUrl}/health`, {
      method: "GET",
      headers: {
        ...(OUMI_CONFIG.apiKey && { Authorization: `Bearer ${OUMI_CONFIG.apiKey}` }),
      },
    });

    if (response.ok) {
      return {
        available: true,
        modelUrl: OUMI_CONFIG.modelUrl,
      };
    }

    return {
      available: false,
      modelUrl: OUMI_CONFIG.modelUrl,
      error: `Health check failed: ${response.statusText}`,
    };
  } catch (error: any) {
    return {
      available: false,
      modelUrl: OUMI_CONFIG.modelUrl,
      error: error.message || "Failed to connect to Oumi model",
    };
  }
}

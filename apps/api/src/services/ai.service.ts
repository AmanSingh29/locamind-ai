import { apiServiceFetcher } from "../utils/apiServiceFetcher.js";

export interface AIChatRequest {
  message: string;
}

export interface AIChatResponse {
  response: string;
  model: string;
}

export interface AIHealthResponse {
  status: string;
  service: string;
}

/**
 * Generates an AI chat response by calling the upstream AI service.
 */
export async function generateAIResponse(
  message: string,
): Promise<AIChatResponse> {
  return apiServiceFetcher<AIChatResponse>("/api/chat/", {
    method: "POST",
    body: { message },
  });
}

/**
 * Checks connectivity and operational status of the upstream AI service.
 */
export async function checkAIHealth(): Promise<AIHealthResponse> {
  return apiServiceFetcher<AIHealthResponse>("/health", {
    method: "GET",
    timeoutMs: 5000,
  });
}

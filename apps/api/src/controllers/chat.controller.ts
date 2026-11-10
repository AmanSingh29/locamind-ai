import type { Request, Response } from "express";
import { generateAIResponse } from "../services/ai.service.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccess } from "../utils/apiResponse.js";

interface ChatRequestBody {
  message: string;
}

/**
 * Handles incoming chat message requests and delegates to the AI service
 */
export async function sendMessage(
  req: Request,
  res: Response,
): Promise<Response> {
  const { message } = req.body as ChatRequestBody;

  if (!message || typeof message !== "string" || !message.trim()) {
    throw ApiError.badRequest("Message is required and must be a non-empty string");
  }

  const trimmedMessage = message.trim();
  const result = await generateAIResponse(trimmedMessage);

  return sendSuccess(res, result, "AI response generated successfully");
}

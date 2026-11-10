import { Router } from "express";
import { sendMessage } from "../../controllers/chat.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { rateLimiter } from "../../middlewares/rateLimiter.js";
import { validateBody } from "../../middlewares/validateRequest.js";

const router = Router();

const validateChatPayload = (body: unknown): string | null => {
  const payload = body as { message?: unknown } | undefined;
  if (!payload || typeof payload.message !== "string" || !payload.message.trim()) {
    return "Message is required and must be a non-empty string";
  }
  return null;
};

// 30 chat requests per minute per IP limit to protect local Ollama / AI service
const chatRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many chat requests sent. Please wait a moment before trying again.",
});

router.post(
  "/",
  chatRateLimiter,
  validateBody(validateChatPayload),
  asyncHandler(sendMessage),
);

export default router;

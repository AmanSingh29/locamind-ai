import { ChatApiResponse } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function sendMessage(message: string): Promise<ChatApiResponse> {
  const response = await fetch(`${API_URL}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  const result: ChatApiResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to generate response");
  }

  return result;
}

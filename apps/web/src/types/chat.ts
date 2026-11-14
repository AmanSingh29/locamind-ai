export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface ChatApiResponse {
  success: boolean;
  data?: {
    response: string;
    model: string;
  };
  message?: string;
}

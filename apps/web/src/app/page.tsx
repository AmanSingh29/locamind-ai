"use client";

import { useState } from "react";
import { sendMessage } from "@/services/chat.service";
import { ChatMessage } from "@/types/chat";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const message = input.trim();

    if (!message || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await sendMessage(message);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.data?.response || "No response received.",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          error instanceof Error
            ? `Error: ${error.message}`
            : "Something went wrong.",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#0b0d12] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <h1 className="text-xl font-semibold">LocalMind AI</h1>
        <p className="text-sm text-gray-400">Your private local AI assistant</p>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 overflow-y-auto px-5 py-8">
        {messages.length === 0 && (
          <div className="m-auto text-center">
            <h2 className="text-3xl font-semibold">Welcome to LocalMind AI</h2>
            <p className="mt-3 text-gray-400">
              Ask anything. Your AI runs locally.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-2xl px-5 py-3 ${
              message.role === "user"
                ? "ml-auto bg-blue-600"
                : "mr-auto bg-[#1b1e27]"
            }`}
          >
            <p className="mb-2 text-xs font-semibold uppercase text-gray-300">
              {message.role === "user" ? "You" : "LocalMind AI"}
            </p>
            <p className="whitespace-pre-wrap leading-7">{message.content}</p>
          </div>
        ))}

        {loading && (
          <div className="mr-auto rounded-xl bg-[#1b1e27] px-5 py-3 text-gray-400">
            LocalMind is thinking...
          </div>
        )}
      </section>

      <footer className="mx-auto w-full max-w-4xl px-5 pb-6">
        <div className="flex gap-3 rounded-2xl border border-white/10 bg-[#171a22] p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask LocalMind anything..."
            rows={2}
            className="flex-1 resize-none bg-transparent p-2 outline-none"
          />

          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="self-end rounded-xl bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-gray-500">
          Powered by Ollama · Local inference
        </p>
      </footer>
    </main>
  );
}

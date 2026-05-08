/** @format */

// src/components/AdvisorChat.tsx
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askAdvisor } from "../services/advisor";
import ModaldoFace from "./ModaldoFace";
import ChatInput from "./ChatInput";
import { useToken } from "../hooks/useToken";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "advisor_chat_messages";

export const AdvisorChat: React.FC = React.memo(() => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didInitial = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: didInitial.current ? "smooth" : "auto",
      });
      didInitial.current = true;
    }
  }, [messages]);

  const { getTokenWithRetry } = useToken();

  const send = async (content: string) => {
    if (!content.trim() || loading) return;
    const userMsg: Message = { role: "user", content };
    setMessages((ms) => [...ms, userMsg]);
    setLoading(true);
    try {
      const lastTurns = 3;
      const lastMessages = messages.slice(-lastTurns * 2).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const token = await getTokenWithRetry();
      if (!token) return;
      const reply = await askAdvisor(
        { message: content, history: lastMessages },
        token
      );
      setMessages((ms) => [...ms, { role: "assistant", content: reply }]);
    } catch {
      setMessages((ms) => [
        ...ms,
        { role: "assistant", content: "❌ Error al conectar con el asesor." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleReset = () => {
      setMessages([
        {
          role: "assistant",
          content: "Hola, ¿en qué puedo ayudarte hoy?",
        },
      ]);
    };
    window.addEventListener("advisor-chat-reset", handleReset);
    return () => {
      window.removeEventListener("advisor-chat-reset", handleReset);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-800 shadow-lg rounded-lg">
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4
                       [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <div className="mr-2 w-10 h-10 flex items-center justify-center bg-blue-300 rounded-full">
                <ModaldoFace />
              </div>
            )}
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                m.role === "user"
                  ? "bg-blue-100 text-gray-800 dark:bg-blue-900 dark:text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-200"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <ChatInput onSend={send} loading={loading} />
    </div>
  );
});

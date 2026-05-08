/** @format */

// src/components/ChatInput.tsx
import React, { useRef, useState, KeyboardEvent } from "react";
import Loading from "./Loading";
import { Send } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

interface ChatInputProps {
  onSend: (message: string) => void;
  loading: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = React.memo(
  ({ onSend, loading, placeholder = "Escribe tu mensaje..." }) => {
    const taRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState("");

    // Ajusta la altura automático
    const adjust = () => {
      const ta = taRef.current;
      if (!ta) return;
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    };

    // Handle tecleo: actualiza estado y reajusta alto
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      adjust();
    };

    // Enter sin shift envía
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    };

    const submit = () => {
      const content = value.trim();
      if (!content || loading) return;
      onSend(content);
      setValue("");
      // tras limpiar, reajusto la altura
      if (taRef.current) {
        taRef.current.style.height = "auto";
      }
    };

    // Deshabilitado si está vacío o cargando
    const isDisabled = !value.trim() || loading;

    return (
      <div className="flex items-end gap-2 p-3 border-t border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-t-xl">
        <TextareaAutosize
          ref={taRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          minRows={1}
          maxRows={6}
          className="
    flex-1
    min-h-[2.5rem]      
    max-h-[6rem]         
    overflow-y-auto     
    px-4 py-2
    border border-gray-300 dark:border-neutral-600
    bg-transparent
    rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500
    text-gray-800 dark:text-white
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:rounded-full
    [&::-webkit-scrollbar-track]:bg-gray-100
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-gray-300
    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
  "
          disabled={loading}
        />
        <button
          onClick={submit}
          disabled={isDisabled}
          className={`p-2 rounded-lg text-white flex-shrink-0 ${
            isDisabled
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          aria-label="Enviar mensaje"
        >
          {loading ? <Loading /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    );
  }
);

export default ChatInput;

import React, { useState } from "react";
import { AdvisorChat } from "./AdvisorChat";
import { MessageCircle, X } from "lucide-react";

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const toggle = () => {
    setOpen((o) => !o);
    setHasOpened(true);
  };

  return (
    <>
      <div
        className={`fixed bottom-20 right-4 w-full max-w-md h-[36rem]
                    bg-white dark:bg-neutral-800 rounded-xl shadow-lg flex flex-col overflow-hidden z-50
                    transform transition-transform duration-200
                    ${
                      open
                        ? "translate-y-0 opacity-100"
                        : "translate-y-full opacity-0 pointer-events-none"
                    }`}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-800 dark:text-neutral-200">
              ModaldoBot
            </h4>
            <button
              onClick={() => {
                localStorage.removeItem("advisor_chat_messages");
                window.dispatchEvent(new Event("advisor-chat-reset"));
              }}
              className="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              🗑️ Reset
            </button>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-neutral-400" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {hasOpened && <AdvisorChat />}
        </div>
      </div>

      <button
        onClick={toggle}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700
                   text-white rounded-full flex items-center justify-center shadow-xl z-50 focus:outline-none"
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
};

export default ChatWidget;

import React, { createContext, useContext, useState } from "react";

const DEFAULT_MESSAGES = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Namaste. I am your PrithviNet assistant. Ask me about air, water, noise trends, regional offices or alerts in Chhattisgarh.",
  },
];

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  return (
    <ChatContext.Provider value={{ messages, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

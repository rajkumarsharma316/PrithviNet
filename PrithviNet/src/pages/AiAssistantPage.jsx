import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send, Bot, User, Lightbulb } from "lucide-react";
import { aiChat } from "../api";

const SUGGESTIONS = [
  "Summarise the latest environmental alerts in Chhattisgarh.",
  "Which regions currently have the poorest air quality and why?",
  "Explain today's water quality status for monitored rivers.",
  "Suggest 3 actions industries can take to improve compliance.",
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Namaste. I am your PrithviNet assistant. Ask me about air, water, noise trends, regional offices or alerts in Chhattisgarh.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError("");

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const historyPayload = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const res = await aiChat(trimmed, historyPayload);
    setLoading(false);

    if (!res.ok) {
      setError(res.data?.error || "AI assistant is unavailable.");
      return;
    }

    const aiMsg = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: res.data.reply || "",
    };

    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleSuggestion = (s) => {
    setInput(s);
    void sendMessage(s);
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 260px) 1fr",
        height: "100%",
        gap: "0",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          borderRight: "1px solid var(--border-subtle)",
          padding: "18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          background: "var(--surface-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              color: "white",
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--text-muted)",
              }}
            >
              PrithviNet Copilot
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              Ask about your data
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          The assistant has access to recent alerts, regional offices and monitoring
          data. It will not make changes — only explain and summarise.
        </div>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--text-muted)",
            }}
          >
            Suggested questions
          </div>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              style={{
                textAlign: "left",
                padding: "8px 8px",
                fontSize: "0.8rem",
                border: "1px solid var(--border-subtle)",
                background: "white",
                color: "var(--text-secondary)",
                display: "flex",
                gap: 6,
                alignItems: "flex-start",
              }}
            >
              <Lightbulb size={14} style={{ marginTop: 2 }} />
              <span>{s}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat column */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          Conversations are generated by a local Ollama model (
          <code>qwen2.5:1.5b</code>). Please verify important decisions with experts.
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((m) => (
            <ChatMessage key={m.id} role={m.role} content={m.content} />
          ))}
          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.8rem",
                color: "var(--text-muted)",
              }}
            >
              <Bot size={14} />{" "}
              <span className="typing-indicator">
                Thinking<span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          )}
          {error && (
            <div
              style={{
                fontSize: "0.8rem",
                color: "#b91c1c",
                border: "1px solid rgba(248,113,113,0.5)",
                padding: "8px 10px",
              }}
            >
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "10px 20px",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Ask about alerts, regions, industries or trends..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.9rem",
              background: "white",
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: "9px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.85rem",
              fontWeight: 600,
              background:
                "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              color: "white",
              border: "none",
              opacity: loading || !input.trim() ? 0.7 : 1,
            }}
          >
            <Send size={14} />
            Send
          </button>
        </form>
      </section>
    </div>
  );
}

function ChatMessage({ role, content }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "80%",
        display: "flex",
        gap: 8,
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isUser ? "#eff6ff" : "#111827",
          color: isUser ? "#1d4ed8" : "white",
        }}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div
        style={{
          padding: "8px 10px",
          border: "1px solid var(--border-subtle)",
          background: isUser ? "white" : "#0f172a",
          color: isUser ? "var(--text-primary)" : "#e5e7eb",
          fontSize: "0.9rem",
          lineHeight: 1.5,
          maxWidth: "100%",
        }}
      >
        {isUser ? (
          <span>{content}</span>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}


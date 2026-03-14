import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, RefreshCw } from "lucide-react";
import { aiGenerateReport } from "../api";

export default function AiReportPage() {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    const res = await aiGenerateReport(days);
    setLoading(false);
    if (!res.ok) {
      setError(res.data?.error || "Failed to generate report.");
      return;
    }
    setReport(res.data.report || "");
  };

  return (
    <div
      className="glass-panel"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <FileText size={18} />
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            AI Environmental Summary
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Generates a short narrative report from recent alerts and monitoring data.
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, fontSize: "0.8rem" }}>
          <label>
            Window:&nbsp;
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{
                padding: "4px 6px",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.8rem",
                background: "white",
              }}
            >
              <option value={3}>Last 3 days</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </label>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              fontSize: "0.8rem",
              fontWeight: 600,
              background:
                "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              color: "white",
              border: "none",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <RefreshCw size={14} />
            Generate
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "16px 20px",
          overflowY: "auto",
          fontSize: "0.9rem",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom: 10,
              padding: "8px 10px",
              border: "1px solid rgba(248,113,113,0.5)",
              color: "#b91c1c",
              fontSize: "0.82rem",
            }}
          >
            {error}
          </div>
        )}
        {loading && <p style={{ fontSize: "0.85rem" }}>Generating report…</p>}
        {!loading && !report && !error && (
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Choose a time window and click <strong>Generate</strong> to create an AI
            written report.
          </p>
        )}
        {!loading && report && (
          <ReactMarkdown>{report}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}


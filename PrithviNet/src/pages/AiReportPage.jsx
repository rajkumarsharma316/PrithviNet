import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, RefreshCw, Download, FileDown } from "lucide-react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import { aiGenerateReport } from "../api";

function reportToDocxChildren(reportText) {
  const lines = reportText.split(/\r?\n/);
  const children = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      children.push(new Paragraph({ text: "", spacing: { after: 80 } }));
      continue;
    }
    if (t.startsWith("## ")) {
      children.push(
        new Paragraph({
          text: t.replace(/^##\s*/, ""),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (t.startsWith("### ")) {
      children.push(
        new Paragraph({
          text: t.replace(/^###\s*/, ""),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
        })
      );
    } else if (t.startsWith("- ") || t.startsWith("* ")) {
      children.push(
        new Paragraph({
          text: t.replace(/^[-*]\s*/, ""),
          bullet: { level: 0 },
          spacing: { after: 60 },
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: [new TextRun(t)],
          spacing: { after: 100 },
        })
      );
    }
  }
  return children;
}

async function exportDocx(reportText, days) {
  const children = reportToDocxChildren(reportText);
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "PrithviNet Environmental Summary Report",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: `Report period: Last ${days} day(s) · Generated ${new Date().toLocaleDateString()}`,
            spacing: { after: 400 },
          }),
          ...children,
        ],
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `PrithviNet-Report-${days}d-${Date.now()}.docx`);
}

function exportPdf(reportText, days) {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const margin = 20;
  const maxWidth = 170;
  let y = 20;
  const lineHeight = 6;
  const pageHeight = 277;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PrithviNet Environmental Summary Report", 105, y, { align: "center" });
  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Report period: Last ${days} day(s) · ${new Date().toLocaleDateString()}`, 105, y, { align: "center" });
  y += 12;

  const lines = reportText.split(/\r?\n/);
  doc.setFontSize(11);
  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      y += lineHeight;
      continue;
    }
    if (t.startsWith("## ")) {
      if (y > pageHeight - 30) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(t.replace(/^##\s*/, ""), margin, y);
      y += lineHeight + 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      continue;
    }
    if (t.startsWith("### ")) {
      if (y > pageHeight - 30) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(t.replace(/^###\s*/, ""), margin, y);
      y += lineHeight + 1;
      doc.setFont("helvetica", "normal");
      continue;
    }
    const bullet = t.match(/^[-*]\s*(.*)/);
    const text = bullet ? "• " + bullet[1] : t;
    const wrapped = doc.splitTextToSize(text, maxWidth);
    for (const part of wrapped) {
      if (y > pageHeight - 25) { doc.addPage(); y = 20; }
      doc.text(part, margin, y);
      y += lineHeight;
    }
  }
  doc.save(`PrithviNet-Report-${days}d-${Date.now()}.pdf`);
}

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

  const handleExportDocx = () => {
    if (!report) return;
    exportDocx(report, days);
  };

  const handleExportPdf = () => {
    if (!report) return;
    exportPdf(report, days);
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#f3f4f6",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <FileText size={20} style={{ color: "var(--govt-blue)" }} />
        <div>
          <div className="heading-box" style={{ fontSize: "0.95rem" }}>AI Environmental Summary</div>
          <div className="text-box text-box-blue" style={{ fontSize: "0.8rem", marginTop: 8, marginBottom: 0 }}>
            Narrative report from recent alerts and monitoring data.
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.85rem", color: "#374151" }}>Window:</span>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: "0.85rem",
                background: "#fff",
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
              padding: "8px 14px",
              fontSize: "0.85rem",
              fontWeight: 600,
              background: "var(--govt-blue)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw size={14} />
            Generate
          </button>
          {report && (
            <>
              <button
                onClick={handleExportDocx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  background: "#fff",
                  color: "#1d4ed8",
                  border: "1px solid #93c5fd",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <FileDown size={14} />
                Export DOCX
              </button>
              <button
                onClick={handleExportPdf}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  background: "#fff",
                  color: "#b91c1c",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <Download size={14} />
                Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            width: "100%",
            minWidth: 0,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            padding: "28px 36px",
            border: "1px solid #e5e7eb",
          }}
        >
          {error && (
            <div className="text-box text-box-danger" style={{ marginBottom: 16, marginTop: 0 }}>
              {error}
            </div>
          )}
          {loading && (
            <p className="text-box text-box-amber" style={{ fontSize: "0.9rem", marginBottom: 0 }}>Generating report…</p>
          )}
          {!loading && !report && !error && (
            <p className="text-box text-box-grey" style={{ fontSize: "0.9rem", marginBottom: 0 }}>
              Choose a time window and click <strong>Generate</strong> to create an AI report.
            </p>
          )}
          {!loading && report && (
            <div className="report-content">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: 12, marginTop: 24 }}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827", marginBottom: 10, marginTop: 22 }}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#374151", marginBottom: 8, marginTop: 16 }}>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p style={{ marginBottom: 12, lineHeight: 1.6, color: "#374151" }}>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul style={{ marginBottom: 14, paddingLeft: 22, lineHeight: 1.6, color: "#374151" }}>
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li style={{ marginBottom: 4 }}>{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ fontWeight: 600, color: "#111827" }}>{children}</strong>
                  ),
                }}
              >
                {report}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


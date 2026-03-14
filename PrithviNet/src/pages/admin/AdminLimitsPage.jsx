import React, { useState, useEffect } from "react";
import { getPrescribedLimits } from "../../api";
import { Ruler } from "lucide-react";

export default function AdminLimitsPage() {
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrescribedLimits().then((r) => {
      if (r.ok) setLimits(r.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Ruler size={22} color="#f59e0b" /> Prescribed Limits
      </h2>

      {loading ? (
        <div className="page-loading">
          <span className="spinner"></span>
        </div>
      ) : (
        <div className="admin-table-wrap glass-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Min</th>
                <th>Max</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {limits.map((l, i) => (
                <tr key={l.id || i}>
                  <td style={{ fontWeight: 600 }}>{l.parameter}</td>
                  <td>{l.minValue ?? "—"}</td>
                  <td>{l.maxValue ?? "—"}</td>
                  <td>{l.category || "—"}</td>
                  <td>
                    <span className="code-badge">
                      {l.unit?.name} ({l.unit?.symbol})
                    </span>
                  </td>
                  <td>{l.unit?.parameterType || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {limits.length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "24px",
                color: "var(--text-muted)",
              }}
            >
              No limits configured
            </p>
          )}
        </div>
      )}
    </div>
  );
}

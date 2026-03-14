import React, { useState, useEffect } from "react";
import { getMonitoringUnits } from "../../api";
import { Beaker } from "lucide-react";

export default function AdminUnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMonitoringUnits().then((r) => {
      if (r.ok) setUnits(r.data);
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
        <Beaker size={22} color="#3b82f6" /> Monitoring Units
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
                <th>Name</th>
                <th>Symbol</th>
                <th>Parameter Type</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u, i) => (
                <tr key={u.id || i}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>
                    <span className="code-badge">{u.symbol}</span>
                  </td>
                  <td>{u.parameterType || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {units.length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "24px",
                color: "var(--text-muted)",
              }}
            >
              No units found
            </p>
          )}
        </div>
      )}
    </div>
  );
}

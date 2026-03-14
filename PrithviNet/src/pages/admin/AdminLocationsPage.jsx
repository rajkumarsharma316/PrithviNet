import React, { useState, useEffect } from "react";
import { getMonitoringLocations } from "../../api";
import { MapPin, Plus, X, Filter } from "lucide-react";

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const r = await getMonitoringLocations(typeFilter || undefined);
    if (r.ok) setLocations(r.data);
    setLoading(false);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  const TYPE_COLORS = { AIR: "#10b981", WATER: "#3b82f6", NOISE: "#f59e0b" };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: 0,
          }}
        >
          <MapPin size={22} color="#10b981" /> Monitoring Locations
        </h2>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <Filter size={16} style={{ color: "var(--text-muted)" }} />
        <div className="input-group compact">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            <option value="AIR">Air</option>
            <option value="WATER">Water</option>
            <option value="NOISE">Noise</option>
          </select>
        </div>
      </div>

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
                <th>Type</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.name}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        background: `${TYPE_COLORS[l.type] || "#64748b"}20`,
                        color: TYPE_COLORS[l.type] || "#64748b",
                        border: `1px solid ${TYPE_COLORS[l.type] || "#64748b"}40`,
                      }}
                    >
                      {l.type}
                    </span>
                  </td>
                  <td
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontFamily: "monospace",
                    }}
                  >
                    {l.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {locations.length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "24px",
                color: "var(--text-muted)",
              }}
            >
              No locations found
            </p>
          )}
        </div>
      )}
    </div>
  );
}

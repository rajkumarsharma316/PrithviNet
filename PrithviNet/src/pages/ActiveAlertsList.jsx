import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Info, Search, Filter } from "lucide-react";
import { getAlerts } from "../api";

const ActiveAlertsList = () => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    getAlerts().then((res) => {
      if (res.ok) setAlerts(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = alerts.filter((a) => {
    const msg = a.message || '';
    const p = a.parameter || '';
    const matchSearch =
      msg.toLowerCase().includes(search.toLowerCase()) ||
      p.toLowerCase().includes(search.toLowerCase());
    if (severityFilter === "all") return matchSearch;
    return matchSearch && a.severity === severityFilter;
  });

  const criticalCount = alerts.filter(
    (a) => a.severity === "CRITICAL",
  ).length;
  const warningCount = alerts.filter(
    (a) => a.severity === "WARNING",
  ).length;
  const infoCount = alerts.filter((a) => a.severity === "INFO").length;

  const getSeverityIcon = (severity) => {
    if (severity === "CRITICAL")
      return <AlertCircle size={18} color="#ef4444" />;
    if (severity === "WARNING")
      return <AlertTriangle size={18} color="#fbbf24" />;
    return <Info size={18} color="#3b82f6" />;
  };

  const getSeverityColor = (severity) => {
    if (severity === "CRITICAL") return "#ef4444";
    if (severity === "WARNING") return "#fbbf24";
    return "#3b82f6";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.5rem", margin: "0 0 4px" }}>
            Active Alerts
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            {loading ? "Loading..." : `${alerts.length} alerts —`}
            <span style={{ color: "#ef4444" }}> {criticalCount} critical</span>,
            <span style={{ color: "#fbbf24" }}> {warningCount} warning</span>,
            <span style={{ color: "#3b82f6" }}> {infoCount} info</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              background: "rgba(0,0,0,0.2)",
              padding: "3px",
              borderRadius: "10px",
            }}
          >
            {["all", "CRITICAL", "WARNING", "INFO"].map((f) => (
              <button
                key={f}
                onClick={() => setSeverityFilter(f)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  background:
                    severityFilter === f
                      ? "rgba(16,185,129,0.15)"
                      : "transparent",
                  color:
                    severityFilter === f ? "#10b981" : "var(--text-secondary)",
                  border: "none",
                  textTransform: "capitalize",
                  transition: "all 0.2s",
                }}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
          <div className="input-group compact" style={{ marginBottom: 0 }}>
            <Search size={16} className="input-icon" />
            <input
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
          </div>
        </div>
      </div>

      {/* Alert summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        <SummaryCard
          label="Critical"
          count={criticalCount}
          color="#ef4444"
          icon={<AlertCircle size={18} />}
        />
        <SummaryCard
          label="Warning"
          count={warningCount}
          color="#fbbf24"
          icon={<AlertTriangle size={18} />}
        />
        <SummaryCard
          label="Info"
          count={infoCount}
          color="#3b82f6"
          icon={<Info size={18} />}
        />
      </div>

      {/* Alert list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((alert) => {
          const color = getSeverityColor(alert.severity);
          return (
            <div
              key={alert.id}
              className="glass-panel"
              style={{ padding: "16px 20px", borderLeft: `3px solid ${color}` }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ paddingTop: "2px" }}>
                  {getSeverityIcon(alert.severity)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {alert.parameter}
                      </span>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontWeight: 700,
                          background: `${color}15`,
                          color,
                          border: `1px solid ${color}30`,
                          textTransform: "uppercase",
                        }}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      margin: "0 0 8px",
                      lineHeight: 1.5,
                    }}
                  >
                    {alert.message}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span>📍 {alert.location}</span>
                    <span>🏢 {alert.region}</span>
                    <span style={{ color }}>
                      Value: {alert.value} (Limit: {alert.limit})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, count, color, icon }) => (
  <div
    className="glass-panel"
    style={{
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        background: `${color}12`,
        border: `1px solid ${color}25`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
      }}
    >
      {icon}
    </div>
    <div>
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          margin: "0 0 2px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "1.4rem",
          fontWeight: 700,
          margin: 0,
          fontFamily: "var(--font-display)",
        }}
      >
        {count}
      </p>
    </div>
  </div>
);

export default ActiveAlertsList;

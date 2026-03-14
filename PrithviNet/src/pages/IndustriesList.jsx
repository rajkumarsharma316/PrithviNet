import React, { useState } from "react";
import {
  Factory,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { getIndustries } from "../api";

const IndustriesList = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    getIndustries().then((res) => {
      if (res.ok) {
        // Map backend API data properties if needed to match mock format expectations
        const mapped = res.data.map(i => ({
          ...i,
          compliant: i.status === 'ACTIVE',
          region: i.regionId, // the name isn't fully loaded without a join, but can fallback
          violations: 0,
          lastReport: 'N/A'
        }));
        setIndustries(mapped);
      }
      setLoading(false);
    });
  }, []);

  const filtered = industries.filter((ind) => {
    const typeStr = ind.type || '';
    const nameStr = ind.name || '';
    const matchSearch =
      nameStr.toLowerCase().includes(search.toLowerCase()) ||
      typeStr.toLowerCase().includes(search.toLowerCase());
    if (filter === "compliant") return matchSearch && ind.compliant;
    if (filter === "non-compliant") return matchSearch && !ind.compliant;
    return matchSearch;
  });

  const compliantCount = industries.filter((i) => i.compliant).length;
  const nonCompliantCount = industries.filter((i) => !i.compliant).length;

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
            Active Industries
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            {loading ? "Loading..." : `${industries.length} industries —`}
            <span style={{ color: "#10b981" }}>
              {" "}
              {compliantCount} compliant
            </span>
            ,
            <span style={{ color: "#ef4444" }}>
              {" "}
              {nonCompliantCount} non-compliant
            </span>
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
            {["all", "compliant", "non-compliant"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  background:
                    filter === f ? "rgba(16,185,129,0.15)" : "transparent",
                  color: filter === f ? "#10b981" : "var(--text-secondary)",
                  border: "none",
                  textTransform: "capitalize",
                  transition: "all 0.2s",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="input-group compact" style={{ marginBottom: 0 }}>
            <Search size={16} className="input-icon" />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((ind) => {
          const isExpanded = expanded === ind.id;
            const statusColor = ind.status === 'ACTIVE' ? '#10b981' : ind.status === 'PENDING' ? '#f59e0b' : '#ef4444';
          return (
            <div
              key={ind.id}
              className="glass-panel"
              style={{ overflow: "hidden", transition: "all 0.3s" }}
            >
              <div
                onClick={() => setExpanded(isExpanded ? null : ind.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: statusColor,
                    boxShadow: `0 0 8px ${statusColor}60`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "2px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "0.95rem",
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {ind.name}
                    </h3>
                    <span className="code-badge" style={{ fontSize: "0.7rem" }}>
                      {ind.registrationNo}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      margin: 0,
                    }}
                  >
                    {ind.type} • {ind.region}
                  </p>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span
                    className={`status-badge ${ind.status === 'ACTIVE' ? 'status-good' : ind.status === 'PENDING' ? 'status-moderate' : 'status-poor'}`}
                    style={{ fontSize: "0.7rem" }}
                  >
                    {ind.status === 'ACTIVE' ? '✓ Active' : ind.status === 'PENDING' ? '⏳ Pending' : ind.status === 'SUSPENDED' ? '⏸ Suspended' : '✗ Inactive'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={16} color="var(--text-muted)" />
                  ) : (
                    <ChevronDown size={16} color="var(--text-muted)" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div
                  style={{
                    padding: "0 20px 20px",
                    borderTop: "1px solid var(--glass-border)",
                    paddingTop: "16px",
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <InfoItem
                      icon={<Factory size={14} />}
                      label="Industry Type"
                      value={ind.type}
                    />
                    <InfoItem
                      icon={<AlertCircle size={14} />}
                      label="Violations"
                      value={`${ind.violations} total`}
                      color={ind.violations > 0 ? "#ef4444" : "#10b981"}
                    />
                    <InfoItem
                      icon={<Clock size={14} />}
                      label="Last Report"
                      value={ind.lastReport}
                    />
                    <InfoItem
                      icon={
                        ind.status === "ACTIVE" ? (
                          <CheckCircle size={14} />
                        ) : (
                          <XCircle size={14} />
                        )
                      }
                      label="Status"
                      value={ind.status}
                      color={ind.status === "ACTIVE" ? "#10b981" : "#ef4444"}
                    />
                  </div>
                  {ind.problem && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.15)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <AlertCircle size={16} color="#ef4444" />
                      <span style={{ fontSize: "0.85rem", color: "#f87171" }}>
                        {ind.problem}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <span style={{ color: color || "var(--text-muted)" }}>{icon}</span>
    <div>
      <p
        style={{
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          margin: "0 0 1px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          margin: 0,
          color: color || "var(--text-primary)",
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

export default IndustriesList;

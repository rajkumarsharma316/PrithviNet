import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Factory,
  AlertTriangle,
  ChevronRight,
  Search,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  REGIONS,
  REGION_DETAILS,
  getComplianceColor,
  getComplianceLabel,
  getRiskLevel,
} from "../mockData";

const RegionalOfficesList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const filtered = REGIONS.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

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
            Regional Offices
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            {REGIONS.length} offices across Chhattisgarh
          </p>
        </div>
        <div className="input-group compact" style={{ marginBottom: 0 }}>
          <Search size={16} className="input-icon" />
          <input
            placeholder="Search regions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
        </div>
      </div>

      <div className="data-grid">
        {filtered.map((region) => {
          const detail = REGION_DETAILS[region.id] || {};
          const color = getComplianceColor(region.compliance);
          return (
            <div
              key={region.id}
              className="glass-panel data-card region-card"
              onClick={() => navigate(`/region/${region.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: `${color}15`,
                      border: `1px solid ${color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Building2 size={20} color={color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", margin: "0 0 2px" }}>
                      {region.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      {region.district} District
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
              </div>

              {/* Compliance Score */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "8px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${region.compliance}%`,
                      height: "100%",
                      background: color,
                      borderRadius: "4px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color,
                    fontFamily: "var(--font-display)",
                    minWidth: "44px",
                  }}
                >
                  {region.compliance}%
                </span>
              </div>

              <div
                style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
              >
                <span
                  className={`status-badge ${region.compliance >= 80 ? "status-good" : region.compliance >= 60 ? "status-moderate" : "status-poor"}`}
                  style={{ fontSize: "0.7rem" }}
                >
                  {getComplianceLabel(region.compliance)}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Risk: {getRiskLevel(region.compliance)}
                </span>
              </div>

              <div
                className="param-grid"
                style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      marginBottom: "2px",
                    }}
                  >
                    Industries
                  </p>
                  <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                    {detail.industries?.total || "—"}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      marginBottom: "2px",
                    }}
                  >
                    Stations
                  </p>
                  <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                    {detail.stations || "—"}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      marginBottom: "2px",
                    }}
                  >
                    Trend
                  </p>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color:
                        detail.trend?.direction === "up"
                          ? "#10b981"
                          : "#ef4444",
                    }}
                  >
                    {detail.trend?.direction === "up" ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {detail.trend?.change > 0 ? "+" : ""}
                    {detail.trend?.change}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegionalOfficesList;

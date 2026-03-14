import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Wind,
  Droplets,
  Volume2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
// Removed MOCK_STATIONS import
import { getMonitoringLocations } from "../api";

const MonitoringLocationsList = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [apiLocations, setApiLocations] = useState([]);

  useEffect(() => {
    getMonitoringLocations().then((res) => {
      if (res.ok && Array.isArray(res.data)) setApiLocations(res.data);
    });
  }, []);

  const allStations = apiLocations.map((l) => ({
    id: l.id,
    name: l.name,
    type: l.type,
    lat: l.lat,
    lng: l.lng,
    region: l.region?.name || "—",
    aqi: null,
    ph: null,
    laeq: null,
    status: "—",
  }));

  const filtered = allStations.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    if (typeFilter === "all") return matchSearch;
    return matchSearch && s.type === typeFilter.toUpperCase();
  });

  const typeIcon = (type) => {
    if (type === "AIR") return <Wind size={16} color="#10b981" />;
    if (type === "WATER") return <Droplets size={16} color="#3b82f6" />;
    return <Volume2 size={16} color="#ef4444" />;
  };

  const typeColor = (type) =>
    type === "AIR" ? "#10b981" : type === "WATER" ? "#3b82f6" : "#ef4444";

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
            Monitoring Locations
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            {allStations.length} active stations across Chhattisgarh
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
            {[
              { k: "all", l: "All" },
              { k: "air", l: "Air" },
              { k: "water", l: "Water" },
              { k: "noise", l: "Noise" },
            ].map((f) => (
              <button
                key={f.k}
                onClick={() => setTypeFilter(f.k)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  background:
                    typeFilter === f.k
                      ? "rgba(16,185,129,0.15)"
                      : "transparent",
                  color:
                    typeFilter === f.k ? "#10b981" : "var(--text-secondary)",
                  border: "none",
                  transition: "all 0.2s",
                }}
              >
                {f.l}
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
        {filtered.map((stn) => {
          const isExpanded = expanded === stn.id;
          const color = typeColor(stn.type);
          return (
            <div
              key={stn.id}
              className="glass-panel"
              style={{ overflow: "hidden" }}
            >
              <div
                onClick={() => setExpanded(isExpanded ? null : stn.id)}
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
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: `${color}12`,
                    border: `1px solid ${color}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {typeIcon(stn.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "0.95rem",
                      margin: "0 0 2px",
                      fontWeight: 600,
                    }}
                  >
                    {stn.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      margin: 0,
                    }}
                  >
                    {stn.type} • {stn.region} • {stn.lat.toFixed(4)}°N,{" "}
                    {stn.lng.toFixed(4)}°E
                  </p>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  {stn.type === "AIR" && stn.aqi && (
                    <span
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        color,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {stn.aqi}{" "}
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        AQI
                      </span>
                    </span>
                  )}
                  {stn.type === "WATER" && stn.ph && (
                    <span
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        color,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {stn.ph}{" "}
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        pH
                      </span>
                    </span>
                  )}
                  {stn.type === "NOISE" && stn.laeq && (
                    <span
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        color,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {stn.laeq}{" "}
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        dB
                      </span>
                    </span>
                  )}
                  <span
                    className={`status-badge ${stn.status === "Good" ? "status-good" : stn.status === "Moderate" ? "status-moderate" : "status-poor"}`}
                    style={{ fontSize: "0.7rem" }}
                  >
                    {stn.status}
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
                  {stn.type === "AIR" && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      <ParamBox
                        label="PM2.5"
                        value="78.5 µg/m³"
                        color="#fbbf24"
                      />
                      <ParamBox
                        label="PM10"
                        value="125.3 µg/m³"
                        color="#fbbf24"
                      />
                      <ParamBox
                        label="NO₂"
                        value="42.3 µg/m³"
                        color="#10b981"
                      />
                      <ParamBox
                        label="SO₂"
                        value="28.1 µg/m³"
                        color="#10b981"
                      />
                      <ParamBox label="CO" value="1.2 mg/m³" color="#10b981" />
                      <ParamBox label="O₃" value="55.8 µg/m³" color="#fbbf24" />
                      <ParamBox
                        label="NH₃"
                        value="18.5 µg/m³"
                        color="#10b981"
                      />
                    </div>
                  )}
                  {stn.type === "WATER" && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      <ParamBox label="pH" value="7.2" color="#10b981" />
                      <ParamBox label="BOD" value="18.5 mg/L" color="#ef4444" />
                      <ParamBox label="COD" value="45.2 mg/L" color="#fbbf24" />
                      <ParamBox label="TDS" value="320 mg/L" color="#10b981" />
                      <ParamBox
                        label="Temperature"
                        value="28.5°C"
                        color="#10b981"
                      />
                      <ParamBox label="DO" value="6.2 mg/L" color="#10b981" />
                      <ParamBox
                        label="Lead (Pb)"
                        value="0.005 mg/L"
                        color="#10b981"
                      />
                    </div>
                  )}
                  {stn.type === "NOISE" && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      <ParamBox
                        label="LAeq"
                        value={`${stn.laeq || 72} dB(A)`}
                        color={stn.laeq > 70 ? "#ef4444" : "#10b981"}
                      />
                      <ParamBox label="Lmax" value="89 dB(A)" color="#ef4444" />
                      <ParamBox label="Lmin" value="45 dB(A)" color="#10b981" />
                      <ParamBox
                        label="Zone"
                        value="Commercial"
                        color="#fbbf24"
                      />
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

const ParamBox = ({ label, value, color }) => (
  <div
    style={{
      padding: "10px 12px",
      background: "rgba(255,255,255,0.03)",
      borderRadius: "8px",
      border: "1px solid rgba(255,255,255,0.05)",
    }}
  >
    <p
      style={{
        fontSize: "0.7rem",
        color: "var(--text-muted)",
        margin: "0 0 4px",
      }}
    >
      {label}
    </p>
    <p style={{ fontSize: "0.9rem", fontWeight: 600, color, margin: 0 }}>
      {value}
    </p>
  </div>
);

export default MonitoringLocationsList;

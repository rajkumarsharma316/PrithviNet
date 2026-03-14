import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMonitoringData, getMonitoringLocations } from "../api";
import { Wind, Droplets, Volume2, Plus, Filter, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TYPE_META = {
  air: { icon: <Wind size={20} />, color: "#10b981", label: "Air Quality" },
  water: {
    icon: <Droplets size={20} />,
    color: "#3b82f6",
    label: "Water Quality",
  },
  noise: {
    icon: <Volume2 size={20} />,
    color: "#f59e0b",
    label: "Noise Level",
  },
};

export default function MonitoringDataPage() {
  const { type } = useParams();
  const meta = TYPE_META[type] || TYPE_META.air;
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [limit, setLimit] = useState(10);
  const [locationId, setLocationId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await getMonitoringData(type, limit, locationId || undefined);
    if (res.ok) setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    getMonitoringLocations(type?.toUpperCase()).then((res) => {
      if (res.ok) setLocations(res.data);
    });
  }, [type]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [type, limit, locationId]);

  const canSubmit =
    user &&
    ["MONITORING_TEAM"].includes(user.role);

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
          <span style={{ color: meta.color }}>{meta.icon}</span> {meta.label}{" "}
          Data
        </h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {canSubmit && (
            <Link
              to={`/monitoring/${type}/submit`}
              className="action-btn primary-btn"
            >
              <Plus size={16} /> Submit Data
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div
        className="glass-panel"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Filter size={16} style={{ color: "var(--text-muted)" }} />
        <div className="input-group compact">
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group compact">
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} records
              </option>
            ))}
          </select>
        </div>
        <button className="icon-btn" onClick={fetchData} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="page-loading">
          <span className="spinner"></span> Loading...
        </div>
      ) : data.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: "48px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          No data found
        </div>
      ) : (
        <div className="data-grid">
          {data.map((d, i) => (
            <div key={d.id || i} className="glass-panel data-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem" }}>
                    {d.location?.name || "Unknown"}
                  </h4>
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    {new Date(d.timestamp).toLocaleString()}
                  </span>
                </div>
                <span
                  style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                >
                  by {d.submittedBy?.name || "—"}
                </span>
              </div>
              <div className="param-grid">
                {type === "air" && (
                  <>
                    <Param
                      label="AQI"
                      value={d.aqi?.toFixed(1)}
                      color="#fbbf24"
                    />
                    <Param
                      label="PM2.5"
                      value={d.pm25?.toFixed(1)}
                      unit="µg/m³"
                    />
                    <Param
                      label="PM10"
                      value={d.pm10?.toFixed(1)}
                      unit="µg/m³"
                    />
                    <Param label="NO₂" value={d.no2?.toFixed(1)} unit="ppb" />
                    <Param label="SO₂" value={d.so2?.toFixed(1)} unit="ppb" />
                    <Param label="CO" value={d.co?.toFixed(1)} />
                  </>
                )}
                {type === "water" && (
                  <>
                    <Param
                      label="pH"
                      value={d.ph?.toFixed(2)}
                      color="#3b82f6"
                    />
                    <Param label="TDS" value={d.tds?.toFixed(1)} unit="mg/L" />
                    <Param
                      label="Turbidity"
                      value={d.turbidity?.toFixed(2)}
                      unit="NTU"
                    />
                    <Param
                      label="DO"
                      value={d.dissolvedOxygen?.toFixed(2)}
                      unit="mg/L"
                    />
                    <Param label="BOD" value={d.bod?.toFixed(1)} unit="mg/L" />
                    <Param label="COD" value={d.cod?.toFixed(1)} unit="mg/L" />
                  </>
                )}
                {type === "noise" && (
                  <>
                    <Param
                      label="Laeq"
                      value={d.laeq?.toFixed(1)}
                      unit="dB(A)"
                      color="#f59e0b"
                    />
                    <Param
                      label="Lmax"
                      value={d.lmax?.toFixed(1)}
                      unit="dB(A)"
                    />
                    <Param
                      label="Lmin"
                      value={d.lmin?.toFixed(1)}
                      unit="dB(A)"
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Param({ label, value, unit, color }) {
  return (
    <div>
      <span
        style={{
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          display: "block",
          marginBottom: "2px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: color || "var(--text-primary)",
        }}
      >
        {value ?? "—"}
      </span>
      {unit && (
        <span
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            marginLeft: "3px",
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
}

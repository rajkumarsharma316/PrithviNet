import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wind,
  Droplets,
  Volume2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  MapPin,
  Factory,
  AlertCircle,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { getOverview, getMonitoringLocations, getRegionSummary } from "../api";
import { REGIONS } from "../mockData";

const MonitoringCards = () => {
  const [overview, setOverview] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getOverview().then((res) => {
      if (res.ok) setOverview(res.data);
      else {
        // Fallback: use mock data if backend is unavailable
        setOverview({
          stats: {
            totalLocations: 8,
            totalIndustries: 142,
            totalRegions: REGIONS.length,
            activeAlerts: 4,
          },
          latestReadings: {
            air: {
              aqi: 156,
              pm25: 78.5,
              pm10: 125.3,
              no2: 42.3,
              so2: 28.1,
              co: 1.2,
              o3: 55.8,
              location: { name: "Raipur Central AQMS" },
            },
            water: {
              ph: 7.2,
              tds: 320,
              bod: 18.5,
              cod: 45.2,
              dissolvedOxygen: 6.2,
              turbidity: 3.8,
              location: { name: "Raipur Mowa WQ" },
            },
            noise: {
              laeq: 72,
              lmax: 89,
              lmin: 45,
              location: { name: "Raipur Noise Station" },
            },
          },
        });
      }
    });
    getMonitoringLocations().then((res) => {
      if (res.ok && Array.isArray(res.data)) setLocations(res.data);
    });
    import("../api").then(({ getPublicAlerts }) => {
      getPublicAlerts().then((res) => {
        if (res.ok) setAlerts(res.data);
      });
    });
    getRegionSummary().then((res) => {
      if (res.ok) setRegionData(res.data);
    });
  }, []);

  const stats = overview?.stats;
  const latest = overview?.latestReadings;

  // Compliance summary from real API data
  const totalIndustries = regionData.reduce(
    (s, r) => s + (r.industries?.total || 0),
    0,
  );
  const compliantIndustries = regionData.reduce(
    (s, r) => s + (r.industries?.compliant || 0),
    0,
  );
  const nonCompliantIndustries = totalIndustries - compliantIndustries;
  const criticalAlerts = alerts.filter(
    (a) => a.severity === "CRITICAL",
  ).length;
  const warningAlerts = alerts.filter(
    (a) => a.severity === "WARNING",
  ).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
      }}
    >
      {/* Header with Location Dropdown */}
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
            Dashboard Overview
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            Real-time environmental monitoring & transparency portal
          </p>
        </div>
        <div
          className="glass-panel"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 16px",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--accent-secondary)",
              boxShadow: "0 0 6px rgba(146,64,14,0.6)",
            }}
          />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              fontWeight: 500,
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              paddingRight: "20px",
            }}
          >
            <option value="" style={{ background: "#0f1523" }}>
              Chhattisgarh (State Overview)
            </option>
            {locations.map((l) => (
              <option key={l.id} value={l.id} style={{ background: "#0f1523" }}>
                {l.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} color="var(--text-secondary)" />
        </div>
      </div>

      {/* Stats Row — clickable */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard
          icon={<MapPin size={20} />}
          label="Monitoring Locations"
          value={stats?.totalLocations ?? "—"}
          color="#10b981"
          loading={!overview}
          onClick={() => navigate("/monitoring-locations")}
        />
        <StatCard
          icon={<Factory size={20} />}
          label="Active Industries"
          value={stats?.totalIndustries ?? "—"}
          color="#3b82f6"
          loading={!overview}
          onClick={() => navigate("/industries-list")}
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Regional Offices"
          value={stats?.totalRegions ?? "—"}
          color="#f59e0b"
          loading={!overview}
          onClick={() => navigate("/offices-list")}
        />
        <StatCard
          icon={<AlertCircle size={20} />}
          label="Active Alerts"
          value={stats?.activeAlerts ?? "—"}
          color="#ef4444"
          loading={!overview}
          onClick={() => navigate("/alerts-list")}
        />
      </div>

      {/* Compliance Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "14px",
              fontWeight: 500,
            }}
          >
            Compliance Overview
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{ position: "relative", width: "64px", height: "64px" }}
            >
              <svg
                viewBox="0 0 36 36"
                style={{
                  width: "100%",
                  height: "100%",
                  transform: "rotate(-90deg)",
                }}
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${((compliantIndustries / totalIndustries) * 100).toFixed(0)} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                {totalIndustries > 0
                  ? `${Math.round((compliantIndustries / totalIndustries) * 100)}%`
                  : "—"}
              </span>
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  margin: "0 0 4px",
                }}
              >
                State-wide compliance rate
              </p>
              <div style={{ display: "flex", gap: "12px", fontSize: "0.8rem" }}>
                <span
                  style={{
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <CheckCircle size={14} />
                  {compliantIndustries}
                </span>
                <span
                  style={{
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <XCircle size={14} />
                  {nonCompliantIndustries}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "14px",
              fontWeight: 500,
            }}
          >
            Alert Summary
          </h3>
          <div style={{ display: "flex", gap: "16px" }}>
            <AlertBubble
              label="Critical"
              count={criticalAlerts}
              color="#ef4444"
            />
            <AlertBubble
              label="Warning"
              count={warningAlerts}
              color="#fbbf24"
            />
            <AlertBubble
              label="Info"
              count={alerts.filter((a) => a.severity === "INFO").length}
              color="#3b82f6"
            />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "14px",
              fontWeight: 500,
            }}
          >
            Quick Stats
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <MiniInfo label="Total Industries" value={totalIndustries} />
            <MiniInfo label="Regions" value={regionData.length || stats?.totalRegions || "—"} />
            <MiniInfo label="Compliant" value={compliantIndustries} />
            <MiniInfo label="Non-Compliant" value={nonCompliantIndustries} />
          </div>
        </div>
      </div>

      {/* Monitoring Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Air Quality Card */}
        <Card
          title="Air Quality Rating (AQI)"
          value={latest?.air?.aqi?.toFixed(1) || "—"}
          unit={latest?.air ? "AQI" : ""}
          icon={<Wind size={24} color="#34d399" />}
          location={latest?.air?.location?.name}
          trend="up"
          trendValue="+12%"
          trendText="vs last week"
          status={getAqiStatus(latest?.air?.aqi)}
          statusText={getAqiLabel(latest?.air?.aqi)}
          params={[
            {
              label: "PM2.5",
              value: latest?.air?.pm25
                ? `${latest.air.pm25.toFixed(1)} µg/m³`
                : "—",
              color: "#fbbf24",
            },
            {
              label: "PM10",
              value: latest?.air?.pm10
                ? `${latest.air.pm10.toFixed(1)} µg/m³`
                : "—",
              color: "#fbbf24",
            },
            {
              label: "NO₂",
              value: latest?.air?.no2
                ? `${latest.air.no2.toFixed(1)} ppb`
                : "—",
              color: "#10b981",
            },
            {
              label: "SO₂",
              value: latest?.air?.so2
                ? `${latest.air.so2.toFixed(1)} ppb`
                : "—",
              color: "#10b981",
            },
            {
              label: "CO",
              value: latest?.air?.co
                ? `${latest.air.co.toFixed(1)} mg/m³`
                : "—",
              color: "#10b981",
            },
            {
              label: "O₃",
              value: latest?.air?.o3 ? `${latest.air.o3.toFixed(1)} ppb` : "—",
              color: "#3b82f6",
            },
          ]}
          loading={!overview}
        />

        {/* Water Quality Card */}
        <Card
          title="Water Purity Index"
          value={latest?.water?.ph?.toFixed(2) || "—"}
          unit="pH Level"
          icon={<Droplets size={24} color="#60a5fa" />}
          location={latest?.water?.location?.name}
          trend="down"
          trendValue="-2%"
          trendText="vs last week"
          status="status-good"
          statusText="Within Prescribed Limits"
          params={[
            {
              label: "TDS",
              value: latest?.water?.tds
                ? `${latest.water.tds.toFixed(1)} mg/L`
                : "—",
              color: "#10b981",
            },
            {
              label: "BOD",
              value: latest?.water?.bod
                ? `${latest.water.bod.toFixed(1)} mg/L`
                : "—",
              color: "#fbbf24",
            },
            {
              label: "COD",
              value: latest?.water?.cod
                ? `${latest.water.cod.toFixed(1)} mg/L`
                : "—",
              color: "#fbbf24",
            },
            {
              label: "DO",
              value: latest?.water?.dissolvedOxygen
                ? `${latest.water.dissolvedOxygen.toFixed(2)} mg/L`
                : "—",
              color: "#10b981",
            },
            {
              label: "Turbidity",
              value: latest?.water?.turbidity
                ? `${latest.water.turbidity.toFixed(2)} NTU`
                : "—",
              color: "#10b981",
            },
            { label: "Temp", value: "28.5°C", color: "#3b82f6" },
          ]}
          loading={!overview}
        />

        {/* Noise Level Card */}
        <Card
          title="Ambient Noise Level"
          value={latest?.noise?.laeq?.toFixed(1) || "—"}
          unit="dB(A)"
          icon={<Volume2 size={24} color="#f87171" />}
          location={latest?.noise?.location?.name}
          trend="up"
          trendValue="+8%"
          trendText="vs last week"
          status={latest?.noise?.laeq > 75 ? "status-poor" : "status-good"}
          statusText={
            latest?.noise?.laeq > 75
              ? `Exceeds Threshold (> 75 dB)`
              : "Within Limits"
          }
          params={[
            {
              label: "LAeq",
              value: latest?.noise?.laeq
                ? `${latest.noise.laeq.toFixed(1)} dB(A)`
                : "—",
              color: "#fbbf24",
            },
            {
              label: "Peak (Lmax)",
              value: latest?.noise?.lmax
                ? `${latest.noise.lmax.toFixed(1)} dB(A)`
                : "—",
              color: "#ef4444",
            },
            {
              label: "Min (Lmin)",
              value: latest?.noise?.lmin
                ? `${latest.noise.lmin.toFixed(1)} dB(A)`
                : "—",
              color: "#10b981",
            },
          ]}
          loading={!overview}
        />
      </div>
    </div>
  );
};

function getAqiStatus(aqi) {
  if (!aqi) return "status-good";
  if (aqi <= 100) return "status-good";
  if (aqi <= 200) return "status-moderate";
  return "status-poor";
}

function getAqiLabel(aqi) {
  if (!aqi) return "No data";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  return "Severe";
}

const StatCard = ({ icon, label, value, color, loading, onClick }) => (
  <div
    className="glass-panel"
    onClick={onClick}
    style={{
      padding: "20px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s",
    }}
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
        color,
      }}
    >
      {icon}
    </div>
    <div>
      <p
        style={{
          margin: 0,
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginBottom: "2px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "1.5rem",
          fontWeight: 700,
          fontFamily: "var(--font-display)",
        }}
      >
        {loading ? (
          <span
            className="spinner"
            style={{ width: "14px", height: "14px" }}
          ></span>
        ) : (
          value
        )}
      </p>
    </div>
  </div>
);

const AlertBubble = ({ label, count, color }) => (
  <div
    style={{
      flex: 1,
      textAlign: "center",
      padding: "12px 8px",
      borderRadius: "10px",
      background: `${color}08`,
      border: `1px solid ${color}20`,
    }}
  >
    <p
      style={{
        fontSize: "1.4rem",
        fontWeight: 700,
        color,
        margin: "0 0 2px",
        fontFamily: "var(--font-display)",
      }}
    >
      {count}
    </p>
    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>
      {label}
    </p>
  </div>
);

const MiniInfo = ({ label, value }) => (
  <div>
    <p
      style={{
        fontSize: "0.7rem",
        color: "var(--text-muted)",
        margin: "0 0 2px",
      }}
    >
      {label}
    </p>
    <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: 0 }}>{value}</p>
  </div>
);

const Card = ({
  title,
  value,
  unit,
  icon,
  location,
  trend,
  trendValue,
  trendText,
  status,
  statusText,
  params,
  loading,
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
              marginBottom: "4px",
            }}
          >
            {title}
          </h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              {loading ? <span className="spinner"></span> : value}
            </span>
            <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>
              {unit}
            </span>
          </div>
          {location && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginTop: "4px",
              }}
            >
              📍 {location}
            </p>
          )}
        </div>
        <div
          className="glass-panel"
          style={{
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          className="status-badge"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background:
              trend === "down"
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
            color: trend === "down" ? "#10b981" : "#ef4444",
          }}
        >
          {trend === "up" ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {trendValue}
        </span>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {trendText}
        </span>
      </div>

      <div
        style={{
          height: "1px",
          background: "var(--glass-border)",
          margin: "8px 0",
        }}
      ></div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        {params.map((param, index) => (
          <div key={index}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginBottom: "4px",
              }}
            >
              {param.label}
            </p>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: param.color,
              }}
            >
              {param.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", paddingTop: "16px" }}>
        <span
          className={`status-badge ${status}`}
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "6px",
            display: "flex",
          }}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
};

export default MonitoringCards;

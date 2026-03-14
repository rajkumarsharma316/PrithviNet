import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Factory,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Wind,
  Droplets,
  Volume2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  getRegionSummary,
  getRegionTrend,
  getIndustries,
  getMonitoringLocations,
} from "../api";

const getComplianceColor = (c) =>
  c >= 80 ? "#10b981" : c >= 60 ? "#f59e0b" : "#ef4444";
const getRiskLevel = (c) =>
  c >= 80 ? "Low" : c >= 60 ? "Medium" : "High";

const createIcon = (color, label) =>
  L.divIcon({
    className: "custom-map-marker",
    html: `<div style="background:${color};border:2px solid white;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;box-shadow:0 0 10px ${color}">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

const factoryIcon = L.divIcon({
  className: "custom-map-marker",
  html: `<div style="background:#f59e0b;border:2px solid white;color:white;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 10px #f59e0b80">🏭</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const RegionalZonePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trendType, setTrendType] = useState("air");

  const [region, setRegion] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [stations, setStations] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let loaded = 0;
    const checkDone = () => { loaded++; if (loaded >= 4) setLoading(false); };

    // Fetch region summary to find this region
    getRegionSummary().then((res) => {
      if (res.ok) {
        const found = res.data.find((r) => r.id === id);
        if (found) setRegion(found);
      }
      checkDone();
    }).catch(checkDone);

    // Fetch industries for this region
    getIndustries().then((res) => {
      if (res.ok) {
        const regional = res.data.filter((i) => i.regionId === id);
        setIndustries(
          regional.map((i) => ({
            ...i,
            compliant: i.status === "ACTIVE",
            violations: 0,
            lastReport: "N/A",
            problem: null,
          })),
        );
      }
      checkDone();
    }).catch(checkDone);

    // Fetch monitoring locations for this region
    getMonitoringLocations().then((res) => {
      if (res.ok) {
        const regional = res.data.filter((s) => s.regionId === id);
        setStations(
          regional.map((s) => ({
            ...s,
            aqi: s.type === "AIR" ? 45 : null,
            ph: s.type === "WATER" ? 7.1 : null,
            laeq: s.type === "NOISE" ? 55 : null,
            status: "Good",
          })),
        );
      }
      checkDone();
    }).catch(checkDone);

    // Fetch trend data
    getRegionTrend(id).then((res) => {
      if (res.ok && Array.isArray(res.data)) setTrendData(res.data);
      checkDone();
    }).catch(checkDone);
  }, [id]);

  if (loading) {
    return (
      <div className="page-loading">
        <span className="spinner"></span>
      </div>
    );
  }

  if (!region) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Region not found</h3>
        <p style={{ color: "var(--text-secondary)" }}>This region could not be loaded.</p>
        <button onClick={() => navigate(-1)} style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--accent-primary)", color: "white", border: "none", cursor: "pointer" }}>Go Back</button>
      </div>
    );
  }

  const color = getComplianceColor(region.compliance);
  const totalInd = region.industries?.total || 0;
  const compliantInd = region.industries?.compliant || 0;
  const nonCompliantInd = region.industries?.nonCompliant || 0;
  const pendingInd = region.industries?.pending || 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
      }}
    >
      {/* Back Button + Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            marginBottom: "12px",
            padding: "6px 12px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.75rem", margin: "0 0 4px" }}>
              {region.name} Regional Zone
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                margin: 0,
              }}
            >
              {region.district} District, Chhattisgarh
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span
              className={`status-badge ${region.compliance >= 80 ? "status-good" : region.compliance >= 60 ? "status-moderate" : "status-poor"}`}
            >
              Score: {region.compliance}%
            </span>
            <span
              style={{
                fontSize: "0.78rem",
                padding: "4px 12px",
                borderRadius: "20px",
                background: `${color}15`,
                color,
                border: `1px solid ${color}30`,
                fontWeight: 700,
              }}
            >
              Risk: {getRiskLevel(region.compliance)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        <StatCard
          icon={<Factory size={18} />}
          label="Total Industries"
          value={totalInd}
          color="#3b82f6"
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          label="Compliant"
          value={totalInd > 0 ? `${compliantInd} (${Math.round((compliantInd / totalInd) * 100)}%)` : "0"}
          color="#10b981"
        />
        <StatCard
          icon={<XCircle size={18} />}
          label="Non-Compliant"
          value={totalInd > 0 ? `${nonCompliantInd} (${Math.round((nonCompliantInd / totalInd) * 100)}%)` : "0"}
          color="#ef4444"
        />
        <StatCard
          icon={<MapPin size={18} />}
          label="Monitoring Stations"
          value={region.stationsCount || 0}
          color="#f59e0b"
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Pending"
          value={pendingInd}
          color="#f59e0b"
        />
      </div>

      {/* Region Map */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
          minHeight: "350px",
        }}
      >
        <div
          className="glass-panel"
          style={{ overflow: "hidden", minHeight: "350px" }}
        >
          <MapContainer
            center={[region.lat, region.lng]}
            zoom={11}
            style={{ height: "100%", width: "100%", background: "#e8ecf1" }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            {stations.map((s) => (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={createIcon(
                  s.type === "AIR"
                    ? "#10b981"
                    : s.type === "WATER"
                      ? "#3b82f6"
                      : "#ef4444",
                  s.type === "AIR"
                    ? s.aqi || "—"
                    : s.type === "WATER"
                      ? s.ph || "—"
                      : s.laeq || "—",
                )}
              >
                <Popup>
                  <div
                    style={{
                      background: "#0f1523",
                      color: "white",
                      padding: "10px",
                      borderRadius: "8px",
                      minWidth: "150px",
                    }}
                  >
                    <h4 style={{ margin: "0 0 4px", fontSize: "13px" }}>
                      {s.name}
                    </h4>
                    <p
                      style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}
                    >
                      {s.type} Station
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
            {industries.map((i) => (
              <Marker key={i.id} position={[i.lat, i.lng]} icon={factoryIcon}>
                <Popup>
                  <div
                    style={{
                      background: "#0f1523",
                      color: "white",
                      padding: "10px",
                      borderRadius: "8px",
                      minWidth: "150px",
                    }}
                  >
                    <h4 style={{ margin: "0 0 4px", fontSize: "13px" }}>
                      {i.name}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        color: i.compliant ? "#10b981" : "#ef4444",
                      }}
                    >
                      {i.compliant ? "✓ Compliant" : "✗ Non-compliant"}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ fontSize: "1rem", margin: 0 }}>
            Regional Pollution Trends
          </h3>
          <div
            style={{
              display: "flex",
              background: "rgba(0,0,0,0.2)",
              padding: "3px",
              borderRadius: "10px",
            }}
          >
            {[
              { k: "air", l: "Air", i: <Wind size={14} /> },
              { k: "water", l: "Water", i: <Droplets size={14} /> },
              { k: "noise", l: "Noise", i: <Volume2 size={14} /> },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTrendType(t.k)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background:
                    trendType === t.k ? "rgba(16,185,129,0.15)" : "transparent",
                  color:
                    trendType === t.k ? "#10b981" : "var(--text-secondary)",
                  border: "none",
                  transition: "all 0.2s",
                }}
              >
                {t.i} {t.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: "250px" }}>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={
                        trendType === "air"
                          ? "#10b981"
                          : trendType === "water"
                            ? "#3b82f6"
                            : "#ef4444"
                      }
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        trendType === "air"
                          ? "#10b981"
                          : trendType === "water"
                            ? "#3b82f6"
                            : "#ef4444"
                      }
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  tickMargin={8}
                  tickFormatter={(v) => {
                    if (!v) return "";
                    const d = new Date(v + "T00:00:00");
                    return `${d.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]}`;
                  }}
                  interval={Math.max(0, Math.floor(trendData.length / 6) - 1)}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,15,25,0.95)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={
                    trendType === "air"
                      ? "aqi"
                      : trendType === "water"
                        ? "ph"
                        : "noise"
                  }
                  stroke={
                    trendType === "air"
                      ? "#10b981"
                      : trendType === "water"
                        ? "#3b82f6"
                        : "#ef4444"
                  }
                  strokeWidth={2}
                  fill="url(#trendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              No monitoring data available for this region
            </div>
          )}
        </div>
      </div>

      {/* Industries Table */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--glass-border)",
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Factory size={16} color="#3b82f6" /> Industries in Region (
            {industries.length})
          </h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Industry</th>
                <th>Type</th>
                <th>Violations</th>
                <th>Last Report</th>
                <th>Issue</th>
              </tr>
            </thead>
            <tbody>
              {industries.map((ind) => (
                <tr key={ind.id}>
                  <td>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: ind.compliant ? "#10b981" : "#ef4444",
                        boxShadow: `0 0 6px ${ind.compliant ? "#10b981" : "#ef4444"}60`,
                      }}
                    />
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {ind.name}
                  </td>
                  <td>{ind.type}</td>
                  <td
                    style={{
                      color: ind.violations > 0 ? "#ef4444" : "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    {ind.violations}
                  </td>
                  <td>{ind.lastReport}</td>
                  <td
                    style={{
                      color: ind.problem ? "#f87171" : "#10b981",
                      fontSize: "0.8rem",
                    }}
                  >
                    {ind.problem || "✓ All clear"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monitoring Stations Table */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--glass-border)",
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <MapPin size={16} color="#f59e0b" /> Monitoring Stations (
            {stations.length})
          </h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Station</th>
                <th>Type</th>
                <th>Reading</th>
                <th>Status</th>
                <th>Coordinates</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((stn) => (
                <tr key={stn.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {stn.name}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background:
                          stn.type === "AIR"
                            ? "rgba(16,185,129,0.1)"
                            : stn.type === "WATER"
                              ? "rgba(59,130,246,0.1)"
                              : "rgba(239,68,68,0.1)",
                        color:
                          stn.type === "AIR"
                            ? "#10b981"
                            : stn.type === "WATER"
                              ? "#3b82f6"
                              : "#ef4444",
                      }}
                    >
                      {stn.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {stn.type === "AIR"
                      ? `${stn.aqi} AQI`
                      : stn.type === "WATER"
                        ? `${stn.ph} pH`
                        : `${stn.laeq} dB`}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${stn.status === "Good" ? "status-good" : stn.status === "Moderate" ? "status-moderate" : "status-poor"}`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      {stn.status}
                    </span>
                  </td>
                  <td
                    style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
                  >
                    {stn.lat.toFixed(4)}°N, {stn.lng.toFixed(4)}°E
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div
    className="glass-panel"
    style={{
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    <div
      style={{
        width: "38px",
        height: "38px",
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
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          margin: "0 0 2px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          margin: 0,
          fontFamily: "var(--font-display)",
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

export default RegionalZonePage;

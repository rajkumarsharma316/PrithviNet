import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Building2,
  MapPin,
  Factory,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Plus,
  Wind,
  Droplets,
  Volume2,
  TrendingUp,
  TrendingDown,
  Settings,
  Trash2,
  Edit3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createIndustry, createMonitoringLocation, getRegionTrend } from "../api";

const factoryIcon = (compliant) =>
  L.divIcon({
    className: "custom-map-marker",
    html: `<div style="background:${compliant ? "#10b981" : "#ef4444"};border:2px solid white;border-radius:6px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 8px ${compliant ? "#10b981" : "#ef4444"}60">🏭</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

const stationPinIcon = (type) => {
  const c =
    type === "AIR" ? "#10b981" : type === "WATER" ? "#3b82f6" : "#ef4444";
  return L.divIcon({
    className: "custom-map-marker",
    html: `<div style="background:${c};border:2px solid white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 8px ${c}60">📍</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const RegionDashboard = () => {
  const { user } = useAuth();
  const [trendType, setTrendType] = useState("air");
  const [showManageModal, setShowManageModal] = useState(null); // 'station' | 'industry' | null
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const [realIndustries, setRealIndustries] = useState([]);
  const [realStations, setRealStations] = useState([]);
  const [realAlerts, setRealAlerts] = useState([]);
  const [trendData, setTrendData] = useState([]);

  // For regional officers, use their assigned region.
  const regionId = user?.region?.id;
  const regionName = user?.region?.name || "Unknown Region";
  const regionDistrict = user?.region?.district || "—";
  const regionLat = user?.region?.lat || 21.25;
  const regionLng = user?.region?.lng || 81.63;

  React.useEffect(() => {
    import("../api").then(
      ({ getIndustries, getMonitoringLocations, getAlerts }) => {
        // Fetch industries
        getIndustries().then((res) => {
          if (res.ok) {
            const regional = res.data.filter(
              (ind) => ind.regionId === regionId,
            );
            setRealIndustries(regional);
          }
        });
        // Fetch stations
        getMonitoringLocations().then((res) => {
          if (res.ok) {
            const regional = res.data.filter((st) => st.regionId === regionId);
            setRealStations(regional);
          }
        });
        // Fetch alerts
        getAlerts("ACTIVE").then((res) => {
          if (res.ok) {
            const regional = res.data.filter(
              (a) =>
                a.location?.region?.name === regionName ||
                a.regionId === regionId,
            );
            setRealAlerts(regional);
          }
        });
      },
    );
    // Fetch trend data
    if (regionId) {
      getRegionTrend(regionId).then((res) => {
        if (res.ok && Array.isArray(res.data)) setTrendData(res.data);
      });
    }
  }, [regionId, regionName]);

  const industries = realIndustries.map((ind) => ({
    id: ind.id,
    name: ind.name,
    type: ind.type,
    lat: ind.lat,
    lng: ind.lng,
    region: regionName,
    compliant: ind.status === "ACTIVE",
    violations: 0,
    status: ind.status,
  }));

  const stations = realStations;
  const alerts = realAlerts;

  // Compute real stats
  const totalIndustries = industries.length;
  const compliantCount = industries.filter(i => i.compliant).length;
  const nonCompliantCount = totalIndustries - compliantCount;
  const compliance = totalIndustries > 0 ? Math.round((compliantCount / totalIndustries) * 100) : 100;

  const updateIndStatus = async (id, status, text) => {
    import("../api").then(async ({ updateIndustry }) => {
      const res = await updateIndustry(id, { status });
      if (res.ok) {
        setRealIndustries((prev) =>
          prev.map((ind) => (ind.id === id ? { ...ind, status } : ind)),
        );
        alert(text);
      } else {
        alert("Failed to update industry status.");
      }
    });
  };

  const handleApprove = (id) =>
    updateIndStatus(id, "ACTIVE", "Industry approved.");
  const handleReject = (id) =>
    updateIndStatus(id, "INACTIVE", "Industry rejected.");
  const handleSuspend = (id) =>
    updateIndStatus(id, "SUSPENDED", "Industry suspended.");

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const baseBody = {
      name: form.name,
      type: form.type || (showManageModal === "station" ? "AIR" : ""),
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      regionId,
    };

    let r;
    if (showManageModal === "industry") {
      r = await createIndustry({
        ...baseBody,
        registrationNo: form.registrationNo,
      });
    } else {
      r = await createMonitoringLocation(baseBody);
    }

    setSaving(false);
    if (r.ok) {
      setShowManageModal(null);
      // Here we would typically refresh data from API, but for demo we just close modal
      alert(
        `Successfully created ${showManageModal}. It is now pending admin approval.`,
      );
    } else {
      setError(r.data?.error || "Failed to create");
    }
  };

  const openManageModal = (type) => {
    setForm({
      name: "",
      type: type === "station" ? "AIR" : "",
      lat: "",
      lng: "",
      registrationNo: "",
    });
    setError("");
    setShowManageModal(type);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
      }}
    >
      {/* Header */}
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
            My Region: {regionName}
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            Regional Officer Dashboard — {regionDistrict} District
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <span
            className={`status-badge ${compliance >= 80 ? "status-good" : compliance >= 60 ? "status-moderate" : "status-poor"}`}
          >
            Compliance: {compliance}%
          </span>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        <MiniStat
          icon={<Factory size={18} />}
          label="Industries"
          value={totalIndustries}
          color="#3b82f6"
        />
        <MiniStat
          icon={<CheckCircle size={18} />}
          label="Compliant"
          value={compliantCount}
          color="#10b981"
        />
        <MiniStat
          icon={<XCircle size={18} />}
          label="Non-Compliant"
          value={nonCompliantCount}
          color="#ef4444"
        />
        <MiniStat
          icon={<MapPin size={18} />}
          label="Stations"
          value={stations.length}
          color="#f59e0b"
        />
        <MiniStat
          icon={<AlertTriangle size={18} />}
          label="Active Alerts"
          value={alerts.length}
          color="#ef4444"
        />
      </div>

      {/* Map + Alerts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "16px",
          minHeight: "340px",
        }}
      >
        <div className="glass-panel" style={{ overflow: "hidden" }}>
          <MapContainer
            center={[regionLat, regionLng]}
            zoom={11}
            style={{ height: "100%", width: "100%", background: "#e8ecf1" }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <Circle
              center={[regionLat, regionLng]}
              radius={20000}
              pathOptions={{
                color: "transparent",
                fillColor: compliance >= 80 ? "#10b981" : compliance >= 60 ? "#f59e0b" : "#ef4444",
                fillOpacity: 0.1,
              }}
            />
            {stations.map((s) => (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={stationPinIcon(s.type)}
              >
                <Popup>
                  <div
                    style={{
                      background: "#0f1523",
                      color: "white",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <b>{s.name}</b>
                  </div>
                </Popup>
              </Marker>
            ))}
            {industries.map((i) => (
              <Marker
                key={i.id}
                position={[i.lat, i.lng]}
                icon={factoryIcon(i.compliant)}
              >
                <Popup>
                  <div
                    style={{
                      background: "#0f1523",
                      color: "white",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <b>{i.name}</b>
                    <br />
                    <span
                      style={{
                        color: i.compliant ? "#10b981" : "#ef4444",
                        fontSize: "12px",
                      }}
                    >
                      {i.compliant ? "✓ Compliant" : "✗ Non-compliant"}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              margin: "0 0 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertTriangle size={16} color="#ef4444" /> Region Alerts
          </h3>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {alerts.length === 0 ? (
              <p
                style={{
                  color: "var(--text-muted)",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                No active alerts ✅
              </p>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.03)",
                    borderLeft: `3px solid ${a.severity === "CRITICAL" ? "#ef4444" : a.severity === "WARNING" ? "#fbbf24" : "#3b82f6"}`,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    {a.parameter}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {a.message.substring(0, 80)}…
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="glass-panel" style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ fontSize: "1rem", margin: 0 }}>
            30-Day Pollution Trends
          </h3>
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "rgba(0,0,0,0.2)",
              padding: "3px",
              borderRadius: "10px",
            }}
          >
            {[
              { k: "air", l: "Air", c: "#10b981" },
              { k: "water", l: "Water", c: "#3b82f6" },
              { k: "noise", l: "Noise", c: "#ef4444" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTrendType(t.k)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: trendType === t.k ? `${t.c}20` : "transparent",
                  color: trendType === t.k ? t.c : "var(--text-muted)",
                  border: "none",
                }}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: "200px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
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
                fill={
                  trendType === "air"
                    ? "#10b98115"
                    : trendType === "water"
                      ? "#3b82f615"
                      : "#ef444415"
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Management Actions */}
      {user?.role === "REGIONAL_OFFICER" && (
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="action-btn primary-btn"
            onClick={() => openManageModal("station")}
          >
            <Plus size={16} /> Add Monitoring Station
          </button>
        </div>
      )}

      {/* Industries Table */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--glass-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ fontSize: "0.95rem", margin: 0 }}>
            Industries ({industries.length})
          </h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Type</th>
                <th>Violations</th>
                <th>Status</th>
                {user?.role === "REGIONAL_OFFICER" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {industries.map((ind) => (
                <tr key={ind.id}>
                  <td>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: ind.status === "ACTIVE" ? "#10b981" : ind.status === "PENDING" ? "#f59e0b" : "#ef4444",
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
                    }}
                  >
                    {ind.violations}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${ind.status === "ACTIVE" ? "status-good" : ind.status === "PENDING" ? "status-moderate" : "status-poor"}`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      {ind.status}
                    </span>
                  </td>
                  {user?.role === "REGIONAL_OFFICER" && (
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {ind.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(ind.id)}
                              className="action-btn primary-btn"
                              style={{
                                padding: "4px 10px",
                                fontSize: "0.75rem",
                                height: "auto",
                                background: "#3b82f6",
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(ind.id)}
                              className="action-btn primary-btn"
                              style={{
                                padding: "4px 10px",
                                fontSize: "0.75rem",
                                height: "auto",
                                background: "#ef4444",
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {ind.status === "ACTIVE" && (
                          <button
                            onClick={() => handleSuspend(ind.id)}
                            className="action-btn primary-btn"
                            style={{
                              padding: "4px 10px",
                              fontSize: "0.75rem",
                              height: "auto",
                              background: "#f59e0b",
                            }}
                          >
                            Suspend
                          </button>
                        )}
                        {ind.status === "SUSPENDED" && (
                          <button
                            onClick={() => handleApprove(ind.id)}
                            className="action-btn primary-btn"
                            style={{
                              padding: "4px 10px",
                              fontSize: "0.75rem",
                              height: "auto",
                              background: "#3b82f6",
                            }}
                          >
                            Re-activate
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Modal */}
      {showManageModal && (
        <div className="modal-overlay" onClick={() => setShowManageModal(null)}>
          <div
            className="modal glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "16px" }}>
              Add{" "}
              {showManageModal === "station"
                ? "Monitoring Station"
                : "Industry"}
            </h3>
            {error && (
              <div className="auth-error" style={{ marginBottom: "12px" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleCreate}>
              <div className="modal-fields">
                <div>
                  <label>Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => u("name", e.target.value)}
                    required
                    placeholder={`Enter ${showManageModal} name`}
                  />
                </div>
                <div>
                  <label>Type</label>
                  {showManageModal === "station" ? (
                    <select
                      value={form.type}
                      onChange={(e) => u("type", e.target.value)}
                      required
                    >
                      <option value="AIR">AIR</option>
                      <option value="WATER">WATER</option>
                      <option value="NOISE">NOISE</option>
                    </select>
                  ) : (
                    <input
                      value={form.type}
                      onChange={(e) => u("type", e.target.value)}
                      required
                      placeholder="e.g. Steel, Cement, Chemical"
                    />
                  )}
                </div>
                <div>
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={(e) => u("lat", e.target.value)}
                    required
                    placeholder="e.g. 21.2514"
                  />
                </div>
                <div>
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={(e) => u("lng", e.target.value)}
                    required
                    placeholder="e.g. 81.6296"
                  />
                </div>
                {showManageModal === "industry" && (
                  <div>
                    <label>Registration No.</label>
                    <input
                      value={form.registrationNo}
                      onChange={(e) => u("registrationNo", e.target.value)}
                      required
                      placeholder="e.g. CG-STL-001"
                    />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="submit"
                  className="action-btn primary-btn"
                  disabled={saving}
                  style={{ flex: 1 }}
                >
                  {saving ? <span className="spinner"></span> : "Create"}
                </button>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => setShowManageModal(null)}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MiniStat = ({ icon, label, value, color }) => (
  <div
    className="glass-panel"
    style={{
      padding: "14px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }}
  >
    <div
      style={{
        width: "36px",
        height: "36px",
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
          margin: "0 0 1px",
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

export default RegionDashboard;

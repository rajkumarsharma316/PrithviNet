import React, { useState, useEffect } from "react";
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
  Factory,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Clock,
  Upload,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  submitMonitoringData,
  getMonitoringLocations,
  getMonitoringData,
} from "../api";

const IndustryDashboard = () => {
  const { user } = useAuth();

  // ── IMPORTANT: these must be declared BEFORE any useEffect that references them ──
  const isPending = user?.industry?.status === "PENDING";
  const industryName = user?.industry?.name || "Your Industry";
  const industryType = user?.industry?.type || "Manufacturing";

  const [activeParam, setActiveParam] = useState("pm25");
  const [reportType, setReportType] = useState("air");
  const [reportForm, setReportForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [emissionsData, setEmissionsData] = useState([]);
  const [violations, setViolations] = useState([]);
  const [roName, setRoName] = useState("Loading...");

  // Fetch regional office name for the PENDING banner
  useEffect(() => {
    if (!user?.industry?.regionId) return;
    import("../api").then(({ getRegionalOffices }) => {
      getRegionalOffices().then((res) => {
        if (res.ok) {
          const ro = res.data.find((r) => r.id === user.industry.regionId);
          if (ro) setRoName(`${ro.name} (${ro.district} District)`);
          else setRoName("Unknown Regional Office");
        }
      });
    });
  }, [user?.industry?.regionId]);

  // Fetch emissions data + violations — skip when status is PENDING
  useEffect(() => {
    if (isPending) return;

    let type = "AIR";
    if (["ph", "bod"].includes(activeParam)) type = "WATER";
    if (activeParam === "noise") type = "NOISE";

    getMonitoringData(type, 500).then((res) => {
      if (res.ok && res.data.length > 0) {
        // Aggregate by day to get daily averages
        const dayMap = {};
        res.data.forEach((d) => {
          const dateStr = new Date(d.timestamp).toISOString().slice(0, 10);
          if (!dayMap[dateStr]) dayMap[dateStr] = { date: dateStr, sum: 0, n: 0 };
          const val = d[activeParam === "noise" ? "laeq" : activeParam];
          if (val != null) { dayMap[dateStr].sum += val; dayMap[dateStr].n++; }
        });
        const mapped = Object.values(dayMap)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((d) => ({
            date: d.date,
            [activeParam]: d.n > 0 ? parseFloat((d.sum / d.n).toFixed(1)) : 0,
          }));
        setEmissionsData(mapped);
      } else {
        setEmissionsData([]);
      }
    });

    import("../api").then(({ getAlerts }) => {
      getAlerts().then((res) => {
        if (res.ok) {
          const myAlerts = res.data.filter(
            (a) => a.location?.industryId === user?.industry?.id,
          );
          setViolations(
            myAlerts.map((a) => ({
              date: new Date(a.createdAt).toISOString().split("T")[0],
              type: a.parameter,
              value: a.value,
              limit: a.limit,
              status: a.severity === "CRITICAL" ? "Active" : "Resolved",
            })),
          );
        }
      });
    });
  }, [activeParam, isPending, user?.industry?.id]);

  const PARAMS = [
    { key: "pm25", label: "PM2.5", unit: "µg/m³", color: "#fbbf24" },
    { key: "so2", label: "SO₂", unit: "ppb", color: "#ef4444" },
    { key: "no2", label: "NO₂", unit: "ppb", color: "#10b981" },
    { key: "ph", label: "pH", unit: "", color: "#3b82f6" },
    { key: "bod", label: "BOD", unit: "mg/L", color: "#8b5cf6" },
    { key: "noise", label: "Noise", unit: "dB(A)", color: "#f59e0b" },
  ];

  const currentParam = PARAMS.find((p) => p.key === activeParam);

  const uf = (k, v) => setReportForm((f) => ({ ...f, [k]: v }));

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg("");

    const locRes = await getMonitoringLocations(reportType.toUpperCase());
    const locations = locRes.ok ? locRes.data : [];
    const loc =
      locations.find((l) => l.industryId === user?.industry?.id) ||
      locations[0];

    if (!loc) {
      setSubmitMsg(
        "No monitoring location found. Contact your regional office.",
      );
      setSubmitting(false);
      return;
    }

    const body = { locationId: loc.id, ...reportForm };
    const res = await submitMonitoringData(reportType, body);
    setSubmitting(false);
    if (res.ok) {
      setSubmitMsg("Report submitted successfully!");
      setReportForm({});
    } else {
      setSubmitMsg(res.data?.error || "Submission failed");
    }
  };

  const REPORT_FIELDS = {
    air: [
      { key: "pm25", label: "PM2.5 (µg/m³)" },
      { key: "pm10", label: "PM10 (µg/m³)" },
      { key: "no2", label: "NO₂ (ppb)" },
      { key: "so2", label: "SO₂ (ppb)" },
      { key: "co", label: "CO (ppm)" },
      { key: "o3", label: "O₃ (ppb)" },
    ],
    water: [
      { key: "ph", label: "pH" },
      { key: "tds", label: "TDS (mg/L)" },
      { key: "turbidity", label: "Turbidity (NTU)" },
      { key: "dissolvedOxygen", label: "DO (mg/L)" },
      { key: "bod", label: "BOD (mg/L)" },
      { key: "cod", label: "COD (mg/L)" },
    ],
    noise: [
      { key: "laeq", label: "LAeq dB(A)" },
      { key: "lmax", label: "Lmax dB(A)" },
      { key: "lmin", label: "Lmin dB(A)" },
    ],
  };

  // ── PENDING UI ──
  if (isPending) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            padding: "24px",
            borderRadius: "50%",
            border: "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          <Clock size={48} color="#f59e0b" />
        </div>
        <div>
          <h2 style={{ fontSize: "1.8rem", margin: "0 0 12px" }}>
            Registration Pending Approval
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              maxWidth: "500px",
              margin: "0 auto 24px",
              lineHeight: 1.6,
            }}
          >
            Your industry registration for <strong>{industryName}</strong> has
            been submitted and is currently awaiting approval from the regional
            office. Once approved, you will be able to access your full dashboard
            and submit emission reports.
          </p>

          {/* Regional Office Info */}
          <div
            className="glass-panel"
            style={{
              padding: "20px",
              display: "inline-block",
              textAlign: "left",
              minWidth: "300px",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Assigned Regional Office
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Factory size={18} color="#3b82f6" /> {roName}
            </p>
          </div>

          {/* Industry Details */}
          <div
            className="glass-panel"
            style={{
              padding: "20px",
              display: "inline-block",
              textAlign: "left",
              minWidth: "300px",
              marginTop: "16px",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Industry Details
            </p>
            <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
              {industryName}
            </p>
            <p
              style={{
                margin: "0 0 4px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              Type: {industryType}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              Reg. No: {user?.industry?.registrationNo || "—"}
            </p>
          </div>

          {/* Null Stats Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
              marginTop: "24px",
              maxWidth: "600px",
              margin: "24px auto 0",
            }}
          >
            <StatCard
              icon={<CheckCircle size={18} />}
              label="Compliance"
              value="—"
              color="#6b7280"
            />
            <StatCard
              icon={<AlertTriangle size={18} />}
              label="Violations"
              value="—"
              color="#6b7280"
            />
            <StatCard
              icon={<FileText size={18} />}
              label="Reports"
              value="—"
              color="#6b7280"
            />
            <StatCard
              icon={<TrendingUp size={18} />}
              label="Trend"
              value="—"
              color="#6b7280"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE / APPROVED UI ──
  const activeViolations = violations.filter(
    (v) => v.status === "Active",
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
          <h2
            style={{
              fontSize: "1.5rem",
              margin: "0 0 4px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Factory size={24} color="#3b82f6" />
            {industryName}
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            {industryType} • Industry Dashboard
          </p>
        </div>
        <span className="status-badge status-good">
          Status: {user?.industry?.status || "ACTIVE"}
        </span>
      </div>

      {/* Stats — dynamic from fetched data */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        <StatCard
          icon={<CheckCircle size={18} />}
          label="Compliance Score"
          value={activeViolations === 0 ? "100%" : `${Math.max(0, 100 - activeViolations * 14)}%`}
          color={activeViolations === 0 ? "#10b981" : "#fbbf24"}
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Active Violations"
          value={String(activeViolations)}
          color={activeViolations > 0 ? "#ef4444" : "#10b981"}
        />
        <StatCard
          icon={<FileText size={18} />}
          label="Reports Submitted"
          value={String(emissionsData.length)}
          color="#3b82f6"
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Total Violations"
          value={String(violations.length)}
          color="#f59e0b"
        />
      </div>

      {/* Emission Trends Chart */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h3 style={{ fontSize: "1rem", margin: 0 }}>
            Emission Trends (30 Days)
          </h3>
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "rgba(0,0,0,0.2)",
              padding: "3px",
              borderRadius: "10px",
              flexWrap: "wrap",
            }}
          >
            {PARAMS.map((p) => (
              <button
                key={p.key}
                onClick={() => setActiveParam(p.key)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  background:
                    activeParam === p.key ? `${p.color}20` : "transparent",
                  color: activeParam === p.key ? p.color : "var(--text-muted)",
                  border:
                    activeParam === p.key
                      ? `1px solid ${p.color}40`
                      : "1px solid transparent",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: "280px" }}>
          {emissionsData.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--text-muted)",
              }}
            >
              No emission data available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={emissionsData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="emGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={currentParam.color}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={currentParam.color}
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
                  tickFormatter={(v) => {
                    if (!v) return "";
                    const d = new Date(v + "T00:00:00");
                    return `${d.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]}`;
                  }}
                  interval={Math.max(0, Math.floor(emissionsData.length / 7) - 1)}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,15,25,0.95)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  labelFormatter={(v) => {
                    if (!v) return "";
                    const d = new Date(v + "T00:00:00");
                    return `${d.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={activeParam}
                  stroke={currentParam.color}
                  strokeWidth={2}
                  fill="url(#emGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Violations History */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--glass-border)",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertTriangle size={16} color="#ef4444" /> Violation History
          </h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Value</th>
                <th>Limit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {violations.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "var(--text-muted)",
                    }}
                  >
                    No violations recorded.
                  </td>
                </tr>
              ) : (
                violations.map((v, i) => (
                  <tr key={i}>
                    <td>{v.date}</td>
                    <td
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {v.type}
                    </td>
                    <td style={{ color: "#ef4444", fontWeight: 600 }}>
                      {v.value}
                    </td>
                    <td>{v.limit}</td>
                    <td>
                      <span
                        className={`status-badge ${v.status === "Resolved" ? "status-good" : "status-poor"}`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Emission Report */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "10px",
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
            <Upload size={18} color="#10b981" /> Submit Emission Report
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
                onClick={() => {
                  setReportType(t.k);
                  setReportForm({});
                  setSubmitMsg("");
                }}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: reportType === t.k ? `${t.c}20` : "transparent",
                  color: reportType === t.k ? t.c : "var(--text-muted)",
                  border: "none",
                }}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>
        {submitMsg && (
          <div
            style={{
              marginBottom: "12px",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              background: submitMsg.includes("success")
                ? "rgba(16,185,129,0.1)"
                : "rgba(239,68,68,0.1)",
              color: submitMsg.includes("success") ? "#10b981" : "#ef4444",
              border: `1px solid ${submitMsg.includes("success") ? "#10b98140" : "#ef444440"}`,
            }}
          >
            {submitMsg}
          </div>
        )}
        <form onSubmit={handleReportSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            {REPORT_FIELDS[reportType].map((f) => (
              <div key={f.key}>
                <label
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-secondary)",
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  {f.label}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.0"
                  value={reportForm[f.key] || ""}
                  onChange={(e) => uf(f.key, parseFloat(e.target.value) || "")}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--glass-border)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                  }}
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="action-btn primary-btn"
            disabled={submitting}
            style={{ marginTop: "16px" }}
          >
            {submitting ? (
              <span className="spinner"></span>
            ) : (
              <>
                <Upload size={16} /> Submit Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
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

export default IndustryDashboard;

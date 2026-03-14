import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { aiForecast, getMonitoringLocations } from "../api";
import { LineChart as LineChartIcon, RefreshCw } from "lucide-react";

const CARD_STYLE = {
  background: "#ffffff",
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  border: "1px solid rgba(0,0,0,0.06)",
};

const RISK_STYLES = {
  LOW: { background: "#22c55e", color: "#fff" },
  MODERATE: { background: "#eab308", color: "#1f2937" },
  MEDIUM: { background: "#eab308", color: "#1f2937" },
  HIGH: { background: "#c2410c", color: "#fff" },
  CRITICAL: { background: "#dc2626", color: "#fff" },
  STABLE: { background: "#22c55e", color: "#fff" },
  IMPROVING: { background: "#16a34a", color: "#fff" },
  UNKNOWN: { background: "#6b7280", color: "#fff" },
};

export default function AiForecastPage() {
  const [type, setType] = useState("air");
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    getMonitoringLocations().then((res) => {
      if (res.ok) setLocations(res.data);
    });
  }, []);

  const runForecast = async () => {
    setError("");
    setLoading(true);
    const res = await aiForecast(type, locationId || undefined, 72);
    setLoading(false);
    if (!res.ok) {
      setError(res.data?.error || "Failed to compute forecast.");
      return;
    }
    setForecast(res.data);
  };

  const chartData =
    forecast &&
    [
      ...forecast.history.map((p) => ({
        time: p.timestamp,
        history: p.value,
      })),
      ...forecast.forecast.map((p) => ({
        time: p.timestamp,
        forecast: p.value,
      })),
    ];

  const riskStyle = RISK_STYLES[forecast?.risk?.level] || RISK_STYLES.UNKNOWN;
  const isAir = type === "air";

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#f3f4f6",
        padding: 20,
      }}
    >
      <div style={{ ...CARD_STYLE, padding: "20px 24px", marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <LineChartIcon size={22} style={{ color: "#374151" }} />
          <div>
            <div className="heading-box" style={{ fontSize: "1rem" }}>AI Predictive Forecasting (72h)</div>
            <div className="text-box text-box-blue" style={{ fontSize: "0.85rem", marginTop: 8, marginBottom: 0 }}>
              Linear regression over recent monitoring data
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                padding: "8px 14px",
                border: "1px solid #d1d5db",
                background: "#fff",
                borderRadius: 8,
                fontSize: "0.85rem",
                color: "#374151",
                fontWeight: 500,
              }}
            >
              <option value="air">AQI</option>
              <option value="water">Water pH</option>
              <option value="noise">Noise dB</option>
            </select>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              style={{
                padding: "8px 14px",
                border: "1px solid #d1d5db",
                background: "#fff",
                borderRadius: 8,
                fontSize: "0.85rem",
                color: "#374151",
                minWidth: 160,
              }}
            >
              <option value="">All locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <button
              onClick={runForecast}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                fontSize: "0.85rem",
                fontWeight: 600,
                background: "var(--govt-blue)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <RefreshCw size={14} />
              Run forecast
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          ...CARD_STYLE,
          padding: 20,
          minHeight: 320,
        }}
      >
        {error && (
          <div className="text-box text-box-danger" style={{ marginBottom: 12, marginTop: 0 }}>
            {error}
          </div>
        )}
        {!forecast && !loading && !error && (
          <p className="text-box text-box-grey" style={{ fontSize: "0.9rem", marginBottom: 0 }}>
            Select a data type and (optionally) a location, then click <strong>Run forecast</strong> to see projections.
          </p>
        )}
        {loading && (
          <p className="text-box text-box-amber" style={{ fontSize: "0.9rem", marginBottom: 0 }}>Computing forecast…</p>
        )}
        {forecast && chartData && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%" minHeight={280}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              {isAir && (
                <>
                  <ReferenceArea y1={0} y2={50} fill="#22c55e" fillOpacity={0.12} />
                  <ReferenceArea y1={50} y2={100} fill="#eab308" fillOpacity={0.12} />
                  <ReferenceArea y1={100} y2={150} fill="#f97316" fillOpacity={0.12} />
                  <ReferenceArea y1={150} y2={200} fill="#dc2626" fillOpacity={0.12} />
                  <ReferenceArea y1={200} y2={300} fill="#7c3aed" fillOpacity={0.12} />
                </>
              )}
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tickFormatter={(t) => t.slice(5, 16)}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                stroke="#9ca3af"
              />
              <YAxis
                label={{
                  value: forecast.unitLabel,
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#374151", fontSize: 12 },
                }}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                stroke="#9ca3af"
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ color: "#374151" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) => (
                  <span style={{ color: "#374151" }}>{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="history"
                stroke="#374151"
                strokeWidth={2}
                dot={false}
                name="Historical data"
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#1d4ed8"
                strokeWidth={2.5}
                dot={false}
                strokeDasharray="4 4"
                name="Predicted"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {forecast && (
        <div
          style={{
            marginTop: 16,
            ...CARD_STYLE,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span className="label-box" style={{ marginRight: 4 }}>Risk level</span>
          <span
            className="text-box"
            style={{
              padding: "6px 14px",
              borderRadius: 4,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: riskStyle.color,
              background: riskStyle.background,
              border: "1px solid transparent",
              marginBottom: 0,
            }}
          >
            {forecast.risk.level}
          </span>
          <span className="text-box text-box-grey" style={{ fontSize: "0.85rem", marginBottom: 0 }}>
            {forecast.risk.reason}
          </span>
        </div>
      )}
    </div>
  );
}


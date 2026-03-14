import React, { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { aiForecast, getMonitoringLocations } from "../api";
import { LineChart as LineChartIcon, RefreshCw } from "lucide-react";

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

  return (
    <div
      className="glass-panel"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <LineChartIcon size={18} />
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Short‑term Forecast (AI‑assisted)
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Uses linear regression over recent monitoring data to project the next 72
            hours.
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 8,
            alignItems: "center",
            fontSize: "0.8rem",
          }}
        >
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              padding: "4px 6px",
              border: "1px solid var(--border-subtle)",
              background: "white",
              fontSize: "0.8rem",
            }}
          >
            <option value="air">Air (AQI)</option>
            <option value="water">Water (pH)</option>
            <option value="noise">Noise (dB)</option>
          </select>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            style={{
              padding: "4px 6px",
              border: "1px solid var(--border-subtle)",
              background: "white",
              fontSize: "0.8rem",
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
              padding: "6px 10px",
              fontSize: "0.8rem",
              fontWeight: 600,
              background:
                "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              color: "white",
              border: "none",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <RefreshCw size={14} />
            Run forecast
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "12px 20px" }}>
        {error && (
          <div
            style={{
              marginBottom: 10,
              padding: "8px 10px",
              border: "1px solid rgba(248,113,113,0.5)",
              color: "#b91c1c",
              fontSize: "0.82rem",
            }}
          >
            {error}
          </div>
        )}
        {!forecast && !loading && !error && (
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Select a data type and (optionally) a location, then click{" "}
            <strong>Run forecast</strong> to see projections.
          </p>
        )}
        {loading && <p style={{ fontSize: "0.85rem" }}>Computing forecast…</p>}
        {forecast && chartData && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tickFormatter={(t) => t.slice(5, 16)} />
              <YAxis
                label={{
                  value: forecast.unitLabel,
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="history"
                stroke="#4b5563"
                dot={false}
                name="History"
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#fb923c"
                dot={false}
                strokeDasharray="4 4"
                name="Forecast"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {forecast && (
        <div
          style={{
            padding: "8px 20px",
            borderTop: "1px solid var(--border-subtle)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          <strong>Risk level:</strong> {forecast.risk.level} —{" "}
          <span>{forecast.risk.reason}</span>
        </div>
      )}
    </div>
  );
}


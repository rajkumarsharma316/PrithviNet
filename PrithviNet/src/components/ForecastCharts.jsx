import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Activity, Beaker, Wind, Volume2, TrendingUp } from "lucide-react";

const generateForecastData = () => {
  const data = [];
  let currentAQI = 145;
  const now = new Date();

  for (let i = 0; i < 72; i += 4) {
    // 72 hours forecast, every 4 hours
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = time.getHours();

    // diurnal pattern: worse in morning and evening, better in afternoon
    let trend = 0;
    if (hour >= 6 && hour <= 10) trend = 15;
    else if (hour >= 18 && hour <= 22) trend = 20;
    else if (hour >= 12 && hour <= 16) trend = -15;

    // random noise
    const noise = (Math.random() - 0.5) * 10;
    currentAQI = Math.max(50, Math.min(300, currentAQI + trend + noise));

    data.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: time.toLocaleDateString([], { weekday: "short" }),
      aqi: Math.round(currentAQI),
      uncertaintyMin: Math.round(currentAQI - i * 0.5), // Uncertainty grows over time
      uncertaintyMax: Math.round(currentAQI + i * 0.5),
    });
  }
  return data;
};

const forecastData = generateForecastData();

const ForecastCharts = () => {
  const [activeParam, setActiveParam] = useState("air");

  return (
    <div
      className="glass-panel"
      style={{
        padding: "24px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "1.1rem",
              margin: "0 0 4px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <TrendingUp size={18} color="var(--accent-secondary)" />
            AI Predictive Forecasting (72h)
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            Powered by DeepSurrogate & Causal Models
          </p>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: "4px",
            borderRadius: "12px",
            display: "flex",
            gap: "4px",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <button
            onClick={() => setActiveParam("air")}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: activeParam === "air" ? "white" : "var(--text-secondary)",
              background: activeParam === "air" ? "#10b981" : "transparent",
            }}
          >
            AQI (Air)
          </button>
          <button
            onClick={() => setActiveParam("water")}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              color:
                activeParam === "water" ? "white" : "var(--text-secondary)",
              background: activeParam === "water" ? "#3b82f6" : "transparent",
            }}
          >
            pH (Water)
          </button>
          <button
            onClick={() => setActiveParam("noise")}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              color:
                activeParam === "noise" ? "white" : "var(--text-secondary)",
              background: activeParam === "noise" ? "#ef4444" : "transparent",
            }}
          >
            dB(A) (Noise)
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={forecastData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUncertainty" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="rgba(255,255,255,0.1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="rgba(255,255,255,0.1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Safe limit reference line */}
            <ReferenceLine
              y={100}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              opacity={0.5}
              label={{
                position: "insideTopLeft",
                value: "Safe Limit",
                fill: "#f59e0b",
                fontSize: 10,
              }}
            />

            {/* Uncertainty Bounds (The shaded "cone" of prediction) */}
            <Area
              type="monotone"
              dataKey="uncertaintyMax"
              stroke="none"
              fill="url(#colorUncertainty)"
            />
            <Area
              type="monotone"
              dataKey="uncertaintyMin"
              stroke="none"
              fill="#060913" /* Hacks to hide the bottom portion of the uncertainty area if needed or make it match bg */
            />

            {/* Main Prediction Line */}
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAqi)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "16px",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div
            style={{ width: "12px", height: "2px", background: "#10b981" }}
          ></div>{" "}
          Point Forecast
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "2px",
            }}
          ></div>{" "}
          95% Confidence Interval
        </span>
      </div>
    </div>
  );
};

// Custom tooltip for styled hover data
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const aqi = payload.find((p) => p.dataKey === "aqi")?.value;
    const min = payload.find((p) => p.dataKey === "uncertaintyMin")?.value;
    const max = payload.find((p) => p.dataKey === "uncertaintyMax")?.value;
    const day = payload[0].payload.date;

    return (
      <div
        className="glass-panel"
        style={{
          padding: "12px",
          background: "rgba(10,15,25,0.9)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px 0",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          {day}, {label}
        </p>
        <p
          style={{
            margin: "0 0 4px 0",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#10b981",
          }}
        >
          Forecast: {aqi} AQI
        </p>
        <p
          style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}
        >
          Range: {min} - {max}
        </p>
      </div>
    );
  }
  return null;
};

export default ForecastCharts;

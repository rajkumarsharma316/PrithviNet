import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingDown,
  Wind,
  Droplets,
  Volume2,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { getYoYTrend } from "../api";

const TYPES = [
  {
    key: "air",
    label: "Air Quality (AQI)",
    icon: <Wind size={16} />,
    color: "#10b981",
    unit: "AQI",
  },
  {
    key: "water",
    label: "Water Quality (pH)",
    icon: <Droplets size={16} />,
    color: "#3b82f6",
    unit: "pH",
  },
  {
    key: "noise",
    label: "Noise Level (dB)",
    icon: <Volume2 size={16} />,
    color: "#ef4444",
    unit: "dB(A)",
  },
];

const YearOverYearTrends = () => {
  const [activeType, setActiveType] = useState("air");
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getYoYTrend(activeType).then((res) => {
      if (res.ok && res.data) {
        setYears(res.data.years || []);
        setData(res.data.data || []);
      } else {
        setData([]);
        setYears([]);
      }
      setLoading(false);
    });
  }, [activeType]);

  const typeInfo = TYPES.find((t) => t.key === activeType);
  const yKeys = years.map((y) => `y${y}`);
  const colors = ["#64748b", "#fbbf24", typeInfo.color];

  const annualAvg = (key) => {
    const vals = data.filter((d) => d[key] != null);
    if (vals.length === 0) return "—";
    return (vals.reduce((s, d) => s + d[key], 0) / vals.length).toFixed(
      activeType === "water" ? 1 : 0,
    );
  };

  const hasData = data.some((d) => yKeys.some((k) => d[k] != null));

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
          gap: "16px",
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
            <TrendingDown size={22} color="var(--accent-primary)" />
            Year-over-Year Improvement Trends
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            Monthly average comparison across years
          </p>
        </div>
        <div
          style={{
            display: "flex",
            background: "rgba(0,0,0,0.2)",
            padding: "4px",
            borderRadius: "12px",
          }}
        >
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveType(t.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                background:
                  activeType === t.key ? `${t.color}20` : "transparent",
                color: activeType === t.key ? t.color : "var(--text-secondary)",
                border:
                  activeType === t.key
                    ? `1px solid ${t.color}40`
                    : "1px solid transparent",
                fontWeight: 600,
                fontSize: "0.85rem",
                transition: "all 0.2s",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3
          style={{
            fontSize: "1rem",
            margin: "0 0 20px",
            color: "var(--text-secondary)",
          }}
        >
          {typeInfo.label} — Monthly Average
        </h3>
        <div style={{ height: "320px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <span className="spinner"></span>
            </div>
          ) : !hasData ? (
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
              No monitoring data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickMargin={10}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip content={<CustomTooltip typeInfo={typeInfo} years={years} />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => {
                    const yr = value.replace("y", "");
                    return (
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {yr}
                      </span>
                    );
                  }}
                />
                {yKeys.map((k, i) => (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={k}
                    stroke={colors[i] || typeInfo.color}
                    strokeWidth={i === yKeys.length - 1 ? 3 : i === 0 ? 1.5 : 2}
                    strokeDasharray={i === 0 ? "5 5" : undefined}
                    dot={i === yKeys.length - 1 ? { fill: typeInfo.color, r: 3 } : false}
                    activeDot={i === yKeys.length - 1 ? { r: 6 } : undefined}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Data Table */}
      {hasData && (
        <div className="glass-panel" style={{ overflow: "hidden" }}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Month</th>
                  {years.map((y) => (
                    <th key={y}>{y}</th>
                  ))}
                  <th>% Change (YoY)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.month}>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      {row.month}
                    </td>
                    {yKeys.map((k, i) => (
                      <td
                        key={k}
                        style={
                          i === yKeys.length - 1
                            ? { fontWeight: 600, color: typeInfo.color }
                            : {}
                        }
                      >
                        {row[k] != null
                          ? activeType === "water"
                            ? row[k].toFixed(1)
                            : row[k]
                          : "—"}
                      </td>
                    ))}
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          color: row.yoyChange <= 0 ? "#10b981" : "#ef4444",
                          fontWeight: 600,
                        }}
                      >
                        {row.yoyChange <= 0 ? (
                          <ArrowDown size={14} />
                        ) : (
                          <ArrowUp size={14} />
                        )}
                        {row.yoyChange}%
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Annual Average Row */}
                <tr
                  style={{
                    borderTop: "2px solid var(--glass-border)",
                    fontWeight: 700,
                  }}
                >
                  <td style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    Annual Avg
                  </td>
                  {yKeys.map((k, i) => (
                    <td
                      key={k}
                      style={
                        i === yKeys.length - 1 ? { color: typeInfo.color } : {}
                      }
                    >
                      {annualAvg(k)}
                    </td>
                  ))}
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#10b981",
                        fontWeight: 700,
                      }}
                    >
                      {(() => {
                        const prev = parseFloat(annualAvg(yKeys[yKeys.length - 2]));
                        const curr = parseFloat(annualAvg(yKeys[yKeys.length - 1]));
                        if (isNaN(prev) || isNaN(curr) || prev === 0) return "—";
                        const pct = (((curr - prev) / prev) * 100).toFixed(1);
                        return (
                          <>
                            {pct <= 0 ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                            {pct}%
                          </>
                        );
                      })()}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, typeInfo, years }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="glass-panel"
      style={{
        padding: "12px 16px",
        background: "rgba(10,15,25,0.95)",
        border: "1px solid rgba(255,255,255,0.15)",
        minWidth: "160px",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontWeight: 600,
          color: "var(--text-primary)",
          fontSize: "0.85rem",
        }}
      >
        {label}
      </p>
      {payload.map((p, i) => {
        const yr = p.dataKey?.replace("y", "") || "";
        return (
          <p
            key={i}
            style={{
              margin: "2px 0",
              fontSize: "0.8rem",
              color: p.color,
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <span>{yr}</span>
            <span style={{ fontWeight: 600 }}>
              {typeof p.value === "number" ? p.value.toFixed(1) : p.value}{" "}
              {typeInfo?.unit}
            </span>
          </p>
        );
      })}
    </div>
  );
};

export default YearOverYearTrends;

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Wind,
  Droplets,
  Volume2,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { generateYoYData } from "../mockData";

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
  const data = generateYoYData(activeType);
  const typeInfo = TYPES.find((t) => t.key === activeType);

  const annualAvg = (key) =>
    (data.reduce((s, d) => s + d[key], 0) / data.length).toFixed(
      activeType === "water" ? 1 : 0,
    );

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
            Monthly average comparison across years with target benchmarks
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
              <Tooltip content={<CustomTooltip typeInfo={typeInfo} />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => {
                  const labels = {
                    y2022: "2022",
                    y2023: "2023",
                    y2024: "2024",
                    target: "Target",
                  };
                  return (
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {labels[value] || value}
                    </span>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="y2022"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="y2023"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="y2024"
                stroke={typeInfo.color}
                strokeWidth={3}
                dot={{ fill: typeInfo.color, r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="8 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>2022</th>
                <th>2023</th>
                <th>2024</th>
                <th>Target</th>
                <th>% Change (YoY)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.month}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {row.month}
                  </td>
                  <td>
                    {activeType === "water" ? row.y2022.toFixed(1) : row.y2022}
                  </td>
                  <td>
                    {activeType === "water" ? row.y2023.toFixed(1) : row.y2023}
                  </td>
                  <td style={{ fontWeight: 600, color: typeInfo.color }}>
                    {activeType === "water" ? row.y2024.toFixed(1) : row.y2024}
                  </td>
                  <td style={{ color: "#ef4444" }}>
                    {activeType === "water"
                      ? row.target.toFixed(1)
                      : row.target}
                  </td>
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
                <td>{annualAvg("y2022")}</td>
                <td>{annualAvg("y2023")}</td>
                <td style={{ color: typeInfo.color }}>{annualAvg("y2024")}</td>
                <td style={{ color: "#ef4444" }}>{annualAvg("target")}</td>
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
                    <ArrowDown size={14} />{" "}
                    {(
                      ((parseFloat(annualAvg("y2024")) -
                        parseFloat(annualAvg("y2023"))) /
                        parseFloat(annualAvg("y2023"))) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, typeInfo }) => {
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
        const labels = {
          y2022: "2022",
          y2023: "2023",
          y2024: "2024",
          target: "Target",
        };
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
            <span>{labels[p.dataKey] || p.dataKey}</span>
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

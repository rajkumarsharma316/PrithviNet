import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet.heat";
import {
  Info,
  Wind,
  Droplets,
  Volume2,
  Map as MapIcon,
  Building2,
  Factory,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { getMapData } from "../api";
import {
  REGIONS,
  REGION_DETAILS,
  getComplianceColor,
  getComplianceLabel,
  getRiskLevel,
} from "../mockData";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/* ────────── Icon factories ────────── */
const regionIcon = (color, score) =>
  L.divIcon({
    className: "",
    html: `<div style="
    background:${color};border:3px solid rgba(255,255,255,0.9);color:#fff;
    border-radius:50%;width:52px;height:52px;display:flex;align-items:center;justify-content:center;
    font-weight:800;font-size:13px;font-family:system-ui;
    box-shadow:0 0 24px ${color}90,0 0 48px ${color}40;cursor:pointer;
    text-shadow:0 1px 3px rgba(0,0,0,0.5);
  ">${score}%</div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -26],
  });

const factoryPin = (compliant) =>
  L.divIcon({
    className: "",
    html: `<div style="
    background:${compliant ? "rgba(16,185,129,0.85)" : "rgba(239,68,68,0.85)"};
    border:2px solid rgba(255,255,255,0.8);border-radius:8px;width:30px;height:30px;
    display:flex;align-items:center;justify-content:center;font-size:16px;
    box-shadow:0 2px 8px ${compliant ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)"};
  ">🏭</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

const stationPin = (type) => {
  const c =
    type === "AIR" ? "#10b981" : type === "WATER" ? "#3b82f6" : "#ef4444";
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${c};border:2px solid rgba(255,255,255,0.8);border-radius:50%;width:26px;height:26px;
      display:flex;align-items:center;justify-content:center;font-size:13px;
      box-shadow:0 2px 8px ${c}60;
    ">📍</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
};

/* ────────── Heatmap Layer Component ────────── */
const HeatmapLayer = ({ points }) => {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (heatRef.current) {
      map.removeLayer(heatRef.current);
    }

    if (points.length === 0) return;

    // Each point: [lat, lng, intensity]
    heatRef.current = L.heatLayer(points, {
      radius: 60,
      blur: 45,
      maxZoom: 10,
      max: 1.0,
      minOpacity: 0.25,
      gradient: {
        0.0: "#10b981", // green  – excellent
        0.25: "#34d399",
        0.4: "#fbbf24", // yellow – moderate
        0.55: "#f59e0b",
        0.7: "#ef4444", // red    – poor
        0.85: "#dc2626",
        1.0: "#991b1b", // dark red – severe
      },
    }).addTo(map);

    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
      }
    };
  }, [map, points]);

  return null;
};

/* ────────── Main Component ────────── */
const PollutionMap = () => {
  const [activeTab, setActiveTab] = useState("air");
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIndustries, setShowIndustries] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [heatPoints, setHeatPoints] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [stations, setStations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    import("../api").then(({ getIndustries, getMonitoringLocations }) => {
      getIndustries().then((res) => {
        if (res.ok) {
           setIndustries(res.data.map(i => ({...i, compliant: i.status === 'ACTIVE', violations: 0, lastReport: 'N/A'})));
        }
      });
      getMonitoringLocations().then((res) => {
        if (res.ok) {
           // Provide basic aqi/ph/laeq so they don't break UI if missing
           setStations(res.data.map(s => ({...s, status: 'Good', aqi: s.type==='AIR'? 45:null, ph: s.type==='WATER'?7.1:null, laeq: s.type==='NOISE'?55:null})));
        }
      });
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getMapData(activeTab)
      .then((res) => {
        if (res.ok) setMapData(res.data);
        else setMapData([]);
        setLoading(false);
      })
      .catch(() => {
        setMapData([]);
        setLoading(false);
      });
  }, [activeTab]);

  /* Build heatmap point data with real blending between regions */
  useEffect(() => {
    const pts = [];

    // Core region compliance points (inverted: 100% = low heat, 0% = max heat)
    REGIONS.forEach((r) => {
      const intensity = 1 - r.compliance / 100; // invert so poor compliance is hotter
      // Multiple concentric points for smooth blending
      for (let ring = 0; ring < 5; ring++) {
        const radius = ring * 0.08;
        const count = ring === 0 ? 1 : ring * 6;
        for (let i = 0; i < count; i++) {
          const angle = (2 * Math.PI * i) / count;
          const lat =
            r.lat + radius * Math.cos(angle) + (Math.random() - 0.5) * 0.03;
          const lng =
            r.lng + radius * Math.sin(angle) + (Math.random() - 0.5) * 0.03;
          const falloff = 1 - (ring / 5) * 0.6;
          pts.push([lat, lng, intensity * falloff]);
        }
      }
    });

    // Add pollution hotspot points from industries
    industries.forEach((ind) => {
      if (!ind.compliant) {
        const intensity = Math.min(1, ind.violations / 12);
        pts.push([ind.lat, ind.lng, intensity]);
        // Spread around it
        for (let i = 0; i < 4; i++) {
          pts.push([
            ind.lat + (Math.random() - 0.5) * 0.05,
            ind.lng + (Math.random() - 0.5) * 0.05,
            intensity * 0.6,
          ]);
        }
      }
    });

    // Interpolation: add intermediate points between nearby regions for smooth blending
    for (let i = 0; i < REGIONS.length; i++) {
      for (let j = i + 1; j < REGIONS.length; j++) {
        const r1 = REGIONS[i],
          r2 = REGIONS[j];
        const dist = Math.sqrt((r1.lat - r2.lat) ** 2 + (r1.lng - r2.lng) ** 2);
        if (dist < 2.5) {
          // Only blend nearby regions
          const steps = Math.ceil(dist / 0.3);
          for (let s = 1; s < steps; s++) {
            const t = s / steps;
            const lat = r1.lat + (r2.lat - r1.lat) * t;
            const lng = r1.lng + (r2.lng - r1.lng) * t;
            const int1 = 1 - r1.compliance / 100;
            const int2 = 1 - r2.compliance / 100;
            const blended = int1 * (1 - t) + int2 * t;
            pts.push([lat, lng, blended * 0.5]);
            // Add slight scatter for smoothness
            pts.push([
              lat + (Math.random() - 0.5) * 0.08,
              lng + (Math.random() - 0.5) * 0.08,
              blended * 0.35,
            ]);
          }
        }
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeatPoints(pts);
  }, [industries]);

  return (
    <div
      className="glass-panel"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid var(--glass-border)",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            marginRight: "auto",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: 0,
          }}
        >
          <MapIcon size={18} color="var(--accent-primary)" />
          Chhattisgarh Pollution & Compliance Map
        </h3>

        <div
          style={{
            display: "flex",
            background: "rgba(0,0,0,0.3)",
            padding: "3px",
            borderRadius: "10px",
          }}
        >
          <TabBtn
            active={activeTab === "air"}
            onClick={() => setActiveTab("air")}
            icon={<Wind size={14} />}
            label="Air"
            color="#10b981"
          />
          <TabBtn
            active={activeTab === "water"}
            onClick={() => setActiveTab("water")}
            icon={<Droplets size={14} />}
            label="Water"
            color="#3b82f6"
          />
          <TabBtn
            active={activeTab === "noise"}
            onClick={() => setActiveTab("noise")}
            icon={<Volume2 size={14} />}
            label="Noise"
            color="#ef4444"
          />
        </div>

        <div style={{ display: "flex", gap: "5px" }}>
          <LayerToggle
            label="Heatmap"
            active={showHeatmap}
            onClick={() => setShowHeatmap(!showHeatmap)}
            icon="🌡️"
          />
          <LayerToggle
            label="Regions"
            active={showRegions}
            onClick={() => setShowRegions(!showRegions)}
          />
          <LayerToggle
            label="Industries"
            active={showIndustries}
            onClick={() => setShowIndustries(!showIndustries)}
          />
          <LayerToggle
            label="Stations"
            active={showStations}
            onClick={() => setShowStations(!showStations)}
          />
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: "relative" }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              background: "rgba(0,0,0,0.4)",
            }}
          >
            <span className="spinner"></span>
          </div>
        )}
        <MapContainer
          center={[21.5, 82.0]}
          zoom={7}
          style={{ height: "100%", width: "100%", background: "#0a0f1c" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap &copy; CARTO"
          />

          {/* ── Real Heatmap Layer ── */}
          {showHeatmap && <HeatmapLayer points={heatPoints} />}

          {/* ── Region compliance markers ── */}
          {showRegions &&
            REGIONS.map((region) => {
              const color = getComplianceColor(region.compliance);
              const detail = REGION_DETAILS[region.id];
              return (
                <Marker
                  key={region.id}
                  position={[region.lat, region.lng]}
                  icon={regionIcon(color, region.compliance)}
                  eventHandlers={{
                    click: () => navigate(`/region/${region.id}`),
                  }}
                >
                  <Popup className="custom-popup" maxWidth={340}>
                    <div
                      style={{
                        background: "#0f1523",
                        color: "white",
                        padding: "18px",
                        borderRadius: "12px",
                        minWidth: "300px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "14px",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin: "0 0 3px",
                              fontSize: "1.05rem",
                              fontWeight: 700,
                            }}
                          >
                            {region.name} Regional Zone
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.75rem",
                              color: "#64748b",
                            }}
                          >
                            {region.district} District
                          </p>
                        </div>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: `${color}20`,
                            color,
                            border: `1px solid ${color}40`,
                          }}
                        >
                          {region.compliance}%
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          marginBottom: "14px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "3px 10px",
                            borderRadius: "8px",
                            background: `${color}15`,
                            color,
                            fontWeight: 600,
                          }}
                        >
                          {getComplianceLabel(region.compliance)}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "3px 10px",
                            borderRadius: "8px",
                            background: "rgba(255,255,255,0.06)",
                            color: "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          Risk: {getRiskLevel(region.compliance)}
                        </span>
                      </div>

                      {detail && (
                        <>
                          <div
                            style={{
                              borderTop: "1px solid rgba(255,255,255,0.08)",
                              paddingTop: "12px",
                              marginBottom: "12px",
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "10px",
                                fontSize: "0.8rem",
                              }}
                            >
                              <div>
                                <span style={{ color: "#64748b" }}>
                                  Industries:
                                </span>{" "}
                                <b>{detail.industries.total}</b>
                              </div>
                              <div>
                                <span style={{ color: "#64748b" }}>
                                  Stations:
                                </span>{" "}
                                <b>{detail.stations}</b>
                              </div>
                              <div>
                                <span style={{ color: "#10b981" }}>
                                  ✓ Compliant:
                                </span>{" "}
                                <b>{detail.industries.compliant}</b>
                              </div>
                              <div>
                                <span style={{ color: "#ef4444" }}>
                                  ✗ Non-compliant:
                                </span>{" "}
                                <b>{detail.industries.nonCompliant}</b>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              borderTop: "1px solid rgba(255,255,255,0.08)",
                              paddingTop: "12px",
                              fontSize: "0.78rem",
                              marginBottom: "14px",
                            }}
                          >
                            <p
                              style={{
                                margin: "0 0 6px",
                                color: "#94a3b8",
                                fontWeight: 600,
                                fontSize: "0.72rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Avg Pollution Readings
                            </p>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: "8px",
                              }}
                            >
                              <ReadingBubble
                                icon="🌬️"
                                label="AQI"
                                value={detail.avgAir.aqi}
                                color={
                                  detail.avgAir.aqi > 150
                                    ? "#ef4444"
                                    : detail.avgAir.aqi > 100
                                      ? "#fbbf24"
                                      : "#10b981"
                                }
                              />
                              <ReadingBubble
                                icon="💧"
                                label="pH"
                                value={detail.avgWater.ph}
                                color="#3b82f6"
                              />
                              <ReadingBubble
                                icon="🔊"
                                label="dB"
                                value={detail.avgNoise.laeq}
                                color={
                                  detail.avgNoise.laeq > 70
                                    ? "#ef4444"
                                    : "#10b981"
                                }
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/region/${region.id}`)}
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: "10px",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              background:
                                "linear-gradient(135deg, #10b981, #059669)",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              letterSpacing: "0.3px",
                              boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
                              transition: "transform 0.15s, box-shadow 0.15s",
                            }}
                          >
                            View Full Details →
                          </button>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* ── Industry markers ── */}
          {showIndustries &&
            industries.map((ind) => (
              <Marker
                key={ind.id}
                position={[ind.lat, ind.lng]}
                icon={factoryPin(ind.compliant)}
              >
                <Popup className="custom-popup">
                  <div
                    style={{
                      background: "#0f1523",
                      color: "white",
                      padding: "14px",
                      borderRadius: "10px",
                      minWidth: "220px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    }}
                  >
                    <h4 style={{ margin: "0 0 3px", fontSize: "0.92rem" }}>
                      {ind.name}
                    </h4>
                    <p
                      style={{
                        margin: "0 0 10px",
                        fontSize: "0.75rem",
                        color: "#64748b",
                      }}
                    >
                      {ind.type} • {ind.region}
                    </p>
                    <div
                      style={{
                        padding: "6px 10px",
                        borderRadius: "8px",
                        background: ind.compliant
                          ? "rgba(16,185,129,0.1)"
                          : "rgba(239,68,68,0.1)",
                        border: `1px solid ${ind.compliant ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                        marginBottom: "8px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.82rem",
                          color: ind.compliant ? "#10b981" : "#ef4444",
                          fontWeight: 700,
                        }}
                      >
                        {ind.compliant ? "✓ Compliant" : "✗ Non-compliant"}
                      </p>
                    </div>
                    {ind.problem && (
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontSize: "0.78rem",
                          color: "#f87171",
                        }}
                      >
                        ⚠ {ind.problem}
                      </p>
                    )}
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.72rem",
                        color: "#64748b",
                      }}
                    >
                      {ind.violations} violations • Last report:{" "}
                      {ind.lastReport}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* ── Monitoring station markers ── */}
          {showStations &&
            stations.map((stn) => (
              <Marker
                key={stn.id}
                position={[stn.lat, stn.lng]}
                icon={stationPin(stn.type)}
              >
                <Popup className="custom-popup">
                  <div
                    style={{
                      background: "#0f1523",
                      color: "white",
                      padding: "14px",
                      borderRadius: "10px",
                      minWidth: "200px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    }}
                  >
                    <h4 style={{ margin: "0 0 3px", fontSize: "0.88rem" }}>
                      {stn.name}
                    </h4>
                    <p
                      style={{
                        margin: "0 0 10px",
                        fontSize: "0.75rem",
                        color: "#64748b",
                      }}
                    >
                      {stn.type} Station • {stn.region}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {stn.type === "AIR"
                          ? stn.aqi
                          : stn.type === "WATER"
                            ? stn.ph
                            : stn.laeq}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        {stn.type === "AIR"
                          ? "AQI"
                          : stn.type === "WATER"
                            ? "pH"
                            : "dB(A)"}
                      </span>
                      <span
                        style={{
                          marginLeft: "auto",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background:
                            stn.status === "Good"
                              ? "rgba(16,185,129,0.15)"
                              : stn.status === "Moderate"
                                ? "rgba(251,191,36,0.15)"
                                : "rgba(239,68,68,0.15)",
                          color:
                            stn.status === "Good"
                              ? "#10b981"
                              : stn.status === "Moderate"
                                ? "#fbbf24"
                                : "#ef4444",
                        }}
                      >
                        {stn.status}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* ── API data markers ── */}
          {mapData.map((loc) => {
            const r = loc.latestReading;
            if (!r) return null;
            const value =
              activeTab === "air"
                ? r.aqi?.toFixed(0)
                : activeTab === "water"
                  ? r.ph?.toFixed(1)
                  : r.laeq?.toFixed(0);
            return (
              <Marker
                key={loc.id}
                position={[loc.lat || 21.25, loc.lng || 81.62]}
                icon={L.divIcon({
                  className: "",
                  html: `<div style="background:#3b82f6;border:2px solid white;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:11px;box-shadow:0 0 12px rgba(59,130,246,0.5)">${value || "–"}</div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                  popupAnchor: [0, -16],
                })}
              >
                <Popup className="custom-popup">
                  <div
                    style={{
                      background: "#0f1523",
                      color: "white",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <h4 style={{ margin: "0 0 4px", fontSize: "0.85rem" }}>
                      {loc.name}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "#64748b",
                      }}
                    >
                      {value}{" "}
                      {activeTab === "air"
                        ? "AQI"
                        : activeTab === "water"
                          ? "pH"
                          : "dB(A)"}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Timeline */}
      <div
        style={{
          padding: "10px 20px",
          borderTop: "1px solid var(--glass-border)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setMonthIndex(Math.max(0, monthIndex - 1))}
          style={{
            padding: "4px 6px",
            borderRadius: "6px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <ChevronLeft size={14} color="var(--text-secondary)" />
        </button>
        <div style={{ flex: 1, display: "flex", gap: "2px" }}>
          {months.map((m, i) => (
            <button
              key={m}
              onClick={() => setMonthIndex(i)}
              style={{
                flex: 1,
                padding: "5px 0",
                fontSize: "0.68rem",
                fontWeight: monthIndex === i ? 700 : 400,
                borderRadius: "5px",
                background:
                  monthIndex === i
                    ? "rgba(16,185,129,0.25)"
                    : i <= monthIndex
                      ? "rgba(16,185,129,0.06)"
                      : "rgba(255,255,255,0.02)",
                color: monthIndex === i ? "#10b981" : "var(--text-muted)",
                border:
                  monthIndex === i
                    ? "1px solid rgba(16,185,129,0.4)"
                    : "1px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={() => setMonthIndex(Math.min(11, monthIndex + 1))}
          style={{
            padding: "4px 6px",
            borderRadius: "6px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <ChevronRight size={14} color="var(--text-secondary)" />
        </button>
        <span
          style={{
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            fontWeight: 700,
            minWidth: "72px",
            textAlign: "right",
          }}
        >
          {months[monthIndex]} 2024
        </span>
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "8px 20px",
          borderTop: "1px solid var(--glass-border)",
          display: "flex",
          gap: "16px",
          fontSize: "0.73rem",
          color: "var(--text-secondary)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: "var(--text-muted)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Heatmap:
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "16px",
              height: "8px",
              borderRadius: "2px",
              background: "linear-gradient(90deg, #10b981, #34d399)",
            }}
          ></div>
          Excellent (80-100%)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "16px",
              height: "8px",
              borderRadius: "2px",
              background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
            }}
          ></div>
          Moderate (60-79%)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "16px",
              height: "8px",
              borderRadius: "2px",
              background: "linear-gradient(90deg, #ef4444, #991b1b)",
            }}
          ></div>
          Poor (0-59%)
        </span>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            📍 Station
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            🏭 Industry
          </span>
        </span>
      </div>
    </div>
  );
};

/* ── Sub-components ── */
const ReadingBubble = ({ icon, label, value, color }) => (
  <div
    style={{
      textAlign: "center",
      padding: "6px",
      borderRadius: "8px",
      background: "rgba(255,255,255,0.04)",
    }}
  >
    <span style={{ fontSize: "0.9rem" }}>{icon}</span>
    <p style={{ margin: "2px 0 0", fontSize: "1rem", fontWeight: 700, color }}>
      {value}
    </p>
    <p style={{ margin: 0, fontSize: "0.65rem", color: "#64748b" }}>{label}</p>
  </div>
);

const TabBtn = ({ active, onClick, icon, label, color }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "5px",
      padding: "6px 14px",
      borderRadius: "8px",
      background: active ? `${color || "#3b82f6"}20` : "transparent",
      color: active ? color || "#60a5fa" : "var(--text-secondary)",
      border: active
        ? `1px solid ${color || "#3b82f6"}30`
        : "1px solid transparent",
      fontSize: "0.82rem",
      fontWeight: 600,
      transition: "all 0.15s",
    }}
  >
    {icon} {label}
  </button>
);

const LayerToggle = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    style={{
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: "0.7rem",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "4px",
      background: active ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
      color: active ? "#10b981" : "var(--text-muted)",
      border: `1px solid ${active ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`,
      transition: "all 0.15s",
    }}
  >
    {icon} {label}
  </button>
);

export default PollutionMap;

import React, { useState } from "react";
import {
  Map as MapIcon,
  LayoutDashboard,
  AlertTriangle,
  Settings,
  User,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";
import PrithviNetLogo from "./PrithviNetLogo";
import MonitoringCards from "./MonitoringCards";
import PollutionMap from "./PollutionMap";
import ForecastCharts from "./ForecastCharts";
import AlertsPanel from "./AlertsPanel";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [location] = useState("Chhattisgarh (State Overview)");

  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div
          className="logo-container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <PrithviNetLogo width={40} height={40} />
          <h1
            className="glow-text"
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "1px",
            }}
          >
            Prithvi<span style={{ color: "var(--govt-blue)" }}>Net</span>
          </h1>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <NavItem
            icon={<MapIcon size={20} />}
            label="Pollution Map"
            active={activeTab === "map"}
            onClick={() => setActiveTab("map")}
          />
          <NavItem
            icon={<Activity size={20} />}
            label="Forecasting"
            active={activeTab === "forecast"}
            onClick={() => setActiveTab("forecast")}
          />
          <NavItem
            icon={<AlertTriangle size={20} />}
            label="Alerts & Disruption"
            badge="3"
            active={activeTab === "alerts"}
            onClick={() => setActiveTab("alerts")}
          />
        </nav>

        <div style={{ marginTop: "auto" }}>
          <div
            className="glass-panel"
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(59, 130, 246, 0.1)",
              borderColor: "rgba(59, 130, 246, 0.2)",
            }}
          >
            <h4
              style={{
                color: "#60a5fa",
                marginBottom: "8px",
                fontSize: "0.875rem",
              }}
            >
              AI Compliance Copilot
            </h4>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.75rem",
                marginBottom: "12px",
              }}
            >
              Simulate interventions and forecast impact.
            </p>
            <button
              style={{
                background: "#3b82f6",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                fontWeight: 600,
                width: "100%",
                transition: "background 0.2s",
              }}
            >
              Open Copilot
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.75rem", margin: "0 0 4px 0" }}>
              Public Dashboard
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

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              className="glass-panel"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: "20px",
                gap: "12px",
                cursor: "pointer",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 8px #10b981",
                }}
              ></div>
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                  fontWeight: 500,
                }}
              >
                {location}
              </span>
              <ChevronDown size={14} color="var(--text-secondary)" />
            </div>

            <button
              className="glass-panel"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Bell size={18} color="var(--text-primary)" />
              <span
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "10px",
                  width: "8px",
                  height: "8px",
                  background: "#ef4444",
                  borderRadius: "50%",
                }}
              ></span>
            </button>
            <button
              className="glass-panel"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={18} color="var(--text-primary)" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            overflowY: "auto",
            paddingRight: "8px",
          }}
        >
          {activeTab === "overview" && <MonitoringCards />}

          {activeTab === "map" && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: "600px",
              }}
            >
              <PollutionMap />
            </div>
          )}

          {activeTab === "forecast" && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: "500px",
              }}
            >
              <ForecastCharts />
            </div>
          )}

          {activeTab === "alerts" && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: "500px",
              }}
            >
              <AlertsPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Nav Item Component
const NavItem = ({ icon, label, active, onClick, badge }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "12px",
        color: active ? "#10b981" : "var(--text-secondary)",
        background: active ? "rgba(16, 185, 129, 0.1)" : "transparent",
        border: `1px solid ${active ? "rgba(16, 185, 129, 0.2)" : "transparent"}`,
        transition: "all 0.2s",
        textAlign: "left",
        width: "100%",
      }}
    >
      {icon}
      <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>{label}</span>
      {badge && (
        <span
          style={{
            marginLeft: "auto",
            background: "#ef4444",
            color: "white",
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: "10px",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default Dashboard;

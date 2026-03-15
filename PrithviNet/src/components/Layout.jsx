import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChatProvider } from "../context/ChatContext";
import {
  LayoutDashboard,
  Map as MapIcon,
  AlertTriangle,
  Wind,
  Droplets,
  Volume2,
  Building2,
  Factory,
  MapPin,
  Ruler,
  Beaker,
  User,
  LogIn,
  LogOut,
  Bell,
  TrendingUp,
  List,
  Shield,
  Briefcase,
  Upload,
  Eye,
  Sparkles,
  FileText,
} from "lucide-react";
import PrithviNetLogo from "./PrithviNetLogo";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role;
  const isAdmin = role === "SUPER_ADMIN";
  const isOfficer = role === "REGIONAL_OFFICER";
  const isMonitoring = role === "MONITORING_TEAM";
  const isIndustry = role === "INDUSTRY_USER";
  const isLoggedIn = !!user;

  return (
    <ChatProvider>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-govt-header">
            <div className="sidebar-govt-header-inner">
              <div className="sidebar-logo-icon">
                <PrithviNetLogo width={56} height={56} />
              </div>
              <div>
                <div className="sidebar-govt-label">Government of Chhattisgarh</div>
                <h1 className="sidebar-app-title">PrithviNet Environmental Portal</h1>
              </div>
            </div>
          </div>
          <div className="sidebar-nav-wrap">
        <nav className="sidebar-nav">
          {/* ── PUBLIC PORTAL (visible to everyone) ── */}
          <SidebarSection label="PUBLIC PORTAL" />
          <SideLink
            to="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Overview"
          />
          <SideLink
            to="/map"
            icon={<MapIcon size={18} />}
            label="Pollution Map"
          />
          <SideLink
            to="/trends"
            icon={<TrendingUp size={18} />}
            label="YoY Trends"
          />
          <SideLink
            to="/alerts-panel"
            icon={<AlertTriangle size={18} />}
            label="Live Alerts"
          />

          {/* ── EXPLORE (visible to everyone) ── */}
          <SidebarSection label="EXPLORE" />
          <SideLink
            to="/monitoring-locations"
            icon={<MapPin size={18} />}
            label="Mon. Locations"
          />
          <SideLink
            to="/industries-list"
            icon={<Factory size={18} />}
            label="Industries"
          />
          <SideLink
            to="/offices-list"
            icon={<Building2 size={18} />}
            label="Regional Offices"
          />

          {/* ── MONITORING DATA: view for monitoring/officer/admin, submit ONLY for monitoring ── */}
          {isLoggedIn && (isAdmin || isOfficer || isMonitoring) && (
            <>
              <SidebarSection label="MONITORING DATA" />
              <SideLink
                to="/monitoring/air"
                icon={<Wind size={18} />}
                label="Air Quality"
              />
              <SideLink
                to="/monitoring/water"
                icon={<Droplets size={18} />}
                label="Water Quality"
              />
              <SideLink
                to="/monitoring/noise"
                icon={<Volume2 size={18} />}
                label="Noise Level"
              />
            </>
          )}

          {/* Submit Data — ONLY for Monitoring Team */}
          {isMonitoring && (
            <>
              <SidebarSection label="SUBMIT DATA" />
              <SideLink
                to="/monitoring/air/submit"
                icon={<Upload size={18} />}
                label="Submit Air Data"
              />
              <SideLink
                to="/monitoring/water/submit"
                icon={<Upload size={18} />}
                label="Submit Water Data"
              />
              <SideLink
                to="/monitoring/noise/submit"
                icon={<Upload size={18} />}
                label="Submit Noise Data"
              />
            </>
          )}

          {/* ── REGIONAL OFFICER — manage industries, stations, alerts ── */}
          {isOfficer && (
            <>
              <SidebarSection label="MY REGION" />
              <SideLink
                to="/region-dashboard"
                icon={<Shield size={18} />}
                label="Region Dashboard"
              />
              <SideLink
                to="/monitoring-teams"
                icon={<List size={18} />}
                label="Monitoring Teams"
              />
              <SideLink
                to="/alerts"
                icon={<Bell size={18} />}
                label="Alert Management"
              />
            </>
          )}

          {/* ── INDUSTRY USER ── */}
          {isIndustry && (
            <>
              <SidebarSection label="MY INDUSTRY" />
              <SideLink
                to="/industry-dashboard"
                icon={<Briefcase size={18} />}
                label="Industry Dashboard"
              />
              <SideLink
                to="/industry-dashboard"
                icon={<Upload size={18} />}
                label="Submit Report"
              />
            </>
          )}

          {/* ── AI LAB (for any authenticated user) ── */}
          {isLoggedIn && (
            <>
              <SidebarSection label="AI LAB" />
              <SideLink
                to="/ai/assistant"
                icon={<Sparkles size={18} />}
                label="Copilot Chat"
              />
              <SideLink
                to="/ai/report"
                icon={<FileText size={18} />}
                label="AI Report"
              />
              <SideLink
                to="/ai/forecast"
                icon={<MapIcon size={18} />}
                label="Forecast"
              />
            </>
          )}

          {/* ── ADMIN PANEL — read-only oversight + approval, NO create/delete ── */}
          {isAdmin && (
            <>
              <SidebarSection label="ADMIN (VIEW & APPROVE)" />
              <SideLink
                to="/admin/offices"
                icon={<Eye size={18} />}
                label="View Offices"
              />
              <SideLink
                to="/admin/industries"
                icon={<Eye size={18} />}
                label="View Industries"
              />
              <SideLink
                to="/admin/water-sources"
                icon={<Eye size={18} />}
                label="View Water Sources"
              />
              <SideLink
                to="/admin/locations"
                icon={<Eye size={18} />}
                label="View Locations"
              />
              <SideLink
                to="/admin/limits"
                icon={<Ruler size={18} />}
                label="Limits"
              />
              <SideLink
                to="/admin/units"
                icon={<Beaker size={18} />}
                label="Units"
              />
            </>
          )}
        </nav>

        {/* User panel */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {user ? (
            <div className="sidebar-user">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/profile")}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "2px",
                    background: "var(--govt-blue)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {user.role.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <button onClick={handleLogout} className="sidebar-logout-btn">
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="sidebar-login-btn"
            >
              <LogIn size={16} /> Sign In
            </button>
          )}
        </div>
          </div>
      </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </ChatProvider>
  );
};

function SidebarSection({ label }) {
  return <p className="sidebar-section-label">{label}</p>;
}

function SideLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default Layout;

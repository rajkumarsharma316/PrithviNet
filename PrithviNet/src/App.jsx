import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

// Monitoring data pages
import MonitoringDataPage from "./pages/MonitoringDataPage";
import SubmitDataPage from "./pages/SubmitDataPage";

// Alerts
import AlertsPage from "./pages/AlertsPage";

// Admin pages
import AdminOfficesPage from "./pages/admin/AdminOfficesPage";
import AdminIndustriesPage from "./pages/admin/AdminIndustriesPage";
import AdminWaterSourcesPage from "./pages/admin/AdminWaterSourcesPage";
import AdminLocationsPage from "./pages/admin/AdminLocationsPage";
import AdminLimitsPage from "./pages/admin/AdminLimitsPage";
import AdminUnitsPage from "./pages/admin/AdminUnitsPage";

// Dashboard sub-views
import MonitoringCards from "./components/MonitoringCards";
import PollutionMap from "./components/PollutionMap";
import ForecastCharts from "./components/ForecastCharts";
import AlertsPanel from "./components/AlertsPanel";
import YearOverYearTrends from "./components/YearOverYearTrends";

// New list pages
import RegionalOfficesList from "./pages/RegionalOfficesList";
import IndustriesList from "./pages/IndustriesList";
import MonitoringLocationsList from "./pages/MonitoringLocationsList";
import ActiveAlertsList from "./pages/ActiveAlertsList";

// Detail pages
import RegionalZonePage from "./pages/RegionalZonePage";

// Role-based dashboards
import RegionDashboard from "./pages/RegionDashboard";
import IndustryDashboard from "./pages/IndustryDashboard";
import MonitoringTeamsPage from "./pages/MonitoringTeamsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth pages (no sidebar) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main app with sidebar layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Public Dashboard */}
            <Route path="dashboard" element={<MonitoringCards />} />
            <Route
              path="map"
              element={
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
              }
            />
            <Route path="trends" element={<YearOverYearTrends />} />
            <Route
              path="alerts-panel"
              element={
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
              }
            />
            <Route
              path="forecast"
              element={
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
              }
            />

            {/* List Pages */}
            <Route
              path="monitoring-locations"
              element={<MonitoringLocationsList />}
            />
            <Route path="industries-list" element={<IndustriesList />} />
            <Route path="offices-list" element={<RegionalOfficesList />} />
            <Route path="alerts-list" element={<ActiveAlertsList />} />

            {/* Regional Zone Detail */}
            <Route path="region/:id" element={<RegionalZonePage />} />

            {/* Monitoring Data */}
            <Route path="monitoring/:type" element={<MonitoringDataPage />} />
            <Route
              path="monitoring/:type/submit"
              element={<SubmitDataPage />}
            />

            {/* Alerts Management */}
            <Route path="alerts" element={<AlertsPage />} />

            {/* Profile */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Role-based Dashboards */}
            <Route path="region-dashboard" element={<RegionDashboard />} />
            <Route path="industry-dashboard" element={<IndustryDashboard />} />
            <Route path="monitoring-teams" element={<MonitoringTeamsPage />} />

            {/* Admin Panel */}
            <Route path="admin/offices" element={<AdminOfficesPage />} />
            <Route path="admin/industries" element={<AdminIndustriesPage />} />
            <Route
              path="admin/water-sources"
              element={<AdminWaterSourcesPage />}
            />
            <Route path="admin/locations" element={<AdminLocationsPage />} />
            <Route path="admin/limits" element={<AdminLimitsPage />} />
            <Route path="admin/units" element={<AdminUnitsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

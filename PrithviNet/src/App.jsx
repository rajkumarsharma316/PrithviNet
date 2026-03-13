import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MonitoringDataPage from './pages/MonitoringDataPage';
import SubmitDataPage from './pages/SubmitDataPage';
import AlertsPage from './pages/AlertsPage';
import AdminOfficesPage from './pages/admin/AdminOfficesPage';
import AdminIndustriesPage from './pages/admin/AdminIndustriesPage';
import AdminWaterSourcesPage from './pages/admin/AdminWaterSourcesPage';
import AdminLocationsPage from './pages/admin/AdminLocationsPage';
import AdminLimitsPage from './pages/admin/AdminLimitsPage';
import AdminUnitsPage from './pages/admin/AdminUnitsPage';

// Dashboard sub-views
import MonitoringCards from './components/MonitoringCards';
import PollutionMap from './components/PollutionMap';
import ForecastCharts from './components/ForecastCharts';
import AlertsPanel from './components/AlertsPanel';

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
            <Route path="dashboard" element={<MonitoringCards />} />
            <Route path="map" element={<div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '600px' }}><PollutionMap /></div>} />
            <Route path="forecast" element={<div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '500px' }}><ForecastCharts /></div>} />
            <Route path="alerts-panel" element={<div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '500px' }}><AlertsPanel /></div>} />

            {/* Monitoring Data */}
            <Route path="monitoring/:type" element={<MonitoringDataPage />} />
            <Route path="monitoring/:type/submit" element={<SubmitDataPage />} />

            {/* Alerts Management */}
            <Route path="alerts" element={<AlertsPage />} />

            {/* Profile */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Admin Panel */}
            <Route path="admin/offices" element={<AdminOfficesPage />} />
            <Route path="admin/industries" element={<AdminIndustriesPage />} />
            <Route path="admin/water-sources" element={<AdminWaterSourcesPage />} />
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

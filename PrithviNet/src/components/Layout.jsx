import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Map as MapIcon, Activity, AlertTriangle,
  Wind, Droplets, Volume2, Building2, Factory, MapPin,
  Ruler, Beaker, User, LogIn, LogOut, Bell, Settings, ChevronDown
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isAdmin = user && ['SUPER_ADMIN', 'REGIONAL_OFFICER', 'MONITORING_TEAM'].includes(user.role);

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
            <Activity size={24} color="white" />
          </div>
          <h1 className="glow-text" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>
            Prithvi<span style={{ color: '#10b981' }}>Net</span>
          </h1>
        </div>

        <nav className="sidebar-nav">
          <SidebarSection label="PUBLIC PORTAL" />
          <SideLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
          <SideLink to="/map" icon={<MapIcon size={18} />} label="Pollution Map" />
          <SideLink to="/forecast" icon={<Activity size={18} />} label="Forecasting" />
          <SideLink to="/alerts-panel" icon={<AlertTriangle size={18} />} label="Live Alerts" />

          <SidebarSection label="MONITORING DATA" />
          <SideLink to="/monitoring/air" icon={<Wind size={18} />} label="Air Quality" />
          <SideLink to="/monitoring/water" icon={<Droplets size={18} />} label="Water Quality" />
          <SideLink to="/monitoring/noise" icon={<Volume2 size={18} />} label="Noise Level" />

          <SideLink to="/alerts" icon={<Bell size={18} />} label="Alerts Mgmt" />

          {isAdmin && <>
            <SidebarSection label="ADMIN PANEL" />
            <SideLink to="/admin/offices" icon={<Building2 size={18} />} label="Offices" />
            <SideLink to="/admin/industries" icon={<Factory size={18} />} label="Industries" />
            <SideLink to="/admin/water-sources" icon={<Droplets size={18} />} label="Water Sources" />
            <SideLink to="/admin/locations" icon={<MapPin size={18} />} label="Mon. Locations" />
            <SideLink to="/admin/limits" icon={<Ruler size={18} />} label="Limits" />
            <SideLink to="/admin/units" icon={<Beaker size={18} />} label="Units" />
          </>}
        </nav>

        {/* User panel at bottom */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
          {user ? (
            <div className="sidebar-user">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="sidebar-logout-btn">
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="sidebar-login-btn">
              <LogIn size={16} /> Sign In
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

function SidebarSection({ label }) {
  return <p className="sidebar-section-label">{label}</p>;
}

function SideLink({ to, icon, label }) {
  return (
    <NavLink to={to} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default Layout;

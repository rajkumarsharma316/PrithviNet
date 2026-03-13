import React, { useState, useEffect } from 'react';
import { Wind, Droplets, Volume2, ArrowUpRight, ArrowDownRight, BarChart3, MapPin, Factory, AlertCircle } from 'lucide-react';
import { getOverview } from '../api';

const MonitoringCards = () => {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getOverview().then(res => {
      if (res.ok) setOverview(res.data);
      else setError(res.data?.error || 'Failed to load overview');
    });
  }, []);

  if (error) return <div className="page-error">{error}</div>;

  const stats = overview?.stats;
  const latest = overview?.latestReadings;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', margin: '0 0 4px' }}>Dashboard Overview</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Real-time environmental monitoring & transparency portal</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard icon={<MapPin size={20} />} label="Monitoring Locations" value={stats?.totalLocations ?? '—'} color="#10b981" loading={!overview} />
        <StatCard icon={<Factory size={20} />} label="Active Industries" value={stats?.totalIndustries ?? '—'} color="#3b82f6" loading={!overview} />
        <StatCard icon={<BarChart3 size={20} />} label="Regional Offices" value={stats?.totalRegions ?? '—'} color="#f59e0b" loading={!overview} />
        <StatCard icon={<AlertCircle size={20} />} label="Active Alerts" value={stats?.activeAlerts ?? '—'} color="#ef4444" loading={!overview} />
      </div>

      {/* Monitoring Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Air Quality Card */}
        <Card
          title="Air Quality Rating (AQI)"
          value={latest?.air?.aqi?.toFixed(1) || '—'}
          unit={latest?.air ? 'AQI' : ''}
          icon={<Wind size={24} color="#34d399" />}
          location={latest?.air?.location?.name}
          trend="up"
          trendValue="+12%"
          trendText="vs last week"
          status={getAqiStatus(latest?.air?.aqi)}
          statusText={getAqiLabel(latest?.air?.aqi)}
          params={[
            { label: 'PM2.5', value: latest?.air?.pm25 ? `${latest.air.pm25.toFixed(1)} µg/m³` : '—', color: '#fbbf24' },
            { label: 'NO₂', value: latest?.air?.no2 ? `${latest.air.no2.toFixed(1)} ppb` : '—', color: '#10b981' },
            { label: 'SO₂', value: latest?.air?.so2 ? `${latest.air.so2.toFixed(1)} ppb` : '—', color: '#10b981' }
          ]}
          loading={!overview}
        />

        {/* Water Quality Card */}
        <Card
          title="Water Purity Index"
          value={latest?.water?.ph?.toFixed(2) || '—'}
          unit="pH Level"
          icon={<Droplets size={24} color="#60a5fa" />}
          location={latest?.water?.location?.name}
          trend="down"
          trendValue="-2%"
          trendText="vs last week"
          status="status-good"
          statusText="Within Prescribed Limits"
          params={[
            { label: 'TDS', value: latest?.water?.tds ? `${latest.water.tds.toFixed(1)} mg/L` : '—', color: '#10b981' },
            { label: 'Turbidity', value: latest?.water?.turbidity ? `${latest.water.turbidity.toFixed(2)} NTU` : '—', color: '#10b981' },
            { label: 'DO', value: latest?.water?.dissolvedOxygen ? `${latest.water.dissolvedOxygen.toFixed(2)} mg/L` : '—', color: '#10b981' }
          ]}
          loading={!overview}
        />

        {/* Noise Level Card */}
        <Card
          title="Ambient Noise Level"
          value={latest?.noise?.laeq?.toFixed(1) || '—'}
          unit="dB(A)"
          icon={<Volume2 size={24} color="#f87171" />}
          location={latest?.noise?.location?.name}
          trend="up"
          trendValue="+8%"
          trendText="vs last week"
          status={latest?.noise?.laeq > 75 ? 'status-poor' : 'status-good'}
          statusText={latest?.noise?.laeq > 75 ? `Exceeds Threshold (> 75 dB)` : 'Within Limits'}
          params={[
            { label: 'Peak', value: latest?.noise?.lmax ? `${latest.noise.lmax.toFixed(1)} dB(A)` : '—', color: '#ef4444' },
            { label: 'Min', value: latest?.noise?.lmin ? `${latest.noise.lmin.toFixed(1)} dB(A)` : '—', color: '#10b981' },
            { label: 'Avg', value: latest?.noise?.laeq ? `${latest.noise.laeq.toFixed(1)} dB(A)` : '—', color: '#fbbf24' }
          ]}
          loading={!overview}
        />
      </div>
    </div>
  );
};

function getAqiStatus(aqi) {
  if (!aqi) return 'status-good';
  if (aqi <= 100) return 'status-good';
  if (aqi <= 200) return 'status-moderate';
  return 'status-poor';
}

function getAqiLabel(aqi) {
  if (!aqi) return 'No data';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  return 'Severe';
}

const StatCard = ({ icon, label, value, color, loading }) => (
  <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
        {loading ? <span className="spinner" style={{ width: '14px', height: '14px' }}></span> : value}
      </p>
    </div>
  </div>
);

const Card = ({ title, value, unit, icon, location, trend, trendValue, trendText, status, statusText, params, loading }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px' }}>{title}</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {loading ? <span className="spinner"></span> : value}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{unit}</span>
          </div>
          {location && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>📍 {location}</p>}
        </div>
        <div className="glass-panel" style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)' }}>
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="status-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: trend === 'down' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: trend === 'down' ? '#10b981' : '#ef4444' }}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trendText}</span>
      </div>

      <div style={{ height: '1px', background: 'var(--glass-border)', margin: '8px 0' }}></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {params.map((param, index) => (
          <div key={index}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{param.label}</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: param.color }}>{param.value}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <span className={`status-badge ${status}`} style={{ width: '100%', justifyContent: 'center', padding: '6px', display: 'flex' }}>
          {statusText}
        </span>
      </div>
    </div>
  );
};

export default MonitoringCards;

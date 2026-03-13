import React from 'react';
import { Wind, Droplets, Volume2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MonitoringCards = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
      {/* Air Quality Card */}
      <Card
        title="Air Quality Rating (AQI)"
        value="142"
        unit="Moderate"
        icon={<Wind size={24} color="#34d399" />}
        trend="up"
        trendValue="+12%"
        trendText="vs last week"
        status="status-moderate"
        statusText="Unhealthy for Sensitive Groups"
        params={[
          { label: 'PM2.5', value: '45 μg/m³', color: '#fbbf24' },
          { label: 'NO2', value: '18 ppb', color: '#10b981' },
          { label: 'SO2', value: '4 ppb', color: '#10b981' }
        ]}
      />

      {/* Water Quality Card */}
      <Card
        title="Water Purity Index"
        value="8.2"
        unit="pH Level"
        icon={<Droplets size={24} color="#60a5fa" />}
        trend="down"
        trendValue="-2%"
        trendText="vs last week"
        status="status-good"
        statusText="Within Prescribed Limits"
        params={[
          { label: 'TDS', value: '320 mg/L', color: '#10b981' },
          { label: 'Turbidity', value: '3.1 NTU', color: '#10b981' },
          { label: 'DO', value: '6.5 mg/L', color: '#10b981' }
        ]}
      />

      {/* Noise Level Card */}
      <Card
        title="Ambient Noise Level"
        value="78"
        unit="dB(A)"
        icon={<Volume2 size={24} color="#f87171" />}
        trend="up"
        trendValue="+8%"
        trendText="vs last week"
        status="status-poor"
        statusText="Exceeds Threshold (> 75 dB)"
        params={[
          { label: 'Peak', value: '85 dB(A)', color: '#ef4444' },
          { label: 'Min', value: '42 dB(A)', color: '#10b981' },
          { label: 'Avg', value: '65 dB(A)', color: '#fbbf24' }
        ]}
      />
    </div>
  );
};

const Card = ({ title, value, unit, icon, trend, trendValue, trendText, status, statusText, params }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px' }}>{title}</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{value}</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{unit}</span>
          </div>
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
        <span className={`status-badge ${status}`} style={{ width: '100%', justifyContent: 'center', padding: '6px' }}>
          {statusText}
        </span>
      </div>
    </div>
  );
};

export default MonitoringCards;

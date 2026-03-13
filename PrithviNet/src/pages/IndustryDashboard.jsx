import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Factory, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, FileText, Clock, Wind, Droplets, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Mock data for industry dashboard
const genEmissions = () => Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  pm25: Math.round(40 + Math.random() * 50 + Math.sin(i / 4) * 15),
  so2: Math.round(20 + Math.random() * 30),
  no2: Math.round(30 + Math.random() * 25),
  ph: parseFloat((6.8 + Math.random() * 1.0).toFixed(1)),
  bod: Math.round(15 + Math.random() * 20),
  noise: Math.round(55 + Math.random() * 25),
}));

const MOCK_VIOLATIONS = [
  { date: '2024-12-01', type: 'PM2.5 Exceedance', value: 85, limit: 60, status: 'Resolved' },
  { date: '2024-11-15', type: 'SO₂ Exceedance', value: 95, limit: 80, status: 'Resolved' },
  { date: '2024-10-28', type: 'Water BOD', value: 35, limit: 30, status: 'Resolved' },
  { date: '2025-01-10', type: 'PM2.5 Exceedance', value: 78, limit: 60, status: 'Active' },
  { date: '2025-02-05', type: 'Noise Level', value: 82, limit: 75, status: 'Active' },
];

const IndustryDashboard = () => {
  const { user } = useAuth();
  const [activeParam, setActiveParam] = useState('pm25');
  const emissionsData = genEmissions();

  const industryName = user?.industry?.name || 'Your Industry';
  const industryType = user?.industry?.type || 'Manufacturing';

  const PARAMS = [
    { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', color: '#fbbf24' },
    { key: 'so2', label: 'SO₂', unit: 'ppb', color: '#ef4444' },
    { key: 'no2', label: 'NO₂', unit: 'ppb', color: '#10b981' },
    { key: 'ph', label: 'pH', unit: '', color: '#3b82f6' },
    { key: 'bod', label: 'BOD', unit: 'mg/L', color: '#8b5cf6' },
    { key: 'noise', label: 'Noise', unit: 'dB(A)', color: '#f59e0b' },
  ];

  const currentParam = PARAMS.find(p => p.key === activeParam);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Factory size={24} color="#3b82f6" />
            {industryName}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {industryType} • Industry Dashboard
          </p>
        </div>
        <span className="status-badge status-moderate">Compliance: 72%</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <StatCard icon={<CheckCircle size={18} />} label="Compliance Score" value="72%" color="#fbbf24" />
        <StatCard icon={<AlertTriangle size={18} />} label="Active Violations" value="2" color="#ef4444" />
        <StatCard icon={<FileText size={18} />} label="Reports Submitted" value="28" color="#3b82f6" />
        <StatCard icon={<Clock size={18} />} label="Last Report" value="2h ago" color="#10b981" />
        <StatCard icon={<TrendingUp size={18} />} label="Trend (30d)" value="+5%" color="#10b981" />
      </div>

      {/* Emission Trends Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Emission Trends (30 Days)</h3>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '10px', flexWrap: 'wrap' }}>
            {PARAMS.map(p => (
              <button key={p.key} onClick={() => setActiveParam(p.key)} style={{
                padding: '5px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600,
                background: activeParam === p.key ? `${p.color}20` : 'transparent',
                color: activeParam === p.key ? p.color : 'var(--text-muted)',
                border: activeParam === p.key ? `1px solid ${p.color}40` : '1px solid transparent'
              }}>{p.label}</button>
            ))}
          </div>
        </div>
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={emissionsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentParam.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={currentParam.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip contentStyle={{ background: 'rgba(10,15,25,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white' }} />
              <Area type="monotone" dataKey={activeParam} stroke={currentParam.color} strokeWidth={2} fill="url(#emGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Violations History */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#ef4444" /> Violation History
          </h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Type</th><th>Value</th><th>Limit</th><th>Status</th></tr></thead>
            <tbody>
              {MOCK_VIOLATIONS.map((v, i) => (
                <tr key={i}>
                  <td>{v.date}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.type}</td>
                  <td style={{ color: '#ef4444', fontWeight: 600 }}>{v.value}</td>
                  <td>{v.limit}</td>
                  <td>
                    <span className={`status-badge ${v.status === 'Resolved' ? 'status-good' : 'status-poor'}`} style={{ fontSize: '0.7rem' }}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register New Industry */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', margin: '0 0 4px' }}>Register New Industry</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>Request approval from the regional office to register a new industry.</p>
        <div className="modal-fields" style={{ maxWidth: '500px' }}>
          <div><label>Industry Name</label><input placeholder="Enter industry name" /></div>
          <div><label>Industry Type</label><input placeholder="e.g. Steel, Chemical, Textile" /></div>
          <div><label>Registration Number</label><input placeholder="e.g. CG-STL-XXX" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label>Latitude</label><input type="number" placeholder="21.2514" /></div>
            <div><label>Longitude</label><input type="number" placeholder="81.6296" /></div>
          </div>
          <div><label>Address</label><input placeholder="Full address" /></div>
          <button className="action-btn primary-btn" style={{ marginTop: '8px' }}>
            <FileText size={16} /> Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}12`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
    <div>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 1px' }}>{label}</p>
      <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)' }}>{value}</p>
    </div>
  </div>
);

export default IndustryDashboard;

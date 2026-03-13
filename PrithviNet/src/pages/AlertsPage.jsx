import React, { useState, useEffect } from 'react';
import { getAlerts, acknowledgeAlert, resolveAlert } from '../api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, AlertTriangle, Info, Filter, Check, CheckCheck, RefreshCw } from 'lucide-react';

const SEV_COLORS = { CRITICAL: '#ef4444', WARNING: '#fbbf24', INFO: '#3b82f6' };
const STAT_COLORS = { ACTIVE: '#ef4444', ACKNOWLEDGED: '#fbbf24', RESOLVED: '#10b981' };

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    const res = await getAlerts(status || undefined, severity || undefined);
    if (res.ok) setAlerts(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, [status, severity]);

  const canAction = user && ['SUPER_ADMIN', 'REGIONAL_OFFICER'].includes(user.role);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    const fn = action === 'acknowledge' ? acknowledgeAlert : resolveAlert;
    const res = await fn(id);
    setActionLoading(null);
    if (res.ok) fetchAlerts();
  };

  const SevIcon = ({ sev }) => {
    if (sev === 'CRITICAL') return <AlertCircle size={18} color={SEV_COLORS.CRITICAL} />;
    if (sev === 'WARNING') return <AlertTriangle size={18} color={SEV_COLORS.WARNING} />;
    return <Info size={18} color={SEV_COLORS.INFO} />;
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertTriangle size={22} color="#ef4444" /> Alerts Management
      </h2>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <div className="input-group compact">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <div className="input-group compact">
          <select value={severity} onChange={e => setSeverity(e.target.value)}>
            <option value="">All severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>
        <button className="icon-btn" onClick={fetchAlerts} title="Refresh"><RefreshCw size={16} /></button>
      </div>

      {loading ? (
        <div className="page-loading"><span className="spinner"></span> Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>No alerts match the filters</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map(a => (
            <div key={a.id} className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <SevIcon sev={a.severity} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{a.parameter}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="status-badge" style={{ background: `${SEV_COLORS[a.severity]}20`, color: SEV_COLORS[a.severity], border: `1px solid ${SEV_COLORS[a.severity]}40` }}>
                      {a.severity}
                    </span>
                    <span className="status-badge" style={{ background: `${STAT_COLORS[a.status]}20`, color: STAT_COLORS[a.status], border: `1px solid ${STAT_COLORS[a.status]}40` }}>
                      {a.status}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.message}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>📍 {a.location?.name || '—'}</span>
                  <span>📋 {a.type}</span>
                  <span>🕐 {new Date(a.createdAt).toLocaleString()}</span>
                </div>
                {canAction && a.status !== 'RESOLVED' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {a.status === 'ACTIVE' && (
                      <button className="action-btn small-btn" onClick={() => handleAction(a.id, 'acknowledge')} disabled={actionLoading === a.id}>
                        <Check size={14} /> Acknowledge
                      </button>
                    )}
                    <button className="action-btn small-btn resolve-btn" onClick={() => handleAction(a.id, 'resolve')} disabled={actionLoading === a.id}>
                      <CheckCheck size={14} /> Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

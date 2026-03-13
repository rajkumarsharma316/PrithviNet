import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, BellRing, HeartPulse } from 'lucide-react';
import { getPublicAlerts } from '../api';

const AlertsPanel = () => {
  const [alertsData, setAlertsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicAlerts().then(res => {
      if (res.ok) setAlertsData(res.data);
      setLoading(false);
    });
  }, []);

  const getAlertType = (severity) => {
    if (severity === 'CRITICAL') return 'critical';
    if (severity === 'WARNING') return 'warning';
    return 'info';
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BellRing size={18} color="var(--accent-danger)" />
          Live Alerts & Health Advisory
        </h3>
        <span style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
          {loading ? '...' : `${alertsData.length} Active`}
        </span>
      </div>

      {/* Advisory Banner */}
      <div style={{ margin: '16px 24px 0 24px', padding: '12px 16px', background: 'rgba(59,130,246,0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '4px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <HeartPulse size={20} color="#3b82f6" style={{ marginTop: '2px' }} />
        <div>
           <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 600, color: '#60a5fa' }}>Public Health Recommendation</p>
           <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Check real-time monitoring data for current environmental conditions in your area. Sensitive individuals should follow local advisories.</p>
        </div>
      </div>

      {/* Alert List */}
      <div style={{ padding: '16px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div className="page-loading"><span className="spinner"></span></div>
        ) : alertsData.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No active alerts — all clear! ✅</p>
        ) : (
          alertsData.map((alert) => {
            const type = getAlertType(alert.severity);
            return (
              <div key={alert.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ paddingTop: '2px' }}>
                  {type === 'critical' && <AlertCircle size={18} color="#ef4444" />}
                  {type === 'warning' && <AlertTriangle size={18} color="#fbbf24" />}
                  {type === 'info' && <Info size={18} color="#3b82f6" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{alert.parameter}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {alert.message}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📍 {alert.location?.name || '—'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;

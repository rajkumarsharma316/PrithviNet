import React from 'react';
import { AlertCircle, AlertTriangle, Info, BellRing, HeartPulse } from 'lucide-react';

const alertsData = [
  {
    id: 1,
    type: 'critical',
    title: 'High PM2.5 Alert (Urla/Siltara)',
    message: 'Industrial emissions have pushed PM2.5 to 185 µg/m³. Asthma patients avoid outdoor activities.',
    time: '10 mins ago'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Shivnath River Turbidity',
    message: 'Turbidity spike detected upstream. Potable water treatment plants notified.',
    time: '1 hour ago'
  },
  {
    id: 3,
    type: 'info',
    title: 'System Notice: Maintenance',
    message: 'Sensors at Station 4 (Bilaspur) will be offline for calibration from 2 PM to 4 PM.',
    time: '3 hours ago'
  }
];

const AlertsPanel = () => {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BellRing size={18} color="var(--accent-danger)" />
          Live Alerts & Health Advisory
        </h3>
        <span style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
          3 Active
        </span>
      </div>

      {/* Advisory Banner */}
      <div style={{ margin: '16px 24px 0 24px', padding: '12px 16px', background: 'rgba(59,130,246,0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '4px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <HeartPulse size={20} color="#3b82f6" style={{ marginTop: '2px' }} />
        <div>
           <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 600, color: '#60a5fa' }}>Public Health Recommendation</p>
           <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Current air quality is generally acceptable. However, unusually sensitive individuals should consider limiting prolonged outdoor exertion.</p>
        </div>
      </div>

      {/* Alert List */}
      <div style={{ padding: '16px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alertsData.map((alert) => (
          <div key={alert.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ paddingTop: '2px' }}>
               {alert.type === 'critical' && <AlertCircle size={18} color="#ef4444" />}
               {alert.type === 'warning' && <AlertTriangle size={18} color="#fbbf24" />}
               {alert.type === 'info' && <Info size={18} color="#3b82f6" />}
             </div>
             <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                   <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{alert.title}</p>
                   <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{alert.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                   {alert.message}
                </p>
             </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
         <button style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: 500 }}>View All Alerts Archive &rarr;</button>
      </div>
    </div>
  );
};

export default AlertsPanel;

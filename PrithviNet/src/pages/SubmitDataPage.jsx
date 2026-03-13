import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMonitoringLocations, submitMonitoringData } from '../api';
import { Send, ArrowLeft, Wind, Droplets, Volume2, AlertTriangle } from 'lucide-react';

export default function SubmitDataPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState('');
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMonitoringLocations(type?.toUpperCase()).then(res => {
      if (res.ok) setLocations(res.data);
    });
    setForm({});
    setResult(null);
    setError('');
  }, [type]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!locationId) { setError('Please select a location'); return; }
    setLoading(true); setError('');
    const body = { locationId };
    Object.entries(form).forEach(([k, v]) => { if (v !== '') body[k] = parseFloat(v); });
    const res = await submitMonitoringData(type, body);
    setLoading(false);
    if (res.ok) setResult(res.data);
    else setError(res.data?.error || res.data?.message || 'Submission failed');
  };

  const fields = {
    air: [
      { key: 'pm25', label: 'PM2.5', unit: 'µg/m³' },
      { key: 'pm10', label: 'PM10', unit: 'µg/m³' },
      { key: 'no2', label: 'NO₂', unit: 'ppb' },
      { key: 'so2', label: 'SO₂', unit: 'ppb' },
      { key: 'co', label: 'CO', unit: '' },
      { key: 'o3', label: 'O₃', unit: 'ppb' },
      { key: 'aqi', label: 'AQI', unit: '' },
    ],
    water: [
      { key: 'ph', label: 'pH', unit: '' },
      { key: 'tds', label: 'TDS', unit: 'mg/L' },
      { key: 'turbidity', label: 'Turbidity', unit: 'NTU' },
      { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', unit: 'mg/L' },
      { key: 'bod', label: 'BOD', unit: 'mg/L' },
      { key: 'cod', label: 'COD', unit: 'mg/L' },
    ],
    noise: [
      { key: 'laeq', label: 'Laeq', unit: 'dB(A)' },
      { key: 'lmax', label: 'Lmax', unit: 'dB(A)' },
      { key: 'lmin', label: 'Lmin', unit: 'dB(A)' },
    ],
  };

  const typeIcons = { air: <Wind size={20} />, water: <Droplets size={20} />, noise: <Volume2 size={20} /> };

  return (
    <div>
      <button className="icon-btn" onClick={() => navigate(`/monitoring/${type}`)} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to {type} data
      </button>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {typeIcons[type]} Submit {type?.charAt(0).toUpperCase() + type?.slice(1)} Data
      </h2>

      {result ? (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
          <h3 style={{ color: '#10b981', marginBottom: '8px' }}>Data Submitted Successfully!</h3>
          {result.alertsGenerated > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: '#ef4444', marginTop: '12px' }}>
              <AlertTriangle size={18} />
              <span style={{ fontWeight: 600 }}>{result.alertsGenerated} alert(s) generated!</span>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No limit breaches detected.</p>
          )}
          <button className="action-btn primary-btn" style={{ marginTop: '20px' }} onClick={() => { setResult(null); setForm({}); }}>
            Submit Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '28px', maxWidth: '600px' }}>
          {error && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}
          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>Monitoring Location</label>
            <select value={locationId} onChange={e => setLocationId(e.target.value)} required>
              <option value="">Select a location...</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="submit-fields-grid">
            {(fields[type] || []).map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {f.label} {f.unit && <span style={{ opacity: 0.6 }}>({f.unit})</span>}
                </label>
                <input type="number" step="any" placeholder="—" value={form[f.key] || ''} onChange={e => update(f.key, e.target.value)} style={{ width: '100%' }} />
              </div>
            ))}
          </div>

          <button type="submit" className="auth-submit" disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? <span className="spinner"></span> : <><Send size={16} /> Submit Data</>}
          </button>
        </form>
      )}
    </div>
  );
}

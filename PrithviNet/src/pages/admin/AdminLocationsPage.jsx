import React, { useState, useEffect } from 'react';
import { getMonitoringLocations, createMonitoringLocation, getOffices } from '../../api';
import { MapPin, Plus, X, Filter } from 'lucide-react';

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [offices, setOfficesData] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => { setLoading(true); const r = await getMonitoringLocations(typeFilter || undefined); if (r.ok) setLocations(r.data); setLoading(false); };
  useEffect(() => { fetchData(); }, [typeFilter]);
  useEffect(() => { getOffices().then(r => { if (r.ok) setOfficesData(r.data); }); }, []);
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    const body = { name: form.name, type: form.type, lat: parseFloat(form.lat), lng: parseFloat(form.lng), regionId: form.regionId };
    const r = await createMonitoringLocation(body);
    setSaving(false);
    if (r.ok) { setModal(false); fetchData(); } else setError(r.data?.error || 'Failed');
  };

  const TYPE_COLORS = { AIR: '#10b981', WATER: '#3b82f6', NOISE: '#f59e0b' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <MapPin size={22} color="#10b981" /> Monitoring Locations
        </h2>
        <button className="action-btn primary-btn" onClick={() => { setForm({ name: '', type: 'AIR', lat: '', lng: '', regionId: '' }); setModal(true); setError(''); }}>
          <Plus size={16} /> Add Location
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <div className="input-group compact">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="AIR">Air</option>
            <option value="WATER">Water</option>
            <option value="NOISE">Noise</option>
          </select>
        </div>
      </div>

      {loading ? <div className="page-loading"><span className="spinner"></span></div> : (
        <div className="admin-table-wrap glass-panel">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Type</th><th>ID</th></tr></thead>
            <tbody>
              {locations.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.name}</td>
                  <td>
                    <span className="status-badge" style={{ background: `${TYPE_COLORS[l.type] || '#64748b'}20`, color: TYPE_COLORS[l.type] || '#64748b', border: `1px solid ${TYPE_COLORS[l.type] || '#64748b'}40` }}>
                      {l.type}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{l.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {locations.length === 0 && <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No locations found</p>}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Add Monitoring Location</h3>
              <button className="icon-btn" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="auth-error" style={{ marginBottom: '12px' }}>{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="modal-fields">
                <div><label>Regional Office</label>
                  <select value={form.regionId} onChange={e => u('regionId', e.target.value)} required>
                    <option value="">Select...</option>
                    {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
                <div><label>Name</label><input value={form.name} onChange={e => u('name', e.target.value)} required /></div>
                <div><label>Type</label>
                  <select value={form.type} onChange={e => u('type', e.target.value)} required>
                    <option value="AIR">AIR</option>
                    <option value="WATER">WATER</option>
                    <option value="NOISE">NOISE</option>
                  </select>
                </div>
                <div><label>Latitude</label><input type="number" step="any" value={form.lat} onChange={e => u('lat', e.target.value)} /></div>
                <div><label>Longitude</label><input type="number" step="any" value={form.lng} onChange={e => u('lng', e.target.value)} /></div>
              </div>
              <button type="submit" className="auth-submit" disabled={saving} style={{ marginTop: '20px' }}>
                {saving ? <span className="spinner"></span> : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

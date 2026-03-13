import React, { useState, useEffect } from 'react';
import { getIndustries, createIndustry, updateIndustry, getOffices } from '../../api';
import { Factory, Plus, Pencil, X, Filter } from 'lucide-react';

const STATUS_COLORS = { ACTIVE: '#10b981', INACTIVE: '#64748b', SUSPENDED: '#ef4444' };

export default function AdminIndustriesPage() {
  const [industries, setIndustries] = useState([]);
  const [offices, setOfficesData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => { setLoading(true); const r = await getIndustries(statusFilter || undefined); if (r.ok) setIndustries(r.data); setLoading(false); };
  useEffect(() => { fetchData(); }, [statusFilter]);
  useEffect(() => { getOffices().then(r => { if (r.ok) setOfficesData(r.data); }); }, []);
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm({ name: '', type: '', registrationNo: '', lat: '', lng: '', regionId: '' }); setModal('create'); setError(''); };
  const openStatusEdit = (ind) => { setEditing(ind); setForm({ status: ind.status }); setModal('status'); setError(''); };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    const body = { name: form.name, type: form.type, registrationNo: form.registrationNo, lat: parseFloat(form.lat), lng: parseFloat(form.lng), regionId: form.regionId };
    const r = await createIndustry(body);
    setSaving(false);
    if (r.ok) { setModal(null); fetchData(); } else setError(r.data?.error || 'Failed');
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    const r = await updateIndustry(editing.id, { status: form.status });
    setSaving(false);
    if (r.ok) { setModal(null); fetchData(); } else setError(r.data?.error || 'Failed');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Factory size={22} color="#f59e0b" /> Industries
        </h2>
        <button className="action-btn primary-btn" onClick={openCreate}><Plus size={16} /> Register Industry</button>
      </div>

      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <div className="input-group compact">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {loading ? <div className="page-loading"><span className="spinner"></span></div> : (
        <div className="admin-table-wrap glass-panel">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Type</th><th>Reg. No</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {industries.map(ind => (
                <tr key={ind.id}>
                  <td style={{ fontWeight: 600 }}>{ind.name}</td>
                  <td>{ind.type || '—'}</td>
                  <td><span className="code-badge">{ind.registrationNo || '—'}</span></td>
                  <td>
                    <span className="status-badge" style={{ background: `${STATUS_COLORS[ind.status] || '#64748b'}20`, color: STATUS_COLORS[ind.status] || '#64748b', border: `1px solid ${STATUS_COLORS[ind.status] || '#64748b'}40` }}>
                      {ind.status}
                    </span>
                  </td>
                  <td>
                    <button className="icon-btn sm" onClick={() => openStatusEdit(ind)} title="Update Status"><Pencil size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {industries.length === 0 && <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No industries found</p>}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>{modal === 'create' ? 'Register Industry' : 'Update Status'}</h3>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            {error && <div className="auth-error" style={{ marginBottom: '12px' }}>{error}</div>}
            <form onSubmit={modal === 'create' ? handleCreate : handleStatusUpdate}>
              <div className="modal-fields">
                {modal === 'create' ? <>
                  <div><label>Regional Office</label>
                    <select value={form.regionId} onChange={e => u('regionId', e.target.value)} required>
                      <option value="">Select...</option>
                      {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                  <div><label>Name</label><input value={form.name} onChange={e => u('name', e.target.value)} required /></div>
                  <div><label>Type</label><input value={form.type} onChange={e => u('type', e.target.value)} /></div>
                  <div><label>Registration No</label><input value={form.registrationNo} onChange={e => u('registrationNo', e.target.value)} /></div>
                  <div><label>Latitude</label><input type="number" step="any" value={form.lat} onChange={e => u('lat', e.target.value)} /></div>
                  <div><label>Longitude</label><input type="number" step="any" value={form.lng} onChange={e => u('lng', e.target.value)} /></div>
                </> : (
                  <div><label>Status</label>
                    <select value={form.status} onChange={e => u('status', e.target.value)} required>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                )}
              </div>
              <button type="submit" className="auth-submit" disabled={saving} style={{ marginTop: '20px' }}>
                {saving ? <span className="spinner"></span> : modal === 'create' ? 'Create' : 'Update'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

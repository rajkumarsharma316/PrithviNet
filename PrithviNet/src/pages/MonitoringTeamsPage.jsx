import React, { useState, useEffect } from 'react';
import { getMonitoringTeams, createMonitoringTeam } from '../api';
import { Users, Plus, X, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function MonitoringTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    const res = await getMonitoringTeams();
    if (res.ok) setTeams(res.data);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTeams(); }, []);

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', phone: '' });
    setError('');
    setModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await createMonitoringTeam(form);
    setSaving(false);
    if (res.ok) {
      setModal(false);
      fetchTeams();
    } else {
      setError(res.data?.error || res.data?.message || 'Failed to create');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Users size={22} color="#10b981" /> Monitoring Teams
        </h2>
        <button className="action-btn primary-btn" onClick={openCreate}>
          <Plus size={16} /> Add Team Member
        </button>
      </div>

      {loading ? (
        <div className="page-loading"><span className="spinner"></span></div>
      ) : (
        <div className="admin-table-wrap glass-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Region</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.phone || '—'}</td>
                  <td>
                    {t.region ? (
                      <span className="code-badge">{t.region.name}</span>
                    ) : '—'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teams.length === 0 && (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              No monitoring team members yet. Click "Add Team Member" to create one.
            </p>
          )}
        </div>
      )}

      {/* Create Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Add Monitoring Team Member</h3>
              <button className="icon-btn" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="auth-error" style={{ marginBottom: '12px' }}>{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="modal-fields">
                <div>
                  <label>Full Name</label>
                  <input value={form.name} onChange={e => u('name', e.target.value)} required placeholder="e.g. Ramesh Kumar" />
                </div>
                <div>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => u('email', e.target.value)} required placeholder="team@prithvinet.gov.in" />
                </div>
                <div>
                  <label>Password</label>
                  <input type="password" value={form.password} onChange={e => u('password', e.target.value)} required minLength={6} placeholder="Min. 6 characters" />
                </div>
                <div>
                  <label>Phone (optional)</label>
                  <input value={form.phone} onChange={e => u('phone', e.target.value)} placeholder="+91 ..." />
                </div>
              </div>
              <button type="submit" className="auth-submit" disabled={saving} style={{ marginTop: '20px' }}>
                {saving ? <span className="spinner"></span> : 'Create Team Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

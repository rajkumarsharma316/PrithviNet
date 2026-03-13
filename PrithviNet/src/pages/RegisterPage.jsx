import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Activity, ChevronDown } from 'lucide-react';

const ROLES = ['CITIZEN', 'INDUSTRY_USER', 'MONITORING_TEAM', 'REGIONAL_OFFICER', 'SUPER_ADMIN'];

export default function RegisterPage() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CITIZEN' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await registerUser(form.name, form.email, form.password, form.role);
    setLoading(false);
    if (res.ok) navigate('/dashboard');
    else setError(res.data?.error || 'Registration failed');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card glass-panel">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Activity size={28} color="white" />
            </div>
            <h1 className="glow-text" style={{ fontSize: '1.8rem', margin: 0 }}>
              Prithvi<span style={{ color: '#10b981' }}>Net</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>Create your account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <User size={16} className="input-icon" />
              <input type="text" placeholder="Full Name" value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input type="email" placeholder="Email address" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>
            <div className="input-group">
              <Lock size={16} className="input-icon" />
              <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
            </div>
            <div className="input-group">
              <ChevronDown size={16} className="input-icon" />
              <select value={form.role} onChange={e => update('role', e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '20px' }}>
            Already have an account? <Link to="/login" style={{ color: '#10b981', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Zap, Activity } from 'lucide-react';

const PRESETS = [
  { label: 'Super Admin', email: 'admin@prithvinet.gov.in', password: 'password123', icon: '👑' },
  { label: 'Regional Officer', email: 'officer.raipur@prithvinet.gov.in', password: 'password123', icon: '🏢' },
  { label: 'Monitoring Team', email: 'team1@prithvinet.gov.in', password: 'password123', icon: '🔬' },
  { label: 'Industry User', email: 'bhilai@industry.com', password: 'password123', icon: '🏭' },
];

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await loginUser(email, password);
    setLoading(false);
    if (res.ok) navigate('/dashboard');
    else setError(res.data?.error || 'Login failed');
  };

  const quickLogin = async (preset) => {
    setError(''); setLoading(true);
    const res = await loginUser(preset.email, preset.password);
    setLoading(false);
    if (res.ok) navigate('/dashboard');
    else setError(res.data?.error || 'Login failed');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card glass-panel">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Activity size={28} color="white" />
            </div>
            <h1 className="glow-text" style={{ fontSize: '1.8rem', margin: 0 }}>
              Prithvi<span style={{ color: '#10b981' }}>Net</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>Smart Environmental Monitoring</p>
          </div>

          {/* Quick Login */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Quick Access</p>
            <div className="preset-grid">
              {PRESETS.map((p, i) => (
                <button key={i} className="preset-btn glass-panel" onClick={() => quickLogin(p)} disabled={loading}>
                  <span style={{ fontSize: '1.3rem' }}>{p.icon}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="auth-divider">
            <span>or sign in manually</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <Lock size={16} className="input-icon" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '20px' }}>
            Don't have an account? <Link to="/register" style={{ color: '#10b981', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

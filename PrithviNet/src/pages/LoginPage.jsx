import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Mail, Lock, Activity, Cog } from "lucide-react";

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const emailProgress = useMemo(() => Math.min(100, (email.length / 24) * 100), [email.length]);
  const passwordProgress = useMemo(() => Math.min(100, (password.length / 12) * 100), [password.length]);
  const formFilled = email.length > 0 && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await loginUser(email, password);
    setLoading(false);
    if (res.ok) navigate("/dashboard");
    else setError(res.data?.error || "Login failed");
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="login-gear login-gear-1" aria-hidden><Cog size={80} strokeWidth={1.2} /></div>
        <div className="login-gear login-gear-2" aria-hidden><Cog size={56} strokeWidth={1.2} /></div>
        <div className="login-gear login-gear-3" aria-hidden><Cog size={40} strokeWidth={1.2} /></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-card-glow" />
          <div className="login-header">
            <div className="login-logo-ring">
              <div className="login-logo-icon">
                <Activity size={28} color="white" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="login-title">
              Prithvi<span className="login-title-accent">Net</span>
            </h1>
            <p className="login-tagline">Smart Environmental Monitoring</p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div
              className={`login-field ${focused === "email" ? "focused" : ""} ${email.length > 0 ? "has-value" : ""}`}
            >
              <div className="login-field-header">
                <Mail size={18} className="login-field-icon" />
                <span className="login-field-label">Email</span>
                <span className="login-field-fill-pct">{Math.round(emailProgress)}%</span>
              </div>
              <div className="login-progress-track">
                <div
                  className="login-progress-fill"
                  style={{ width: `${emailProgress}%` }}
                />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
                autoComplete="email"
              />
            </div>

            <div
              className={`login-field ${focused === "password" ? "focused" : ""} ${password.length > 0 ? "has-value" : ""}`}
            >
              <div className="login-field-header">
                <Lock size={18} className="login-field-icon" />
                <span className="login-field-label">Password</span>
                <span className="login-field-fill-pct">{Math.round(passwordProgress)}%</span>
              </div>
              <div className="login-progress-track">
                <div
                  className="login-progress-fill"
                  style={{ width: `${passwordProgress}%` }}
                />
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className={`login-submit ${formFilled ? "ready" : ""} ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              <span className="login-submit-inner">
                {loading ? (
                  <span className="login-spinner" />
                ) : (
                  <>
                    <LogIn size={18} /> Sign In
                  </>
                )}
              </span>
              <span className="login-submit-progress" style={{ width: formFilled ? "100%" : "0%" }} />
            </button>
          </form>

          <p className="login-register-text">
            Industry partner?{" "}
            <Link to="/register" className="login-register-link">
              Register your unit
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

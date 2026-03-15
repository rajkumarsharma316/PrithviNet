import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRegionalOffices } from "../api";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  ChevronDown,
  Factory,
  MapPin,
  FileText,
  Cog,
} from "lucide-react";
import PrithviNetLogo from "../components/PrithviNetLogo";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser, registerUser } = useAuth();

  const initialMode = location.pathname === "/register" ? "register" : "login";
  const [activeSide, setActiveSide] = useState(initialMode);

  useEffect(() => {
    setActiveSide(location.pathname === "/register" ? "register" : "login");
  }, [location.pathname]);

  const switchToRegister = () => setActiveSide("register");
  const switchToLogin = () => setActiveSide("login");

  return (
    <div className="auth-split-page">
      <div className="auth-split-page-bg" aria-hidden>
        <span className="auth-bg-blob auth-bg-blob-1" />
        <span className="auth-bg-blob auth-bg-blob-2" />
        <span className="auth-bg-blob auth-bg-blob-3" />
      </div>
      <div className="auth-split-card">
        <div
          className={`auth-split-slider ${activeSide === "register" ? "auth-split-slider-right" : ""}`}
          style={{ left: activeSide === "login" ? "0" : "50%" }}
          aria-hidden
        />
        <div className={`auth-split-panel auth-split-left ${activeSide !== "login" ? "auth-split-panel-inactive" : ""}`}>
          <div key={`left-${activeSide}`} className="auth-split-panel-inner active">
            {activeSide === "login" ? (
              <LoginForm onSuccess={() => navigate("/dashboard")} />
            ) : (
              <SwitchButton label="Login" onClick={switchToLogin} />
            )}
          </div>
        </div>
        <div className={`auth-split-panel auth-split-right ${activeSide !== "register" ? "auth-split-panel-inactive" : ""}`}>
          <div key={`right-${activeSide}`} className="auth-split-panel-inner active">
            {activeSide === "register" ? (
              <RegisterForm onSuccess={() => navigate("/dashboard")} />
            ) : (
              <SwitchButton label="Register" onClick={switchToRegister} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SwitchButton({ label, onClick }) {
  return (
    <div className="auth-split-switch-wrap">
      <button type="button" className="auth-split-switch-btn" onClick={onClick}>
        <span>{label}</span>
      </button>
    </div>
  );
}

function LoginForm({ onSuccess }) {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requiredCount = 2;
  const completed = (email.trim().length >= 1 ? 1 : 0) + (password.length >= 1 ? 1 : 0);
  const progress = completed / requiredCount;
  const gearRotation = completed * 15; /* 15° per completed field – pulley feel */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await loginUser(email, password);
    setLoading(false);
    if (res.ok) onSuccess();
    else setError(res.data?.error || "Login failed");
  };

  return (
    <div className="auth-split-form-wrap">
      <div className="auth-split-title-band">
        <div className="auth-split-form-header">
          <PrithviNetLogo className="auth-split-form-logo" width={80} height={48} />
          <h2 className="auth-split-form-title">Login</h2>
          <p className="auth-split-form-tagline">PrithviNet</p>
        </div>
      </div>
      <div className="auth-split-form-body">
        <form onSubmit={handleSubmit} className="auth-split-form auth-split-form-with-rope">
          <div className="auth-form-fields-wrap">
            {error && <div className="auth-split-error">{error}</div>}
            <div className="auth-split-input-wrap">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="auth-split-input-wrap">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          <div className="auth-form-gear-column" role="presentation" aria-label="Progress indicator">
            <div className="auth-mechanism-head">
              <div
                className="auth-gear-cog"
                style={{ transform: `rotate(${gearRotation}deg)` }}
                aria-hidden
              >
                <Cog size={36} strokeWidth={1.6} />
              </div>
            </div>
            <div className="auth-mechanism-rope-track">
              <div
                className="auth-gear-rope-line"
                style={{ transform: `translateY(${(1 - progress) * 24}px)` }}
                aria-hidden
              />
            </div>
            <div className="auth-form-submit-holder-wrap">
              <div
                className="auth-form-submit-holder"
                style={{ transform: `translateY(${(1 - progress) * 80}px)` }}
              >
                <button
                  type="submit"
                  className="auth-split-submit"
                  disabled={loading || progress < 1}
                >
                  {loading ? <span className="spinner" /> : <><LogIn size={18} /> Login</>}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function RegisterForm({ onSuccess }) {
  const { registerUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "INDUSTRY_USER",
  });
  const [industryForm, setIndustryForm] = useState({
    industryName: "",
    industryType: "",
    registrationNo: "",
    lat: "",
    lng: "",
    industryRegionId: "",
  });
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const updateInd = (key, val) =>
    setIndustryForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    getRegionalOffices().then((r) => {
      if (r.ok) setRegions(r.data);
    });
  }, []);

  const requiredFields = [
    form.name.trim().length >= 1,
    form.email.trim().length >= 1,
    form.password.length >= 1,
    industryForm.industryName.trim().length >= 1,
    industryForm.industryType.trim().length >= 1,
    industryForm.registrationNo.trim().length >= 1,
    industryForm.lat.trim().length >= 1,
    industryForm.lng.trim().length >= 1,
    industryForm.industryRegionId !== "",
  ];
  const requiredCount = requiredFields.length;
  const completed = requiredFields.filter(Boolean).length;
  const progress = completed / requiredCount;
  const gearRotation = completed * 15; /* 15° per completed field – pulley feel */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const extra = {
      industryName: industryForm.industryName,
      industryType: industryForm.industryType,
      registrationNo: industryForm.registrationNo,
      lat: parseFloat(industryForm.lat),
      lng: parseFloat(industryForm.lng),
      industryRegionId: industryForm.industryRegionId,
    };
    const res = await registerUser(
      form.name,
      form.email,
      form.password,
      "INDUSTRY_USER",
      extra,
    );
    setLoading(false);
    if (res.ok) onSuccess();
    else setError(res.data?.error || "Registration failed");
  };

  return (
    <div className="auth-split-form-wrap auth-split-form-wrap-register">
      <div className="auth-split-title-band">
        <div className="auth-split-form-header">
          <PrithviNetLogo className="auth-split-form-logo" width={80} height={48} />
          <h2 className="auth-split-form-title">Register</h2>
          <p className="auth-split-form-tagline">Industry unit</p>
        </div>
      </div>
      <div className="auth-split-form-body auth-split-form-body-register">
        <form onSubmit={handleSubmit} className="auth-split-form auth-split-form-with-rope">
          <div className="auth-form-fields-wrap auth-form-fields-wrap-register">
            {error && <div className="auth-split-error">{error}</div>}
            <div className="auth-split-input-wrap">
              <User size={18} />
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>
            <div className="auth-split-input-wrap">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>
            <div className="auth-split-input-wrap">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Password (min 6)"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="auth-split-industry-block">
              <p className="auth-split-industry-title"><Factory size={14} /> Industry details</p>
              <div className="auth-split-input-wrap">
                <Factory size={18} />
                <input
                  placeholder="Industry name"
                  value={industryForm.industryName}
                  onChange={(e) => updateInd("industryName", e.target.value)}
                  required
                />
              </div>
              <div className="auth-split-input-wrap">
                <FileText size={18} />
                <input
                  placeholder="Type (e.g. Steel, Chemical)"
                  value={industryForm.industryType}
                  onChange={(e) => updateInd("industryType", e.target.value)}
                  required
                />
              </div>
              <div className="auth-split-input-wrap">
                <FileText size={18} />
                <input
                  placeholder="Registration No."
                  value={industryForm.registrationNo}
                  onChange={(e) => updateInd("registrationNo", e.target.value)}
                  required
                />
              </div>
              <div className="auth-split-input-row">
                <div className="auth-split-input-wrap">
                  <MapPin size={18} />
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={industryForm.lat}
                    onChange={(e) => updateInd("lat", e.target.value)}
                    required
                  />
                </div>
                <div className="auth-split-input-wrap">
                  <MapPin size={18} />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={industryForm.lng}
                    onChange={(e) => updateInd("lng", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="auth-split-input-wrap">
                <ChevronDown size={18} />
                <select
                  value={industryForm.industryRegionId}
                  onChange={(e) => updateInd("industryRegionId", e.target.value)}
                  required
                >
                  <option value="">Select region</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} — {r.district}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="auth-form-gear-column" role="presentation" aria-label="Progress indicator">
            <div className="auth-mechanism-head">
              <div
                className="auth-gear-cog"
                style={{ transform: `rotate(${gearRotation}deg)` }}
                aria-hidden
              >
                <Cog size={36} strokeWidth={1.6} />
              </div>
            </div>
            <div className="auth-mechanism-rope-track">
              <div
                className="auth-gear-rope-line"
                style={{ transform: `translateY(${(1 - progress) * 24}px)` }}
                aria-hidden
              />
            </div>
            <div className="auth-form-submit-holder-wrap">
              <div
                className="auth-form-submit-holder"
                style={{ transform: `translateY(${(1 - progress) * 80}px)` }}
              >
                <button
                  type="submit"
                  className="auth-split-submit"
                  disabled={loading || progress < 1}
                >
                  {loading ? <span className="spinner" /> : <><UserPlus size={18} /> Register</>}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

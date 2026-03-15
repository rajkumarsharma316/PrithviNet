import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRegionalOffices } from "../api";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Activity,
  ChevronDown,
  Factory,
  MapPin,
  FileText,
} from "lucide-react";

export default function RegisterPage() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
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

  const isIndustry = true; // Registration is industry-only

  // Fetch regions for the dropdown
  useEffect(() => {
    if (regions.length === 0) {
      getRegionalOffices().then((r) => {
        if (r.ok) setRegions(r.data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const extra = isIndustry
      ? {
          industryName: industryForm.industryName,
          industryType: industryForm.industryType,
          registrationNo: industryForm.registrationNo,
          lat: parseFloat(industryForm.lat),
          lng: parseFloat(industryForm.lng),
          industryRegionId: industryForm.industryRegionId,
        }
      : {};

    const res = await registerUser(
      form.name,
      form.email,
      form.password,
      form.role,
      extra,
    );
    setLoading(false);
    if (res.ok) navigate("/dashboard");
    else setError(res.data?.error || "Registration failed");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card glass-panel">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Activity size={28} color="white" />
            </div>
            <h1 className="glow-text" style={{ fontSize: "1.8rem", margin: 0 }}>
              Prithvi<span style={{ color: "#10b981" }}>Net</span>
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                margin: "4px 0 0",
              }}
            >
              Register your industry unit
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <User size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Industry details (registration is industry-only) */}
            <div
                style={{
                  padding: "16px",
                  marginTop: "8px",
                  borderRadius: "12px",
                  border: "1px solid rgba(59,130,246,0.25)",
                  background: "rgba(59,130,246,0.05)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Factory size={14} /> Industry Details (submitted for
                  approval)
                </p>
                <div className="input-group">
                  <Factory size={16} className="input-icon" />
                  <input
                    placeholder="Industry Name"
                    value={industryForm.industryName}
                    onChange={(e) => updateInd("industryName", e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <FileText size={16} className="input-icon" />
                  <input
                    placeholder="Type (e.g. Steel, Chemical)"
                    value={industryForm.industryType}
                    onChange={(e) => updateInd("industryType", e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <FileText size={16} className="input-icon" />
                  <input
                    placeholder="Registration No. (e.g. CG-STL-001)"
                    value={industryForm.registrationNo}
                    onChange={(e) =>
                      updateInd("registrationNo", e.target.value)
                    }
                    required
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <div className="input-group">
                    <MapPin size={16} className="input-icon" />
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={industryForm.lat}
                      onChange={(e) => updateInd("lat", e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <MapPin size={16} className="input-icon" />
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
                <div className="input-group">
                  <ChevronDown size={16} className="input-icon" />
                  <select
                    value={industryForm.industryRegionId}
                    onChange={(e) =>
                      updateInd("industryRegionId", e.target.value)
                    }
                    required
                  >
                    <option value="">Select Region</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {r.district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
              style={{ marginTop: "16px" }}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <UserPlus size={16} /> Register & Submit for Approval
                </>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginTop: "20px",
            }}
          >
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#10b981", fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

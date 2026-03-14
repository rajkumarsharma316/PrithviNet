import React, { useState, useEffect } from "react";
import { getMe } from "../api";
import {
  User,
  Mail,
  Shield,
  Phone,
  MapPin,
  Factory,
  Calendar,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe().then((res) => {
      if (res.ok) setProfile(res.data);
      else setError(res.data?.error || "Failed to load profile");
    });
  }, []);

  if (error) return <div className="page-error">{error}</div>;
  if (!profile)
    return (
      <div className="page-loading">
        <span className="spinner"></span> Loading profile...
      </div>
    );

  const fields = [
    { icon: <User size={18} />, label: "Name", value: profile.name },
    { icon: <Mail size={18} />, label: "Email", value: profile.email },
    {
      icon: <Shield size={18} />,
      label: "Role",
      value: profile.role,
      badge: true,
    },
    { icon: <Phone size={18} />, label: "Phone", value: profile.phone || "—" },
    {
      icon: <MapPin size={18} />,
      label: "Region",
      value: profile.region?.name || "—",
    },
    {
      icon: <Factory size={18} />,
      label: "Industry",
      value: profile.industry?.name || "—",
    },
    {
      icon: <Calendar size={18} />,
      label: "Joined",
      value: new Date(profile.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  ];

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>My Profile</h2>
      <div
        className="glass-panel"
        style={{ padding: "32px", maxWidth: "600px" }}
      >
        {/* Avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "var(--govt-blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "white",
              boxShadow: "0 0 30px rgba(16,185,129,0.3)",
            }}
          >
            {profile.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>
              {profile.name}
            </h3>
            <span
              className={`status-badge ${profile.role === "SUPER_ADMIN" ? "status-poor" : profile.role === "REGIONAL_OFFICER" ? "status-moderate" : "status-good"}`}
            >
              {profile.role.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {fields.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>{f.icon}</span>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  minWidth: "80px",
                  fontWeight: 500,
                }}
              >
                {f.label}
              </span>
              {f.badge ? (
                <span
                  className="status-badge status-good"
                  style={{ fontSize: "0.8rem" }}
                >
                  {f.value.replace(/_/g, " ")}
                </span>
              ) : (
                <span
                  style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}
                >
                  {f.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

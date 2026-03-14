import React, { useState, useEffect } from "react";
import { getIndustries, updateIndustry } from "../../api";
import { Factory, Plus, Pencil, X, Filter } from "lucide-react";

const STATUS_COLORS = {
  ACTIVE: "#10b981",
  INACTIVE: "#64748b",
  SUSPENDED: "#ef4444",
  PENDING: "#f59e0b",
};

export default function AdminIndustriesPage() {
  const [industries, setIndustries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'status' | null
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const r = await getIndustries(statusFilter || undefined);
    if (r.ok) setIndustries(r.data);
    setLoading(false);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    fetchData();
  }, [statusFilter]);
  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openStatusEdit = (ind) => {
    setEditing(ind);
    setForm({ status: ind.status });
    setModal("status");
    setError("");
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const r = await updateIndustry(editing.id, { status: form.status });
    setSaving(false);
    if (r.ok) {
      setModal(null);
      fetchData();
    } else setError(r.data?.error || "Failed");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: 0,
          }}
        >
          <Factory size={22} color="#f59e0b" /> Industries
        </h2>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <Filter size={16} style={{ color: "var(--text-muted)" }} />
        <div className="input-group compact">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <span className="spinner"></span>
        </div>
      ) : (
        <div className="admin-table-wrap glass-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Reg. No</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {industries.map((ind) => (
                <tr key={ind.id}>
                  <td style={{ fontWeight: 600 }}>{ind.name}</td>
                  <td>{ind.type || "—"}</td>
                  <td>
                    <span className="code-badge">
                      {ind.registrationNo || "—"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        background: `${STATUS_COLORS[ind.status] || "#64748b"}20`,
                        color: STATUS_COLORS[ind.status] || "#64748b",
                        border: `1px solid ${STATUS_COLORS[ind.status] || "#64748b"}40`,
                      }}
                    >
                      {ind.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-btn sm"
                      onClick={() => openStatusEdit(ind)}
                      title="Update Status"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {industries.length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "24px",
                color: "var(--text-muted)",
              }}
            >
              No industries found
            </p>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div
            className="modal glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0 }}>Update Status</h3>
              <button className="icon-btn" onClick={() => setModal(null)}>
                <X size={18} />
              </button>
            </div>
            {error && (
              <div className="auth-error" style={{ marginBottom: "12px" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleStatusUpdate}>
              <div className="modal-fields">
                <div>
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => u("status", e.target.value)}
                    required
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="auth-submit"
                disabled={saving}
                style={{ marginTop: "20px" }}
              >
                {saving ? <span className="spinner"></span> : "Update"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

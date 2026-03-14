import React, { useState, useEffect } from "react";
import {
  getOffices,
  createOffice,
  updateOffice,
  deleteOffice,
} from "../../api";
import { Building2, Plus, Pencil, Trash2, X } from "lucide-react";

export default function AdminOfficesPage() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'edit' | null
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const r = await getOffices();
    if (r.ok) setOffices(r.data);
    setLoading(false);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    fetch();
  }, []);
  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm({
      name: "",
      code: "",
      district: "",
      address: "",
      lat: "",
      lng: "",
      officerEmail: "",
      officerPassword: "",
    });
    setModal("create");
    setError("");
  };
  const openEdit = (o) => {
    setEditing(o);
    setForm({ name: o.name, address: o.address || "" });
    setModal("edit");
    setError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      ...form,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
    };
    const r = await createOffice(body);
    setSaving(false);
    if (r.ok) {
      setModal(null);
      fetch();
    } else setError(r.data?.error || "Failed");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = {};
    if (form.name.trim()) body.name = form.name.trim();
    if (form.address.trim()) body.address = form.address.trim();
    const r = await updateOffice(editing.id, body);
    setSaving(false);
    if (r.ok) {
      setModal(null);
      fetch();
    } else setError(r.data?.error || "Failed");
  };

  const handleDelete = async (o) => {
    if (!confirm(`Delete "${o.name}"?`)) return;
    await deleteOffice(o.id);
    fetch();
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
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
          <Building2 size={22} color="#3b82f6" /> Regional Offices
        </h2>
        <button className="action-btn primary-btn" onClick={openCreate}>
          <Plus size={16} /> Create Office
        </button>
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
                <th>Code</th>
                <th>District</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offices.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>{o.name}</td>
                  <td>
                    <span className="code-badge">{o.code}</span>
                  </td>
                  <td>{o.district || "—"}</td>
                  <td
                    style={{
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {o.address || "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="icon-btn sm"
                        onClick={() => openEdit(o)}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="icon-btn sm danger"
                        onClick={() => handleDelete(o)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {offices.length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "24px",
                color: "var(--text-muted)",
              }}
            >
              No offices found
            </p>
          )}
        </div>
      )}

      {/* Modal */}
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
              <h3 style={{ margin: 0 }}>
                {modal === "create" ? "Create Office" : "Edit Office"}
              </h3>
              <button className="icon-btn" onClick={() => setModal(null)}>
                <X size={18} />
              </button>
            </div>
            {error && (
              <div className="auth-error" style={{ marginBottom: "12px" }}>
                {error}
              </div>
            )}
            <form onSubmit={modal === "create" ? handleCreate : handleUpdate}>
              <div className="modal-fields">
                <div>
                  <label>Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => u("name", e.target.value)}
                    required
                  />
                </div>
                {modal === "create" && (
                  <>
                    <div>
                      <label>Code</label>
                      <input
                        value={form.code}
                        onChange={(e) => u("code", e.target.value)}
                        required
                        placeholder="e.g. RO-XYZ"
                      />
                    </div>
                    <div>
                      <label>District</label>
                      <input
                        value={form.district}
                        onChange={(e) => u("district", e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label>Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => u("address", e.target.value)}
                  />
                </div>
                {modal === "create" && (
                  <>
                    <div>
                      <label>Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={form.lat}
                        onChange={(e) => u("lat", e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={form.lng}
                        onChange={(e) => u("lng", e.target.value)}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '8px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Officer Account</p>
                    </div>
                    <div>
                      <label>Officer Email</label>
                      <input
                        type="email"
                        value={form.officerEmail}
                        onChange={(e) => u("officerEmail", e.target.value)}
                        required
                        placeholder="officer@prithvinet.gov.in"
                      />
                    </div>
                    <div>
                      <label>Officer Password</label>
                      <input
                        type="password"
                        value={form.officerPassword}
                        onChange={(e) => u("officerPassword", e.target.value)}
                        required
                        minLength={6}
                        placeholder="Min. 6 characters"
                      />
                    </div>
                  </>
                )}
              </div>
              <button
                type="submit"
                className="auth-submit"
                disabled={saving}
                style={{ marginTop: "20px" }}
              >
                {saving ? (
                  <span className="spinner"></span>
                ) : modal === "create" ? (
                  "Create"
                ) : (
                  "Update"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

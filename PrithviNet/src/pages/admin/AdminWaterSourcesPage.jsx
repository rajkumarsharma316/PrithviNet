import React, { useState, useEffect } from "react";
import { getWaterSources, createWaterSource, getOffices } from "../../api";
import { Droplets, Plus, X } from "lucide-react";

export default function AdminWaterSourcesPage() {
  const [sources, setSources] = useState([]);
  const [offices, setOfficesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getWaterSources().then((r) => {
      if (r.ok) setSources(r.data);
      setLoading(false);
    });
    getOffices().then((r) => {
      if (r.ok) setOfficesData(r.data);
    });
  }, []);

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      name: form.name,
      type: form.type,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      regionId: form.regionId,
    };
    const r = await createWaterSource(body);
    setSaving(false);
    if (r.ok) {
      setModal(false);
      getWaterSources().then((r2) => {
        if (r2.ok) setSources(r2.data);
      });
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
          <Droplets size={22} color="#3b82f6" /> Water Sources
        </h2>
        <button
          className="action-btn primary-btn"
          onClick={() => {
            setForm({ name: "", type: "", lat: "", lng: "", regionId: "" });
            setModal(true);
            setError("");
          }}
        >
          <Plus size={16} /> Add Source
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
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.type || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {sources.length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "24px",
                color: "var(--text-muted)",
              }}
            >
              No water sources found
            </p>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
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
              <h3 style={{ margin: 0 }}>Add Water Source</h3>
              <button className="icon-btn" onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>
            {error && (
              <div className="auth-error" style={{ marginBottom: "12px" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleCreate}>
              <div className="modal-fields">
                <div>
                  <label>Regional Office</label>
                  <select
                    value={form.regionId}
                    onChange={(e) => u("regionId", e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    {offices.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => u("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Type</label>
                  <input
                    value={form.type}
                    onChange={(e) => u("type", e.target.value)}
                    placeholder="River/Lake/Groundwater..."
                  />
                </div>
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
              </div>
              <button
                type="submit"
                className="auth-submit"
                disabled={saving}
                style={{ marginTop: "20px" }}
              >
                {saving ? <span className="spinner"></span> : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

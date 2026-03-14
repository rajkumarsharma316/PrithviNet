// PrithviNet API Service Layer
const BASE = "/api";

function getToken() {
  return localStorage.getItem("prithvinet_token");
}

export async function api(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: "Connection refused — is the backend running?" },
    };
  }
}

// ─── AUTH ─────────────────────────────────────────────────
export const login = (email, password) =>
  api("POST", "/auth/login", { email, password });
export const register = (name, email, password, role, extra = {}) =>
  api("POST", "/auth/register", { name, email, password, role, ...extra });
export const getMe = () => api("GET", "/auth/me");

// ─── PUBLIC ───────────────────────────────────────────────
export const getOverview = (regionId) =>
  api("GET", regionId ? `/public/overview?regionId=${encodeURIComponent(regionId)}` : "/public/overview");
export const getRegionalOffices = () => api("GET", "/public/regional-offices");
export const getPublicAlerts = (regionId) =>
  api("GET", regionId ? `/public/alerts?regionId=${encodeURIComponent(regionId)}` : "/public/alerts");
export const getMapData = (type) => api("GET", `/public/map-data/${type}`);
export const getTrend = (type, locationId, days = 7) =>
  api("GET", `/public/trend/${type}/${locationId}?days=${days}`);

// ─── MONITORING DATA ──────────────────────────────────────
export const getMonitoringData = (type, limit = 10, locationId) => {
  let path = `/monitoring/${type?.toLowerCase()}?limit=${limit}`;
  if (locationId) path += `&locationId=${locationId}`;
  return api("GET", path);
};
export const submitMonitoringData = (type, body) =>
  api("POST", `/monitoring/${type?.toLowerCase()}`, body);

// ─── MONITORING LOCATIONS ─────────────────────────────────
export const getMonitoringLocations = (type) => {
  let path = "/monitoring-locations";
  if (type) path += `?type=${type}`;
  return api("GET", path);
};
export const createMonitoringLocation = (body) =>
  api("POST", "/monitoring-locations", body);

// ─── ALERTS ───────────────────────────────────────────────
export const getAlerts = (status, severity, limit = 20) => {
  let path = `/alerts?limit=${limit}`;
  if (status) path += `&status=${status}`;
  if (severity) path += `&severity=${severity}`;
  return api("GET", path);
};
export const acknowledgeAlert = (id) =>
  api("PUT", `/alerts/${id}/acknowledge`, {});
export const resolveAlert = (id) => api("PUT", `/alerts/${id}/resolve`, {});

// ─── REGIONAL OFFICES (Admin) ─────────────────────────────
export const getOffices = () => api("GET", "/regional-offices");
export const createOffice = (body) => api("POST", "/regional-offices", body);
export const updateOffice = (id, body) =>
  api("PUT", `/regional-offices/${id}`, body);
export const deleteOffice = (id) => api("DELETE", `/regional-offices/${id}`);

// ─── INDUSTRIES (Admin) ──────────────────────────────────
export const getIndustries = (status) => {
  let path = "/industries";
  if (status) path += `?status=${status}`;
  return api("GET", path);
};
export const createIndustry = (body) => api("POST", "/industries", body);
export const updateIndustry = (id, body) =>
  api("PUT", `/industries/${id}`, body);

// ─── WATER SOURCES (Admin) ────────────────────────────────
export const getWaterSources = () => api("GET", "/water-sources");
export const createWaterSource = (body) => api("POST", "/water-sources", body);

// ─── PRESCRIBED LIMITS & UNITS ────────────────────────────
export const getPrescribedLimits = () => api("GET", "/prescribed-limits");
export const getMonitoringUnits = () => api("GET", "/monitoring-units");

// ─── MONITORING TEAMS ─────────────────────────────────────
export const getMonitoringTeams = () => api("GET", "/monitoring-teams");
export const createMonitoringTeam = (body) =>
  api("POST", "/monitoring-teams", body);

// ─── REGION SUMMARY & TRENDS ──────────────────────────────
export const getRegionSummary = () => api("GET", "/public/region-summary");
export const getRegionTrend = (regionId) =>
  api("GET", `/public/region-trend/${regionId}`);
export const getYoYTrend = (type) => api("GET", `/public/yoy-trend/${type}`);

// ─── AI FEATURES ───────────────────────────────────────────
export const aiChat = (message, history = []) =>
  api("POST", "/ai/chat", { message, history });

export const aiGenerateReport = (days = 7) =>
  api("POST", "/ai/report", { days });

export const aiForecast = (type, locationId, hours = 72) => {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (locationId) params.set("locationId", locationId);
  if (hours) params.set("hours", String(hours));
  return api("GET", `/ai/forecast?${params.toString()}`);
};

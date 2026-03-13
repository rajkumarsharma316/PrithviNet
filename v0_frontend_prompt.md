# PrithviNet — Frontend Design Prompt

Build a **complete, production-quality React frontend** for **PrithviNet**, a government environmental monitoring platform for the Indian state of Chhattisgarh. The backend is already built (Fastify + Prisma + PostgreSQL) and runs at `http://localhost:3001/api`.

## Design Direction

- **Theme**: Dark mode, glassmorphism panels, emerald (#10b981) accent
- **Fonts**: Outfit (headings), Inter (body) — import from Google Fonts
- **Feel**: Premium government dashboard — like a modern CPCB portal
- **Colors**: Dark navy backgrounds (#0f1523, #060913), glass panels with backdrop-blur, subtle radial gradient glows (emerald + blue)
- **Animations**: Fade-in cards, smooth hover transitions, micro-interactions
- **Icons**: Use `lucide-react`
- **Charts**: Use `recharts` (AreaChart, BarChart)
- **Maps**: Use `react-leaflet` with dark CartoDB tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`), centered on Chhattisgarh (21.25, 81.62)

## Tech Stack

React 19 + Vite + react-router-dom v7 + recharts + react-leaflet + lucide-react. No Tailwind — use vanilla CSS with CSS variables.

## App Structure

Sidebar layout on the left (260px), main content scrollable on the right. Sidebar has PrithviNet logo, navigation links organized by section, and a user panel at the bottom.

---

## PAGES & FEATURES

### 1. Login Page (`/login`)

Full-page centered glassmorphism card. No sidebar.

- **Logo**: PrithviNet icon + name + "Smart Environmental Monitoring" subtitle
- **Form**: Email + Password inputs with icons, "Sign In" green gradient button
- **Link**: "Don't have an account? **Register**" at bottom
- **No preset accounts** — only manual email/password

**API**: `POST /api/auth/login` — body: `{ email, password }` — returns `{ user: { id, name, email, role }, token }`
Store the token in `localStorage` as `prithvinet_token`. Send as `Authorization: Bearer <token>` header on all authenticated requests.

---

### 2. Register Page (`/register`)

Same layout as login. Form fields:
- Name, Email, Password (min 6 chars)
- Role dropdown: `CITIZEN` (default), `INDUSTRY_USER`, `MONITORING_TEAM`, `REGIONAL_OFFICER`, `SUPER_ADMIN`

**API**: `POST /api/auth/register` — body: `{ name, email, password, role }` — returns `{ user, token }`

---

### 3. Dashboard / Overview (`/dashboard`)

**Side navigation active**. Shows 4 stat cards at top + 3 monitoring cards below.

**Stat cards row** (4 columns):
| Stat | Icon | Color |
|------|------|-------|
| Monitoring Locations | MapPin | Green |
| Active Industries | Factory | Blue |
| Regional Offices | BarChart3 | Amber |
| Active Alerts | AlertCircle | Red |

**3 Monitoring Cards** (Air, Water, Noise):
- Large value display (AQI / pH / dB(A))
- Trend indicator (↑ or ↓ with %)
- 3 sub-parameters grid
- Status badge at bottom (Good / Moderate / Poor)

**API**: `GET /api/public/overview` (NO auth needed) — returns:
```json
{
  "stats": { "totalLocations": 5, "totalIndustries": 3, "totalRegions": 2, "activeAlerts": 1 },
  "latestReadings": {
    "air": { "aqi": 142, "pm25": 45, "pm10": 80, "no2": 18, "so2": 4, "location": { "name": "Raipur HQ" } },
    "water": { "ph": 8.2, "tds": 320, "turbidity": 3.1, "dissolvedOxygen": 6.5, "location": { "name": "Mahanadi" } },
    "noise": { "laeq": 78, "lmax": 85, "lmin": 42, "location": { "name": "Raipur City" } }
  }
}
```

---

### 4. Pollution Map (`/map`)

Interactive Leaflet map with Air / Water / Noise tab switcher. Each monitoring location shown as a colored circular marker with its primary value. Popup on click shows station name, value, status badge, and reading timestamp.

**API**: `GET /api/public/map-data/:type` (type = air|water|noise, NO auth) — returns array:
```json
[{
  "id": "uuid", "name": "Station Name", "lat": 21.25, "lng": 81.62,
  "region": { "name": "Raipur RO" },
  "latestReading": { "aqi": 145, "pm25": 45, "timestamp": "2026-03-13T..." }
}]
```

Color coding: Good (#10b981) / Moderate (#fbbf24) / Poor (#ef4444) / Severe (#991b1b)
- Air: AQI ≤100 Good, ≤200 Moderate, ≤300 Poor, >300 Severe
- Water: pH 6.5–8.5 Good
- Noise: ≤55 Good, ≤75 Moderate, >75 Poor

Map legend at bottom.

---

### 5. Forecasting (`/forecast`)

Chart showing 72-hour AI predictive forecast using recharts AreaChart. Tab switcher for Air/Water/Noise. Show uncertainty cone (min/max bands), safe limit reference line, and gradient fill.

**API**: `GET /api/public/trend/:type/:locationId?days=7` — returns time-series array. Can generate synthetic forecast data on frontend as well.

---

### 6. Live Alerts Panel (`/alerts-panel`)

Public-facing active alerts list. Health advisory banner at top. Each alert shows severity icon, parameter name, message, location, and timestamp.

**API**: `GET /api/public/alerts` (NO auth) — returns active alerts with severity (CRITICAL/WARNING/INFO), message, parameter, location.

---

### 7. Monitoring Data — Air (`/monitoring/air`), Water (`/monitoring/water`), Noise (`/monitoring/noise`)

**Requires login**. Shows a filterable list of data readings.

**Filters bar**: Location dropdown, record limit (5/10/20/50), refresh button.

**Data displayed as card grid**, each card shows:
- Air: AQI, PM2.5, PM10, NO₂, SO₂, CO (µg/m³ / ppb)
- Water: pH, TDS (mg/L), Turbidity (NTU), DO (mg/L), BOD, COD
- Noise: Laeq, Lmax, Lmin (dB(A))
- Location name, timestamp, submitted-by

"Submit Data" button (visible only to MONITORING_TEAM / SUPER_ADMIN / REGIONAL_OFFICER roles).

**APIs**:
- `GET /api/monitoring/:type?limit=10&locationId=xxx` (Auth required) — returns readings with `location.name` and `submittedBy.name`
- `GET /api/monitoring-locations?type=AIR|WATER|NOISE` (Auth required) — for filter dropdown

---

### 8. Submit Data (`/monitoring/:type/submit`)

**Requires login (MONITORING_TEAM role)**. Form with:
- Location dropdown (fetched from API)
- Type-specific fields:
  - Air: PM2.5, PM10, NO₂, SO₂, CO, O₃, AQI (all optional numbers)
  - Water: pH, TDS, Turbidity, Dissolved Oxygen, BOD, COD
  - Noise: Laeq, Lmax, Lmin
- Submit button

On success, show alert count generated. If `alertsGenerated > 0`, show a red warning.

**API**: `POST /api/monitoring/:type` (Auth required) — body: `{ locationId, pm25, pm10, ... }` — returns `{ entry, alertsGenerated: N }`

---

### 9. Alerts Management (`/alerts`)

**Requires login**. Full alert management page.

**Filters**: Status (ALL / ACTIVE / ACKNOWLEDGED / RESOLVED), Severity (ALL / CRITICAL / WARNING / INFO).

Each alert shows: severity icon + badge, status badge, parameter name, message, location, type, timestamp.

For users with role `SUPER_ADMIN` or `REGIONAL_OFFICER`: show "Acknowledge" and "Resolve" action buttons on each alert.

**APIs**:
- `GET /api/alerts?status=ACTIVE&severity=CRITICAL&limit=20` (Auth)
- `PUT /api/alerts/:id/acknowledge` (Auth, SUPER_ADMIN/REGIONAL_OFFICER)
- `PUT /api/alerts/:id/resolve` (Auth, SUPER_ADMIN/REGIONAL_OFFICER)

---

### 10. Profile (`/profile`)

**Requires login**. Shows user info in a glass card: avatar circle with initial, name, role badge, email, phone, region, industry, join date.

**API**: `GET /api/auth/me` (Auth) — returns `{ id, name, email, role, phone, region: { name }, industry: { name }, createdAt }`

---

### 11. Admin Panel — Regional Offices (`/admin/offices`)

**Requires login (SUPER_ADMIN / REGIONAL_OFFICER / MONITORING_TEAM)**. Table view with CRUD.

**Table columns**: Name, Code, District, Address, Actions (Edit, Delete)
**Create/Edit modal**: Name, Code, District, Address, Lat, Lng

**APIs**:
- `GET /api/regional-offices` (Auth)
- `POST /api/regional-offices` (SUPER_ADMIN) — body: `{ name, code, district, address, lat, lng }`
- `PUT /api/regional-offices/:id` (SUPER_ADMIN)
- `DELETE /api/regional-offices/:id` (SUPER_ADMIN)

---

### 12. Admin Panel — Industries (`/admin/industries`)

Table with status filter (ACTIVE/INACTIVE/SUSPENDED). Status shown as colored badges.

**Table columns**: Name, Type, Registration No, Status, Actions
**Create modal**: Regional Office dropdown + Name, Type, Registration No, Lat, Lng
**Status update modal**: Status dropdown

**APIs**:
- `GET /api/industries?status=ACTIVE` (Auth)
- `POST /api/industries` (SUPER_ADMIN/REGIONAL_OFFICER) — body: `{ name, type, registrationNo, lat, lng, regionId }`
- `PUT /api/industries/:id` (SUPER_ADMIN/REGIONAL_OFFICER) — body: `{ status }`

---

### 13. Admin Panel — Water Sources (`/admin/water-sources`)

Simple table + create modal.

**Table columns**: Name, Type
**Create modal**: Regional Office dropdown, Name, Type (River/Lake/Groundwater), Lat, Lng

**APIs**:
- `GET /api/water-sources` (Auth)
- `POST /api/water-sources` (SUPER_ADMIN/REGIONAL_OFFICER) — body: `{ name, type, lat, lng, regionId }`

---

### 14. Admin Panel — Monitoring Locations (`/admin/locations`)

Table with type filter (AIR/WATER/NOISE). Type shown as colored badge.

**Table columns**: Name, Type (badge), ID (monospace)
**Create modal**: Regional Office dropdown, Name, Type dropdown, Lat, Lng

**APIs**:
- `GET /api/monitoring-locations?type=AIR` (Auth)
- `POST /api/monitoring-locations` (SUPER_ADMIN/REGIONAL_OFFICER) — body: `{ name, type, lat, lng, regionId }`

---

### 15. Admin Panel — Prescribed Limits (`/admin/limits`)

**Read-only table** (no create/edit in UI).

**Table columns**: Parameter, Min, Max, Category, Unit (name + symbol), Parameter Type

**API**: `GET /api/prescribed-limits` (Auth) — returns array with `unit: { name, symbol, parameterType }`

---

### 16. Admin Panel — Monitoring Units (`/admin/units`)

**Read-only table**.

**Table columns**: Name, Symbol, Parameter Type

**API**: `GET /api/monitoring-units` (Auth)

---

## SIDEBAR NAVIGATION

```
PRITHVINET LOGO

PUBLIC PORTAL
  ├─ Overview        → /dashboard
  ├─ Pollution Map   → /map
  ├─ Forecasting     → /forecast
  └─ Live Alerts     → /alerts-panel

MONITORING DATA
  ├─ Air Quality     → /monitoring/air
  ├─ Water Quality   → /monitoring/water
  ├─ Noise Level     → /monitoring/noise
  └─ Alerts Mgmt     → /alerts

ADMIN PANEL (only if role is SUPER_ADMIN / REGIONAL_OFFICER / MONITORING_TEAM)
  ├─ Offices         → /admin/offices
  ├─ Industries      → /admin/industries
  ├─ Water Sources   → /admin/water-sources
  ├─ Mon. Locations  → /admin/locations
  ├─ Limits          → /admin/limits
  └─ Units           → /admin/units

─── Bottom ───
  User avatar + name + role (click → /profile)
  Logout button
  OR "Sign In" button if not logged in
```

## ROLE-BASED ACCESS

| Role | Can view data | Can submit | Can manage alerts | Admin panel |
|------|:---:|:---:|:---:|:---:|
| CITIZEN | ✅ | ❌ | ❌ | ❌ |
| INDUSTRY_USER | ✅ | ❌ | ❌ | ❌ |
| MONITORING_TEAM | ✅ | ✅ | ❌ | ✅ (read) |
| REGIONAL_OFFICER | ✅ | ✅ | ✅ | ✅ (read+write) |
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ (full CRUD) |

## AUTH FLOW

1. Token stored in `localStorage` as `prithvinet_token`
2. On app load, if token exists, call `GET /api/auth/me` to validate and hydrate user state
3. If no token or /me fails, show "Sign In" button in sidebar but still allow public pages (dashboard, map, alerts-panel, forecast)
4. Authenticated endpoints return 401 if no/invalid token

## DATABASE SCHEMA (for reference)

All IDs are UUIDs. Enums:
- Role: SUPER_ADMIN, REGIONAL_OFFICER, MONITORING_TEAM, INDUSTRY_USER, CITIZEN
- ParameterType: AIR, WATER, NOISE
- IndustryStatus: ACTIVE, INACTIVE, SUSPENDED
- AlertSeverity: INFO, WARNING, CRITICAL
- AlertStatus: ACTIVE, ACKNOWLEDGED, RESOLVED

Models: User, RegionalOffice, Industry, WaterSource, MonitoringLocation, MonitoringUnit, PrescribedLimit, AirData, WaterData, NoiseData, Alert

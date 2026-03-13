#!/usr/bin/env node
// PrithviNet Interactive CLI
// Run: node cli.js

import 'dotenv/config';
import * as readline from 'readline';

const BASE = `http://localhost:${process.env.PORT || 3001}/api`;
let SESSION = { token: null, user: null };

// ─── HTTP helper ─────────────────────────────────────────
async function api(method, path, body, token = SESSION.token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'Connection refused — is the server running on port ' + (process.env.PORT || 3001) + '?' } };
  }
}

// ─── readline helpers ─────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));
const press = () => ask('\n  Press ENTER to continue...');

// ─── display helpers ─────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', blue: '\x1b[34m', magenta: '\x1b[35m', white: '\x1b[37m'
};
const clr = () => process.stdout.write('\x1bc');

function banner() {
  console.log(`${C.green}${C.bold}
  ╔═══════════════════════════════════════════╗
  ║    🌿  P R I T H V I N E T  C L I  🌿    ║
  ║    Smart Environmental Monitoring          ║
  ╚═══════════════════════════════════════════╝${C.reset}`);
}

function header(title) {
  console.log(`\n${C.cyan}${C.bold}  ── ${title} ──${C.reset}`);
}

function ok(msg) { console.log(`  ${C.green}✓${C.reset} ${msg}`); }
function err(msg) { console.log(`  ${C.red}✗${C.reset} ${msg}`); }
function info(msg) { console.log(`  ${C.yellow}ℹ${C.reset} ${msg}`); }
function dim(msg) { console.log(`  ${C.dim}${msg}${C.reset}`); }
function sep() { console.log(`  ${C.dim}${'─'.repeat(50)}${C.reset}`); }

function printTable(items, fields) {
  if (!items || items.length === 0) { info('No items found.'); return; }
  items.forEach((item, i) => {
    console.log(`\n  ${C.bold}[${i + 1}]${C.reset}`);
    fields.forEach(([key, label]) => {
      const val = item[key];
      if (val !== undefined && val !== null && val !== '') {
        console.log(`      ${C.dim}${label}:${C.reset} ${val}`);
      }
    });
  });
}

function printResult(res) {
  if (res.ok) {
    ok(`HTTP ${res.status}`);
    if (res.data && typeof res.data === 'object') {
      const lines = JSON.stringify(res.data, null, 2).split('\n').slice(0, 30);
      lines.forEach(l => console.log(`  ${C.dim}${l}${C.reset}`));
    }
  } else {
    err(`HTTP ${res.status} — ${res.data?.error || res.data?.message || 'Unknown error'}`);
    if (res.data?.message) err(res.data.message);
  }
}

// ─── MENU RUNNER ─────────────────────────────────────────
async function menu(title, options) {
  while (true) {
    clr(); banner();
    if (SESSION.user) {
      console.log(`  ${C.magenta}Logged in as: ${C.bold}${SESSION.user.name}${C.reset} ${C.dim}(${SESSION.user.role})${C.reset}`);
    }
    header(title);
    console.log();
    options.forEach((o, i) => {
      if (o === null) { sep(); return; }
      console.log(`  ${C.cyan}${String(i + 1).padStart(2)}.${C.reset} ${o[0]}`);
    });
    console.log(`\n  ${C.cyan}  0.${C.reset} ${SESSION.user ? '← Back / Logout' : '← Exit'}`);
    console.log();
    const choice = await ask(`  ${C.bold}Choose:${C.reset} `);
    const num = parseInt(choice);
    if (num === 0) return;
    const opt = options[num - 1];
    if (opt && opt !== null && opt[1]) {
      clr(); banner();
      if (SESSION.user) console.log(`  ${C.magenta}${SESSION.user.name}${C.reset} ${C.dim}(${SESSION.user.role})${C.reset}`);
      await opt[1]();
    }
  }
}

// ─── AUTH ─────────────────────────────────────────────────
async function login() {
  header('LOGIN');
  const email = await ask('  Email: ');
  const password = await ask('  Password: ');

  const res = await api('POST', '/auth/login', { email, password }, null);
  if (res.ok) {
    SESSION.token = res.data.token;
    SESSION.user = res.data.user;
    ok(`Welcome, ${SESSION.user.name}! (${SESSION.user.role})`);
    await press();
    await mainMenu();
  } else {
    err(res.data?.error || 'Login failed');
    await press();
  }
}

async function register() {
  header('REGISTER NEW USER');
  const name = await ask('  Name: ');
  const email = await ask('  Email: ');
  const password = await ask('  Password (min 6 chars): ');
  console.log(`\n  Roles: CITIZEN, INDUSTRY_USER, MONITORING_TEAM, REGIONAL_OFFICER, SUPER_ADMIN`);
  const role = (await ask('  Role (default CITIZEN): ')).trim() || 'CITIZEN';

  const res = await api('POST', '/auth/register', { name, email, password, role }, null);
  if (res.ok) {
    SESSION.token = res.data.token;
    SESSION.user = res.data.user;
    ok(`Registered and logged in as ${SESSION.user.name}`);
    await press();
    await mainMenu();
  } else {
    err(res.data?.error || 'Registration failed');
    await press();
  }
}

async function myProfile() {
  header('MY PROFILE');
  const res = await api('GET', '/auth/me');
  if (res.ok) {
    const u = res.data;
    ok('Profile loaded');
    console.log(`\n  ${C.bold}Name:${C.reset}     ${u.name}`);
    console.log(`  ${C.bold}Email:${C.reset}    ${u.email}`);
    console.log(`  ${C.bold}Role:${C.reset}     ${C.yellow}${u.role}${C.reset}`);
    console.log(`  ${C.bold}Phone:${C.reset}    ${u.phone || '—'}`);
    console.log(`  ${C.bold}Region:${C.reset}   ${u.region?.name || '—'}`);
    console.log(`  ${C.bold}Industry:${C.reset} ${u.industry?.name || '—'}`);
    console.log(`  ${C.bold}Joined:${C.reset}   ${new Date(u.createdAt).toLocaleDateString()}`);
  } else err(res.data?.error);
  await press();
}

// ─── PUBLIC PORTAL ────────────────────────────────────────
async function publicPortal() {
  await menu('PUBLIC PORTAL (No login required)', [
    ['📊 Dashboard Overview', publicOverview],
    ['🗂  Regional Offices Map', publicOffices],
    ['🚨 Active Public Alerts', publicAlerts],
    ['🗺  Map Data — Air', () => publicMapData('air')],
    ['🗺  Map Data — Water', () => publicMapData('water')],
    ['🗺  Map Data — Noise', () => publicMapData('noise')],
    ['📈 Trend Data (pick location)', publicTrend],
  ]);
}

async function publicOverview() {
  header('DASHBOARD OVERVIEW');
  const res = await api('GET', '/public/overview', null, null);
  if (res.ok) {
    const { stats, latestReadings } = res.data;
    console.log(`\n  ${C.bold}Platform Stats:${C.reset}`);
    console.log(`    Monitoring Locations : ${C.cyan}${stats.totalLocations}${C.reset}`);
    console.log(`    Active Industries    : ${C.cyan}${stats.totalIndustries}${C.reset}`);
    console.log(`    Regional Offices     : ${C.cyan}${stats.totalRegions}${C.reset}`);
    console.log(`    Active Alerts        : ${C.red}${stats.activeAlerts}${C.reset}`);
    console.log(`\n  ${C.bold}Latest Readings:${C.reset}`);
    if (latestReadings.air) {
      const a = latestReadings.air;
      console.log(`    🌬  Air @ ${a.location?.name}: AQI=${C.yellow}${a.aqi?.toFixed(1) || '—'}${C.reset}, PM2.5=${a.pm25?.toFixed(1) || '—'} µg/m³`);
    }
    if (latestReadings.water) {
      const w = latestReadings.water;
      console.log(`    💧 Water @ ${w.location?.name}: pH=${C.cyan}${w.ph?.toFixed(2) || '—'}${C.reset}, TDS=${w.tds?.toFixed(1) || '—'} mg/L`);
    }
    if (latestReadings.noise) {
      const n = latestReadings.noise;
      console.log(`    🔊 Noise @ ${n.location?.name}: Laeq=${C.magenta}${n.laeq?.toFixed(1) || '—'}${C.reset} dB(A)`);
    }
  } else err(res.data?.error);
  await press();
}

async function publicOffices() {
  header('REGIONAL OFFICES');
  const res = await api('GET', '/public/regional-offices', null, null);
  if (res.ok) {
    printTable(res.data, [
      ['name', 'Name'], ['code', 'Code'], ['district', 'District'], ['state', 'State'],
      ['address', 'Address']
    ]);
    res.data.forEach((o, i) => {
      console.log(`      Industries: ${o._count?.industries}, Locations: ${o._count?.monitoringLocations}`);
    });
  } else err(res.data?.error);
  await press();
}

async function publicAlerts() {
  header('ACTIVE PUBLIC ALERTS');
  const res = await api('GET', '/public/alerts', null, null);
  if (res.ok && res.data.length > 0) {
    res.data.forEach((a, i) => {
      const color = a.severity === 'CRITICAL' ? C.red : a.severity === 'WARNING' ? C.yellow : C.dim;
      console.log(`\n  ${color}${C.bold}[${a.severity}]${C.reset} ${a.parameter} — ${a.message}`);
      console.log(`    Location: ${a.location?.name}  |  Type: ${a.type}  |  ${new Date(a.createdAt).toLocaleString()}`);
    });
  } else info('No active alerts');
  await press();
}

async function publicMapData(type) {
  header(`MAP DATA — ${type.toUpperCase()}`);
  const res = await api('GET', `/public/map-data/${type}`, null, null);
  if (res.ok) {
    res.data.forEach(loc => {
      const r = loc.latestReading;
      console.log(`\n  ${C.bold}${loc.name}${C.reset} ${C.dim}(${loc.region?.name})${C.reset}`);
      console.log(`    Coords: ${loc.lat}, ${loc.lng}`);
      if (r) {
        if (type === 'air')   console.log(`    AQI: ${C.yellow}${r.aqi?.toFixed(1) || '—'}${C.reset} | PM2.5: ${r.pm25?.toFixed(1)} | PM10: ${r.pm10?.toFixed(1)} | NO2: ${r.no2?.toFixed(1)}`);
        if (type === 'water') console.log(`    pH: ${C.cyan}${r.ph?.toFixed(2) || '—'}${C.reset} | TDS: ${r.tds?.toFixed(1)} | Turbidity: ${r.turbidity?.toFixed(2)} | DO: ${r.dissolvedOxygen?.toFixed(2)}`);
        if (type === 'noise') console.log(`    Laeq: ${C.magenta}${r.laeq?.toFixed(1) || '—'}${C.reset} dB(A) | Lmax: ${r.lmax?.toFixed(1)} | Lmin: ${r.lmin?.toFixed(1)}`);
        console.log(`    ${C.dim}${new Date(r.timestamp).toLocaleString()}${C.reset}`);
      } else info('No readings yet');
    });
  } else err(res.data?.error);
  await press();
}

async function publicTrend() {
  header('TREND DATA');
  const locRes = await api('GET', '/monitoring-locations');
  if (!locRes.ok) { err('Need to be logged in to list locations'); await press(); return; }
  printTable(locRes.data, [['name', 'Name'], ['type', 'Type']]);
  const pick = parseInt(await ask(`\n  Pick location number: `)) - 1;
  const loc = locRes.data[pick];
  if (!loc) { err('Invalid choice'); await press(); return; }
  const days = (await ask('  Days of history (default 7): ')).trim() || '7';
  const type = loc.type.toLowerCase();
  const res = await api('GET', `/public/trend/${type}/${loc.id}?days=${days}`, null, null);
  if (res.ok) {
    ok(`${res.data.length} data points for ${loc.name}`);
    res.data.slice(-10).forEach(d => {
      const ts = new Date(d.timestamp).toLocaleString();
      if (type === 'air')   console.log(`  ${C.dim}${ts}${C.reset}  AQI: ${C.yellow}${d.aqi?.toFixed(1) || '—'}${C.reset}  PM2.5: ${d.pm25?.toFixed(1)}`);
      if (type === 'water') console.log(`  ${C.dim}${ts}${C.reset}  pH: ${C.cyan}${d.ph?.toFixed(2) || '—'}${C.reset}  TDS: ${d.tds?.toFixed(1)}`);
      if (type === 'noise') console.log(`  ${C.dim}${ts}${C.reset}  Laeq: ${C.magenta}${d.laeq?.toFixed(1) || '—'}${C.reset} dB(A)`);
    });
    if (res.data.length > 10) info(`(showing last 10 of ${res.data.length})`);
  } else err(res.data?.error);
  await press();
}

// ─── MONITORING DATA ─────────────────────────────────────
async function viewMonitoringData() {
  await menu('MONITORING DATA', [
    ['🌬  View Air Quality Data', () => viewData('air')],
    ['💧 View Water Quality Data', () => viewData('water')],
    ['🔊 View Noise Data', () => viewData('noise')],
    null,
    ['➕ Submit Air Data (MONITORING_TEAM)', () => submitData('air')],
    ['➕ Submit Water Data (MONITORING_TEAM)', () => submitData('water')],
    ['➕ Submit Noise Data (MONITORING_TEAM)', () => submitData('noise')],
  ]);
}

async function viewData(type) {
  header(`${type.toUpperCase()} DATA`);
  const limit = (await ask('  How many records? (default 10): ')).trim() || '10';
  const filterLoc = await ask('  Filter by location ID? (leave blank for all): ');
  let path = `/monitoring/${type}?limit=${limit}`;
  if (filterLoc.trim()) path += `&locationId=${filterLoc.trim()}`;
  const res = await api('GET', path);
  if (res.ok) {
    ok(`${res.data.length} records`);
    res.data.forEach(d => {
      const ts = new Date(d.timestamp).toLocaleString();
      console.log(`\n  ${C.dim}${ts}${C.reset}  ${C.bold}${d.location?.name}${C.reset} (by ${d.submittedBy?.name})`);
      if (type === 'air')   console.log(`    AQI: ${C.yellow}${d.aqi?.toFixed(1) || '—'}${C.reset} | PM2.5: ${d.pm25?.toFixed(1)} | PM10: ${d.pm10?.toFixed(1)} | NO2: ${d.no2?.toFixed(1)} | SO2: ${d.so2?.toFixed(1)}`);
      if (type === 'water') console.log(`    pH: ${C.cyan}${d.ph?.toFixed(2) || '—'}${C.reset} | TDS: ${d.tds?.toFixed(1)} | Turbidity: ${d.turbidity?.toFixed(2)} | DO: ${d.dissolvedOxygen?.toFixed(2)} | BOD: ${d.bod?.toFixed(1)}`);
      if (type === 'noise') console.log(`    Laeq: ${C.magenta}${d.laeq?.toFixed(1) || '—'}${C.reset} dB(A) | Lmax: ${d.lmax?.toFixed(1)} | Lmin: ${d.lmin?.toFixed(1)}`);
    });
  } else err(res.data?.error || res.data?.message);
  await press();
}

async function submitData(type) {
  header(`SUBMIT ${type.toUpperCase()} DATA`);
  const locRes = await api('GET', `/monitoring-locations?type=${type.toUpperCase()}`);
  if (!locRes.ok) { err('Failed to fetch locations'); await press(); return; }
  printTable(locRes.data, [['id', 'ID'], ['name', 'Name']]);
  const pick = parseInt(await ask('\n  Pick location number: ')) - 1;
  const loc = locRes.data[pick];
  if (!loc) { err('Invalid choice'); await press(); return; }

  let body = { locationId: loc.id };

  if (type === 'air') {
    console.log(`\n  ${C.dim}(leave blank to skip a parameter)${C.reset}`);
    const pm25 = await ask('  PM2.5 (µg/m³): ');
    const pm10 = await ask('  PM10 (µg/m³): ');
    const no2  = await ask('  NO2 (ppb): ');
    const so2  = await ask('  SO2 (ppb): ');
    const co   = await ask('  CO: ');
    const o3   = await ask('  O3 (ppb): ');
    const aqi  = await ask('  AQI: ');
    if (pm25) body.pm25 = parseFloat(pm25);
    if (pm10) body.pm10 = parseFloat(pm10);
    if (no2)  body.no2  = parseFloat(no2);
    if (so2)  body.so2  = parseFloat(so2);
    if (co)   body.co   = parseFloat(co);
    if (o3)   body.o3   = parseFloat(o3);
    if (aqi)  body.aqi  = parseFloat(aqi);
  } else if (type === 'water') {
    const ph  = await ask('  pH: ');
    const tds = await ask('  TDS (mg/L): ');
    const tur = await ask('  Turbidity (NTU): ');
    const dox = await ask('  Dissolved Oxygen (mg/L): ');
    const bod = await ask('  BOD (mg/L): ');
    const cod = await ask('  COD (mg/L): ');
    if (ph)  body.ph  = parseFloat(ph);
    if (tds) body.tds = parseFloat(tds);
    if (tur) body.turbidity = parseFloat(tur);
    if (dox) body.dissolvedOxygen = parseFloat(dox);
    if (bod) body.bod = parseFloat(bod);
    if (cod) body.cod = parseFloat(cod);
  } else if (type === 'noise') {
    const laeq = await ask('  Laeq — equivalent continuous level (dB(A)): ');
    const lmax = await ask('  Lmax — maximum level (dB(A)): ');
    const lmin = await ask('  Lmin — minimum level (dB(A)): ');
    if (laeq) body.laeq = parseFloat(laeq);
    if (lmax) body.lmax = parseFloat(lmax);
    if (lmin) body.lmin = parseFloat(lmin);
  }

  const res = await api('POST', `/monitoring/${type}`, body);
  if (res.ok) {
    ok(`Data submitted successfully to "${loc.name}"`);
    if (res.data.alertsGenerated > 0) {
      console.log(`  ${C.red}🚨 ${res.data.alertsGenerated} alert(s) automatically generated!${C.reset}`);
    } else info('No limit breaches — no alerts generated.');
  } else err(res.data?.error || res.data?.message);
  await press();
}

// ─── ALERTS ───────────────────────────────────────────────
async function manageAlerts() {
  header('ALERTS');
  console.log(`\n  Filter options:`);
  console.log(`  ${C.dim}Status: ACTIVE, ACKNOWLEDGED, RESOLVED${C.reset}`);
  console.log(`  ${C.dim}Severity: INFO, WARNING, CRITICAL${C.reset}`);
  const status   = (await ask('  Status filter (blank = all): ')).trim();
  const severity = (await ask('  Severity filter (blank = all): ')).trim();
  let path = `/alerts?limit=20`;
  if (status)   path += `&status=${status}`;
  if (severity) path += `&severity=${severity}`;

  const res = await api('GET', path);
  if (!res.ok) { err(res.data?.error); await press(); return; }

  if (res.data.length === 0) { info('No alerts matched.'); await press(); return; }

  res.data.forEach((a, i) => {
    const color = a.severity === 'CRITICAL' ? C.red : a.severity === 'WARNING' ? C.yellow : C.dim;
    const scolor = a.status === 'ACTIVE' ? C.red : a.status === 'ACKNOWLEDGED' ? C.yellow : C.green;
    console.log(`\n  ${C.bold}[${i + 1}]${C.reset} ${color}${a.severity}${C.reset} — ${C.bold}${a.parameter}${C.reset}`);
    console.log(`       ${a.message}`);
    console.log(`       Location: ${a.location?.name}  |  Status: ${scolor}${a.status}${C.reset}  |  ${new Date(a.createdAt).toLocaleString()}`);
  });

  const role = SESSION.user?.role;
  if (role === 'SUPER_ADMIN' || role === 'REGIONAL_OFFICER') {
    const pick = parseInt(await ask(`\n  Pick alert number to action (0 to skip): `)) - 1;
    if (pick >= 0 && res.data[pick]) {
      const alert = res.data[pick];
      const action = await ask(`  Action: [a]cknowledge / [r]esolve: `);
      let actionPath = null;
      if (action === 'a') actionPath = `/alerts/${alert.id}/acknowledge`;
      if (action === 'r') actionPath = `/alerts/${alert.id}/resolve`;
      if (actionPath) {
        const ar = await api('PUT', actionPath, {});
        if (ar.ok) ok(`Alert ${action === 'a' ? 'acknowledged' : 'resolved'}`);
        else err(ar.data?.error || ar.data?.message);
      }
    }
  } else info('Only SUPER_ADMIN or REGIONAL_OFFICER can acknowledge/resolve alerts.');
  await press();
}

// ─── ADMIN PANEL ─────────────────────────────────────────
async function adminPanel() {
  await menu('ADMIN PANEL', [
    ['🏢 Manage Regional Offices', manageOffices],
    ['🏭 Manage Industries', manageIndustries],
    ['💧 Manage Water Sources', manageWaterSources],
    ['📍 Manage Monitoring Locations', manageMonitoringLocations],
    ['📏 View Prescribed Limits', viewPrescribedLimits],
    ['🔬 View Monitoring Units', viewMonitoringUnits],
  ]);
}

async function listAndPick(path, fields, label) {
  const res = await api('GET', path);
  if (!res.ok) { err(res.data?.error); return null; }
  printTable(res.data, fields);
  if (res.data.length === 0) return null;
  const pick = parseInt(await ask(`\n  Pick ${label} number (0 to cancel): `)) - 1;
  if (pick < 0 || !res.data[pick]) return null;
  return res.data[pick];
}

async function manageOffices() {
  await menu('REGIONAL OFFICES', [
    ['📋 List all', async () => {
      header('REGIONAL OFFICES');
      const res = await api('GET', '/regional-offices');
      if (res.ok) printTable(res.data, [['name','Name'],['code','Code'],['district','District'],['address','Address']]);
      else err(res.data?.error);
      await press();
    }],
    ['➕ Create new', async () => {
      header('CREATE REGIONAL OFFICE');
      const name = await ask('  Name: ');
      const code = await ask('  Code (e.g. RO-XYZ): ');
      const district = await ask('  District: ');
      const address = await ask('  Address: ');
      const lat = await ask('  Latitude: ');
      const lng = await ask('  Longitude: ');
      const res = await api('POST', '/regional-offices', { name, code, district, address, lat: parseFloat(lat), lng: parseFloat(lng) });
      printResult(res);
      await press();
    }],
    ['✏️  Update', async () => {
      header('UPDATE REGIONAL OFFICE');
      const item = await listAndPick('/regional-offices', [['name','Name'],['code','Code']], 'office');
      if (!item) { await press(); return; }
      const name = await ask(`  New name (${item.name}): `);
      const address = await ask(`  New address (${item.address || '—'}): `);
      const body = {};
      if (name.trim()) body.name = name.trim();
      if (address.trim()) body.address = address.trim();
      const res = await api('PUT', `/regional-offices/${item.id}`, body);
      printResult(res);
      await press();
    }],
    ['🗑  Delete', async () => {
      header('DELETE REGIONAL OFFICE');
      const item = await listAndPick('/regional-offices', [['name','Name'],['code','Code']], 'office');
      if (!item) { await press(); return; }
      const confirm = await ask(`  Delete "${item.name}"? (yes/no): `);
      if (confirm !== 'yes') { info('Cancelled'); await press(); return; }
      const res = await fetch(`${BASE}/regional-offices/${item.id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${SESSION.token}` }
      });
      res.ok ? ok('Deleted') : err('Delete failed');
      await press();
    }],
  ]);
}

async function manageIndustries() {
  await menu('INDUSTRIES', [
    ['📋 List all', async () => {
      header('INDUSTRIES');
      const res = await api('GET', '/industries');
      if (res.ok) printTable(res.data, [['name','Name'],['type','Type'],['registrationNo','Reg. No'],['status','Status']]);
      else err(res.data?.error);
      await press();
    }],
    ['📋 Filter by status', async () => {
      header('FILTER INDUSTRIES');
      const status = await ask('  Status (ACTIVE/INACTIVE/SUSPENDED): ');
      const res = await api('GET', `/industries?status=${status.trim()}`);
      if (res.ok) printTable(res.data, [['name','Name'],['type','Type'],['status','Status']]);
      else err(res.data?.error);
      await press();
    }],
    ['➕ Create new', async () => {
      header('CREATE INDUSTRY');
      const officeRes = await api('GET', '/regional-offices');
      printTable(officeRes.data, [['name','Name'],['code','Code']]);
      const pick = parseInt(await ask('  Pick regional office number: ')) - 1;
      const region = officeRes.data[pick];
      if (!region) { err('Invalid choice'); await press(); return; }
      const name = await ask('  Industry name: ');
      const type = await ask('  Industry type: ');
      const registrationNo = await ask('  Registration number: ');
      const lat = await ask('  Latitude: ');
      const lng = await ask('  Longitude: ');
      const res = await api('POST', '/industries', { name, type, registrationNo, lat: parseFloat(lat), lng: parseFloat(lng), regionId: region.id });
      printResult(res);
      await press();
    }],
    ['✏️  Update status', async () => {
      header('UPDATE INDUSTRY STATUS');
      const item = await listAndPick('/industries', [['name','Name'],['status','Status']], 'industry');
      if (!item) { await press(); return; }
      const status = await ask('  New status (ACTIVE/INACTIVE/SUSPENDED): ');
      const res = await api('PUT', `/industries/${item.id}`, { status: status.trim() });
      printResult(res);
      await press();
    }],
  ]);
}

async function manageWaterSources() {
  await menu('WATER SOURCES', [
    ['📋 List all', async () => {
      header('WATER SOURCES');
      const res = await api('GET', '/water-sources');
      if (res.ok) printTable(res.data, [['name','Name'],['type','Type']]);
      else err(res.data?.error);
      await press();
    }],
    ['➕ Create new', async () => {
      header('CREATE WATER SOURCE');
      const officeRes = await api('GET', '/regional-offices');
      printTable(officeRes.data, [['name','Name']]);
      const pick = parseInt(await ask('  Pick regional office: ')) - 1;
      const region = officeRes.data[pick];
      if (!region) { err('Invalid'); await press(); return; }
      const name = await ask('  Name: ');
      const type = await ask('  Type (River/Lake/Groundwater/...): ');
      const lat  = await ask('  Latitude: ');
      const lng  = await ask('  Longitude: ');
      const res = await api('POST', '/water-sources', { name, type, lat: parseFloat(lat), lng: parseFloat(lng), regionId: region.id });
      printResult(res);
      await press();
    }],
  ]);
}

async function manageMonitoringLocations() {
  await menu('MONITORING LOCATIONS', [
    ['📋 List all', async () => {
      header('MONITORING LOCATIONS');
      const res = await api('GET', '/monitoring-locations');
      if (res.ok) printTable(res.data, [['name','Name'],['type','Type'],['id','ID']]);
      else err(res.data?.error);
      await press();
    }],
    ['📋 Filter by type', async () => {
      const type = await ask('  Type (AIR/WATER/NOISE): ');
      const res = await api('GET', `/monitoring-locations?type=${type.trim().toUpperCase()}`);
      if (res.ok) printTable(res.data, [['name','Name'],['type','Type'],['id','ID']]);
      else err(res.data?.error);
      await press();
    }],
    ['➕ Create new', async () => {
      header('CREATE MONITORING LOCATION');
      const officeRes = await api('GET', '/regional-offices');
      printTable(officeRes.data, [['name','Name']]);
      const pick = parseInt(await ask('  Pick regional office: ')) - 1;
      const region = officeRes.data[pick];
      if (!region) { err('Invalid'); await press(); return; }
      const name = await ask('  Name: ');
      const type = await ask('  Type (AIR/WATER/NOISE): ');
      const lat  = await ask('  Latitude: ');
      const lng  = await ask('  Longitude: ');
      const res = await api('POST', '/monitoring-locations', { name, type: type.trim().toUpperCase(), lat: parseFloat(lat), lng: parseFloat(lng), regionId: region.id });
      printResult(res);
      await press();
    }],
  ]);
}

async function viewPrescribedLimits() {
  header('PRESCRIBED LIMITS');
  const res = await api('GET', '/prescribed-limits');
  if (res.ok) {
    printTable(res.data, [['parameter','Parameter'],['minValue','Min'],['maxValue','Max'],['category','Category']]);
    res.data.forEach((l, i) => {
      console.log(`      Unit: ${l.unit?.name} (${l.unit?.symbol})  |  Type: ${l.unit?.parameterType}`);
    });
  } else err(res.data?.error);
  await press();
}

async function viewMonitoringUnits() {
  header('MONITORING UNITS');
  const res = await api('GET', '/monitoring-units');
  if (res.ok) printTable(res.data, [['name','Name'],['symbol','Symbol'],['parameterType','Type']]);
  else err(res.data?.error);
  await press();
}

// ─── MAIN MENU ───────────────────────────────────────────
async function mainMenu() {
  const role = SESSION.user?.role;
  const options = [
    ['👤 My Profile', myProfile],
    ['🌐 Public Portal', publicPortal],
    ['📊 Monitoring Data', viewMonitoringData],
    ['🚨 Alerts', manageAlerts],
    null,
  ];

  if (role === 'SUPER_ADMIN' || role === 'REGIONAL_OFFICER' || role === 'MONITORING_TEAM') {
    options.push(['⚙️  Admin Panel', adminPanel]);
  }

  options.push(['🔒 Logout', async () => {
    SESSION = { token: null, user: null };
    ok('Logged out.');
    await press();
  }]);

  await menu(`MAIN MENU`, options);
  SESSION = { token: null, user: null };
}

// ─── ENTRY POINT ─────────────────────────────────────────
async function main() {
  await menu('WELCOME', [
    ['🔑 Login', login],
    ['📝 Register new account', register],
    ['🌐 Browse Public Portal (no login)', publicPortal],
  ]);

  rl.close();
  process.exit(0);
}

main().catch(e => { console.error(e); rl.close(); process.exit(1); });

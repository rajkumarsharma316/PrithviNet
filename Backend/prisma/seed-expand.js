/**
 * Expanded Seed — Adds more regional offices, industries, monitoring teams,
 * stations, and 30 days of monitoring data across all of Chhattisgarh.
 *
 * Run with:  node --experimental-modules prisma/seed-expand.js
 *
 * Uses UPSERT on unique fields so it is safe to run multiple times.
 * All passwords are "password123".
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ─── helpers ──────────────────────────────────────────── */
const rand = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.round(rand(min, max));

async function main() {
  console.log("🌱  Expanded seed — populating Chhattisgarh…\n");

  const salt = await bcrypt.genSalt(10);
  const pw = await bcrypt.hash("password123", salt);

  // ──────────────────────────────────────────────────────
  // 1. Regional Offices  (upsert — safe to re-run)
  // ──────────────────────────────────────────────────────
  const officeData = [
    { name: "Raipur Regional Office",     code: "RO-RPR", lat: 21.2514, lng: 81.6296, district: "Raipur",     address: "CECB HQ, Civil Lines, Raipur" },
    { name: "Bilaspur Regional Office",   code: "RO-BSP", lat: 22.0797, lng: 82.1409, district: "Bilaspur",   address: "Vyapar Vihar, Bilaspur" },
    { name: "Korba Regional Office",      code: "RO-KRB", lat: 22.3595, lng: 82.6824, district: "Korba",      address: "Industrial Area, Korba" },
    { name: "Durg Regional Office",       code: "RO-DRG", lat: 21.1938, lng: 81.3509, district: "Durg",       address: "Sector 6, Bhilai" },
    { name: "Jagdalpur Regional Office",  code: "RO-JDP", lat: 19.0868, lng: 82.0208, district: "Bastar",     address: "Collectorate Road, Jagdalpur" },
    { name: "Ambikapur Regional Office",  code: "RO-AMP", lat: 23.1185, lng: 83.1989, district: "Surguja",    address: "Station Road, Ambikapur" },
    { name: "Raigarh Regional Office",    code: "RO-RGH", lat: 21.8974, lng: 83.3950, district: "Raigarh",    address: "Civil Lines, Raigarh" },
    { name: "Rajnandgaon Regional Office",code: "RO-RJN", lat: 21.0974, lng: 81.0281, district: "Rajnandgaon",address: "Bus Stand Road, Rajnandgaon" },
    { name: "Janjgir Regional Office",    code: "RO-JGR", lat: 21.8116, lng: 82.5656, district: "Janjgir-Champa", address: "Near Collectorate, Janjgir" },
    { name: "Mahasamund Regional Office", code: "RO-MSD", lat: 21.1125, lng: 82.0971, district: "Mahasamund", address: "NH-6, Mahasamund" },
  ];

  const offices = {};
  for (const o of officeData) {
    offices[o.code] = await prisma.regionalOffice.upsert({
      where: { code: o.code },
      update: { lat: o.lat, lng: o.lng, district: o.district },
      create: o,
    });
  }
  console.log(`  ✅  ${Object.keys(offices).length} Regional Offices`);

  // ──────────────────────────────────────────────────────
  // 2. Regional Officer users  (one per office)
  // ──────────────────────────────────────────────────────
  const officeUsers = {};
  for (const [code, office] of Object.entries(offices)) {
    const short = code.replace("RO-", "").toLowerCase();
    const email = `officer.${short}@prithvinet.gov.in`;
    officeUsers[code] = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: `${office.district} Regional Officer`,
        email,
        password: pw,
        role: "REGIONAL_OFFICER",
        regionId: office.id,
      },
    });
  }
  console.log(`  ✅  ${Object.keys(officeUsers).length} Regional Officer users`);

  // ──────────────────────────────────────────────────────
  // 3. Industries (3-5 per region, real CG industries)
  // ──────────────────────────────────────────────────────
  const industryData = [
    // Raipur
    { name: "Siltara Industrial Complex",       type: "Mixed Industrial",       reg: "CG-IND-003", lat: 21.31,   lng: 81.57,   code: "RO-RPR", status: "ACTIVE" },
    { name: "Raipur Cement Works",              type: "Cement Manufacturing",   reg: "CG-IND-010", lat: 21.28,   lng: 81.68,   code: "RO-RPR", status: "ACTIVE" },
    { name: "Mandhar Food Processing",          type: "Food Processing",        reg: "CG-IND-011", lat: 21.22,   lng: 81.60,   code: "RO-RPR", status: "PENDING" },
    // Durg
    { name: "Bhilai Steel Plant",               type: "Steel Manufacturing",    reg: "CG-IND-001", lat: 21.209,  lng: 81.3787, code: "RO-DRG", status: "ACTIVE" },
    { name: "Durg Iron & Alloys",               type: "Metal Processing",       reg: "CG-IND-012", lat: 21.18,   lng: 81.40,   code: "RO-DRG", status: "ACTIVE" },
    { name: "ACC Cement Jamul",                 type: "Cement Manufacturing",   reg: "CG-IND-013", lat: 21.23,   lng: 81.30,   code: "RO-DRG", status: "ACTIVE" },
    // Korba
    { name: "Korba Super Thermal Power Station",type: "Power Generation",       reg: "CG-IND-002", lat: 22.349,  lng: 82.69,   code: "RO-KRB", status: "ACTIVE" },
    { name: "BALCO Aluminium Smelter",          type: "Aluminium Smelting",     reg: "CG-IND-014", lat: 22.34,   lng: 82.72,   code: "RO-KRB", status: "ACTIVE" },
    { name: "Korba West Coal Mine",             type: "Coal Mining",            reg: "CG-IND-015", lat: 22.38,   lng: 82.65,   code: "RO-KRB", status: "SUSPENDED" },
    // Bilaspur
    { name: "South-East Coalfields HQ",         type: "Coal Mining",            reg: "CG-IND-016", lat: 22.08,   lng: 82.15,   code: "RO-BSP", status: "ACTIVE" },
    { name: "Bilaspur Rice Mills",              type: "Food Processing",        reg: "CG-IND-017", lat: 22.10,   lng: 82.12,   code: "RO-BSP", status: "ACTIVE" },
    { name: "Bilaspur Paper Mill",              type: "Paper Manufacturing",    reg: "CG-IND-018", lat: 22.06,   lng: 82.18,   code: "RO-BSP", status: "PENDING" },
    // Jagdalpur
    { name: "NMDC Iron Ore Mine Bailadila",     type: "Iron Ore Mining",        reg: "CG-IND-020", lat: 18.67,   lng: 81.24,   code: "RO-JDP", status: "ACTIVE" },
    { name: "Bastar Forestry Products",         type: "Forestry & Wood",        reg: "CG-IND-021", lat: 19.10,   lng: 82.03,   code: "RO-JDP", status: "ACTIVE" },
    { name: "Jagdalpur Agro Industries",        type: "Agriculture Processing", reg: "CG-IND-022", lat: 19.08,   lng: 81.98,   code: "RO-JDP", status: "ACTIVE" },
    // Ambikapur
    { name: "Surguja Coal Mine",                type: "Coal Mining",            reg: "CG-IND-030", lat: 23.15,   lng: 83.20,   code: "RO-AMP", status: "ACTIVE" },
    { name: "Ambikapur Timber Mill",            type: "Forestry & Wood",        reg: "CG-IND-031", lat: 23.11,   lng: 83.18,   code: "RO-AMP", status: "ACTIVE" },
    { name: "Surguja Minerals Ltd",             type: "Mineral Processing",     reg: "CG-IND-032", lat: 23.13,   lng: 83.22,   code: "RO-AMP", status: "PENDING" },
    // Raigarh
    { name: "Jindal Steel & Power Raigarh",     type: "Steel Manufacturing",    reg: "CG-IND-040", lat: 21.90,   lng: 83.40,   code: "RO-RGH", status: "ACTIVE" },
    { name: "Raigarh Thermal Power Station",    type: "Power Generation",       reg: "CG-IND-041", lat: 21.88,   lng: 83.38,   code: "RO-RGH", status: "ACTIVE" },
    { name: "Raigarh Coal Washery",             type: "Coal Processing",        reg: "CG-IND-042", lat: 21.92,   lng: 83.42,   code: "RO-RGH", status: "ACTIVE" },
    // Rajnandgaon
    { name: "Rajnandgaon Textiles",             type: "Textile Manufacturing",  reg: "CG-IND-050", lat: 21.10,   lng: 81.03,   code: "RO-RJN", status: "ACTIVE" },
    { name: "Dongargarh Cement Works",          type: "Cement Manufacturing",   reg: "CG-IND-051", lat: 21.19,   lng: 80.76,   code: "RO-RJN", status: "ACTIVE" },
    { name: "Rajnandgaon Agro Export",          type: "Food Processing",        reg: "CG-IND-052", lat: 21.08,   lng: 81.05,   code: "RO-RJN", status: "INACTIVE" },
    // Janjgir-Champa
    { name: "Champa Rice & Oil Mill",           type: "Food Processing",        reg: "CG-IND-060", lat: 21.97,   lng: 82.36,   code: "RO-JGR", status: "ACTIVE" },
    { name: "Janjgir Stone Crushers",           type: "Mining & Crushing",      reg: "CG-IND-061", lat: 21.82,   lng: 82.57,   code: "RO-JGR", status: "ACTIVE" },
    { name: "Akaltara Power Plant",             type: "Power Generation",       reg: "CG-IND-062", lat: 22.02,   lng: 82.43,   code: "RO-JGR", status: "ACTIVE" },
    // Mahasamund
    { name: "Mahasamund Sugar Factory",         type: "Sugar Processing",       reg: "CG-IND-070", lat: 21.11,   lng: 82.10,   code: "RO-MSD", status: "ACTIVE" },
    { name: "Mahasamund Rice Export",           type: "Food Processing",        reg: "CG-IND-071", lat: 21.12,   lng: 82.08,   code: "RO-MSD", status: "ACTIVE" },
  ];

  const industries = {};
  for (const ind of industryData) {
    industries[ind.reg] = await prisma.industry.upsert({
      where: { registrationNo: ind.reg },
      update: { status: ind.status, lat: ind.lat, lng: ind.lng },
      create: {
        name: ind.name,
        type: ind.type,
        registrationNo: ind.reg,
        lat: ind.lat,
        lng: ind.lng,
        regionId: offices[ind.code].id,
        status: ind.status,
      },
    });
  }
  console.log(`  ✅  ${Object.keys(industries).length} Industries`);

  // ──────────────────────────────────────────────────────
  // 4. Industry users (one per industry)
  // ──────────────────────────────────────────────────────
  let indUserCount = 0;
  for (const [reg, ind] of Object.entries(industries)) {
    const slug = ind.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);
    const email = `${slug}@industry.cg.in`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: `${ind.name} Manager`,
        email,
        password: pw,
        role: "INDUSTRY_USER",
        industryId: ind.id,
        regionId: ind.regionId || undefined,
      },
    });
    indUserCount++;
  }
  console.log(`  ✅  ${indUserCount} Industry users`);

  // ──────────────────────────────────────────────────────
  // 5. Monitoring Teams (2 per region)
  // ──────────────────────────────────────────────────────
  const monTeamUsers = {};
  let teamIdx = 0;
  for (const [code, office] of Object.entries(offices)) {
    const short = code.replace("RO-", "").toLowerCase();
    for (let t = 1; t <= 2; t++) {
      teamIdx++;
      const email = `team${teamIdx}@prithvinet.gov.in`;
      monTeamUsers[`${code}-T${t}`] = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          name: `${office.district} Field Team ${t === 1 ? "Alpha" : "Beta"}`,
          email,
          password: pw,
          role: "MONITORING_TEAM",
          regionId: office.id,
        },
      });
    }
  }
  console.log(`  ✅  ${Object.keys(monTeamUsers).length} Monitoring Team users`);

  // ──────────────────────────────────────────────────────
  // 6. Monitoring Locations (Air, Water, Noise per region)
  // ──────────────────────────────────────────────────────
  const locationDefs = [
    // Raipur
    { name: "Raipur City Center AQM",       type: "AIR",   lat: 21.2514, lng: 81.6296, code: "RO-RPR" },
    { name: "Siltara AQM",                  type: "AIR",   lat: 21.31,   lng: 81.57,   code: "RO-RPR" },
    { name: "Mahanadi River - Raipur",       type: "WATER", lat: 21.26,   lng: 81.65,   code: "RO-RPR" },
    { name: "Kharun River - Raipur",         type: "WATER", lat: 21.24,   lng: 81.62,   code: "RO-RPR" },
    { name: "Raipur Residential Zone",       type: "NOISE", lat: 21.245,  lng: 81.635,  code: "RO-RPR" },
    // Durg
    { name: "Bhilai Industrial AQM",         type: "AIR",   lat: 21.209,  lng: 81.3787, code: "RO-DRG" },
    { name: "Durg City AQM",                 type: "AIR",   lat: 21.19,   lng: 81.35,   code: "RO-DRG" },
    { name: "Shivnath River - Durg",         type: "WATER", lat: 21.18,   lng: 81.34,   code: "RO-DRG" },
    { name: "Bhilai Industrial Noise",       type: "NOISE", lat: 21.2,    lng: 81.37,   code: "RO-DRG" },
    // Korba
    { name: "Korba Power Plant AQM",         type: "AIR",   lat: 22.349,  lng: 82.69,   code: "RO-KRB" },
    { name: "Korba City AQM",               type: "AIR",   lat: 22.36,   lng: 82.68,   code: "RO-KRB" },
    { name: "Hasdeo River - Korba",          type: "WATER", lat: 22.35,   lng: 82.70,   code: "RO-KRB" },
    { name: "Korba Industrial Noise",        type: "NOISE", lat: 22.34,   lng: 82.69,   code: "RO-KRB" },
    // Bilaspur
    { name: "Bilaspur City AQM",             type: "AIR",   lat: 22.08,   lng: 82.15,   code: "RO-BSP" },
    { name: "Arpa River - Bilaspur",         type: "WATER", lat: 22.07,   lng: 82.13,   code: "RO-BSP" },
    { name: "Bilaspur Residential Noise",    type: "NOISE", lat: 22.09,   lng: 82.14,   code: "RO-BSP" },
    // Jagdalpur
    { name: "Jagdalpur City AQM",            type: "AIR",   lat: 19.09,   lng: 82.02,   code: "RO-JDP" },
    { name: "Bailadila Mining AQM",          type: "AIR",   lat: 18.67,   lng: 81.24,   code: "RO-JDP" },
    { name: "Indravati River - Jagdalpur",   type: "WATER", lat: 19.08,   lng: 82.00,   code: "RO-JDP" },
    { name: "Jagdalpur Town Noise",          type: "NOISE", lat: 19.09,   lng: 82.01,   code: "RO-JDP" },
    // Ambikapur
    { name: "Ambikapur City AQM",            type: "AIR",   lat: 23.12,   lng: 83.20,   code: "RO-AMP" },
    { name: "Renukoot River - Ambikapur",    type: "WATER", lat: 23.11,   lng: 83.19,   code: "RO-AMP" },
    { name: "Ambikapur Town Noise",          type: "NOISE", lat: 23.13,   lng: 83.21,   code: "RO-AMP" },
    // Raigarh
    { name: "Raigarh Industrial AQM",        type: "AIR",   lat: 21.90,   lng: 83.40,   code: "RO-RGH" },
    { name: "Raigarh City AQM",              type: "AIR",   lat: 21.89,   lng: 83.39,   code: "RO-RGH" },
    { name: "Kelo River - Raigarh",          type: "WATER", lat: 21.88,   lng: 83.38,   code: "RO-RGH" },
    { name: "Raigarh Industrial Noise",      type: "NOISE", lat: 21.91,   lng: 83.41,   code: "RO-RGH" },
    // Rajnandgaon
    { name: "Rajnandgaon City AQM",          type: "AIR",   lat: 21.10,   lng: 81.03,   code: "RO-RJN" },
    { name: "Shivnath River - Rajnandgaon",  type: "WATER", lat: 21.09,   lng: 81.01,   code: "RO-RJN" },
    { name: "Rajnandgaon Town Noise",        type: "NOISE", lat: 21.11,   lng: 81.04,   code: "RO-RJN" },
    // Janjgir
    { name: "Janjgir City AQM",              type: "AIR",   lat: 21.81,   lng: 82.57,   code: "RO-JGR" },
    { name: "Hasdeo River - Janjgir",        type: "WATER", lat: 21.80,   lng: 82.55,   code: "RO-JGR" },
    { name: "Champa Town Noise",             type: "NOISE", lat: 21.97,   lng: 82.36,   code: "RO-JGR" },
    // Mahasamund
    { name: "Mahasamund City AQM",           type: "AIR",   lat: 21.11,   lng: 82.10,   code: "RO-MSD" },
    { name: "Mahanadi River - Mahasamund",   type: "WATER", lat: 21.10,   lng: 82.08,   code: "RO-MSD" },
    { name: "Mahasamund Town Noise",         type: "NOISE", lat: 21.12,   lng: 82.11,   code: "RO-MSD" },
  ];

  const locations = {};
  for (const loc of locationDefs) {
    const key = `${loc.code}|${loc.name}`;
    const existing = await prisma.monitoringLocation.findFirst({
      where: { name: loc.name, regionId: offices[loc.code].id },
    });
    if (existing) {
      // Always set exact coords so stations have correct lat/lng
      locations[key] = await prisma.monitoringLocation.update({
        where: { id: existing.id },
        data: { lat: loc.lat, lng: loc.lng },
      });
    } else {
      locations[key] = await prisma.monitoringLocation.create({
        data: {
          name: loc.name,
          type: loc.type,
          lat: loc.lat,
          lng: loc.lng,
          regionId: offices[loc.code].id,
        },
      });
    }
  }
  console.log(`  ✅  ${Object.keys(locations).length} Monitoring Locations`);

  // ──────────────────────────────────────────────────────
  // 7. 30 days of monitoring data (4 readings/day per station)
  // ──────────────────────────────────────────────────────
  console.log("  ⏳  Generating 30 days of monitoring data (this takes a moment)…");

  const now = new Date();
  let airCount = 0, waterCount = 0, noiseCount = 0;

  // Check existing data count to avoid re-seeding
  const existingAir = await prisma.airData.count();
  if (existingAir > 500) {
    console.log(`  ⚠️  Already have ${existingAir} air data rows — skipping data generation.`);
  } else {
    // Batch inserts per day
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const airBatch = [];
      const waterBatch = [];
      const noiseBatch = [];

      for (const [key, loc] of Object.entries(locations)) {
        const code = key.split("|")[0];
        // pick the first monitoring team user for this region
        const teamUser = monTeamUsers[`${code}-T1`] || monTeamUsers[`${code}-T2`];
        if (!teamUser) continue;

        for (let hour of [8, 12, 16, 20]) {
          const ts = new Date(now);
          ts.setDate(ts.getDate() - dayOffset);
          ts.setHours(hour, randInt(0, 59), 0, 0);

          if (loc.type === "AIR") {
            // Realistic AQI ranges vary by region & industrial presence
            const baseAqi = code === "RO-KRB" ? 140 : code === "RO-DRG" ? 130 : code === "RO-RGH" ? 125 : 80;
            const aqi = baseAqi + rand(-30, 40) + (dayOffset < 5 ? rand(-10, 10) : 0);
            airBatch.push({
              pm25: rand(25, 90),
              pm10: rand(50, 160),
              no2: rand(10, 55),
              so2: rand(5, 30),
              co: rand(0.3, 2.5),
              o3: rand(15, 70),
              aqi: Math.max(20, Math.round(aqi)),
              timestamp: ts,
              locationId: loc.id,
              submittedById: teamUser.id,
            });
            airCount++;
          } else if (loc.type === "WATER") {
            waterBatch.push({
              ph: parseFloat(rand(6.2, 8.4).toFixed(1)),
              tds: rand(150, 550),
              turbidity: rand(0.5, 9),
              dissolvedOxygen: rand(3.5, 8.5),
              bod: rand(0.8, 6),
              cod: rand(4, 25),
              timestamp: ts,
              locationId: loc.id,
              submittedById: teamUser.id,
            });
            waterCount++;
          } else {
            const baseNoise = code === "RO-KRB" ? 72 : code === "RO-DRG" ? 70 : code === "RO-RGH" ? 68 : 55;
            const laeq = baseNoise + rand(-8, 12);
            noiseBatch.push({
              laeq: Math.round(laeq),
              lmax: Math.round(laeq + rand(8, 25)),
              lmin: Math.round(laeq - rand(10, 20)),
              timestamp: ts,
              locationId: loc.id,
              submittedById: teamUser.id,
            });
            noiseCount++;
          }
        }
      }

      // Bulk insert per day
      if (airBatch.length)   await prisma.airData.createMany({ data: airBatch });
      if (waterBatch.length) await prisma.waterData.createMany({ data: waterBatch });
      if (noiseBatch.length) await prisma.noiseData.createMany({ data: noiseBatch });
    }
    console.log(`  ✅  Monitoring data: ${airCount} air, ${waterCount} water, ${noiseCount} noise rows`);
  }

  // ──────────────────────────────────────────────────────
  // 8. Alerts (a few active alerts for realism)
  // ──────────────────────────────────────────────────────
  const alertDefs = [
    { code: "RO-KRB", locName: "Korba Power Plant AQM",   type: "AIR",   param: "PM2.5",  value: 145,  limit: 60,  sev: "CRITICAL", msg: "PM2.5 levels dangerously high near Korba thermal plant" },
    { code: "RO-DRG", locName: "Bhilai Industrial AQM",   type: "AIR",   param: "PM10",   value: 180,  limit: 100, sev: "WARNING",  msg: "PM10 exceeds safe limits near Bhilai Steel Plant" },
    { code: "RO-RGH", locName: "Raigarh Industrial AQM",  type: "AIR",   param: "SO2",    value: 95,   limit: 80,  sev: "WARNING",  msg: "SO2 levels elevated in Raigarh industrial area" },
    { code: "RO-RPR", locName: "Kharun River - Raipur",   type: "WATER", param: "pH",     value: 5.8,  limit: 6.5, sev: "WARNING",  msg: "pH level below prescribed limit in Kharun River" },
    { code: "RO-KRB", locName: "Hasdeo River - Korba",    type: "WATER", param: "TDS",    value: 620,  limit: 500, sev: "INFO",     msg: "TDS marginally above limit in Hasdeo River near Korba" },
    { code: "RO-DRG", locName: "Bhilai Industrial Noise",  type: "NOISE", param: "Laeq",   value: 88,   limit: 75,  sev: "CRITICAL", msg: "Noise levels severely exceed industrial limit in Bhilai" },
  ];

  for (const a of alertDefs) {
    const locKey = `${a.code}|${a.locName}`;
    const loc = locations[locKey];
    if (!loc) continue;
    // check if similar alert already exists
    const existing = await prisma.alert.findFirst({
      where: { locationId: loc.id, parameter: a.param, status: "ACTIVE" },
    });
    if (!existing) {
      await prisma.alert.create({
        data: {
          type: a.type,
          severity: a.sev,
          message: a.msg,
          parameter: a.param,
          value: a.value,
          limitValue: a.limit,
          status: "ACTIVE",
          locationId: loc.id,
        },
      });
    }
  }
  console.log(`  ✅  Alerts seeded`);

  // ──────────────────────────────────────────────────────
  // Done!
  // ──────────────────────────────────────────────────────
  console.log("\n🎉  Expanded seed complete!");
  console.log("\n📧  Login credentials (all passwords: password123):");
  console.log("   Super Admin:        admin@prithvinet.gov.in");
  for (const [code, office] of Object.entries(offices)) {
    const short = code.replace("RO-", "").toLowerCase();
    console.log(`   ${office.district.padEnd(18)} officer.${short}@prithvinet.gov.in`);
  }
  console.log("   Monitoring teams:   team1@prithvinet.gov.in … team20@prithvinet.gov.in");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

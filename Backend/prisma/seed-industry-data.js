/**
 * Seed 30 days of monitoring data for every industry that has
 * a linked MonitoringLocation.  For industries without one,
 * the script creates a location automatically.
 *
 * Run:  node prisma/seed-industry-data.js
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const rand = (min, max) => min + Math.random() * (max - min);

async function main() {
  console.log("🏭  Seeding 30-day industry monitoring data…\n");

  // Get all industries
  const industries = await prisma.industry.findMany({ include: { monitoringLocations: true } });
  console.log(`  Found ${industries.length} industries`);

  // Get a monitoring team user to attribute data to
  const teamUser = await prisma.user.findFirst({ where: { role: "MONITORING_TEAM" } });
  if (!teamUser) { console.error("No MONITORING_TEAM user found"); return; }

  const now = new Date();
  let airCount = 0, waterCount = 0, noiseCount = 0;

  for (const ind of industries) {
    // Ensure industry has AIR, WATER, NOISE monitoring locations
    let airLoc = ind.monitoringLocations.find((l) => l.type === "AIR");
    let waterLoc = ind.monitoringLocations.find((l) => l.type === "WATER");
    let noiseLoc = ind.monitoringLocations.find((l) => l.type === "NOISE");

    if (!airLoc) {
      airLoc = await prisma.monitoringLocation.create({
        data: { name: `${ind.name} AQM`, type: "AIR", lat: ind.lat + 0.001, lng: ind.lng + 0.001, regionId: ind.regionId, industryId: ind.id },
      });
    }
    if (!waterLoc) {
      waterLoc = await prisma.monitoringLocation.create({
        data: { name: `${ind.name} WQM`, type: "WATER", lat: ind.lat - 0.001, lng: ind.lng + 0.001, regionId: ind.regionId, industryId: ind.id },
      });
    }
    if (!noiseLoc) {
      noiseLoc = await prisma.monitoringLocation.create({
        data: { name: `${ind.name} NQM`, type: "NOISE", lat: ind.lat, lng: ind.lng - 0.001, regionId: ind.regionId, industryId: ind.id },
      });
    }

    // Determine base pollution levels by industry type
    const isHeavy = /steel|power|thermal|smelter|coal|iron|cement/i.test(ind.type + ind.name);
    const baseAqi = isHeavy ? 135 : 75;
    const baseNoise = isHeavy ? 72 : 55;

    // Generate 30 days × 4 readings/day
    const airBatch = [];
    const waterBatch = [];
    const noiseBatch = [];

    for (let d = 0; d < 30; d++) {
      for (const hour of [7, 11, 15, 19]) {
        const ts = new Date(now);
        ts.setDate(ts.getDate() - d);
        ts.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

        const aqi = Math.max(20, Math.round(baseAqi + rand(-25, 35) + (d < 3 ? rand(-5, 15) : 0)));
        airBatch.push({
          pm25: parseFloat(rand(20, 95).toFixed(1)),
          pm10: parseFloat(rand(45, 170).toFixed(1)),
          no2: parseFloat(rand(8, 55).toFixed(1)),
          so2: parseFloat(rand(4, 35).toFixed(1)),
          co: parseFloat(rand(0.3, 3.0).toFixed(2)),
          o3: parseFloat(rand(12, 65).toFixed(1)),
          aqi,
          timestamp: ts,
          locationId: airLoc.id,
          submittedById: teamUser.id,
        });
        airCount++;

        waterBatch.push({
          ph: parseFloat(rand(6.0, 8.6).toFixed(1)),
          tds: parseFloat(rand(140, 580).toFixed(0)),
          turbidity: parseFloat(rand(0.4, 9.5).toFixed(1)),
          dissolvedOxygen: parseFloat(rand(3.0, 8.8).toFixed(1)),
          bod: parseFloat(rand(0.6, 6.5).toFixed(1)),
          cod: parseFloat(rand(3, 28).toFixed(1)),
          timestamp: ts,
          locationId: waterLoc.id,
          submittedById: teamUser.id,
        });
        waterCount++;

        const laeq = Math.round(baseNoise + rand(-10, 14));
        noiseBatch.push({
          laeq,
          lmax: Math.round(laeq + rand(6, 22)),
          lmin: Math.round(Math.max(25, laeq - rand(8, 20))),
          timestamp: ts,
          locationId: noiseLoc.id,
          submittedById: teamUser.id,
        });
        noiseCount++;
      }
    }

    await prisma.airData.createMany({ data: airBatch });
    await prisma.waterData.createMany({ data: waterBatch });
    await prisma.noiseData.createMany({ data: noiseBatch });
    console.log(`  ✅  ${ind.name} — ${airBatch.length} air, ${waterBatch.length} water, ${noiseBatch.length} noise`);
  }

  console.log(`\n🎉  Done! Totals: ${airCount} air, ${waterCount} water, ${noiseCount} noise rows`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

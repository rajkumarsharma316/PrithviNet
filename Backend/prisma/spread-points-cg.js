/**
 * Spread all map points evenly across Chhattisgarh to fix cluttered markers.
 * Run: node prisma/spread-points-cg.js
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CG_LAT_MIN = 17.92;
const CG_LAT_MAX = 23.92;
const CG_LNG_MIN = 80.28;
const CG_LNG_MAX = 83.92;

function spreadPoints(n) {
  if (n <= 0) return [];
  const cols = Math.ceil(Math.sqrt(n * 1.4));
  const rows = Math.ceil(n / cols);
  const dLat = (CG_LAT_MAX - CG_LAT_MIN) / (rows + 1);
  const dLng = (CG_LNG_MAX - CG_LNG_MIN) / (cols + 1);
  const jitter = 0.12;
  const points = [];
  for (let r = 0; r < rows && points.length < n; r++) {
    for (let c = 0; c < cols && points.length < n; c++) {
      const lat = CG_LAT_MIN + dLat * (r + 1) + (Math.random() - 0.5) * 2 * jitter * dLat;
      const lng = CG_LNG_MIN + dLng * (c + 1) + (Math.random() - 0.5) * 2 * jitter * dLng;
      points.push({
        lat: Math.max(CG_LAT_MIN, Math.min(CG_LAT_MAX, lat)),
        lng: Math.max(CG_LNG_MIN, Math.min(CG_LNG_MAX, lng)),
      });
    }
  }
  return points.slice(0, n);
}

const BATCH = 20;

async function main() {
  console.log("📍 Spreading points across Chhattisgarh…\n");

  const offices = await prisma.regionalOffice.findMany({ orderBy: { code: "asc" } });
  const industries = await prisma.industry.findMany({ orderBy: { createdAt: "asc" } });
  const locations = await prisma.monitoringLocation.findMany({ orderBy: { createdAt: "asc" } });
  const waterSources = await prisma.waterSource.findMany({ orderBy: { createdAt: "asc" } });

  const total = offices.length + industries.length + locations.length + waterSources.length;
  const points = spreadPoints(total);
  let idx = 0;

  async function runBatched(items, updateOne) {
    for (let i = 0; i < items.length; i += BATCH) {
      const chunk = items.slice(i, i + BATCH);
      await Promise.all(chunk.map((item, j) => updateOne(item, points[idx + j])));
      idx += chunk.length;
    }
  }

  await runBatched(offices, (office, p) =>
    prisma.regionalOffice.update({ where: { id: office.id }, data: { lat: p.lat, lng: p.lng } })
  );
  console.log(`  ✅ ${offices.length} Regional Offices`);

  await runBatched(industries, (ind, p) =>
    prisma.industry.update({ where: { id: ind.id }, data: { lat: p.lat, lng: p.lng } })
  );
  console.log(`  ✅ ${industries.length} Industries`);

  await runBatched(locations, (loc, p) =>
    prisma.monitoringLocation.update({ where: { id: loc.id }, data: { lat: p.lat, lng: p.lng } })
  );
  console.log(`  ✅ ${locations.length} Monitoring Locations`);

  await runBatched(waterSources, (ws, p) =>
    prisma.waterSource.update({ where: { id: ws.id }, data: { lat: p.lat, lng: p.lng } })
  );
  if (waterSources.length) console.log(`  ✅ ${waterSources.length} Water Sources`);

  console.log("\n🎉 Points spread. Refresh the map.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

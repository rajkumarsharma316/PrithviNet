/**
 * Delete all map-related data and re-seed with exact coordinates from seed files.
 * Run from Backend folder: node prisma/reset-and-reseed.js
 *
 * 1. Deletes all data (respecting foreign keys)
 * 2. Runs seed.js (base offices, industries, locations, users, sample data)
 * 3. Runs seed-expand.js (more offices, industries, locations, 30 days data)
 * Result: All pins use the real lat/lng from the seed definitions.
 */
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const backendDir = path.resolve(__dirname, "..");

async function main() {
  console.log("🗑️  Resetting database (deleting all data)…\n");

  // Delete in dependency order (children first)
  await prisma.airData.deleteMany({});
  await prisma.waterData.deleteMany({});
  await prisma.noiseData.deleteMany();
  console.log("  AirData, WaterData, NoiseData");

  await prisma.alert.deleteMany({});
  console.log("  Alerts");

  await prisma.prescribedLimit.deleteMany({});
  await prisma.monitoringLocation.deleteMany({});
  console.log("  PrescribedLimit, MonitoringLocation");

  await prisma.monitoringUnit.deleteMany({});
  await prisma.industry.deleteMany({});
  await prisma.waterSource.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.regionalOffice.deleteMany({});
  console.log("  MonitoringUnit, Industry, WaterSource, User, RegionalOffice");

  console.log("\n✅ Database cleared.\n");
  console.log("🌱 Running seed.js…");
  execSync("node prisma/seed.js", { cwd: backendDir, stdio: "inherit" });
  console.log("\n🌱 Running seed-expand.js…");
  execSync("node prisma/seed-expand.js", { cwd: backendDir, stdio: "inherit" });
  console.log("\n📍 Applying exact coordinates for offices, industries & monitoring stations…");
  execSync("node prisma/restore-original-coordinates.js", { cwd: backendDir, stdio: "inherit" });
  console.log("\n🎉 Reset and re-seed complete. All pins (offices, industries, stations) use exact locations.");
  console.log("   Restart the backend and hard-refresh the map (Ctrl+Shift+R).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

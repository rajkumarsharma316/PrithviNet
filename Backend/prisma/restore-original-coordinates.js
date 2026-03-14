/**
 * Restore original coordinates for RegionalOffice, Industry, MonitoringLocation
 * after reverting the "spread points" changes. Run once: node prisma/restore-original-coordinates.js
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const OFFICE_COORDS = {
  "RO-RPR": { lat: 21.2514, lng: 81.6296 },
  "RO-BSP": { lat: 22.0797, lng: 82.1409 },
  "RO-KRB": { lat: 22.3595, lng: 82.6824 },
  "RO-DRG": { lat: 21.1938, lng: 81.3509 },
  "RO-JDP": { lat: 19.0868, lng: 82.0208 },
  "RO-AMP": { lat: 23.1185, lng: 83.1989 },
  "RO-RGH": { lat: 21.8974, lng: 83.3950 },
  "RO-RJN": { lat: 21.0974, lng: 81.0281 },
  "RO-JGR": { lat: 21.8116, lng: 82.5656 },
  "RO-MSD": { lat: 21.1125, lng: 82.0971 },
};

const INDUSTRY_COORDS = {
  "CG-IND-001": { lat: 21.209, lng: 81.3787 },
  "CG-IND-002": { lat: 22.349, lng: 82.69 },
  "CG-IND-003": { lat: 21.31, lng: 81.57 },
  "CG-IND-010": { lat: 21.28, lng: 81.68 },
  "CG-IND-011": { lat: 21.22, lng: 81.60 },
  "CG-IND-012": { lat: 21.18, lng: 81.40 },
  "CG-IND-013": { lat: 21.23, lng: 81.30 },
  "CG-IND-014": { lat: 22.34, lng: 82.72 },
  "CG-IND-015": { lat: 22.38, lng: 82.65 },
  "CG-IND-016": { lat: 22.08, lng: 82.15 },
  "CG-IND-017": { lat: 22.10, lng: 82.12 },
  "CG-IND-018": { lat: 22.06, lng: 82.18 },
  "CG-IND-020": { lat: 18.67, lng: 81.24 },
  "CG-IND-021": { lat: 19.10, lng: 82.03 },
  "CG-IND-022": { lat: 19.08, lng: 81.98 },
  "CG-IND-030": { lat: 23.15, lng: 83.20 },
  "CG-IND-031": { lat: 23.11, lng: 83.18 },
  "CG-IND-032": { lat: 23.13, lng: 83.22 },
  "CG-IND-040": { lat: 21.90, lng: 83.40 },
  "CG-IND-041": { lat: 21.88, lng: 83.38 },
  "CG-IND-042": { lat: 21.92, lng: 83.42 },
  "CG-IND-050": { lat: 21.10, lng: 81.03 },
  "CG-IND-051": { lat: 21.19, lng: 80.76 },
  "CG-IND-052": { lat: 21.08, lng: 81.05 },
  "CG-IND-060": { lat: 21.97, lng: 82.36 },
  "CG-IND-061": { lat: 21.82, lng: 82.57 },
  "CG-IND-062": { lat: 22.02, lng: 82.43 },
  "CG-IND-070": { lat: 21.11, lng: 82.10 },
  "CG-IND-071": { lat: 21.12, lng: 82.08 },
};

async function main() {
  console.log("Restoring original coordinates…\n");

  for (const [code, coords] of Object.entries(OFFICE_COORDS)) {
    await prisma.regionalOffice.updateMany({ where: { code }, data: coords });
  }
  console.log("  Regional offices");

  for (const [reg, coords] of Object.entries(INDUSTRY_COORDS)) {
    await prisma.industry.updateMany({ where: { registrationNo: reg }, data: coords });
  }
  console.log("  Industries");

  // Monitoring locations: restore by name to original seed-expand coordinates
  const locUpdates = [
    { name: "Raipur City Center AQM", lat: 21.2514, lng: 81.6296 },
    { name: "Siltara AQM", lat: 21.31, lng: 81.57 },
    { name: "Mahanadi River - Raipur", lat: 21.26, lng: 81.65 },
    { name: "Kharun River - Raipur", lat: 21.24, lng: 81.62 },
    { name: "Raipur Residential Zone", lat: 21.245, lng: 81.635 },
    { name: "Bhilai Industrial AQM", lat: 21.209, lng: 81.3787 },
    { name: "Durg City AQM", lat: 21.19, lng: 81.35 },
    { name: "Shivnath River - Durg", lat: 21.18, lng: 81.34 },
    { name: "Bhilai Industrial Noise", lat: 21.2, lng: 81.37 },
    { name: "Korba Power Plant AQM", lat: 22.349, lng: 82.69 },
    { name: "Korba City AQM", lat: 22.36, lng: 82.68 },
    { name: "Hasdeo River - Korba", lat: 22.35, lng: 82.70 },
    { name: "Korba Industrial Noise", lat: 22.34, lng: 82.69 },
    { name: "Bilaspur City AQM", lat: 22.08, lng: 82.15 },
    { name: "Arpa River - Bilaspur", lat: 22.07, lng: 82.13 },
    { name: "Bilaspur Residential Noise", lat: 22.09, lng: 82.14 },
    { name: "Jagdalpur City AQM", lat: 19.09, lng: 82.02 },
    { name: "Bailadila Mining AQM", lat: 18.67, lng: 81.24 },
    { name: "Indravati River - Jagdalpur", lat: 19.08, lng: 82.00 },
    { name: "Jagdalpur Town Noise", lat: 19.09, lng: 82.01 },
    { name: "Ambikapur City AQM", lat: 23.12, lng: 83.20 },
    { name: "Renukoot River - Ambikapur", lat: 23.11, lng: 83.19 },
    { name: "Ambikapur Town Noise", lat: 23.13, lng: 83.21 },
    { name: "Raigarh Industrial AQM", lat: 21.90, lng: 83.40 },
    { name: "Raigarh City AQM", lat: 21.89, lng: 83.39 },
    { name: "Kelo River - Raigarh", lat: 21.88, lng: 83.38 },
    { name: "Raigarh Industrial Noise", lat: 21.91, lng: 83.41 },
    { name: "Rajnandgaon City AQM", lat: 21.10, lng: 81.03 },
    { name: "Shivnath River - Rajnandgaon", lat: 21.09, lng: 81.01 },
    { name: "Rajnandgaon Town Noise", lat: 21.11, lng: 81.04 },
    { name: "Janjgir City AQM", lat: 21.81, lng: 82.57 },
    { name: "Hasdeo River - Janjgir", lat: 21.80, lng: 82.55 },
    { name: "Champa Town Noise", lat: 21.97, lng: 82.36 },
    { name: "Mahasamund City AQM", lat: 21.11, lng: 82.10 },
    { name: "Mahanadi River - Mahasamund", lat: 21.10, lng: 82.08 },
    { name: "Mahasamund Town Noise", lat: 21.12, lng: 82.11 },
  ];
  await Promise.all(
    locUpdates.map(({ name, lat, lng }) =>
      prisma.monitoringLocation.updateMany({ where: { name }, data: { lat, lng } })
    )
  );
  console.log("  Monitoring locations (named)");

  // Pin industry-linked monitoring locations to their industry's exact coordinates (batched)
  const industryLocs = await prisma.monitoringLocation.findMany({
    where: { industryId: { not: null } },
    include: { industry: { select: { lat: true, lng: true } } },
  });
  const toUpdate = industryLocs.filter((loc) => loc.industry);
  const BATCH = 25;
  for (let i = 0; i < toUpdate.length; i += BATCH) {
    const chunk = toUpdate.slice(i, i + BATCH);
    await Promise.all(
      chunk.map((loc) =>
        prisma.monitoringLocation.update({
          where: { id: loc.id },
          data: { lat: loc.industry.lat, lng: loc.industry.lng },
        })
      )
    );
  }
  console.log(`  Monitoring locations linked to industries (${toUpdate.length}) → pinned to industry coords`);

  console.log("\nDone. All pins now point to exact locations.");
  console.log("  → Hard refresh the map page (Ctrl+Shift+R) to see changes.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

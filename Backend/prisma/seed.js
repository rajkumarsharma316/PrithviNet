import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding PrithviNet database...\n");

  // ─── 1. Regional Offices ─────────────────────────────
  const raipur = await prisma.regionalOffice.upsert({
    where: { code: "RO-RPR" },
    update: {},
    create: {
      name: "Raipur Regional Office",
      code: "RO-RPR",
      lat: 21.2514,
      lng: 81.6296,
      district: "Raipur",
      address: "CECB HQ, Civil Lines, Raipur",
    },
  });
  const bilaspur = await prisma.regionalOffice.upsert({
    where: { code: "RO-BSP" },
    update: {},
    create: {
      name: "Bilaspur Regional Office",
      code: "RO-BSP",
      lat: 22.0797,
      lng: 82.1409,
      district: "Bilaspur",
      address: "Vyapar Vihar, Bilaspur",
    },
  });
  const korba = await prisma.regionalOffice.upsert({
    where: { code: "RO-KRB" },
    update: {},
    create: {
      name: "Korba Regional Office",
      code: "RO-KRB",
      lat: 22.3595,
      lng: 82.6824,
      district: "Korba",
      address: "Industrial Area, Korba",
    },
  });
  const durg = await prisma.regionalOffice.upsert({
    where: { code: "RO-DRG" },
    update: {},
    create: {
      name: "Durg Regional Office",
      code: "RO-DRG",
      lat: 21.1938,
      lng: 81.3509,
      district: "Durg",
      address: "Sector 6, Bhilai",
    },
  });

  console.log("  ✅ Regional Offices created");

  // ─── 2. Industries ───────────────────────────────────
  const bhilaiSteel = await prisma.industry.upsert({
    where: { registrationNo: "CG-IND-001" },
    update: {},
    create: {
      name: "Bhilai Steel Plant",
      type: "Steel Manufacturing",
      registrationNo: "CG-IND-001",
      lat: 21.209,
      lng: 81.3787,
      regionId: durg.id,
      status: "ACTIVE",
    },
  });
  const korbaPower = await prisma.industry.upsert({
    where: { registrationNo: "CG-IND-002" },
    update: {},
    create: {
      name: "Korba Super Thermal Power Station",
      type: "Power Generation",
      registrationNo: "CG-IND-002",
      lat: 22.349,
      lng: 82.69,
      regionId: korba.id,
      status: "ACTIVE",
    },
  });
  const siltaraIndustrial = await prisma.industry.upsert({
    where: { registrationNo: "CG-IND-003" },
    update: {},
    create: {
      name: "Siltara Industrial Complex",
      type: "Mixed Industrial",
      registrationNo: "CG-IND-003",
      lat: 21.31,
      lng: 81.57,
      regionId: raipur.id,
      status: "ACTIVE",
    },
  });

  console.log("  ✅ Industries created");

  // ─── 3. Monitoring Units ─────────────────────────────
  const ugm3 = await prisma.monitoringUnit.create({
    data: {
      name: "Micrograms per cubic meter",
      symbol: "µg/m³",
      parameterType: "AIR",
    },
  });
  const ppb = await prisma.monitoringUnit.create({
    data: { name: "Parts per billion", symbol: "ppb", parameterType: "AIR" },
  });
  const phUnit = await prisma.monitoringUnit.create({
    data: { name: "pH Level", symbol: "pH", parameterType: "WATER" },
  });
  const mgL = await prisma.monitoringUnit.create({
    data: {
      name: "Milligrams per liter",
      symbol: "mg/L",
      parameterType: "WATER",
    },
  });
  const ntu = await prisma.monitoringUnit.create({
    data: {
      name: "Nephelometric Turbidity Units",
      symbol: "NTU",
      parameterType: "WATER",
    },
  });
  const dbA = await prisma.monitoringUnit.create({
    data: {
      name: "Decibels (A-weighted)",
      symbol: "dB(A)",
      parameterType: "NOISE",
    },
  });

  console.log("  ✅ Monitoring Units created");

  // ─── 4. Prescribed Limits ────────────────────────────
  await prisma.prescribedLimit.createMany({
    data: [
      {
        parameter: "PM2.5",
        maxValue: 60,
        category: "Industrial",
        unitId: ugm3.id,
      },
      {
        parameter: "PM10",
        maxValue: 100,
        category: "Industrial",
        unitId: ugm3.id,
      },
      {
        parameter: "NO2",
        maxValue: 80,
        category: "Industrial",
        unitId: ppb.id,
      },
      {
        parameter: "SO2",
        maxValue: 80,
        category: "Industrial",
        unitId: ppb.id,
      },
      {
        parameter: "pH",
        minValue: 6.5,
        maxValue: 8.5,
        category: "Surface Water",
        unitId: phUnit.id,
      },
      {
        parameter: "TDS",
        maxValue: 500,
        category: "Drinking Water",
        unitId: mgL.id,
      },
      {
        parameter: "Turbidity",
        maxValue: 5,
        category: "Drinking Water",
        unitId: ntu.id,
      },
      {
        parameter: "DissolvedOxygen",
        minValue: 5,
        category: "Surface Water",
        unitId: mgL.id,
      },
      {
        parameter: "Laeq",
        maxValue: 75,
        category: "Industrial",
        unitId: dbA.id,
      },
      {
        parameter: "Laeq",
        maxValue: 55,
        category: "Residential",
        unitId: dbA.id,
      },
    ],
  });

  console.log("  ✅ Prescribed Limits created");

  // ─── 5. Monitoring Locations ─────────────────────────
  const airLoc1 = await prisma.monitoringLocation.create({
    data: {
      name: "Raipur City Center AQM",
      type: "AIR",
      lat: 21.2514,
      lng: 81.6296,
      regionId: raipur.id,
    },
  });
  const airLoc2 = await prisma.monitoringLocation.create({
    data: {
      name: "Bhilai Industrial AQM",
      type: "AIR",
      lat: 21.209,
      lng: 81.3787,
      regionId: durg.id,
      industryId: bhilaiSteel.id,
    },
  });
  const airLoc3 = await prisma.monitoringLocation.create({
    data: {
      name: "Korba Power Plant AQM",
      type: "AIR",
      lat: 22.349,
      lng: 82.69,
      regionId: korba.id,
      industryId: korbaPower.id,
    },
  });
  const waterLoc1 = await prisma.monitoringLocation.create({
    data: {
      name: "Mahanadi River - Raipur",
      type: "WATER",
      lat: 21.26,
      lng: 81.65,
      regionId: raipur.id,
    },
  });
  const waterLoc2 = await prisma.monitoringLocation.create({
    data: {
      name: "Shivnath River - Durg",
      type: "WATER",
      lat: 21.18,
      lng: 81.34,
      regionId: durg.id,
    },
  });
  const noiseLoc1 = await prisma.monitoringLocation.create({
    data: {
      name: "Raipur Residential Zone",
      type: "NOISE",
      lat: 21.245,
      lng: 81.635,
      regionId: raipur.id,
    },
  });
  const noiseLoc2 = await prisma.monitoringLocation.create({
    data: {
      name: "Bhilai Industrial Noise",
      type: "NOISE",
      lat: 21.2,
      lng: 81.37,
      regionId: durg.id,
      industryId: bhilaiSteel.id,
    },
  });

  console.log("  ✅ Monitoring Locations created");

  // ─── 6. Users ────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);
  const hashedPw = await bcrypt.hash("password123", salt);

  await prisma.user.upsert({
    where: { email: "admin@prithvinet.gov.in" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@prithvinet.gov.in",
      password: hashedPw,
      role: "SUPER_ADMIN",
    },
  });
  await prisma.user.upsert({
    where: { email: "officer.raipur@prithvinet.gov.in" },
    update: {},
    create: {
      name: "Raipur Regional Officer",
      email: "officer.raipur@prithvinet.gov.in",
      password: hashedPw,
      role: "REGIONAL_OFFICER",
      regionId: raipur.id,
    },
  });
  const monitoringUser = await prisma.user.upsert({
    where: { email: "team1@prithvinet.gov.in" },
    update: {},
    create: {
      name: "Field Team Alpha",
      email: "team1@prithvinet.gov.in",
      password: hashedPw,
      role: "MONITORING_TEAM",
      regionId: raipur.id,
    },
  });
  await prisma.user.upsert({
    where: { email: "bhilai@industry.com" },
    update: {},
    create: {
      name: "Bhilai Steel Manager",
      email: "bhilai@industry.com",
      password: hashedPw,
      role: "INDUSTRY_USER",
      industryId: bhilaiSteel.id,
    },
  });

  console.log("  ✅ Users created");

  // ─── 7. Sample Monitoring Data ───────────────────────
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const ts = new Date(now.getTime() - i * 60 * 60 * 1000); // each hour going back

    await prisma.airData.create({
      data: {
        pm25: 40 + Math.random() * 80,
        pm10: 60 + Math.random() * 100,
        no2: 15 + Math.random() * 40,
        so2: 5 + Math.random() * 20,
        co: 0.5 + Math.random() * 2,
        o3: 20 + Math.random() * 60,
        aqi: 80 + Math.random() * 150,
        timestamp: ts,
        locationId: airLoc1.id,
        submittedById: monitoringUser.id,
      },
    });

    await prisma.waterData.create({
      data: {
        ph: 6 + Math.random() * 3,
        tds: 200 + Math.random() * 400,
        turbidity: 1 + Math.random() * 8,
        dissolvedOxygen: 3 + Math.random() * 6,
        bod: 1 + Math.random() * 5,
        cod: 5 + Math.random() * 20,
        timestamp: ts,
        locationId: waterLoc1.id,
        submittedById: monitoringUser.id,
      },
    });

    await prisma.noiseData.create({
      data: {
        laeq: 50 + Math.random() * 35,
        lmax: 70 + Math.random() * 20,
        lmin: 30 + Math.random() * 20,
        timestamp: ts,
        locationId: noiseLoc1.id,
        submittedById: monitoringUser.id,
      },
    });
  }

  console.log("  ✅ Sample monitoring data (24h) created");
  console.log("\n🎉 Seed complete!");
  console.log("\n📧 Login credentials (all passwords: password123):");
  console.log("   Super Admin:     admin@prithvinet.gov.in");
  console.log("   Regional Officer: officer.raipur@prithvinet.gov.in");
  console.log("   Monitoring Team:  team1@prithvinet.gov.in");
  console.log("   Industry User:    bhilai@industry.com");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

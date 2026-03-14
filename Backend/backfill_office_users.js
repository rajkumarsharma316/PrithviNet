import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Find all regional offices that have NO REGIONAL_OFFICER user linked
  const offices = await prisma.regionalOffice.findMany({
    include: {
      users: { where: { role: "REGIONAL_OFFICER" }, select: { id: true } },
    },
  });

  const orphaned = offices.filter((o) => o.users.length === 0);

  if (orphaned.length === 0) {
    console.log("✅ All regional offices already have a REGIONAL_OFFICER user.");
    await prisma.$disconnect();
    return;
  }

  console.log(
    `Found ${orphaned.length} office(s) without a REGIONAL_OFFICER. Creating users...\n`,
  );

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt);

  for (const office of orphaned) {
    const email = `officer.${office.code.toLowerCase().replace(/[^a-z0-9]/g, "")}@prithvinet.gov.in`;

    // Skip if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`⚠ Skipping ${office.name} — email ${email} already in use.`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: `${office.name} Officer`,
        email,
        password: hashedPassword,
        role: "REGIONAL_OFFICER",
        regionId: office.id,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    console.log(`✅ Created: ${user.email}  (${user.name}) → office: ${office.name}`);
  }

  console.log("\nDone! Default password for all new users: password123");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

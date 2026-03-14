import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'IndustryStatus')
    `;
    console.log("Enum values in database:");
    console.log(result.map((r) => r.enumlabel));
  } catch (error) {
    console.error("Error querying enum:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

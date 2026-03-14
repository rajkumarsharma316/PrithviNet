import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TYPE "IndustryStatus" ADD VALUE IF NOT EXISTS 'PENDING'`,
    );
    console.log("Successfully added PENDING to IndustryStatus enum");
  } catch (error) {
    console.error("Error adding enum value:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

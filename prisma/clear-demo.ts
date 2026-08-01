import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seeded demo listings were created without a userId. Anything a real user
  // posted through the site always has a userId (enforced by the /api/listings
  // route, which requires a signed-in session). So this only ever removes demo data.
  const result = await prisma.listing.deleteMany({ where: { userId: null } });
  console.log(`Removed ${result.count} demo listing(s). Real user-submitted listings were left untouched.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

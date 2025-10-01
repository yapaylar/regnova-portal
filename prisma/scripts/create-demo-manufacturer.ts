import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = process.env.MANUFACTURER_SLUG ?? "demo-manufacturer";
  const name = process.env.MANUFACTURER_NAME ?? "Demo Manufacturer";
  const registrationNumber = process.env.MANUFACTURER_REGISTRATION_NUMBER ?? "DM-001";
  const contactEmail = process.env.MANUFACTURER_EMAIL ?? "demo@example.com";
  const contactPhone = process.env.MANUFACTURER_PHONE ?? null;

  const manufacturer = await prisma.manufacturer.upsert({
    where: { slug },
    update: {
      name,
      registrationNumber,
      contactEmail,
      contactPhone,
    },
    create: {
      slug,
      name,
      registrationNumber,
      contactEmail,
      contactPhone,
    },
  });

  console.log("Manufacturer ready", {
    id: manufacturer.id,
    slug: manufacturer.slug,
    name: manufacturer.name,
  });
}

main()
  .catch((error) => {
    console.error("Failed to ensure manufacturer", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


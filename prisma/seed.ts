
import "dotenv/config";
import { business } from "../src/lib/business";
import { demoServices, demoBarbers } from "../src/lib/catalog";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Vienna Cuts database...");

  // 1. Create demonstration services
  const services = demoServices.map(({ id, name, description, priceCents, durationMinutes, sortOrder }) => ({
    id, name, description, priceCents, durationMinutes, sortOrder,
  }));

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: service,
      create: service,
    });
  }

  console.log(`${services.length} services ready.`);

  // 2. Create fictional barbers
  const barbers = demoBarbers.map(({ id, name, bio }) => ({ id, name, bio }));

  for (const barber of barbers) {
    await prisma.barber.upsert({
      where: { id: barber.id },
      update: barber,
      create: barber,
    });
  }

  console.log("2 barbers ready.");

  // 3. Create weekly working hours
  for (const barber of barbers) {
    for (const { day, startMinute, endMinute } of business.openingHours) {

      const id = `hours-${barber.id}-${day}`;

      await prisma.workingHour.upsert({
        where: { id },
        update: {
          dayOfWeek: day,
          startMinute,
          endMinute,
        },
        create: {
          id,
          barberId: barber.id,
          dayOfWeek: day,
          startMinute,
          endMinute,
        },
      });
    }
  }

  console.log("12 working-hour records ready.");

  // 4. Verify record counts
  const serviceCount = await prisma.service.count();
  const barberCount = await prisma.barber.count();
  const hoursCount = await prisma.workingHour.count();

  console.log("Database totals:", {
    services: serviceCount,
    barbers: barberCount,
    workingHours: hoursCount,
  });

  console.log("Vienna Cuts seeding completed.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

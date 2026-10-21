
import "dotenv/config";
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
  const services = [
    {
      id: "classic-haircut",
      name: "Classic Haircut",
      description: "A precise cut tailored to your style.",
      priceCents: 2800,
      durationMinutes: 30,
      sortOrder: 1,
    },
    {
      id: "beard-trim",
      name: "Beard Trim",
      description: "Clean lines and expert beard shaping.",
      priceCents: 1800,
      durationMinutes: 20,
      sortOrder: 2,
    },
    {
      id: "haircut-beard",
      name: "Haircut & Beard",
      description: "The complete grooming experience.",
      priceCents: 4000,
      durationMinutes: 50,
      sortOrder: 3,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: service,
      create: service,
    });
  }

  console.log("3 services ready.");

  // 2. Create fictional barbers
  const barbers = [
    {
      id: "barber-alex",
      name: "Alex",
      bio: "Classic cuts and modern grooming.",
    },
    {
      id: "barber-daniel",
      name: "Daniel",
      bio: "Precision fades and beard styling.",
    },
  ];

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
    for (let day = 1; day <= 6; day++) {
      // Monday-Friday: 09:00-18:00
      // Saturday: 10:00-16:00
      const startMinute = day === 6 ? 600 : 540;
      const endMinute = day === 6 ? 960 : 1080;

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

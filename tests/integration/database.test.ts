
import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required for database integration tests."
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Vienna Cuts database integration", () => {
  it("can query the services table", async () => {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
    });

    expect(services.length).toBeGreaterThanOrEqual(3);

    expect(
      services.some((service) => service.id === "classic-haircut")
    ).toBe(true);
  });

  it("stores service prices as integer cents", async () => {
    const haircut = await prisma.service.findUnique({
      where: { id: "classic-haircut" },
    });

    expect(haircut).not.toBeNull();
    expect(haircut?.priceCents).toBe(2800);
    expect(haircut?.durationMinutes).toBe(30);
  });

  it("can query the barbers table", async () => {
    const barbers = await prisma.barber.findMany();

    expect(barbers.length).toBeGreaterThanOrEqual(2);
    expect(barbers.some((barber) => barber.id === "barber-alex"))
      .toBe(true);
  });

  it("can retrieve working schedules", async () => {
    const hours = await prisma.workingHour.findMany({
      where: { barberId: "barber-alex" },
      orderBy: { dayOfWeek: "asc" },
    });

    expect(hours).toHaveLength(6);

    expect(hours.every((hour) =>
      hour.startMinute < hour.endMinute
    )).toBe(true);
  });


it("can query the appointments table", async () => {
  const appointmentCount = await prisma.appointment.count();

  expect(appointmentCount).toBeGreaterThanOrEqual(0);
});

});

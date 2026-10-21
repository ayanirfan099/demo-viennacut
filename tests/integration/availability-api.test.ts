
import "dotenv/config";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { DateTime } from "luxon";
import { generateAvailableSlots } from "../../src/lib/booking/availability";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required for integration tests."
  );
}

const databaseName = new URL(connectionString)
  .pathname.slice(1);

if (databaseName !== "vienna_cuts_test") {
  throw new Error(
    "Refusing to run modifying tests outside vienna_cuts_test."
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

beforeAll(async () => {
  await prisma.$connect();

  const result = await prisma.$queryRaw<
    { database: string }[]
  >`SELECT current_database() AS database`;

  if (result[0]?.database !== "vienna_cuts_test") {
    throw new Error(
      "Integration tests require vienna_cuts_test."
    );
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Availability database integration", () => {
  it("connects to the isolated test database", async () => {
    const result = await prisma.$queryRaw<
      { database: string }[]
    >`SELECT current_database() AS database`;

    expect(result[0].database).toBe("vienna_cuts_test");
  });
});

describe("Availability database conflicts", () => {
  const testDate = "2026-11-16"; // Monday
  const barberId = "barber-alex";
  const serviceId = "classic-haircut";

  async function getAvailableSlots() {
    const localDate = DateTime.fromISO(testDate, {
      zone: "Europe/Vienna",
    });

    const dayStart = localDate.startOf("day").toJSDate();
    const dayEnd = localDate
      .plus({ days: 1 })
      .startOf("day")
      .toJSDate();

    const [
      service,
      workingHours,
      appointments,
      blockedTimes,
    ] = await Promise.all([
      prisma.service.findUniqueOrThrow({
        where: { id: serviceId },
      }),

      prisma.workingHour.findMany({
        where: {
          barberId,
          dayOfWeek: 1,
        },
      }),

      prisma.appointment.findMany({
        where: {
          barberId,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          startsAt: {
            lt: dayEnd,
          },
          endsAt: {
            gt: dayStart,
          },
        },
        select: {
          startsAt: true,
          endsAt: true,
        },
      }),

      prisma.blockedTime.findMany({
        where: {
          barberId,
          startsAt: {
            lt: dayEnd,
          },
          endsAt: {
            gt: dayStart,
          },
        },
        select: {
          startsAt: true,
          endsAt: true,
        },
      }),
    ]);

    return generateAvailableSlots({
      date: testDate,
      durationMinutes: service.durationMinutes,
      workingPeriods: workingHours,
      appointments,
      blockedTimes,
      now: new Date("2026-11-01T00:00:00Z"),
    });
  }

  it("removes slots overlapping a blocked period", async () => {
    const blocked = await prisma.blockedTime.create({
      data: {
        barberId,
        startsAt: new Date("2026-11-16T11:00:00Z"),
        endsAt: new Date("2026-11-16T12:00:00Z"),
        reason: "Integration test break",
      },
    });

    try {
      const slots = await getAvailableSlots();
      const starts = slots.map((slot) => slot.startsAt);

      expect(starts).not.toContain(
        "2026-11-16T11:30:00.000Z"
      );

      expect(starts).toContain(
        "2026-11-16T12:00:00.000Z"
      );
    } finally {
      await prisma.blockedTime.delete({
        where: { id: blocked.id },
      });
    }
  });

  it("removes slots overlapping a confirmed appointment", async () => {
    const customer = await prisma.customer.create({
      data: {
        name: "Integration Test Customer",
      },
    });

    try {
      const appointment = await prisma.appointment.create({
        data: {
          customerId: customer.id,
          barberId,
          serviceId,
          startsAt: new Date("2026-11-16T09:00:00Z"),
          endsAt: new Date("2026-11-16T09:30:00Z"),
          priceCents: 2800,
          durationMinutes: 30,
          status: "CONFIRMED",
        },
      });

      try {
        const slots = await getAvailableSlots();
        const starts = slots.map(
          (slot) => slot.startsAt
        );

        expect(starts).not.toContain(
          "2026-11-16T09:00:00.000Z"
        );

        expect(starts).toContain(
          "2026-11-16T09:30:00.000Z"
        );
      } finally {
        await prisma.appointment.delete({
          where: { id: appointment.id },
        });
      }
    } finally {
      await prisma.customer.delete({
        where: { id: customer.id },
      });
    }
  });
});

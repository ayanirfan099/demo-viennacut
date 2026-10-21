import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const connectionString = process.env.DATABASE_URL;

if (
  !connectionString ||
  new URL(connectionString).pathname !== "/vienna_cuts_test"
) {
  throw new Error(
    "Booking constraint tests require vienna_cuts_test."
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const customerId = `constraint-customer-${randomUUID()}`;

beforeAll(async () => {
  await prisma.customer.create({
    data: {
      id: customerId,
      name: "Constraint Test Customer",
    },
  });
});

afterAll(async () => {
  try {
    await prisma.appointment.deleteMany({
      where: { customerId },
    });

    await prisma.customer.deleteMany({
      where: { id: customerId },
    });
  } finally {
    await prisma.$disconnect();
  }
});

describe("Booking database constraints", () => {
  it("rejects overlapping active appointments for the same barber", async () => {
    const booking = {
      customerId,
      barberId: "barber-alex",
      serviceId: "classic-haircut",
      priceCents: 2800,
      durationMinutes: 30,
      status: "PENDING" as const,
    };

    await prisma.appointment.create({
      data: {
        ...booking,
        id: randomUUID(),
        startsAt: new Date("2030-06-10T10:00:00.000Z"),
        endsAt: new Date("2030-06-10T10:30:00.000Z"),
      },
    });

    await expect(
      prisma.appointment.create({
        data: {
          ...booking,
          id: randomUUID(),
          startsAt: new Date("2030-06-10T10:10:00.000Z"),
          endsAt: new Date("2030-06-10T10:40:00.000Z"),
        },
      })
    ).rejects.toThrow(/Appointment_no_active_overlap/);

    const appointments = await prisma.appointment.findMany({
      where: { customerId },
    });

    expect(appointments).toHaveLength(1);
  });

  it("allows back-to-back appointments for the same barber", async () => {
    const booking = {
      customerId,
      barberId: "barber-alex",
      serviceId: "classic-haircut",
      priceCents: 2800,
      durationMinutes: 30,
      status: "PENDING" as const,
    };

    const first = await prisma.appointment.create({
      data: {
        ...booking,
        id: randomUUID(),
        startsAt: new Date("2030-06-11T10:00:00.000Z"),
        endsAt: new Date("2030-06-11T10:30:00.000Z"),
      },
    });

    const second = await prisma.appointment.create({
      data: {
        ...booking,
        id: randomUUID(),
        startsAt: new Date("2030-06-11T10:30:00.000Z"),
        endsAt: new Date("2030-06-11T11:00:00.000Z"),
      },
    });

    expect(first.id).toBeDefined();
    expect(second.id).toBeDefined();
    expect(first.id).not.toBe(second.id);
  });

  it("allows different barbers to have appointments at the same time", async () => {
    const booking = {
      customerId,
      serviceId: "classic-haircut",
      priceCents: 2800,
      durationMinutes: 30,
      status: "PENDING" as const,
      startsAt: new Date("2030-06-12T10:00:00.000Z"),
      endsAt: new Date("2030-06-12T10:30:00.000Z"),
    };

    const alexAppointment = await prisma.appointment.create({
      data: {
        ...booking,
        id: randomUUID(),
        barberId: "barber-alex",
      },
    });

    const danielAppointment = await prisma.appointment.create({
      data: {
        ...booking,
        id: randomUUID(),
        barberId: "barber-daniel",
      },
    });

    expect(alexAppointment.barberId).toBe("barber-alex");
    expect(danielAppointment.barberId).toBe("barber-daniel");

    expect(alexAppointment.startsAt.getTime()).toBe(
      danielAppointment.startsAt.getTime()
    );
  });

  it("allows a new booking after an appointment is cancelled", async () => {
    const booking = {
      customerId,
      barberId: "barber-alex",
      serviceId: "classic-haircut",
      priceCents: 2800,
      durationMinutes: 30,
      startsAt: new Date("2030-06-13T10:00:00.000Z"),
      endsAt: new Date("2030-06-13T10:30:00.000Z"),
    };

    const original = await prisma.appointment.create({
      data: {
        ...booking,
        id: randomUUID(),
        status: "PENDING",
      },
    });

    await prisma.appointment.update({
      where: { id: original.id },
      data: { status: "CANCELLED" },
    });

    const replacement = await prisma.appointment.create({
      data: {
        ...booking,
        id: randomUUID(),
        status: "PENDING",
      },
    });

    expect(replacement.id).not.toBe(original.id);

    const appointments = await prisma.appointment.findMany({
      where: {
        id: { in: [original.id, replacement.id] },
      },
    });

    expect(appointments).toHaveLength(2);
    expect(appointments.map((a) => a.status).sort()).toEqual([
      "CANCELLED",
      "PENDING",
    ]);
  });

  it("rejects appointments with invalid time ranges", async () => {
    const booking = {
      customerId,
      barberId: "barber-alex",
      serviceId: "classic-haircut",
      priceCents: 2800,
      durationMinutes: 30,
      status: "PENDING" as const,
    };

    const invalidRanges = [
      {
        startsAt: new Date("2030-06-14T10:00:00.000Z"),
        endsAt: new Date("2030-06-14T10:00:00.000Z"),
      },
      {
        startsAt: new Date("2030-06-14T11:00:00.000Z"),
        endsAt: new Date("2030-06-14T10:30:00.000Z"),
      },
    ];

    for (const range of invalidRanges) {
      await expect(
        prisma.appointment.create({
          data: {
            ...booking,
            ...range,
            id: randomUUID(),
          },
        })
      ).rejects.toThrow(/Appointment_valid_time_range/);
    }

    const appointments = await prisma.appointment.count({
      where: {
        customerId,
        startsAt: {
          gte: new Date("2030-06-14T00:00:00.000Z"),
          lt: new Date("2030-06-15T00:00:00.000Z"),
        },
      },
    });

    expect(appointments).toBe(0);
  });

  it("prevents concurrent bookings for the same barber and time", async () => {
    const booking = {
      customerId,
      barberId: "barber-alex",
      serviceId: "classic-haircut",
      priceCents: 2800,
      durationMinutes: 30,
      status: "PENDING" as const,
      startsAt: new Date("2030-06-15T10:00:00.000Z"),
      endsAt: new Date("2030-06-15T10:30:00.000Z"),
    };

    const results = await Promise.allSettled([
      prisma.appointment.create({
        data: {
          ...booking,
          id: randomUUID(),
        },
      }),
      prisma.appointment.create({
        data: {
          ...booking,
          id: randomUUID(),
        },
      }),
    ]);

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    );

    const rejected = results.filter(
      (result) => result.status === "rejected"
    );

    expect(successful).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const failure = rejected[0];

    if (failure.status === "rejected") {
      expect(String(failure.reason)).toMatch(
        /Appointment_no_active_overlap/
      );
    }

    const savedAppointments = await prisma.appointment.count({
      where: {
        customerId,
        barberId: "barber-alex",
        startsAt: booking.startsAt,
      },
    });

    expect(savedAppointments).toBe(1);
  });
});
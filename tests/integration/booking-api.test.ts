import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "../../src/lib/prisma";
import { POST } from "../../src/app/api/bookings/route";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required for booking API integration tests."
  );
}

if (
  new URL(connectionString).pathname !== "/vienna_cuts_test"
) {
  throw new Error(
    "Booking API integration tests must use vienna_cuts_test."
  );
}

describe("POST /api/bookings integration", () => {
  it("connects to the test database", async () => {
    const serviceCount = await prisma.service.count();

    expect(serviceCount).toBeGreaterThan(0);
    expect(typeof POST).toBe("function");
  });

  it("creates a real booking and customer", async () => {
    const customerName = `Integration ${randomUUID()}`;
    const startsAt = "2026-11-16T09:00:00.000Z";
    let appointmentId: string | undefined;
    let customerId: string | undefined;

    try {
      const response = await POST(
        new Request("http://localhost:3000/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: "classic-haircut",
            barberId: "barber-alex",
            startsAt,
            customer: {
              name: customerName,
              email: "integration@example.com",
            },
          }),
        })
      );

      expect(response.status).toBe(201);

      const body = await response.json();
      appointmentId = body.appointment.id;

      const appointment =
        await prisma.appointment.findUniqueOrThrow({
          where: { id: appointmentId },
          include: { customer: true },
        });

      customerId = appointment.customerId;

      expect(appointment.status).toBe("PENDING");
      expect(appointment.startsAt.toISOString()).toBe(startsAt);
      expect(appointment.durationMinutes).toBe(30);
      expect(appointment.priceCents).toBe(2800);
      expect(appointment.customer.name).toBe(customerName);
    } finally {
      // Also recover records if an assertion fails after creation.
      const created = await prisma.customer.findFirst({
        where: { name: customerName },
        select: { id: true },
      });

      if (created) {
        customerId = created.id;
      }

      if (customerId) {
        await prisma.appointment.deleteMany({
          where: { customerId },
        });

        await prisma.customer.delete({
          where: { id: customerId },
        });
      } else if (appointmentId) {
        await prisma.appointment.deleteMany({
          where: { id: appointmentId },
        });
      }
    }
  });

  it("rejects a second booking for the same slot", async () => {
    const firstName = `First ${randomUUID()}`;
    const secondName = `Second ${randomUUID()}`;
    const startsAt = "2026-11-17T09:00:00.000Z";

    const createBooking = (name: string) =>
      POST(
        new Request("http://localhost:3000/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: "classic-haircut",
            barberId: "barber-alex",
            startsAt,
            customer: {
              name,
              email: "integration@example.com",
            },
          }),
        })
      );

    try {
      const firstResponse = await createBooking(firstName);
      expect(firstResponse.status).toBe(201);

      const secondResponse = await createBooking(secondName);
      const secondBody = await secondResponse.json();

      expect(secondResponse.status).toBe(409);
      expect(secondBody.error).toBe(
        "Requested appointment time is unavailable."
      );

      const rejectedCustomer = await prisma.customer.findFirst({
        where: { name: secondName },
      });

      expect(rejectedCustomer).toBeNull();

      const firstCustomer = await prisma.customer.findFirst({
        where: { name: firstName },
        include: { appointments: true },
      });

      expect(firstCustomer).not.toBeNull();
      expect(firstCustomer?.appointments).toHaveLength(1);
    } finally {
      const customers = await prisma.customer.findMany({
        where: {
          name: { in: [firstName, secondName] },
        },
        select: { id: true },
      });

      const customerIds = customers.map((customer) => customer.id);

      await prisma.appointment.deleteMany({
        where: { customerId: { in: customerIds } },
      });

      await prisma.customer.deleteMany({
        where: { id: { in: customerIds } },
      });
    }
  });
});
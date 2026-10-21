import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { afterAll, describe, expect, it } from "vitest";

const connectionString = process.env.DATABASE_URL;

if (
  !connectionString ||
  new URL(connectionString).pathname !== "/vienna_cuts_test"
) {
  throw new Error(
    "Booking transaction tests require vienna_cuts_test."
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Booking transactions", () => {
  it("connects to the test database", async () => {
    const result = await prisma.service.count();

    expect(result).toBeGreaterThan(0);
  });

  it("creates a customer and appointment in one transaction", async () => {
    const customerId = `transaction-customer-${randomUUID()}`;
    const appointmentId = randomUUID();

    try {
      const appointment = await prisma.$transaction(async (tx) => {
        const customer = await tx.customer.create({
          data: {
            id: customerId,
            name: "Transaction Test Customer",
            email: "transaction-test@example.com",
          },
        });

        return tx.appointment.create({
          data: {
            id: appointmentId,
            customerId: customer.id,
            barberId: "barber-alex",
            serviceId: "classic-haircut",
            startsAt: new Date("2031-06-10T10:00:00.000Z"),
            endsAt: new Date("2031-06-10T10:30:00.000Z"),
            priceCents: 2800,
            durationMinutes: 30,
            status: "PENDING",
          },
        });
      });

      expect(appointment.id).toBe(appointmentId);
      expect(appointment.customerId).toBe(customerId);
      expect(appointment.status).toBe("PENDING");

      const savedCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      const savedAppointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      expect(savedCustomer?.name).toBe("Transaction Test Customer");
      expect(savedAppointment?.customerId).toBe(customerId);
      expect(savedAppointment?.priceCents).toBe(2800);
      expect(savedAppointment?.durationMinutes).toBe(30);
    } finally {
      await prisma.appointment.deleteMany({
        where: { id: appointmentId },
      });

      await prisma.customer.deleteMany({
        where: { id: customerId },
      });
    }
  });

  it("rolls back customer creation when appointment creation fails", async () => {
    const customerId = `rollback-customer-${randomUUID()}`;
    const appointmentId = randomUUID();

    try {
      await expect(
        prisma.$transaction(async (tx) => {
          const customer = await tx.customer.create({
            data: {
              id: customerId,
              name: "Rollback Test Customer",
            },
          });

          return tx.appointment.create({
            data: {
              id: appointmentId,
              customerId: customer.id,
              barberId: "barber-alex",
              serviceId: "classic-haircut",
              startsAt: new Date("2031-06-11T10:30:00.000Z"),
              endsAt: new Date("2031-06-11T10:00:00.000Z"),
              priceCents: 2800,
              durationMinutes: 30,
              status: "PENDING",
            },
          });
        })
      ).rejects.toThrow(/Appointment_valid_time_range/);

      const savedCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      const savedAppointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      expect(savedCustomer).toBeNull();
      expect(savedAppointment).toBeNull();
    } finally {
      await prisma.appointment.deleteMany({
        where: { id: appointmentId },
      });

      await prisma.customer.deleteMany({
        where: { id: customerId },
      });
    }
  });

  it("rolls back customer creation on double booking", async () => {
    const existingCustomerId = `existing-${randomUUID()}`;
    const newCustomerId = `conflict-${randomUUID()}`;
    const existingAppointmentId = randomUUID();
    const newAppointmentId = randomUUID();

    const startsAt = new Date("2031-06-12T10:00:00.000Z");
    const endsAt = new Date("2031-06-12T10:30:00.000Z");

    try {
      await prisma.customer.create({
        data: {
          id: existingCustomerId,
          name: "Existing Customer",
        },
      });

      await prisma.appointment.create({
        data: {
          id: existingAppointmentId,
          customerId: existingCustomerId,
          barberId: "barber-alex",
          serviceId: "classic-haircut",
          startsAt,
          endsAt,
          priceCents: 2800,
          durationMinutes: 30,
          status: "CONFIRMED",
        },
      });

      expect.assertions(5);

      try {
        await prisma.$transaction(async (tx) => {
          const customer = await tx.customer.create({
            data: {
              id: newCustomerId,
              name: "Conflicting Customer",
            },
          });

          return tx.appointment.create({
            data: {
              id: newAppointmentId,
              customerId: customer.id,
              barberId: "barber-alex",
              serviceId: "classic-haircut",
              startsAt,
              endsAt,
              priceCents: 2800,
              durationMinutes: 30,
              status: "PENDING",
            },
          });
        });
      } catch (error) {
        expect(error).toMatchObject({
          code: "P2039",
          meta: {
            modelName: "Appointment",
          },
        });

        expect(String(error)).toContain(
          "Appointment_no_active_overlap"
        );
      }

      const rejectedCustomer = await prisma.customer.findUnique({
        where: { id: newCustomerId },
      });

      const rejectedAppointment = await prisma.appointment.findUnique({
        where: { id: newAppointmentId },
      });

      expect(rejectedCustomer).toBeNull();
      expect(rejectedAppointment).toBeNull();

      const existingAppointment = await prisma.appointment.findUnique({
        where: { id: existingAppointmentId },
      });

      expect(existingAppointment).not.toBeNull();
    } finally {
      await prisma.appointment.deleteMany({
        where: {
          id: {
            in: [existingAppointmentId, newAppointmentId],
          },
        },
      });

      await prisma.customer.deleteMany({
        where: {
          id: {
            in: [existingCustomerId, newCustomerId],
          },
        },
      });
    }
  });
});
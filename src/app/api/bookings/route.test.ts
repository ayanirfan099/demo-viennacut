import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    service: {
      findFirst: vi.fn(),
    },
    barber: {
      findFirst: vi.fn(),
    },
    workingHour: {
      findMany: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
    blockedTime: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { POST } from "./route";

beforeEach(() => {
  vi.clearAllMocks();

  mockPrisma.service.findFirst.mockResolvedValue({
    id: "classic-haircut",
    durationMinutes: 30,
    priceCents: 2800,
  });

  mockPrisma.barber.findFirst.mockResolvedValue({
    id: "barber-alex",
  });

  mockPrisma.workingHour.findMany.mockResolvedValue([
    {
      startMinute: 0,
      endMinute: 1440,
    },
  ]);

  mockPrisma.appointment.findMany.mockResolvedValue([]);

  mockPrisma.blockedTime.findMany.mockResolvedValue([]);

  mockPrisma.$transaction.mockImplementation(
    async (callback: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        customer: {
          create: vi.fn().mockResolvedValue({
            id: "customer-test-1",
            name: "Test Customer",
          }),
        },
        appointment: {
          create: vi.fn().mockImplementation(async ({ data }) => ({
            id: "appointment-test-1",
            ...data,
          })),
        },
      };

      return callback(tx);
    }
  );
});

const validBooking = {
  serviceId: "classic-haircut",
  barberId: "barber-alex",
  startsAt: (() => {
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);

    date.setUTCMinutes(
      Math.ceil(date.getUTCMinutes() / 10) * 10,
      0,
      0
    );

    return date.toISOString();
  })(),
  customer: {
    name: "Test Customer",
    email: "test@example.com",
  },
};

function createRequest(body: unknown): Request {
  return new Request("http://localhost/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/bookings", () => {
  it("rejects malformed JSON", async () => {
    const request = new Request(
      "http://localhost/api/bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{invalid-json",
      }
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid JSON request body.");
  });

  it("rejects missing serviceId", async () => {
    const response = await POST(
      createRequest({
        ...validBooking,
        serviceId: "",
      })
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.details).toContain(
      "serviceId is required"
    );
  });

  it("rejects invalid customer information", async () => {
    const response = await POST(
      createRequest({
        ...validBooking,
        customer: {
          name: "",
          email: "invalid-email",
        },
      })
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.details).toContain(
      "customer.name is required"
    );
    expect(body.details).toContain(
      "customer.email is invalid"
    );
  });

  it("creates a booking successfully", async () => {
    const response = await POST(
      createRequest(validBooking)
    );

    const body = await response.json();

    expect(response.status).toBe(201);

    expect(body.appointment).toEqual({
      id: "appointment-test-1",
      status: "PENDING",
      startsAt: validBooking.startsAt,
      endsAt: new Date(
        new Date(validBooking.startsAt).getTime() +
          30 * 60 * 1000
      ).toISOString(),
    });

    expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
  });

  it("returns 409 when the database rejects a double booking", async () => {
    const conflictError = Object.assign(
      new Error(
        'Database error. Code: `23P01`. Message: `conflicting key value violates exclusion constraint "Appointment_no_active_overlap"`'
      ),
      {
        code: "P2039",
        meta: {
          modelName: "Appointment",
        },
      }
    );

    mockPrisma.$transaction.mockRejectedValueOnce(
      conflictError
    );

    const response = await POST(
      createRequest(validBooking)
    );

    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe(
      "Requested appointment time is unavailable."
    );
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
  });

  it("rejects an unknown service", async () => {
    mockPrisma.service.findFirst.mockResolvedValue(null);

    const response = await POST(
      createRequest({
        ...validBooking,
        serviceId: "unknown-service",
      })
    );

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Service not found.");

    expect(mockPrisma.service.findFirst).toHaveBeenCalledWith({
      where: {
        id: "unknown-service",
        isActive: true,
      },
      select: {
        id: true,
        durationMinutes: true,
        priceCents: true,
      },
    });
  });

  it("rejects an inactive service", async () => {
    mockPrisma.service.findFirst.mockResolvedValue(null);

    const response = await POST(
      createRequest(validBooking)
    );

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Service not found.");
  });

  it("rejects an unknown barber", async () => {
    mockPrisma.barber.findFirst.mockResolvedValue(null);

    const response = await POST(
      createRequest({
        ...validBooking,
        barberId: "unknown-barber",
      })
    );

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Barber not found.");

    expect(mockPrisma.barber.findFirst).toHaveBeenCalledWith({
      where: {
        id: "unknown-barber",
        isActive: true,
      },
      select: {
        id: true,
      },
    });
  });

  it("rejects an inactive barber", async () => {
    mockPrisma.barber.findFirst.mockResolvedValue(null);

    const response = await POST(
      createRequest(validBooking)
    );

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Barber not found.");
  });

  it("rejects a slot occupied by an existing appointment", async () => {
    const startsAt = new Date(validBooking.startsAt);

    const endsAt = new Date(
      startsAt.getTime() + 30 * 60_000
    );

    mockPrisma.appointment.findMany.mockResolvedValue([
      {
        startsAt,
        endsAt,
      },
    ]);

    const response = await POST(
      createRequest(validBooking)
    );

    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe(
      "Requested appointment time is unavailable."
    );
  });

  it("rejects a slot during a blocked period", async () => {
    const startsAt = new Date(validBooking.startsAt);

    const endsAt = new Date(
      startsAt.getTime() + 60 * 60_000
    );

    mockPrisma.blockedTime.findMany.mockResolvedValue([
      {
        startsAt,
        endsAt,
      },
    ]);

    const response = await POST(
      createRequest(validBooking)
    );

    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe(
      "Requested appointment time is unavailable."
    );
  });

  it("rejects bookings outside working hours", async () => {
    mockPrisma.workingHour.findMany.mockResolvedValue([]);

    const response = await POST(
      createRequest(validBooking)
    );

    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe(
      "Requested appointment time is unavailable."
    );
  });
});

import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "../../src/lib/prisma";
import { GET } from "../../src/app/api/availability/route";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required for HTTP integration tests."
  );
}

if (
  new URL(connectionString).pathname.slice(1) !==
  "vienna_cuts_test"
) {
  throw new Error(
    "HTTP integration tests must use vienna_cuts_test."
  );
}

const BASE_URL = "http://localhost:3000/api/availability";

function createRequest(params: Record<string, string>) {
  const url = new URL(BASE_URL);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return new NextRequest(url);
}

const validParams = {
  serviceId: "classic-haircut",
  barberId: "barber-alex",
  date: "2026-11-16",
};

describe("GET /api/availability", () => {
  it("returns 400 when required parameters are missing", async () => {
    const response = await GET(createRequest({}));

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain("required");
  });

  it("returns 400 for an invalid calendar date", async () => {
    const response = await GET(
      createRequest({
        ...validParams,
        date: "2026-02-30",
      })
    );

    expect(response.status).toBe(400);
  });

  it("returns 404 for an unknown service", async () => {
    const response = await GET(
      createRequest({
        ...validParams,
        serviceId: "nonexistent-service",
      })
    );

    expect(response.status).toBe(404);
  });

  it("returns 404 for an unknown barber", async () => {
    const response = await GET(
      createRequest({
        ...validParams,
        barberId: "nonexistent-barber",
      })
    );

    expect(response.status).toBe(404);
  });

  it("returns valid availability data", async () => {
    const response = await GET(
      createRequest(validParams)
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.date).toBe(validParams.date);
    expect(body.timeZone).toBe("Europe/Vienna");
    expect(Array.isArray(body.slots)).toBe(true);

    for (const slot of body.slots) {
      expect(
        Number.isFinite(Date.parse(slot.startsAt))
      ).toBe(true);

      expect(slot.localTime).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it("returns 404 for an inactive service", async () => {
    const service = await prisma.service.findUniqueOrThrow({
      where: { id: "classic-haircut" },
      select: { isActive: true },
    });

    try {
      await prisma.service.update({
        where: { id: "classic-haircut" },
        data: { isActive: false },
      });

      const response = await GET(
        createRequest(validParams)
      );

      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Service not found.");
    } finally {
      await prisma.service.update({
        where: { id: "classic-haircut" },
        data: { isActive: service.isActive },
      });
    }
  });

  it("returns 404 for an inactive barber", async () => {
    const barber = await prisma.barber.findUniqueOrThrow({
      where: { id: "barber-alex" },
      select: { isActive: true },
    });

    try {
      await prisma.barber.update({
        where: { id: "barber-alex" },
        data: { isActive: false },
      });

      const response = await GET(
        createRequest(validParams)
      );

      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Barber not found.");
    } finally {
      await prisma.barber.update({
        where: { id: "barber-alex" },
        data: { isActive: barber.isActive },
      });
    }
  });
});

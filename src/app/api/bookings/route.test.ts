import { describe, expect, it } from "vitest";
import { POST } from "./route";

const validBooking = {
  serviceId: "classic-haircut",
  barberId: "barber-alex",
  startsAt: new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ).toISOString(),
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

  it("does not create bookings while disabled", async () => {
    const response = await POST(
      createRequest(validBooking)
    );

    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe(
      "Booking creation is not yet available."
    );
  });
});

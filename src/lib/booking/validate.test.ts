import { describe, expect, it } from "vitest";
import { validateBookingRequest } from "./validate";

const validBooking = {
  serviceId: "classic-haircut",
  barberId: "barber-alex",
  startsAt: "2026-11-02T10:00:00Z",
  customer: {
    name: "Test Customer",
    email: "test@example.com",
    phone: "+43123456789",
  },
};

describe("Booking request validation", () => {
  it("accepts a valid booking", () => {
    const result = validateBookingRequest(validBooking);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.serviceId).toBe("classic-haircut");
      expect(result.data.startsAt).toBeInstanceOf(Date);
    }
  });

  it("rejects a missing service", () => {
    const result = validateBookingRequest({
      ...validBooking,
      serviceId: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing barber", () => {
    const result = validateBookingRequest({
      ...validBooking,
      barberId: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid appointment date", () => {
    const result = validateBookingRequest({
      ...validBooking,
      startsAt: "not-a-date",
    });

    expect(result.success).toBe(false);
  });

  it("rejects timestamps without a timezone", () => {
    const result = validateBookingRequest({
      ...validBooking,
      startsAt: "2026-11-02T10:00:00",
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing customer details", () => {
    const result = validateBookingRequest({
      ...validBooking,
      customer: null,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty customer name", () => {
    const result = validateBookingRequest({
      ...validBooking,
      customer: {
        name: "   ",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid email addresses", () => {
    const result = validateBookingRequest({
      ...validBooking,
      customer: {
        name: "Test Customer",
        email: "invalid-email",
      },
    });

    expect(result.success).toBe(false);
  });

  it("allows optional phone and email", () => {
    const result = validateBookingRequest({
      ...validBooking,
      customer: {
        name: "Test Customer",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects oversized booking notes", () => {
    const result = validateBookingRequest({
      ...validBooking,
      customerNotes: "x".repeat(1001),
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-object request bodies", () => {
    expect(validateBookingRequest(null).success).toBe(false);
    expect(validateBookingRequest([]).success).toBe(false);
    expect(validateBookingRequest("invalid").success).toBe(false);
  });
});

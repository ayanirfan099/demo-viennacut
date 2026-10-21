import { describe, expect, it } from "vitest";
import { validateBookingRequest } from "./validate";

const fixedNow = new Date("2026-10-21T12:00:00Z");

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
    const result = validateBookingRequest(validBooking, fixedNow);

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
    }, fixedNow);

    expect(result.success).toBe(false);
  });

  it("rejects a missing barber", () => {
    const result = validateBookingRequest({
      ...validBooking,
      barberId: "",
    }, fixedNow);

    expect(result.success).toBe(false);
  });

  it("rejects an invalid appointment date", () => {
    const result = validateBookingRequest({
      ...validBooking,
      startsAt: "not-a-date",
    }, fixedNow);

    expect(result.success).toBe(false);
  });

  it("rejects timestamps without a timezone", () => {
    const result = validateBookingRequest({
      ...validBooking,
      startsAt: "2026-11-02T10:00:00",
    }, fixedNow);

    expect(result.success).toBe(false);
  });

  it("rejects missing customer details", () => {
    const result = validateBookingRequest({
      ...validBooking,
      customer: null,
    }, fixedNow);

    expect(result.success).toBe(false);
  });

  it("rejects an empty customer name", () => {
    const result = validateBookingRequest({
      ...validBooking,
      customer: {
        name: "   ",
      },
    }, fixedNow);

    expect(result.success).toBe(false);
  });

  it("rejects invalid email addresses", () => {
    const result = validateBookingRequest({
      ...validBooking,
      customer: {
        name: "Test Customer",
        email: "invalid-email",
      },
    }, fixedNow);

    expect(result.success).toBe(false);
  });

  it("allows optional phone and email", () => {
    const result = validateBookingRequest({
      ...validBooking,
      customer: {
        name: "Test Customer",
      },
    }, fixedNow);

    expect(result.success).toBe(true);
  });

  it("rejects oversized booking notes", () => {
    const result = validateBookingRequest({
      ...validBooking,
      customerNotes: "x".repeat(1001),
    }, fixedNow);

    expect(result.success).toBe(false);
  });

  it("rejects non-object request bodies", () => {
    expect(validateBookingRequest(null, fixedNow).success).toBe(false);
    expect(validateBookingRequest([], fixedNow).success).toBe(false);
    expect(validateBookingRequest("invalid", fixedNow).success).toBe(false);
  });

  it("rejects appointments in the past", () => {
    const result = validateBookingRequest(
      {
        ...validBooking,
        startsAt: "2026-10-20T10:00:00Z",
      },
      fixedNow
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.errors).toContain(
        "startsAt must be in the future"
      );
    }
  });

  it("rejects appointments more than 90 days ahead", () => {
    const result = validateBookingRequest(
      {
        ...validBooking,
        startsAt: "2027-02-01T10:00:00Z",
      },
      fixedNow
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.errors).toContain(
        "startsAt cannot be more than 90 days ahead"
      );
    }
  });

  it("accepts appointments exactly 90 days ahead", () => {
    const maxDate = new Date(fixedNow);
    maxDate.setUTCDate(maxDate.getUTCDate() + 90);

    const result = validateBookingRequest(
      {
        ...validBooking,
        startsAt: maxDate.toISOString(),
      },
      fixedNow
    );

    expect(result.success).toBe(true);
  });

  it("rejects an appointment starting right now", () => {
    const result = validateBookingRequest(
      {
        ...validBooking,
        startsAt: fixedNow.toISOString(),
      },
      fixedNow
    );

    expect(result.success).toBe(false);
  });
});
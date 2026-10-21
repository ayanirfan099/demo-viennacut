
import { describe, expect, it } from "vitest";
import {
  hasBookingConflict,
  intervalsOverlap,
} from "./overlap";

function slot(start: string, end: string) {
  return {
    startsAt: new Date(start),
    endsAt: new Date(end),
  };
}

describe("Booking conflict validation", () => {
  const existing = [
    slot("2026-11-02T09:00:00Z", "2026-11-02T09:30:00Z"),
    slot("2026-11-02T10:00:00Z", "2026-11-02T10:30:00Z"),
  ];

  it("detects an overlapping appointment", () => {
    const requested = slot(
      "2026-11-02T10:15:00Z",
      "2026-11-02T10:45:00Z"
    );

    expect(hasBookingConflict(requested, existing)).toBe(true);
  });

  it("allows an available gap between bookings", () => {
    const requested = slot(
      "2026-11-02T09:30:00Z",
      "2026-11-02T10:00:00Z"
    );

    expect(hasBookingConflict(requested, existing)).toBe(false);
  });

  it("allows an empty appointment schedule", () => {
    const requested = slot(
      "2026-11-02T12:00:00Z",
      "2026-11-02T12:30:00Z"
    );

    expect(hasBookingConflict(requested, [])).toBe(false);
  });

  it("rejects zero-duration appointments", () => {
    const invalid = slot(
      "2026-11-02T10:00:00Z",
      "2026-11-02T10:00:00Z"
    );

    expect(() => hasBookingConflict(invalid, existing)).toThrow(
      "Invalid time interval"
    );
  });

  it("rejects invalid date values", () => {
    const invalid = slot(
      "invalid",
      "2026-11-02T11:00:00Z"
    );

    expect(() => hasBookingConflict(invalid, existing)).toThrow(
      "Invalid time interval"
    );
  });

  it("rejects missing Date objects", () => {
    const invalid = {
      startsAt: null,
      endsAt: new Date("2026-11-02T11:00:00Z"),
    };

    expect(() =>
      intervalsOverlap(
        invalid as unknown as Parameters<typeof intervalsOverlap>[0],
        existing[0]
      )
    ).toThrow("Invalid time interval");
  });

  it("compares timezone offsets correctly", () => {
    const vienna = slot(
      "2026-11-02T11:00:00+01:00",
      "2026-11-02T11:30:00+01:00"
    );

    expect(hasBookingConflict(vienna, existing)).toBe(true);
  });
});

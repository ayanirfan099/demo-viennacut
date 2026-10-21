
import { describe, expect, it } from "vitest";
import { intervalsOverlap } from "./overlap";

function interval(start: string, end: string) {
  return {
    startsAt: new Date(start),
    endsAt: new Date(end),
  };
}

describe("Appointment overlap detection", () => {
  const existing = interval(
    "2026-11-02T10:00:00Z",
    "2026-11-02T10:30:00Z"
  );

  it("detects overlapping appointments", () => {
    const requested = interval(
      "2026-11-02T10:15:00Z",
      "2026-11-02T10:45:00Z"
    );

    expect(intervalsOverlap(existing, requested)).toBe(true);
  });

  it("allows back-to-back appointments", () => {
    const requested = interval(
      "2026-11-02T10:30:00Z",
      "2026-11-02T11:00:00Z"
    );

    expect(intervalsOverlap(existing, requested)).toBe(false);
  });

  it("allows appointments before existing bookings", () => {
    const requested = interval(
      "2026-11-02T09:30:00Z",
      "2026-11-02T10:00:00Z"
    );

    expect(intervalsOverlap(existing, requested)).toBe(false);
  });

  it("detects contained appointments", () => {
    const requested = interval(
      "2026-11-02T10:05:00Z",
      "2026-11-02T10:20:00Z"
    );

    expect(intervalsOverlap(existing, requested)).toBe(true);
  });

  it("detects appointments spanning an existing booking", () => {
    const requested = interval(
      "2026-11-02T09:45:00Z",
      "2026-11-02T10:45:00Z"
    );

    expect(intervalsOverlap(existing, requested)).toBe(true);
  });

  it("rejects zero-duration appointments", () => {
    const invalid = interval(
      "2026-11-02T10:00:00Z",
      "2026-11-02T10:00:00Z"
    );

    expect(() => intervalsOverlap(existing, invalid)).toThrow(
      "Invalid time interval"
    );
  });

  it("rejects reversed appointments", () => {
    const invalid = interval(
      "2026-11-02T11:00:00Z",
      "2026-11-02T10:30:00Z"
    );

    expect(() => intervalsOverlap(existing, invalid)).toThrow(
      "Invalid time interval"
    );
  });

  it("rejects invalid dates", () => {
    const invalid = interval(
      "invalid-date",
      "2026-11-02T11:00:00Z"
    );

    expect(() => intervalsOverlap(existing, invalid)).toThrow(
      "Invalid time interval"
    );
  });
});

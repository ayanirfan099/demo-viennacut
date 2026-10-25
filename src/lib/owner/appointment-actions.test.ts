import { describe, expect, it } from "vitest";
import {
  getAllowedAppointmentActions,
  isAppointmentConflict,
} from "./appointment-actions";

describe("owner appointment actions", () => {
  it("allows confirming or cancelling pending appointments", () => {
    expect(getAllowedAppointmentActions("PENDING")).toEqual([
      "CONFIRMED",
      "CANCELLED",
    ]);
  });

  it("allows only cancellation for confirmed appointments", () => {
    expect(getAllowedAppointmentActions("CONFIRMED")).toEqual([
      "CANCELLED",
    ]);
  });

  it.each(["CANCELLED", "COMPLETED", "NO_SHOW"] as const)(
    "disallows changes for %s appointments",
    (status) => {
      expect(getAllowedAppointmentActions(status)).toEqual([]);
    },
  );

  it("recognizes concurrent update conflicts", () => {
    expect(isAppointmentConflict(409, "STATE_CONFLICT")).toBe(true);
  });

  it("recognizes invalid status transitions", () => {
    expect(isAppointmentConflict(409, "INVALID_TRANSITION")).toBe(true);
  });

  it("does not mistake other API failures for conflicts", () => {
    expect(isAppointmentConflict(403, "FORBIDDEN")).toBe(false);
    expect(isAppointmentConflict(500, "INTERNAL_ERROR")).toBe(false);
    expect(isAppointmentConflict(409, "UNKNOWN_ERROR")).toBe(false);
  });
});

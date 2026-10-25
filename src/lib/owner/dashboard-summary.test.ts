import { describe, expect, it } from "vitest";
import type {
  OwnerAppointment,
  OwnerAppointmentStatus,
} from "./api-types";
import { summarizeAppointments } from "./dashboard-summary";

function appointment(
  status: OwnerAppointmentStatus,
  id: string,
): OwnerAppointment {
  return {
    id,
    startsAt: "2026-10-25T10:00:00.000Z",
    endsAt: "2026-10-25T10:30:00.000Z",
    status,
    customer: { name: "Customer", email: null, phone: null },
    service: { id: "service-1", name: "Haircut" },
    barber: { id: "barber-1", name: "Alex" },
    priceCents: 2000,
    customerNotes: null,
    internalNotes: null,
  };
}

describe("owner dashboard summaries", () => {
  it("returns zero counts for an empty day", () => {
    expect(summarizeAppointments([])).toEqual({
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
    });
  });

  it("counts appointment statuses correctly", () => {
    const appointments = [
      appointment("PENDING", "1"),
      appointment("PENDING", "2"),
      appointment("CONFIRMED", "3"),
      appointment("CANCELLED", "4"),
    ];

    expect(summarizeAppointments(appointments)).toEqual({
      total: 4,
      pending: 2,
      confirmed: 1,
      cancelled: 1,
    });
  });

  it("includes completed and no-show appointments in total", () => {
    const appointments = [
      appointment("COMPLETED", "1"),
      appointment("NO_SHOW", "2"),
    ];

    expect(summarizeAppointments(appointments)).toEqual({
      total: 2,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
    });
  });
});

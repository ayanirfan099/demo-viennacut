import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  OwnerAppointment,
  OwnerAppointmentsResponse,
} from "./api-types";

vi.mock("./api", () => ({
  getOwnerAppointments: vi.fn(),
}));

import { getOwnerAppointments } from "./api";
import { getCalendarAppointments } from "./calendar-data";

const mockedFetch = vi.mocked(getOwnerAppointments);

function makeAppointments(count: number, start = 0): OwnerAppointment[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `appointment-${start + index}`,
    startsAt: "2026-10-25T10:00:00.000Z",
    endsAt: "2026-10-25T10:30:00.000Z",
    status: "PENDING",
    customer: { name: "Customer", email: null, phone: null },
    service: { id: "service-1", name: "Haircut" },
    barber: { id: "barber-1", name: "Alex" },
    priceCents: 2000,
    customerNotes: null,
    internalNotes: null,
  }));
}

function pageResponse(
  data: OwnerAppointment[],
  total: number,
  page: number,
): OwnerAppointmentsResponse {
  return { data, total, page, limit: 100 };
}

beforeEach(() => {
  mockedFetch.mockReset();
});

describe("Vienna calendar pagination", () => {
  it("fetches multiple pages for more than 100 appointments", async () => {
    mockedFetch
      .mockResolvedValueOnce(
        pageResponse(makeAppointments(100), 150, 1),
      )
      .mockResolvedValueOnce(
        pageResponse(makeAppointments(50, 100), 150, 2),
      );

    const result = await getCalendarAppointments("2026-10-25");

    expect(result).toHaveLength(150);
    expect(new Set(result.map((item) => item.id)).size).toBe(150);

    expect(mockedFetch).toHaveBeenNthCalledWith(
      1,
      { date: "2026-10-25", page: 1, limit: 100 },
      undefined,
    );

    expect(mockedFetch).toHaveBeenNthCalledWith(
      2,
      { date: "2026-10-25", page: 2, limit: 100 },
      undefined,
    );
  });

  it("stops after collecting all appointments", async () => {
    mockedFetch.mockResolvedValueOnce(
      pageResponse(makeAppointments(20), 20, 1),
    );

    const result = await getCalendarAppointments("2026-10-25");

    expect(result).toHaveLength(20);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("handles an empty calendar day", async () => {
    mockedFetch.mockResolvedValueOnce(
      pageResponse([], 0, 1),
    );

    const result = await getCalendarAppointments("2026-10-25");

    expect(result).toEqual([]);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("stops pagination when the request is cancelled", async () => {
    const controller = new AbortController();

    mockedFetch.mockImplementationOnce(async () => {
      controller.abort();
      return pageResponse(makeAppointments(100), 200, 1);
    });

    await expect(
      getCalendarAppointments("2026-10-25", controller.signal),
    ).rejects.toMatchObject({
      name: "AbortError",
    });

    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });
});

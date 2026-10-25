import { describe, expect, it } from "vitest";
import {
  shiftViennaDate,
  formatCalendarHeading,
} from "./calendar-date";

describe("Vienna calendar dates", () => {
  it("moves forward one calendar day", () => {
    expect(shiftViennaDate("2026-10-25", 1))
      .toBe("2026-10-26");
  });

  it("moves backward one calendar day", () => {
    expect(shiftViennaDate("2026-10-25", -1))
      .toBe("2026-10-24");
  });

  it("handles month boundaries", () => {
    expect(shiftViennaDate("2026-10-31", 1))
      .toBe("2026-11-01");
  });

  it("handles leap years", () => {
    expect(shiftViennaDate("2028-02-28", 1))
      .toBe("2028-02-29");
  });

  it("navigates across the spring DST transition", () => {
    expect(shiftViennaDate("2026-03-29", 1))
      .toBe("2026-03-30");
  });

  it("navigates across the autumn DST transition", () => {
    expect(shiftViennaDate("2026-10-25", 1))
      .toBe("2026-10-26");
  });

  it("formats the calendar heading", () => {
    expect(formatCalendarHeading("2026-10-25"))
      .toBe("Sunday, 25 October 2026");
  });

  it("rejects invalid dates", () => {
    expect(() => shiftViennaDate("invalid", 1))
      .toThrow("Invalid calendar date");
  });
});

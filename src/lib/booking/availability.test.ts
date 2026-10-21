import { describe, expect, it } from "vitest";
import {
  generateAvailableSlots,
  isSlotAvailable,
  type GenerateAvailableSlotsInput,
} from "./availability";

const NOW = new Date("2026-10-01T00:00:00.000Z");
const at = (iso: string) => new Date(iso);

function run(overrides: Partial<GenerateAvailableSlotsInput> = {}) {
  return generateAvailableSlots({
    date: "2026-10-24",
    durationMinutes: 30,
    workingPeriods: [{ startMinute: 540, endMinute: 600 }], // 09:00–10:00
    appointments: [],
    blockedTimes: [],
    now: NOW,
    ...overrides,
  });
}
const labels = (slots: { localTime: string }[]) => slots.map((s) => s.localTime);

describe("normal days", () => {
  it("09:00–10:00 with 30-min service gives 09:00..09:30", () => {
    expect(labels(run())).toEqual(["09:00", "09:10", "09:20", "09:30"]);
  });

  it("returns UTC instants and Vienna labels (CEST, UTC+2)", () => {
    const slots = run({ workingPeriods: [{ startMinute: 600, endMinute: 960 }] });
    expect(slots[0]).toEqual({ startsAt: "2026-10-24T08:00:00.000Z", localTime: "10:00" });
    expect(slots[1]).toEqual({ startsAt: "2026-10-24T08:10:00.000Z", localTime: "10:10" });
    expect(slots.at(-1)?.localTime).toBe("15:30");
  });

  it("uses CET (UTC+1) in winter without hardcoding", () => {
    const slots = run({ date: "2026-12-10" });
    expect(slots[0].startsAt).toBe("2026-12-10T08:00:00.000Z");
  });

  it("barber not working returns []", () => {
    expect(run({ workingPeriods: [] })).toEqual([]);
  });

  it("service longer than working period returns []", () => {
    expect(run({ durationMinutes: 90 })).toEqual([]);
  });

  it("is sorted and unique when working periods overlap", () => {
    const slots = run({
      workingPeriods: [
        { startMinute: 540, endMinute: 660 },
        { startMinute: 600, endMinute: 720 },
        { startMinute: 540, endMinute: 660 },
      ],
    });
    const starts = slots.map((s) => s.startsAt);
    expect(new Set(starts).size).toBe(starts.length);
    expect(starts).toEqual([...starts].sort());
    expect(labels(slots)[0]).toBe("09:00");
    expect(labels(slots).at(-1)).toBe("11:30");
  });

  it("does not let a slot straddle two separate periods", () => {
    const slots = run({
      workingPeriods: [
        { startMinute: 540, endMinute: 600 },
        { startMinute: 600, endMinute: 660 }, // adjacent but separate
      ],
    });
    expect(labels(slots)).toContain("09:30");
    expect(labels(slots)).not.toContain("09:40");
    expect(labels(slots)).toContain("10:00");
  });
});

describe("conflicts", () => {
  it("removes every candidate overlapping an appointment 09:20–09:50", () => {
    const slots = run({
      appointments: [
        { startsAt: at("2026-10-24T07:20:00Z"), endsAt: at("2026-10-24T07:50:00Z") },
      ],
    });
    expect(labels(slots)).toEqual([]);
  });

  it("allows a candidate starting exactly when a booking ends", () => {
    const slots = run({
      workingPeriods: [{ startMinute: 540, endMinute: 660 }],
      appointments: [
        { startsAt: at("2026-10-24T07:00:00Z"), endsAt: at("2026-10-24T07:30:00Z") }, // 09:00–09:30
      ],
    });
    expect(labels(slots)[0]).toBe("09:30");
  });

  it("allows a candidate ending exactly when a booking starts", () => {
    const slots = run({
      workingPeriods: [{ startMinute: 540, endMinute: 660 }],
      appointments: [
        { startsAt: at("2026-10-24T07:30:00Z"), endsAt: at("2026-10-24T08:00:00Z") }, // 09:30–10:00
      ],
    });
    expect(labels(slots)).toContain("09:00");
    expect(labels(slots)).not.toContain("09:10");
    expect(labels(slots)).toContain("10:00");
  });

  it("no appointment may overlap a blocked break 12:00–13:00", () => {
    const slots = run({
      workingPeriods: [{ startMinute: 660, endMinute: 840 }], // 11:00–14:00
      blockedTimes: [
        { startsAt: at("2026-10-24T10:00:00Z"), endsAt: at("2026-10-24T11:00:00Z") },
      ],
    });
    const l = labels(slots);
    expect(l).toContain("11:30");
    expect(l).not.toContain("11:40");
    expect(l).not.toContain("12:30");
    expect(l).not.toContain("12:50");
    expect(l).toContain("13:00");
    expect(l.at(-1)).toBe("13:30");
  });
});

describe("past slots", () => {
  it("excludes slots at or before now", () => {
    const slots = run({ now: at("2026-10-24T07:10:00Z") }); // 09:10 Vienna
    expect(labels(slots)).toEqual(["09:20", "09:30"]);
  });

  it("excludes everything when the day is in the past", () => {
    expect(run({ now: at("2026-10-25T00:00:00Z") })).toEqual([]);
  });
});

describe("invalid input", () => {
  it.each(["2026-02-30", "2026-13-01", "2026-1-1", "24-10-2026", "", "2026-10-24T10:00"])(
    "rejects date %j",
    (date) => {
      expect(() => run({ date })).toThrow();
    },
  );

  it.each([0, -30, 12.5, NaN, Infinity])("rejects duration %j", (d) => {
    expect(() => run({ durationMinutes: d })).toThrow();
  });

  it.each([
    { startMinute: 600, endMinute: 600 },
    { startMinute: 700, endMinute: 600 },
    { startMinute: -1, endMinute: 600 },
    { startMinute: 540, endMinute: 1441 },
    { startMinute: 540.5, endMinute: 600 },
    { startMinute: NaN, endMinute: 600 },
  ])("rejects working period %j", (p) => {
    expect(() => run({ workingPeriods: [p] })).toThrow();
  });

  it("rejects an invalid now", () => {
    expect(() => run({ now: new Date("nope") })).toThrow();
  });
});

describe("DST", () => {
  it("spring (2026-03-29): skips nonexistent local times", () => {
    const slots = generateAvailableSlots({
      date: "2026-03-29",
      durationMinutes: 10,
      workingPeriods: [{ startMinute: 60, endMinute: 240 }], // 01:00–04:00 wall clock
      appointments: [],
      blockedTimes: [],
      now: new Date("2026-03-01T00:00:00Z"),
    });
    const l = labels(slots);
    expect(l).toContain("01:50");
    expect(l).toContain("03:00");
    expect(l.some((x) => x.startsWith("02:"))).toBe(false);
    expect(slots[0].startsAt).toBe("2026-03-29T00:00:00.000Z"); // 01:00 CET
    expect(slots).toHaveLength(12); // only 2 elapsed hours exist in that window
    const i = l.indexOf("01:50");
    expect(slots[i + 1].startsAt).toBe("2026-03-29T01:00:00.000Z"); // 03:00 CEST right after
  });

  it("spring: a service can't use the missing hour to fit", () => {
    const slots = generateAvailableSlots({
      date: "2026-03-29",
      durationMinutes: 60,
      workingPeriods: [{ startMinute: 60, endMinute: 180 }], // 01:00–03:00 wall = 1h elapsed
      appointments: [],
      blockedTimes: [],
      now: new Date("2026-03-01T00:00:00Z"),
    });
    expect(labels(slots)).toEqual(["01:00"]);
  });

  it("spring: working period starting inside the gap begins at the transition", () => {
    const slots = generateAvailableSlots({
      date: "2026-03-29",
      durationMinutes: 30,
      workingPeriods: [{ startMinute: 150, endMinute: 240 }], // 02:30–04:00
      appointments: [],
      blockedTimes: [],
      now: new Date("2026-03-01T00:00:00Z"),
    });
    expect(labels(slots)[0]).toBe("03:00");
    expect(slots[0].startsAt).toBe("2026-03-29T01:00:00.000Z");
  });

  it("autumn (2026-10-25): repeated hour keeps two distinct UTC instants", () => {
    const slots = generateAvailableSlots({
      date: "2026-10-25",
      durationMinutes: 30,
      workingPeriods: [{ startMinute: 120, endMinute: 240 }], // 02:00–04:00 wall clock
      appointments: [],
      blockedTimes: [],
      now: new Date("2026-10-01T00:00:00Z"),
    });
    const repeated = slots.filter((s) => s.localTime === "02:30");
    expect(repeated.map((s) => s.startsAt)).toEqual([
      "2026-10-25T00:30:00.000Z", // 02:30 CEST
      "2026-10-25T01:30:00.000Z", // 02:30 CET
    ]);
    const starts = slots.map((s) => s.startsAt);
    expect(new Set(starts).size).toBe(starts.length);
    expect(starts).toEqual([...starts].sort());
    expect(slots[0].startsAt).toBe("2026-10-25T00:00:00.000Z");
    expect(slots).toHaveLength(16); // 3 elapsed hours, 30-min service, 10-min step
  });

  it("autumn: a booking in the first 02:30 does not block the second", () => {
    const slots = generateAvailableSlots({
      date: "2026-10-25",
      durationMinutes: 30,
      workingPeriods: [{ startMinute: 120, endMinute: 240 }],
      appointments: [
        { startsAt: at("2026-10-25T00:30:00Z"), endsAt: at("2026-10-25T01:00:00Z") },
      ],
      blockedTimes: [],
      now: new Date("2026-10-01T00:00:00Z"),
    });
    const starts = slots.map((s) => s.startsAt);
    expect(starts).not.toContain("2026-10-25T00:30:00.000Z");
    expect(starts).toContain("2026-10-25T01:30:00.000Z");
    expect(starts).toContain("2026-10-25T01:00:00.000Z"); // 02:00 CET, right after booking ends
  });
});

describe("isSlotAvailable", () => {
  it("matches by instant, not string", () => {
    const slots = run();
    expect(isSlotAvailable(slots, "2026-10-24T07:00:00.000Z")).toBe(true);
    expect(isSlotAvailable(slots, "2026-10-24T07:00:00Z")).toBe(true);
    expect(isSlotAvailable(slots, "2026-10-24T09:00:00+02:00")).toBe(true);
    expect(isSlotAvailable(slots, new Date("2026-10-24T07:10:00Z"))).toBe(true);
    expect(isSlotAvailable(slots, "2026-10-24T07:05:00Z")).toBe(false);
    expect(isSlotAvailable(slots, "garbage")).toBe(false);
  });
});
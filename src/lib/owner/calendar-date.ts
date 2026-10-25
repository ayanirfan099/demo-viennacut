import { DateTime } from "luxon";

const ZONE = "Europe/Vienna";

export function getViennaToday(): string {
  return DateTime.now().setZone(ZONE).toISODate()!;
}

export function shiftViennaDate(
  date: string,
  days: number,
): string {
  const result = DateTime.fromISO(date, {
    zone: ZONE,
  });

  if (!result.isValid) {
    throw new Error("Invalid calendar date");
  }

  return result.plus({ days }).toISODate()!;
}

export function formatCalendarHeading(date: string): string {
  const result = DateTime.fromISO(date, {
    zone: ZONE,
  });

  if (!result.isValid) {
    throw new Error("Invalid calendar date");
  }

  return result.toFormat("cccc, dd LLLL yyyy");
}


import { DateTime } from "luxon";
import {
  hasBookingConflict,
  type TimeInterval,
} from "./overlap";

export const BUSINESS_TIME_ZONE = "Europe/Vienna";
export const SLOT_INCREMENT_MINUTES = 10;

const MINUTE_MS = 60_000;

export type WorkingPeriod = {
  startMinute: number;
  endMinute: number;
};

export type AvailabilitySlot = {
  startsAt: string;
  localTime: string;
};

export type GenerateAvailableSlotsInput = {
  date: string;
  durationMinutes: number;
  workingPeriods: readonly WorkingPeriod[];
  appointments: readonly TimeInterval[];
  blockedTimes: readonly TimeInterval[];
  now?: Date;
};

// Preserve compatibility with the previous type name.
export type AvailabilityInput = GenerateAvailableSlotsInput;

function validateInput(
  input: GenerateAvailableSlotsInput
): DateTime {
  const {
    date,
    durationMinutes,
    workingPeriods,
    appointments,
    blockedTimes,
    now,
  } = input;

  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    throw new Error("Invalid availability date");
  }

  const day = DateTime.fromISO(date, {
    zone: BUSINESS_TIME_ZONE,
  });

  if (!day.isValid || day.toISODate() !== date) {
    throw new Error("Invalid availability date");
  }

  if (
    !Number.isSafeInteger(durationMinutes) ||
    durationMinutes <= 0 ||
    durationMinutes > 1440
  ) {
    throw new Error("Invalid service duration");
  }

  if (
    now !== undefined &&
    (!(now instanceof Date) ||
      !Number.isFinite(now.getTime()))
  ) {
    throw new Error("Invalid current time");
  }

  if (
    !Array.isArray(workingPeriods) ||
    !Array.isArray(appointments) ||
    !Array.isArray(blockedTimes)
  ) {
    throw new Error("Invalid availability input");
  }

  for (const period of workingPeriods) {
    if (
      !period ||
      !Number.isInteger(period.startMinute) ||
      !Number.isInteger(period.endMinute) ||
      period.startMinute < 0 ||
      period.endMinute > 1440 ||
      period.startMinute >= period.endMinute
    ) {
      throw new Error("Invalid working period");
    }
  }

  return day;
}

function localMinuteOfDay(date: DateTime): number {
  return date.hour * 60 + date.minute;
}

function fitsWorkingPeriod(
  start: DateTime,
  end: DateTime,
  date: string,
  period: WorkingPeriod
): boolean {
  if (start.toISODate() !== date) {
    return false;
  }

  const startMinute = localMinuteOfDay(start);

  let endMinute: number;

  if (end.toISODate() === date) {
    endMinute = localMinuteOfDay(end);
  } else if (
    end.toISODate() ===
      start.startOf("day").plus({ days: 1 }).toISODate() &&
    end.hour === 0 &&
    end.minute === 0
  ) {
    endMinute = 1440;
  } else {
    return false;
  }

  const startsInsidePeriod =
    startMinute >= period.startMinute &&
    startMinute < period.endMinute;

  const aligned =
    (startMinute - period.startMinute) %
      SLOT_INCREMENT_MINUTES === 0;

  const endsInsidePeriod =
    endMinute <= period.endMinute;

  // During the autumn DST rollback, the displayed
  // local end time may be earlier than the start.
  const crossesFallBack =
    end.offset < start.offset;

  return (
    startsInsidePeriod &&
    aligned &&
    endsInsidePeriod &&
    (endMinute >= startMinute || crossesFallBack)
  );
}

export function generateAvailableSlots(
  input: GenerateAvailableSlotsInput
): AvailabilitySlot[] {
  const day = validateInput(input);

  const {
    date,
    durationMinutes,
    workingPeriods,
    appointments,
    blockedTimes,
    now = new Date(),
  } = input;

  if (workingPeriods.length === 0) {
    return [];
  }

  const conflicts: TimeInterval[] = [
    ...appointments,
    ...blockedTimes,
  ];

  const dayStart = day.startOf("day");
  const nextDay = dayStart.plus({ days: 1 });

  const nowMs = now.getTime();
  const durationMs = durationMinutes * MINUTE_MS;
  const incrementMs = SLOT_INCREMENT_MINUTES * MINUTE_MS;

  const slots: AvailabilitySlot[] = [];
  const seen = new Set<number>();

  // Iterate through real UTC instants.
  // This skips nonexistent spring DST times and preserves
  // both occurrences of the repeated autumn hour.
  for (
    let timestamp = dayStart.toMillis();
    timestamp < nextDay.toMillis();
    timestamp += incrementMs
  ) {
    if (
      timestamp <= nowMs ||
      seen.has(timestamp)
    ) {
      continue;
    }

    const localStart = DateTime.fromMillis(
      timestamp,
      { zone: BUSINESS_TIME_ZONE }
    );

    const localEnd = DateTime.fromMillis(
      timestamp + durationMs,
      { zone: BUSINESS_TIME_ZONE }
    );

    const fits = workingPeriods.some((period) =>
      fitsWorkingPeriod(
        localStart,
        localEnd,
        date,
        period
      )
    );

    if (!fits) {
      continue;
    }

    const requested: TimeInterval = {
      startsAt: new Date(timestamp),
      endsAt: new Date(timestamp + durationMs),
    };

    if (hasBookingConflict(requested, conflicts)) {
      continue;
    }

    seen.add(timestamp);

    slots.push({
      startsAt: requested.startsAt.toISOString(),
      localTime: localStart.toFormat("HH:mm"),
    });
  }

  // UTC iteration already produces chronological order.
  return slots;
}

/**
 * Check whether a requested UTC instant matches
 * one of the generated available slots.
 *
 * Different valid timestamp representations of the
 * same instant are treated as equivalent.
 */
export function isSlotAvailable(
  slots: readonly AvailabilitySlot[],
  requestedStart: string | Date
): boolean {
  const timestamp =
    requestedStart instanceof Date
      ? requestedStart.getTime()
      : typeof requestedStart === "string"
        ? Date.parse(requestedStart)
        : NaN;

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return slots.some(
    (slot) =>
      Date.parse(slot.startsAt) === timestamp
  );
}

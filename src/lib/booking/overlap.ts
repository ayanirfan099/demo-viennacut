
export type TimeInterval = {
  startsAt: Date;
  endsAt: Date;
};

function validateInterval(interval: TimeInterval): void {
  if (
    !interval ||
    !(interval.startsAt instanceof Date) ||
    !(interval.endsAt instanceof Date)
  ) {
    throw new Error("Invalid time interval");
  }

  const start = interval.startsAt.getTime();
  const end = interval.endsAt.getTime();

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start >= end
  ) {
    throw new Error("Invalid time interval");
  }
}

/**
 * Check whether two half-open intervals overlap.
 * Back-to-back appointments are allowed.
 */
export function intervalsOverlap(
  first: TimeInterval,
  second: TimeInterval
): boolean {
  validateInterval(first);
  validateInterval(second);

  return (
    first.startsAt.getTime() < second.endsAt.getTime() &&
    second.startsAt.getTime() < first.endsAt.getTime()
  );
}

/**
 * Check whether a requested appointment conflicts with
 * any existing appointment or blocked time interval.
 */
export function hasBookingConflict(
  requested: TimeInterval,
  existingIntervals: readonly TimeInterval[]
): boolean {
  validateInterval(requested);

  for (const existing of existingIntervals) {
    if (intervalsOverlap(requested, existing)) {
      return true;
    }
  }

  return false;
}


export type TimeInterval = {
  startsAt: Date;
  endsAt: Date;
};

function validateInterval(interval: TimeInterval): void {
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

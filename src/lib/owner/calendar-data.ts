import { getOwnerAppointments } from "./api";
import type { OwnerAppointment } from "./api-types";

const PAGE_SIZE = 100;

export async function getCalendarAppointments(
  date: string,
  signal?: AbortSignal,
): Promise<OwnerAppointment[]> {
  const collected: OwnerAppointment[] = [];
  let page = 1;

  while (!signal?.aborted) {
    const result = await getOwnerAppointments(
      { date, page, limit: PAGE_SIZE },
      signal,
    );

    if (signal?.aborted) {
      throw new DOMException("Request aborted", "AbortError");
    }

    collected.push(...result.data);

    if (
      result.data.length === 0 ||
      collected.length >= result.total
    ) {
      break;
    }

    page += 1;
  }

  if (signal?.aborted) {
    throw new DOMException("Request aborted", "AbortError");
  }

  return collected;
}

/** Fictional demo settings. Do not add unverified addresses or contact details. */
export const business = {
  name: "Vienna Cuts",
  currency: "EUR",
  timeZone: "Europe/Vienna",
  isDemo: true,
  contact: { address: null, phone: null, email: null },
  socials: [],
  slotIncrementMinutes: 10,
  openingHours: [
    { day: 1, startMinute: 540, endMinute: 1080 },
    { day: 2, startMinute: 540, endMinute: 1080 },
    { day: 3, startMinute: 540, endMinute: 1080 },
    { day: 4, startMinute: 540, endMinute: 1080 },
    { day: 5, startMinute: 540, endMinute: 1080 },
    { day: 6, startMinute: 600, endMinute: 960 },
  ],
} as const;
export function openingRange(day: number) {
  const hours = business.openingHours.find((entry) => entry.day === day);
  if (!hours) return null;
  const clock = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return `${clock(hours.startMinute)} – ${clock(hours.endMinute)}`;
}

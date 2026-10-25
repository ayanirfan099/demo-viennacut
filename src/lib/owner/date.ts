const VIENNA_TIME_ZONE = "Europe/Vienna";

export function formatViennaDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: VIENNA_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function formatViennaTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: VIENNA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

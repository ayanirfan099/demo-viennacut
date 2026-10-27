"use client";
import { useEffect, useState } from "react";
import type {
  ApiBarber,
  AvailabilitySlot,
  AvailabilityResponse,
} from "@/lib/booking/api-types";
import { useLanguage } from "@/components/site/LanguageProvider";
type Slot = AvailabilitySlot & { barberId: string };
type Props = {
  serviceId: string;
  barberId: string;
  barbers: ApiBarber[];
  initialDate: string;
  initialTime: string;
  onBack: () => void;
  onContinue: (date: string, startsAt: string, barberId: string) => void;
};
export default function DateTimeSelection({
  serviceId,
  barberId,
  barbers,
  initialDate,
  initialTime,
  onBack,
  onContinue,
}: Props) {
  const { t } = useLanguage();
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(Boolean(initialDate));
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const ids = barberId === "any" ? barbers.map((b) => b.id) : [barberId];
        const results = await Promise.all(
          ids.map(async (id) => {
            const params = new URLSearchParams({
              serviceId,
              barberId: id,
              date,
            });
            const response = await fetch(`/api/availability?${params}`, {
              signal: controller.signal,
            });
            if (!response.ok) throw Error("Availability unavailable");
            const data: AvailabilityResponse = await response.json();
            return data.slots.map((slot) => ({ ...slot, barberId: id }));
          }),
        );
        if (controller.signal.aborted) return;
        const unique = new Map<string, Slot>();
        for (const slot of results.flat())
          if (!unique.has(slot.startsAt)) unique.set(slot.startsAt, slot);
        setSlots(
          [...unique.values()].sort((a, b) =>
            a.startsAt.localeCompare(b.startsAt),
          ),
        );
      } catch {
        if (!controller.signal.aborted) {
          setError(true);
          setSlots([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [date, serviceId, barberId, barbers, retry]);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Vienna",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
  const minDate = `${today.year}-${today.month}-${today.day}`;
  const selected = slots.find((s) => s.startsAt === time);
  return (
    <section className="mt-10" aria-labelledby="datetime-heading">
      <h2 id="datetime-heading" className="text-2xl font-semibold">
        {t("Zeit für dich.", "Time for yourself.")}
      </h2>
      <p className="mt-2 text-muted">
        {t(
          "Alle Zeiten: Europe/Vienna. Freie Termine werden live geprüft.",
          "All times: Europe/Vienna. Available appointments are checked live.",
        )}
      </p>
      <label
        htmlFor="appointment-date"
        className="mt-8 block text-sm font-medium"
      >
        {t("Datum wählen", "Choose a date")}
      </label>
      <input
        id="appointment-date"
        type="date"
        min={minDate}
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setTime("");
          setSlots([]);
          setError(false);
          setLoading(Boolean(e.target.value));
        }}
        className="mt-3 w-full rounded-md border border-border bg-surface p-4 sm:max-w-xs"
      />
      {date && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">
            {t("Verfügbare Zeiten", "Available times")}
          </h3>
          {loading && (
            <p role="status" className="mt-5 text-muted">
              {t(
                "Freie Termine werden gesucht …",
                "Checking available appointments …",
              )}
            </p>
          )}
          {error && (
            <div role="alert" className="mt-5 border border-accent p-4">
              <p>
                {t(
                  "Termine konnten nicht geladen werden.",
                  "Appointment times could not be loaded.",
                )}
              </p>
              <button
                className="mt-2 underline"
                onClick={() => setRetry((n) => n + 1)}
              >
                {t("Erneut versuchen", "Try again")}
              </button>
            </div>
          )}
          {!loading && !error && !slots.length && (
            <p role="status" className="mt-5 text-muted">
              {t(
                "An diesem Tag sind keine Termine frei. Bitte wähle ein anderes Datum.",
                "No appointments are available on this date. Please choose another date.",
              )}
            </p>
          )}
          {!loading && !error && (
            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot.startsAt}
                  aria-pressed={time === slot.startsAt}
                  onClick={() => setTime(slot.startsAt)}
                  className={`rounded-md border px-3 py-4 text-sm ${time === slot.startsAt ? "border-accent bg-accent/10 font-semibold" : "border-border bg-surface hover:border-accent"}`}
                >
                  {slot.localTime}
                </button>
              ))}
            </div>
          )}
          {barberId === "any" && selected && (
            <p className="mt-4 text-sm text-muted">
              {t("Dein Barber", "Your barber")}:{" "}
              {barbers.find((b) => b.id === selected.barberId)?.name}
            </p>
          )}
        </div>
      )}
      <div className="mt-10 flex justify-between gap-3">
        <button
          onClick={onBack}
          className="rounded-md border border-border px-6 py-3"
        >
          {t("Zurück", "Back")}
        </button>
        <button
          disabled={!selected || !date || date < minDate || loading || error}
          onClick={() => {
            if (selected) onContinue(date, time, selected.barberId);
          }}
          className="rounded-md bg-foreground px-7 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("Weiter", "Continue")} →
        </button>
      </div>
    </section>
  );
}

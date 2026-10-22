"use client";

import { useEffect, useState } from "react";
import type {
  AvailabilitySlot,
  AvailabilityResponse,
} from "@/lib/booking/api-types";

type DateTimeSelectionProps = {
  serviceId: string;
  barberId: string;
  onBack: () => void;
  onContinue: (date: string, startsAt: string) => void;
};

export default function DateTimeSelection({
  serviceId,
  barberId,
  onBack,
  onContinue,
}: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate || !serviceId || !barberId) {
      return;
    }

    const controller = new AbortController();

    async function loadAvailability() {
      setIsLoadingAvailability(true);

      try {
        const params = new URLSearchParams({
          serviceId,
          barberId,
          date: selectedDate,
        });

        const response = await fetch(
          `/api/availability?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load available appointment times.");
        }

        const data: AvailabilityResponse = await response.json();

        if (controller.signal.aborted) return;

        setAvailableSlots(data.slots);
      } catch (error) {
        if (controller.signal.aborted) return;

        setAvailabilityError(
          error instanceof Error
            ? error.message
            : "Unable to load available appointment times."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingAvailability(false);
        }
      }
    }

    void loadAvailability();

    return () => controller.abort();
  }, [selectedDate, serviceId, barberId]);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Vienna",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((parts, part) => {
      if (part.type !== "literal") parts[part.type] = part.value;
      return parts;
    }, {});

  const minDate = `${today.year}-${today.month}-${today.day}`;

  return (
    <section aria-labelledby="datetime-heading" className="mt-12">
      <h2 id="datetime-heading" className="text-2xl font-semibold">
        Select date & time
      </h2>

      <p className="mt-2 text-muted">
        Choose your preferred appointment date and time.
      </p>

      <div className="mt-8">
        <label
          htmlFor="appointment-date"
          className="block text-sm font-medium"
        >
          Appointment date
        </label>

        <input
          id="appointment-date"
          type="date"
          min={minDate}
          value={selectedDate}
          onChange={(event) => {
            setSelectedDate(event.target.value);
            setSelectedTime("");
            setAvailableSlots([]);
            setAvailabilityError(null);
            setIsLoadingAvailability(Boolean(event.target.value));
          }}
          className="mt-3 w-full rounded-md border border-border bg-surface px-4 py-3 sm:max-w-xs"
        />
      </div>

      {selectedDate && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">
            Available times
          </h3>

          <p className="mt-2 text-sm text-muted">
            All appointment times are shown in Vienna local time
            (Europe/Vienna).
          </p>

          {isLoadingAvailability && (
            <p role="status" className="mt-5 text-sm text-muted">
              Checking available appointment times...
            </p>
          )}

          {availabilityError && (
            <p
              role="alert"
              className="mt-5 rounded-md border border-red-500 p-4 text-sm text-red-600"
            >
              {availabilityError}
            </p>
          )}

          {!isLoadingAvailability &&
            !availabilityError &&
            availableSlots.length === 0 && (
              <p role="status" className="mt-5 text-sm text-muted">
                No appointments are available on this date.
                Please choose another date.
              </p>
            )}

          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {availableSlots.map((slot) => (
              <button
                key={slot.startsAt}
                type="button"
                aria-pressed={selectedTime === slot.startsAt}
                onClick={() => setSelectedTime(slot.startsAt)}
                className={`cursor-pointer rounded-md border px-3 py-3 text-sm transition-colors ${
                  selectedTime === slot.startsAt
                    ? "border-accent bg-accent/10 font-semibold"
                    : "border-border bg-surface hover:border-accent"
                }`}
              >
                {slot.localTime}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer rounded-md border border-border px-6 py-3 font-medium hover:border-accent"
        >
          Back
        </button>

        <button
          type="button"
          disabled={
            !selectedDate ||
            !selectedTime ||
            selectedDate < minDate ||
            isLoadingAvailability ||
            Boolean(availabilityError) ||
            !availableSlots.some((slot) => slot.startsAt === selectedTime)
          }
          onClick={() => onContinue(selectedDate, selectedTime)}
          className="cursor-pointer rounded-md bg-foreground px-7 py-3 font-medium text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </section>
  );
}

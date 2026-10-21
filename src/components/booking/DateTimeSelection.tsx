"use client";

import { useState } from "react";

type DateTimeSelectionProps = {
  onBack: () => void;
  onContinue: (date: string, time: string) => void;
};

const demoTimes = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
];

export default function DateTimeSelection({
  onBack,
  onContinue,
}: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

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
            Demo times only — real availability will be connected later.
            Times are shown in Vienna local time.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {demoTimes.map((time) => (
              <button
                key={time}
                type="button"
                aria-pressed={selectedTime === time}
                onClick={() => setSelectedTime(time)}
                className={`cursor-pointer rounded-md border px-3 py-3 text-sm transition-colors ${
                  selectedTime === time
                    ? "border-accent bg-accent/10 font-semibold"
                    : "border-border bg-surface hover:border-accent"
                }`}
              >
                {time}
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
          disabled={!selectedDate || !selectedTime || selectedDate < minDate}
          onClick={() => onContinue(selectedDate, selectedTime)}
          className="cursor-pointer rounded-md bg-foreground px-7 py-3 font-medium text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </section>
  );
}

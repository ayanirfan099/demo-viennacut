"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OwnerGuard from "@/components/owner/OwnerGuard";
import { OwnerApiError } from "@/lib/owner/api";
import { getCalendarAppointments } from "@/lib/owner/calendar-data";
import type { OwnerAppointment } from "@/lib/owner/api-types";
import {
  getViennaToday,
  shiftViennaDate,
  formatCalendarHeading,
} from "@/lib/owner/calendar-date";
import {
  formatViennaDateTime,
  formatViennaTime,
} from "@/lib/owner/date";


function CalendarContent() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(getViennaToday);
  const [appointments, setAppointments] = useState<OwnerAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<OwnerAppointment | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadDay() {
      try {
        const collected = await getCalendarAppointments(
          selectedDate,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        setAppointments(collected);
      } catch (caught) {
        if (controller.signal.aborted) return;

        if (caught instanceof OwnerApiError) {
          if (caught.status === 401) {
            router.replace("/owner/login");
            return;
          }

          if (caught.status === 403) {
            setError(
              caught.code === "FORBIDDEN"
                ? "You do not have permission to view appointments."
                : "Request rejected. Check the application configuration.",
            );
          } else {
            setError(caught.message);
          }
        } else {
          setError("Unable to load calendar appointments.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;

      setLoading(true);
      setError("");
      setAppointments([]);
      setSelectedAppointment(null);

      void loadDay();
    });

    return () => controller.abort();
  }, [selectedDate, refreshKey, router]);

  function changeDate(date: string) {
    if (!date || date === selectedDate) return;
    setSelectedDate(date);
  }

  function moveDate(days: number) {
    changeDate(shiftViennaDate(selectedDate, days));
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          Vienna Cuts Management
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Appointment Calendar
        </h1>

        <p className="mt-2 text-muted">
          Daily appointment schedule · Europe/Vienna
        </p>
      </div>

      <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {formatCalendarHeading(selectedDate)}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Vienna local date
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => moveDate(-1)}
              className="rounded-md border border-border px-4 py-2 hover:border-accent"
              aria-label="Previous day"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => changeDate(getViennaToday())}
              className="rounded-md border border-border px-4 py-2 hover:border-accent"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => moveDate(1)}
              className="rounded-md border border-border px-4 py-2 hover:border-accent"
              aria-label="Next day"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-5">
          <label htmlFor="calendar-date" className="text-sm font-medium">
            Choose date
          </label>

          <input
            id="calendar-date"
            type="date"
            value={selectedDate}
            onChange={(event) => changeDate(event.target.value)}
            className="rounded-md border border-border bg-white px-4 py-2"
          />

          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={loading}
            className="rounded-md bg-accent px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </section>

      <section className="mt-8" aria-label="Daily appointments">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800"
          >
            {error}
          </div>
        )}

        {loading ? (
          <p role="status" className="py-12 text-center text-muted">
            Loading calendar...
          </p>
        ) : error ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center">
            <p className="font-medium">Calendar unavailable.</p>
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="mt-4 text-accent underline"
            >
              Try again
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-10 text-center">
            <h2 className="text-lg font-semibold">
              No appointments scheduled
            </h2>
            <p className="mt-2 text-muted">
              There are no appointments for this Vienna date.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">
              {appointments.length} appointments
            </p>

            <div className="space-y-3">
              {appointments.map((appointment) => (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => setSelectedAppointment(appointment)}
                  className="w-full rounded-xl border border-border bg-white p-5 text-left transition hover:border-accent"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">
                        {formatViennaTime(appointment.startsAt)}
                        {" – "}
                        {formatViennaTime(appointment.endsAt)}
                      </p>

                      <p className="mt-2 font-medium">
                        {appointment.customer.name}
                      </p>

                      <p className="mt-1 text-sm text-muted">
                        {appointment.service.name} · {appointment.barber.name}
                      </p>
                    </div>

                    <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
                      {appointment.status.replace("_", " ")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {selectedAppointment && (
        <section
          aria-label="Appointment details"
          className="mt-8 rounded-xl border border-border bg-white p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              Appointment Details
            </h2>

            <button
              type="button"
              onClick={() => setSelectedAppointment(null)}
              className="rounded-md border border-border px-3 py-2"
            >
              Close
            </button>
          </div>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Customer</dt>
              <dd className="mt-1 font-medium">
                {selectedAppointment.customer.name}
              </dd>
            </div>

            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-1 break-words">
                {selectedAppointment.customer.email ?? "Not provided"}
              </dd>
            </div>

            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="mt-1">
                {selectedAppointment.customer.phone ?? "Not provided"}
              </dd>
            </div>

            <div>
              <dt className="text-muted">Service</dt>
              <dd className="mt-1">
                {selectedAppointment.service.name}
              </dd>
            </div>

            <div>
              <dt className="text-muted">Barber</dt>
              <dd className="mt-1">
                {selectedAppointment.barber.name}
              </dd>
            </div>

            <div>
              <dt className="text-muted">Status</dt>
              <dd className="mt-1">
                {selectedAppointment.status.replace("_", " ")}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-muted">Start time (Vienna)</dt>
              <dd className="mt-1">
                {formatViennaDateTime(selectedAppointment.startsAt)}
              </dd>
            </div>

            {selectedAppointment.customerNotes && (
              <div className="sm:col-span-2">
                <dt className="text-muted">Customer notes</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words">
                  {selectedAppointment.customerNotes}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </main>
  );
}

export default function OwnerCalendarPage() {
  return (
    <OwnerGuard>
      {() => <CalendarContent />}
    </OwnerGuard>
  );
}

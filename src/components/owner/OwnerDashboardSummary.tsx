"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCalendarAppointments } from "@/lib/owner/calendar-data";
import { getViennaToday } from "@/lib/owner/calendar-date";
import { OwnerApiError } from "@/lib/owner/api";
import {
  summarizeAppointments,
  type DashboardSummary,
} from "@/lib/owner/dashboard-summary";

export default function OwnerDashboardSummary() {
  const router = useRouter();
  const [date] = useState(getViennaToday);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      try {
        const appointments = await getCalendarAppointments(
          date,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        setSummary(summarizeAppointments(appointments));
      } catch (caught) {
        if (controller.signal.aborted) return;

        if (caught instanceof OwnerApiError) {
          if (caught.status === 401) {
            router.replace("/owner/login");
            return;
          }

          setError(
            caught.status === 403
              ? "You do not have permission to view appointments."
              : caught.message,
          );
        } else {
          setError("Unable to load appointment summary.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;

      setLoading(true);
      setError("");
      setSummary(null);
      void loadSummary();
    });

    return () => controller.abort();
  }, [date, refreshKey, router]);

  useEffect(() => {
    const refresh = () => setRefreshKey((key) => key + 1);
    window.addEventListener("owner-appointments-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("owner-appointments-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const cards = [
    { label: "Total appointments", value: summary?.total },
    { label: "Pending", value: summary?.pending },
    { label: "Confirmed", value: summary?.confirmed },
    { label: "Cancelled", value: summary?.cancelled },
  ];

  return (
    <section aria-label="Today's appointment summary" className="mb-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Today&apos;s Appointments</h2>
          <p className="mt-1 text-sm text-muted">Vienna date: {date}</p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => setRefreshKey((value) => value + 1)}
          className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="owner-kpis grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border border-t-4 border-t-accent bg-white p-6"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-3 text-4xl font-semibold tabular-nums">
              {loading || error ? "—" : (card.value ?? 0)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

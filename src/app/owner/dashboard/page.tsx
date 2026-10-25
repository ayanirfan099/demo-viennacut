"use client";

import Link from "next/link";
import OwnerGuard from "@/components/owner/OwnerGuard";
import OwnerDashboardSummary from "@/components/owner/OwnerDashboardSummary";

export default function OwnerDashboardPage() {
  return (
    <OwnerGuard>
      {(owner) => (
        <main className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Vienna Cuts Management
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              Owner Dashboard
            </h1>
            <p className="mt-2 text-muted">
              Signed in as {owner.email}
            </p>
          </div>

          <OwnerDashboardSummary />

          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/owner/appointments"
              className="rounded-xl border border-border bg-white p-8 transition hover:border-accent"
            >
              <h2 className="text-xl font-semibold">
                Appointments
              </h2>
              <p className="mt-3 text-muted">
                Review bookings, filter appointments, and manage their status.
              </p>
              <span className="mt-6 inline-block font-medium text-accent">
                Manage appointments →
              </span>
            </Link>

            <Link
              href="/owner/calendar"
              className="rounded-xl border border-border bg-white p-8 transition hover:border-accent"
            >
              <h2 className="text-xl font-semibold">
                Calendar
              </h2>
              <p className="mt-3 text-muted">
                View appointments by date using Vienna local time.
              </p>
              <span className="mt-6 inline-block font-medium text-accent">
                Open calendar →
              </span>
            </Link>
          </div>
        </main>
      )}
    </OwnerGuard>
  );
}

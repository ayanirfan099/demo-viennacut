"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import OwnerGuard from "@/components/owner/OwnerGuard";
import type { ApiBarber } from "@/lib/booking/api-types";
import AppointmentFilters, {
  type AppointmentFilterValues,
} from "@/components/owner/AppointmentFilters";
import {
  getOwnerAppointments,
  updateOwnerAppointment,
  OwnerApiError,
} from "@/lib/owner/api";
import type {
  OwnerAppointment,
  OwnerAppointmentsResponse,
  OwnerStatusUpdateRequest,
} from "@/lib/owner/api-types";
import { formatViennaDateTime } from "@/lib/owner/date";
import {
  getAllowedAppointmentActions,
  isAppointmentConflict,
} from "@/lib/owner/appointment-actions";

import AppointmentActionDialog from "@/components/owner/AppointmentActionDialog";
import AppointmentStatusBadge from "@/components/owner/AppointmentStatusBadge";

const PAGE_SIZE = 20;

function AppointmentsContent() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [appointments, setAppointments] = useState<OwnerAppointment[]>([]);
  const [barbers, setBarbers] = useState<ApiBarber[]>([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AppointmentFilterValues>({
    status: "",
    barberId: "",
    date: "",
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadBarbers() {
      try {
        const response = await fetch("/api/barbers", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) return;

        const body: { barbers: ApiBarber[] } = await response.json();

        if (!controller.signal.aborted) {
          setBarbers(body.barbers);
        }
      } catch {
        // A catalog failure should not prevent appointment management.
      }
    }

    void loadBarbers();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAppointments() {
      try {
        const result: OwnerAppointmentsResponse = await getOwnerAppointments(
          {
            page,
            limit: PAGE_SIZE,
            status: filters.status || undefined,
            barberId: filters.barberId || undefined,
            date: filters.date || undefined,
          },
          controller.signal,
        );

        if (controller.signal.aborted) return;

        setAppointments(result.data);
        setTotal(result.total);
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
          setError("Unable to load appointments.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    // Schedule the request outside the synchronous effect body.
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;

      setLoading(true);
      setError("");
      void loadAppointments();
    });

    return () => {
      controller.abort();
    };
  }, [page, filters, refreshKey, router]);

  function refreshAppointments() {
    setRefreshKey((current) => current + 1);
  }

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const mutationInFlight = useRef(false);
  const [pendingAction, setPendingAction] = useState<{
    appointment: OwnerAppointment;
    status: OwnerStatusUpdateRequest["status"];
  } | null>(null);
  function requestAction(
    appointment: OwnerAppointment,
    status: OwnerStatusUpdateRequest["status"],
  ) {
    if (mutationInFlight.current) return;
    setActionError("");
    setActionSuccess("");
    setPendingAction({ appointment, status });
  }

  async function handleStatusUpdate(
    appointment: OwnerAppointment,
    status: OwnerStatusUpdateRequest["status"],
  ) {
    if (
      mutationInFlight.current ||
      !getAllowedAppointmentActions(appointment.status).includes(status)
    )
      return;
    mutationInFlight.current = true;
    setUpdatingId(appointment.id);
    setActionError("");

    try {
      await updateOwnerAppointment(appointment.id, { status });
      setPendingAction(null);
      setActionSuccess(
        status === "CONFIRMED"
          ? "Appointment confirmed."
          : "Appointment cancelled. The reserved slot is available again.",
      );
      window.dispatchEvent(new Event("owner-appointments-updated"));
      refreshAppointments();
    } catch (caught) {
      if (caught instanceof OwnerApiError) {
        if (isAppointmentConflict(caught.status, caught.code)) {
          setActionError(
            "This appointment has changed. The list will be refreshed.",
          );
          refreshAppointments();
        } else if (caught.status === 401) {
          router.replace("/owner/login");
        } else if (caught.status === 403) {
          setActionError(
            caught.code === "FORBIDDEN"
              ? "You do not have permission to manage appointments."
              : "Request rejected. Check the application configuration.",
          );
        } else {
          setActionError(caught.message);
        }
      } else {
        setActionError("Unable to update appointment.");
      }
    } finally {
      mutationInFlight.current = false;
      setUpdatingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main lang="en" id="main" className="owner-workspace mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="mt-2 text-muted">Manage your Vienna Cuts bookings.</p>
        </div>

        <button
          type="button"
          onClick={refreshAppointments}
          disabled={loading}
          className="rounded-md border border-border bg-white px-5 py-2 font-medium hover:border-accent disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <AppointmentFilters
        barbers={barbers}
        values={filters}
        disabled={loading}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setPage(1);
        }}
      />

      {pendingAction && (
        <AppointmentActionDialog
          appointment={pendingAction.appointment}
          status={pendingAction.status}
          busy={updatingId !== null}
          error={actionError}
          onDismiss={() => {
            if (!mutationInFlight.current) setPendingAction(null);
          }}
          onConfirm={() =>
            void handleStatusUpdate(
              pendingAction.appointment,
              pendingAction.status,
            )
          }
        />
      )}
      {actionSuccess && (
        <p
          role="status"
          className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
        >
          {actionSuccess}
        </p>
      )}
      {actionError && !pendingAction && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {actionError}
        </div>
      )}

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
          Loading appointments...
        </p>
      ) : error ? (
        <div className="rounded-xl border border-border bg-white p-10 text-center">
          <p className="font-medium">Appointments unavailable.</p>
          <p className="mt-2 text-sm text-muted">Try refreshing the list.</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-10 text-center">
          <p className="font-medium">No appointments found.</p>
          <p className="mt-2 text-sm text-muted">
            Bookings will appear here when available.
          </p>
        </div>
      ) : (
        <div
          role="region"
          aria-label="Appointment list; scroll horizontally for actions"
          tabIndex={0}
          className="overflow-x-auto rounded-xl border border-border bg-white"
        >
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border bg-stone-50">
              <tr>
                {[
                  "Customer",
                  "Service",
                  "Barber",
                  "Vienna time",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-5 py-4 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium">{appointment.customer.name}</p>
                    <p className="text-muted">
                      {appointment.customer.email ?? "No email"}
                    </p>
                  </td>
                  <td className="px-5 py-4">{appointment.service.name}</td>
                  <td className="px-5 py-4">{appointment.barber.name}</td>
                  <td className="px-5 py-4">
                    {formatViennaDateTime(appointment.startsAt)}
                  </td>
                  <td className="px-5 py-4">
                    <AppointmentStatusBadge status={appointment.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {getAllowedAppointmentActions(
                        appointment.status,
                      ).includes("CONFIRMED") && (
                        <button
                          type="button"
                          disabled={updatingId !== null}
                          onClick={() =>
                            requestAction(appointment, "CONFIRMED")
                          }
                          className="rounded-md bg-accent px-3 py-2 text-white disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      )}

                      {getAllowedAppointmentActions(
                        appointment.status,
                      ).includes("CANCELLED") && (
                        <button
                          type="button"
                          disabled={updatingId !== null}
                          onClick={() =>
                            requestAction(appointment, "CANCELLED")
                          }
                          className="rounded-md border border-border px-3 py-2 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          Page {page} of {totalPages} · {total} total appointments
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-md border border-border px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-md border border-border px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}

export default function OwnerAppointmentsPage() {
  return <OwnerGuard>{() => <AppointmentsContent />}</OwnerGuard>;
}

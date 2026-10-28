"use client";
import { useEffect, useRef } from "react";
import type {
  OwnerAppointment,
  OwnerStatusUpdateRequest,
} from "@/lib/owner/api-types";
import { formatViennaDateTime } from "@/lib/owner/date";
type Props = {
  appointment: OwnerAppointment;
  status: OwnerStatusUpdateRequest["status"];
  busy: boolean;
  error: string;
  onDismiss: () => void;
  onConfirm: () => void;
};
export default function AppointmentActionDialog({
  appointment,
  status,
  busy,
  error,
  onDismiss,
  onConfirm,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    node?.showModal();
    return () => {
      node?.close();
      previous?.focus();
    };
  }, []);
  const confirming = status === "CONFIRMED";
  return (
    <dialog
      ref={dialog}
      aria-labelledby="appointment-action-title"
      aria-describedby="appointment-action-description"
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onDismiss();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-lg overflow-y-auto rounded-xl border border-border bg-background p-6 text-foreground shadow-2xl backdrop:bg-black/65 sm:p-8"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
        Vienna Cuts · Appointment
      </p>
      <h2 id="appointment-action-title" className="text-2xl font-semibold">
        {confirming ? "Confirm this appointment?" : "Cancel this appointment?"}
      </h2>
      <p
        id="appointment-action-description"
        className="mt-3 text-sm leading-6 text-muted"
      >
        {confirming
          ? "This changes the saved request to a confirmed appointment."
          : "This releases the reserved time. The appointment stays in your records as cancelled."}
      </p>
      <dl className="my-6 space-y-3 rounded-lg border border-border bg-white p-5 text-sm">
        <div>
          <dt className="text-muted">Customer</dt>
          <dd className="font-semibold break-words">
            {appointment.customer.name}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Treatment / barber</dt>
          <dd>
            {appointment.service.name} · {appointment.barber.name}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Europe/Vienna</dt>
          <dd>{formatViennaDateTime(appointment.startsAt)}</dd>
        </div>
      </dl>
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {busy && (
        <p role="status" className="mb-4 text-sm text-muted">
          Saving appointment status…
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <button
          autoFocus
          type="button"
          onClick={onDismiss}
          disabled={busy}
          className="min-h-11 rounded-md border border-border px-5 py-3 font-medium disabled:opacity-50"
        >
          Keep appointment
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`min-h-11 rounded-md px-5 py-3 font-semibold text-white disabled:opacity-50 ${confirming ? "bg-foreground" : "bg-red-800"}`}
        >
          {busy
            ? "Saving…"
            : confirming
              ? "Confirm appointment"
              : "Cancel appointment"}
        </button>
      </div>
    </dialog>
  );
}

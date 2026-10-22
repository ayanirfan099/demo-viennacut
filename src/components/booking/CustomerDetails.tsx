"use client";

import { useState, type FormEvent } from "react";

type CustomerDetailsProps = {
  serviceId: string;
  barberId: string;
  startsAt: string;
  serviceName: string;
  barberName: string;
  date: string;
  time: string;
  onBack: () => void;
};

export default function CustomerDetails({
  serviceId,
  barberId,
  startsAt,
  serviceName,
  barberName,
  date,
  time,
  onBack,
}: CustomerDetailsProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || confirmedBookingId) return;

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          barberId,
          startsAt,
          customer: {
            name: name.trim(),
            email: email.trim(),
            ...(phone.trim() ? { phone: phone.trim() } : {}),
          },
        }),
      });

      if (response.status === 409) {
        throw new Error(
          "This appointment is no longer available. Please go back and choose another time."
        );
      }

      if (!response.ok) {
        throw new Error(
          "Unable to complete your booking. Please try again."
        );
      }

      const data: {
        appointment: {
          id: string;
          status: string;
          startsAt: string;
          endsAt: string;
        };
      } = await response.json();

      setConfirmedBookingId(data.appointment.id);
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Unable to complete your booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="details-heading" className="mt-12">
      <h2 id="details-heading" className="text-2xl font-semibold">
        Your appointment details
      </h2>

      <p className="mt-2 text-muted">
        Review your appointment and enter your contact information.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold">Booking summary</h3>

        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Service</dt>
            <dd className="mt-1 font-medium">{serviceName}</dd>
          </div>

          <div>
            <dt className="text-muted">Barber</dt>
            <dd className="mt-1 font-medium">{barberName}</dd>
          </div>

          <div>
            <dt className="text-muted">Date</dt>
            <dd className="mt-1 font-medium">{date}</dd>
          </div>

          <div>
            <dt className="text-muted">Time</dt>
            <dd className="mt-1 font-medium">
              {time} (Vienna time)
            </dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="customer-name" className="block text-sm font-medium">
            Full name *
          </label>

          <input
            id="customer-name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
            className="mt-2 w-full rounded-md border border-border bg-surface px-4 py-3"
          />
        </div>

        <div>
          <label htmlFor="customer-email" className="block text-sm font-medium">
            Email address *
          </label>

          <input
            id="customer-email"
            type="email"
            autoComplete="email"
            required
            title="Enter a valid email address, such as name@example.com"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-md border border-border bg-surface px-4 py-3"
          />
        </div>

        <div>
          <label htmlFor="customer-phone" className="block text-sm font-medium">
            Phone number (optional)
          </label>

          <input
            id="customer-phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+43 ..."
            className="mt-2 w-full rounded-md border border-border bg-surface px-4 py-3"
          />
        </div>

        {bookingError && (
          <p
            role="alert"
            className="rounded-md border border-red-500 p-4 text-sm text-red-600"
          >
            {bookingError}
          </p>
        )}

        {confirmedBookingId && (
          <div
            role="status"
            className="rounded-md border border-accent p-4 text-sm"
          >
            <p className="font-semibold">
              Your appointment has been booked successfully!
            </p>
            <p className="mt-2">
              Booking reference: {confirmedBookingId}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting || Boolean(confirmedBookingId)}
            className="cursor-pointer rounded-md border border-border px-6 py-3 font-medium hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting || Boolean(confirmedBookingId)}
            className="cursor-pointer rounded-md bg-foreground px-7 py-3 font-medium text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            {confirmedBookingId
              ? "Booking confirmed"
              : isSubmitting
                ? "Booking..."
                : "Confirm booking"}
          </button>
        </div>
      </form>
    </section>
  );
}

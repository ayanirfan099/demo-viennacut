"use client";

import { useState, type FormEvent } from "react";

type CustomerDetailsProps = {
  serviceName: string;
  barberName: string;
  date: string;
  time: string;
  onBack: () => void;
};

export default function CustomerDetails({
  serviceName,
  barberName,
  date,
  time,
  onBack,
}: CustomerDetailsProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreviewSubmitted(true);
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

        <p className="text-sm text-muted">
          Demo mode: no appointment will be created or saved.
          Please use fictional contact details while testing.
        </p>

        {previewSubmitted && (
          <p role="status" className="rounded-md border border-accent p-4 text-sm">
            Form validated successfully. Booking submission will be enabled
            after the backend integration.
          </p>
        )}

        <div className="flex items-center justify-between gap-4 pt-3">
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer rounded-md border border-border px-6 py-3 font-medium hover:border-accent"
          >
            Back
          </button>

          <button
            type="submit"
            className="cursor-pointer rounded-md bg-foreground px-7 py-3 font-medium text-white transition-colors hover:bg-accent"
          >
            Validate details
          </button>
        </div>
      </form>
    </section>
  );
}

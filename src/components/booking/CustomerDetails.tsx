"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useLanguage } from "@/components/site/LanguageProvider";
import { formatPrice } from "./booking-copy";
import type { BookingSuccessResponse } from "@/lib/booking/api-types";
export type Customer = { name: string; email: string; phone: string };
type Props = {
  serviceId: string;
  barberId: string;
  startsAt: string;
  serviceName: string;
  barberName: string;
  priceCents: number;
  durationMinutes: number;
  customer: Customer;
  onCustomerChange: (customer: Customer) => void;
  onBack: () => void;
};
export default function CustomerDetails({
  serviceId,
  barberId,
  startsAt,
  serviceName,
  barberName,
  priceCents,
  durationMinutes,
  customer,
  onCustomerChange,
  onBack,
}: Props) {
  const { language, t } = useLanguage();
  const [review, setReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState<"conflict" | "unknown" | null>(null);
  const [appointment, setAppointment] = useState<
    BookingSuccessResponse["appointment"] | null
  >(null);
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(language === "de" ? "de-AT" : "en-GB", {
      timeZone: "Europe/Vienna",
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(value));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!review) {
      setReview(true);
      return;
    }
    if (submittingRef.current || appointment) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          barberId,
          startsAt,
          customer: {
            name: customer.name.trim(),
            email: customer.email.trim(),
            ...(customer.phone.trim() ? { phone: customer.phone.trim() } : {}),
          },
        }),
      });
      if (response.status === 409) {
        setError("conflict");
        return;
      }
      if (!response.ok) throw Error("Booking failed");
      const data: BookingSuccessResponse = await response.json();
      if (
        !data.appointment?.id ||
        !data.appointment.startsAt ||
        !data.appointment.endsAt
      )
        throw Error("Invalid confirmation");
      setAppointment(data.appointment);
    } catch {
      setError("unknown");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }
  return (
    <section className="mt-10" aria-labelledby="details-heading">
      <h2 id="details-heading" className="text-2xl font-semibold">
        {appointment
          ? t("Dein Termin ist gespeichert.", "Your appointment is saved.")
          : review
            ? t("Alles bereit?", "Ready when you are.")
            : t("Fast geschafft.", "Almost there.")}
      </h2>
      <p className="mt-2 text-muted">
        {appointment
          ? t(
              "Deine Buchungsanfrage wartet auf Bestätigung durch das Team.",
              "Your booking request is awaiting confirmation by the team.",
            )
          : review
            ? t(
                "Prüfe deine Angaben, bevor du verbindlich buchst.",
                "Review your details before submitting your booking.",
              )
            : t(
                "Deine Kontaktdaten werden ausschließlich für die Terminverwaltung verwendet.",
                "Your contact details are used to manage your appointment.",
              )}
      </p>
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold">
          {t("Dein Termin", "Your appointment")}
        </h3>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          {[
            [t("Behandlung", "Treatment"), serviceName],
            [t("Barber", "Barber"), barberName],
            [
              t("Datum & Zeit", "Date & time"),
              formatDate(appointment?.startsAt ?? startsAt),
            ],
            [
              t("Preis & Dauer", "Price & duration"),
              `${formatPrice(priceCents, language)} · ${durationMinutes} min`,
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted">{label}</dt>
              <dd className="mt-1 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted">
          Europe/Vienna ·{" "}
          {t(
            "Demostudio · Keine echte Dienstleistung",
            "Demo studio · No real-world service",
          )}
        </p>
      </div>
      {appointment ? (
        <div role="status" className="mt-8 border border-accent p-6">
          <p className="font-semibold">
            {t("Buchungsreferenz", "Booking reference")}:{" "}
            <span className="break-all">{appointment.id}</span>
          </p>
          <p className="mt-2">
            {t("Status: Anfrage gespeichert", "Status: Request saved")} (
            {appointment.status})
          </p>
          <p className="mt-2 text-sm">
            {t("Ende", "Ends")}: {formatDate(appointment.endsAt)}
          </p>
          <Link href="/" className="mt-6 inline-block underline">
            {t("Zur Startseite", "Back to home")}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-5">
          {!review ? (
            <>
              <div>
                <label
                  htmlFor="customer-name"
                  className="block text-sm font-medium"
                >
                  {t("Vor- und Nachname", "Full name")} *
                </label>
                <input
                  id="customer-name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  minLength={2}
                  value={customer.name}
                  onChange={(e) =>
                    onCustomerChange({ ...customer, name: e.target.value })
                  }
                  className="mt-2 w-full rounded-md border border-border bg-surface p-4"
                />
              </div>
              <div>
                <label
                  htmlFor="customer-email"
                  className="block text-sm font-medium"
                >
                  {t("E-Mail-Adresse", "Email address")} *
                </label>
                <input
                  id="customer-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={customer.email}
                  onChange={(e) =>
                    onCustomerChange({ ...customer, email: e.target.value })
                  }
                  className="mt-2 w-full rounded-md border border-border bg-surface p-4"
                />
              </div>
              <div>
                <label
                  htmlFor="customer-phone"
                  className="block text-sm font-medium"
                >
                  {t("Telefonnummer (optional)", "Phone number (optional)")}
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={30}
                  value={customer.phone}
                  onChange={(e) =>
                    onCustomerChange({ ...customer, phone: e.target.value })
                  }
                  className="mt-2 w-full rounded-md border border-border bg-surface p-4"
                />
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-border p-6">
              <h3 className="font-semibold">
                {t("Deine Kontaktdaten", "Your contact details")}
              </h3>
              <p className="mt-3 break-words">{customer.name}</p>
              <p className="break-words">{customer.email}</p>
              {customer.phone && <p>{customer.phone}</p>}
              <button
                type="button"
                onClick={() => setReview(false)}
                disabled={submitting}
                className="mt-3 underline"
              >
                {t("Angaben ändern", "Edit details")}
              </button>
            </div>
          )}
          <p className="text-sm text-muted">
            {t(
              "Informationen zur Verarbeitung deiner Daten findest du in unserer ",
              "Read how your data is handled in our ",
            )}
            <Link href="/datenschutz" className="underline">
              {t("Datenschutzerklärung", "privacy notice")}
            </Link>
            .
          </p>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-700 p-4 text-sm text-red-700"
            >
              {error === "conflict"
                ? t(
                    "Dieser Termin ist inzwischen vergeben. Bitte gehe zurück und wähle eine andere Zeit.",
                    "This appointment is no longer available. Please go back and choose another time.",
                  )
                : t(
                    "Die Buchung konnte nicht bestätigt werden. Bei einem Verbindungsabbruch kann die Anfrage bereits gespeichert sein. Bitte prüfe dies vor einer erneuten Buchung.",
                    "The booking could not be confirmed. If the connection was interrupted, the request may already be saved. Please check before booking again.",
                  )}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={() => (review ? setReview(false) : onBack())}
              disabled={submitting}
              className="rounded-md border border-border px-6 py-3 disabled:opacity-40"
            >
              {t("Zurück", "Back")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-foreground px-7 py-3 font-medium text-white disabled:opacity-40"
            >
              {submitting
                ? t("Wird gebucht …", "Booking …")
                : review
                  ? t("Jetzt verbindlich buchen", "Submit booking")
                  : t("Buchung prüfen", "Review booking")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

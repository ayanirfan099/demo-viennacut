"use client";

import { useEffect, useState } from "react";
import type { ApiService, ApiBarber } from "@/lib/booking/api-types";
import { useLanguage } from "@/components/site/LanguageProvider";
import { formatPrice, serviceCopy } from "./booking-copy";
import DateTimeSelection from "./DateTimeSelection";
import CustomerDetails, { type Customer } from "./CustomerDetails";

export default function BookingFlow() {
  const { language, t } = useLanguage();
  const [services, setServices] = useState<ApiService[]>([]);
  const [barbers, setBarbers] = useState<ApiBarber[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [assignedBarber, setAssignedBarber] = useState("");
  const [step, setStep] = useState(0);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    email: "",
    phone: "",
  });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setLoadError(false);
      try {
        const responses = await Promise.all(
          ["/api/services", "/api/barbers"].map((url) =>
            fetch(url, { signal: controller.signal }),
          ),
        );
        if (responses.some((response) => !response.ok))
          throw Error("Options unavailable");
        const [serviceData, barberData] = await Promise.all(
          responses.map((response) => response.json()),
        );
        if (controller.signal.aborted) return;
        setServices(serviceData.services);
        setBarbers(barberData.barbers);
        const query = new URLSearchParams(window.location.search);
        const requestedService = query.get("service") ?? query.get("serviceId");
        const requestedBarber = query.get("barber") ?? query.get("barberId");
        if (
          serviceData.services.some(
            (s: ApiService) => s.id === requestedService,
          )
        )
          setServiceId(requestedService!);
        if (barberData.barbers.some((b: ApiBarber) => b.id === requestedBarber))
          setBarberId(requestedBarber!);
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [retry]);
  const service = services.find((s) => s.id === serviceId);
  const barber = barbers.find(
    (b) => b.id === assignedBarber || (barberId !== "any" && b.id === barberId),
  );
  const steps = [
    t("Behandlung", "Service"),
    t("Barber", "Barber"),
    t("Termin", "Date & time"),
    t("Details & Prüfung", "Details & review"),
  ];
  const clearSlot = () => {
    setDate("");
    setTime("");
    setAssignedBarber("");
  };
  const button =
    "rounded-md bg-foreground px-7 py-3 font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed";
  const card =
    "w-full rounded-lg border bg-surface p-5 text-left transition-colors sm:p-6";
  return (
    <div className="mt-10">
      <ol
        aria-label={t("Buchungsfortschritt", "Booking progress")}
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {steps.map((label, i) => (
          <li
            key={i}
            aria-current={step === i ? "step" : undefined}
            className={`border-b-2 px-2 py-4 text-sm ${step === i ? "border-accent font-semibold" : "border-border text-muted"}`}
          >
            <span className="mr-2">0{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      {loading && (
        <p role="status" className="py-10 text-muted">
          {t("Buchungsoptionen werden geladen …", "Loading booking options …")}
        </p>
      )}
      {loadError && (
        <div role="alert" className="mt-8 border border-accent p-6">
          <p>
            {t(
              "Die Online-Buchung ist gerade nicht erreichbar. Es wurde kein Termin angelegt.",
              "Online booking is currently unavailable. No appointment has been created.",
            )}
          </p>
          <button
            className="mt-4 underline"
            onClick={() => setRetry((n) => n + 1)}
          >
            {t("Erneut versuchen", "Try again")}
          </button>
        </div>
      )}
      {!loading && !loadError && (
        <>
          {step === 0 && (
            <section className="mt-10" aria-labelledby="service-heading">
              <h2 id="service-heading" className="text-2xl font-semibold">
                {t("Dein Look beginnt hier.", "Your look starts here.")}
              </h2>
              <p className="mt-2 text-muted">
                {t(
                  "Wähle deine Behandlung. Preise und Dauer stammen aus unserem Buchungssystem.",
                  "Choose your treatment. Prices and durations come from our booking system.",
                )}
              </p>
              {!services.length && (
                <p role="status" className="mt-6">
                  {t(
                    "Aktuell sind keine Behandlungen buchbar.",
                    "No treatments are currently available.",
                  )}
                </p>
              )}
              <div className="mt-6 space-y-3">
                {services.map((s) => {
                  const copy = serviceCopy(s, language);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={serviceId === s.id}
                      onClick={() => {
                        if (serviceId !== s.id) {
                          setServiceId(s.id);
                          clearSlot();
                        }
                      }}
                      className={`${card} ${serviceId === s.id ? "border-accent ring-1 ring-accent" : "border-border hover:border-accent"}`}
                    >
                      <div className="flex justify-between gap-4">
                        <h3 className="text-lg font-semibold">{copy.name}</h3>
                        <span className="shrink-0 font-semibold">
                          {formatPrice(s.priceCents, language)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        {copy.description}
                      </p>
                      <p className="mt-3 text-sm">{s.durationMinutes} min</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  className={button}
                  disabled={!service}
                  onClick={() => setStep(1)}
                >
                  {t("Weiter", "Continue")} →
                </button>
              </div>
            </section>
          )}
          {step === 1 && (
            <section className="mt-10" aria-labelledby="barber-heading">
              <h2 id="barber-heading" className="text-2xl font-semibold">
                {t("In guten Händen.", "In good hands.")}
              </h2>
              <p className="mt-2 text-muted">
                {t(
                  "Wähle deinen Barber oder die nächste freie Möglichkeit.",
                  "Choose your barber or any available team member.",
                )}
              </p>
              <div className="mt-6 space-y-3">
                {[
                  {
                    id: "any",
                    name: t("Alle verfügbaren Barber", "Any available barber"),
                  },
                  ...barbers,
                ].map((b) => (
                  <button
                    key={b.id}
                    aria-pressed={barberId === b.id}
                    className={`${card} ${barberId === b.id ? "border-accent ring-1 ring-accent" : "border-border hover:border-accent"}`}
                    onClick={() => {
                      if (barberId !== b.id) {
                        setBarberId(b.id);
                        clearSlot();
                      }
                    }}
                  >
                    <span className="text-lg font-semibold">{b.name}</span>
                    <p className="mt-2 text-sm text-muted">
                      {b.id === "any"
                        ? t(
                            "Wir zeigen freie Zeiten im gesamten Team.",
                            "See available times across the whole team.",
                          )
                        : t(
                            "Demo-Team · Individuelle Beratung und präzises Handwerk.",
                            "Demo team · Individual consultation and precise craftsmanship.",
                          )}
                    </p>
                  </button>
                ))}
              </div>
              {!barbers.length && (
                <p role="status" className="mt-4">
                  {t(
                    "Aktuell ist kein Barber verfügbar.",
                    "No barbers are currently available.",
                  )}
                </p>
              )}
              <div className="mt-8 flex justify-between gap-3">
                <button
                  className="rounded-md border border-border px-6 py-3"
                  onClick={() => setStep(0)}
                >
                  {t("Zurück", "Back")}
                </button>
                <button
                  className={button}
                  disabled={!barberId || !barbers.length}
                  onClick={() => setStep(2)}
                >
                  {t("Weiter", "Continue")} →
                </button>
              </div>
            </section>
          )}
          {step === 2 && (
            <DateTimeSelection
              serviceId={serviceId}
              barberId={barberId}
              barbers={barbers}
              initialDate={date}
              initialTime={time}
              onBack={() => setStep(1)}
              onContinue={(d, startsAt, resolvedBarber) => {
                setDate(d);
                setTime(startsAt);
                setAssignedBarber(resolvedBarber);
                setStep(3);
              }}
            />
          )}
          {step === 3 && service && (
            <CustomerDetails
              serviceId={serviceId}
              barberId={barber?.id ?? ""}
              startsAt={time}
              serviceName={serviceCopy(service, language).name}
              barberName={barber?.name ?? ""}
              priceCents={service.priceCents}
              durationMinutes={service.durationMinutes}
              customer={customer}
              onCustomerChange={setCustomer}
              onBack={() => setStep(2)}
            />
          )}
        </>
      )}
    </div>
  );
}

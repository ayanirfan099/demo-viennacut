"use client";

import { useEffect, useState } from "react";
import type { ApiService, ApiBarber } from "@/lib/booking/api-types";
import DateTimeSelection from "@/components/booking/DateTimeSelection";
import CustomerDetails from "@/components/booking/CustomerDetails";

const steps = ["Service", "Barber", "Date & Time", "Details"];

export default function BookingFlow() {
  const [apiServices, setApiServices] = useState<ApiService[]>([]);
  const [apiBarbers, setApiBarbers] = useState<ApiBarber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadBookingOptions() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [servicesResponse, barbersResponse] = await Promise.all([
          fetch("/api/services", { signal: controller.signal }),
          fetch("/api/barbers", { signal: controller.signal }),
        ]);

        if (!servicesResponse.ok || !barbersResponse.ok) {
          throw new Error("Unable to load booking options.");
        }

        const servicesData: { services: ApiService[] } =
          await servicesResponse.json();
        const barbersData: { barbers: ApiBarber[] } =
          await barbersResponse.json();

        if (controller.signal.aborted) return;

        setApiServices(servicesData.services);
        setApiBarbers(barbersData.barbers);
      } catch (error) {
        if (controller.signal.aborted) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load booking options."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadBookingOptions();

    return () => controller.abort();
  }, []);

  const selectedService = apiServices.find(
    (service) => service.id === selectedServiceId
  );

  return (
    <div>
      {isLoading && (
        <p role="status" className="mt-6 text-sm text-muted">
          Loading booking options...
        </p>
      )}

      {loadError && (
        <p role="alert" className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-600">
          {loadError}
        </p>
      )}

      <ol
        aria-label="Booking progress"
        className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {steps.map((step, index) => (
          <li
            key={step}
            aria-current={index === currentStep ? "step" : undefined}
            className={`rounded-md border px-3 py-3 text-center text-sm ${
              index === currentStep
                ? "border-accent bg-accent/10 font-semibold"
                : "border-border text-muted"
            }`}
          >
            {index + 1}. {step}
          </li>
        ))}
      </ol>

      {currentStep === 0 ? (
        <section aria-labelledby="service-heading" className="mt-12">
          <h2 id="service-heading" className="text-2xl font-semibold">
            Select a service
          </h2>

          <p className="mt-2 text-muted">
            Explore our grooming services.
          </p>

          {!isLoading && !loadError && apiServices.length === 0 && (
            <p role="status" className="mt-6 text-sm text-muted">
              No services are currently available for booking.
            </p>
          )}

          <div className="mt-6 space-y-4">
            {apiServices.map((service) => {
              const isSelected = selectedServiceId === service.id;

              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (selectedServiceId !== service.id) {
                      setSelectedServiceId(service.id);
                      setSelectedDate("");
                      setSelectedTime("");
                    }
                  }}
                  className={`w-full cursor-pointer rounded-lg border bg-surface p-6 text-left transition-colors ${
                    isSelected
                      ? "border-accent ring-2 ring-accent/30"
                      : "border-border hover:border-accent"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {service.name}
                      </h3>

                      <p className="mt-2 text-sm text-muted">
                        {service.description}
                      </p>

                      <p className="mt-3 text-sm text-muted">
                        {service.durationMinutes} minutes
                      </p>
                    </div>

                    <p className="text-xl font-semibold">
                      €{(service.priceCents / 100).toFixed(2)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedService && (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted" aria-live="polite">
                Selected: {selectedService.name}
              </p>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="cursor-pointer rounded-md bg-foreground px-7 py-3 font-medium text-white transition-colors hover:bg-accent"
              >
                Continue
              </button>
            </div>
          )}
        </section>
      ) : currentStep === 1 ? (
        <section aria-labelledby="barber-heading" className="mt-12">
          <h2 id="barber-heading" className="text-2xl font-semibold">
            Select a barber
          </h2>

          <p className="mt-2 text-muted">
            Choose the barber you would like to book with.
          </p>

          <p className="mt-4 text-sm text-muted">
            Selected service: <strong>{selectedService?.name}</strong>
          </p>

          {!isLoading && !loadError && apiBarbers.length === 0 && (
            <p role="status" className="mt-6 text-sm text-muted">
              No barbers are currently available for booking.
            </p>
          )}

          <div className="mt-6 space-y-4">
            {apiBarbers.map((barber) => {
              const isSelected = selectedBarberId === barber.id;

              return (
                <button
                  key={barber.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (selectedBarberId !== barber.id) {
                      setSelectedBarberId(barber.id);
                      setSelectedDate("");
                      setSelectedTime("");
                    }
                  }}
                  className={`w-full cursor-pointer rounded-lg border bg-surface p-6 text-left transition-colors ${
                    isSelected
                      ? "border-accent ring-2 ring-accent/30"
                      : "border-border hover:border-accent"
                  }`}
                >
                  <h3 className="text-lg font-semibold">{barber.name}</h3>
                  <p className="mt-2 text-sm text-muted">{barber.bio}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              className="cursor-pointer rounded-md border border-border px-6 py-3 font-medium hover:border-accent"
            >
              Back
            </button>

            <button
              type="button"
              disabled={!selectedBarberId}
              onClick={() => setCurrentStep(2)}
              className="cursor-pointer rounded-md bg-foreground px-7 py-3 font-medium text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </section>
      ) : currentStep === 2 ? (
        <DateTimeSelection
          key={`${selectedServiceId}-${selectedBarberId}`}
          serviceId={selectedServiceId ?? ""}
          barberId={selectedBarberId ?? ""}
          onBack={() => setCurrentStep(1)}
          onContinue={(date, startsAt) => {
            setSelectedDate(date);
            setSelectedTime(startsAt);
            setCurrentStep(3);
          }}
        />
      ) : (
        <CustomerDetails
          serviceId={selectedServiceId ?? ""}
          barberId={selectedBarberId ?? ""}
          startsAt={selectedTime}
          serviceName={selectedService?.name ?? ""}
          barberName={
            apiBarbers.find((barber) => barber.id === selectedBarberId)?.name ?? ""
          }
          date={selectedDate}
          time={
            selectedTime
              ? new Intl.DateTimeFormat("en-GB", {
                  timeZone: "Europe/Vienna",
                  hour: "2-digit",
                  minute: "2-digit",
                  hourCycle: "h23",
                }).format(new Date(selectedTime))
              : ""
          }
          onBack={() => setCurrentStep(2)}
        />
      )}
    </div>
  );
}
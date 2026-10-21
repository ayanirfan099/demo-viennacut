"use client";

import { useState } from "react";
import { services } from "@/lib/services";
import { barbers } from "@/lib/barbers";
import DateTimeSelection from "@/components/booking/DateTimeSelection";
import CustomerDetails from "@/components/booking/CustomerDetails";

const steps = ["Service", "Barber", "Date & Time", "Details"];

export default function BookingFlow() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const selectedService = services.find(
    (service) => service.id === selectedServiceId
  );

  return (
    <div>
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

          <div className="mt-6 space-y-4">
            {services.map((service) => {
              const isSelected = selectedServiceId === service.id;

              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedServiceId(service.id)}
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
                      €{service.price}
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

          <div className="mt-6 space-y-4">
            {barbers.map((barber) => {
              const isSelected = selectedBarberId === barber.id;

              return (
                <button
                  key={barber.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedBarberId(barber.id)}
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
          onBack={() => setCurrentStep(1)}
          onContinue={(date, time) => {
            setSelectedDate(date);
            setSelectedTime(time);
            setCurrentStep(3);
          }}
        />
      ) : (
        <CustomerDetails
          serviceName={selectedService?.name ?? ""}
          barberName={
            barbers.find((barber) => barber.id === selectedBarberId)?.name ?? ""
          }
          date={selectedDate}
          time={selectedTime}
          onBack={() => setCurrentStep(2)}
        />
      )}
    </div>
  );
}
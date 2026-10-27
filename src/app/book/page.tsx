"use client";
import Container from "@/components/ui/Container";
import BookingFlow from "@/components/booking/BookingFlow";
import { useLanguage } from "@/components/site/LanguageProvider";
export default function BookingPage() {
  const { t } = useLanguage();
  return (
    <main id="main" className="py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Vienna Cuts · {t("Online-Buchung", "Online booking")}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            {t("Dein nächster guter Schnitt.", "Your next great cut.")}
          </h1>
          <p className="mt-5 max-w-xl text-muted">
            {t(
              "Wähle deinen Look. Wir kümmern uns um die Details. Dies ist ein Demostudio; gespeicherte Termine sind Testbuchungen.",
              "Choose your look. We will take care of the details. This is a demo studio; saved appointments are test bookings.",
            )}
          </p>
          <BookingFlow />
        </div>
      </Container>
    </main>
  );
}

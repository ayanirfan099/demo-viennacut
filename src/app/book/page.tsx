import Container from "@/components/ui/Container";
import BookingFlow from "@/components/booking/BookingFlow";

export default function BookingPage() {
  return (
    <main className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Vienna Cuts
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Book your appointment
          </h1>

          <p className="mt-4 text-muted">
            Choose your service to get started.
          </p>

          <BookingFlow />
        </div>
      </Container>
    </main>
  );
}

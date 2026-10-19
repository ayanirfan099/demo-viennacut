
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { services } from "@/lib/services";

const euroFormatter = new Intl.NumberFormat("de-AT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default function Services() {
  return (
    <section
      id="services"
      className="border-t border-border bg-surface py-20"
    >
      <Container>
        <SectionHeading
          eyebrow="What We Offer"
          title="Our Services"
          description="Professional grooming services tailored to you."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="rounded-lg border border-border p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold">
                  {service.name}
                </h3>

                <span className="font-semibold text-accent">
                  {euroFormatter.format(service.price)}
                </span>
              </div>

              <p className="mt-4 text-muted">
                {service.description}
              </p>

              <p className="mt-6 text-sm text-muted">
                {service.durationMinutes} minutes
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

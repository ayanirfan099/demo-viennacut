
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
      className="scroll-mt-20 bg-[#FAF9F6] py-24 md:py-32"
    >
      <Container>
        <SectionHeading
          eyebrow="Our Expertise"
          title="Services tailored to you."
          description="Every detail matters. Discover professional grooming services designed around your individual style."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="group flex flex-col rounded-lg border border-stone-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-semibold tracking-widest text-accent">
                  0{index + 1}
                </span>

                <span className="text-xs uppercase tracking-wider text-stone-600">
                  Grooming
                </span>
              </div>

              <div className="mt-14">
                <h3 className="text-2xl font-bold tracking-tight">
                  {service.name}
                </h3>

                <p className="mt-4 min-h-16 leading-relaxed text-muted">
                  {service.description}
                </p>
              </div>

              <div className="mt-auto flex items-end justify-between border-t border-stone-200 pt-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-500">
                    Duration
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {service.durationMinutes} min
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-stone-500">
                    From
                  </p>
                  <p className="mt-2 text-2xl font-bold text-accent">
                    {euroFormatter.format(service.price)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

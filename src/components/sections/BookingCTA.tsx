
import Link from "next/link";
import Container from "@/components/ui/Container";

export default function BookingCTA() {
  return (
    <section
      id="booking"
      className="scroll-mt-20 bg-[#171717] py-24 text-white md:py-32"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C49A65]">
            Your Next Look Starts Here
          </p>

          <h2 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
            Ready for a fresh look?
          </h2>

          <p className="mx-auto mt-8 max-w-xl leading-8 text-stone-300">
            Explore our grooming services and discover
            the Vienna Cuts experience. Online
            appointments are coming soon.
          </p>

          <div className="mt-10">
            <Link
              href="/#services"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#947047]"
            >
              Explore Our Services
              <span className="ml-3" aria-hidden="true">
                →
              </span>
            </Link>
          </div>

          <p className="mt-6 text-xs text-stone-400">
            Online booking is currently under development.
          </p>
        </div>
      </Container>
    </section>
  );
}

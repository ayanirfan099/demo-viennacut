
import Link from "next/link";
import Container from "@/components/ui/Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#171717] text-white">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl"
      />

      <Container className="relative z-10 py-24 md:py-36 lg:py-44">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <p className="mb-7 text-xs font-semibold uppercase tracking-[0.3em] text-[#C49A65] md:text-sm">
            Precision. Style. Confidence.
          </p>

          {/* Main heading */}
          <h1 className="text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-8xl">
            Your style.
            <br />
            <span className="text-[#C49A65]">
              Our craft.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-xl text-base leading-8 text-stone-300 md:text-lg">
            More than just a haircut. Discover precision
            grooming, timeless style, and a barbershop
            experience made for you in Vienna.
          </p>

          {/* Action buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/#booking"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#947047]"
            >
              Booking Information
              <span className="ml-3" aria-hidden="true">↗</span>
            </Link>

            <Link
              href="/#services"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-stone-600 px-8 py-4 text-sm font-semibold text-white transition hover:border-accent hover:text-accent"
            >
              Explore Services
              <span className="ml-3" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Bottom detail */}
        <div className="mt-24 flex flex-col gap-3 border-t border-stone-800 pt-6 text-xs uppercase tracking-widest text-stone-400 sm:flex-row sm:justify-between">
          <span>Vienna, Austria</span>
          <span>Classic craft. Modern identity.</span>
        </div>
      </Container>
    </section>
  );
}

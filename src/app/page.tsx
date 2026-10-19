
import Link from "next/link";

const services = [
  {
    name: "Classic Haircut",
    description: "A precise cut tailored to your style.",
    price: "€28",
  },
  {
    name: "Beard Trim",
    description: "Clean lines and expert beard shaping.",
    price: "€18",
  },
  {
    name: "Haircut & Beard",
    description: "The complete grooming experience.",
    price: "€40",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#171717]">
      <header className="border-b border-stone-200">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            VIENNA <span className="text-[#AD8252]">CUTS.</span>
          </Link>

          <span className="text-sm text-stone-500">
            Vienna, Austria
          </span>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 md:py-36">
        <div className="max-w-3xl">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.25em] text-[#AD8252]">
            Traditional Craft. Modern Style.
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Look sharp.
            <br />
            Feel confident.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-stone-600">
            Quality haircuts, expert beard grooming, and a
            barbershop experience made for you. Right here
            in Vienna.
          </p>

          <Link
            href="#services"
            className="mt-10 inline-block rounded-md bg-[#171717] px-8 py-4 font-medium text-white transition hover:bg-[#AD8252]"
          >
            Explore Our Services
          </Link>
        </div>
      </section>

      <section
        id="services"
        className="border-t border-stone-200 bg-white py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#AD8252]">
            What We Offer
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Our Services
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.name}
                className="rounded-lg border border-stone-200 p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold">
                    {service.name}
                  </h3>
                  <span className="font-semibold text-[#AD8252]">
                    {service.price}
                  </span>
                </div>

                <p className="mt-4 text-stone-600">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 px-6 py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} Vienna Cuts.
        Demo website for portfolio purposes.
      </footer>
    </main>
  );
}

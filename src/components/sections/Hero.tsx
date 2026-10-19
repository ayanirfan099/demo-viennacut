
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export default function Hero() {
  return (
    <section>
      <Container className="py-24 md:py-36">
        <div className="max-w-3xl">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            Traditional Craft. Modern Style.
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Look sharp.
            <br />
            Feel confident.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
            Quality haircuts, expert beard grooming,
            and a barbershop experience made for you.
            Right here in Vienna.
          </p>

          <div className="mt-10">
            <Button href="/#services">
              Explore Our Services
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

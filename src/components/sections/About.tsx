
import Container from "@/components/ui/Container";

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-20 bg-[#EEEAE3] py-24 md:py-32"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              The Vienna Cuts Experience
            </p>

            <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              More than a haircut.
              <br />
              A commitment to craft.
            </h2>

            <p className="mt-8 leading-8 text-stone-600">
              At Vienna Cuts, we believe great grooming
              starts with attention to detail. Our concept
              combines traditional barbering techniques
              with a modern approach to personal style.
            </p>

            <p className="mt-5 leading-8 text-stone-600">
              Whether you&apos;re after a clean classic cut or
              a fresh new look, our goal is simple:
              precision, comfort, and confidence.
            </p>
          </div>

          <div className="flex min-h-80 items-center justify-center rounded-lg bg-[#171717] p-10 text-center text-white md:min-h-96">
            <div>
              <p className="text-6xl font-bold tracking-tighter text-[#C49A65] md:text-8xl">
                VC.
              </p>

              <div className="mx-auto my-8 h-px w-20 bg-[#C49A65]" />

              <p className="text-sm uppercase tracking-[0.3em] text-stone-300">
                Precision in every detail
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

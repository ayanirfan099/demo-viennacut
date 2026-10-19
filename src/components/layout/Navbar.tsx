
import Link from "next/link";
import Container from "@/components/ui/Container";

export default function Navbar() {
  return (
    <header className="border-b border-border bg-background">
      <Container className="flex items-center justify-between py-5">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
        >
          VIENNA <span className="text-accent">CUTS.</span>
        </Link>

        <nav aria-label="Main navigation">
          <Link
            href="/#services"
            className="text-sm font-medium hover:text-accent"
          >
            Services
          </Link>
        </nav>
      </Container>
    </header>
  );
}

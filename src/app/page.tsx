
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import BookingCTA from "@/components/sections/BookingCTA";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <About />
      <BookingCTA />
    </main>
  );
}

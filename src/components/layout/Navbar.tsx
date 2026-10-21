
"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/#services" },
  { name: "About", href: "/#about" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="relative z-50 bg-[#171717] text-white">
      <Container className="flex h-20 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="text-xl font-bold tracking-tight"
        >
          VIENNA <span className="text-accent">CUTS.</span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Desktop navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm text-stone-300 transition hover:text-accent"
            >
              {item.name}
            </Link>
          ))}

          <Link
            href="/#booking"
            className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#947047]"
          >
            Booking Info
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-stone-700 md:hidden"
        >
          <span className="text-2xl" aria-hidden="true">
            {menuOpen ? "×" : "☰"}
          </span>
        </button>
      </Container>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-stone-800 bg-[#171717] px-6 py-5 md:hidden"
        >
          <div className="flex flex-col gap-5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                className="text-sm text-stone-200"
              >
                {item.name}
              </Link>
            ))}

            <Link
              href="/#booking"
              onClick={closeMenu}
              className="rounded-md bg-accent px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Booking Info
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

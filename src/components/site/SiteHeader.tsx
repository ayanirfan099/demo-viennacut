"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
export default function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 30);
    scroll();
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  const links = [
    ["/services", "Leistungen", "Services"],
    ["/results", "Looks", "Results"],
    ["/team", "Team", "Team"],
    ["/#about", "Studio", "About"],
    ["/#reviews", "Stimmen", "Reviews"],
    ["/#contact", "Kontakt", "Contact"],
  ];
  return (
    <header
      className={`site-header ${scrolled || path !== "/" ? "solid" : ""}`}
    >
      <a className="skip-link" href="#main">
        {t("Zum Inhalt", "Skip to content")}
      </a>
      <div className="header-inner">
        <Link className="wordmark" href="/" onClick={() => setOpen(false)}>
          VIENNA
          <span>
            CUTS<span className="logo-dot">•</span>
          </span>
        </Link>
        <nav
          className="desktop-nav"
          aria-label={t("Hauptnavigation", "Main navigation")}
        >
          {links.map(([url, de, en]) => (
            <Link href={url} key={url}>
              {t(de, en)}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <div
            className="language-switch"
            aria-label={t("Sprache", "Language")}
          >
            {(["de", "en"] as const).map((l) => (
              <button
                key={l}
                aria-pressed={language === l}
                onClick={() => setLanguage(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link className="button small" href="/book">
            {t("Termin buchen", "Book now")}{" "}
            <span aria-hidden="true">
              <svg
                aria-hidden="true"
                className="arrow-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M5 19 19 5M5 5h14v14" />
              </svg>
            </span>
          </Link>
          <button
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={t("Menü", "Menu")}
            onClick={() => setOpen(!open)}
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-nav"
          aria-label={t("Mobile Navigation", "Mobile navigation")}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {links.map(([url, de, en]) => (
            <Link onClick={() => setOpen(false)} href={url} key={url}>
              {t(de, en)}{" "}
              <span>
                <svg
                  aria-hidden="true"
                  className="arrow-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M5 19 19 5M5 5h14v14" />
                </svg>
              </span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

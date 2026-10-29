"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
export default function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = drawer.current;
    if (!element) return;
    if (open) element.showModal();
    else if (element.open) element.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const resize = () => {
      if (window.innerWidth > 1100) setOpen(false);
    };
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("resize", resize);
    };
  }, [open]);
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
    ["/about", "Studio", "About"],
    ["/#reviews", "Haltung", "Our approach"],
    ["/contact", "Kontakt", "Contact"],
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
            <Link
              href={url}
              key={url}
              aria-current={path === url ? "page" : undefined}
            >
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
            ref={toggle}
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
      <dialog
        ref={drawer}
        id="mobile-menu"
        className="mobile-drawer"
        aria-label={t("Mobile Navigation", "Mobile navigation")}
        onCancel={() => setOpen(false)}
        onClose={() => {
          setOpen(false);
          toggle.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div className="drawer-top">
          <span>VIENNA CUTS / MENU</span>
          <button
            autoFocus
            aria-label={t("Menü schließen", "Close menu")}
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <nav
          className="mobile-nav"
          aria-label={t("Mobile Navigation", "Mobile navigation")}
        >
          {links.map(([url, de, en], i) => (
            <Link
              onClick={() => setOpen(false)}
              href={url}
              key={url}
              aria-current={path === url ? "page" : undefined}
            >
              <small aria-hidden="true">0{i + 1}</small>
              {t(de, en)}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
          <Link className="button" href="/book" onClick={() => setOpen(false)}>
            {t("Termin buchen", "Book a chair")} →
          </Link>
        </nav>
        <p className="drawer-note">
          {t(
            "Ein fiktives Studio. Zeit für deinen Stil.",
            "An imagined studio. Time for your style.",
          )}
        </p>
      </dialog>
    </header>
  );
}

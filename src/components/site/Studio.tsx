"use client";
import { business, openingRange } from "@/lib/business";
import { AssetImage, HeroMedia, ImageCreditNotice } from "./AssetMedia";
import { Gallery, Team, StudioExperience } from "./AssetSections";
export { Gallery, Team } from "./AssetSections";
import { serviceImages } from "@/lib/images";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { demoServices } from "@/lib/catalog";
export function SectionTitle({
  label,
  de,
  en,
}: {
  label: string;
  de: string;
  en: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="section-heading">
      <p className="eyebrow">{label}</p>
      <h2>{t(de, en)}</h2>
    </div>
  );
}
export function ServiceList({ preview = false }: { preview?: boolean }) {
  const { t, language } = useLanguage();
  const [category, setCategory] = useState("all");
  return (
    <>
      <div
        className="category-tabs"
        aria-label={t("Leistungen filtern", "Filter treatments")}
      >
        {!preview &&
          [
            ["all", "Alle", "All"],
            ["hair", "Haare", "Hair"],
            ["beard", "Bart", "Beard"],
            ["ritual", "Rituale", "Rituals"],
          ].map(([id, de, en]) => (
            <button
              key={id}
              aria-pressed={category === id}
              onClick={() => setCategory(id)}
            >
              {t(de, en)}
            </button>
          ))}
      </div>
      <div className="service-list">
        {demoServices
          .filter((s) => category === "all" || s.category === category)
          .slice(0, preview ? 3 : undefined)
          .map((s, i) => (
            <Link
              className="service-row"
              href={`/book?service=${s.id}`}
              key={s.id}
            >
              <AssetImage
                name={serviceImages[s.id]}
                className="service-photo"
              />
              <span className="service-index">0{i + 1}</span>
              <div>
                <h3>{t(s.deName, s.name)}</h3>
                <p>{t(s.deDescription, s.description)}</p>
                <small>
                  {s.durationMinutes} min ·{" "}
                  {t("Beratung inklusive", "Consultation included")}
                </small>
              </div>
              <div className="service-price">
                {new Intl.NumberFormat(language === "de" ? "de-AT" : "en-AT", {
                  style: "currency",
                  currency: business.currency,
                  maximumFractionDigits: 0,
                }).format(s.priceCents / 100)}
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
              </div>
            </Link>
          ))}
        {!preview && (category === "all" || category === "beard") && (
          <article className="service-row shave-concept">
            <AssetImage name="service-shave" className="service-photo" />
            <div>
              <p className="eyebrow">
                {t("Behandlungskonzept", "Treatment concept")}
              </p>
              <h3>{t("Die klassische Rasur", "The classic shave")}</h3>
              <p>
                {t(
                  "Eine Idee für unser künftiges Angebot. Aktuell nicht separat buchbar.",
                  "An idea for our future menu. Not currently a separate bookable treatment.",
                )}
              </p>
              <Link className="text-link" href="/book?service=beard-trim">
                {t("Verfügbare Bartpflege buchen", "Book available beard care")}{" "}
                →
              </Link>
            </div>
          </article>
        )}
      </div>
      <p className="fine-print">
        {t(
          "Demopreise aus unserem zentralen Katalog. Für die Buchung gelten die aktuellen Daten im Buchungssystem.",
          "Demo prices from our central catalog. Booking uses the current database catalog.",
        )}
      </p>
    </>
  );
}
export function FinalCTA() {
  const { t } = useLanguage();
  return (
    <section className="final-cta">
      <div className="site-wrap">
        <p className="eyebrow">{t("Zeit für dich", "Time for yourself")}</p>
        <h2>
          {t("Guter Stil beginnt", "Good style starts")}
          <br />
          <span>{t("mit einem Termin.", "with an appointment.")}</span>
        </h2>
        <Link href="/book" className="button light">
          {t("Deinen Termin buchen", "Book your appointment")}{" "}
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
        </Link>
        <p className="fine-print">
          {t(
            "Demo-Buchungen werden in der lokalen Demo-Datenbank gespeichert.",
            "Demo appointments are stored in the local demo database.",
          )}
        </p>
      </div>
    </section>
  );
}
export default function StudioHome() {
  const { t } = useLanguage();
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-art">
          <HeroMedia />
        </div>
        <div className="site-wrap hero-content">
          <p className="eyebrow">
            <span className="tiny-line" /> WIEN · BARBER CULTURE
          </p>
          <h1>
            {t("Dein Stil.", "Your style.")}
            <br />
            {t("Unser", "Our")}
            <br />
            <em>{t("Handwerk.", "craft.")}</em>
          </h1>
          <p className="hero-description">
            {t(
              "Klare Linien. Charakter. Ein Moment nur für dich. Entdecke moderne Barberkultur mit Wiener Gelassenheit.",
              "Clean lines. Character. A moment just for you. Discover modern barber culture with a little Viennese ease.",
            )}
          </p>
          <div className="hero-buttons">
            <Link href="/book" className="button">
              {t("Termin buchen", "Book now")}{" "}
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
            </Link>
            <Link href="/services" className="text-link">
              {t("Leistungen entdecken", "Explore treatments")} ↓
            </Link>
          </div>
          <div className="hero-foot">
            <span>01 / VIENNA CUTS</span>
            <span>
              {t(
                "FIKTIVES STUDIO · KI-GENERIERTE BILDER",
                "FICTIONAL STUDIO · AI-GENERATED IMAGERY",
              )}
            </span>
          </div>
        </div>
      </section>
      <div className="values-strip">
        <span>{t("Präzision im Detail", "Precision in every detail")}</span>
        <span>*</span>
        <span>{t("Zeit für deinen Stil", "Time for your style")}</span>
        <span>*</span>
        <span>
          {t(
            "Klassisches Handwerk. Moderner Blick.",
            "Classic craft. Modern perspective.",
          )}
        </span>
      </div>
      <section className="section site-wrap" id="services">
        <div className="section-top">
          <SectionTitle
            label="01 / THE MENU"
            de="Guter Stil. Klare Preise."
            en="Good style. Clear prices."
          />
          <Link className="text-link" href="/services">
            {t("Alle Leistungen", "All treatments")}{" "}
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
          </Link>
        </div>
        <ServiceList preview />
      </section>
      <section className="about-section" id="about">
        <div className="site-wrap about-grid">
          <div className="about-art">
            <AssetImage
              name="studio-interior"
              sizes="(max-width:700px) 90vw, 50vw"
            />
            <AssetImage name="studio-interior-alt" className="about-inset" />
            <span className="art-caption">KI-KONZEPT / AI CONCEPT</span>
          </div>
          <div className="about-copy">
            <p className="eyebrow">02 / THE PHILOSOPHY</p>
            <h2>
              {t("Mehr als", "More than")}
              <br />
              {t("ein Haarschnitt.", "a haircut.")}
            </h2>
            <p>
              {t(
                "Ein guter Schnitt passt nicht nur zu deinem Gesicht. Sondern zu deinem Alltag. Bei Vienna Cuts beginnt deshalb jeder Termin mit Zuhören.",
                "A good cut fits more than your face. It fits your everyday life. That is why every Vienna Cuts appointment starts with listening.",
              )}
            </p>
            <p>
              {t(
                "Unser fiktives Wiener Studio verbindet präzises Handwerk mit einer ruhigen Atmosphäre. Ohne Eile. Ohne große Versprechen. Mit einem Blick für das Wesentliche.",
                "Our fictional Vienna studio brings considered craft to a relaxed setting. Unhurried. Unpretentious. Attentive to what matters.",
              )}
            </p>
            <div className="benefits">
              {[
                ["01", "Persönliche Beratung", "Personal consultation"],
                ["02", "Präzise Konturen", "Considered details"],
                ["03", "Entspannte Atmosphäre", "An unhurried atmosphere"],
              ].map(([n, de, en]) => (
                <div key={n}>
                  <span>{n}</span>
                  {t(de, en)}
                </div>
              ))}
            </div>
            <Link href="/team" className="text-link">
              {t("Das Team kennenlernen", "Meet the team")}{" "}
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
            </Link>
          </div>
        </div>
      </section>
      <StudioExperience />
      <section className="section site-wrap" id="results">
        <div className="section-top">
          <SectionTitle
            label="03 / STUDIO NOTES"
            de="Ein Gefühl für den Stil."
            en="A feeling for the style."
          />
          <Link href="/results" className="text-link">
            {t("Zur Galerie", "Explore the gallery")}{" "}
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
          </Link>
        </div>
        <Gallery compact />
      </section>
      <section className="section site-wrap" id="team">
        <SectionTitle
          label="04 / THE PEOPLE"
          de="Handwerk hat Persönlichkeit."
          en="Craft has character."
        />
        <Team />
      </section>
      <section className="review-section" id="reviews">
        <div className="site-wrap">
          <p className="eyebrow">
            05 / {t("FIKTIVE DEMOSTIMMEN", "FICTIONAL DEMO TESTIMONIALS")}
          </p>
          <blockquote>
            “
            {t(
              "Ein guter Schnitt. Ein ruhiger Moment. Genau das, was ich gebraucht habe.",
              "A good cut. A quiet moment. Just what I needed.",
            )}
            ”
          </blockquote>
          <p>
            —{" "}
            {t(
              "Lukas · erfundene Beispielstimme, keine echte Bewertung",
              "Lukas · fictional example, not a real review",
            )}
          </p>
        </div>
      </section>
      <section className="section site-wrap">
        <SectionTitle
          label="06 / YOUR VISIT"
          de="Drei Schritte. Dein Moment."
          en="Three steps. Your moment."
        />
        <div className="process-grid">
          {[
            [
              "01",
              "Wähle deinen Look",
              "Choose your treatment",
              "Schnitt, Bart oder das ganze Ritual.",
              "A cut, beard care or the full ritual.",
            ],
            [
              "02",
              "Finde deine Zeit",
              "Find your time",
              "Wähle deinen Barber und einen freien Termin.",
              "Choose your barber and an available appointment.",
            ],
            [
              "03",
              "Komm entspannt an",
              "Arrive relaxed",
              "Die Bestätigung erscheint erst nach erfolgreicher Speicherung.",
              "Confirmation appears only after your booking is saved.",
            ],
          ].map(([n, de, en, desc, eng]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{t(de, en)}</h3>
              <p>{t(desc, eng)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="contact-section" id="contact">
        <div className="site-wrap contact-visual">
          <AssetImage name="studio-exterior" />
          <AssetImage name="gallery-facade" />
          <ImageCreditNotice />
        </div>
        <div className="site-wrap contact-grid">
          <div>
            <p className="eyebrow">07 / SAY SERVUS</p>
            <h2>
              {t("Mitten im Leben.", "Part of your day.")}
              <br />
              {t("Gedacht für Wien.", "Made for Vienna.")}
            </h2>
            <p>
              {t(
                "Vienna Cuts ist ein fiktives Demoprojekt. Es gibt derzeit keinen realen Standort und keine telefonische Terminannahme.",
                "Vienna Cuts is a fictional demo project. There is no physical location or telephone booking service.",
              )}
            </p>
            <Link href="/book" className="button">
              {t("Demo-Buchung ausprobieren", "Try a demo booking")}{" "}
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
            </Link>
          </div>
          <div className="hours">
            <p className="eyebrow">
              {t("DEMO-ÖFFNUNGSZEITEN", "DEMO OPENING HOURS")}
            </p>
            <div>
              <span>{t("Montag – Freitag", "Monday – Friday")}</span>
              <span>{openingRange(1)}</span>
            </div>
            <div>
              <span>{t("Samstag", "Saturday")}</span>
              <span>{openingRange(6)}</span>
            </div>
            <div>
              <span>{t("Sonntag", "Sunday")}</span>
              <span>{t("Geschlossen", "Closed")}</span>
            </div>
            <small>
              Europe/Vienna ·{" "}
              {t("Österreichische Ortszeit", "Austrian local time")}
            </small>
          </div>
        </div>
      </section>
      <section className="section site-wrap faq">
        <SectionTitle
          label="08 / GOOD TO KNOW"
          de="Noch eine Frage?"
          en="Anything else?"
        />
        {[
          [
            "Ist das ein echter Salon?",
            "Is this a real salon?",
            "Nein. Dieses Projekt zeigt einen fiktiven Wiener Barbershop. Verwende für Demo-Buchungen ausschließlich Testdaten.",
            "No. This project presents a fictional Vienna barbershop. Use test details only for demo bookings.",
          ],
          [
            "Kann ich meinen Termin ändern?",
            "Can I change my appointment?",
            "Die Studioverwaltung kann Termine sicher stornieren. Eine öffentliche Umbuchung ist derzeit nicht verfügbar.",
            "The authorized studio owner can cancel appointments securely. Public rescheduling is not currently available.",
          ],
          [
            "Welche Zeitzone gilt?",
            "Which timezone is used?",
            "Alle verfügbaren Termine werden in Europe/Vienna angezeigt. Sommer- und Winterzeit werden berücksichtigt.",
            "All appointments are displayed in Europe/Vienna, accounting for daylight saving time.",
          ],
        ].map(([de, en, answer, eng]) => (
          <details key={en}>
            <summary>
              {t(de, en)}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{t(answer, eng)}</p>
          </details>
        ))}
      </section>
      <FinalCTA />
    </main>
  );
}

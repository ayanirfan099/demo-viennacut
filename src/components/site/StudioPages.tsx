"use client";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { AssetImage } from "./AssetMedia";
import { StudioExperience } from "./AssetSections";
import { openingRange } from "@/lib/business";
export default function StudioPages({ kind }: { kind: "about" | "contact" }) {
  const { t } = useLanguage();
  return (
    <main id="main" className="content-page">
      <section className="site-wrap section">
        <p className="eyebrow">
          VIENNA CUTS / {kind === "about" ? "THE STUDIO" : "SAY SERVUS"}
        </p>
        <h1 className="display-title">
          {kind === "about"
            ? t("Handwerk mit Haltung.", "Craft with character.")
            : t("Dein nächster Besuch.", "Your next visit.")}
        </h1>
        <div className="studio-page-grid">
          <AssetImage
            name={kind === "about" ? "studio-interior-alt" : "studio-exterior"}
            sizes="(max-width:768px) 90vw, 50vw"
          />
          <div>
            <h2>
              {kind === "about"
                ? t("Zeit für einen guten Schnitt.", "Time for a good cut.")
                : t(
                    "Ein fiktives Studio in Wien.",
                    "An imagined studio in Vienna.",
                  )}
            </h2>
            <p>
              {t(
                "Vienna Cuts ist ein Konzept für einen ruhigen, persönlichen Barbershop. Präzise Schnitte, klare Konturen und Zeit für deine Wünsche stehen im Mittelpunkt.",
                "Vienna Cuts is a concept for a calm, personal barbershop. Precise cuts, considered details and time to listen are at its heart.",
              )}
            </p>
            <p>
              {t(
                "Diese Demo zeigt KI-generierte Räume und fiktive Profile. Es gibt keine verifizierte Geschäftsadresse, Telefonnummer oder reale Terminannahme. Verwende bei Buchungen ausschließlich Testdaten.",
                "This demo shows AI-generated spaces and fictional profiles. There is no verified business address, phone number or real appointment service. Use test details for bookings.",
              )}
            </p>
            {kind === "contact" && (
              <dl className="hours">
                <div>
                  <dt>{t("Montag – Freitag", "Monday – Friday")}</dt>
                  <dd>{openingRange(1)}</dd>
                </div>
                <div>
                  <dt>{t("Samstag", "Saturday")}</dt>
                  <dd>{openingRange(6)}</dd>
                </div>
                <div>
                  <dt>{t("Sonntag", "Sunday")}</dt>
                  <dd>{t("Geschlossen", "Closed")}</dd>
                </div>
              </dl>
            )}
            <Link className="button" href="/book">
              {t("Demo-Termin buchen", "Book a demo appointment")} →
            </Link>
          </div>
        </div>
      </section>
      {kind === "about" && <StudioExperience />}
    </main>
  );
}

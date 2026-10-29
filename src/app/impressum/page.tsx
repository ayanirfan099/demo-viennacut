"use client";
import Link from "next/link";
import { useLanguage } from "@/components/site/LanguageProvider";

export default function ImpressumPage() {
  const { t } = useLanguage();
  return (
    <main id="main" className="mx-auto max-w-3xl px-6 pb-24 pt-20">
      <p className="text-sm uppercase tracking-[.2em] text-muted">
        Vienna Cuts · Demo
      </p>
      <h1 className="mt-5 text-5xl font-semibold">
        {t("Impressum", "Legal notice")}
      </h1>
      <p className="mt-8 text-lg">
        {t(
          "Diese Website zeigt ein fiktives Barbershop-Konzept. Sie ist kein Angebot eines realen Geschäftsbetriebs.",
          "This website presents a fictional barbershop concept. It is not an offer from a real business.",
        )}
      </p>
      <h2 className="mt-10 text-2xl">
        {t("Vor Veröffentlichung zu ergänzen", "Complete before publication")}
      </h2>
      <ul className="mt-5 list-disc space-y-3 pl-5 text-muted">
        <li>
          {t(
            "Vollständiger Firmenname, Rechtsform und verantwortliche Person",
            "Full legal business name, legal form and responsible person",
          )}
        </li>
        <li>
          {t(
            "Ladungsfähige Anschrift, Telefonnummer und E-Mail-Adresse",
            "Registered address, telephone number and email address",
          )}
        </li>
        <li>
          {t(
            "Firmenbuchnummer, zuständiges Gericht und UID-Nummer, soweit erforderlich",
            "Company registration, competent court and VAT number, where applicable",
          )}
        </li>
        <li>
          {t(
            "Zuständige Gewerbebehörde, Kammerzugehörigkeit und anwendbare Berufsregeln",
            "Competent trade authority, chamber membership and applicable professional rules",
          )}
        </li>
      </ul>
      <p className="mt-8">
        {t(
          "Diese Platzhalter müssen vom Betreiber geprüft und mit zutreffenden Angaben ersetzt werden. Keine Rechtsberatung.",
          "The operator must review these placeholders and replace them with accurate information. This is not legal advice.",
        )}
      </p>
      <Link
        href="/datenschutz"
        className="mt-8 inline-block underline underline-offset-4"
      >
        {t("Datenschutz lesen", "Read privacy information")}
      </Link>
    </main>
  );
}

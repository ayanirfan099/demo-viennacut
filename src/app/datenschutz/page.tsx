"use client";
import Link from "next/link";
import { useLanguage } from "@/components/site/LanguageProvider";

export default function PrivacyPage() {
  const { t } = useLanguage();
  return (
    <main id="main" className="mx-auto max-w-3xl px-6 pb-24 pt-20">
      <p className="text-sm uppercase tracking-[.2em] text-muted">
        Vienna Cuts · Demo
      </p>
      <h1 className="mt-5 text-5xl font-semibold">
        {t("Datenschutz", "Privacy")}
      </h1>
      <p className="mt-8 text-lg">
        {t(
          "Entwurf zur Prüfung durch den Betreiber. Bitte verwende in dieser Demo ausschließlich fiktive Kontaktdaten.",
          "Draft for operator review. Please use fictional contact details only in this demo.",
        )}
      </p>
      <h2 className="mt-10 text-2xl">
        {t("Buchungsdaten", "Booking information")}
      </h2>
      <p className="mt-4 text-muted">
        {t(
          "Bei einer Buchung werden Name, Kontaktdaten, gewählte Leistung, Barber und Termin in der verbundenen Datenbank gespeichert. Autorisierte Betreiber können diese Daten zur Terminverwaltung einsehen. Eine Erfolgsmeldung erscheint erst nach erfolgreicher Speicherung.",
          "A booking stores your name, contact information, selected service, barber and appointment in the connected database. Authorized operators can access this information to manage appointments. A success message appears only after storage succeeds.",
        )}
      </p>
      <h2 className="mt-10 text-2xl">
        {t("Technische Speicherung", "Technical storage")}
      </h2>
      <p className="mt-4 text-muted">
        {t(
          "Die Sprachauswahl wird im Browser gespeichert. Die Betreiberanmeldung verwendet notwendige Sitzungscookies. Hosting und Server können technische Zugriffsprotokolle führen. Es sind keine Marketing-Tracker oder eingebetteten Karten vorgesehen.",
          "The language preference is stored in your browser. Owner sign-in uses necessary session cookies. Hosting and servers may maintain technical access logs. Marketing trackers and embedded maps are not included.",
        )}
      </p>
      <h2 className="mt-10 text-2xl">
        {t(
          "Vor dem Echtbetrieb erforderlich",
          "Required before live operation",
        )}
      </h2>
      <p className="mt-4 text-muted">
        {t(
          "Verantwortlichen und Datenschutzkontakt benennen; Rechtsgrundlagen, Auftragsverarbeiter, Hosting-Standort, mögliche Drittlandtransfers und konkrete Löschfristen prüfen und veröffentlichen. Ein automatischer Löschprozess ist derzeit nicht implementiert. Betroffenenrechte, Beschwerdemöglichkeit bei der österreichischen Datenschutzbehörde und ein verifizierter Kontaktweg müssen ergänzt werden.",
          "Identify the controller and privacy contact; review and publish legal bases, processors, hosting location, any international transfers and specific retention periods. Automatic deletion is not currently implemented. Data subject rights, the right to complain to the Austrian Data Protection Authority and a verified contact channel must be supplied.",
        )}
      </p>
      <Link
        href="/cookies"
        className="mt-8 inline-block underline underline-offset-4"
      >
        {t("Cookies und lokale Speicherung", "Cookies and local storage")}
      </Link>
    </main>
  );
}

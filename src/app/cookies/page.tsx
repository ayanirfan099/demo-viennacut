"use client";
import { useLanguage } from "@/components/site/LanguageProvider";

export default function CookiesPage() {
  const { t } = useLanguage();
  return (
    <main id="main" className="mx-auto max-w-3xl px-6 pb-24 pt-20">
      <p className="text-sm uppercase tracking-[.2em] text-muted">
        Vienna Cuts · Demo
      </p>
      <h1 className="mt-5 text-5xl font-semibold">
        {t("Cookies & Speicherung", "Cookies & storage")}
      </h1>
      <p className="mt-8 text-lg">
        {t(
          "Transparenz ohne unnötiges Tracking.",
          "Transparency without unnecessary tracking.",
        )}
      </p>
      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-2xl">{t("Sprache", "Language")}</h2>
          <p className="mt-3 text-muted">
            {t(
              "Deine Auswahl zwischen Deutsch und Englisch wird lokal im Browser gespeichert. Du kannst sie jederzeit über den Sprachschalter ändern oder über die Website-Daten deines Browsers entfernen.",
              "Your German or English preference is stored locally in your browser. Change it with the language switcher or remove it through your browser’s site-data settings.",
            )}
          </p>
        </section>
        <section>
          <h2 className="text-2xl">
            {t("Betreiber-Sitzung", "Owner session")}
          </h2>
          <p className="mt-3 text-muted">
            {t(
              "Nach der Betreiberanmeldung setzt die Authentifizierung notwendige Sitzungscookies. Die Sitzung läuft nach maximal zwölf Stunden ab; Abmelden beendet die Sitzung früher.",
              "After owner sign-in, authentication sets necessary session cookies. Sessions expire after a maximum of twelve hours; signing out ends a session earlier.",
            )}
          </p>
        </section>
        <section>
          <h2 className="text-2xl">
            {t("Optionale Dienste", "Optional services")}
          </h2>
          <p className="mt-3 text-muted">
            {t(
              "Diese Demo lädt keine Analyse- oder Werbe-Tracker und keine eingebetteten Karten. Werden solche Dienste später ergänzt, müssen der Betreiber und seine rechtliche Beratung die notwendigen Einwilligungen und Informationen vorab prüfen.",
              "This demo does not load analytics or advertising trackers or embedded maps. If these services are added later, the operator and legal adviser must first review required consent and disclosures.",
            )}
          </p>
        </section>
      </div>
      <p className="mt-10 border-t border-border pt-6 text-sm text-muted">
        {t(
          "Demo-Informationen. Vor Veröffentlichung vom Betreiber auf die tatsächliche Konfiguration abstimmen lassen.",
          "Demo information. The operator must align it with the actual configuration before publication.",
        )}
      </p>
    </main>
  );
}

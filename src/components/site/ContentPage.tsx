"use client";
import { useLanguage } from "./LanguageProvider";
import { ServiceList, Gallery, Team, FinalCTA } from "./Studio";
export default function ContentPage({
  kind,
}: {
  kind: "services" | "results" | "team";
}) {
  const { t } = useLanguage();
  const content = {
    services: [
      "THE MENU",
      "Dein Look. Dein Ritual.",
      "Your look. Your ritual.",
    ],
    results: ["STUDIO NOTES", "Räume für guten Stil.", "Space for good style."],
    team: ["THE PEOPLE", "Persönlich. Präzise.", "Personal. Precise."],
  }[kind];
  return (
    <main id="main" className="content-page">
      <section className="site-wrap section">
        <p className="eyebrow">VIENNA CUTS / {content[0]}</p>
        <h1 className="display-title">{t(content[1], content[2])}</h1>
        <p className="page-deck">
          {kind === "services"
            ? t(
                "Ausgewählte Klassiker. Klare Preise. Finde dein nächstes Ritual.",
                "Thoughtful essentials. Clear prices. Find your next ritual.",
              )
            : kind === "results"
              ? t(
                  "Handwerk, Atmosphäre und Details. Eine Sammlung fiktiver KI-Bildkonzepte.",
                  "Craft, atmosphere and details. A collection of fictional AI image concepts.",
                )
              : t(
                  "Persönlichkeiten unserer Stilwelt. Entdecke die Profile und das buchbare Demo-Team.",
                  "The personalities of our style world. Explore the profiles and bookable demo team.",
                )}
        </p>
        {kind === "services" ? (
          <ServiceList />
        ) : kind === "results" ? (
          <Gallery />
        ) : (
          <Team />
        )}
      </section>
      <FinalCTA />
    </main>
  );
}

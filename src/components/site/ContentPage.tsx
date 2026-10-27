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

"use client";
import { useCatalog } from "./useCatalog";
import Link from "next/link";
import { useRef, useState } from "react";
import { galleryImages, imageAsset, type ImageName } from "@/lib/images";
import { AssetImage, ImageCreditNotice } from "./AssetMedia";
import { useLanguage } from "./LanguageProvider";
export function Gallery({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const [filter, setFilter] = useState("all");
  const images = compact
    ? galleryImages.slice(0, 3)
    : galleryImages.filter(
        (name) =>
          filter === "all" ||
          (filter === "craft"
            ? [
                "gallery-cut-detail",
                "gallery-beard-detail",
                "gallery-fade-detail",
                "gallery-grooming-detail",
                "gallery-clipper-work",
                "gallery-scissors",
              ].includes(name)
            : ![
                "gallery-cut-detail",
                "gallery-beard-detail",
                "gallery-fade-detail",
                "gallery-grooming-detail",
                "gallery-clipper-work",
                "gallery-scissors",
              ].includes(name)),
      );
  const active = images[selected];
  function move(amount: number) {
    setSelected((n) => (n + amount + images.length) % images.length);
  }
  return (
    <>
      <ImageCreditNotice />
      {!compact && (
        <div
          className="category-tabs"
          aria-label={t("Galeriefilter", "Gallery filters")}
        >
          {[
            ["all", "Alle Bilder", "All images"],
            ["craft", "Handwerk", "Craft"],
            ["mood", "Atmosphäre", "Atmosphere"],
          ].map(([value, de, en]) => (
            <button
              key={value}
              aria-pressed={filter === value}
              onClick={() => {
                setFilter(value);
                setSelected(0);
              }}
            >
              {t(de, en)}
            </button>
          ))}
        </div>
      )}
      <div
        className={`photo-gallery ${compact ? "photo-gallery-editorial" : ""}`}
      >
        {images.map((name, index) => {
          const asset = imageAsset(name);
          return (
            <button
              className="photo-tile"
              key={name}
              onClick={() => {
                setSelected(index);
                dialog.current?.showModal();
              }}
              aria-label={t(
                `${String(index + 1).padStart(2, "0")} / Bild ansehen +: ${asset.alt_de}`,
                `${String(index + 1).padStart(2, "0")} / View image +: ${asset.alt_en}`,
              )}
            >
              <AssetImage name={name} />
              <span>
                {String(index + 1).padStart(2, "0")} /{" "}
                {t("Bild ansehen", "View image")}{" "}
                <span aria-hidden="true">+</span>
              </span>
            </button>
          );
        })}
      </div>
      <dialog
        ref={dialog}
        className="lightbox photo-lightbox"
        aria-label={t("Bildergalerie", "Image gallery")}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          }
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <button
          className="close-modal"
          autoFocus
          onClick={() => dialog.current?.close()}
          aria-label={t("Schließen", "Close")}
        >
          ×
        </button>
        {active && (
          <AssetImage name={active} sizes="(max-width:700px) 90vw, 700px" />
        )}
        <div className="lightbox-controls">
          <button
            onClick={() => move(-1)}
            aria-label={t("Vorheriges Bild", "Previous image")}
          >
            ←
          </button>
          <p aria-live="polite">
            {selected + 1} / {images.length} · {t("KI-Konzept", "AI concept")}
          </p>
          <button
            onClick={() => move(1)}
            aria-label={t("Nächstes Bild", "Next image")}
          >
            →
          </button>
        </div>
      </dialog>
      {!compact && <StyleConcepts />}
    </>
  );
}
export function StyleConcepts() {
  const { t } = useLanguage();
  return (
    <section className="style-concepts">
      <p className="eyebrow">{t("STILSTUDIEN", "STYLE STUDIES")}</p>
      <h2>
        {t("Zwei Ideen. Ein neuer Blick.", "Two ideas. A new perspective.")}
      </h2>
      <p className="section-intro">
        {t(
          "KI-generierte Styling-Konzepte – keine echten Kundenresultate",
          "AI-generated style concepts — not real client results",
        )}
      </p>
      <div className="concept-grid">
        {(["fade", "side", "beard"] as const).map((style) => (
          <figure key={style}>
            <div className="concept-pair">
              {(["before", "after"] as const).map((state, i) => (
                <div key={state}>
                  <AssetImage name={`concept-${style}-${state}` as ImageName} />
                  <span>
                    {t("Konzept", "Concept")} {i === 0 ? "A" : "B"}
                  </span>
                </div>
              ))}
            </div>
            <figcaption>
              {style === "fade"
                ? "Fade"
                : style === "side"
                  ? t("Profil", "Profile")
                  : t("Bart", "Beard")}{" "}
              · {t("Illustrativer Vergleich", "Illustrative comparison")}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
export function Team() {
  const { t } = useLanguage();
  const { data, error, retry } = useCatalog();
  return (
    <>
      <p className="section-intro">
        {t(
          "Vier Gesichter unserer Stilwelt. Alle Porträts und Profile sind fiktive KI-Konzepte. Buchbare Barber findest du im Terminkalender.",
          "Four faces of our style world. All portraits and profiles are fictional AI concepts. Find bookable barbers in the appointment calendar.",
        )}
      </p>
      <div
        className="bookable-team"
        aria-label={t("Buchbares Team", "Bookable team")}
      >
        <h2>{t("Deine Barber im Kalender", "Your bookable barbers")}</h2>
        {!data && !error && (
          <p role="status">{t("Team wird geladen …", "Loading team …")}</p>
        )}
        {error && (
          <p role="alert">
            {t("Team ist gerade nicht erreichbar.", "Team is unavailable.")}{" "}
            <button onClick={retry}>{t("Erneut versuchen", "Retry")}</button>
          </p>
        )}
        {data?.barbers.map((barber) => (
          <article key={barber.id}>
            <div>
              <h3>{barber.name}</h3>
              <p>
                {t("Im Demo-Kalender buchbar", "Bookable in the demo calendar")}
              </p>
            </div>
            <Link className="button" href={`/book?barber=${barber.id}`}>
              {t("Termin buchen", "Book appointment")} →
            </Link>
          </article>
        ))}
      </div>
      <div className="portrait-grid">
        {["Alex", "Lukas", "Emre", "David"].map((name, i) => (
          <article className="portrait-card" key={name}>
            <AssetImage
              name={`team-${name.toLowerCase()}` as ImageName}
              sizes="(max-width:600px) 90vw, (max-width:1000px) 45vw, 23vw"
            />
            <div>
              <p className="eyebrow">
                0{i + 1} / {t("KI-Demoprofil", "AI demo profile")}
              </p>
              <h3>{name}</h3>
              <p className="profile-status">
                {t(
                  "Fiktives Stilprofil · kein eigener Buchungseintrag",
                  "Fictional style profile · not a separate booking entry",
                )}
              </p>
              <Link className="text-link" href="/book">
                {t("Buchbare Barber ansehen", "View bookable barbers")} →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
export function StudioExperience() {
  const { t } = useLanguage();
  return (
    <section className="experience-section">
      <div className="site-wrap">
        <p className="eyebrow">
          {t("DIE KUNST DER GELASSENHEIT", "THE ART OF SLOWING DOWN")}
        </p>
        <h2>
          {t("Ankommen. Durchatmen.", "Arrive. Exhale.")}
          <br />
          {t("Du bist dran.", "Your moment.")}
        </h2>
        <div className="experience-grid">
          {(
            [
              ["studio-lounge", "Zeit für dich", "Time for yourself"],
              ["studio-reception", "Ein warmer Empfang", "A warm welcome"],
              ["studio-gallery", "Raum für Handwerk", "Room for craft"],
            ] as const
          ).map(([name, de, en]) => (
            <figure key={name}>
              <AssetImage name={name} />
              <figcaption>{t(de, en)}</figcaption>
            </figure>
          ))}
        </div>
        <ImageCreditNotice />
      </div>
    </section>
  );
}

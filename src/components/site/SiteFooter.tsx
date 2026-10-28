"use client";
import { ImageCreditNotice } from "./AssetMedia";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
export default function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="site-wrap">
        <ImageCreditNotice />
      </div>
      <div className="site-wrap footer-top">
        <Link className="footer-logo" href="/">
          VIENNA CUTS.
        </Link>
        <p>
          {t("Gutes Handwerk. Gutes Gefühl.", "Good craft. Good feeling.")}
          <br />
          <span>
            {t(
              "Ein fiktives Studio. Eine echte Demo.",
              "A fictional studio. A working demo.",
            )}
          </span>
        </p>
        <Link className="text-link" href="/book">
          {t("Dein nächster Termin", "Your next appointment")}{" "}
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
      <div className="site-wrap footer-bottom">
        <span>© 2026 Vienna Cuts · {t("Demoprojekt", "Demo project")}</span>
        <nav aria-label={t("Rechtliches", "Legal")}>
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">{t("Datenschutz", "Privacy")}</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/owner/login">{t("Studio-Login", "Owner login")}</Link>
        </nav>
      </div>
    </footer>
  );
}

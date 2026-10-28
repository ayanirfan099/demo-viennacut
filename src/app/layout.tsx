import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import { LanguageProvider } from "@/components/site/LanguageProvider";
import SiteFooter from "@/components/site/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vienna Cuts — Handwerk. Haltung. Dein Stil.",
  openGraph: {
    title: "Vienna Cuts — Barber Culture",
    description: "Ein fiktives Wiener Studio. Entdecke unsere Demo.",
    locale: "de_AT",
    type: "website",
  },
  twitter: { card: "summary", title: "Vienna Cuts — Barber Culture" },
  description:
    "Fiktives Wiener Barberstudio. Präzise Schnitte, Bartpflege und entspannte Rituale. Vienna Cuts Demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" data-scroll-behavior="smooth">
      <body className="antialiased">
        <LanguageProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import { LanguageProvider } from "@/components/site/LanguageProvider";
import SiteFooter from "@/components/site/SiteFooter";
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({
  src: "./fonts/dm-sans.ttf",
  variable: "--font-sans",
  display: "swap",
  weight: "100 1000",
});
const serif = localFont({
  src: [
    { path: "./fonts/dm-serif-display.ttf", weight: "400", style: "normal" },
    {
      path: "./fonts/dm-serif-display-italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-editorial",
  display: "swap",
});

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
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        <LanguageProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}

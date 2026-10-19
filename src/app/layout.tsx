
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vienna Cuts | Premium Barbershop",
  description:
    "Modern barbering, classic style, and expert grooming in Vienna, Austria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { preload } from "react-dom";
import { SiteHeader, SiteFooter } from "@/components/site/site-shell";
import "./globals.css";
import "./site-navigation.css";

export const metadata: Metadata = {
  title: {
    default: "Portfolio Quest",
    template: "%s | Portfolio Quest",
  },
  description:
    "A portfolio of professional design work, creative concepts, and playable prototypes. Currently under construction.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  preload("/fonts/anton/Anton-Regular.ttf", {
    as: "font",
    type: "font/ttf",
    crossOrigin: "anonymous",
  });

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content" className="main-content" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

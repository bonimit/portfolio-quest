import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Portfolio Quest",
    template: "%s | Portfolio Quest",
  },
  description:
    "A portfolio of professional design work, creative concepts, and playable prototypes. Currently under construction.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-3xl px-6 py-16">{children}</main>
      </body>
    </html>
  );
}

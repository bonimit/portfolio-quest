import type { Metadata } from "next";
import { ActionLink } from "@/components/ui/action-link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page could not be found. Return to Portfolio Quest home.",
};

export default function NotFound() {
  return (
    <section className="placeholder-page">
      <h1>404 — Page not found</h1>
      <p className="page-description">The page you requested could not be found.</p>
      <ActionLink href="/" variant="secondary">Return home</ActionLink>
    </section>
  );
}

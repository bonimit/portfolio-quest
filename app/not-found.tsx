import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page could not be found. Return to Portfolio Quest home.",
};

export default function NotFound() {
  return (
    <>
      <h1 className="text-3xl font-semibold">404 — Page not found</h1>
      <p className="mt-4 text-lg">The page you requested could not be found.</p>
      <Link className="mt-6 inline-block underline" href="/">
        Return home
      </Link>
    </>
  );
}

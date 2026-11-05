import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

const description =
  "Background, skills, experience, and a public resume will be shared here once approved.";

export const metadata: Metadata = {
  title: "About",
  description,
  openGraph: { title: "About | Portfolio Quest", description },
};

export default function AboutPage() {
  return <PlaceholderPage title="About" description={description} />;
}

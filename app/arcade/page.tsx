import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

const description =
  "Interactive demos, experimental apps, and creative prototypes will be collected here.";

export const metadata: Metadata = {
  title: "Prototype Arcade",
  description,
  openGraph: { title: "Prototype Arcade | Portfolio Quest", description },
};

export default function ArcadePage() {
  return <PlaceholderPage title="Prototype Arcade" description={description} />;
}

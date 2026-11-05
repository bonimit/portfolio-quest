import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

const description =
  "Explore professional design work, creative concepts, and playable prototypes. Portfolio and adventure experiences are planned.";

export const metadata: Metadata = {
  title: "Home",
  description,
  openGraph: { title: "Home | Portfolio Quest", description },
};

export default function HomePage() {
  return <PlaceholderPage title="Portfolio Quest" description={description} />;
}

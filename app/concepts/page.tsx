import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

const description =
  "Ideas, pitches, prototypes, and the stories behind evolving concepts will appear here.";

export const metadata: Metadata = {
  title: "Concept Lab",
  description,
  openGraph: { title: "Concept Lab | Portfolio Quest", description },
};

export default function ConceptsPage() {
  return <PlaceholderPage title="Concept Lab" description={description} />;
}

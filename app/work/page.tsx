import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

const description =
  "Professional design projects and detailed case studies will be collected here.";

export const metadata: Metadata = {
  title: "Selected Work",
  description,
  openGraph: { title: "Selected Work | Portfolio Quest", description },
};

export default function WorkPage() {
  return <PlaceholderPage title="Selected Work" description={description} />;
}

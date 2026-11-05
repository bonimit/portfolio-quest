import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

const description =
  "Approved public contact details and professional links will be available here.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  openGraph: { title: "Contact | Portfolio Quest", description },
};

export default function ContactPage() {
  return <PlaceholderPage title="Contact" description={description} />;
}

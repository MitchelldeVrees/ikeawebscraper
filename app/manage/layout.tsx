import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mijn Alerts | Tweede Kans Slim & Circulair",
  description: "Beheer je actieve IKEA Tweede Kans alerts en productwatches.",
  alternates: {
    canonical: "/manage",
    languages: {
      "nl-NL": "/manage",
      "x-default": "/manage",
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

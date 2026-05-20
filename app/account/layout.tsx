import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accountinstellingen | Tweede Kans Slim & Circulair",
  description: "Bekijk en beheer je accountgegevens en voorkeuren.",
  alternates: {
    canonical: "/account",
    languages: {
      "nl-NL": "/account",
      "x-default": "/account",
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

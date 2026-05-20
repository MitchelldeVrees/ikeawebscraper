import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welkom | Tweede Kans Slim & Circulair",
  description: "Welkom in je account. Stel je eerste IKEA Tweede Kans alerts in.",
  alternates: {
    canonical: "/welcome",
    languages: {
      "nl-NL": "/welcome",
      "x-default": "/welcome",
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

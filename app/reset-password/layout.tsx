import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wachtwoord Resetten | Tweede Kans Slim & Circulair",
  description: "Stel een nieuw wachtwoord in voor je account.",
  alternates: {
    canonical: "/reset-password",
    languages: {
      "nl-NL": "/reset-password",
      "x-default": "/reset-password",
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

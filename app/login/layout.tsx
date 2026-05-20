import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inloggen | Tweede Kans Slim & Circulair",
  description: "Log in op je account om je IKEA Tweede Kans alerts te beheren.",
  alternates: {
    canonical: "/login",
    languages: {
      "nl-NL": "/login",
      "x-default": "/login",
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

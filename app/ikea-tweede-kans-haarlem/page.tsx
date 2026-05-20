import type { Metadata } from "next";
import { StoreLocationPage } from "@/components/store-location-page";

export const metadata: Metadata = {
  title: "IKEA Tweede Kans Haarlem | Actuele Aanbiedingen en Winkeltips",
  description:
    "Bekijk actuele IKEA Tweede Kans aanbiedingen voor Haarlem met actuele API-gegevens, winkelinformatie en praktische tips.",
  alternates: {
    canonical: "/ikea-tweede-kans-haarlem",
    languages: {
      "nl-NL": "/ikea-tweede-kans-haarlem",
      "x-default": "/ikea-tweede-kans-haarlem",
    },
  },
};

export const revalidate = 300;

export default function HaarlemStorePage() {
  return (
    <StoreLocationPage
      storeId="378"
      city="Haarlem"
      ikeaSlug="haarlem"
      tips={[
        "Haarlem-aanbod wisselt snel; activeer alerts op je belangrijkste productcodes.",
        "Vergelijk Haarlem met Amsterdam voor extra kans op dezelfde artikelen.",
        "Gebruik de storepagina voor actuele openingstijden voordat je vertrekt.",
      ]}
    />
  );
}

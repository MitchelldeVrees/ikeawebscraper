import type { Metadata } from "next";
import { StoreLocationPage } from "@/components/store-location-page";

export const metadata: Metadata = {
  title: "IKEA Tweede Kans Amsterdam | Actuele Aanbiedingen en Winkeltips",
  description:
    "Bekijk actuele IKEA Tweede Kans aanbiedingen voor Amsterdam met actuele API-gegevens, winkelinformatie en praktische tips.",
  alternates: {
    canonical: "/ikea-tweede-kans-amsterdam",
    languages: {
      "nl-NL": "/ikea-tweede-kans-amsterdam",
      "x-default": "/ikea-tweede-kans-amsterdam",
    },
  },
};

export const revalidate = 300;

export default function AmsterdamStorePage() {
  return (
    <StoreLocationPage
      storeId="088"
      city="Amsterdam"
      ikeaSlug="amsterdam"
      tips={[
        "Check meerdere keren per dag, omdat populaire Amsterdam deals snel verdwijnen.",
        "Gebruik alerts voor specifieke artikelnummers om handmatig zoeken te vermijden.",
        "Combineer online check met een kort winkelbezoek als je flexibel bent.",
      ]}
    />
  );
}

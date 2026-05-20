import type { Metadata } from "next";
import { StoreLocationPage } from "@/components/store-location-page";

export const metadata: Metadata = {
  title: "IKEA Tweede Kans Delft | Actuele Aanbiedingen en Winkeltips",
  description:
    "Bekijk actuele IKEA Tweede Kans aanbiedingen voor Delft met actuele API-gegevens, winkelinformatie en praktische tips.",
  alternates: {
    canonical: "/ikea-tweede-kans-delft",
    languages: {
      "nl-NL": "/ikea-tweede-kans-delft",
      "x-default": "/ikea-tweede-kans-delft",
    },
  },
};

export const revalidate = 300;

export default function DelftStorePage() {
  return (
    <StoreLocationPage
      storeId="151"
      city="Delft"
      ikeaSlug="delft"
      tips={[
        "Delft heeft vaak sterke deals op werkplekken en opbergmeubels; zet daar alerts op.",
        "Bekijk live dealdata vlak voor vertrek om onnodige ritten te voorkomen.",
        "Check ook omliggende stores als je exact item niet in Delft staat.",
      ]}
    />
  );
}

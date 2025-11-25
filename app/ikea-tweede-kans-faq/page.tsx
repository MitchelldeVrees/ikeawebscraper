import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "IKEA Tweede Kans FAQ Nederland | Alerts & Tips voor Tweedekanshoek",
  description:
    "Antwoorden op veelgestelde vragen over IKEA Tweede Kans in Nederland. Leer over alerts, hoe de Tweedekanshoek werkt, garanties, online kopen en meer voor tweedehands IKEA deals.",
};

const faqEntries = [
  {
    question: "Wat is IKEA Tweede Kans?",
    answer:
      "IKEA Tweede Kans, ook bekend als de Tweedekanshoek, is een speciale afdeling in IKEA winkels waar producten een tweede leven krijgen. Dit omvat showmodellen, herverpakte producten, uitgaand assortiment en items met een kleine beschadiging. Bij ieder product staat de prijs, productinformatie en reden voor herverkoop vermeld. Het assortiment wisselt voortdurend en ondersteunt duurzaamheid door afval te verminderen.",
  },
  {
    question: "Welke producten zijn beschikbaar in de IKEA Tweede Kans?",
    answer:
      "In de Tweedekanshoek vind je een verscheidenheid aan producten, zoals meubels (bijv. boekenkasten, bedden, stoelen), accessoires, keukenartikelen en verlichting. Dit zijn vaak showmodellen, herverpakte items, uitlopende producten of licht beschadigde artikelen die tegen gereduceerde prijzen worden verkocht, soms tot 50% korting of meer.",
  },
  {
    question: "Wat zijn de garanties op IKEA Tweede Kans producten?",
    answer:
      "Op aankopen uit de Tweedekanshoek geldt een standaard garantietermijn van 2 jaar, maar alleen op de functionaliteit. De garantie vervalt op de reden waarom het artikel in de Tweedekanshoek staat (vermeld op de sticker). Matrassen hebben geen 90-dagen omruilgarantie. Voor beschadigde producten is de gele sticker leidend.",
  },
  {
    question: "Kan ik IKEA Tweede Kans producten retourneren of ruilen?",
    answer:
      "Ja, producten uit de Tweedekanshoek kunnen worden geruild of geretourneerd, net als reguliere aankopen. Als iets niet past zoals gedacht, kun je het binnen de standaard retourperiode terugbrengen naar de winkel.",
  },
  {
    question: "Hoe kan ik IKEA Tweede Kans producten online kopen?",
    answer:
      "IKEA Family-leden kunnen Tweedekanshoek-producten online reserveren via de IKEA website. Kies een vestiging, gebruik de reserveringsknop en bevestig via je account. Je ontvangt een e-mail met tijdsloten voor ophalen. Betaling gebeurt alleen via pin in de winkel. Niet alle winkels bieden online aanbod.",
  },
  {
    question: "Is er transport beschikbaar voor Tweede Kans producten?",
    answer:
      "Nee, voor producten uit de Tweedekanshoek mag je geen transportservice boeken. Sommige items worden gemonteerd verkocht, maar je kunt gereedschap lenen om ze te demonteren met hulp van IKEA medewerkers. Overweeg het huren van een busje via IKEA's partner Hertz voor grote aankopen.",
  },
  {
    question: "In welke IKEA winkels in Nederland is de Tweede Kans beschikbaar?",
    answer:
      "De Tweedekanshoek is beschikbaar in alle IKEA vestigingen in Nederland, waaronder Amsterdam, Delft, Eindhoven, Groningen, Haarlem, Heerlen, Hengelo, Utrecht en Zwolle. Controleer lokale aanbiedingen en openingstijden op de IKEA website.",
  },
  {
    question: "Hoe snel ontvang ik notificaties via de alerts?",
    answer:
      "Ons systeem controleert IKEA aanbiedingen elke paar minuten. Je ontvangt een e-mail zodra een matching artikel beschikbaar komt in een geselecteerde winkel. Dit is near real-time, maar hangt af van IKEA's updates.",
  },
  {
    question: "Is deze tool affiliated met IKEA of de Tweedekansje team?",
    answer:
      "Nee, dit is een onafhankelijke tool. We gebruiken publiek beschikbare data van IKEA's Tweedekanshoek om alerts te bieden en samenvattingen te geven.",
  },
  {
    question: "Kan ik meerdere winkels of artikelen tracken?",
    answer:
      "Ja, je kunt alerts instellen voor meerdere artikel nummers en elke combinatie van IKEA winkels in Nederland kiezen. Dit helpt om deals sneller te vinden zonder dagelijks te checken.",
  },
  {
    question: "Waarom verkoopt IKEA tweedehands meubels?",
    answer:
      "IKEA verkoopt tweedehands meubels om duurzaamheid te bevorderen en afval te verminderen. Via de Terugkoopservice kopen ze gebruikte IKEA producten terug om ze een tweede leven te geven. Het doel is om circulair te worden tegen 2030, met producten die hergebruikt, gerepareerd of gerecycled kunnen worden.",
  },
  {
    question: "Hoe draagt IKEA Tweede Kans bij aan duurzaamheid?",
    answer:
      "Door producten een tweede kans te geven, voorkomt IKEA dat miljoenen meubels wereldwijd bij het afval belanden. Het moedigt hergebruik aan, biedt reserveonderdelen voor reparaties en inspireert tot betaalbare, duurzame woonoplossingen.",
  },
];

export default function FAQPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="container mx-auto px-4 py-8 space-y-10">
        <SiteHeader />
        <section className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-2">
            IKEA Tweede Kans FAQ Nederland
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            IKEA Tweede Kans FAQ
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mx-auto max-w-2xl">
            Vind antwoorden op veelgestelde vragen over de IKEA Tweedekanshoek in Nederland. Leer hoe alerts werken, wat je kunt verwachten van tweedehands IKEA stock, garanties, online kopen en tips om deals te vinden.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {[
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=800&q=80",
          ].map((src, index) => (
            <div key={src} className="relative h-48 overflow-hidden rounded-2xl border border-border">
              <Image src={src} alt="IKEA Tweede Kans inspiratie Nederland" fill className="object-cover" />
            </div>
          ))}
        </section>

        <section className="space-y-4">
          {faqEntries.map((entry) => (
            <article key={entry.question} className="rounded-2xl border border-border p-4">
              <h2 className="text-lg font-semibold mb-2">{entry.question}</h2>
              <p className="text-sm text-muted-foreground">{entry.answer}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-border p-6 bg-gradient-to-br from-primary/10 to-transparent space-y-4">
          <h2 className="text-2xl font-semibold">Wil je alerts in plaats van handmatig zoeken?</h2>
          <p className="text-sm text-muted-foreground">
            Stel in seconden een watch in om notificaties te krijgen wanneer de items die je wilt in de IKEA Tweede Kans stock verschijnen in Nederland.
          </p>
          <Button asChild size="lg">
            <Link href="/#watch-alerts">Stel Nu Alerts In</Link>
          </Button>
        </section>

        <footer className="text-sm text-muted-foreground border-t border-border pt-4 space-y-2">
          <p>Dit is een onafhankelijke tool en is niet gelieerd aan IKEA.</p>
          <p>FAQ content is gebaseerd op publiek beschikbare informatie van IKEA Nederland.</p>
        </footer>
      </div>
    </main>
  );
}

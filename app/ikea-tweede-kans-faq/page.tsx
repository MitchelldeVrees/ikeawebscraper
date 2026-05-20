import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "IKEA Tweede Kans FAQ | Korte Antwoorden",
  description:
    "Korte antwoorden op veelgestelde vragen over IKEA Tweede Kans. Voor uitgebreide uitleg verwijzen we naar de complete gids.",
  alternates: {
    canonical: "/ikea-tweede-kans-faq",
    languages: {
      "nl-NL": "/ikea-tweede-kans-faq",
      "x-default": "/ikea-tweede-kans-faq",
    },
  },
};

type FaqEntry = {
  question: string;
  answer: string;
  guideHref: string;
};

const GUIDE_PATH = "/alles-over-ikea-tweede-kans";

const faqEntries: FaqEntry[] = [
  {
    question: "Wat is IKEA Tweede Kans?",
    answer:
      "De Tweedekanshoek is IKEA's outlet voor showmodellen, retouren en producten met lichte schade tegen korting.",
    guideHref: `${GUIDE_PATH}#wat-is`,
  },
  {
    question: "Welke producten vind ik daar?",
    answer:
      "Meestal meubels, opbergers, stoelen, verlichting en accessoires. Het aanbod wisselt de hele dag.",
    guideHref: `${GUIDE_PATH}#producten`,
  },
  {
    question: "Hoe werkt online reserveren?",
    answer:
      "Je reserveert via IKEA Family, kiest een tijdslot en rekent af in de winkel bij ophalen.",
    guideHref: `${GUIDE_PATH}#hoe-werkt`,
  },
  {
    question: "In welke winkels is Tweede Kans beschikbaar?",
    answer:
      "In alle grote IKEA vestigingen in Nederland. Per winkel verschilt de voorraad.",
    guideHref: `${GUIDE_PATH}#vestigingen`,
  },
  {
    question: "Krijg ik garantie op Tweede Kans producten?",
    answer:
      "Ja, op functionaliteit. Schade die expliciet op de sticker staat valt daar niet onder.",
    guideHref: `${GUIDE_PATH}#garantie`,
  },
  {
    question: "Mag ik retouren doen?",
    answer:
      "Ja, Tweede Kans valt onder het reguliere retourbeleid van IKEA, met de normale voorwaarden.",
    guideHref: `${GUIDE_PATH}#garantie`,
  },
  {
    question: "Kan ik bezorging boeken?",
    answer:
      "Meestal niet voor Tweedekanshoek-aankopen; vaak moet je zelf ophalen en vervoeren.",
    guideHref: `${GUIDE_PATH}#faq`,
  },
  {
    question: "Hoe snel zijn alerts?",
    answer:
      "Ons systeem controleert regelmatig en stuurt een e-mail zodra een match beschikbaar komt.",
    guideHref: `${GUIDE_PATH}#alerts`,
  },
  {
    question: "Is deze tool officieel van IKEA?",
    answer:
      "Nee, dit is een onafhankelijke dienst op basis van publiek beschikbare data.",
    guideHref: `${GUIDE_PATH}#faq`,
  },
  {
    question: "Kan ik meerdere winkels tegelijk volgen?",
    answer:
      "Ja, je kunt meerdere artikelnummers en meerdere vestigingen tegelijk monitoren.",
    guideHref: `${GUIDE_PATH}#tips`,
  },
];

function linkTweedekanshoek(text: string) {
  return text.split(/(Tweedekanshoek)/gi).map((part, index) => {
    if (/^Tweedekanshoek$/i.test(part)) {
      return (
        <Link
          key={`${part}-${index}`}
          href={GUIDE_PATH}
          className="text-primary underline"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

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
            IKEA Tweede Kans FAQ
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Korte antwoorden op veelgestelde vragen
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mx-auto max-w-2xl">
            {linkTweedekanshoek(
              "Deze pagina is bewust kort en praktisch. Voor volledige uitleg ga je naar de uitgebreide gids."
            )}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            <Link href={GUIDE_PATH} className="text-primary underline">
              Lees de complete gids
            </Link>{" "}
            voor uitgebreide context, voorbeelden en store-overzichten.
          </p>
        </section>

        <section className="space-y-4">
          {faqEntries.map((entry) => (
            <article key={entry.question} className="rounded-2xl border border-border p-4">
              <h2 className="text-lg font-semibold mb-2">{entry.question}</h2>
              <p className="text-sm text-muted-foreground">
                {linkTweedekanshoek(entry.answer)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Meer details:{" "}
                <Link href={entry.guideHref} className="text-primary underline">
                  naar relevante sectie in de gids
                </Link>
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-border p-6 bg-gradient-to-br from-primary/10 to-transparent space-y-4">
          <h2 className="text-2xl font-semibold">Snel naar actie</h2>
          <p className="text-sm text-muted-foreground">
            Wil je niet handmatig blijven checken? Stel direct alerts in of lees eerst de complete gids.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/#watch-alerts">Stel Nu Alerts In</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={GUIDE_PATH}>Lees de complete gids</Link>
            </Button>
          </div>
        </section>

        <footer className="text-sm text-muted-foreground border-t border-border pt-4 space-y-2">
          <p>Dit is een onafhankelijke tool en is niet gelieerd aan IKEA.</p>
          <p>Voor uitgebreide inhoud en achtergrond: bekijk de gids.</p>
        </footer>
      </div>
    </main>
  );
}

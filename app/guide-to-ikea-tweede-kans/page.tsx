import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Alles over IKEA Tweede Kans | De Ultieme Gids voor de Tweedekanshoek",
  description:
    "Alles wat je moet weten over de IKEA Tweedekanshoek in Nederland: hoe het werkt, welke producten je vindt, tips om deals te scoren en hoe je alerts instelt.",
  alternates: {
    canonical: "https://ikeatweedekans.com/alles-over-ikea-tweede-kans",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "Alles over IKEA Tweede Kans - De Ultieme Gids voor de Tweedekanshoek in Nederland",
  description:
    "Complete gids over de IKEA Tweedekanshoek: hoe het werkt, welke producten je vindt, tips voor de beste deals, en hoe alerts je helpen geen koopje te missen.",
  author: {
    "@type": "Organization",
    name: "IKEA Tweede Kans Alerts",
    url: "https://ikeatweedekans.com",
  },
  publisher: {
    "@type": "Organization",
    name: "IKEA Tweede Kans Alerts",
  },
  mainEntityOfPage: "https://ikeatweedekans.com/alles-over-ikea-tweede-kans",
  inLanguage: "nl",
};

const storeRows = [
  ["IKEA Amsterdam", "Noord-Holland", "Ja"],
  ["IKEA Amersfoort", "Utrecht", "Ja"],
  ["IKEA Barendrecht (Rotterdam)", "Zuid-Holland", "Ja"],
  ["IKEA Breda", "Noord-Brabant", "Ja"],
  ["IKEA Delft", "Zuid-Holland", "Ja"],
  ["IKEA Duiven", "Gelderland", "Ja"],
  ["IKEA Eindhoven", "Noord-Brabant", "Ja"],
  ["IKEA Groningen", "Groningen", "Ja"],
  ["IKEA Haarlem", "Noord-Holland", "Ja"],
  ["IKEA Heerlen", "Limburg", "Ja"],
  ["IKEA Hengelo", "Overijssel", "Ja"],
  ["IKEA Utrecht", "Utrecht", "Ja"],
  ["IKEA Zwolle", "Overijssel", "Ja"],
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <article className="mx-auto max-w-4xl space-y-8">
          <header className="rounded-2xl bg-primary px-6 py-10 text-primary-foreground shadow-sm">
            <p className="mb-3 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              Ultieme gids 2026
            </p>
            <h1 className="text-4xl leading-tight md:text-5xl">
              Alles over IKEA Tweede Kans
            </h1>
            <p className="mt-4 max-w-3xl text-primary-foreground/90">
              De complete gids over de Tweedekanshoek: wat het is, hoe het
              werkt, waar je de beste deals vindt, en hoe je nooit meer een
              koopje mist.
            </p>
          </header>

          <nav className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-label="Inhoudsopgave">
            <h2 className="text-xl">Inhoudsopgave</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li><a className="text-primary underline" href="#wat-is">Wat is de IKEA Tweedekanshoek?</a></li>
              <li><a className="text-primary underline" href="#producten">Welke producten vind je er?</a></li>
              <li><a className="text-primary underline" href="#hoe-werkt">Hoe werkt het in de winkel en online</a></li>
              <li><a className="text-primary underline" href="#vestigingen">Alle vestigingen met Tweedekanshoek</a></li>
              <li><a className="text-primary underline" href="#garantie">Garantie en retourbeleid</a></li>
              <li><a className="text-primary underline" href="#terugkoop">De IKEA terugkoopservice</a></li>
              <li><a className="text-primary underline" href="#tips">8 tips om betere deals te scoren</a></li>
              <li><a className="text-primary underline" href="#alerts">Nooit meer een deal missen met alerts</a></li>
              <li><a className="text-primary underline" href="#faq">Veelgestelde vragen</a></li>
            </ol>
          </nav>

          <section id="wat-is" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-3xl">Wat is de IKEA Tweedekanshoek?</h2>
            <p className="mt-4 text-muted-foreground">
              De Tweedekanshoek (ook wel IKEA Tweede Kans of Tweede Kansje) is
              een vaste afdeling in IKEA winkels waar producten een tweede leven
              krijgen. Denk aan showmodellen, herverpakte artikelen, producten
              met lichte beschadiging of uitlopende modellen met stevige
              korting.
            </p>
            <p className="mt-3 text-muted-foreground">
              Voor jou betekent dat: functioneel goede IKEA producten voor vaak
              30% tot 70% minder dan de nieuwprijs. Voor IKEA betekent het:
              minder verspilling en meer hergebruik.
            </p>
            <div className="mt-4 rounded-xl border-l-4 border-primary bg-accent/50 px-4 py-3 text-sm text-muted-foreground">
              Elk product dat via de Tweedekanshoek wordt verkocht, voorkomt
              extra afval en verlengt de levensduur van meubels en accessoires.
            </div>
          </section>

          <section id="producten" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-3xl">Welke producten vind je in de Tweedekanshoek?</h2>
            <p className="mt-4 text-muted-foreground">
              Het aanbod wisselt continu. Dit zijn de meest voorkomende categorieen:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li><strong className="text-foreground">Showmodellen:</strong> meestal in goede staat met minimale gebruikssporen.</li>
              <li><strong className="text-foreground">Teruggebrachte producten:</strong> gecontroleerd en opnieuw aangeboden.</li>
              <li><strong className="text-foreground">Uitlopend assortiment:</strong> laatste stuks van modellen die verdwijnen.</li>
              <li><strong className="text-foreground">Licht beschadigde artikelen:</strong> kleine cosmetische schade, vaak grote korting.</li>
              <li><strong className="text-foreground">Herverpakte producten:</strong> verpakking beschadigd, product vaak ongebruikt.</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Veelvoorkomende voorbeelden: KALLAX, BILLY, MALM, bureaus, stoelen,
              verlichting, keukenaccessoires en textiel.
            </p>
          </section>

          <section id="hoe-werkt" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-3xl">Hoe werkt het in de winkel en online?</h2>
            <h3 className="mt-5 text-xl">In de winkel</h3>
            <p className="mt-2 text-muted-foreground">
              Je loopt naar de Tweedekanshoek, controleert de sticker en rekent
              direct af. Op de sticker staat de reden van korting en de staat
              van het product.
            </p>
            <h3 className="mt-5 text-xl">Online reserveren</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>Word gratis IKEA Family lid.</li>
              <li>Kies je vestiging op de IKEA website.</li>
              <li>Bekijk het Tweede Kans aanbod per vestiging.</li>
              <li>Reserveer en bevestig via je account.</li>
              <li>Kies ophaaltijdslot uit de e-mail.</li>
              <li>Betaal in de winkel (pin) bij ophalen.</li>
            </ol>
            <div className="mt-4 rounded-xl border-l-4 border-secondary bg-secondary/35 px-4 py-3 text-sm text-muted-foreground">
              Niet elk product staat online. De fysieke hoek in de winkel heeft
              vaak extra aanbod dat je online niet ziet.
            </div>
          </section>

          <section id="vestigingen" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-3xl">Alle IKEA vestigingen met Tweedekanshoek</h2>
            <p className="mt-3 text-muted-foreground">
              Alle volledige IKEA winkels in Nederland hebben een Tweedekanshoek.
              Overzicht:
            </p>
            <div className="mt-4 overflow-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3">Vestiging</th>
                    <th className="px-4 py-3">Provincie</th>
                    <th className="px-4 py-3">Online Tweede Kans</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {storeRows.map((row) => (
                    <tr key={row[0]}>
                      <td className="px-4 py-3 font-medium">{row[0]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row[1]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              IKEA Leeuwarden is een Plan &amp; Order Point en heeft geen fysieke Tweedekanshoek.
            </p>
          </section>

          <section id="garantie" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-3xl">Garantie en retourbeleid</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
              <li><strong className="text-foreground">2 jaar garantie op functionaliteit</strong> van het product.</li>
              <li><strong className="text-foreground">Geen garantie op bekende schade</strong> die op de sticker staat.</li>
              <li><strong className="text-foreground">365 dagen retourbeleid</strong>, ook voor Tweede Kans aankopen.</li>
              <li><strong className="text-foreground">Matrassen:</strong> geen 90-dagen omruilgarantie.</li>
            </ul>
            <div className="mt-4 rounded-xl border-l-4 border-primary bg-accent/50 px-4 py-3 text-sm text-muted-foreground">
              Controleer het product altijd goed bij ophalen. Je bent bij online
              reservering niet verplicht om af te nemen als het tegenvalt.
            </div>
          </section>

          <section id="terugkoop" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-3xl">De IKEA terugkoopservice</h2>
            <p className="mt-3 text-muted-foreground">
              Een groot deel van het aanbod ontstaat via de IKEA terugkoopservice:
              klanten leveren meubels in, IKEA controleert ze, en verkoopt ze
              opnieuw via de Tweedekanshoek.
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>Vul je meubelgegevens online in.</li>
              <li>Ontvang een indicatie van het tegoed.</li>
              <li>Breng je product binnen de termijn naar de winkel.</li>
              <li>Na controle ontvang je winkeltegoed.</li>
            </ol>
            <p className="mt-3 text-muted-foreground">
              Nieuwe acties, zoals tijdelijke ophaalservices, maken dit proces
              nog toegankelijker voor grotere meubels.
            </p>
          </section>

          <section id="tips" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-3xl">8 tips om de beste deals te scoren</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>Stel alerts in per artikelnummer.</li>
              <li>Volg meerdere vestigingen tegelijk.</li>
              <li>Ga op rustige momenten, vaak doordeweeks in de ochtend.</li>
              <li>Word IKEA Family lid voor online toegang.</li>
              <li>Zoek gericht op product en maat voordat je gaat.</li>
              <li>Lees altijd de productsticker volledig.</li>
              <li>Controleer afmetingen vooraf.</li>
              <li>Combineer koopjes met terugkooptegoed.</li>
            </ol>
          </section>

          <section id="alerts" className="rounded-2xl bg-primary px-6 py-8 text-primary-foreground shadow-sm">
            <h2 className="text-3xl text-primary-foreground">Nooit meer een deal missen?</h2>
            <p className="mt-3 max-w-3xl text-primary-foreground/90">
              Het aanbod verandert snel. Met IKEA Tweede Kans Alerts stel je per
              artikel en vestiging je voorkeuren in en krijg je direct een mail
              bij een match.
            </p>
            <div className="mt-5">
              <Button asChild variant="secondary" size="lg">
                <Link href="/#watch-alerts">Stel nu gratis je alerts in</Link>
              </Button>
            </div>
          </section>

          <section id="faq" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-3xl">Veelgestelde vragen over IKEA Tweede Kans</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-xl">Kan ik Tweede Kans producten laten bezorgen?</h3>
                <p className="mt-1 text-muted-foreground">Nee, meestal niet. Je haalt ze zelf op. Voor grote items kun je een bus of aanhanger regelen.</p>
              </div>
              <div>
                <h3 className="text-xl">Heb ik IKEA Family nodig?</h3>
                <p className="mt-1 text-muted-foreground">Voor winkelkoopjes niet, voor online reserveren wel.</p>
              </div>
              <div>
                <h3 className="text-xl">Hoe groot zijn de kortingen?</h3>
                <p className="mt-1 text-muted-foreground">Vaak 30% tot 70%, afhankelijk van product en staat.</p>
              </div>
              <div>
                <h3 className="text-xl">Is het aanbod in elke winkel hetzelfde?</h3>
                <p className="mt-1 text-muted-foreground">Nee, elke vestiging heeft een eigen voorraad en eigen rotatie.</p>
              </div>
              <div>
                <h3 className="text-xl">Hoe vaak ververst het aanbod?</h3>
                <p className="mt-1 text-muted-foreground">Dagelijks, soms meerdere keren per dag. Daarom werken alerts het best.</p>
              </div>
            </div>
          </section>

          <footer className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
            <p><strong className="text-foreground">Over deze gids:</strong> bijgewerkt in maart 2026.</p>
            <p className="mt-2">
              IKEA Tweede Kans Alerts is een onafhankelijke tool en niet gelieerd
              aan IKEA of Ingka Group.
            </p>
            <p className="mt-4">
              <Link href="/" className="text-primary underline">
                Terug naar ikeatweedekans.com
              </Link>
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}

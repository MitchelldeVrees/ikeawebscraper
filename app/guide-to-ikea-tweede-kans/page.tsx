import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { fetchIkeaDeals } from "@/lib/ikea-api";
import { IKEA_STORES } from "@/lib/ikea-stores";

export const metadata = {
  title: "Ultieme Guide voor IKEA Tweede Kans Deals in Nederland | Alerts & Tips",
  description:
    "Ontdek hoe je de beste IKEA Tweede Kans kortingen vindt in Nederland. Ontvang alerts, tips en bespaar op meubels en accessoires met onze eenvoudige Guide voor tweedehands IKEA producten.",
};

type BestDealRow = {
  id: string;
  offerId?: number;
  item: string;
  store: string;
  originalPrice: number;
  priceNow: number;
  savings: number;
  url?: string;
};

const storesToScan = Object.entries(IKEA_STORES).slice(0, 6);

async function getBestDeals(): Promise<BestDealRow[]> {
  const candidates: BestDealRow[] = [];

  await Promise.all(
    storesToScan.map(async ([storeId, store]) => {
      try {
        const products = await fetchIkeaDeals(storeId);

        for (const product of products) {
          const priceNow =
            product.price ??
            product.minPrice ??
            product.maxPrice ??
            undefined;
          const originalPrice =
            product.originalPrice ??
            product.maxPrice ??
            product.minPrice ??
            priceNow;

          if (
            typeof priceNow !== "number" ||
            typeof originalPrice !== "number"
          ) {
            continue;
          }

          const savings = originalPrice - priceNow;
          if (savings <= 1) {
            continue;
          }

          const offerId = product.offerId ?? product.offers?.[0]?.id;
          const resolvedUrl =
            product.pipUrl?.startsWith("http") ?? false
              ? product.pipUrl
              : product.pipUrl
              ? `https://www.ikea.com${product.pipUrl}`
              : undefined;

          candidates.push({
            id: `${storeId}-${product.id}-${offerId ?? "nooffer"}`,
            offerId,
            item: product.name ?? `Artikel ${product.id}`,
            store: store.name,
            originalPrice,
            priceNow,
            savings,
            url:
              resolvedUrl ??
              getStoreCircularUrl(store.name, offerId ?? product.id),
          });
        }
      } catch (error) {
        console.error(
          `Guide: kon aanbiedingen voor ${store.name} niet ophalen:`,
          error
        );
      }
    })
  );

  return candidates
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 5);
}

function getStoreCircularUrl(storeName: string, productId: string) {
  const slug = storeName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `https://www.ikea.com/nl/nl/circular/second-hand/#/${slug}/${productId}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

export default async function GuidePage() {
  const bestDeals = await getBestDeals();

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-8 space-y-10">
        <SiteHeader />
        <section className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-2">
            IKEA Tweede Kans Guide Nederland
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Ultieme Guide voor IKEA Tweede Kans Deals in Nederland
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mx-auto max-w-2xl">
            Leer alles over IKEA Tweede Kans, de afdeling voor tweedehands en kortingproducten in Nederlandse IKEA winkels. Ontdek hoe je alerts instelt, deals vergelijkt en maximaal bespaart op duurzame meubels en accessoires.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Wat is IKEA Tweede Kans?</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            IKEA Tweede Kans, ook bekend als de Tweedekanshoek of Second Chance Corner, is een speciale afdeling in alle IKEA winkels in Nederland waar producten een tweede leven krijgen. Dit omvat showmodellen, herverpakte artikelen, uitlopende producten en licht beschadigde items. Volgens IKEA Nederland ondersteunt dit initiatief duurzaamheid door afval te verminderen en producten langer te laten meegaan. Producten worden verkocht tegen gereduceerde prijzen, vaak met duidelijke labels die de reden voor de korting aangeven, zoals &apos;lichte schade&apos; of &apos;ex-display&apos;.
          </p>
          <p className="text-sm md:text-base text-muted-foreground">
            In Nederland vind je IKEA Tweede Kans producten in categorieën zoals meubels, accessoires, keukenartikelen en verlichting. Voorbeelden zijn boekenkasten, bedden en stoelen die anders zouden worden weggegooid. Online is de Tweede Kans hoek beschikbaar voor IKEA Family leden, waar je deals kunt bekijken en reserveren via de IKEA website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Hoe Werkt IKEA Tweede Kans in Nederland?</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            In de Tweede Kans afdeling van IKEA Nederland worden producten direct in de winkel aangeboden en kunnen onmiddellijk worden meegenomen. Sommige items zijn al gemonteerd, en je kunt gereedschap lenen om ze te demonteren met hulp van het personeel. Prijzen variëren per winkel en productconditie, maar besparingen kunnen oplopen tot 50% of meer vergeleken met nieuwe prijzen.
          </p>
          <p className="text-sm md:text-base text-muted-foreground">
            Belangrijke regels: Er is geen transportreservering mogelijk voor Tweede Kans items. De standaard 2-jarige garantie geldt alleen voor functionaliteit, en hangt af van de reden voor doorverkoop. Matrassen uit de Tweede Kans hebben geen 90-dagen omruilgarantie. Voor online aankopen moet je lid zijn van IKEA Family om toegang te krijgen tot exclusieve deals.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Voordelen van IKEA Tweede Kans Deals</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Door te shoppen in de IKEA Tweede Kans bespaar je niet alleen geld, maar draag je ook bij aan duurzaamheid. IKEA Nederland benadrukt dat dit helpt om miljoenen meubels per jaar uit de afvalstroom te houden. Daarnaast kun je gratis reserveonderdelen bestellen om producten te repareren, wat de levensduur verlengt. Voor shoppers in Nederland betekent dit betaalbare, kwalitatieve items met een kleinere ecologische voetafdruk.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">IKEA Tweede Kans Winkels in Nederland</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            De Tweede Kans hoek is beschikbaar in alle IKEA winkels in Nederland. Populaire locaties zijn onder andere IKEA Amsterdam, IKEA Delft, IKEA Eindhoven, IKEA Groningen, IKEA Haarlem, IKEA Heerlen, IKEA Hengelo, IKEA Utrecht en IKEA Zwolle. Controleer de openingstijden op de IKEA website voor je bezoek.
          </p>
        </section>

       

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Voorbeeld Deals Vergelijking</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Hieronder een voorbeeld van typische IKEA Tweede Kans deals in Nederland. Prijzen kunnen variëren, maar dit geeft een idee van mogelijke besparingen op populaire producten.
          </p>
          <div className="overflow-auto rounded-2xl border border-border">
            <table className="min-w-full text-left">
              <thead className="bg-gradient-to-r from-primary/10 to-transparent text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Nieuwe Prijs</th>
                  <th className="px-3 py-2">Tweede Kans Prijs</th>
                  <th className="px-3 py-2">Besparing</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {bestDeals.length > 0 ? (
                  bestDeals.map((row) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="px-3 py-2">
                        <div className="font-semibold">
                          {row.url ? (
                            <a
                              href={row.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {row.item}
                            </a>
                          ) : (
                            row.item
                          )}
                        </div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {row.store}
                        </p>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatCurrency(row.originalPrice)}
                      </td>
                      <td className="px-3 py-2 font-semibold">{formatCurrency(row.priceNow)}</td>
                      <td className="px-3 py-2 text-emerald-600">
                        {formatCurrency(row.savings)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-border">
                    <td className="px-3 py-8 text-center text-xs text-muted-foreground" colSpan={4}>
                      Geen actuele Tweede Kans deals gevonden. Probeer het later opnieuw.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Tips voor IKEA Tweede Kans in Nederland</h2>
          <ul className="space-y-3 text-sm text-muted-foreground list-disc list-inside">
            <li>Stel alerts in voor meerdere varianten van hetzelfde artikelnummer om restocks sneller te vangen in Nederlandse winkels.</li>
            <li>Controleer reistijd en brandstofkosten voordat je naar de winkel gaat, vooral als je ver van een IKEA woont.</li>
            <li>Inspecteer verpakking of labels om te verifiëren dat het een echte Tweede Kans deal is en controleer op schade.</li>
            <li>Word IKEA Family lid voor toegang tot online Tweede Kans deals en extra kortingen.</li>
            <li>Bezoek winkels vroeg in de ochtend voor de beste selectie, aangezien voorraden snel veranderen.</li>
            <li>Overweeg huren van een busje via IKEA&apos;s partner Hertz voor grote aankopen.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-border p-6 bg-gradient-to-br from-primary/10 to-transparent space-y-4">
          <h2 className="text-2xl font-semibold">Klaar om te Besparen met IKEA Tweede Kans?</h2>
          <p className="text-sm text-muted-foreground">
            Gebruik ons alert tool om IKEA Tweede Kans artikelen in Nederland te tracken. Je krijgt direct notificaties zodra ze beschikbaar zijn, zodat je voor de drukte toeslaat.
          </p>
          <ButtonLink />
        </section>

        <footer className="text-sm text-muted-foreground border-t border-border pt-4">
          <p>Dit is een onafhankelijke tool en is niet gelieerd aan IKEA.</p>
          <p>Beeldreferenties via gratis stock services. Alle informatie gebaseerd op openbare IKEA Nederland bronnen.</p>
        </footer>
      </div>
    </main>
  );
}

function ButtonLink() {
  return (
    <Button asChild size="lg">
      <Link href="/#watch-alerts">Stel Nu Alerts In</Link>
    </Button>
  );
}

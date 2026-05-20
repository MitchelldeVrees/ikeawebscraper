import Link from "next/link";
import { Clock3, ExternalLink, MapPin, Package, Percent } from "lucide-react";

import { fetchIkeaDeals } from "@/lib/ikea-api";
import { IKEA_STORES } from "@/lib/ikea-stores";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

type StoreLocationPageProps = {
  storeId: string;
  city: string;
  ikeaSlug: string;
  tips: string[];
};

type StoreDeal = {
  id: string;
  name: string;
  priceNow: number;
  originalPrice: number;
  savings: number;
  discountPercent: number;
  productUrl: string;
};

function formatCurrency(value: number) {
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function getStoreCircularUrl(ikeaSlug: string, offerNumberOrProductId: string) {
  return `https://www.ikea.com/nl/nl/campaigns/tweedekanshoek-online-pubebfe3f30/#/${ikeaSlug}/${offerNumberOrProductId}`;
}

function toDeals(products: Awaited<ReturnType<typeof fetchIkeaDeals>>, ikeaSlug: string): StoreDeal[] {
  return products
    .map((product) => {
      const originalPrice =
        typeof product.originalPrice === "number"
          ? product.originalPrice
          : product.price;
      const savings = originalPrice - product.price;

      if (product.price <= 0 || originalPrice <= 0 || savings <= 1) {
        return null;
      }

      return {
        id: `${product.storeId}-${product.id}-${product.offerNumber ?? "offer"}`,
        name: product.name,
        priceNow: product.price,
        originalPrice,
        savings,
        discountPercent: Math.max(
          1,
          Math.round((savings / originalPrice) * 100)
        ),
        productUrl: getStoreCircularUrl(
          ikeaSlug,
          product.offerNumber ?? product.id
        ),
      } satisfies StoreDeal;
    })
    .filter((deal): deal is StoreDeal => deal !== null)
    .sort((a, b) => b.savings - a.savings);
}

export async function StoreLocationPage({
  storeId,
  city,
  ikeaSlug,
  tips,
}: StoreLocationPageProps) {
  const store = IKEA_STORES[storeId];
  const products = await fetchIkeaDeals(storeId);
  const deals = toDeals(products, ikeaSlug);
  const topDeals = deals.slice(0, 10);
  const averageDiscount = topDeals.length
    ? Math.round(
        topDeals.reduce((sum, deal) => sum + deal.discountPercent, 0) /
          topDeals.length
      )
    : 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <SiteHeader />

        <section className="mb-8 rounded-2xl bg-card p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            IKEA Tweede Kans {city}
          </p>
          <h1 className="mt-2 text-4xl leading-tight md:text-5xl">
            IKEA Tweede Kans {city}: actuele aanbiedingen, tips en winkelinformatie
          </h1>
          <p className="mt-3 max-w-4xl text-muted-foreground">
            Deze pagina toont actuele Tweede Kans data uit de IKEA API voor{" "}
            {city}. Je ziet direct welke aanbiedingen nu beschikbaar zijn, inclusief
            prijs, korting en besparing.
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Winkel</p>
            <p className="mt-1 text-base font-semibold">{store.name}</p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Actieve aanbiedingen</p>
            <p className="mt-1 text-base font-semibold">{deals.length}</p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Gem. korting (top 10)</p>
            <p className="mt-1 text-base font-semibold">
              {topDeals.length > 0 ? `${averageDiscount}%` : "N/A"}
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Filiaal-nummer</p>
            <p className="mt-1 text-base font-semibold">{storeId}</p>
          </article>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-2xl">Winkelinformatie</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <span>{store.address}</span>
              </p>
              <p>
                Coördinaten: {store.lat}, {store.lng}
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-2xl">Openingstijden</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Openingstijden kunnen wijzigen rond feestdagen en acties. Check de
              officiele IKEA winkelpagina voor de meest recente tijden.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <a
                  href={`https://www.ikea.com/nl/nl/stores/${ikeaSlug}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Clock3 className="h-4 w-4" />
                  Bekijk openingstijden
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/#watch-alerts">Maak alert voor {city}</Link>
              </Button>
            </div>
          </article>
        </section>

        <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-2xl">Winkelspecifieke tips voor {city}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl">Recente live aanbiedingen in {city}</h2>
            <p className="text-xs text-muted-foreground">Bron: IKEA Circular API</p>
          </div>

          {topDeals.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
              Momenteel zijn er geen deals met prijsverschil beschikbaar voor{" "}
              {city}. Probeer later opnieuw.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {topDeals.map((deal) => (
                <article
                  key={deal.id}
                  className="rounded-xl bg-muted/60 p-4"
                >
                  <h3 className="text-base font-semibold">{deal.name}</h3>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p className="inline-flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      Nu: <span className="font-semibold text-foreground">{formatCurrency(deal.priceNow)}</span>
                    </p>
                    <p>
                      Origineel: {formatCurrency(deal.originalPrice)}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <Percent className="h-4 w-4 text-primary" />
                      Besparing {formatCurrency(deal.savings)} ({deal.discountPercent}%)
                    </p>
                  </div>
                  <a
                    href={deal.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary underline"
                  >
                    Bekijk bij IKEA
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

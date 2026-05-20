import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Leaf, Store, Timer } from "lucide-react";

import { AuthCodeRedirect } from "@/components/auth-code-redirect";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { fetchIkeaDeals } from "@/lib/ikea-api";
import { IKEA_STORES } from "@/lib/ikea-stores";

const WatchForm = dynamic(
  () => import("@/components/watch-form").then((mod) => mod.WatchForm),
  {
    loading: () => (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Laden...</p>
      </div>
    ),
  }
);

const HomeDynamic = dynamic(
  () => import("@/components/home-dynamic").then((mod) => mod.HomeDynamic)
);

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: {
      "nl-NL": "/",
      "x-default": "/",
    },
  },
};

export const revalidate = 300;

type HomepageDeal = {
  id: string;
  name: string;
  store: string;
  priceNow: number;
  savings: number;
  discountPercent: number;
};

function formatCurrency(value: number) {
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

async function getHomepageDeals(): Promise<HomepageDeal[]> {
  const storeIds = ["088", "270", "087", "151"];

  const byStore = await Promise.all(
    storeIds.map(async (storeId) => {
      try {
        const products = await fetchIkeaDeals(storeId);
        const storeName = IKEA_STORES[storeId]?.name ?? storeId;

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
              id: `${storeId}-${product.id}-${product.offerNumber ?? "offer"}`,
              name: product.name,
              store: storeName,
              priceNow: product.price,
              savings,
              discountPercent: Math.max(
                1,
                Math.round((savings / originalPrice) * 100)
              ),
            } satisfies HomepageDeal;
          })
          .filter((deal): deal is HomepageDeal => deal !== null);
      } catch (error) {
        console.error(`[home] Failed to fetch deals for ${storeId}`, error);
        return [];
      }
    })
  );

  return byStore
    .flat()
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 4);
}

const faq = [
  {
    q: "Hoe snel krijg ik notificaties?",
    a: "We checken voorraad elke paar minuten en sturen direct een e-mail zodra jouw match verschijnt.",
  },
  {
    q: "Is deze tool verbonden met IKEA?",
    a: "Nee. De dienst is onafhankelijk en gebruikt alleen publieke voorraadinformatie.",
  },
  {
    q: "Kan ik meerdere winkels en artikelen volgen?",
    a: "Ja, je kunt meerdere artikelnummers en meerdere Nederlandse vestigingen tegelijk volgen.",
  },
  {
    q: "Zijn mijn gegevens veilig?",
    a: "Ja. Je e-mail wordt alleen gebruikt voor alerts en accountfunctionaliteit.",
  },
];

export default async function Home() {
  const deals = await getHomepageDeals();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Suspense fallback={null}>
        <AuthCodeRedirect />
      </Suspense>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-4 md:pt-6">
        <SiteHeader />

        <section className="mb-10 rounded-2xl bg-card p-5 shadow-sm">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              Goedkoper wonen + minder verspilling
            </div>
            <h1 className="text-4xl leading-tight md:text-5xl">
              Vind jouw IKEA favorieten in tweede kans voordat anderen ze zien
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Voor mensen die bewust willen kopen: bespaar op meubels en geef producten een tweede leven met automatische alerts.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="#watch-alerts">Start duurzame alert</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/alles-over-ikea-tweede-kans">Bekijk dealgids</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-5 border-t border-border pt-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" />
                Tot 50% goedkoper
              </span>
              <span className="inline-flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                Alle NL winkels
              </span>
              <span className="inline-flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                Elke paar minuten update
              </span>
            </div>
          </div>
        </section>

        <section id="watch-alerts" className="mb-10">
          <WatchForm />
        </section>

        <section className="mb-10">
          <HomeDynamic />
        </section>

        <section id="hoe-het-werkt" className="mb-10 rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-3xl">Zo werkt slim tweede kans kopen</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl bg-muted/60 p-4">
              <h3 className="text-lg">1. Artikelnummer invoeren</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Gebruik het 8-cijferige IKEA nummer om exact de juiste producten te volgen.
              </p>
            </article>
            <article className="rounded-xl bg-muted/60 p-4">
              <h3 className="text-lg">2. Winkels kiezen</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Volg meerdere vestigingen tegelijk, van Utrecht tot Groningen.
              </p>
            </article>
            <article className="rounded-xl bg-muted/60 p-4">
              <h3 className="text-lg">3. Direct alert</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ontvang direct een e-mail zodra voorraad beschikbaar wordt.
              </p>
            </article>
          </div>
        </section>

        <section className="mb-10 rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-3xl">Gebouwd voor jouw situatie</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
              Budget huishoudens: maximaal besparen op inrichting en vervanging.
            </article>
            <article className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
              Specifieke zoekers: exact artikelnummer, exacte winkel, exacte timing.
            </article>
            <article className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
              Kleinzakelijk: monitor meerdere producten met CSV import.
            </article>
          </div>
        </section>

        <section className="mb-10 rounded-2xl bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-3xl">Recent gealerteerde deals</h2>
            <Link href="/alles-over-ikea-tweede-kans" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Naar dealgids <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            Live gegevens uit de IKEA Tweede Kans API.
          </p>

          {deals.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
              Op dit moment zijn er geen live deals beschikbaar uit de IKEA API.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-4">
              {deals.map((deal) => (
                <article key={deal.id} className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs text-muted-foreground">Live bij IKEA {deal.store}</p>
                  <h3 className="mt-1 text-base">{deal.name}</h3>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-xl font-bold text-foreground">
                      {formatCurrency(deal.priceNow)}
                    </span>
                    <span className="rounded-full bg-accent px-2 py-1 text-xs font-semibold text-primary">
                      -{deal.discountPercent}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Besparing {formatCurrency(deal.savings)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="faq" className="mb-10 rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-3xl">Veelgestelde vragen</h2>
          <div className="mt-4 space-y-2">
            {faq.map((item) => (
              <details key={item.q} className="rounded-xl border border-border bg-background px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold">{item.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-10 rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
          <h2 className="text-3xl text-primary-foreground">Maak je huis voordeliger en circulairer</h2>
          <p className="mt-3 max-w-3xl text-sm text-primary-foreground/90 md:text-base">
            Start vandaag met alerts voor jouw IKEA producten. Onafhankelijk, snel en gemaakt voor Nederlandse winkels.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="#watch-alerts">Start mijn tweede kans alert</Link>
            </Button>
            <Button asChild variant="outline" className="border-primary-foreground/60 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/contact">Stel een vraag</Link>
            </Button>
          </div>
        </section>

        <footer className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <p className="text-base font-semibold">Tweede Kans Slim &amp; Circulair</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Onafhankelijk van IKEA. Publieke data. Gericht op slim en duurzaam kopen.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Navigatie</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/#hoe-het-werkt">Hoe het werkt</Link></li>
                <li><Link href="/ikea-tweede-kans-faq">FAQ</Link></li>
                <li><Link href="/alles-over-ikea-tweede-kans">Gids</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contact & Legal</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/disclaimer">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

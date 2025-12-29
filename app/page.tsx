import { WatchForm } from "@/components/watch-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <section className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Realtime waarschuwingen
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Mis nooit meer een IKEA Tweede Kans deal
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Ontvang direct e-mailalerts wanneer jouw favoriete IKEA producten op
            Tweede kans verschijnen. Volg meerdere winkels en speel snel in op
            de beste deals.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/contact">Contact opnemen</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/guide-to-ikea-tweede-kans">Lees de guide</Link>
            </Button>
          </div>
        </section>

        <section id="watch-alerts" className="max-w-4xl mx-auto mb-8">
          <WatchForm />
        </section>

        <section className="mt-12 space-y-6">
          <h3 className="text-lg font-semibold">Extra hulpbronnen</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <article className="rounded-xl border border-border p-4 space-y-2">
              <h4 className="text-base font-semibold">Guide voor Tweede Kans deals</h4>
              <p className="text-sm text-muted-foreground">
                Lees stap voor stap hoe je de beste Tweede kans kortingen vindt.
              </p>
              <Button asChild size="sm" variant="ghost">
                <Link href="/guide-to-ikea-tweede-kans">Bekijk de Guide</Link>
              </Button>
            </article>
            <article className="rounded-xl border border-border p-4 space-y-2">
              <h4 className="text-base font-semibold">IKEA Tweede Kans FAQ</h4>
              <p className="text-sm text-muted-foreground">
                Antwoorden op veelgestelde vragen over de Tweedekansje alerts.
              </p>
              <Button asChild size="sm" variant="ghost">
                <Link href="/ikea-tweede-kans-faq">Lees de FAQ</Link>
              </Button>
            </article>
            <article className="rounded-xl border border-border p-4 space-y-2">
              <h4 className="text-base font-semibold">Contact en ondersteuning</h4>
              <p className="text-sm text-muted-foreground">
                Heb je feedback, een idee of een probleem met je account? Laat het
                ons weten via het contactformulier.
              </p>
              <Button asChild size="sm" variant="ghost">
                <Link href="/contact">Naar contact</Link>
              </Button>
            </article>
          </div>
        </section>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Dit is een onafhankelijk hulpmiddel en is niet verbonden aan IKEA.
            De gegevens komen uit de publieke Tweedekansje API van IKEA.
          </p>
          <div className="mt-3">
            <Link
              href="/contact"
              className="text-primary underline-offset-4 hover:underline"
            >
              Contact opnemen
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

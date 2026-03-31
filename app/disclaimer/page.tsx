import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Disclaimer | IKEA Tweede Kans Alerts",
  description: "Disclaimer voor het gebruik van IKEA Tweede Kans Alerts.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <section className="mx-auto max-w-3xl space-y-8">
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Juridisch
            </p>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Disclaimer
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Laatst bijgewerkt: maart 2025
            </p>
          </div>

          <div className="space-y-6 rounded-2xl border border-border/70 bg-muted/40 p-6 shadow-sm">
            <div>
              <h2 className="mb-2 text-lg font-semibold">Onafhankelijke tool</h2>
              <p className="text-sm text-muted-foreground">
                IKEA Tweede Kans Alerts is een onafhankelijke dienst en is op geen enkele wijze gelieerd aan,
                gesponsord door of goedgekeurd door IKEA. Alle productnamen, logo's en merken zijn eigendom
                van hun respectievelijke eigenaren.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Nauwkeurigheid van informatie</h2>
              <p className="text-sm text-muted-foreground">
                De beschikbaarheid, prijzen en productinformatie in onze alerts zijn gebaseerd op
                publiek beschikbare data van IKEA. We streven naar actuele informatie, maar kunnen de
                juistheid hiervan niet garanderen. Prijzen en beschikbaarheid kunnen zonder voorafgaande
                kennisgeving wijzigen.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Geen aansprakelijkheid</h2>
              <p className="text-sm text-muted-foreground">
                Wij zijn niet aansprakelijk voor schade of verlies voortvloeiend uit het gebruik van
                deze dienst, inclusief maar niet beperkt tot gemiste deals, onjuiste prijsinformatie of
                technische storingen. Gebruik van deze website is geheel op eigen verantwoordelijkheid.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Beschikbaarheid van de dienst</h2>
              <p className="text-sm text-muted-foreground">
                We streven naar een zo hoog mogelijke uptime, maar kunnen de ononderbroken beschikbaarheid
                van de dienst niet garanderen. Onderhoud, technische storingen of wijzigingen van externe
                databronnen kunnen de werking tijdelijk beïnvloeden.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Vragen over deze disclaimer?{" "}
            <Link href="/contact" className="text-primary underline hover:opacity-80">
              Neem contact op
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

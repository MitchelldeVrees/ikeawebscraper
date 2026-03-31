import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Privacybeleid | IKEA Tweede Kans Alerts",
  description: "Lees hoe IKEA Tweede Kans Alerts omgaat met jouw persoonsgegevens.",
};

export default function PrivacyPage() {
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
              Privacybeleid
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Laatst bijgewerkt: maart 2025
            </p>
          </div>

          <div className="space-y-6 rounded-2xl border border-border/70 bg-muted/40 p-6 shadow-sm">
            <div>
              <h2 className="mb-2 text-lg font-semibold">Welke gegevens verzamelen we?</h2>
              <p className="text-sm text-muted-foreground">
                We verzamelen uitsluitend gegevens die nodig zijn om de dienst te leveren:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• <strong className="text-foreground">E-mailadres</strong> — om je in te laten loggen en alerts te versturen.</li>
                <li>• <strong className="text-foreground">Alert-instellingen</strong> — artikelnummers, winkels en prijsdrempels die je instelt.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Hoe gebruiken we jouw gegevens?</h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Je e-mailadres wordt gebruikt om e-mailalerts te versturen wanneer een gewenst artikel beschikbaar is.</li>
                <li>• We versturen geen reclame, nieuwsbrieven of berichten van derden.</li>
                <li>• Jouw gegevens worden nooit verkocht of gedeeld met externe partijen.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Hoe lang bewaren we jouw gegevens?</h2>
              <p className="text-sm text-muted-foreground">
                Jouw account en bijbehorende gegevens blijven bewaard zolang je een actief account hebt.
                Je kunt je account en alle bijbehorende gegevens op elk moment verwijderen via je accountpagina.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Jouw rechten (AVG)</h2>
              <p className="text-sm text-muted-foreground">
                Op grond van de Algemene Verordening Gegevensbescherming (AVG) heb je het recht op inzage,
                correctie en verwijdering van jouw persoonsgegevens.
                Stuur een verzoek via de{" "}
                <Link href="/contact" className="text-primary underline hover:opacity-80">
                  contactpagina
                </Link>{" "}
                en we verwerken dit zo snel mogelijk.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Cookies en tracking</h2>
              <p className="text-sm text-muted-foreground">
                We gebruiken uitsluitend functionele cookies die nodig zijn voor de werking van de sessie en authenticatie.
                Er worden geen tracking- of advertentiecookies geplaatst.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Vragen over dit privacybeleid?{" "}
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

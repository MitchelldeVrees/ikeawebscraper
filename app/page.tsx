import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BellRing, Euro, Store, Timer } from "lucide-react";

import { AuthCodeRedirect } from "@/components/auth-code-redirect";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const WatchForm = dynamic(
  () => import("@/components/watch-form").then((mod) => mod.WatchForm),
  {
    loading: () => (
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-400">Laden...</p>
      </div>
    ),
  }
);

const HomeDynamic = dynamic(
  () => import("@/components/home-dynamic").then((mod) => mod.HomeDynamic)
);

export default function Home() {
  const deals = [
    { name: "BILLY boekenkast", status: "Zojuist", price: "€49", save: "-41%" },
    { name: "KALLAX vakkenkast", status: "4 min geleden", price: "€39", save: "-46%" },
    { name: "POANG fauteuil", status: "8 min geleden", price: "€59", save: "-37%" },
    { name: "IDASEN bureau", status: "12 min geleden", price: "€199", save: "-44%" },
    { name: "MALM ladekast", status: "17 min geleden", price: "€79", save: "-35%" },
  ];

  return (
    <main className="min-h-screen bg-[#f9fafb] text-foreground">
      <Suspense fallback={null}>
        <AuthCodeRedirect />
      </Suspense>

      <div className="container mx-auto px-4 pb-16 pt-4 md:pt-6">
        <SiteHeader />

        {/* Hero */}
        <section className="mb-14 grid gap-10 lg:grid-cols-[1fr,420px] lg:items-start lg:gap-16">
          <div className="pt-2 lg:pt-10">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Realtime IKEA Tweede Kans alerts
            </p>
            <h1 className="mb-6 max-w-lg text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-[3.5rem]">
              Mis nooit meer een IKEA Tweede Kans deal
            </h1>
            <p className="mb-8 max-w-md text-lg text-slate-500">
              Ontvang direct een e-mail zodra jouw product in de Tweede Kanshoek verschijnt — in alle Nederlandse winkels.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-auto rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-emerald-600"
              >
                <Link href="#watch-alerts">Start gratis alert</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-auto rounded-xl border-slate-200 bg-white px-7 py-4 text-base text-slate-700 hover:bg-slate-50"
              >
                <Link href="#hoe-het-werkt">Hoe het werkt</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 border-t border-slate-200 pt-8 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-emerald-500" />
                Tot 50% goedkoper
              </span>
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4 text-emerald-500" />
                Alle NL winkels
              </span>
              <span className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-emerald-500" />
                5–10 min voor iedereen
              </span>
            </div>
          </div>

          <div id="watch-alerts" className="lg:pt-4">
            <WatchForm />
          </div>
        </section>

        {/* Stats */}
        <div className="mb-14">
          <HomeDynamic />
        </div>

        {/* How it works */}
        <section id="hoe-het-werkt" className="mb-14">
          <h2 className="mb-8 text-2xl font-bold text-slate-900">Hoe het werkt</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                1
              </span>
              <h3 className="mb-2 font-semibold text-slate-900">Kies je artikel</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Voer het 8-cijferige IKEA-artikelnummer in en kies je minimale voorraad.
              </p>
            </article>
            <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                2
              </span>
              <h3 className="mb-2 font-semibold text-slate-900">Selecteer winkels</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Volg meerdere vestigingen tegelijk — zonder handmatig te refreshen.
              </p>
            </article>
            <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                3
              </span>
              <h3 className="mb-2 font-semibold text-slate-900">Ontvang je alert</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Wij checken elke paar minuten en mailen je direct zodra er voorraad is.
              </p>
            </article>
          </div>
        </section>

        {/* Example deals table */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Voorbeeld deals</h2>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-slate-400">Product</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-slate-400">Origineel</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-slate-400">Tweede Kans</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-slate-400">Besparing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-900">IDASEN bureau</td>
                  <td className="px-5 py-4 text-slate-400 line-through">€549</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">€199</td>
                  <td className="px-5 py-4 font-semibold text-emerald-600">€350</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-900">BILLY boekenkast</td>
                  <td className="px-5 py-4 text-slate-400 line-through">€99</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">€49</td>
                  <td className="px-5 py-4 font-semibold text-emerald-600">€50</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-900">POANG fauteuil</td>
                  <td className="px-5 py-4 text-slate-400 line-through">€95</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">€59</td>
                  <td className="px-5 py-4 font-semibold text-emerald-600">€36</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent alerts */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Recent gealerteerde deals</h2>
          <div className="flex snap-x gap-4 overflow-x-auto pb-2">
            {deals.map((deal) => (
              <article
                key={deal.name}
                className="min-w-[210px] snap-start rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
              >
                <p className="mb-3 text-xs text-slate-400">{deal.status}</p>
                <h3 className="text-sm font-semibold text-slate-900">{deal.name}</h3>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-xl font-bold text-slate-900">{deal.price}</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {deal.save}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-14 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-3xl font-serif leading-none text-slate-200">"</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
              Eindelijk geen dagelijkse checks meer!
            </p>
            <p className="mt-4 text-xs text-slate-400">Utrecht</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-3xl font-serif leading-none text-slate-200">"</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
              In 2 weken €280 bespaard op 3 items.
            </p>
            <p className="mt-4 text-xs text-slate-400">Groningen</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-3xl font-serif leading-none text-slate-200">"</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
              Sneller dan handmatig zoeken — altijd als eerste.
            </p>
            <p className="mt-4 text-xs text-slate-400">Eindhoven</p>
          </article>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-14">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Veelgestelde vragen</h2>
          <div className="space-y-2">
            {[
              {
                q: "Hoe snel krijg ik notificaties?",
                a: "Elke paar minuten checken we de voorraad — near real-time op basis van publieke IKEA updates.",
              },
              {
                q: "Is deze tool verbonden met IKEA?",
                a: "Nee. Volledig onafhankelijk, gebruikt alleen publieke IKEA data.",
              },
              {
                q: "Kan ik meerdere winkels tegelijk volgen?",
                a: "Ja. Je kunt combinaties maken van meerdere winkels en meerdere artikelen.",
              },
              {
                q: "Is mijn e-mail veilig?",
                a: "Ja. Geen spam — alleen alerts, en optioneel tips als je daar toestemming voor geeft.",
              },
              {
                q: "Heb ik IKEA Family nodig?",
                a: "Niet voor deze alerts. Voor sommige reserveringen in de IKEA-app zelf kan het nodig zijn.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                  {q}
                  <span className="flex-shrink-0 text-lg font-light text-slate-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-emerald-500" />
                <span className="font-semibold text-slate-900">IKEA Tweede Kans Alerts</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
                Onafhankelijk van IKEA. Gebruikt alleen publieke data. Geen spam. GDPR-proof.
              </p>
              <p className="mt-3 text-xs text-slate-400">Gemaakt in Nederland 🇳🇱</p>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Navigatie
              </h3>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/" className="hover:text-slate-900 transition-colors">Home</Link></li>
                <li><Link href="#hoe-het-werkt" className="hover:text-slate-900 transition-colors">Hoe het werkt</Link></li>
                <li><Link href="#faq" className="hover:text-slate-900 transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Legal
              </h3>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link></li>
                <li><Link href="/disclaimer" className="hover:text-slate-900 transition-colors">Disclaimer</Link></li>
                <li><Link href="/manage" className="hover:text-slate-900 transition-colors">Mijn alerts</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

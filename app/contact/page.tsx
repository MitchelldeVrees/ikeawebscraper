import { MessageSquare, ShieldCheck, Clock3 } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Contact",
  description:
    "Stel je vraag of deel een idee voor de IKEA Tweede Kans alerts. We lezen elke reactie.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <SiteHeader />

        <section className="mx-auto max-w-5xl space-y-8">
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Contact
            </p>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Een vraag, idee of probleem? Laat het weten.
            </h1>
            <p className="mt-3 max-w-3xl text-base text-muted-foreground">
              Vul het formulier in en we sturen je bericht rechtstreeks door naar
              onze inbox. Je ontvangt een reactie zodra we hem hebben gelezen.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.45fr,1fr]">
            <ContactForm />

            <aside className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-muted/40 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <MessageSquare className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-semibold">Waarmee kunnen we helpen?</p>
                    <p className="text-sm text-muted-foreground">
                      Voorbeelden die we graag horen:
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Feedback op alerts of prijsberekeningen.</li>
                  <li>• Ideeën voor nieuwe features of winkels.</li>
                  <li>• Problemen met je account of e-mails.</li>
                </ul>
                <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-background p-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Je gegevens blijven privé en worden alleen gebruikt om je te
                    antwoorden.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-background p-3">
                  <Clock3 className="h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    We proberen op werkdagen binnen 24 uur te reageren.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

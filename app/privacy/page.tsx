import Link from "next/link";

export const metadata = {
  title: "Privacy | IKEA Tweede Kans Alerts",
  description: "Privacybeleid voor IKEA Tweede Kans Alerts.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-4 text-3xl font-bold text-blue-950">Privacy</h1>
        <p className="mb-3 text-sm text-slate-700">
          We gebruiken je e-mailadres alleen om deal alerts en accountgerelateerde updates te versturen.
        </p>
        <p className="mb-3 text-sm text-slate-700">
          Deze tool gebruikt alleen publieke IKEA data en is niet verbonden aan IKEA.
        </p>
        <p className="text-sm text-slate-700">
          Vragen over privacy? <Link className="text-emerald-700 underline" href="/contact">Neem contact op</Link>.
        </p>
      </div>
    </main>
  );
}

export const metadata = {
  title: "Disclaimer | IKEA Tweede Kans Alerts",
  description: "Disclaimer voor IKEA Tweede Kans Alerts.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-4 text-3xl font-bold text-blue-950">Disclaimer</h1>
        <p className="mb-3 text-sm text-slate-700">
          IKEA Tweede Kans Alerts is een onafhankelijke tool en niet gelieerd aan IKEA.
        </p>
        <p className="mb-3 text-sm text-slate-700">
          Beschikbaarheid, prijzen en inhoud zijn afhankelijk van publieke brondata en kunnen wijzigen.
        </p>
        <p className="text-sm text-slate-700">Gebruik van deze website is op eigen verantwoordelijkheid.</p>
      </div>
    </main>
  );
}

import { WatchForm } from "@/components/watch-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, Bell, Clock } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">IKEA Tweedekansje Alerts</h1>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/manage">Manage Watches</Link>
            </Button>
            <Button asChild>
              <Link href="/account">Account</Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Never Miss an IKEA Deal Again
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Get instant email alerts when your favorite IKEA products appear on Tweedekansje with huge discounts.
            Perfect for finding as-is items and open box deals.
          </p>

          
        </div>

        {/* Watch Form */}
        <div className="max-w-4xl mx-auto">
          <WatchForm />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            This is an independent service and is not affiliated with IKEA.
            Data is sourced from IKEA&apos;s public Tweedekansje API.
          </p>
        </footer>
      </div>
    </main>
  );
}

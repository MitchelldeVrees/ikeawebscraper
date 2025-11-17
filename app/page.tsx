import { WatchForm } from "@/components/watch-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, Bell, Clock } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-900">IKEA Tweedekansje Alerts</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/manage">Manage Watches</Link>
          </Button>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
            Never Miss an IKEA Deal Again
          </h2>
          <p className="text-xl text-gray-600 mb-8 text-pretty">
            Get instant email alerts when your favorite IKEA products appear on Tweedekansje with huge discounts.
            Perfect for finding as-is items and open box deals.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Bell className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Instant Alerts</h3>
              <p className="text-sm text-gray-600">
                Receive email notifications the moment your watched product becomes available
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Clock className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Regular Checks</h3>
              <p className="text-sm text-gray-600">
                Automated monitoring every 4 hours starting at 07:00
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Package className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Store Specific</h3>
              <p className="text-sm text-gray-600">
                Watch products at your preferred IKEA store location
              </p>
            </div>
          </div>
        </div>

        {/* Watch Form */}
        <div className="max-w-2xl mx-auto">
          <WatchForm />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>
            This is an independent service and is not affiliated with IKEA.
            Data is sourced from IKEA&apos;s public Tweedekansje API.
          </p>
        </footer>
      </div>
    </main>
  );
}

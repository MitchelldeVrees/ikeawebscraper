"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { BellRing } from "lucide-react";

export function SiteHeader({ className }: { className?: string }) {
  const { user } = useAuth();

  return (
    <header
      className={
        className ??
        "sticky top-3 z-40 mb-10 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur"
      }
    >
      <Link href="/" className="flex items-center gap-2.5">
        <BellRing className="h-4 w-4 text-emerald-500" />
        <span className="font-semibold text-slate-900">Tweede Kans Alerts</span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex">
        <Button asChild variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
          <Link href="/#hoe-het-werkt">Hoe het werkt</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
          <Link href="/#faq">FAQ</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
          <Link href="/contact">Contact</Link>
        </Button>
      </nav>

      <Button
        asChild
        size="sm"
        className="rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
      >
        <Link href={user ? "/manage" : "/login"}>
          {user ? "Mijn alerts" : "Inloggen"}
        </Link>
      </Button>
    </header>
  );
}

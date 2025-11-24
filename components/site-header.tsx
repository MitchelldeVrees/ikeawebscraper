"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { Package } from "lucide-react";

export function SiteHeader({ className }: { className?: string }) {
  const { user } = useAuth();

  return (
    <header
      className={
        className ??
        "flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10"
      }
    >
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            IKEA Tweedekansje Alerts
          </h1>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Tweede kans tracker
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <Button asChild variant="ghost" size="sm">
          <Link href="/guide-to-ikea-tweede-kans">Gids</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/ikea-tweede-kans-faq">FAQ</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/manage">Watches beheren</Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href={user ? "/account" : "/login"}>
            {user ? "Mijn account" : "Inloggen"}
          </Link>
        </Button>
      </div>
    </header>
  );
}

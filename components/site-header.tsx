"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { BellRing, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/#hoe-het-werkt", label: "Hoe het werkt" },
  { href: "/ikea-tweede-kans-faq", label: "FAQ" },
  { href: "/guide-to-ikea-tweede-kans", label: "Guide" },
  { href: "/manage", label: "Mijn alerts" },
  { href: "/account", label: "Account" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
];

const authenticatedNavItems = [
  { href: "/", label: "Home" },
  { href: "/manage", label: "Mijn alerts" },
  { href: "/account", label: "Account" },
];

export function SiteHeader({ className }: { className?: string }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = user ? authenticatedNavItems : publicNavItems;

  return (
    <div className={cn("sticky top-3 z-40 mb-8", className)}>
      <header className="rounded-2xl border border-border/80 bg-card/95 px-4 py-3 text-card-foreground shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <BellRing className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">Tweede Kans Slim &amp; Circulair</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href={user ? "/manage" : "/login"}>
                {user ? "Dashboard" : "Inloggen"}
              </Link>
            </Button>
            <button
              type="button"
              aria-label={mobileOpen ? "Menu sluiten" : "Menu openen"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-card-foreground lg:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <nav
        className={cn(
          "mt-2 rounded-2xl border border-border/80 bg-card p-3 shadow-sm lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <div className="grid grid-cols-2 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Button asChild size="sm" className="mt-3 w-full">
          <Link href={user ? "/manage" : "/login"} onClick={() => setMobileOpen(false)}>
            {user ? "Naar dashboard" : "Inloggen"}
          </Link>
        </Button>
      </nav>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Mail,
  ListChecks,
  ArrowLeft,
  Sun,
  Moon,
  LogIn,
} from "lucide-react";

type Language = "en" | "nl";
type Translation = {
    pageTitle: string;
    pageSubtitle: string;
    signInCardTitle: string;
    signInCardDescription: string;
    signInNotice: string;
    signInButton: string;
    overviewTitle: string;
    overviewDescription: string;
    emailLabel: string;
  watchCountLabel: string;
  drivingTitle: string;
  drivingDescription: string;
  addressLabel: string;
  addressHelper: string;
  streetPlaceholder: string;
    houseNumberPlaceholder: string;
    cityPlaceholder: string;
    postalCodePlaceholder: string;
    fuelUsageLabel: string;
    fuelUsageHelper: string;
    fuelPriceLabel: string;
    fuelPriceHelper: string;
    saveButton: string;
    savingButton: string;
    successMessage: string;
    verifyNotice: (email: string) => string;
    signedInAs: string;
    signOut: string;
    languageLabel: string;
    switchToLight: string;
    switchToDark: string;
    englishShort: string;
    dutchShort: string;
  };

const translations: Record<Language, Translation> = {
  en: {
    pageTitle: "Account settings",
    pageSubtitle: "Check your email, watch count, and driving details.",
    signInCardTitle: "Account",
    signInCardDescription: "Sign in to save your settings.",
    signInNotice: "Log in to view this page.",
    signInButton: "Sign in",
    overviewTitle: "Overview",
    overviewDescription: "A quick look at your account",
    emailLabel: "Email address",
    watchCountLabel: "Active watches",
    drivingTitle: "Driving details",
    drivingDescription:
      "Tell us where you start from and how thirsty your car is so we can estimate fuel costs.",
    addressLabel: "Home address",
    addressHelper:
      "Street and city are enough. Add a house number or postcode if you like.",
    streetPlaceholder: "Street",
    houseNumberPlaceholder: "House number (optional)",
    cityPlaceholder: "City",
    postalCodePlaceholder: "Postcode (optional)",
    fuelUsageLabel: "Fuel consumption (L / 100 km)",
    fuelUsageHelper: "Used to estimate the fuel needed for a round trip.",
    fuelPriceLabel: "Fuel price (€/L)",
    fuelPriceHelper: "What you currently pay per litre.",
    saveButton: "Save preferences",
    savingButton: "Saving...",
    successMessage: "Saved your driving details.",
    verifyNotice: (email) =>
      `Please confirm ${email} via the link in your inbox so we can send alerts.`,
    signedInAs: "Signed in as",
    signOut: "Sign out",
    languageLabel: "Language",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
    englishShort: "EN",
    dutchShort: "NL",
  },
  nl: {
    pageTitle: "Accountinstellingen",
    pageSubtitle: "Bekijk je e-mail, watches en ritgegevens.",
    signInCardTitle: "Account",
    signInCardDescription: "Log in om je gegevens op te slaan.",
    signInNotice: "Log in om deze pagina te zien.",
    signInButton: "Inloggen",
    overviewTitle: "Overzicht",
    overviewDescription: "Een korte blik op je account",
    emailLabel: "E-mailadres",
    watchCountLabel: "Actieve watches",
    drivingTitle: "Ritgegevens",
    drivingDescription:
      "Geef je vertrekpunt en verbruik door zodat we brandstofkosten kunnen schatten.",
    addressLabel: "Adres",
    addressHelper:
      "Straat en woonplaats zijn genoeg. Huisnummer en postcode zijn optioneel.",
    streetPlaceholder: "Straat",
    houseNumberPlaceholder: "Huisnummer (optioneel)",
    cityPlaceholder: "Plaats",
    postalCodePlaceholder: "Postcode (optioneel)",
    fuelUsageLabel: "Brandstofverbruik (L / 100 km)",
    fuelUsageHelper:
      "We gebruiken dit om in te schatten hoeveel brandstof de rit kost.",
    fuelPriceLabel: "Brandstofprijs (€/L)",
    fuelPriceHelper: "Wat je nu per liter betaalt.",
    saveButton: "Voorkeuren opslaan",
    savingButton: "Opslaan...",
    successMessage: "Je rijgegevens zijn opgeslagen.",
    verifyNotice: (email) =>
      `Controleer ${email} via de link in je inbox zodat we meldingen kunnen sturen.`,
    signedInAs: "Ingelogd als",
    signOut: "Uitloggen",
    languageLabel: "Taal",
    switchToLight: "Schakel naar licht thema",
    switchToDark: "Schakel naar donker thema",
    englishShort: "EN",
    dutchShort: "NL",
  },
};

interface AccountData {
  email: string;
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  gasUsage: number | null;
  fuelPrice: number | null;
  watchCount: number;
}

export default function AccountPage() {
  const { user, session, supabase } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [language, setLanguage] = useState<Language>("nl");
  const t = translations[language];

  const [data, setData] = useState<AccountData | null>(null);
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [gasUsage, setGasUsage] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAccount = async () => {
      if (!session?.access_token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/account", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load account data");
        }

        setData(result);
        setStreet(result.street || "");
        setHouseNumber(result.houseNumber || "");
        setCity(result.city || "");
        setPostalCode(result.postalCode || "");
        setGasUsage(
          typeof result.gasUsage === "number" ? String(result.gasUsage) : ""
        );
        setFuelPrice(
          typeof result.fuelPrice === "number" ? String(result.fuelPrice) : ""
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccount();
  }, [session?.access_token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.access_token) {
      setError("You must be signed in.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          street,
          houseNumber,
          city,
          postalCode,
          gasUsage: gasUsage ? Number(gasUsage) : null,
          fuelPrice: fuelPrice ? Number(fuelPrice) : null,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update account");
      }

      setStatus(t.successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account");
    } finally {
      setIsSaving(false);
    }
  };

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const controls = (
    <LanguageThemeControls
      language={language}
      setLanguage={setLanguage}
      isDark={isDark}
      toggleTheme={() => setTheme(isDark ? "light" : "dark")}
      translations={t}
      canToggleTheme={mounted}
    />
  );

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground transition-colors">
        <div className="container mx-auto px-4 py-16 max-w-xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                {t.pageTitle}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t.pageSubtitle}
              </p>
            </div>
            {controls}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t.signInCardTitle}</CardTitle>
              <CardDescription>{t.signInCardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                <AlertDescription className="flex items-center justify-between gap-4">
                  <span>{t.signInNotice}</span>
                  <Button asChild variant="secondary">
                    <Link href="/login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {t.signInButton}
                    </Link>
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-16 max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                {t.pageTitle}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t.pageSubtitle}
              </p>
            </div>
          </div>
          {controls}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t.overviewTitle}</CardTitle>
                <CardDescription>{t.overviewDescription}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {t.emailLabel}
                  </div>
                  <p className="mt-1 text-lg font-semibold">
                    {data?.email || user.email}
                  </p>
                </div>
                <div className="rounded border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ListChecks className="h-4 w-4" />
                    {t.watchCountLabel}
                  </div>
                  <p className="mt-1 text-lg font-semibold">
                    {data?.watchCount ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.drivingTitle}</CardTitle>
                <CardDescription>{t.drivingDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                {!user.email_confirmed_at && (
                  <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-900">
                    <AlertDescription>
                      {t.verifyNotice(user.email)}
                    </AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <Label>{t.addressLabel}</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Input
                          placeholder={t.streetPlaceholder}
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Input
                          placeholder={t.houseNumberPlaceholder}
                          value={houseNumber}
                          onChange={(e) => setHouseNumber(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Input
                          placeholder={t.cityPlaceholder}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Input
                          placeholder={t.postalCodePlaceholder}
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.addressHelper}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="gas-usage">{t.fuelUsageLabel}</Label>
                      <Input
                        id="gas-usage"
                        type="number"
                        min="0"
                        step="0.1"
                        value={gasUsage}
                        onChange={(e) => setGasUsage(e.target.value)}
                        placeholder="e.g., 6.5"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t.fuelUsageHelper}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuel-price">{t.fuelPriceLabel}</Label>
                      <Input
                        id="fuel-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={fuelPrice}
                        onChange={(e) => setFuelPrice(e.target.value)}
                        placeholder="e.g., 2.15"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t.fuelPriceHelper}
                      </p>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {status && (
                    <Alert>
                      <AlertDescription>{status}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.savingButton}
                        </>
                      ) : (
                        t.saveButton
                      )}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      {t.signedInAs} <span className="font-medium">{user.email}</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => supabase?.auth.signOut()}
                    >
                      {t.signOut}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}

function LanguageThemeControls({
  language,
  setLanguage,
  isDark,
  toggleTheme,
  translations,
  canToggleTheme,
}: {
  language: Language;
  setLanguage: (lang: Language) => void;
  isDark: boolean;
  toggleTheme: () => void;
  translations: Translation;
  canToggleTheme: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{translations.languageLabel}:</span>
        <div className="inline-flex rounded-md border p-1">
          {(["en", "nl"] as Language[]).map((lang) => (
            <Button
              key={lang}
              type="button"
              variant={language === lang ? "default" : "ghost"}
              size="sm"
              onClick={() => setLanguage(lang)}
            >
              {lang === "en" ? translations.englishShort : translations.dutchShort}
            </Button>
          ))}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        disabled={!canToggleTheme}
        aria-label={isDark ? translations.switchToLight : translations.switchToDark}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
}

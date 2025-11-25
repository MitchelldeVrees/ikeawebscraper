"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        setStatus("Succesvol ingelogd!");
        router.replace("/manage");
      } else {
        const origin =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (typeof window !== "undefined" ? window.location.origin : "");

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/login`,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        setStatus(
          "Account aangemaakt! Bekijk je inbox om je e-mailadres te verifiëren."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authenticatie mislukt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Voer eerst je e-mailadres in.");
      return;
    }

    setIsResetting(true);
    setError(null);
    setStatus(null);

    try {
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${origin}/reset-password`,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setStatus("Reset e-mail verstuurd. Controleer je inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon reset e-mail niet versturen.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {mode === "login" ? (
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              ) : (
                <MailCheck className="h-8 w-8 text-blue-600" />
              )}
              <div>
                <CardTitle>{mode === "login" ? "Inloggen" : "Maak een account"}</CardTitle>
                <CardDescription>
                  {mode === "login"
                    ? "Log in om je IKEA Tweedekansje dashboard te openen."
                    : "Maak een account om IKEA artikel nummers te volgen en notificaties te ontvangen."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="je@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "login" ? "Bezig met inloggen..." : "Account wordt aangemaakt..."}
                  </>
                ) : mode === "login" ? (
                  "Inloggen"
                ) : (
                  "Account aanmaken"
                )}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                type="button"
                variant="link"
                className="px-0 w-fit"
                disabled={isResetting}
                onClick={handlePasswordReset}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reset e-mail wordt verstuurd...
                  </>
                ) : (
                  "Wachtwoord vergeten?"
                )}
              </Button>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {mode === "login" ? "Nog geen account?" : "Heb je al een account?"}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError(null);
                    setStatus(null);
                  }}
                >
                  {mode === "login" ? "Maak er één aan" : "Log in"}
                </Button>
              </div>

              <Button asChild variant="outline">
                <Link href="/">Terug naar start</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

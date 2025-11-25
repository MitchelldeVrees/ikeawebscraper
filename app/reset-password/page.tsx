"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { supabase } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        setError("Deze resetlink is ongeldig of verlopen.");
      } else {
        setSessionReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, [supabase]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (password.length < 6) {
      setError("Wachtwoord moet minstens 6 tekens bevatten.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setStatus("Wachtwoord bijgewerkt! Je kunt nu inloggen met je nieuwe wachtwoord.");
      setTimeout(() => router.replace("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon het wachtwoord niet bijwerken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Lock className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle>Wachtwoord resetten</CardTitle>
              <CardDescription>
                Voer een nieuw wachtwoord in voor je IKEA Tweedekansje Alerts account.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nieuw wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={!sessionReady}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Bevestig wachtwoord</Label>
                <Input
                  id="confirm"
                  type="password"
                placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={!sessionReady}
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

              <Button type="submit" className="w-full" disabled={!sessionReady || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wachtwoord wordt bijgewerkt...
                  </>
                ) : (
                  "Wachtwoord bijwerken"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

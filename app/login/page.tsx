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

        setStatus("Successfully signed in!");
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
          "Account created! Please check your inbox to verify your email before signing in."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Enter your email address first.");
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

      setStatus("Password reset email sent. Check your inbox for further steps.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
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
                <CardTitle>{mode === "login" ? "Sign In" : "Create an Account"}</CardTitle>
                <CardDescription>
                  {mode === "login"
                    ? "Access your IKEA Tweedekansje alerts dashboard."
                    : "Create an account to watch IKEA article numbers and get notified."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                    {mode === "login" ? "Signing In..." : "Creating Account..."}
                  </>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
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
                    Sending reset email...
                  </>
                ) : (
                  "Forgot password?"
                )}
              </Button>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {mode === "login" ? "Need an account?" : "Already have an account?"}
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
                  {mode === "login" ? "Create one" : "Sign in"}
                </Button>
              </div>

              <Button asChild variant="outline">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


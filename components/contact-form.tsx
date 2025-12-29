"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const isSending = status === "sending";
  const showSuccess = status === "success";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSending) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (name.length < 2) {
      setError("Vul je naam in zodat we weten wie er contact zoekt.");
      return;
    }

    if (message.length < 10) {
      setError("Je bericht moet minimaal 10 tekens bevatten.");
      return;
    }

    if (message.length > 2000) {
      setError("Je bericht is te lang. Houd het onder de 2000 tekens.");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Voer een geldig e-mailadres in of laat het veld leeg.");
      return;
    }

    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Bericht kon niet worden verzonden.");
      }

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Er ging iets mis bij het verzenden van je bericht."
      );
    }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", message: "" });
    setStatus("idle");
    setError(null);
  };

  return (
    <div className="relative">
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Contactformulier
            </p>
            <h2 className="text-2xl font-semibold">Stuur een bericht</h2>
            <p className="text-sm text-muted-foreground">
              Komt direct in onze inbox terecht. We reageren zo snel mogelijk.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Naam *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Hoe mogen we je aanspreken?"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                E-mail <span className="text-muted-foreground">(optioneel)</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jij@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Bericht *</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Leg kort uit waar we je mee kunnen helpen."
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              required
              rows={6}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verzenden...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Verstuur bericht
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              We delen je gegevens niet en gebruiken ze alleen om te antwoorden.
            </p>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center bg-emerald-50/60 opacity-0 backdrop-blur-sm transition-all duration-500 ease-out transform translate-y-3 scale-[0.98]",
          showSuccess && "pointer-events-auto opacity-100 translate-y-0 scale-100"
        )}
        aria-live="polite"
      >
        <div className="w-full max-w-md rounded-xl border border-emerald-200 bg-white/90 px-6 py-5 text-emerald-900 shadow-xl ring-2 ring-emerald-200/70 transition-all duration-500 ease-out">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-md">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Bericht verzonden!</h3>
              <p className="text-sm text-emerald-800">
                We hebben je bericht ontvangen en sturen het direct door naar ons
                team. Je krijgt snel een reactie.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button size="sm" variant="secondary" onClick={resetForm}>
                  Nog een bericht
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2 } from 'lucide-react';

const IKEA_STORES = {
  "415": "Amersfoort",
  "088": "Amsterdam",
  "274": "Barendrecht",
  "378": "Haarlem",
};

export function WatchForm() {
  const [email, setEmail] = useState("");
  const [productName, setProductName] = useState("");
  const [storeId, setStoreId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/watches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          productName,
          storeId,
          storeName: IKEA_STORES[storeId as keyof typeof IKEA_STORES],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create watch");
      }

      setSuccess(true);
      setEmail("");
      setProductName("");
      setStoreId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Product Watch</CardTitle>
        <CardDescription>
          Enter your email, the product you&apos;re looking for, and your preferred IKEA store.
          We&apos;ll notify you when it appears on Tweedekansje.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Product Name</Label>
            <Input
              id="product"
              type="text"
              placeholder="e.g., BILLY boekenkast, KALLAX, POÄNG"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use the product name as it appears on IKEA&apos;s website
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store">IKEA Store</Label>
            <Select value={storeId} onValueChange={setStoreId} required>
              <SelectTrigger id="store">
                <SelectValue placeholder="Select your preferred store" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(IKEA_STORES).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Watch created successfully! You&apos;ll receive an email when your product is found.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Watch...
              </>
            ) : (
              "Create Watch"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

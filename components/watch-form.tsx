"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, Upload, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { IKEA_STORES } from "@/lib/ikea-stores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WatchForm() {
  const { user, loading, session } = useAuth();
  const [articleNumber, setArticleNumber] = useState("");
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [desiredQuantity, setDesiredQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvStatus, setCsvStatus] = useState<string | null>(null);
  const [selectedCsvStores, setSelectedCsvStores] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const isVerified = Boolean(user?.email_confirmed_at);

  const toggleStore = (storeId: string) => {
    setSelectedStores((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const toggleCsvStore = (storeId: string) => {
    setSelectedCsvStores((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    const cleanedArticleNumber = articleNumber.replace(/\D/g, "");

    if (!user) {
      setError("You need to be logged in to create watches.");
      setIsLoading(false);
      return;
    }

    if (!isVerified) {
      setError("Please verify your email before creating watches.");
      setIsLoading(false);
      return;
    }

    if (selectedStores.length === 0) {
      setError("Select at least one IKEA store.");
      setIsLoading(false);
      return;
    }

    if (cleanedArticleNumber.length !== 8) {
      setError("Article number must contain 8 digits (e.g., 50487857).");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/watches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          articleNumber: cleanedArticleNumber,
          stores: selectedStores.map((id) => ({
            id,
            name: IKEA_STORES[id as keyof typeof IKEA_STORES]?.name ?? "Unknown store",
          })),
          desiredQuantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create watch");
      }

      setSuccess(true);
      setArticleNumber("");
      setSelectedStores([]);
      setDesiredQuantity(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const parseCsvFile = async (file: File) => {
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      throw new Error("CSV file is empty.");
    }

    const headerColumns = lines[0]
      .split(",")
      .map((col) => col.trim().toLowerCase());

    const productIndex = headerColumns.indexOf("productid");
    const quantityIndex = headerColumns.indexOf("quantity");

    if (productIndex === -1 || quantityIndex === -1) {
      throw new Error("Headers must include 'productid' and 'quantity'.");
    }

    const entries: Array<{ articleNumber: string; desiredQuantity: number }> = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      if (!row) continue;
      const cells = row.split(",").map((cell) => cell.trim());
      const productCell = cells[productIndex] ?? "";
      const quantityCell = cells[quantityIndex] ?? "";

      if (!productCell) {
        throw new Error(`Row ${i + 1}: productid is required.`);
      }

      const cleaned = productCell.replace(/\D/g, "");
      if (cleaned.length !== 8) {
        throw new Error(
          `Row ${i + 1}: productid must contain 8 digits (received "${productCell}").`
        );
      }

      const parsedQuantity = Number(quantityCell);
      const desiredQuantity = Math.max(
        1,
        Number.isFinite(parsedQuantity) ? Math.floor(parsedQuantity) : 1
      );

      entries.push({ articleNumber: cleaned, desiredQuantity });
    }

    if (entries.length === 0) {
      throw new Error("No product rows found in CSV.");
    }

    return entries;
  };

  const handleImportCsv = async () => {
    if (!csvFile) {
      setCsvError("Choose a CSV file to import.");
      return;
    }

    if (selectedCsvStores.length === 0) {
      setCsvError("Select at least one IKEA store.");
      return;
    }

    if (!user) {
      setCsvError("Sign in to import watches.");
      return;
    }

    if (!isVerified) {
      setCsvError("Please verify your email before importing watches.");
      return;
    }

    setIsImporting(true);
    setCsvError(null);
    setCsvStatus(null);

    try {
      const entries = await parseCsvFile(csvFile);
      const storesPayload = selectedCsvStores.map((id) => ({
        id,
        name: IKEA_STORES[id as keyof typeof IKEA_STORES]?.name ?? "Unknown store",
      }));

      const response = await fetch("/api/watches/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          stores: storesPayload,
          entries,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import watches");
      }

      setCsvStatus(
        data.imported
          ? `Imported ${data.imported} watch${data.imported === 1 ? "" : "es"}.`
          : "Import complete."
      );
      setCsvFile(null);
      setSelectedCsvStores([]);
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Product Watch</CardTitle>
        <CardDescription>
          Track IKEA article numbers manually or import them in bulk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual">
          <TabsList className="mb-4">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="article">Article Number</Label>
                <Input
                  id="article"
                  type="text"
                  placeholder="e.g., 50487857 or 504.878.57"
                  value={articleNumber}
                  onChange={(e) => setArticleNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use the 8-digit IKEA article number from the product page.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Select IKEA Stores</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(IKEA_STORES).map(([id, store]) => (
                    <label
                      key={id}
                      className={`flex items-center gap-2 rounded border p-2 text-sm ${
                        selectedStores.includes(id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-border"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        checked={selectedStores.includes(id)}
                        onChange={() => toggleStore(id)}
                      />
                      <span>{store.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select one or more stores you want to monitor.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Minimum Availability</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={desiredQuantity}
                  onChange={(e) =>
                    setDesiredQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Alert me when at least this many matching products are available.
                </p>
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
                    Watches created successfully! You&apos;ll receive an email when your product appears in any selected store.
                  </AlertDescription>
                </Alert>
              )}

              {!user && !loading && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                  <AlertDescription>
                    <span className="font-medium">Heads up:</span> please{" "}
                    <Link href="/login" className="underline">
                      sign in or create an account
                    </Link>{" "}
                    to create watches.
                  </AlertDescription>
                </Alert>
              )}

              {!isVerified && user && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                  <AlertDescription>
                    Check your inbox to verify <strong>{user.email}</strong> before creating watches.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || loading || !user || !isVerified}
              >
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
          </TabsContent>

          <TabsContent value="csv">
            <div className="space-y-4">
              {!user && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                  <AlertDescription className="flex items-center justify-between gap-4">
                    <span>Sign in to use CSV import.</span>
                    <Button asChild variant="secondary">
                      <Link href="/login" className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign in
                      </Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {user && !isVerified && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                  <AlertDescription>
                    Please verify <strong>{user.email}</strong> before importing watches.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <a href="/api/watches/template" download>
                    Download CSV Template
                  </a>
                </Button>
                <div className="flex-1 min-w-[220px]">
                  <Label htmlFor="csv-upload">CSV File</Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv,text/csv"
                    disabled={!user || !isVerified}
                    onChange={(event) => {
                      setCsvFile(event.target.files?.[0] ?? null);
                      setCsvError(null);
                      setCsvStatus(null);
                    }}
                  />
                  {csvFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {csvFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select IKEA Stores</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(IKEA_STORES).map(([id, store]) => (
                    <label
                      key={id}
                      className={`flex items-center gap-2 rounded border p-2 text-sm ${
                        selectedCsvStores.includes(id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-border"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        checked={selectedCsvStores.includes(id)}
                        onChange={() => toggleCsvStore(id)}
                        disabled={!user || !isVerified}
                      />
                      <span>{store.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {csvError && (
                <Alert variant="destructive">
                  <AlertDescription>{csvError}</AlertDescription>
                </Alert>
              )}

              {csvStatus && (
                <Alert>
                  <AlertDescription>{csvStatus}</AlertDescription>
                </Alert>
              )}

              <Button
                type="button"
                onClick={handleImportCsv}
                className="w-full"
                disabled={
                  isImporting ||
                  !csvFile ||
                  selectedCsvStores.length === 0 ||
                  !user ||
                  !isVerified
                }
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

"use client";

import Image from "next/image";
import { useRef, useState } from "react";
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
import { cn } from "@/lib/utils";
import type { ProductPreview } from "@/lib/ikea-api";

type ArticleValidationStatus = "idle" | "checking" | "valid" | "invalid";

export function WatchForm() {
  const { user, loading, session } = useAuth();
  const [articleNumber, setArticleNumber] = useState("");
  const [articleValidationStatus, setArticleValidationStatus] =
    useState<ArticleValidationStatus>("idle");
  const [articleValidationReason, setArticleValidationReason] = useState<string | null>(
    null
  );
  const verifyingArticleRef = useRef<string | null>(null);
  const [productPreview, setProductPreview] = useState<ProductPreview | null>(null);
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
  const articleIsValid = articleValidationStatus === "valid";
  const articleInputClassName = cn(
    articleValidationStatus === "invalid" &&
      "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50",
    articleValidationStatus === "valid" &&
      "border-emerald-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50"
  );
  const articleValidationMessage =
    articleValidationStatus === "checking"
      ? "Artikelnummer wordt gecontroleerd..."
      : articleValidationStatus === "invalid"
      ? articleValidationReason ?? "Onjuist artikelnummer."
      : articleValidationStatus === "valid"
      ? "Artikelnummer bevestigd."
      : "Gebruik het 8-cijferige IKEA artikelnummer van de productpagina.";
  const articleValidationMessageClass = cn(
    articleValidationStatus === "invalid" && "text-destructive",
    articleValidationStatus === "valid" && "text-emerald-600",
    articleValidationStatus === "checking" && "text-foreground",
    articleValidationStatus === "idle" && "text-muted-foreground"
  );
  const resetArticleValidation = () => {
    verifyingArticleRef.current = null;
    setArticleValidationStatus("idle");
    setArticleValidationReason(null);
    setProductPreview(null);
  };

  const handleArticleBlur = async () => {
    const normalized = articleNumber.replace(/\D/g, "");

    if (!normalized) {
      resetArticleValidation();
      return;
    }

    if (normalized.length !== 8) {
      verifyingArticleRef.current = null;
      setArticleValidationStatus("invalid");
      setArticleValidationReason(
        "Artikelnummer moet uit 8 cijfers bestaan (bijv. 50487857)."
      );
      setProductPreview(null);
      return;
    }

    verifyingArticleRef.current = normalized;
    setArticleValidationStatus("checking");
    setArticleValidationReason(null);

    const previewUrl = `/api/ikea/product-preview?article=${encodeURIComponent(
      normalized
    )}`;

    let preview: ProductPreview | null = null;

    try {
      const response = await fetch(previewUrl);

      if (!response.ok) {
        const reason =
          response.status === 404
            ? "Incorrect product id."
            : "Unable to verify the product right now.";

        verifyingArticleRef.current = null;
        setArticleValidationStatus("invalid");
        setArticleValidationReason(reason);
        setProductPreview(null);
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | { preview?: ProductPreview | null }
        | null;

      preview = payload?.preview ?? null;

      if (!preview) {
        verifyingArticleRef.current = null;
        setArticleValidationStatus("invalid");
      setArticleValidationReason("Onjuist artikelnummer.");
        setProductPreview(null);
        return;
      }
    } catch (error) {
      console.error("[v0] fetchProductPreview error:", error);
      verifyingArticleRef.current = null;
      setArticleValidationStatus("invalid");
      setArticleValidationReason("Dit product kon nu niet worden geverifieerd.");
      setProductPreview(null);
      return;
    }

    if (verifyingArticleRef.current !== normalized) {
      return;
    }

    verifyingArticleRef.current = null;
    setArticleValidationStatus("valid");
    setArticleValidationReason(null);
    setProductPreview(preview);
  };

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
      setError("Je moet ingelogd zijn om watches aan te maken.");
      setIsLoading(false);
      return;
    }

    if (!isVerified) {
      setError("Verifieer je e-mail voordat je watches aanmaakt.");
      setIsLoading(false);
      return;
    }

    if (selectedStores.length === 0) {
      setError("Selecteer minimaal één IKEA-winkel.");
      setIsLoading(false);
      return;
    }

    if (cleanedArticleNumber.length !== 8) {
      setError("Artikelnummer moet 8 cijfers bevatten (bijv. 50487857).");
      setIsLoading(false);
      return;
    }

    if (articleValidationStatus !== "valid") {
      setError("Controleer het IKEA artikelnummer voordat je een watch aanmaakt.");
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
      resetArticleValidation();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan.");
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
      throw new Error("CSV-bestand is leeg.");
    }

    const headerColumns = lines[0]
      .split(",")
      .map((col) => col.trim().toLowerCase());

    const productIndex = headerColumns.indexOf("productid");
    const quantityIndex = headerColumns.indexOf("quantity");

    if (productIndex === -1 || quantityIndex === -1) {
      throw new Error("De kolomtitels moeten 'productid' en 'quantity' bevatten.");
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
      throw new Error("Geen productregels gevonden in de CSV.");
    }

    return entries;
  };

  const handleImportCsv = async () => {
    if (!csvFile) {
      setCsvError("Kies een CSV-bestand om te importeren.");
      return;
    }

    if (selectedCsvStores.length === 0) {
      setCsvError("Selecteer minimaal één IKEA-winkel.");
      return;
    }

    if (!user) {
      setCsvError("Log in om watches te importeren.");
      return;
    }

    if (!isVerified) {
      setCsvError("Verifieer je e-mail voordat je watches importeert.");
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
        throw new Error(data.error || "Importeren van watches is mislukt.");
      }

      setCsvStatus(
        data.imported
          ? `Geïmporteerd ${data.imported} watch${data.imported === 1 ? "" : "es"}.`
          : "Import voltooid."
      );
      setCsvFile(null);
      setSelectedCsvStores([]);
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : "Import mislukt.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maak een productwaarschuwing</CardTitle>
        <CardDescription>
          Volg IKEA artikelnummer handmatig of importeer ze in bulk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual">
          <TabsList className="mb-4">
            <TabsTrigger value="manual">Handmatig</TabsTrigger>
            <TabsTrigger value="csv">CSV-upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="article">Artikelnummer</Label>
                <Input
                  id="article"
                  type="text"
                  placeholder="bijv. 50487857 of 504.878.57"
                  value={articleNumber}
                  onChange={(e) => {
                    setArticleNumber(e.target.value);
                    resetArticleValidation();
                  }}
                  onBlur={handleArticleBlur}
                  aria-invalid={articleValidationStatus === "invalid"}
                  className={articleInputClassName}
                  required
                />
                <p className={cn("text-xs", articleValidationMessageClass)}>
                  {articleValidationMessage}
                </p>
                {productPreview?.imageUrl && (
                  <div className="mt-2 flex items-start gap-3">
                      <Image
                        src={productPreview.imageUrl}
                        alt={productPreview.name ?? "Productvoorbeeld"}
                      width={96}
                      height={96}
                      className="h-16 w-16 rounded border object-cover"
                    />
                    <div className="flex flex-col text-sm text-muted-foreground">
                      {productPreview.name && (
                        <p className="font-semibold text-foreground">
                          {productPreview.name}
                        </p>
                      )}
                      {productPreview.typeName && (
                        <p className="uppercase tracking-wide text-xs">
                          {productPreview.typeName}
                        </p>
                      )}
                      {productPreview.price && (
                        <p className="text-foreground">{productPreview.price}</p>
                      )}
                      {productPreview.priceExclTax && (
                        <p className="text-xs text-muted-foreground">
                          excl. BTW {productPreview.priceExclTax}
                        </p>
                      )}
                      {productPreview.pipUrl && (
                          <a
                            href={productPreview.pipUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 underline"
                          >
                            Bekijk op IKEA
                          </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Kies IKEA-winkels</Label>
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
                  Selecteer één of meer winkels die je wilt volgen.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Hoeveelheid nodig</Label>
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
                  Waarschuw mij wanneer minstens dit aantal producten beschikbaar is.
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
                    Watch succesvol aangemaakt! Je ontvangt een e-mail zodra je product in een geselecteerde winkel verschijnt.
                  </AlertDescription>
                </Alert>
              )}

              {!user && !loading && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                  <AlertDescription>
                    <span className="font-medium">Let op:</span> log in of maak een account aan om watches te maken.
                  </AlertDescription>
                </Alert>
              )}

              {!isVerified && user && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                  <AlertDescription>
                    Controleer je inbox om <strong>{user.email}</strong> te verifiëren voordat je watches maakt.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading ||
                  loading ||
                  !user ||
                  !isVerified ||
                  !articleIsValid
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Watch wordt aangemaakt...
                  </>
                ) : (
                  "Maak watch aan"
                )}
             </Button>
            </form>
          </TabsContent>

          <TabsContent value="csv">
            <div className="space-y-4">
              {!user && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                  <AlertDescription className="flex items-center justify-between gap-4">
                    <span>Log in om CSV-import te gebruiken.</span>
                    <Button asChild variant="secondary">
                      <Link href="/login" className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Inloggen
                      </Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {user && !isVerified && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                  <AlertDescription>
                    Verifieer <strong>{user.email}</strong> voordat je watches importeert.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <a href="/api/watches/template" download>
                    Download CSV-sjabloon
                  </a>
                </Button>
                <div className="flex-1 min-w-[220px]">
                  <Label htmlFor="csv-upload">CSV-bestand</Label>
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
                      Geselecteerd: {csvFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kies IKEA-winkels</Label>
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
                    Importeren...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importeer CSV
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

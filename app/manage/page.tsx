"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Loader2, Trash2, ArrowLeft, RefreshCcw, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import type { ProductPreview } from "@/lib/ikea-api";

interface StoreWatch {
  id: string;
  store_id: string;
  store_name: string;
  created_at: string;
}

interface WatchGroup {
  article_number: string;
  desired_quantity: number;
  created_at: string;
  stores: StoreWatch[];
}

type WatchStatus = {
  isChecking: boolean;
  message?: string;
  type?: "success" | "error";
};

export default function ManagePage() {
  const { user, loading, session, supabase } = useAuth();
  const [watches, setWatches] = useState<WatchGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkAllMessage, setCheckAllMessage] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [watchStatuses, setWatchStatuses] = useState<Record<string, WatchStatus>>({});
  const [articlePreviews, setArticlePreviews] = useState<
    Record<string, ProductPreview | null>
  >({});
  const isVerified = Boolean(user?.email_confirmed_at);

  const fetchWatches = async () => {
    if (!user || !isVerified) {
      setWatches([]);
      setHasLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/watches", {
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
      });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch watches");
    }

    const fetchedWatches = (data.data as WatchGroup[]) ?? [];
    setWatches(fetchedWatches);
    setWatchStatuses({});
    await loadArticlePreviews(fetchedWatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  const loadArticlePreviews = async (groups: WatchGroup[]) => {
    const uniqueArticles = Array.from(
      new Set(groups.map((group) => group.article_number))
    );
    const missing = uniqueArticles.filter(
      (article) => !(article in articlePreviews)
    );

    if (missing.length === 0) {
      return;
    }

    const previewUpdates: Record<string, ProductPreview | null> = {};

    await Promise.all(
      missing.map(async (article) => {
        try {
          const response = await fetch(
            `/api/ikea/product-preview?article=${encodeURIComponent(article)}`
          );

          if (!response.ok) {
            previewUpdates[article] = null;
            return;
          }

          const payload = (await response.json().catch(() => null)) as
            | { preview?: ProductPreview | null }
            | null;

          previewUpdates[article] = payload?.preview ?? null;
        } catch (error) {
          console.error(
            `[v0] Error fetching preview for ${article}:`,
            error
          );
          previewUpdates[article] = null;
        }
      })
    );

    setArticlePreviews((prev) => ({ ...prev, ...previewUpdates }));
  };

  useEffect(() => {
    fetchWatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isVerified, session?.access_token]);

  const handleDelete = async (id: string, articleNumber: string) => {
    try {
      const response = await fetch(`/api/watches/${id}`, {
        method: "DELETE",
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
      });

      if (!response.ok) {
        throw new Error("Failed to delete watch");
      }

      // Remove from local state
      setWatches((prev) =>
        prev
          .map((group) => ({
            ...group,
            stores: group.stores.filter((store) => store.id !== id),
          }))
          .filter((group) => group.stores.length > 0)
      );
      setWatchStatuses((prev) => {
        const next = { ...prev };
        delete next[articleNumber];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete watch");
    }
  };

  const handleCheckAllProducts = async () => {
    if (!user || !isVerified) {
      return;
    }

    if (watches.length === 0) {
      setCheckAllMessage("No watches to check yet.");
      return;
    }

    // Limit to 4 full checks per user per day (client-side)
    const CHECK_LIMIT_PER_DAY = 4;

    if (typeof window !== "undefined") {
      const identifier = user.id ?? user.email ?? "anonymous";
      const storageKey = `watch-check-all-usage-${identifier}`;
      const today = new Date().toISOString().slice(0, 10);

      let record: { date: string; count: number } = {
        date: today,
        count: 0,
      };

      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { date?: string; count?: number };
          if (
            parsed &&
            typeof parsed.date === "string" &&
            typeof parsed.count === "number"
          ) {
            record = {
              date: parsed.date,
              count: parsed.count,
            };
          }
        } catch {
          // Ignore parse errors and reset record
        }
      }

      if (record.date === today && record.count >= CHECK_LIMIT_PER_DAY) {
        setCheckAllMessage(
          "You can only check all products 4 times per day."
        );
        return;
      }

      setIsCheckingAll(true);
      setError(null);
      setCheckAllMessage(null);

      try {
        for (const group of watches) {
          // Reuse existing per-group logic so UI messages stay consistent
          // eslint-disable-next-line no-await-in-loop
          await handleCheckProduct(group);
        }

        const updated =
          record.date === today
            ? { date: today, count: record.count + 1 }
            : { date: today, count: 1 };

        window.localStorage.setItem(storageKey, JSON.stringify(updated));
        setCheckAllMessage(
          `Checked all products (${watches.length} article${
            watches.length === 1 ? "" : "s"
          }).`
        );
      } finally {
        setIsCheckingAll(false);
      }
    }
  };

  const handleCheckProduct = async (group: WatchGroup) => {
    const key = group.article_number;
    setWatchStatuses((prev) => ({
      ...prev,
      [key]: {
        isChecking: true,
      },
    }));

    const headers =
      session?.access_token
        ? {
            Authorization: `Bearer ${session.access_token}`,
          }
        : undefined;

    const results: Array<{
      availableMatches?: number;
      requirementMet?: boolean;
    }> = [];
    const failedStores: string[] = [];

    for (const store of group.stores) {
      try {
        const response = await fetch(`/api/watches/${store.id}/check`, {
          method: "POST",
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          failedStores.push(store.store_name);
          continue;
        }

        results.push({
          availableMatches:
            typeof data.availableMatches === "number"
              ? data.availableMatches
              : Array.isArray(data.matches)
              ? data.matches.length
              : undefined,
          requirementMet:
            typeof data.requirementMet === "boolean"
              ? data.requirementMet
              : undefined,
        });
      } catch (error) {
        console.error(
          `[v0] Error checking watch ${store.id} for ${group.article_number}:`,
          error
        );
        failedStores.push(store.store_name);
      }
    }

    const totalMatches = results.reduce(
      (sum, res) => sum + (res.availableMatches ?? 0),
      0
    );
    const requirementMet = results.some((res) => res.requirementMet);
    const messageParts: string[] = [
      `Checked ${group.stores.length} ${
        group.stores.length === 1 ? "store" : "stores"
      }.`,
    ];

    if (totalMatches > 0) {
      messageParts.push(
        `Matched ${totalMatches} ${
          totalMatches === 1 ? "deal" : "deals"
        } across ${results.length} ${
          results.length === 1 ? "store" : "stores"
        }.`
      );
    } else {
      messageParts.push("No matching Tweedekansje deals found right now.");
    }

    if (requirementMet) {
      messageParts.push("Requirement met.");
    }

    if (failedStores.length > 0) {
      messageParts.push(
        `Failed to check ${failedStores.length} ${
          failedStores.length === 1 ? "store" : "stores"
        }: ${failedStores.join(", ")}.`
      );
    }

    const statusMessage = messageParts.join(" ");
    const statusType: WatchStatus["type"] =
      requirementMet || failedStores.length > 0 ? (requirementMet ? "success" : "error") : undefined;

    setWatchStatuses((prev) => ({
      ...prev,
      [key]: {
        isChecking: false,
        message: statusMessage,
        type: statusType,
      },
    }));
  };


  return (
    <main className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Manage Your Watches</h1>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Watches</CardTitle>
            <CardDescription>
              View and manage the IKEA article numbers you are tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!loading && !user && (
              <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                <AlertDescription className="flex items-center justify-between gap-4">
                  <span>
                    Please sign in to access your watches.
                  </span>
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
                  Please verify <strong>{user.email}</strong> via the link in your inbox before managing watches.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <Button
                onClick={handleCheckAllProducts}
                disabled={
                  isCheckingAll || !user || !isVerified || watches.length === 0
                }
              >
                {isCheckingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking all products...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Check all products
                  </>
                )}
              </Button>
              {user && (
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <p>
                    Signed in as <span className="font-medium">{user.email}</span>
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => supabase.auth.signOut()}
                  >
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Watches List */}
        {hasLoaded && user && isVerified && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {watches.length > 0
                ? `Active Watches (${watches.length})`
                : "No Active Watches"}
            </h2>

            {checkAllMessage && (
              <Alert>
                <AlertDescription>{checkAllMessage}</AlertDescription>
              </Alert>
            )}

            {watches.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No active watches found for this email address.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {watches.map((group) => {
                  const preview = articlePreviews[group.article_number];
                  const displayName =
                    preview?.name ?? `Article ${group.article_number}`;

                  return (
                    <Card key={group.article_number}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          {preview?.imageUrl && (
                            <div className="h-16 w-16 overflow-hidden rounded border border-border">
                              <Image
                                src={preview.imageUrl}
                                width={64}
                                height={64}
                                alt={preview.name ?? "Product image"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{displayName}</h3>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Article {group.article_number}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                <span className="font-medium">Minimum quantity:</span>{" "}
                                {group.desired_quantity ?? 1}
                              </p>
                              <p>
                                <span className="font-medium">Created:</span>{" "}
                                {new Date(group.created_at).toLocaleDateString("nl-NL", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-3">
                          {group.stores.map((store) => (
                            <div
                              key={store.id}
                              className="rounded border p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                            >
                              <div>
                                <p className="font-medium">{store.store_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Added on{" "}
                                  {new Date(store.created_at).toLocaleDateString("nl-NL", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() =>
                                    handleDelete(store.id, group.article_number)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {watchStatuses[group.article_number]?.message && (
                          <Alert
                            variant={
                              watchStatuses[group.article_number]?.type === "error"
                                ? "destructive"
                                : "default"
                            }
                            className="mt-3"
                          >
                            <AlertDescription>
                              {watchStatuses[group.article_number]?.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

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
import { Package, Loader2, Trash2, ArrowLeft, RefreshCcw, LogIn } from 'lucide-react';
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";

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
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [watchStatuses, setWatchStatuses] = useState<Record<string, WatchStatus>>({});
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

      setWatches(((data.data as WatchGroup[]) ?? []));
      setWatchStatuses({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    fetchWatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isVerified, session?.access_token]);

  const handleDelete = async (id: string) => {
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
        delete next[id];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete watch");
    }
  };

  const handleManualCheck = async (
    group: WatchGroup,
    storeWatch: StoreWatch
  ) => {
    setWatchStatuses((prev) => ({
      ...prev,
      [storeWatch.id]: {
        isChecking: true,
      },
    }));

    try {
      const response = await fetch(`/api/watches/${storeWatch.id}/check`, {
        method: "POST",
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check watch");
      }

      const matchCount = Array.isArray(data.matches) ? data.matches.length : 0;
      const notificationsSent =
        typeof data.notificationsSent === "number" ? data.notificationsSent : 0;
      const requiredQuantity =
        typeof data.requiredQuantity === "number"
          ? data.requiredQuantity
          : group.desired_quantity;
      const requirementMet =
        typeof data.requirementMet === "boolean" ? data.requirementMet : false;
      const availableMatches =
        typeof data.availableMatches === "number"
          ? data.availableMatches
          : matchCount;

      let statusMessage = "No matching Tweedekansje deals found right now.";

      if (matchCount > 0) {
        if (!requirementMet) {
          statusMessage = `Found ${availableMatches} matching ${
            availableMatches === 1 ? "deal" : "deals"
          }, but you require at least ${requiredQuantity} item${
            requiredQuantity === 1 ? "" : "s"
          } before alerts are sent.`;
        } else if (notificationsSent > 0) {
          statusMessage = `Found ${availableMatches} matching ${
            availableMatches === 1 ? "deal" : "deals"
          } and sent ${notificationsSent} email alert${
            notificationsSent === 1 ? "" : "s"
          }.`;
        } else {
          statusMessage = `Requirement met with ${availableMatches} matching ${
            availableMatches === 1 ? "deal" : "deals"
          }, but no new alerts were sent.`;
        }
      }

      setWatchStatuses((prev) => ({
        ...prev,
        [storeWatch.id]: {
          isChecking: false,
          message: statusMessage,
          type: requirementMet ? "success" : "error",
        },
      }));
    } catch (err) {
      setWatchStatuses((prev) => ({
        ...prev,
        [storeWatch.id]: {
          isChecking: false,
          message:
            err instanceof Error ? err.message : "Failed to check watch",
          type: "error",
        },
      }));
    }
  };


  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-900">Manage Your Watches</h1>
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
              <Button onClick={fetchWatches} disabled={isLoading || !user || !isVerified}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  "Refresh Watches"
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
                {watches.map((group) => (
                  <Card key={group.article_number}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            Article {group.article_number}
                          </h3>
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
                                variant="secondary"
                                size="sm"
                                onClick={() => handleManualCheck(group, store)}
                                disabled={watchStatuses[store.id]?.isChecking}
                              >
                                {watchStatuses[store.id]?.isChecking ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Check now
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDelete(store.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {watchStatuses[store.id]?.message && (
                              <Alert
                                variant={
                                  watchStatuses[store.id]?.type === "error"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                <AlertDescription>
                                  {watchStatuses[store.id]?.message}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

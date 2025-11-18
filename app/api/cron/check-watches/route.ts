import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  computeWatchMatches,
  computeFuelInfo,
  type WatchRecord,
  type ProfileInfo,
} from "@/lib/watch-check";
import { IKEA_STORES, type IkeaStoreId } from "@/lib/ikea-stores";
import { sendStoreSummaryAlert } from "@/lib/email";
import { fetchIkeaDeals } from "@/lib/ikea-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const url = new URL(request.url);
      const provided =
        url.searchParams.get("secret") ||
        request.headers.get("x-cron-secret") ||
        undefined;

      if (provided !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabase = await createClient();

    const { data: watches, error: watchesError } = await supabase
      .from("watches")
      .select(
        "id,email,store_id,store_name,desired_quantity,article_number:product_name,is_active"
      )
      .eq("is_active", true);

    if (watchesError) {
      console.error("[v0] Cron: error fetching watches:", watchesError);
      return NextResponse.json(
        { error: "Failed to load watches" },
        { status: 500 }
      );
    }

    const activeWatches = (watches ?? []) as WatchRecord[];

    if (activeWatches.length === 0) {
      return NextResponse.json(
        { message: "No active watches to process", totalActiveWatches: 0 },
        { status: 200 }
      );
    }

    const uniqueEmails = Array.from(
      new Set(activeWatches.map((w) => w.email).filter(Boolean))
    );

    const profilesByEmail: Record<string, ProfileInfo> = {};

    if (uniqueEmails.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "email, address_lat, address_lng, gas_usage, fuel_price"
        )
        .in("email", uniqueEmails);

      if (profilesError) {
        console.error("[v0] Cron: error fetching profiles:", profilesError);
      } else {
        for (const profile of profiles ?? []) {
          if (profile.email) {
            profilesByEmail[profile.email] = profile;
          }
        }
      }
    }

    // Group watches by (email, store_id) so we can send
    // one aggregated email per store per user.
    const watchesByEmailAndStore = new Map<string, WatchRecord[]>();

    for (const watch of activeWatches) {
      const key = `${watch.email}::${watch.store_id}`;
      const group = watchesByEmailAndStore.get(key);
      if (group) {
        group.push(watch);
      } else {
        watchesByEmailAndStore.set(key, [watch]);
      }
    }

    let totalNotificationsSent = 0;
    let totalMatches = 0;

    const perWatchResults: Array<{
      watchId: string;
      email: string;
      storeId: string;
      storeName: string;
      availableMatches: number;
      notificationsPlanned: number;
      requirementMet: boolean;
    }> = [];

    const productsByStoreId: Record<string, any[]> = {};

    for (const [key, groupWatches] of watchesByEmailAndStore.entries()) {
      const example = groupWatches[0];
      const email = example.email;
      const storeId = example.store_id;
      const storeName = example.store_name;
      const profile =
        (email ? profilesByEmail[email] : undefined) ?? undefined;
      const storeMeta = IKEA_STORES[storeId as IkeaStoreId];

      try {
        let products = productsByStoreId[storeId];
        if (!products) {
          // Fetch once per store for this cron run.
          products = await fetchIkeaDeals(storeId);
          productsByStoreId[storeId] = products;
        }

        const plannedNotifications: Array<{
          watch_id: string;
          product_name: string;
          product_price: number;
          product_image?: string;
          ikea_product_id: string;
        }> = [];

        const aggregatedProducts: Array<{
          name: string;
          price: number;
          originalPrice?: number;
          imageUrl?: string;
        }> = [];

        const seenProductIds = new Set<string>();

        for (const watch of groupWatches) {
          const {
            matches,
            unsentMatches,
            requiredQuantity,
          } = await computeWatchMatches(supabase, watch, { products });

          const requirementMet = matches.length >= requiredQuantity;
          totalMatches += matches.length;

          let notificationsPlanned = 0;

          if (unsentMatches.length >= requiredQuantity) {
            const toNotify = unsentMatches.slice(0, requiredQuantity);

            for (const product of toNotify) {
              if (!seenProductIds.has(product.id)) {
                aggregatedProducts.push({
                  name: product.name,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  imageUrl: product.imageUrl,
                });
                seenProductIds.add(product.id);
              }

              plannedNotifications.push({
                watch_id: watch.id,
                product_name: product.name,
                product_price: product.price,
                product_image: product.imageUrl,
                ikea_product_id: product.id,
              });

              notificationsPlanned += 1;
            }
          }

          perWatchResults.push({
            watchId: watch.id,
            email,
            storeId,
            storeName,
            availableMatches: matches.length,
            notificationsPlanned,
            requirementMet,
          });
        }

        if (aggregatedProducts.length === 0 || !email) {
          continue;
        }

        const fuelInfo = await computeFuelInfo(
          profile ?? null,
          storeMeta?.lat,
          storeMeta?.lng
        );

        const emailSent = await sendStoreSummaryAlert({
          to: email,
          storeName,
          storeAddress: storeMeta?.address,
          distanceKm: fuelInfo?.distanceKm,
          fuelCost: fuelInfo?.fuelCost,
          fuelPricePerLiter: fuelInfo?.fuelPricePerLiter,
          fuelUsage: fuelInfo?.fuelUsage,
          products: aggregatedProducts,
        });

        if (emailSent && plannedNotifications.length > 0) {
          const { error: insertError } = await supabase
            .from("notifications")
            .insert(plannedNotifications);

          if (insertError) {
            console.error(
              "[v0] Cron: failed to insert notifications:",
              insertError
            );
          } else {
            totalNotificationsSent += plannedNotifications.length;
          }
        }
      } catch (error) {
        console.error(
          `[v0] Cron: error checking watches for key ${key}:`,
          error
        );
      }
    }

    return NextResponse.json(
      {
        message: "Cron check completed",
        totalActiveWatches: activeWatches.length,
        totalMatches,
        totalNotificationsSent,
        results: perWatchResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Error in GET /api/cron/check-watches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

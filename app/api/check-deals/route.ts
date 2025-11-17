import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchIkeaDeals,
  matchArticleNumber,
  matchLegacyProductName,
} from "@/lib/ikea-api";
import { sendProductAlert } from "@/lib/email";
import { IKEA_STORES, IkeaStoreId } from "@/lib/ikea-stores";
import { getDrivingDistanceKm } from "@/lib/distance";

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron job request (optional security)
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[v0] Starting deal check job...");

    const supabase = await createClient();
    const profileCache = new Map<
      string,
      {
        address_lat: number | null;
        address_lng: number | null;
        gas_usage: number | null;
        fuel_price: number | null;
      } | null
    >();

    const getProfile = async (email: string) => {
      if (profileCache.has(email)) {
        return profileCache.get(email) || null;
      }

      const { data } = await supabase
        .from("profiles")
        .select("address_lat, address_lng, gas_usage, fuel_price")
        .eq("email", email)
        .maybeSingle();

      profileCache.set(email, data ?? null);
      return data ?? null;
    };

    const fuelInfoCache = new Map<
      string,
      Promise<{
        fuelCost: number;
        distanceKm: number;
        fuelPricePerLiter: number;
        litersUsed: number;
        fuelUsage: number;
      } | null>
    >();

    const getFuelInfo = async (
      email: string,
      storeId: string
    ): Promise<{
      fuelCost: number;
      distanceKm: number;
      fuelPricePerLiter: number;
      litersUsed: number;
      fuelUsage: number;
    } | null> => {
      const cacheKey = `${email}:${storeId}`;
      if (fuelInfoCache.has(cacheKey)) {
        return fuelInfoCache.get(cacheKey)!;
      }

      const promise = (async () => {
        const profile = await getProfile(email);
        if (
          !profile ||
          !profile.address_lat ||
          !profile.address_lng ||
          !profile.gas_usage ||
          profile.gas_usage <= 0
        ) {
          return null;
        }

        const store = IKEA_STORES[storeId as IkeaStoreId];
        if (!store) {
          return null;
        }

        const oneWayKm = await getDrivingDistanceKm(
          profile.address_lat,
          profile.address_lng,
          store.lat,
          store.lng
        );
        const roundTripKm = oneWayKm * 2;
        const litersUsed = (roundTripKm * profile.gas_usage) / 100;
        const fuelPrice =
          profile.fuel_price && profile.fuel_price > 0
            ? profile.fuel_price
            : 2;
        const fuelCost = litersUsed * fuelPrice;

        return {
          fuelCost,
          distanceKm: roundTripKm,
          fuelPricePerLiter: fuelPrice,
          litersUsed,
          fuelUsage: profile.gas_usage,
        };
      })();

      fuelInfoCache.set(cacheKey, promise);
      return promise;
    };

    // Fetch all active watches
    const { data: watches, error: watchError } = await supabase
      .from("watches")
      .select(
        "id,email,store_id,store_name,created_at,is_active,desired_quantity,article_number:product_name"
      )
      .eq("is_active", true);

    if (watchError) {
      console.error("[v0] Error fetching watches:", watchError);
      return NextResponse.json({ error: "Failed to fetch watches" }, { status: 500 });
    }

    if (!watches || watches.length === 0) {
      console.log("[v0] No active watches found");
      return NextResponse.json({ message: "No active watches", notificationsSent: 0 });
    }

    console.log(`[v0] Found ${watches.length} active watches`);

    // Group watches by store to minimize API calls
    const watchesByStore = watches.reduce((acc, watch) => {
      if (!acc[watch.store_id]) {
        acc[watch.store_id] = [];
      }
      acc[watch.store_id].push(watch);
      return acc;
    }, {} as Record<string, typeof watches>);

    let totalNotifications = 0;

    // Process each store
    for (const [storeId, storeWatches] of Object.entries(watchesByStore)) {
      console.log(`[v0] Checking store ${storeId} with ${storeWatches.length} watches`);

      // Fetch deals for this store
      const products = await fetchIkeaDeals(storeId);

      if (products.length === 0) {
        console.log(`[v0] No products found for store ${storeId}`);
        continue;
      }

      // Check each watch against products
      for (const watch of storeWatches) {
        const matchingProducts = products.filter((product) => {
          const matchedByArticle = matchArticleNumber(
            watch.article_number,
            product.articleNumbers
          );
          const matchedByName =
            !matchedByArticle &&
            matchLegacyProductName(watch.article_number, product.name);

          return matchedByArticle || matchedByName;
        });

        if (matchingProducts.length === 0) {
          continue;
        }

        const requiredQuantity = watch.desired_quantity ?? 1;
        const newMatches = [];

        for (const product of matchingProducts) {
          const { data: existingNotification } = await supabase
            .from("notifications")
            .select("id")
            .eq("watch_id", watch.id)
            .eq("ikea_product_id", product.id)
            .maybeSingle();

          if (!existingNotification) {
            newMatches.push(product);
          }
        }

        if (newMatches.length < requiredQuantity) {
          console.log(
            `[v0] Watch ${watch.id} requires ${requiredQuantity} matches, found ${newMatches.length}.`
          );
          continue;
        }

        for (const product of newMatches.slice(0, requiredQuantity)) {
          const fuelInfo = await getFuelInfo(watch.email, watch.store_id);
          const storeMeta = IKEA_STORES[watch.store_id as IkeaStoreId];

          const emailSent = await sendProductAlert({
            to: watch.email,
            productName: product.name,
            productPrice: product.price,
            storeName: watch.store_name,
            productImage: product.imageUrl,
            watchId: watch.id,
            originalPrice: product.originalPrice,
            distanceKm: fuelInfo?.distanceKm,
            fuelCost: fuelInfo?.fuelCost,
            fuelPricePerLiter: fuelInfo?.fuelPricePerLiter,
            fuelUsage: fuelInfo?.fuelUsage,
            storeAddress: storeMeta?.address,
          });

          if (emailSent) {
            await supabase.from("notifications").insert({
              watch_id: watch.id,
              product_name: product.name,
              product_price: product.price,
              product_image: product.imageUrl,
              ikea_product_id: product.id,
            });

            totalNotifications++;
            console.log(
              `[v0] Notification sent for watch ${watch.id} (requirement ${requiredQuantity}).`
            );
          }
        }
      }
    }

    console.log(`[v0] Deal check job complete. Sent ${totalNotifications} notifications`);

    return NextResponse.json({
      message: "Deal check complete",
      watchesChecked: watches.length,
      notificationsSent: totalNotifications,
    });
  } catch (error) {
    console.error("[v0] Error in check-deals job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  checkStoreWatches,
  type WatchRecord,
  type ProfileInfo,
} from "@/lib/watch-check";
import { fetchIkeaDeals, type IkeaProduct } from "@/lib/ikea-api";

export const dynamic = "force-dynamic";
const CRON_TEMP_DISABLED = process.env.CRON_TEMP_DISABLED === "true";

type CronStoreResult = {
  email: string;
  storeId: string;
  storeName: string;
  watches: number;
  availableMatches: number;
  newMatchesAvailable: number;
  notificationsSent: number;
};

export async function GET(request: NextRequest) {
  try {
    if (CRON_TEMP_DISABLED) {
      return NextResponse.json(
        { message: "Cron check temporarily disabled" },
        { status: 503 }
      );
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

    const activeWatches = ((watches ?? []) as WatchRecord[]).filter(
      (watch) => Boolean(watch.email)
    );

    if (activeWatches.length === 0) {
      return NextResponse.json(
        { message: "No active watches to process", totalActiveWatches: 0 },
        { status: 200 }
      );
    }

    const uniqueEmails = Array.from(
      new Set(
        activeWatches
          .map((w) => w.email)
          .filter((email): email is string => Boolean(email))
      )
    );

    const profilesByEmail: Record<string, ProfileInfo> = {};

    if (uniqueEmails.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("email, address_lat, address_lng, gas_usage, fuel_price")
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

    const storeProductCache = new Map<string, IkeaProduct[]>();
    const cronResults: CronStoreResult[] = [];
    let totalNotificationsSent = 0;
    let totalMatches = 0;

    for (const [key, groupWatches] of watchesByEmailAndStore.entries()) {
      const example = groupWatches[0];
      const email = example?.email;

      if (!email) {
        continue;
      }

      try {
        let products = storeProductCache.get(example.store_id);
        if (!products) {
          products = await fetchIkeaDeals(example.store_id);
          storeProductCache.set(example.store_id, products);
        }

        const result = await checkStoreWatches(
          supabase,
          groupWatches,
          profilesByEmail[email] ?? undefined,
          { products }
        );

        totalMatches += result.availableMatches;
        totalNotificationsSent += result.notificationsSent;

        cronResults.push({
          email,
          storeId: result.storeId,
          storeName: result.storeName,
          watches: groupWatches.length,
          availableMatches: result.availableMatches,
          newMatchesAvailable: result.newMatchesAvailable,
          notificationsSent: result.notificationsSent,
        });
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
        processedGroups: cronResults.length,
        results: cronResults,
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

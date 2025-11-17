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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const supabase = await createClient();
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: watch, error: watchError } = await supabase
      .from("watches")
      .select(
        "id,email,store_id,store_name,created_at,is_active,desired_quantity,article_number:product_name"
      )
      .eq("id", id)
      .eq("email", user.email)
      .eq("is_active", true)
      .single();

    if (watchError || !watch) {
      return NextResponse.json({ error: "Watch not found" }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("address_lat, address_lng, gas_usage, fuel_price")
      .eq("user_id", user.id)
      .maybeSingle();

    const storeMeta = IKEA_STORES[watch.store_id as IkeaStoreId];

    const computeFuelInfo = async () => {
      if (
        !profile ||
        !profile.address_lat ||
        !profile.address_lng ||
        !profile.gas_usage ||
        profile.gas_usage <= 0 ||
        !storeMeta
      ) {
        return null;
      }

      const oneWayKm = await getDrivingDistanceKm(
        profile.address_lat,
        profile.address_lng,
        storeMeta.lat,
        storeMeta.lng
      );
      const roundTripKm = oneWayKm * 2;
      const litersUsed = (roundTripKm * profile.gas_usage) / 100;
      const fuelPrice =
        profile.fuel_price && profile.fuel_price > 0 ? profile.fuel_price : 2;
      const fuelCost = litersUsed * fuelPrice;

      return {
        fuelCost,
        distanceKm: roundTripKm,
        fuelPricePerLiter: fuelPrice,
        fuelUsage: profile.gas_usage,
      };
    };

    const fuelInfo = await computeFuelInfo();

    const products = await fetchIkeaDeals(watch.store_id);
    const matches: Array<{
      id: string;
      name: string;
      price: number;
      imageUrl?: string;
    }> = [];
    let notificationsSent = 0;
    const unsentMatches: typeof matches = [];
    const requiredQuantity = watch.desired_quantity ?? 1;

    for (const product of products) {
      const matchedByArticle = matchArticleNumber(
        watch.article_number,
        product.articleNumbers
      );
      const matchedByName =
        !matchedByArticle &&
        matchLegacyProductName(watch.article_number, product.name);

      if (!matchedByArticle && !matchedByName) {
        continue;
      }

      matches.push(product);

      const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("watch_id", watch.id)
        .eq("ikea_product_id", product.id)
        .maybeSingle();

      if (!existingNotification) {
        unsentMatches.push(product);
      }
    }

    const requirementMet = matches.length >= requiredQuantity;

    if (unsentMatches.length >= requiredQuantity) {
      for (const product of unsentMatches.slice(0, requiredQuantity)) {
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
          notificationsSent++;
        }
      }
    }

    return NextResponse.json(
      {
        watchId: watch.id,
        matches,
        notificationsSent,
        productsChecked: products.length,
        requiredQuantity,
        requirementMet,
        availableMatches: matches.length,
        newMatchesAvailable: unsentMatches.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Error in POST /api/watches/[id]/check:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

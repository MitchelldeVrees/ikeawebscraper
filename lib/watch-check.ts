import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchIkeaDeals,
  matchArticleNumber,
  matchLegacyProductName,
  type IkeaProduct,
} from "@/lib/ikea-api";
import { sendStoreSummaryAlert } from "@/lib/email";
import { IKEA_STORES, type IkeaStoreId } from "@/lib/ikea-stores";
import { getDrivingDistanceKm } from "@/lib/distance";

export interface WatchRecord {
  id: string;
  email: string;
  store_id: string;
  store_name: string;
  desired_quantity?: number | null;
  article_number: string;
}

export interface ProfileInfo {
  email?: string | null;
  address_lat?: number | null;
  address_lng?: number | null;
  gas_usage?: number | null;
  fuel_price?: number | null;
}

export interface CheckWatchResult {
  watchId: string;
  matches: IkeaProduct[];
  notificationsSent: number;
  productsChecked: number;
  requiredQuantity: number;
  requirementMet: boolean;
  availableMatches: number;
  newMatchesAvailable: number;
}

export interface WatchMatchComputation {
  products: IkeaProduct[];
  matches: IkeaProduct[];
  unsentMatches: IkeaProduct[];
  requiredQuantity: number;
}

export interface FuelInfo {
  fuelCost: number;
  distanceKm: number;
  fuelPricePerLiter: number;
  fuelUsage: number;
}

export async function computeFuelInfo(
  profile: ProfileInfo | null | undefined,
  storeLat?: number,
  storeLng?: number
): Promise<FuelInfo | null> {
  if (
    !profile ||
    !profile.address_lat ||
    !profile.address_lng ||
    !profile.gas_usage ||
    profile.gas_usage <= 0 ||
    typeof storeLat !== "number" ||
    typeof storeLng !== "number"
  ) {
    return null;
  }

  const oneWayKm = await getDrivingDistanceKm(
    profile.address_lat,
    profile.address_lng,
    storeLat,
    storeLng
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
}

export async function computeWatchMatches(
  supabase: SupabaseClient,
  watch: WatchRecord,
  options?: { products?: IkeaProduct[] }
): Promise<WatchMatchComputation> {
  const requiredQuantity =
    watch.desired_quantity && watch.desired_quantity > 0
      ? watch.desired_quantity
      : 1;

  const products =
    options?.products ?? (await fetchIkeaDeals(watch.store_id));

  const matches: IkeaProduct[] = [];
  const unsentMatches: IkeaProduct[] = [];

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

  return {
    products,
    matches,
    unsentMatches,
    requiredQuantity,
  };
}

export async function checkWatchAndNotify(
  supabase: SupabaseClient,
  watch: WatchRecord,
  profile?: ProfileInfo | null
): Promise<CheckWatchResult> {
  const storeMeta = IKEA_STORES[watch.store_id as IkeaStoreId];

  const fuelInfo = await computeFuelInfo(profile ?? null, storeMeta?.lat, storeMeta?.lng);

  const { products, matches, unsentMatches, requiredQuantity } =
    await computeWatchMatches(supabase, watch);

  let notificationsSent = 0;
  const requirementMet = matches.length >= requiredQuantity;

  if (unsentMatches.length >= requiredQuantity) {
    const aggregatedProducts: Array<{
      name: string;
      price: number;
      originalPrice?: number;
      imageUrl?: string;
    }> = [];
    const plannedNotifications: Array<{
      watch_id: string;
      product_name: string;
      product_price: number;
      product_image?: string;
      ikea_product_id: string;
    }> = [];
    const seenProductIds = new Set<string>();
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
    }

    if (aggregatedProducts.length > 0 && watch.email) {
      const emailSent = await sendStoreSummaryAlert({
        to: watch.email,
        storeName: watch.store_name,
        storeAddress: storeMeta?.address,
        distanceKm: fuelInfo?.distanceKm ?? undefined,
        fuelCost: fuelInfo?.fuelCost ?? undefined,
        fuelPricePerLiter: fuelInfo?.fuelPricePerLiter ?? undefined,
        fuelUsage: fuelInfo?.fuelUsage ?? undefined,
        products: aggregatedProducts,
      });

      if (emailSent && plannedNotifications.length > 0) {
        const { error } = await supabase
          .from("notifications")
          .insert(plannedNotifications);

        if (error) {
          console.error("[v0] Error inserting notifications:", error);
        } else {
          notificationsSent = plannedNotifications.length;
        }
      }
    }
  }

  return {
    watchId: watch.id,
    matches,
    notificationsSent,
    productsChecked: products.length,
    requiredQuantity,
    requirementMet,
    availableMatches: matches.length,
    newMatchesAvailable: unsentMatches.length,
  };
}

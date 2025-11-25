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
  desiredCount: number;
  requirementMet: boolean;
  availableMatches: number;
  newMatchesAvailable: number;
}

export interface WatchMatchComputation {
  products: IkeaProduct[];
  matches: IkeaProduct[];
  unsentMatches: IkeaProduct[];
  desiredCount: number;
}

export interface FuelInfo {
  fuelCost: number;
  distanceKm: number;
  fuelPricePerLiter: number;
  fuelUsage: number;
}

interface AggregatedEmailProduct {
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
}

export interface StoreCheckResult {
  storeId: string;
  storeName: string;
  productsChecked: number;
  availableMatches: number;
  newMatchesAvailable: number;
  requirementMet: boolean;
  notificationsSent: number;
  matches: AggregatedEmailProduct[];
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

type ComputeWatchMatchesOptions = {
  products?: IkeaProduct[];
  skipNotificationCheck?: boolean;
};

export async function computeWatchMatches(
  supabase: SupabaseClient,
  watch: WatchRecord,
  options?: ComputeWatchMatchesOptions
): Promise<WatchMatchComputation> {
  const desiredCount =
    watch.desired_quantity && watch.desired_quantity > 0
      ? watch.desired_quantity
      : 1;

  const products =
    options?.products ?? (await fetchIkeaDeals(watch.store_id));
  const skipNotificationCheck = options?.skipNotificationCheck ?? false;

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

    if (skipNotificationCheck) {
      unsentMatches.push(product);
      continue;
    }

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
    desiredCount,
  };
}

type CheckStoreWatchesOptions = {
  skipNotificationCheck?: boolean;
};

export async function checkStoreWatches(
  supabase: SupabaseClient,
  watches: WatchRecord[],
  profile?: ProfileInfo | null,
  options?: CheckStoreWatchesOptions
): Promise<StoreCheckResult> {
  if (watches.length === 0) {
    return {
      storeId: "",
      storeName: "",
      productsChecked: 0,
      availableMatches: 0,
      newMatchesAvailable: 0,
      requirementMet: false,
      notificationsSent: 0,
      matches: [],
    };
  }

  const storeId = watches[0].store_id;
  const storeName = watches[0].store_name;
  const storeMeta = IKEA_STORES[storeId as IkeaStoreId];

  const products = await fetchIkeaDeals(storeId);
  const plannedNotifications: Array<{
    watch_id: string;
    product_name: string;
    product_price: number;
    product_image?: string;
    ikea_product_id: string;
  }> = [];
  const aggregatedProducts: AggregatedEmailProduct[] = [];
  const seenProductIds = new Set<string>();
  let totalMatches = 0;
  let requirementMet = false;
  const skipNotificationCheck = options?.skipNotificationCheck ?? false;

  for (const watch of watches) {
    const { matches, unsentMatches, desiredCount } =
      await computeWatchMatches(supabase, watch, {
        products,
        skipNotificationCheck,
      });

    const cappedMatches = matches.slice(0, desiredCount);
    const cappedUnsentMatches = unsentMatches.slice(0, desiredCount);

    totalMatches += cappedMatches.length;
    if (cappedMatches.length > 0) {
      requirementMet = true;
    }

    if (cappedUnsentMatches.length > 0) {
      const toNotify = cappedUnsentMatches;

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
    }
  }

  let notificationsSent = 0;
  if (aggregatedProducts.length > 0 && watches[0].email) {
    const fuelInfo = await computeFuelInfo(
      profile ?? null,
      storeMeta?.lat,
      storeMeta?.lng
    );

    const emailSent = await sendStoreSummaryAlert({
      to: watches[0].email,
      storeName,
      storeAddress: storeMeta?.address,
      distanceKm: fuelInfo?.distanceKm,
      fuelCost: fuelInfo?.fuelCost,
      fuelPricePerLiter: fuelInfo?.fuelPricePerLiter,
      fuelUsage: fuelInfo?.fuelUsage,
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

  return {
    storeId,
    storeName,
    productsChecked: products.length,
    availableMatches: totalMatches,
    newMatchesAvailable: aggregatedProducts.length,
    requirementMet,
    notificationsSent,
    matches: aggregatedProducts,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchIkeaDeals, matchProductName } from "@/lib/ikea-api";
import { sendProductAlert } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron job request (optional security)
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[v0] Starting deal check job...");

    const supabase = await createClient();

    // Fetch all active watches
    const { data: watches, error: watchError } = await supabase
      .from("watches")
      .select("*")
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
        for (const product of products) {
          // Check if product name matches
          if (matchProductName(watch.product_name, product.name)) {
            console.log(`[v0] Match found: ${product.name} for watch ${watch.id}`);

            // Check if we've already sent a notification for this product
            const { data: existingNotification } = await supabase
              .from("notifications")
              .select("id")
              .eq("watch_id", watch.id)
              .eq("ikea_product_id", product.id)
              .single();

            if (existingNotification) {
              console.log(`[v0] Notification already sent for this product`);
              continue;
            }

            // Send email
            const emailSent = await sendProductAlert({
              to: watch.email,
              productName: product.name,
              productPrice: product.price,
              storeName: watch.store_name,
              productImage: product.imageUrl,
              watchId: watch.id,
            });

            if (emailSent) {
              // Record notification
              await supabase.from("notifications").insert({
                watch_id: watch.id,
                product_name: product.name,
                product_price: product.price,
                product_image: product.imageUrl,
                ikea_product_id: product.id,
              });

              totalNotifications++;
              console.log(`[v0] Notification sent successfully`);
            }
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

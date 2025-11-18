import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkWatchAndNotify } from "@/lib/watch-check";

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
      .select("email, address_lat, address_lng, gas_usage, fuel_price")
      .eq("user_id", user.id)
      .maybeSingle();

    const result = await checkWatchAndNotify(supabase, watch, profile ?? undefined);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[v0] Error in POST /api/watches/[id]/check:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

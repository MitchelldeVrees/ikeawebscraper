import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productName, storeId, storeName } = body;

    // Validate input
    if (!email || !productName || !storeId || !storeName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert the watch
    const { data, error } = await supabase
      .from("watches")
      .insert({
        email,
        product_name: productName,
        store_id: storeId,
        store_name: storeName,
      })
      .select()
      .single();

    if (error) {
      console.error("[v0] Error creating watch:", error);
      return NextResponse.json(
        { error: "Failed to create watch" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[v0] Error in POST /api/watches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("watches")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[v0] Error fetching watches:", error);
      return NextResponse.json(
        { error: "Failed to fetch watches" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("[v0] Error in GET /api/watches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

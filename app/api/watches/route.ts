import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyArticleExists } from "@/lib/ikea-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      articleNumber,
      stores,
      storeId,
      storeName,
      desiredQuantity = 1,
    } = body;
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;

    const storeEntries: Array<{ id: string; name: string }> = Array.isArray(
      stores
    )
      ? stores.filter(
          (store: any) =>
            store &&
            typeof store.id === "string" &&
            store.id &&
            typeof store.name === "string" &&
            store.name
        )
      : [];

      
    if (storeEntries.length === 0) {
      if (!storeId || !storeName) {
        return NextResponse.json(
          { error: "Select at least one IKEA store" },
          { status: 400 }
        );
      }
      storeEntries.push({ id: String(storeId), name: String(storeName) });
    }

    if (!articleNumber) {
      return NextResponse.json(
        { error: "Article number is required" },
        { status: 400 }
      );
    }

    const normalizedArticleNumber = String(articleNumber).replace(/\D/g, "");

    if (normalizedArticleNumber.length !== 8) {
      return NextResponse.json(
        { error: "Article number must contain 8 digits" },
        { status: 400 }
      );
    }

    const normalizedDesiredQuantity = Math.max(
      1,
      Number.isFinite(Number(desiredQuantity))
        ? Math.floor(Number(desiredQuantity))
        : 1
    );

    const exists = await verifyArticleExists(
      normalizedArticleNumber,
      request.headers.get("user-agent") ?? undefined
    );

    if (!exists) {
      return NextResponse.json(
        { error: "This IKEA article number does not exist" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Please verify your email address before creating watches." },
        { status: 403 }
      );
    }

    const uniqueStores: Array<{ id: string; name: string }> = [];
    const seenStoreIds = new Set<string>();

    for (const entry of storeEntries) {
      if (seenStoreIds.has(entry.id)) continue;
      seenStoreIds.add(entry.id);
      uniqueStores.push(entry);
    }

    const insertPayload = uniqueStores.map(({ id, name }) => ({
      email: user.email,
      product_name: normalizedArticleNumber,
      store_id: id,
      store_name: name,
      desired_quantity: normalizedDesiredQuantity,
    }));

    const { data, error } = await supabase
      .from("watches")
      .insert(insertPayload)
      .select(
        "id,email,store_id,store_name,created_at,is_active,desired_quantity,article_number:product_name"
      );

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

    const { data, error } = await supabase
      .from("watches")
      .select(
        "id,email,store_id,store_name,created_at,is_active,desired_quantity,article_number:product_name"
      )
      .eq("email", user.email)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[v0] Error fetching watches:", error);
      return NextResponse.json(
        { error: "Failed to fetch watches" },
        { status: 500 }
      );
    }

    const grouped = Object.values(
      (data ?? []).reduce((acc, watch) => {
        const key = watch.article_number;
        if (!acc[key]) {
          acc[key] = {
            article_number: watch.article_number,
            created_at: watch.created_at,
            desired_quantity: watch.desired_quantity,
            stores: [],
          };
        }

        acc[key].stores.push({
          id: watch.id,
          store_id: watch.store_id,
          store_name: watch.store_name,
          created_at: watch.created_at,
        });

        return acc;
      }, {} as Record<string, {
        article_number: string;
        created_at: string;
        desired_quantity: number;
        stores: Array<{
          id: string;
          store_id: string;
          store_name: string;
          created_at: string;
        }>;
      }>)
    );

    return NextResponse.json({ data: grouped }, { status: 200 });
  } catch (error) {
    console.error("[v0] Error in GET /api/watches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const { articleNumber, desiredQuantity } = body ?? {};

    if (!articleNumber) {
      return NextResponse.json(
        { error: "Article number is required" },
        { status: 400 }
      );
    }

    const normalizedArticleNumber = String(articleNumber).replace(/\D/g, "");
    if (normalizedArticleNumber.length !== 8) {
      return NextResponse.json(
        { error: "Article number must contain 8 digits" },
        { status: 400 }
      );
    }

    const normalizedDesiredQuantity = Math.max(
      1,
      Number.isFinite(Number(desiredQuantity))
        ? Math.floor(Number(desiredQuantity))
        : 1
    );

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

    const { error, count } = await supabase
      .from("watches")
      .update({ desired_quantity: normalizedDesiredQuantity })
      .eq("email", user.email)
      .eq("product_name", normalizedArticleNumber)
      .eq("is_active", true)
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("[v0] Error updating desired quantity:", error);
      return NextResponse.json(
        { error: "Failed to update desired quantity" },
        { status: 500 }
      );
    }

    if (!count) {
      return NextResponse.json({ error: "Watch not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        desiredQuantity: normalizedDesiredQuantity,
        updated: count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Error in PATCH /api/watches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const { articleNumber } = body ?? {};

    if (!articleNumber) {
      return NextResponse.json(
        { error: "Article number is required" },
        { status: 400 }
      );
    }

    const normalizedArticleNumber = String(articleNumber).replace(/\D/g, "");
    if (normalizedArticleNumber.length !== 8) {
      return NextResponse.json(
        { error: "Article number must contain 8 digits" },
        { status: 400 }
      );
    }

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

    const { error, count } = await supabase
      .from("watches")
      .delete({ count: "exact" })
      .eq("email", user.email)
      .eq("product_name", normalizedArticleNumber);

    if (error) {
      console.error("[v0] Error deleting watches:", error);
      return NextResponse.json(
        { error: "Failed to delete watches" },
        { status: 500 }
      );
    }

    if (!count) {
      return NextResponse.json({ error: "Watch not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: count }, { status: 200 });
  } catch (error) {
    console.error("[v0] Error in DELETE /api/watches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

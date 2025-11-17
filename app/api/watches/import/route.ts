import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyArticleExists } from "@/lib/ikea-api";

type StorePayload = { id: string; name: string };
type EntryPayload = {
  articleNumber: string;
  desiredQuantity?: number;
  quantity?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { stores, entries } = body as {
      stores?: StorePayload[];
      entries?: EntryPayload[];
    };

    if (!Array.isArray(stores) || stores.length === 0) {
      return NextResponse.json(
        { error: "Select at least one IKEA store" },
        { status: 400 }
      );
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Upload at least one product row" },
        { status: 400 }
      );
    }

    if (entries.length > 200) {
      return NextResponse.json(
        { error: "Limit CSV uploads to 200 rows at a time" },
        { status: 400 }
      );
    }

    const cleanedStores: StorePayload[] = [];
    const seenStores = new Set<string>();

    for (const store of stores) {
      if (
        store &&
        typeof store.id === "string" &&
        store.id.trim() &&
        typeof store.name === "string" &&
        store.name.trim() &&
        !seenStores.has(store.id)
      ) {
        cleanedStores.push({
          id: store.id.trim(),
          name: store.name.trim(),
        });
        seenStores.add(store.id.trim());
      }
    }

    if (cleanedStores.length === 0) {
      return NextResponse.json(
        { error: "No valid IKEA stores provided" },
        { status: 400 }
      );
    }

    const normalizedEntries = entries.map((entry, index) => {
      const cleanedArticle = String(entry?.articleNumber ?? "").replace(
        /\D/g,
        ""
      );

      if (cleanedArticle.length !== 8) {
        throw new Error(
          `Row ${index + 2}: productid must contain 8 digits (received "${entry?.articleNumber}")`
        );
      }

      const desiredQuantity = Math.max(
        1,
        Number.isFinite(Number(entry?.desiredQuantity))
          ? Math.floor(Number(entry?.desiredQuantity))
          : Number.isFinite(Number(entry?.quantity))
          ? Math.floor(Number(entry?.quantity))
          : 1
      );

      if (!Number.isFinite(desiredQuantity) || desiredQuantity < 1) {
        throw new Error(
          `Row ${index + 2}: quantity must be a positive number (received "${entry?.desiredQuantity}")`
        );
      }

      return {
        articleNumber: cleanedArticle,
        desiredQuantity,
      };
    });

    const uniqueArticles = Array.from(
      new Set(normalizedEntries.map((entry) => entry.articleNumber))
    );

    for (const article of uniqueArticles) {
      const exists = await verifyArticleExists(
        article,
        request.headers.get("user-agent") ?? undefined
      );

      if (!exists) {
        return NextResponse.json(
          {
            error: `Product ${article} does not exist on IKEA Tweedekansje. Upload aborted.`,
          },
          { status: 400 }
        );
      }
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

    if (!user.email_confirmed_at) {
      return NextResponse.json(
        {
          error:
            "Please verify your email address before importing product watches.",
        },
        { status: 403 }
      );
    }

    const insertRows: Array<{
      email: string;
      product_name: string;
      store_id: string;
      store_name: string;
      desired_quantity: number;
    }> = [];

    for (const store of cleanedStores) {
      for (const entry of normalizedEntries) {
        insertRows.push({
          email: user.email,
          product_name: entry.articleNumber,
          store_id: store.id,
          store_name: store.name,
          desired_quantity: entry.desiredQuantity,
        });
      }
    }

    const { data, error } = await supabase
      .from("watches")
      .insert(insertRows)
      .select(
        "id,email,store_id,store_name,created_at,is_active,desired_quantity,article_number:product_name"
      );

    if (error) {
      console.error("[v0] Error importing watches:", error);
      return NextResponse.json(
        { error: "Failed to import watches" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Import complete",
        imported: data?.length ?? 0,
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("[v0] Error in POST /api/watches/import:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[v0] Error in POST /api/watches/import:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

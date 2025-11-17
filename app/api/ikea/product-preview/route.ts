import { type NextRequest, NextResponse } from "next/server";
import { fetchProductPreview } from "@/lib/ikea-api";

export async function GET(request: NextRequest) {
  const article = request.nextUrl.searchParams.get("article") ?? "";
  const normalized = article.replace(/\D/g, "");

  if (normalized.length !== 8) {
    return NextResponse.json(
      { error: "Article number must contain 8 digits" },
      { status: 400 }
    );
  }

  try {
    const preview = await fetchProductPreview(
      normalized,
      request.headers.get("user-agent") ?? undefined
    );

    if (!preview) {
      return NextResponse.json(
        { error: "This IKEA article number does not exist" },
        { status: 404 }
      );
    }

    return NextResponse.json({ preview });
  } catch (error) {
    console.error("[v0] GET /api/ikea/product-preview error:", error);
    return NextResponse.json(
      { error: "Unable to fetch product preview" },
      { status: 502 }
    );
  }
}

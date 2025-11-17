import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
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

    const { error, count } = await supabase
      .from("watches")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("email", user.email);

    if (error) {
      console.error("[v0] Error deleting watch:", error);
      return NextResponse.json(
        { error: "Failed to delete watch" },
        { status: 500 }
      );
    }

    if (!count) {
      return NextResponse.json({ error: "Watch not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[v0] Error in DELETE /api/watches/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

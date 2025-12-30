import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function resolveNextPath(rawNext: string | null) {
  if (!rawNext) return "/manage";
  if (!rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return "/manage";
  }
  return rawNext;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = resolveNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth] exchangeCodeForSession error:", error);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  let redirectPath = next;
  if (next === "/welcome") {
    const onboarded = data.session?.user?.user_metadata?.onboarded;
    if (onboarded) {
      redirectPath = "/manage";
    } else {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { onboarded: true },
      });
      if (updateError) {
        console.error("[auth] updateUser onboarded error:", updateError);
      }
    }
  }

  return NextResponse.redirect(`${origin}${redirectPath}`);
}

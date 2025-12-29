import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/contact-email";

export const dynamic = "force-dynamic";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email =
      typeof body?.email === "string" && body.email.trim().length > 0
        ? body.email.trim()
        : "";
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Naam is verplicht." },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Bericht moet minimaal 10 tekens bevatten." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Bericht is te lang. Gebruik maximaal 2000 tekens." },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Voer een geldig e-mailadres in of laat het veld leeg." },
        { status: 400 }
      );
    }

    const sent = await sendContactEmail({
      name,
      replyTo: email || undefined,
      message,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Het bericht kon niet worden verstuurd." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[v0] Error in POST /api/contact:", error);
    return NextResponse.json(
      { error: "Interne fout bij het verzenden van het bericht." },
      { status: 500 }
    );
  }
}

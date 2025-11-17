import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/geocoding";

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

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "street, house_number, city, postal_code, gas_usage, fuel_price, address_lat, address_lng"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    const { count: watchCount } = await supabase
      .from("watches")
      .select("id", { count: "exact", head: true })
      .eq("email", user.email)
      .eq("is_active", true);

    return NextResponse.json(
      {
        email: user.email,
        street: profile?.street ?? "",
        houseNumber: profile?.house_number ?? "",
        city: profile?.city ?? "",
        postalCode: profile?.postal_code ?? "",
        gasUsage: profile?.gas_usage ?? null,
        fuelPrice: profile?.fuel_price ?? null,
        watchCount: watchCount ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Error in GET /api/account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select(
        "street, house_number, city, postal_code, gas_usage, fuel_price, address_lat, address_lng"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    const streetInput =
      typeof body.street === "string" ? body.street.trim() : undefined;
    const houseNumberInput =
      typeof body.houseNumber === "string" ? body.houseNumber.trim() : undefined;
    const cityInput =
      typeof body.city === "string" ? body.city.trim() : undefined;
    const postalCodeInput =
      typeof body.postalCode === "string" ? body.postalCode.trim() : undefined;
    const gasUsageValue =
      typeof body.gasUsage === "number"
        ? body.gasUsage
        : typeof body.gasUsage === "string"
        ? Number(body.gasUsage)
        : undefined;
    const fuelPriceValue =
      typeof body.fuelPrice === "number"
        ? body.fuelPrice
        : typeof body.fuelPrice === "string"
        ? Number(body.fuelPrice)
        : undefined;

    const gasUsage =
      gasUsageValue !== undefined &&
      Number.isFinite(gasUsageValue) &&
      gasUsageValue > 0
        ? gasUsageValue
        : gasUsageValue === undefined
        ? existingProfile?.gas_usage ?? null
        : null;

    const fuelPrice =
      fuelPriceValue !== undefined &&
      Number.isFinite(fuelPriceValue) &&
      fuelPriceValue > 0
        ? fuelPriceValue
        : fuelPriceValue === undefined
        ? existingProfile?.fuel_price ?? null
        : null;

    const finalStreet =
      streetInput !== undefined ? streetInput : existingProfile?.street ?? "";
    const finalHouseNumber =
      houseNumberInput !== undefined
        ? houseNumberInput
        : existingProfile?.house_number ?? "";
    const finalCity =
      cityInput !== undefined ? cityInput : existingProfile?.city ?? "";
    const finalPostalCode =
      postalCodeInput !== undefined
        ? postalCodeInput
        : existingProfile?.postal_code ?? "";
    let lat = existingProfile?.address_lat ?? null;
    let lng = existingProfile?.address_lng ?? null;

    const shouldGeocode =
      streetInput !== undefined ||
      houseNumberInput !== undefined ||
      cityInput !== undefined ||
      postalCodeInput !== undefined;

    if (shouldGeocode) {
      const addressString = [finalStreet, finalHouseNumber, finalCity, finalPostalCode]
        .filter(Boolean)
        .join(", ");

      if (addressString.trim()) {
        const geocoded = await geocodeAddress(addressString);
        if (!geocoded) {
          return NextResponse.json(
            { error: "Unable to locate this address. Please refine it." },
            { status: 400 }
          );
        }
        lat = geocoded.lat;
        lng = geocoded.lng;
      } else {
        lat = null;
        lng = null;
      }
    }

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        email: user.email,
        street: finalStreet,
        house_number: finalHouseNumber,
        city: finalCity,
        postal_code: finalPostalCode,
        gas_usage: gasUsage,
        fuel_price: fuelPrice,
        address_lat: lat,
        address_lng: lng,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      console.error("[v0] Error updating profile:", upsertError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[v0] Error in PUT /api/account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

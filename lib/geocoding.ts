interface GeocodeResult {
  lat: number;
  lng: number;
}

export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const query = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "ikea-tweedekansje-alerts/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Array<{
      lat: string;
      lon: string;
    }>;

    if (!data || data.length === 0) {
      return null;
    }

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }

    return { lat, lng };
  } catch (error) {
    console.error("[v0] Geocoding error:", error);
    return null;
  }
}


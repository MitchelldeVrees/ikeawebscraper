const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export async function getDrivingDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "ikea-tweedekansje-alerts/1.0",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      const route = data?.routes?.[0];
      if (route?.distance) {
        return route.distance / 1000; // convert meters to km
      }
    }
  } catch (error) {
    console.error("[v0] Driving distance fetch error:", error);
  }

  return haversineDistanceKm(lat1, lon1, lat2, lon2);
}

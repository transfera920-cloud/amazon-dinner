// All functions here call the real Google Maps Platform REST APIs.
// None of them fabricate results — a Google API error is thrown and
// surfaced to the client as a real error, never swapped for fake data.

const KEY = () => {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!key) throw new GoogleMapsError('GOOGLE_MAPS_SERVER_KEY 尚未設定', 'MISSING_KEY');
  return key;
};

export class GoogleMapsError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code; // e.g. ZERO_RESULTS, REQUEST_DENIED, OVER_QUERY_LIMIT, MISSING_KEY, NETWORK_ERROR
    this.details = details;
  }
}

async function callGoogle(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new GoogleMapsError('無法連線到 Google Maps 服務', 'NETWORK_ERROR', err.message);
  }
  const data = await res.json();
  return data;
}

// Step 1: resolve the user-typed trailhead name into real coordinates.
export async function geocodeAddress(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&language=zh-TW&key=${KEY()}`;
  const data = await callGoogle(url);

  if (data.status === 'ZERO_RESULTS') {
    throw new GoogleMapsError('找不到這個登山口的地點', 'GEOCODE_ZERO_RESULTS');
  }
  if (data.status !== 'OK') {
    throw new GoogleMapsError(
      `Google 地點解析失敗：${data.status}`,
      data.status,
      data.error_message
    );
  }
  const top = data.results[0];
  return {
    lat: top.geometry.location.lat,
    lng: top.geometry.location.lng,
    formattedAddress: top.formatted_address,
  };
}

// Step 3: search near the trailhead by category/custom keyword.
// radiusMeters is an approximate net-cast radius (capped at 50km, Google's
// own Nearby Search limit) — the REAL filter is the drive-time step below.
export async function nearbySearch({ lat, lng, keyword, radiusMeters }) {
  const cappedRadius = Math.min(radiusMeters, 50000);
  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${lat},${lng}&radius=${cappedRadius}` +
    `&keyword=${encodeURIComponent(keyword)}&language=zh-TW&key=${KEY()}`;
  const data = await callGoogle(url);

  if (data.status === 'ZERO_RESULTS') {
    return [];
  }
  if (data.status !== 'OK') {
    throw new GoogleMapsError(
      `Google 地點搜尋失敗：${data.status}`,
      data.status,
      data.error_message
    );
  }
  return data.results.map((place) => ({
    placeId: place.place_id,
    name: place.name,
    address: place.vicinity,
    rating: place.rating ?? null,
    userRatingsTotal: place.user_ratings_total ?? null,
    openNow: place.opening_hours?.open_now ?? null,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  }));
}

// Step 5's data source: REAL driving time from the trailhead to each
// candidate, via Distance Matrix. Never estimated, never guessed.
// Batches destinations in groups of 25 (Google's per-request limit).
export async function getDriveTimes(origin, destinations) {
  const results = [];
  for (let i = 0; i < destinations.length; i += 25) {
    const batch = destinations.slice(i, i + 25);
    const destParam = batch.map((d) => `${d.lat},${d.lng}`).join('|');
    const url =
      `https://maps.googleapis.com/maps/api/distancematrix/json` +
      `?origins=${origin.lat},${origin.lng}&destinations=${destParam}` +
      `&mode=driving&language=zh-TW&key=${KEY()}`;
    const data = await callGoogle(url);

    if (data.status !== 'OK') {
      throw new GoogleMapsError(
        `Google 路線計算失敗：${data.status}`,
        data.status,
        data.error_message
      );
    }
    const row = data.rows[0];
    batch.forEach((dest, idx) => {
      const element = row.elements[idx];
      if (element.status === 'OK') {
        results.push({
          placeId: dest.placeId,
          driveSeconds: element.duration.value,
          driveText: element.duration.value >= 60
            ? `${Math.round(element.duration.value / 60)} 分鐘`
            : '< 1 分鐘',
        });
      } else {
        // No drivable route found for this one destination — exclude it,
        // don't invent a duration for it.
        results.push({ placeId: dest.placeId, driveSeconds: null, driveText: null });
      }
    });
  }
  return results;
}

export function buildGoogleMapsPlaceUrl(placeId) {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
}

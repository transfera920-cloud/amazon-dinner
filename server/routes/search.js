import { Router } from 'express';
import {
  geocodeAddress,
  nearbySearch,
  getDriveTimes,
  buildGoogleMapsPlaceUrl,
  GoogleMapsError,
} from '../services/googleMaps.js';

const router = Router();

router.post('/', async (req, res) => {
  const { trailhead, keyword, maxMinutes } = req.body || {};

  if (!trailhead || !trailhead.trim()) {
    return res.status(400).json({ error: '請輸入登山口名稱' });
  }
  if (!keyword || !keyword.trim()) {
    return res.status(400).json({ error: '請選擇或輸入搜尋類別' });
  }
  if (!maxMinutes || maxMinutes <= 0) {
    return res.status(400).json({ error: '請選擇車程時間' });
  }

  try {
    // Step 1 + 2: resolve trailhead to real coordinates.
    const origin = await geocodeAddress(trailhead);

    // Approximate net-cast radius for the nearby search, generous enough
    // that real drive-time filtering below won't miss valid results on
    // winding mountain roads. This radius is NEVER the final filter.
    const radiusMeters = Math.min(maxMinutes * 1200, 50000);

    // Step 3 + 4: real nearby search by category/custom keyword.
    const candidates = await nearbySearch({
      lat: origin.lat,
      lng: origin.lng,
      keyword: keyword.trim(),
      radiusMeters,
    });

    if (candidates.length === 0) {
      return res.json({ origin, results: [] });
    }

    // Real drive times from Google, not estimates.
    const driveTimes = await getDriveTimes(
      origin,
      candidates.map((c) => ({ placeId: c.placeId, lat: c.lat, lng: c.lng }))
    );
    const driveTimeByPlace = Object.fromEntries(driveTimes.map((d) => [d.placeId, d]));

    // Step 5: filter by the real drive-time cap, then sort near to far.
    const maxSeconds = maxMinutes * 60;
    const results = candidates
      .map((c) => {
        const dt = driveTimeByPlace[c.placeId];
        return {
          ...c,
          driveSeconds: dt?.driveSeconds ?? null,
          driveText: dt?.driveText ?? null,
          googleMapsUrl: buildGoogleMapsPlaceUrl(c.placeId),
        };
      })
      .filter((c) => c.driveSeconds !== null && c.driveSeconds <= maxSeconds)
      .sort((a, b) => a.driveSeconds - b.driveSeconds);

    res.json({ origin, results });
  } catch (err) {
    if (err instanceof GoogleMapsError) {
      // Real API/geocoding errors are surfaced as-is — never disguised
      // as "no results found", and never papered over with fake data.
      return res.status(502).json({ error: err.message, code: err.code, details: err.details });
    }
    console.error(err);
    res.status(500).json({ error: '伺服器發生未預期的錯誤' });
  }
});

export default router;

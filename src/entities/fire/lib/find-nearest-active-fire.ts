// Finds the active fire nearest to a point, for location alerts: any status except Out (ADR 027, §12.3).
import { computeHaversineDistance } from '@/shared/lib/geo';

import type { Fire, NearestFire } from '../model/fire.types';

// Returns the nearest fire that is not Out with its haversine distance in metres, or null when there is none.
export function findNearestActiveFire(
  fires: readonly Fire[],
  lng: number,
  lat: number,
): NearestFire | null {
  let nearest: NearestFire | null = null;
  for (const fire of fires) {
    if (fire.status === 'Out') {
      continue;
    }
    const distanceM = computeHaversineDistance(lng, lat, fire.lng, fire.lat);
    if (nearest === null || distanceM < nearest.distanceM) {
      nearest = { fire, distanceM };
    }
  }
  return nearest;
}

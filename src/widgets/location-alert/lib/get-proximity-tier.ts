// Picks the location alert tier from the nearest active fire's distance (ADR 027, behaviour §12.3).
import { LOCATION_ALERT } from '@/shared/config';

export type ProximityTier = 'ready-to-leave' | 'prepare' | 'aware';

// Returns the tier for a distance in metres, or null at the outer limit (50 km) and beyond.
export function getProximityTier(distanceM: number): ProximityTier | null {
  if (distanceM < LOCATION_ALERT.READY_TO_LEAVE_UNDER_M) {
    return 'ready-to-leave';
  }
  if (distanceM < LOCATION_ALERT.PREPARE_UNDER_M) {
    return 'prepare';
  }
  if (distanceM < LOCATION_ALERT.AWARE_UNDER_M) {
    return 'aware';
  }
  return null;
}

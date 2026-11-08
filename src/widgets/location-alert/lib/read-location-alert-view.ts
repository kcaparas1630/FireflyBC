// Decides what the location alert shows from the location status, the position and the fire feed (§12).
import { type FireFeedSnapshot, findNearestActiveFire, type NearestFire } from '@/entities/fire';
import type { UserLocationStatus, UserPosition } from '@/entities/user-location';

import { getProximityTier, type ProximityTier } from './get-proximity-tier';

export type ReadLocationAlertViewInput = {
  status: UserLocationStatus;
  position: UserPosition | null;
  feed: FireFeedSnapshot | undefined;
  isFeedError: boolean;
};

export type LocationAlertView =
  | { kind: 'none' }
  | { kind: 'message'; text: string; isClosable: boolean }
  | { kind: 'alert'; tier: ProximityTier; nearest: NearestFire; fetchedAtMs: number };

const NONE: LocationAlertView = { kind: 'none' };
const LOCATING_TEXT = 'Finding your location…';
const DENIED_TEXT =
  'Location alerts need your location. Allow location for this site in your browser settings, then turn them on again.';
const UNAVAILABLE_TEXT =
  "Your location isn't available in this browser, so location alerts are off.";
const FEED_LOADING_TEXT = 'Checking for fires near you…';
const FEED_FAILED_TEXT = "Location alerts can't check fires right now: fire data is unavailable.";

// Returns a status message, nothing, or the alert for the nearest active fire within the outer limit.
export function readLocationAlertView({
  status,
  position,
  feed,
  isFeedError,
}: ReadLocationAlertViewInput): LocationAlertView {
  if (status === 'off') {
    return NONE;
  }
  if (status === 'denied') {
    return { kind: 'message', text: DENIED_TEXT, isClosable: true };
  }
  if (status === 'unavailable') {
    return { kind: 'message', text: UNAVAILABLE_TEXT, isClosable: true };
  }
  if (status === 'locating' || position === null) {
    return { kind: 'message', text: LOCATING_TEXT, isClosable: false };
  }
  if (feed === undefined) {
    const text = isFeedError ? FEED_FAILED_TEXT : FEED_LOADING_TEXT;
    return { kind: 'message', text, isClosable: false };
  }
  const nearest = findNearestActiveFire(feed.fires, position.lng, position.lat);
  const tier = nearest === null ? null : getProximityTier(nearest.distanceM);
  if (nearest === null || tier === null) {
    return NONE;
  }
  return { kind: 'alert', tier, nearest, fetchedAtMs: feed.fetchedAtMs };
}

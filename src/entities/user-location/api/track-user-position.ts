// Adapter over navigator.geolocation.watchPosition: validated positions in, a stop function out (ADR 027, §12).
import { LOCATION_ALERT } from '@/shared/config';
import { reportError } from '@/shared/lib/report-error';

import { type UserPosition, userPositionSchema } from '../model/user-position.schema';

export type UserPositionFailure = 'denied' | 'unavailable';

export type UserPositionHandlers = {
  onPosition: (position: UserPosition) => void;
  onFailure: (failure: UserPositionFailure) => void;
};

const PERMISSION_DENIED_CODE = 1;

// Returns the browser's Geolocation API, or undefined where the browser has none.
function readDeviceGeolocation(): Geolocation | undefined {
  return typeof navigator === 'object' && 'geolocation' in navigator
    ? navigator.geolocation
    : undefined;
}

// Watches the device position and returns a function that stops the watch; positions are never logged.
export function trackUserPosition(
  handlers: UserPositionHandlers,
  geolocation: Geolocation | undefined = readDeviceGeolocation(),
): () => void {
  if (geolocation === undefined) {
    handlers.onFailure('unavailable');
    return () => undefined;
  }
  const watchId = geolocation.watchPosition(
    (position) => {
      const { longitude, latitude } = position.coords;
      const parsed = userPositionSchema.safeParse({ lng: longitude, lat: latitude });
      if (!parsed.success) {
        reportError(
          'the browser returned an invalid position; it was ignored',
          'location alerts',
          'warn',
        );
        return;
      }
      handlers.onPosition(parsed.data);
    },
    (error) => {
      handlers.onFailure(error.code === PERMISSION_DENIED_CODE ? 'denied' : 'unavailable');
    },
    { enableHighAccuracy: false, maximumAge: LOCATION_ALERT.POSITION_MAX_AGE_MS },
  );
  return () => {
    geolocation.clearWatch(watchId);
  };
}

// Watches the device position while location alerts are on and feeds it to the store (ADR 027, behaviour §12.1).
import { useEffect } from 'react';

import {
  locationAccessDenied,
  selectUserLocationStatus,
  trackUserPosition,
  userPositionChanged,
  userPositionFailed,
} from '@/entities/user-location';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux';

// Starts the watch when alerts turn on and stops it when they turn off or the page unmounts; mount it once.
export function useUserLocationTracking(): void {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectUserLocationStatus);
  const isTracking = status === 'locating' || status === 'on';
  useEffect(() => {
    if (!isTracking) {
      return undefined;
    }
    return trackUserPosition({
      onPosition: (position) => {
        dispatch(userPositionChanged(position));
      },
      onFailure: (failure) => {
        dispatch(failure === 'denied' ? locationAccessDenied() : userPositionFailed());
      },
    });
  }, [dispatch, isTracking]);
}

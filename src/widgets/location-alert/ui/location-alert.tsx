// The location alert banner: reads the user's position and the fire feed, recomputed on every change of either (§12).
import { useMemo } from 'react';

import { useFireFeedQuery } from '@/entities/fire';
import {
  locationAlertsStopped,
  selectUserLocationStatus,
  selectUserPosition,
} from '@/entities/user-location';
import { selectFire } from '@/features/select-fire';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux';

import { readLocationAlertView } from '../lib/read-location-alert-view';
import { LocationAlertMessage } from './location-alert-message';
import { ProximityAlertCard } from './proximity-alert-card';

export type LocationAlertProps = { isCompact?: boolean };

// Renders the tier card, a status message, or nothing when alerts are off or no active fire is near.
export function LocationAlert({ isCompact = false }: LocationAlertProps) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectUserLocationStatus);
  const position = useAppSelector(selectUserPosition);
  const { data: feed, isError: isFeedError } = useFireFeedQuery();
  const view = useMemo(
    () => readLocationAlertView({ status, position, feed, isFeedError }),
    [status, position, feed, isFeedError],
  );
  if (view.kind === 'none') {
    return null;
  }
  if (view.kind === 'message') {
    const handleClose = view.isClosable
      ? () => {
          dispatch(locationAlertsStopped());
        }
      : null;
    return <LocationAlertMessage text={view.text} onClose={handleClose} />;
  }
  const { fire, distanceM } = view.nearest;
  return (
    <ProximityAlertCard
      tier={view.tier}
      fireName={fire.incidentName}
      distanceM={distanceM}
      fetchedAtMs={view.fetchedAtMs}
      isCompact={isCompact}
      onShowFire={() => {
        dispatch(selectFire(fire.fireNumber));
      }}
    />
  );
}

// Toggle for location alerts: the first press asks for the user's location, the next stops and forgets it (§12.1).
import { LocateFixed } from 'lucide-react';

import {
  locationAlertsRequested,
  locationAlertsStopped,
  selectUserLocationStatus,
} from '@/entities/user-location';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux';
import { Button } from '@/shared/ui';

export type LocationAlertsButtonProps = { isCompact?: boolean };

// Renders a pressed-state toggle; icon only when compact, with the same accessible name either way.
export function LocationAlertsButton({ isCompact = false }: LocationAlertsButtonProps) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectUserLocationStatus);
  const isOn = status === 'locating' || status === 'on';
  return (
    <Button
      size={isCompact ? 'icon' : 'small'}
      variant={isOn ? 'primary' : 'outline'}
      aria-pressed={isOn}
      aria-label={isCompact ? 'Location alerts' : undefined}
      title={isOn ? 'Turn off location alerts' : 'Turn on location alerts'}
      onClick={() => {
        dispatch(isOn ? locationAlertsStopped() : locationAlertsRequested());
      }}
    >
      <LocateFixed aria-hidden="true" className="size-4" />
      {isCompact ? null : 'Location alerts'}
    </Button>
  );
}

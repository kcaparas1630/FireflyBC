// Body of the location alert: nearest fire and distance and the tier's action, then links and the note (§12.4).
import { ExternalLink } from 'lucide-react';

import { LOCATION_ALERT } from '@/shared/config';
import { Button } from '@/shared/ui';

import { PROXIMITY_TIERS } from '../config/proximity-tiers';
import type { ProximityTier } from '../lib/get-proximity-tier';
import { LocationAlertSourceNote } from './location-alert-source-note';

export type ProximityAlertDetailsProps = {
  tier: ProximityTier;
  fireName: string;
  distanceKm: string;
  fetchedAtMs: number;
  isFull: boolean;
  onShowFire: () => void;
};

const LINK_CLASS_NAME =
  'inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-medium text-primary underline-offset-2 hover:underline';

// Renders the fire line and action always; when full, also Show fire, the links (new tab, no opener) and the note.
export function ProximityAlertDetails({
  tier,
  fireName,
  distanceKm,
  fetchedAtMs,
  isFull,
  onShowFire,
}: ProximityAlertDetailsProps) {
  return (
    <>
      <p>
        Nearest active fire: <span className="font-semibold">{fireName}</span>, {distanceKm} km from
        you
      </p>
      <p className="font-medium">{PROXIMITY_TIERS[tier].action}</p>
      {isFull ? (
        <>
          <div className="flex flex-wrap items-center gap-x-1">
            <Button size="small" variant="secondary" onClick={onShowFire}>
              Show fire
            </Button>
            <a
              href={LOCATION_ALERT.EVACUATION_INFO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS_NAME}
            >
              Evacuation orders and alerts <ExternalLink aria-hidden="true" className="size-3" />
            </a>
            <a
              href={LOCATION_ALERT.BCWS_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS_NAME}
            >
              BC Wildfire Service map <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          </div>
          <LocationAlertSourceNote fetchedAtMs={fetchedAtMs} />
        </>
      ) : (
        <p className="text-[11px] leading-snug text-muted-foreground">
          Early warning only. Not an evacuation order.
        </p>
      )}
    </>
  );
}

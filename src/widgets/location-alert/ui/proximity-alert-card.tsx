// The location alert card: tier, nearest active fire and distance, what to do, official links, source note (§12.4).
import { useState } from 'react';

import { Card, cn } from '@/shared/ui';

import { PROXIMITY_TIERS } from '../config/proximity-tiers';
import type { ProximityTier } from '../lib/get-proximity-tier';
import { ProximityAlertDetails } from './proximity-alert-details';
import { ProximityAlertHeader } from './proximity-alert-header';

export type ProximityAlertCardProps = {
  tier: ProximityTier;
  fireName: string;
  distanceM: number;
  fetchedAtMs: number;
  isCompact?: boolean;
  onShowFire: () => void;
};

// Renders the alert; on phones the links and full note sit behind a details button so the controls stay visible.
export function ProximityAlertCard({
  tier,
  fireName,
  distanceM,
  fetchedAtMs,
  isCompact = false,
  onShowFire,
}: ProximityAlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isUrgent = tier === 'ready-to-leave';
  return (
    <Card
      role={isUrgent ? 'alert' : 'status'}
      aria-live={isUrgent ? 'assertive' : 'polite'}
      aria-label="Location alert"
      className={cn(
        'flex w-full flex-col gap-1.5 border-2',
        PROXIMITY_TIERS[tier].borderClassName,
        isCompact ? 'max-w-sm py-1 pr-1 pb-2 pl-2 text-xs' : 'max-w-md p-3 text-sm',
      )}
    >
      <ProximityAlertHeader
        tier={tier}
        isExpandable={isCompact}
        isExpanded={isExpanded}
        onExpandToggle={() => {
          setIsExpanded(!isExpanded);
        }}
      />
      <ProximityAlertDetails
        tier={tier}
        fireName={fireName}
        distanceKm={(distanceM / 1000).toFixed(1)}
        fetchedAtMs={fetchedAtMs}
        isFull={!isCompact || isExpanded}
        onShowFire={onShowFire}
      />
    </Card>
  );
}

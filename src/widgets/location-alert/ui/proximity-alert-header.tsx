// First line of the location alert: the tier with its icon, and on phones a button that shows or hides the details.
import { ChevronDown, ChevronUp, Info, Siren, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button, cn } from '@/shared/ui';

import { PROXIMITY_TIERS } from '../config/proximity-tiers';
import type { ProximityTier } from '../lib/get-proximity-tier';

export type ProximityAlertHeaderProps = {
  tier: ProximityTier;
  isExpandable: boolean;
  isExpanded: boolean;
  onExpandToggle: () => void;
};

const ICON_CLASS_NAME = 'size-4 shrink-0';

const TIER_ICONS: Record<ProximityTier, ReactNode> = {
  'ready-to-leave': <Siren aria-hidden="true" className={ICON_CLASS_NAME} />,
  prepare: <TriangleAlert aria-hidden="true" className={ICON_CLASS_NAME} />,
  aware: <Info aria-hidden="true" className={ICON_CLASS_NAME} />,
};

// Renders the tier name in its colour, and the details button when the card is expandable.
export function ProximityAlertHeader({
  tier,
  isExpandable,
  isExpanded,
  onExpandToggle,
}: ProximityAlertHeaderProps) {
  const { title, titleClassName } = PROXIMITY_TIERS[tier];
  return (
    <div className="flex items-center gap-2">
      <p
        className={cn(
          'flex min-w-0 flex-1 items-center gap-1.5 font-semibold tracking-wide uppercase',
          titleClassName,
        )}
      >
        {TIER_ICONS[tier]}
        {title}
      </p>
      {isExpandable ? (
        <Button
          size="icon"
          variant="ghost"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Hide alert details' : 'Show alert details'}
          onClick={onExpandToggle}
        >
          {isExpanded ? (
            <ChevronUp aria-hidden="true" className="size-4" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-4" />
          )}
        </Button>
      ) : null}
    </div>
  );
}

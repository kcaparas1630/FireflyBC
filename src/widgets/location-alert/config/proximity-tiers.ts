// Name, action and colours of each location alert tier (ADR 027, behaviour §12.4).
import type { ProximityTier } from '../lib/get-proximity-tier';

type ProximityTierCopy = {
  title: string;
  action: string;
  borderClassName: string;
  titleClassName: string;
};

export const PROXIMITY_TIERS: Record<ProximityTier, ProximityTierCopy> = {
  'ready-to-leave': {
    title: 'Ready to leave',
    action: 'Check evacuation orders now and be ready to go.',
    borderClassName: 'border-destructive',
    titleClassName: 'text-destructive',
  },
  prepare: {
    title: 'Prepare',
    action: 'Pack a go-bag, check official alerts and keep watching.',
    borderClassName: 'border-warning',
    titleClassName: 'text-warning',
  },
  aware: {
    title: 'Aware',
    action: 'Nothing to do, just monitoring.',
    borderClassName: 'border-panel-border',
    titleClassName: 'text-foreground',
  },
};

// Public API of the fire entity: the BCWS feed, normalised fires, the Out filter, selection, proximity and status.
export { fireApi, useGetFirePerimetersQuery } from './api/fire.api';
export type { FireFeedQueryArgs } from './api/fire.api';
export { useFireFeedQuery } from './api/use-fire-feed-query';
export type { FireFeedQueryOptions } from './api/use-fire-feed-query';
export { FIRE_STATUS_PALETTE } from './config/fire-status-palette';
export { FIRE_STATUS_SWATCH_CLASSES } from './config/fire-status-swatch-classes';
export { loadFireModel } from './api/load-fire-model';
export type { FireModelGeometry } from './api/load-fire-model';
export { FIRE_MODEL } from './config/fire-model';
export { computeFlameFlicker } from './lib/compute-flame-flicker';
export type { FlameFlicker } from './lib/compute-flame-flicker';
export { computeFlameHeight } from './lib/compute-flame-height';
export { findNearbyFires } from './lib/find-nearby-fires';
export { findNearestActiveFire } from './lib/find-nearest-active-fire';
export { formatFireSize } from './lib/format-fire-size';
export { sortFiresByDistance } from './lib/sort-fires-by-distance';
export {
  fireFilterSlice,
  outFiresVisibilityChanged,
  selectIsOutIncluded,
} from './model/fire-filter.slice';
export type { FireFilterState } from './model/fire-filter.slice';
export type {
  Fire,
  FireFeedSnapshot,
  FirePerimeter,
  FireStatus,
  NearbyFires,
  NearestFire,
  RankedFire,
} from './model/fire.types';
export {
  fireDeselected,
  fireSelected,
  selectedFireSlice,
  selectSelectedFireNumber,
} from './model/selected-fire.slice';
export type { SelectedFireState } from './model/selected-fire.slice';
export { FireStatusBadge } from './ui/fire-status-badge';
export type { FireStatusBadgeProps } from './ui/fire-status-badge';

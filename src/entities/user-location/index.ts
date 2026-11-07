// Public API of the user-location entity: the user's session-only position and its browser adapter (ADR 027).
export { trackUserPosition } from './api/track-user-position';
export type { UserPositionFailure, UserPositionHandlers } from './api/track-user-position';
export {
  locationAccessDenied,
  locationAlertsRequested,
  locationAlertsStopped,
  selectUserLocationStatus,
  selectUserPosition,
  userLocationSlice,
  userPositionChanged,
  userPositionFailed,
} from './model/user-location.slice';
export type { UserLocationState, UserLocationStatus } from './model/user-location.slice';
export type { UserPosition } from './model/user-position.schema';

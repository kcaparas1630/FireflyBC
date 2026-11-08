// Tests the location alert states: asking, positions, failures, denial and turning off.
import { describe, expect, it } from 'vitest';

import {
  locationAccessDenied,
  locationAlertsRequested,
  locationAlertsStopped,
  selectUserLocationStatus,
  selectUserPosition,
  userLocationSlice,
  userPositionChanged,
  userPositionFailed,
} from './user-location.slice';

const { reducer } = userLocationSlice;
const KELOWNA = { lng: -119.4966, lat: 49.888 };
const PEACHLAND = { lng: -119.7363, lat: 49.7742 };

describe('userLocationSlice', () => {
  it('starts off with no position', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(selectUserLocationStatus({ userLocation: state })).toBe('off');
    expect(selectUserPosition({ userLocation: state })).toBeNull();
  });

  it('locates when asked, then follows each new position', () => {
    const locating = reducer(undefined, locationAlertsRequested());
    expect(locating.status).toBe('locating');
    const first = reducer(locating, userPositionChanged(KELOWNA));
    expect(first).toEqual({ status: 'on', position: KELOWNA });
    const moved = reducer(first, userPositionChanged(PEACHLAND));
    expect(moved.position).toEqual(PEACHLAND);
  });

  it('ignores positions that arrive while alerts are off', () => {
    const state = reducer(undefined, userPositionChanged(KELOWNA));
    expect(state).toEqual({ status: 'off', position: null });
  });

  it('is unavailable when the first fix fails, but keeps the last position after a fix', () => {
    const failedFirst = reducer(
      reducer(undefined, locationAlertsRequested()),
      userPositionFailed(),
    );
    expect(failedFirst.status).toBe('unavailable');
    const tracking = reducer(
      reducer(undefined, locationAlertsRequested()),
      userPositionChanged(KELOWNA),
    );
    expect(reducer(tracking, userPositionFailed())).toEqual({ status: 'on', position: KELOWNA });
  });

  it('forgets the position when access is denied or alerts are turned off', () => {
    const tracking = reducer(
      reducer(undefined, locationAlertsRequested()),
      userPositionChanged(KELOWNA),
    );
    expect(reducer(tracking, locationAccessDenied())).toEqual({ status: 'denied', position: null });
    expect(reducer(tracking, locationAlertsStopped())).toEqual({ status: 'off', position: null });
  });

  it('keeps a denial when no request is running, and asks again from denied or unavailable', () => {
    const denied = reducer(reducer(undefined, locationAlertsRequested()), locationAccessDenied());
    expect(reducer(denied, locationAccessDenied()).status).toBe('denied');
    expect(reducer(denied, locationAlertsRequested()).status).toBe('locating');
    const tracking = reducer(
      reducer(undefined, locationAlertsRequested()),
      userPositionChanged(KELOWNA),
    );
    expect(reducer(tracking, locationAlertsRequested())).toEqual(tracking);
  });
});

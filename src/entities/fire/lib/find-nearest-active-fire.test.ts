// Tests picking the nearest fire that is not Out for location alerts.
import { describe, expect, it } from 'vitest';

import type { Fire, FireStatus } from '../model/fire.types';
import { findNearestActiveFire } from './find-nearest-active-fire';

// Builds a minimal fire with a status at a point.
function buildFire(fireNumber: string, status: FireStatus, lng: number, lat: number): Fire {
  return {
    fireNumber,
    incidentName: fireNumber,
    status,
    rawStatus: status,
    isFireOfNote: false,
    sizeHa: 10,
    ignitionDateMs: null,
    location: null,
    cause: null,
    incidentUrl: null,
    lng,
    lat,
  };
}

describe('findNearestActiveFire', () => {
  it('returns the nearest fire with its haversine distance', () => {
    const fires = [
      buildFire('FAR', 'Being Held', -119.68, 49.8),
      buildFire('NEAR', 'Out of Control', -119.68, 49.65),
    ];
    const nearest = findNearestActiveFire(fires, -119.68, 49.6);
    expect(nearest?.fire.fireNumber).toBe('NEAR');
    expect((nearest?.distanceM ?? 0) / 1000).toBeCloseTo(5.56, 1);
  });

  it('skips fires that are Out, even when one is closest', () => {
    const fires = [
      buildFire('OUT', 'Out', -119.68, 49.61),
      buildFire('HELD', 'Being Held', -119.68, 49.8),
    ];
    expect(findNearestActiveFire(fires, -119.68, 49.6)?.fire.fireNumber).toBe('HELD');
  });

  it('counts fires with an unknown status as active', () => {
    const fires = [buildFire('ODD', 'Unknown', -119.68, 49.7)];
    expect(findNearestActiveFire(fires, -119.68, 49.6)?.fire.fireNumber).toBe('ODD');
  });

  it('returns null when there are no fires or only fires that are Out', () => {
    expect(findNearestActiveFire([], -119.68, 49.6)).toBeNull();
    expect(findNearestActiveFire([buildFire('OUT', 'Out', -119.68, 49.61)], -119.68, 49.6)).toBe(
      null,
    );
  });
});

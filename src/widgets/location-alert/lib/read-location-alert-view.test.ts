// Tests what the location alert shows for each location status, feed state and distance.
import { describe, expect, it } from 'vitest';

import type { Fire, FireFeedSnapshot, FireStatus } from '@/entities/fire';

import { readLocationAlertView } from './read-location-alert-view';

const KELOWNA = { lng: -119.4966, lat: 49.888 };
const KM_PER_DEGREE_LAT = 111.195;

// Builds a fire due north of Kelowna at the given distance in kilometres.
function buildFireNorthOfKelowna(name: string, distanceKm: number, status: FireStatus): Fire {
  return {
    fireNumber: name,
    incidentName: name,
    status,
    rawStatus: status,
    isFireOfNote: false,
    sizeHa: 100,
    ignitionDateMs: null,
    location: null,
    cause: null,
    incidentUrl: null,
    lng: KELOWNA.lng,
    lat: KELOWNA.lat + distanceKm / KM_PER_DEGREE_LAT,
  };
}

// Wraps fires in a feed snapshot fetched at a fixed time.
function buildFeed(fires: Fire[]): FireFeedSnapshot {
  return { fires, fetchedAtMs: 1_000, droppedCount: 0, duplicateCount: 0, isTruncated: false };
}

// Returns the view for a user in Kelowna with alerts on and the given fires.
function readViewWithFires(fires: Fire[]) {
  return readLocationAlertView({
    status: 'on',
    position: KELOWNA,
    feed: buildFeed(fires),
    isFeedError: false,
  });
}

describe('readLocationAlertView', () => {
  it('shows nothing while alerts are off', () => {
    const view = readLocationAlertView({
      status: 'off',
      position: null,
      feed: buildFeed([buildFireNorthOfKelowna('Near', 1, 'New')]),
      isFeedError: false,
    });
    expect(view).toEqual({ kind: 'none' });
  });

  it('explains a denial and a missing location with a closable message and no alert', () => {
    const feed = buildFeed([buildFireNorthOfKelowna('Near', 1, 'New')]);
    const denied = readLocationAlertView({
      status: 'denied',
      position: null,
      feed,
      isFeedError: false,
    });
    expect(denied).toEqual({
      kind: 'message',
      text: expect.stringMatching(/need your location/) as unknown,
      isClosable: true,
    });
    const unavailable = readLocationAlertView({
      status: 'unavailable',
      position: null,
      feed,
      isFeedError: false,
    });
    expect(unavailable).toEqual({
      kind: 'message',
      text: expect.stringMatching(/isn't available/) as unknown,
      isClosable: true,
    });
  });

  it('says it is finding the location before the first position', () => {
    const view = readLocationAlertView({
      status: 'locating',
      position: null,
      feed: undefined,
      isFeedError: false,
    });
    expect(view).toEqual({ kind: 'message', text: 'Finding your location…', isClosable: false });
  });

  it('says whether the fire feed is still loading or has failed with no data', () => {
    const loading = readLocationAlertView({
      status: 'on',
      position: KELOWNA,
      feed: undefined,
      isFeedError: false,
    });
    expect(loading).toEqual({
      kind: 'message',
      text: 'Checking for fires near you…',
      isClosable: false,
    });
    const failed = readLocationAlertView({
      status: 'on',
      position: KELOWNA,
      feed: undefined,
      isFeedError: true,
    });
    expect(failed).toEqual({
      kind: 'message',
      text: expect.stringMatching(/fire data is unavailable/) as unknown,
      isClosable: false,
    });
  });

  it('alerts with the nearest active fire, its distance, tier and fetch time', () => {
    const view = readViewWithFires([
      buildFireNorthOfKelowna('Far', 40, 'Being Held'),
      buildFireNorthOfKelowna('Near', 8, 'Out of Control'),
    ]);
    expect(view).toMatchObject({
      kind: 'alert',
      tier: 'ready-to-leave',
      nearest: { fire: { incidentName: 'Near' }, distanceM: expect.closeTo(8_000, -2) as unknown },
      fetchedAtMs: 1_000,
    });
  });

  it('changes from Aware to Prepare when the nearest fire goes from 32 km to 28 km', () => {
    expect(readViewWithFires([buildFireNorthOfKelowna('Ridge', 32, 'New')])).toMatchObject({
      kind: 'alert',
      tier: 'aware',
    });
    expect(readViewWithFires([buildFireNorthOfKelowna('Ridge', 28, 'New')])).toMatchObject({
      kind: 'alert',
      tier: 'prepare',
    });
  });

  it('ignores fires that are Out and shows nothing when no active fire is within 50 km', () => {
    const view = readViewWithFires([
      buildFireNorthOfKelowna('Out nearby', 2, 'Out'),
      buildFireNorthOfKelowna('Distant', 60, 'Being Held'),
    ]);
    expect(view).toEqual({ kind: 'none' });
    expect(readViewWithFires([])).toEqual({ kind: 'none' });
  });
});

// Tests the geolocation adapter with a fake Geolocation API: validation, failures, stopping and privacy.
import { afterEach, describe, expect, it, vi } from 'vitest';

import { trackUserPosition } from './track-user-position';

type WatchCallbacks = { onSuccess: PositionCallback; onError: PositionErrorCallback | null };

// Returns a fake Geolocation API that records its watch and lets the test push positions and errors.
function createFakeGeolocation() {
  const watches: WatchCallbacks[] = [];
  const geolocation = {
    watchPosition: vi.fn((onSuccess: PositionCallback, onError?: PositionErrorCallback | null) => {
      watches.push({ onSuccess, onError: onError ?? null });
      return 7;
    }),
    clearWatch: vi.fn(),
    getCurrentPosition: vi.fn(),
  };
  const emitPosition = (longitude: number, latitude: number) => {
    watches[0]?.onSuccess({ coords: { longitude, latitude } } as GeolocationPosition);
  };
  const emitError = (code: number) => {
    watches[0]?.onError?.({ code } as GeolocationPositionError);
  };
  return {
    geolocation: geolocation as unknown as Geolocation,
    fake: geolocation,
    emitPosition,
    emitError,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('trackUserPosition', () => {
  it('watches with low accuracy and positions up to a minute old, and forwards valid positions', () => {
    const { geolocation, fake, emitPosition } = createFakeGeolocation();
    const onPosition = vi.fn();
    trackUserPosition({ onPosition, onFailure: vi.fn() }, geolocation);
    expect(fake.watchPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
      enableHighAccuracy: false,
      maximumAge: 60_000,
    });
    emitPosition(-119.4966, 49.888);
    expect(onPosition).toHaveBeenCalledWith({ lng: -119.4966, lat: 49.888 });
  });

  it('ignores an invalid position with a warning that contains no coordinates', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { geolocation, emitPosition } = createFakeGeolocation();
    const onPosition = vi.fn();
    trackUserPosition({ onPosition, onFailure: vi.fn() }, geolocation);
    emitPosition(-119.4966, 123.456);
    expect(onPosition).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).not.toMatch(/119|123/);
  });

  it('reports a permission denial as denied and every other error as unavailable', () => {
    const { geolocation, emitError } = createFakeGeolocation();
    const onFailure = vi.fn();
    trackUserPosition({ onPosition: vi.fn(), onFailure }, geolocation);
    emitError(1);
    emitError(2);
    emitError(3);
    expect(onFailure.mock.calls).toEqual([['denied'], ['unavailable'], ['unavailable']]);
  });

  it('reports a missing Geolocation API as unavailable without throwing', () => {
    const onFailure = vi.fn();
    const stop = trackUserPosition({ onPosition: vi.fn(), onFailure }, undefined);
    expect(onFailure).toHaveBeenCalledWith('unavailable');
    expect(() => {
      stop();
    }).not.toThrow();
  });

  it('clears its own watch when stopped', () => {
    const { geolocation, fake } = createFakeGeolocation();
    const stop = trackUserPosition({ onPosition: vi.fn(), onFailure: vi.fn() }, geolocation);
    stop();
    expect(fake.clearWatch).toHaveBeenCalledWith(7);
  });

  it('reads navigator.geolocation when no API is passed', () => {
    const { geolocation, fake } = createFakeGeolocation();
    vi.stubGlobal('navigator', { geolocation });
    trackUserPosition({ onPosition: vi.fn(), onFailure: vi.fn() });
    expect(fake.watchPosition).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });
});

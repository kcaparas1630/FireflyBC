// Tests that the tracking hook watches only while alerts are on and feeds positions and failures to the store.
import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  locationAlertsRequested,
  locationAlertsStopped,
  userLocationSlice,
} from '@/entities/user-location';

import { useUserLocationTracking } from './use-user-location-tracking';

type Watch = { onSuccess: PositionCallback; onError: PositionErrorCallback | null };

// Installs a fake navigator.geolocation and returns controls to push positions and errors into it.
function createFakeGeolocation() {
  const watches: Watch[] = [];
  const geolocation = {
    watchPosition: vi.fn((onSuccess: PositionCallback, onError?: PositionErrorCallback | null) => {
      watches.push({ onSuccess, onError: onError ?? null });
      return watches.length;
    }),
    clearWatch: vi.fn(),
  };
  vi.stubGlobal('navigator', { geolocation });
  return {
    geolocation,
    emitPosition: (longitude: number, latitude: number) => {
      watches.at(-1)?.onSuccess({ coords: { longitude, latitude } } as GeolocationPosition);
    },
    emitError: (code: number) => {
      watches.at(-1)?.onError?.({ code } as GeolocationPositionError);
    },
  };
}

// Renders the hook inside a store that holds only the user-location slice.
function renderTracking() {
  const store = configureStore({ reducer: combineSlices(userLocationSlice) });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const rendered = renderHook(
    () => {
      useUserLocationTracking();
    },
    { wrapper },
  );
  return { store, ...rendered };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useUserLocationTracking', () => {
  it('does not touch geolocation while alerts are off', () => {
    const { geolocation } = createFakeGeolocation();
    renderTracking();
    expect(geolocation.watchPosition).not.toHaveBeenCalled();
  });

  it('starts one watch when alerts are requested and stores each position', () => {
    const { geolocation, emitPosition } = createFakeGeolocation();
    const { store } = renderTracking();
    act(() => {
      store.dispatch(locationAlertsRequested());
    });
    act(() => {
      emitPosition(-119.4966, 49.888);
    });
    act(() => {
      emitPosition(-119.7363, 49.7742);
    });
    expect(geolocation.watchPosition).toHaveBeenCalledOnce();
    expect(store.getState().userLocation).toEqual({
      status: 'on',
      position: { lng: -119.7363, lat: 49.7742 },
    });
  });

  it('stores a denial and stops the watch', () => {
    const { geolocation, emitError } = createFakeGeolocation();
    const { store } = renderTracking();
    act(() => {
      store.dispatch(locationAlertsRequested());
    });
    act(() => {
      emitError(1);
    });
    expect(store.getState().userLocation.status).toBe('denied');
    expect(geolocation.clearWatch).toHaveBeenCalledWith(1);
  });

  it('stops the watch and forgets the position when alerts are turned off or the page unmounts', () => {
    const { geolocation, emitPosition } = createFakeGeolocation();
    const { store, unmount } = renderTracking();
    act(() => {
      store.dispatch(locationAlertsRequested());
    });
    act(() => {
      emitPosition(-119.4966, 49.888);
      store.dispatch(locationAlertsStopped());
    });
    expect(geolocation.clearWatch).toHaveBeenCalledWith(1);
    expect(store.getState().userLocation).toEqual({ status: 'off', position: null });
    act(() => {
      store.dispatch(locationAlertsRequested());
    });
    unmount();
    expect(geolocation.clearWatch).toHaveBeenCalledWith(2);
  });

  it('marks location unavailable when the browser has no Geolocation API', () => {
    vi.stubGlobal('navigator', {});
    const { store } = renderTracking();
    act(() => {
      store.dispatch(locationAlertsRequested());
    });
    expect(store.getState().userLocation.status).toBe('unavailable');
  });
});

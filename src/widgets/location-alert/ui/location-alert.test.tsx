// Tests the location alert with a real store: the tier card, moving across a limit, denial, Show fire and the toggle.
import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';

import {
  type Fire,
  fireApi,
  type FireFeedSnapshot,
  fireFilterSlice,
  selectedFireSlice,
} from '@/entities/fire';
import {
  locationAccessDenied,
  locationAlertsRequested,
  userLocationSlice,
  userPositionChanged,
} from '@/entities/user-location';

import { LocationAlert } from './location-alert';
import { LocationAlertsButton } from './location-alerts-button';

const KELOWNA = { lng: -119.4966, lat: 49.888 };
const KM_PER_DEGREE_LAT = 111.195;
const testReducer = combineSlices(userLocationSlice, selectedFireSlice, fireFilterSlice, fireApi);

// Builds an active fire due north of Kelowna at the given distance in kilometres.
function buildFireNorthOfKelowna(distanceKm: number): Fire {
  return {
    fireNumber: 'K52001',
    incidentName: 'Ridge Creek',
    status: 'Out of Control',
    rawStatus: 'Out of Control',
    isFireOfNote: false,
    sizeHa: 1200,
    ignitionDateMs: null,
    location: null,
    cause: null,
    incidentUrl: null,
    lng: KELOWNA.lng,
    lat: KELOWNA.lat + distanceKm / KM_PER_DEGREE_LAT,
  };
}

// Builds a store with the fire feed cache filled, as if the 10-minute poll had just answered.
function buildStore(fires: Fire[]) {
  const store = configureStore({
    reducer: testReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(fireApi.middleware),
  });
  store.dispatch(writeFeed(fires));
  return store;
}

// Returns the action that replaces the cached feed for the default (Out hidden) filter, synchronously.
function writeFeed(fires: Fire[]) {
  const feed: FireFeedSnapshot = {
    fires,
    fetchedAtMs: Date.UTC(2026, 7, 1, 19, 5),
    droppedCount: 0,
    duplicateCount: 0,
    isTruncated: false,
  };
  return fireApi.util.upsertQueryEntries([
    { endpointName: 'getActiveFires', arg: { isOutIncluded: false }, value: feed },
  ]);
}

// Renders the button and the alert together, as a cockpit does.
function renderAlert(store: ReturnType<typeof buildStore>) {
  return render(
    <Provider store={store}>
      <LocationAlertsButton />
      <LocationAlert />
    </Provider>,
  );
}

describe('LocationAlert', () => {
  it('shows nothing until alerts are turned on, then the tier, fire, distance and action', () => {
    const store = buildStore([buildFireNorthOfKelowna(8)]);
    renderAlert(store);
    expect(screen.queryByRole('alert')).toBeNull();
    act(() => {
      store.dispatch(locationAlertsRequested());
      store.dispatch(userPositionChanged(KELOWNA));
    });
    const alert = screen.getByRole('alert', { name: 'Location alert' });
    expect(alert).toHaveTextContent('Ready to leave');
    expect(alert).toHaveTextContent('Nearest active fire: Ridge Creek, 8.0 km from you');
    expect(alert).toHaveTextContent('Check evacuation orders now and be ready to go.');
    expect(alert).toHaveTextContent(/Not an evacuation order/);
    expect(screen.getByRole('link', { name: /Evacuation orders and alerts/ })).toHaveAttribute(
      'href',
      'https://www.emergencyinfobc.gov.bc.ca/',
    );
    expect(screen.getByRole('link', { name: /BC Wildfire Service map/ })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
  });

  it('changes tier and message when a feed refresh moves the nearest fire from 32 km to 28 km', async () => {
    const store = buildStore([buildFireNorthOfKelowna(32)]);
    renderAlert(store);
    act(() => {
      store.dispatch(locationAlertsRequested());
      store.dispatch(userPositionChanged(KELOWNA));
    });
    expect(screen.getByRole('status', { name: 'Location alert' })).toHaveTextContent(
      'Nothing to do, just monitoring.',
    );
    act(() => {
      store.dispatch(writeFeed([buildFireNorthOfKelowna(28)]));
    });
    // RTK Query notifies subscribers of cache updates on the next animation frame (auto-batching).
    const alert = screen.getByRole('status', { name: 'Location alert' });
    await waitFor(() => {
      expect(alert).toHaveTextContent('Prepare');
    });
    expect(alert).toHaveTextContent('28.0 km from you');
    expect(alert).toHaveTextContent('Pack a go-bag, check official alerts and keep watching.');
  });

  it('follows the user: moving away beyond 50 km removes the alert', () => {
    const store = buildStore([buildFireNorthOfKelowna(20)]);
    renderAlert(store);
    act(() => {
      store.dispatch(locationAlertsRequested());
      store.dispatch(userPositionChanged(KELOWNA));
    });
    expect(screen.getByRole('status', { name: 'Location alert' })).toHaveTextContent('Prepare');
    act(() => {
      store.dispatch(userPositionChanged({ lng: KELOWNA.lng, lat: KELOWNA.lat - 0.5 }));
    });
    expect(screen.queryByRole('status', { name: 'Location alert' })).toBeNull();
  });

  it('explains a denial, shows no alert, and closing the message turns alerts off', async () => {
    const user = userEvent.setup();
    const store = buildStore([buildFireNorthOfKelowna(5)]);
    renderAlert(store);
    act(() => {
      store.dispatch(locationAlertsRequested());
      store.dispatch(locationAccessDenied());
    });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText(/Location alerts need your location/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close location message' }));
    expect(store.getState().userLocation.status).toBe('off');
    expect(screen.queryByText(/Location alerts need your location/)).toBeNull();
  });

  it('selects the fire from Show fire, as clicking it on the map does', async () => {
    const user = userEvent.setup();
    const store = buildStore([buildFireNorthOfKelowna(8)]);
    renderAlert(store);
    act(() => {
      store.dispatch(locationAlertsRequested());
      store.dispatch(userPositionChanged(KELOWNA));
    });
    await user.click(screen.getByRole('button', { name: 'Show fire' }));
    expect(store.getState().selectedFire.fireNumber).toBe('K52001');
  });
});

describe('LocationAlert on phones', () => {
  it('keeps the tier, fire, distance and action visible and puts the links behind Show alert details', async () => {
    const user = userEvent.setup();
    const store = buildStore([buildFireNorthOfKelowna(8)]);
    render(
      <Provider store={store}>
        <LocationAlert isCompact />
      </Provider>,
    );
    act(() => {
      store.dispatch(locationAlertsRequested());
      store.dispatch(userPositionChanged(KELOWNA));
    });
    const alert = screen.getByRole('alert', { name: 'Location alert' });
    expect(alert).toHaveTextContent('Ready to leave');
    expect(alert).toHaveTextContent('Ridge Creek, 8.0 km from you');
    expect(alert).toHaveTextContent('Check evacuation orders now and be ready to go.');
    expect(alert).toHaveTextContent('Early warning only. Not an evacuation order.');
    expect(screen.queryByRole('link', { name: /Evacuation orders and alerts/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Show alert details' }));
    expect(screen.getByRole('link', { name: /Evacuation orders and alerts/ })).toBeVisible();
    expect(alert).toHaveTextContent(/Source: BC Wildfire Service open data/);
  });
});

describe('LocationAlertsButton', () => {
  it('turns alerts on and off and shows its pressed state', async () => {
    const user = userEvent.setup();
    const store = buildStore([]);
    renderAlert(store);
    const button = screen.getByRole('button', { name: 'Location alerts' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(button);
    expect(store.getState().userLocation.status).toBe('locating');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Finding your location…')).toBeInTheDocument();
    await user.click(button);
    expect(store.getState().userLocation).toEqual({ status: 'off', position: null });
  });
});

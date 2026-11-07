// Assembles the Redux store from every slice and the fire feed API, restoring persisted prefs (ADR 011).
import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { droneModeSlice, droneSnapshotSlice } from '@/entities/drone';
import { fireApi, fireFilterSlice, selectedFireSlice } from '@/entities/fire';
import { cameraPrefsSlice } from '@/entities/map-camera';
import { recentPlacesSlice, routeSlice } from '@/entities/route';
import { userLocationSlice } from '@/entities/user-location';

import { loadPrefs } from './prefs/load-prefs';

const rootReducer = combineSlices(
  droneModeSlice,
  droneSnapshotSlice,
  routeSlice,
  recentPlacesSlice,
  cameraPrefsSlice,
  selectedFireSlice,
  fireFilterSlice,
  userLocationSlice,
  fireApi,
);

const savedPrefs = loadPrefs();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: {
    recentPlaces: { places: savedPrefs.recents },
    cameraPrefs: { followDistanceM: savedPrefs.followDistanceM },
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(fireApi.middleware),
});

setupListeners(store.dispatch);

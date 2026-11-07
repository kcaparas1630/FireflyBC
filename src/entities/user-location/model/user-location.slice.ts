// The user's own position for location alerts: off until asked, held in memory for the session only (ADR 027).
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { UserPosition } from './user-position.schema';

export type UserLocationStatus = 'off' | 'locating' | 'on' | 'denied' | 'unavailable';

export type UserLocationState = { status: UserLocationStatus; position: UserPosition | null };

const initialState: UserLocationState = { status: 'off', position: null };

// Returns true while the browser is being asked for positions.
function isTracking(status: UserLocationStatus): boolean {
  return status === 'locating' || status === 'on';
}

export const userLocationSlice = createSlice({
  name: 'userLocation',
  initialState,
  reducers: {
    locationAlertsRequested(state) {
      if (!isTracking(state.status)) {
        state.status = 'locating';
        state.position = null;
      }
    },
    userPositionChanged(state, action: PayloadAction<UserPosition>) {
      if (isTracking(state.status)) {
        state.status = 'on';
        state.position = action.payload;
      }
    },
    userPositionFailed(state) {
      if (state.status === 'locating') {
        state.status = 'unavailable';
      }
    },
    locationAccessDenied(state) {
      if (isTracking(state.status)) {
        state.status = 'denied';
        state.position = null;
      }
    },
    locationAlertsStopped(state) {
      state.status = 'off';
      state.position = null;
    },
  },
  selectors: {
    selectUserLocationStatus: (state) => state.status,
    selectUserPosition: (state) => state.position,
  },
});

export const {
  locationAlertsRequested,
  userPositionChanged,
  userPositionFailed,
  locationAccessDenied,
  locationAlertsStopped,
} = userLocationSlice.actions;

export const { selectUserLocationStatus, selectUserPosition } = userLocationSlice.selectors;

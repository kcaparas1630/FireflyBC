// Our own wildfire shapes, independent of the ArcGIS field names (ADR 003: only entities/fire/api knows them).

export type FireStatus =
  'Out of Control' | 'Being Held' | 'Under Control' | 'New' | 'Fire of Note' | 'Out' | 'Unknown';

export type Fire = {
  fireNumber: string;
  incidentName: string;
  status: FireStatus;
  rawStatus: string;
  isFireOfNote: boolean;
  sizeHa: number | null;
  ignitionDateMs: number | null;
  location: string | null;
  cause: string | null;
  incidentUrl: string | null;
  lng: number;
  lat: number;
};

export type FireFeedSnapshot = {
  fires: Fire[];
  fetchedAtMs: number;
  droppedCount: number;
  duplicateCount: number;
  isTruncated: boolean;
};

// One mapped burned area: the outer ring of each polygon as [lng, lat] pairs (ADR 023).
export type FirePerimeter = {
  fireNumber: string;
  sizeHa: number | null;
  rings: [number, number][][];
};

export type RankedFire = { fire: Fire; distanceM: number | null; bearingRad: number | null };

export type NearestFire = { fire: Fire; distanceM: number };

export type NearbyFires = { count: number; nearest: NearestFire | null };

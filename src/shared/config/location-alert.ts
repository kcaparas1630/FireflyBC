// Location alert tier limits, geolocation watch options and the official links it points to (ADR 027, §12).

export const LOCATION_ALERT = {
  READY_TO_LEAVE_UNDER_M: 10_000,
  PREPARE_UNDER_M: 30_000,
  AWARE_UNDER_M: 50_000,
  POSITION_MAX_AGE_MS: 60_000,
  EVACUATION_INFO_URL: 'https://www.emergencyinfobc.gov.bc.ca/',
  BCWS_MAP_URL: 'https://wildfiresituation.nrs.gov.bc.ca/map',
} as const;

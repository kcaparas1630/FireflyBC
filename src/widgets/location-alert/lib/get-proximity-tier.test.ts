// Tests the tier limits: under 10 km, under 30 km, under 50 km, and nothing beyond.
import { describe, expect, it } from 'vitest';

import { getProximityTier } from './get-proximity-tier';

describe('getProximityTier', () => {
  it('is Ready to leave under 10 km', () => {
    expect(getProximityTier(0)).toBe('ready-to-leave');
    expect(getProximityTier(9_999)).toBe('ready-to-leave');
  });

  it('is Prepare from exactly 10 km to under 30 km', () => {
    expect(getProximityTier(10_000)).toBe('prepare');
    expect(getProximityTier(28_000)).toBe('prepare');
  });

  it('is Aware from exactly 30 km to under 50 km, so 32 km to 28 km changes the tier', () => {
    expect(getProximityTier(30_000)).toBe('aware');
    expect(getProximityTier(32_000)).toBe('aware');
    expect(getProximityTier(49_999)).toBe('aware');
  });

  it('gives no tier at 50 km and beyond', () => {
    expect(getProximityTier(50_000)).toBeNull();
    expect(getProximityTier(400_000)).toBeNull();
  });
});

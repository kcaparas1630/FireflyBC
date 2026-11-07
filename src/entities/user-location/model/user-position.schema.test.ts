// Tests the boundary check on positions from the browser.
import { describe, expect, it } from 'vitest';

import { userPositionSchema } from './user-position.schema';

describe('userPositionSchema', () => {
  it('accepts a position in Kelowna and the edges of the valid range', () => {
    expect(userPositionSchema.parse({ lng: -119.4966, lat: 49.888 })).toEqual({
      lng: -119.4966,
      lat: 49.888,
    });
    expect(userPositionSchema.safeParse({ lng: -180, lat: 90 }).success).toBe(true);
  });

  it('rejects out-of-range, non-finite and missing values', () => {
    expect(userPositionSchema.safeParse({ lng: -181, lat: 49 }).success).toBe(false);
    expect(userPositionSchema.safeParse({ lng: -119, lat: 91 }).success).toBe(false);
    expect(userPositionSchema.safeParse({ lng: Number.NaN, lat: 49 }).success).toBe(false);
    expect(userPositionSchema.safeParse({ lng: -119, lat: Infinity }).success).toBe(false);
    expect(userPositionSchema.safeParse({ lng: -119 }).success).toBe(false);
  });
});

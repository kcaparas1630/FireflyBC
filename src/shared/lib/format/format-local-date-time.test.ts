// Tests local date-time formatting in a fixed zone.
import { describe, expect, it } from 'vitest';

import { formatLocalDateTime } from './format-local-date-time';

describe('formatLocalDateTime', () => {
  it('formats in the given time zone', () => {
    const formatted = formatLocalDateTime(Date.UTC(2025, 7, 15, 22, 20), 'America/Vancouver');
    expect(formatted).toContain('2025');
    expect(formatted).toContain('15:20');
  });

  it('says when the date is unknown', () => {
    expect(formatLocalDateTime(null)).toBe('Not reported');
  });
});

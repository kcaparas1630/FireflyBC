// Formats an epoch time in the viewer's local time zone, e.g. "Aug 15, 2025, 15:20" (behaviour §7, §12.4).

// Returns the local date and time, or "Not reported" for a missing value.
export function formatLocalDateTime(epochMs: number | null, timeZone?: string): string {
  if (epochMs === null) {
    return 'Not reported';
  }
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hourCycle: 'h23',
    timeZone,
  }).format(epochMs);
}

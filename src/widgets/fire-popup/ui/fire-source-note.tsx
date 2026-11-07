// The disclaimer under every fire's details: informational, BCWS open data, fetch time (behaviour §7).
import { formatLocalDateTime } from '@/shared/lib/format';

export type FireSourceNoteProps = { fetchedAtMs: number };

// Renders the source line with the feed's fetch time in local time.
export function FireSourceNote({ fetchedAtMs }: FireSourceNoteProps) {
  return (
    <p className="text-[11px] leading-snug text-muted-foreground">
      Informational only. Source: BC Wildfire Service open data, fetched{' '}
      {formatLocalDateTime(fetchedAtMs)}. For emergencies follow EmergencyInfoBC.
    </p>
  );
}

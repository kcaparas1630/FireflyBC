// The disclaimer under the location alert, in the fire popup's style: what it measures, not an order, source (§12.4).
import { formatLocalDateTime } from '@/shared/lib/format';

export type LocationAlertSourceNoteProps = { fetchedAtMs: number };

// Renders the note with the feed's fetch time in local time.
export function LocationAlertSourceNote({ fetchedAtMs }: LocationAlertSourceNoteProps) {
  return (
    <p className="text-[11px] leading-snug text-muted-foreground">
      Early warning only: straight-line distance to the fire&apos;s reported location, not its edge.
      Not an evacuation order; orders and alerts come from local authorities and First Nations.
      Source: BC Wildfire Service open data, fetched {formatLocalDateTime(fetchedAtMs)}. For
      emergencies follow EmergencyInfoBC.
    </p>
  );
}

// Fire details card: number, name, status, size, ignition, location, cause, actions and the source disclaimer.
import { ExternalLink, X } from 'lucide-react';

import { type Fire, FireStatusBadge, formatFireSize } from '@/entities/fire';
import { formatLocalDateTime } from '@/shared/lib/format';
import { Button, Card, cn } from '@/shared/ui';

import { FireSourceNote } from './fire-source-note';

export type FireDetailsCardProps = {
  fire: Fire;
  fetchedAtMs: number;
  isAreaMapped: boolean;
  onClose: () => void;
  onFlyHere: () => void;
  isCompact?: boolean;
};

const MAPPED_AREA_TEXT = 'Mapped BCWS perimeter';
const APPROXIMATE_AREA_TEXT = 'Approximate circle of the reported size';

// Returns the label/value rows of the details list, in display order.
function buildDetailRows(fire: Fire, isAreaMapped: boolean): [string, string][] {
  return [
    ['Size', formatFireSize(fire.sizeHa)],
    ['Area on map', isAreaMapped ? MAPPED_AREA_TEXT : APPROXIMATE_AREA_TEXT],
    ['Discovered', formatLocalDateTime(fire.ignitionDateMs)],
    ['Location', fire.location ?? 'Not reported'],
    ['Cause', fire.cause ?? 'Not reported'],
  ];
}

// Renders one fire's details as text only; the BCWS link appears only when it passed the allowlist.
export function FireDetailsCard({
  fire,
  fetchedAtMs,
  isAreaMapped,
  onClose,
  onFlyHere,
  isCompact = false,
}: FireDetailsCardProps) {
  const rows = buildDetailRows(fire, isAreaMapped);
  return (
    <Card
      aria-labelledby="fire-popup-title"
      className={cn(
        'flex w-full flex-col',
        isCompact ? 'min-h-0 shrink gap-2 overflow-y-auto p-3' : 'shrink-0 gap-3 p-4 sm:w-80',
      )}
    >
      <header className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Fire {fire.fireNumber}</p>
          <h2 id="fire-popup-title" className="truncate text-lg font-semibold">
            {fire.incidentName}
          </h2>
          <FireStatusBadge status={fire.status} rawStatus={fire.rawStatus} className="mt-1" />
        </div>
        <Button variant="ghost" size="icon" aria-label="Close fire details" onClick={onClose}>
          <X aria-hidden="true" className="size-4" />
        </Button>
      </header>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 break-words">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button size="small" onClick={onFlyHere}>
          Fly here
        </Button>
        {fire.incidentUrl === null ? null : (
          <a
            href={fire.incidentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            Open on BC Wildfire Service <ExternalLink aria-hidden="true" className="size-3" />
          </a>
        )}
      </div>
      <FireSourceNote fetchedAtMs={fetchedAtMs} />
    </Card>
  );
}

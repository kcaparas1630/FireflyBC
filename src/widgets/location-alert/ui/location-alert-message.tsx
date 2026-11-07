// A short location alert status line: finding the position, access denied, unavailable, or no fire data (§12).
import { LocateFixed, X } from 'lucide-react';

import { Button } from '@/shared/ui';

export type LocationAlertMessageProps = { text: string; onClose: (() => void) | null };

// Renders the message as a panel pill, with a close button when the message can be closed.
export function LocationAlertMessage({ text, onClose }: LocationAlertMessageProps) {
  return (
    <div
      role="status"
      className="flex max-w-md items-center gap-2 rounded-panel border border-panel-border bg-panel py-1 pr-1 pl-3 text-xs text-foreground shadow-lg"
    >
      <LocateFixed aria-hidden="true" className="size-4 shrink-0 text-primary" />
      <p className="min-w-0 flex-1 py-1.5">{text}</p>
      {onClose === null ? null : (
        <Button size="icon" variant="ghost" aria-label="Close location message" onClick={onClose}>
          <X aria-hidden="true" className="size-4" />
        </Button>
      )}
    </div>
  );
}

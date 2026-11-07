// The banner stack under the search: the offline notice and the location alert, each hidden when empty (§4, §12).
import { OfflineBanner } from '@/widgets/hud';
import { LocationAlert } from '@/widgets/location-alert';

export type CockpitBannersProps = { isCompact?: boolean };

// Renders both banners centred; empty it takes no space, and when too tall it scrolls so the controls stay on screen.
export function CockpitBanners({ isCompact = false }: CockpitBannersProps) {
  return (
    <div className="flex min-h-0 flex-col items-center gap-2 overflow-y-auto">
      <div className="pointer-events-auto empty:hidden">
        <OfflineBanner />
      </div>
      <div className="pointer-events-auto flex w-full justify-center empty:hidden">
        <LocationAlert isCompact={isCompact} />
      </div>
    </div>
  );
}
